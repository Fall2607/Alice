const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 5432,
});

async function main() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'karyawan_shift'");
    console.log("== karyawan_shift columns ==");
    console.table(res.rows);
    
    const shiftRes = await pool.query("SELECT * FROM shift");
    console.log("== shift table ==");
    console.table(shiftRes.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
main();
