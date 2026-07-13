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
    const res = await pool.query(`
      SELECT k.email, k.nama_lengkap, j.level_jabatan_id, d.nama_departemen, lj.nama_level
      FROM karyawan k
      LEFT JOIN jabatan j ON k.jabatan_id = j.id
      LEFT JOIN departemen d ON j.departemen_id = d.id
      LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      WHERE k.email ILIKE '%frisca%' OR k.nama_lengkap ILIKE '%frisca%'
    `);
    console.log("Frisca data:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
