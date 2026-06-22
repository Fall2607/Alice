import pool from './src/app/lib/db';

async function getSchema() {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'karyawan'
            ORDER BY ordinal_position;
        `);
        console.table(res.rows);
        client.release();
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
getSchema();
