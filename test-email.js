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
  const res = await pool.query(`SELECT email FROM users LIMIT 10`);
  console.log(res.rows);
  process.exit(0);
}
run();
