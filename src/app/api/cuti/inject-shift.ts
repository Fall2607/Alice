import pool from "@/app/lib/db";

export async function injectCutiToShift(cuti_id: string, karyawan_id: string, tanggal_mulai: string | Date, tanggal_selesai: string | Date, approver_id: string, alasan?: string) {
  try {
    // 1. Cari atau buat Master Shift "Cuti"
    let shiftCutiId = null;
    const shiftRes = await pool.query(`SELECT id FROM shift WHERE nama_shift ILIKE 'Cuti' LIMIT 1`);
    
    if (shiftRes.rows.length > 0) {
      shiftCutiId = shiftRes.rows[0].id;
    } else {
      const insertShift = await pool.query(`
        INSERT INTO shift (nama_shift, jam_masuk, jam_keluar, is_cross_day)
        VALUES ('Cuti', NULL, NULL, false)
        RETURNING id
      `);
      shiftCutiId = insertShift.rows[0].id;
    }

    // 2. Generate daftar tanggal (YYYY-MM-DD)
    let dateArray: string[] = [];
    const datesMatch = alasan?.match(/\[DATES:\s*([^\]]+)\]/);
    if (datesMatch) {
       dateArray = datesMatch[1].split(',').map(d => d.trim());
    } else {
       const startDate = new Date(tanggal_mulai);
       const endDate = new Date(tanggal_selesai);
       let currentDate = new Date(startDate);
       while (currentDate <= endDate) {
         const yyyy = currentDate.getFullYear();
         const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
         const dd = String(currentDate.getDate()).padStart(2, '0');
         dateArray.push(`${yyyy}-${mm}-${dd}`);
         currentDate.setDate(currentDate.getDate() + 1);
       }
    }

    // 3. Update database (Hapus jadwal lama, masukkan jadwal cuti)
    if (dateArray.length > 0) {
      await pool.query('BEGIN');
      
      try {
        const placeholders = dateArray.map((_, i) => `$${i + 2}`).join(',');

        // a. Backup old shifts
        const oldShiftsRes = await pool.query(`
          SELECT tanggal, shift_id, assigned_by 
          FROM karyawan_shift 
          WHERE karyawan_id = $1 AND tanggal IN (${placeholders})
        `, [karyawan_id, ...dateArray]);
        
        if (oldShiftsRes.rows.length > 0 && cuti_id) {
            await pool.query(`
                UPDATE pengajuan_cuti 
                SET backup_jadwal = $1 
                WHERE id = $2
            `, [JSON.stringify(oldShiftsRes.rows), cuti_id]);
        }

        // b. Delete old shifts
        await pool.query(`DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal IN (${placeholders})`, [karyawan_id, ...dateArray]);

        // c. Insert 'Cuti' shifts
        for (const tgl of dateArray) {
          await pool.query(`
            INSERT INTO karyawan_shift (karyawan_id, shift_id, tanggal, assigned_by)
            VALUES ($1, $2, $3, NULL)
          `, [karyawan_id, shiftCutiId, tgl]);
        }

        await pool.query('COMMIT');
        console.log(`Berhasil menginjeksi jadwal cuti untuk karyawan ${karyawan_id} pada tanggal ${dateArray.join(', ')}`);
      } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Gagal melakukan injeksi shift cuti dalam transaksi:", err);
      }
    }
  } catch (error) {
    console.error("Error pada helper injectCutiToShift:", error);
  }
}
