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
pool.query("UPDATE karyawan SET atasan_id = '3b0294c4-8e61-41fd-813e-f9287a9cb4c9' WHERE atasan_id = '00000000-0000-0000-0000-000000000002' AND id = '956cd998-9e32-4547-9751-5c98e0d6273e'").then(res => { console.log('Reverted rows:', res.rowCount); }).catch(console.error).finally(() => pool.end());
