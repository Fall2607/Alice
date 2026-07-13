const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Next/Alice/.env.local' });
const pool = new Pool({
  host: '182.253.37.109',
  user: 'postgres',
  password: '1234',
  database: 'hris',
  port: 5432
});
async function run() {
  const k = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'karyawan';`);
  console.log("karyawan columns:", k.rows);
  const c = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cuti';`);
  console.log("cuti columns:", c.rows);
  process.exit(0);
}
run();
