const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Next/Alice/.env.local' });
const pool = new Pool({
  host: process.env.DB_HOST || '182.253.37.109',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'hris',
  port: process.env.DB_PORT || 5432
});
async function addMenu() {
  try {
    const res = await pool.query(`
      INSERT INTO menus (id, nama_menu, path, icon, urutan, is_active)
      VALUES (gen_random_uuid(), 'Approval Cuti', '/admin/approval-cuti', 'CheckCircle2', 15, true)
      RETURNING *;
    `);
    console.log('Inserted:', res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
addMenu();
