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
    const fromUsers = await pool.query(`
      SELECT u.email, COALESCE(k.nama_lengkap, u.email) as nama_lengkap, r.nama_role as source
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN karyawan k ON k.user_id = u.id OR k.email = u.email
      WHERE r.nama_role ILIKE '%hrd%' OR r.nama_role ILIKE '%hc%' OR r.nama_role ILIKE '%human capital%'
    `);
    
    const fromKaryawan = await pool.query(`
      SELECT k.email, k.nama_lengkap, d.nama_departemen as source
      FROM karyawan k
      JOIN jabatan j ON k.jabatan_id = j.id
      JOIN departemen d ON j.departemen_id = d.id
      WHERE d.nama_departemen ILIKE '%hrd%' OR d.nama_departemen ILIKE '%hc%' OR d.nama_departemen ILIKE '%human capital%'
    `);
    
    console.log("From Users Table:");
    console.table(fromUsers.rows);
    console.log("From Karyawan Table:");
    console.table(fromKaryawan.rows);
    
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
