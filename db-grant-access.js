const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Next/Alice/.env.local' });
const pool = new Pool({
  host: process.env.DB_HOST || '182.253.37.109',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'hris',
  port: process.env.DB_PORT || 5432
});
async function grantAccess() {
  try {
    const roles = await pool.query('SELECT * FROM roles;');
    const menuId = 'd7cbaa47-cee0-4508-9c35-b712f5f3b31a';
    
    for (const r of roles.rows) {
      if (['admin', 'hrd', 'koordinator', 'supervisor', 'direktur', 'wakil direktur'].includes(r.nama_role.toLowerCase())) {
         try {
             await pool.query('INSERT INTO role_menu_access (role_id, menu_id, can_view) VALUES ($1, $2, true)', [r.id, menuId]);
             console.log('Added to', r.nama_role);
         } catch(e) {
             console.log('Failed for', r.nama_role, e.message);
         }
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
grantAccess();
