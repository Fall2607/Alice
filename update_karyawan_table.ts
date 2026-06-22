import pool from './src/app/lib/db';

async function updateKaryawanTable() {
    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        await client.query(`
            ALTER TABLE karyawan 
            ADD COLUMN IF NOT EXISTS rekening_bsi VARCHAR(100),
            ADD COLUMN IF NOT EXISTS alamat_domisili TEXT
        `);

        await client.query('COMMIT');
        client.release();
        console.log("karyawan table updated with rekening_bsi and alamat_domisili!");
    } catch (e) {
        console.error("Error updating table:", e);
    } finally {
        process.exit(0);
    }
}
updateKaryawanTable();
