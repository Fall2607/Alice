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
    // Pastikan extension pgcrypto aktif agar gen_random_uuid() berfungsi di versi PG yang lebih tua jika belum
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tukar_shift_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        karyawan_pengaju_id UUID REFERENCES karyawan(id) ON DELETE CASCADE,
        karyawan_pengganti_id UUID REFERENCES karyawan(id) ON DELETE CASCADE,
        tanggal_pengaju VARCHAR(10) NOT NULL,
        tanggal_pengganti VARCHAR(10) NOT NULL,
        shift_pengaju_id INT REFERENCES shift(id) ON DELETE SET NULL,
        shift_pengganti_id INT REFERENCES shift(id) ON DELETE SET NULL,
        alasan TEXT,
        status VARCHAR(20) DEFAULT 'PENDING',
        token_persetujuan VARCHAR(100),
        token_expires TIMESTAMP WITHOUT TIME ZONE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Berhasil membuat tabel tukar_shift_requests!");
  } catch (error) {
    console.error("Gagal membuat tabel:", error);
  } finally {
    pool.end();
  }
}

main();
