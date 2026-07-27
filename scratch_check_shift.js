const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool();
async function check() {
  const shiftRes = await pool.query("SELECT id, nama_shift FROM shift WHERE id IN (9, 13, 14, 15, 40)");
  console.log('Shift types:', shiftRes.rows);
  pool.end();
}
check().catch(console.error);
