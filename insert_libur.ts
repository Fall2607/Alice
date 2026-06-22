import pool from './src/app/lib/db';
async function run() {
    await pool.query('ALTER TABLE shift ALTER COLUMN jam_masuk DROP NOT NULL');
    await pool.query('ALTER TABLE shift ALTER COLUMN jam_keluar DROP NOT NULL');
    await pool.query("INSERT INTO shift (nama_shift, jam_masuk, jam_keluar) VALUES ('Libur / Off', null, null)");
    console.log('success');
    process.exit(0);
}
run();
