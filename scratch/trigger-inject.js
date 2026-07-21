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
    // 1. Check if Cuti shift exists
    let shiftCutiId = null;
    const shiftRes = await pool.query(`SELECT id FROM shift WHERE nama_shift ILIKE 'Cuti' LIMIT 1`);
    
    if (shiftRes.rows.length > 0) {
      shiftCutiId = shiftRes.rows[0].id;
      console.log("Cuti shift already exists:", shiftCutiId);
    } else {
      const insertShift = await pool.query(`
        INSERT INTO shift (nama_shift, jam_masuk, jam_keluar, is_cross_day)
        VALUES ('Cuti', NULL, NULL, false)
        RETURNING id
      `);
      shiftCutiId = insertShift.rows[0].id;
      console.log("Created new Cuti shift:", shiftCutiId);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

main();
