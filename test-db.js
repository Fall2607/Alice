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
    const roles = [
      'c3bdf317-6bf9-4852-919a-bd604ce9f9b1',
      '0e9e13f0-5799-45a3-8498-31baa465d63f',
      'ad092df5-7331-4fde-8759-ea00f83a1efb',
      'e5cad7be-f097-47a7-913f-cc7a53775582',
      'a2f4ef66-bb65-48e1-ae3e-c631bb59a083',
      'a93ee3a3-27c6-4481-bae8-170c18793605'
    ];
    
    for (const role_id of roles) {
      const existing = await pool.query("SELECT * FROM role_menu_access WHERE role_id = $1 AND menu_id = '4d81322d-fb02-4a32-a95a-88ac6226c2ec'", [role_id]);
      if (existing.rows.length === 0) {
        await pool.query("INSERT INTO role_menu_access (role_id, menu_id, can_view) VALUES ($1, '4d81322d-fb02-4a32-a95a-88ac6226c2ec', true)", [role_id]);
        console.log("Added access for role", role_id);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
