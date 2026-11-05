// Migrasi: tambah kolom lokasi (latitude/longitude) Check-In & Check-Out pada tabel absensi
// Jalankan: node add-absensi-location.js
const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Next/Alice/.env.local' });

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT) || 5432,
});

async function run() {
  try {
    await pool.query(`
      ALTER TABLE absensi
        ADD COLUMN IF NOT EXISTS lat_masuk DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS lng_masuk DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS lat_keluar DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS lng_keluar DOUBLE PRECISION;
    `);
    console.log("Kolom lat_masuk, lng_masuk, lat_keluar, lng_keluar berhasil ditambahkan ke tabel absensi.");

    const res = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'absensi' AND column_name IN ('lat_masuk','lng_masuk','lat_keluar','lng_keluar')
      ORDER BY column_name
    `);
    console.table(res.rows);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
run();

