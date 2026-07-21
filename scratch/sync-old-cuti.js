const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 5432,
});

async function main() {
  try {
    const shiftRes = await pool.query(`SELECT id FROM shift WHERE nama_shift ILIKE 'Cuti' LIMIT 1`);
    if (shiftRes.rows.length === 0) return;
    const shiftCutiId = shiftRes.rows[0].id;

    const cutiRes = await pool.query(`SELECT * FROM pengajuan_cuti WHERE status = 'Disetujui'`);
    for (const cuti of cutiRes.rows) {
      const startDate = new Date(cuti.tanggal_mulai);
      const endDate = new Date(cuti.tanggal_selesai);
      const dateArray = [];

      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDate.getDate()).padStart(2, '0');
        dateArray.push(`${yyyy}-${mm}-${dd}`);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (dateArray.length > 0) {
        await pool.query('BEGIN');
        try {
          const placeholders = dateArray.map((_, i) => `$${i + 2}`).join(',');
          await pool.query(`DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal IN (${placeholders})`, [cuti.karyawan_id, ...dateArray]);
          
          for (const tgl of dateArray) {
            await pool.query(`
              INSERT INTO karyawan_shift (karyawan_id, shift_id, tanggal, assigned_by)
              VALUES ($1, $2, $3, NULL)
            `, [cuti.karyawan_id, shiftCutiId, tgl]);
          }
          await pool.query('COMMIT');
          console.log(`- Synced cuti ${cuti.id} for dates: ${dateArray.join(', ')}`);
        } catch (err) {
          await pool.query('ROLLBACK');
          console.error(`- Error syncing cuti ${cuti.id}:`, err);
        }
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
main();
