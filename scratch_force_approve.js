const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool();

async function run() {
    const cuti_id = 'cc290eda-d06a-4c0a-891d-760766063479';
    const res = await pool.query(`SELECT * FROM pengajuan_cuti WHERE id = $1`, [cuti_id]);
    const cuti = res.rows[0];

    // Force approve
    await pool.query(`UPDATE pengajuan_cuti SET status = 'Disetujui' WHERE id = $1`, [cuti_id]);

    const { karyawan_id, tanggal_mulai, tanggal_selesai, alasan } = cuti;
    
    // Inject shift logic
    let shiftCutiId = null;
    const shiftRes = await pool.query(`SELECT id FROM shift WHERE nama_shift ILIKE 'Cuti' LIMIT 1`);
    shiftCutiId = shiftRes.rows[0].id;

    let dateArray = [];
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
        console.log(`Berhasil force approve dan injeksi jadwal cuti untuk karyawan ${karyawan_id} pada tanggal ${dateArray.join(', ')}`);
      } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Gagal melakukan injeksi shift cuti dalam transaksi:", err);
      }
    }
    
    pool.end();
}

run().catch(console.error);
