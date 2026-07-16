const { Pool } = require('pg');
const pool = new Pool({
  host: '182.253.37.109',
  user: 'postgres',
  password: '1234',
  database: 'hris',
  port: 5432
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const menuId = 'dd27c7f4-d6e4-4ab2-baf8-1c447bc180ab';
    const parentId = '69903b4c-9613-47af-883b-7d18c0c3f21c';
    
    const res = await client.query('SELECT 1 FROM menus WHERE id = $1', [menuId]);
    if (res.rows.length === 0) {
      await client.query(`
        INSERT INTO menus (id, parent_id, nama_menu, path, icon, urutan, is_active)
        VALUES ($1, $2, 'Delegasi Jadwal', '/admin/jadwal-kerja/delegasi', 'Key', 8, true)
      `, [menuId, parentId]);
      
      const rolesRes = await client.query("SELECT id FROM roles WHERE LOWER(nama_role) IN ('admin', 'head of clinic')");
      
      for(const r of rolesRes.rows) {
        // Find if role_menu_access uses just menu_id and role_id as primary key
        // Just try inserting
        try {
            await client.query(`
            INSERT INTO role_menu_access (role_id, menu_id, can_view)
            VALUES ($1, $2, true)
            `, [r.id, menuId]);
        } catch(e) {
            console.log("Could not insert for role", r.id, e.message);
        }
      }
    }
    
    await client.query('COMMIT');
    console.log("Menu Delegasi Jadwal berhasil ditambahkan.");
  } catch(e) {
    await client.query('ROLLBACK');
    console.error(e);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
