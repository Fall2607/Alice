import pool from './src/app/lib/db';

async function seed() {
    try {
        console.log("Seeding dummy shifts and schedules...");
        
        // 1. Insert Shifts
        const shiftRes = await pool.query(`
            INSERT INTO shift (nama_shift, jam_masuk, jam_keluar) VALUES
            ('Normal 8-4 (Senin-Jumat)', '08:00:00', '16:00:00'),
            ('Normal 8-4 (Sabtu)', '08:00:00', '13:00:00'),
            ('Normal 8-5', '08:00:00', '17:00:00'),
            ('Shift 1 (Pagi)', '06:00:00', '14:00:00'),
            ('Shift 2 (Siang)', '14:00:00', '22:00:00'),
            ('Shift 3 (Malam)', '22:00:00', '06:00:00')
            RETURNING id, nama_shift;
        `);

        const shifts = shiftRes.rows;
        const findShiftId = (name: string) => shifts.find((s: any) => s.nama_shift === name).id;

        // 2. Insert Jadwal Kerja
        const jadwalRes = await pool.query(`
            INSERT INTO jadwal_kerja (nama_jadwal, tipe, keterangan) VALUES
            ('Jadwal 8-4', 'FIXED', 'Senin-Jumat 8-16, Sabtu 8-13'),
            ('Jadwal 8-5', 'FIXED', 'Senin-Jumat 8-17, Sabtu-Minggu Libur'),
            ('Jadwal Shifting', 'SHIFT', 'Jadwal diatur oleh SPV tiap minggu')
            RETURNING id, nama_jadwal;
        `);

        const jadwals = jadwalRes.rows;
        const findJadwalId = (name: string) => jadwals.find((j: any) => j.nama_jadwal === name).id;

        const j84 = findJadwalId('Jadwal 8-4');
        const s84 = findShiftId('Normal 8-4 (Senin-Jumat)');
        const s84sat = findShiftId('Normal 8-4 (Sabtu)');
        
        const j85 = findJadwalId('Jadwal 8-5');
        const s85 = findShiftId('Normal 8-5');

        // 3. Insert Jadwal Kerja Detail
        await pool.query(`
            INSERT INTO jadwal_kerja_detail (jadwal_kerja_id, hari, shift_id) VALUES
            -- Jadwal 8-4
            ($1, 1, $2), ($1, 2, $2), ($1, 3, $2), ($1, 4, $2), ($1, 5, $2), -- Senin - Jumat
            ($1, 6, $3), -- Sabtu
            -- Jadwal 8-5
            ($4, 1, $5), ($4, 2, $5), ($4, 3, $5), ($4, 4, $5), ($4, 5, $5) -- Senin - Jumat
        `, [j84, s84, s84sat, j85, s85]);

        console.log("Seeding complete! You can now assign jadwal_kerja_id to karyawan.");
    } catch (e) {
        console.error("Error seeding:", e);
    } finally {
        process.exit(0);
    }
}
seed();
