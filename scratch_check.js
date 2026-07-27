const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool(); // automatically uses PGHOST, PGUSER, etc.
async function check() {
  const cutiRes = await pool.query("SELECT * FROM pengajuan_cuti WHERE id = 'd4065032-9614-4e00-a2e8-d5077baf37c7'");
  console.log('Cuti:', cutiRes.rows[0]);
  if(cutiRes.rows.length > 0) {
      const karyawan_id = cutiRes.rows[0].karyawan_id;
      const shiftRes = await pool.query("SELECT * FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal >= '2026-07-25' AND tanggal <= '2026-08-05' ORDER BY tanggal", [karyawan_id]);
      console.log('Shifts:', shiftRes.rows);
  }
  pool.end();
}
check().catch(console.error);
