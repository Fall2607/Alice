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
pool.query(`
      SELECT c.*, k.nama_lengkap, lj.nama_level AS nama_jabatan 
      FROM pengajuan_cuti c
      JOIN karyawan k ON c.karyawan_id = k.id
      LEFT JOIN jabatan j ON k.jabatan_id = j.id
      LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      WHERE 1=1
`).then(res => { console.log('Rows:', res.rows.length); }).catch(console.error).finally(() => pool.end());
