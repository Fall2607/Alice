const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Next/Alice/.env.local' });
const pool = new Pool({
  host: process.env.DB_HOST || '182.253.37.109',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'hris',
  port: process.env.DB_PORT || 5432
});
async function getHC() {
  try {
    const res = await pool.query(`
      SELECT k.email, k.nama_lengkap 
      FROM karyawan k
      JOIN users u ON k.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE r.nama_role ILIKE '%hrd%' OR r.nama_role ILIKE '%hc%' OR r.nama_role ILIKE '%human capital%'
    `);
    console.log('HC:', res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
getHC();
