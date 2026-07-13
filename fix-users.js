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

async function fixKaryawanUsers() {
  try {
    // Cari karyawan yang user_id nya null tapi emailnya ada di tabel users
    const res = await pool.query(`
      SELECT k.id as karyawan_id, k.email as karyawan_email, k.nama_lengkap, u.id as user_id, u.email as user_email
      FROM karyawan k
      JOIN users u ON k.email = u.email
      WHERE k.user_id IS NULL
    `);
    
    console.log(`Ditemukan ${res.rows.length} karyawan dengan user_id kosong tapi memiliki akun di tabel users:`);
    console.table(res.rows);

    let updatedCount = 0;
    for (const row of res.rows) {
      await pool.query(
        `UPDATE karyawan SET user_id = $1 WHERE id = $2`,
        [row.user_id, row.karyawan_id]
      );
      updatedCount++;
    }

    console.log(`\nBerhasil mengupdate ${updatedCount} data karyawan dengan menghubungkan user_id-nya.`);
    
    // Periksa khusus untuk dicky dan frisca jika email mereka berbeda dengan di karyawan
    const manualCheck = await pool.query(`
        SELECT u.id as user_id, u.email as user_email, u.name as user_name
        FROM users u
        WHERE u.email ILIKE '%dicky%' OR u.name ILIKE '%dicky%' OR u.email ILIKE '%frisca%' OR u.name ILIKE '%frisca%'
    `);
    
    const karyawanCheck = await pool.query(`
        SELECT k.id as karyawan_id, k.email as karyawan_email, k.nama_lengkap, k.user_id
        FROM karyawan k
        WHERE k.email ILIKE '%dicky%' OR k.nama_lengkap ILIKE '%dicky%' OR k.email ILIKE '%frisca%' OR k.nama_lengkap ILIKE '%frisca%'
    `);
    
    console.log("\n--- Manual Check Dicky & Frisca ---");
    console.log("Di Users:");
    console.table(manualCheck.rows);
    console.log("Di Karyawan:");
    console.table(karyawanCheck.rows);

  } catch (err) {
    console.error("Terjadi kesalahan:", err);
  } finally {
    pool.end();
  }
}

fixKaryawanUsers();
