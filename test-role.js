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
pool.query("SELECT u.email, r.nama_role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = 'habibnaufal621@gmail.com'").then(res => { console.log('Role:', res.rows); }).catch(console.error).finally(() => pool.end());
