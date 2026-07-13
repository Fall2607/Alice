import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Next/Alice/.env.local' });
const pool = new pg.Pool({
  host: process.env.DB_HOST || '182.253.37.109',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'hris',
  port: Number(process.env.DB_PORT) || 5432
});

async function run() {
  try {
    await pool.query(`ALTER TABLE pengajuan_cuti ADD COLUMN IF NOT EXISTS rejected_by VARCHAR(255);`);
    console.log("Column rejected_by added successfully");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
