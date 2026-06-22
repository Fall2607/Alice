import pool from './src/app/lib/db';

async function fixTimezoneIssue() {
    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        // Drop the constraint if it depends on tanggal
        // The conflict is on (karyawan_id, tanggal)
        await client.query(`
            ALTER TABLE karyawan_shift DROP CONSTRAINT IF EXISTS karyawan_shift_karyawan_id_tanggal_key;
        `);

        // Change column type
        await client.query(`
            ALTER TABLE karyawan_shift ALTER COLUMN tanggal TYPE VARCHAR(10) USING CAST(tanggal AS VARCHAR(10));
        `);

        // Re-add the unique constraint
        await client.query(`
            ALTER TABLE karyawan_shift ADD CONSTRAINT karyawan_shift_karyawan_id_tanggal_key UNIQUE (karyawan_id, tanggal);
        `);

        await client.query('COMMIT');
        client.release();
        console.log("karyawan_shift table tanggal changed to VARCHAR(10) successfully!");
    } catch (e) {
        console.error("Error altering table:", e);
    } finally {
        process.exit(0);
    }
}
fixTimezoneIssue();
