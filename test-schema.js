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
  const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'absensi';`);
  console.log(res.rows);
  const keys = await pool.query(`SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE conrelid = 'absensi'::regclass;`);
  console.log(keys.rows);
  process.exit(0);
}
run();
