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
    const resUsers = await pool.query(`
      SELECT u.id, u.email, r.nama_role 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email ILIKE '%frisca%'
    `);
    console.log("Users table:", resUsers.rows);

    const resKaryawan = await pool.query(`
      SELECT k.id, k.email, k.nama_lengkap, k.user_id 
      FROM karyawan k
      WHERE k.email ILIKE '%frisca%' OR k.nama_lengkap ILIKE '%frisca%'
    `);
    console.log("Karyawan table:", resKaryawan.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
