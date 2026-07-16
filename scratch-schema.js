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
  const tables = ['karyawan_shift', 'shift', 'karyawan'];
  for (const table of tables) {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    console.log(`\nTable: ${table}`);
    console.table(res.rows);
  }
  pool.end();
}

main();
