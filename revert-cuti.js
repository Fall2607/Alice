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
    const cutiId = 'b65aeb81-5cb2-4885-8a7a-64d8403cf260';
    
    // Check old data
    const old = await pool.query("SELECT * FROM pengajuan_cuti WHERE id = $1", [cutiId]);
    console.log("Data Lama:", old.rows[0]);

    // Update status kembali ke 'Menunggu Atasan'
    const res = await pool.query(`
      UPDATE pengajuan_cuti 
      SET status = 'Menunggu Atasan', 
          atasan_approved_by_id = NULL, 
          hc_approved_by_id = NULL, 
          magic_token = NULL 
      WHERE id = $1
      RETURNING *
    `, [cutiId]);
    
    console.log("Data Baru:", res.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
