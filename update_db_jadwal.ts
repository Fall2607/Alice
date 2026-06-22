import pool from './src/app/lib/db';

async function updateDb() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS shift (
                id SERIAL PRIMARY KEY,
                nama_shift VARCHAR(255) NOT NULL,
                jam_masuk TIME NOT NULL,
                jam_keluar TIME NOT NULL,
                is_cross_day BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS jadwal_kerja (
                id SERIAL PRIMARY KEY,
                nama_jadwal VARCHAR(255) NOT NULL,
                tipe VARCHAR(50) DEFAULT 'FIXED', -- FIXED or SHIFT
                keterangan TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS jadwal_kerja_detail (
                id SERIAL PRIMARY KEY,
                jadwal_kerja_id INT REFERENCES jadwal_kerja(id) ON DELETE CASCADE,
                hari INT NOT NULL, -- 0=Minggu, 1=Senin, ..., 6=Sabtu
                shift_id INT REFERENCES shift(id) ON DELETE SET NULL, -- if null, libur
                UNIQUE(jadwal_kerja_id, hari)
            );

            CREATE TABLE IF NOT EXISTS karyawan_shift (
                id SERIAL PRIMARY KEY,
                karyawan_id UUID REFERENCES karyawan(id) ON DELETE CASCADE,
                tanggal DATE NOT NULL,
                shift_id INT REFERENCES shift(id) ON DELETE SET NULL,
                assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(karyawan_id, tanggal)
            );

            -- Alter karyawan to add jadwal_kerja_id
            ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS jadwal_kerja_id INT REFERENCES jadwal_kerja(id) ON DELETE SET NULL;
            
            -- Alter absensi to add status keterlambatan or just use menit_terlambat
            ALTER TABLE absensi ADD COLUMN IF NOT EXISTS shift_id INT REFERENCES shift(id) ON DELETE SET NULL;
            ALTER TABLE absensi ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT FALSE;
        `);
        console.log("Database updated successfully for Jadwal Kerja!");
    } catch (error) {
        console.error("Error updating database:", error);
    } finally {
        process.exit(0);
    }
}

updateDb();
