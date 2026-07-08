const { Pool } = require('pg');
const pool = new Pool({
  host: '182.253.37.109',
  user: 'postgres',
  password: '1234',
  database: 'hris',
  port: 5432
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'karyawan_shift';
    `);
    console.log('Columns:', res.rows);

    const constr = await pool.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'karyawan_shift'::regclass;
    `);
    console.log('Constraints:', constr.rows);
  } catch(e) {
    console.log(e);
  } finally {
    process.exit(0);
  }
}
run();
