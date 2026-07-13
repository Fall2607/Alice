const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Next/Alice/.env.local' });
const pool = new Pool({
  host: process.env.DB_HOST || '182.253.37.109',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'hris',
  port: process.env.DB_PORT || 5432
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cuti (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        karyawan_id UUID REFERENCES karyawan(id),
        jenis_cuti VARCHAR(255),
        tanggal_mulai DATE,
        tanggal_selesai DATE,
        tanggal_kembali DATE,
        jumlah_hari INT,
        keterangan TEXT,
        status VARCHAR(50) DEFAULT 'PENDING_ATASAN',
        atasan_id UUID REFERENCES karyawan(id),
        approved_by_atasan_id UUID REFERENCES karyawan(id),
        approved_by_hc_id UUID REFERENCES karyawan(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'cuti' created successfully.");
  } catch (err) {
    console.error("Error creating table 'cuti':", err);
  } finally {
    process.exit(0);
  }
}
run();
