import pool from "@/app/lib/db";

export async function injectCutiToShift(karyawan_id: string, tanggal_mulai: string | Date, tanggal_selesai: string | Date, approver_id: string) {
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

    // 2. Generate daftar tanggal (YYYY-MM-DD) dari mulai sampai selesai
    const startDate = new Date(tanggal_mulai);
    const endDate = new Date(tanggal_selesai);
    const dateArray: string[] = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      dateArray.push(`${yyyy}-${mm}-${dd}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 3. Update database (Hapus jadwal lama, masukkan jadwal cuti)
    if (dateArray.length > 0) {
      // Mulai transaksi (opsional, tapi disarankan)
      await pool.query('BEGIN');
      
      try {
        // Hapus jadwal yang bentrok
        const placeholders = dateArray.map((_, i) => `$${i + 2}`).join(',');
        await pool.query(`DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal IN (${placeholders})`, [karyawan_id, ...dateArray]);

        // Masukkan jadwal cuti
        for (const tgl of dateArray) {
          await pool.query(`
            INSERT INTO karyawan_shift (karyawan_id, shift_id, tanggal, assigned_by)
            VALUES ($1, $2, $3, $4)
          `, [karyawan_id, shiftCutiId, tgl, approver_id]);
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
