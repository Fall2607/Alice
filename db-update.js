const { Pool } = require('pg');
const pool = new Pool({
  host: '182.253.37.109',
  user: 'postgres',
  password: '1234',
  database: 'hris',
  port: 5432
});

async function run() {
  try {
    console.log("Dropping old constraint...");
    await pool.query(`ALTER TABLE karyawan_shift DROP CONSTRAINT IF EXISTS karyawan_shift_karyawan_id_tanggal_key`);
    console.log("Adding new constraint...");
    await pool.query(`ALTER TABLE karyawan_shift ADD CONSTRAINT karyawan_shift_karyawan_id_tanggal_shift_id_key UNIQUE (karyawan_id, tanggal, shift_id)`);
    console.log("DB constraints updated successfully!");
  } catch(e) {
    console.log(e);
  } finally {
    process.exit(0);
  }
}
run();
