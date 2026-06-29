import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const karyawanId = id;
        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month'); // YYYY-MM
        
        if (!monthParam) {
            return NextResponse.json({ message: "Parameter month (YYYY-MM) wajib diisi." }, { status: 400 });
        }

        const [yearStr, monthStr] = monthParam.split("-");
        const year = parseInt(yearStr);
        const month = parseInt(monthStr); // 1-12

        // Ambil data dasar karyawan
        const karRes = await pool.query(`
            SELECT k.id, k.jadwal_kerja_id, lj.nama_level as jabatan 
            FROM karyawan k
            LEFT JOIN jabatan j ON k.jabatan_id = j.id
            LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
            WHERE k.id = $1
        `, [karyawanId]);

        if (karRes.rows.length === 0) {
            return NextResponse.json({ message: "Karyawan tidak ditemukan." }, { status: 404 });
        }

        const karyawan = karRes.rows[0];
        let isSpvOrKoor = false;
        if (karyawan.jabatan) {
            const jab = karyawan.jabatan.toLowerCase();
            if (jab.includes('supervisor') || jab.includes('koordinator') || jab.includes('manajer') || jab.includes('manager') || jab.includes('direktur')) {
                isSpvOrKoor = true;
            }
        }

        // Ambil jadwal default (jadwal_kerja_detail) jika ada
        const defaultShifts: Record<number, any> = {};
        if (karyawan.jadwal_kerja_id) {
            const jkdRes = await pool.query(`
                SELECT jkd.hari, s.id as shift_id, s.nama_shift, s.jam_masuk, s.jam_keluar
                FROM jadwal_kerja_detail jkd
                JOIN shift s ON jkd.shift_id = s.id
                WHERE jkd.jadwal_kerja_id = $1
            `, [karyawan.jadwal_kerja_id]);
            for (const row of jkdRes.rows) {
                defaultShifts[row.hari] = row; // hari 1-7 di db, dimana 1=Senin.. but Javascript getDay() is 0=Minggu, 1=Senin
            }
        }

        // Ambil karyawan_shift (override) untuk bulan ini
        const overrideRes = await pool.query(`
            SELECT ks.tanggal, s.id as shift_id, s.nama_shift, s.jam_masuk, s.jam_keluar
            FROM karyawan_shift ks
            JOIN shift s ON ks.shift_id = s.id
            WHERE ks.karyawan_id = $1 AND ks.tanggal LIKE $2
        `, [karyawanId, `${monthParam}-%`]);
        
        const overrides: Record<string, any> = {};
        for (const row of overrideRes.rows) {
            overrides[row.tanggal] = row;
        }

        const daysInMonth = new Date(year, month, 0).getDate();
        const schedule = [];

        // Fetch shift 8-4 just in case
        let shift84Res = await pool.query(`SELECT id as shift_id, nama_shift, jam_masuk, jam_keluar FROM shift WHERE nama_shift LIKE '%8-4 (Senin-Jumat)%' LIMIT 1`);
        const shift84 = shift84Res.rows.length > 0 ? shift84Res.rows[0] : null;

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const currentDate = new Date(year, month - 1, i);
            const jsDayOfWeek = currentDate.getDay(); // 0 (Sun) - 6 (Sat)
            const dbDayOfWeek = jsDayOfWeek === 0 ? 7 : jsDayOfWeek; // DB hari: 1=Senin, 7=Minggu (asumsi standar)

            let finalShift = null;

            // 1. Cek Override (karyawan_shift)
            if (overrides[dateStr]) {
                finalShift = overrides[dateStr];
            } else if (defaultShifts[dbDayOfWeek]) {
                // 2. Cek Default (Mapping JS day to DB day. Karena tabel jadwal_kerja_detail hari = 1 (senin), 2 (selasa)... maka dbDayOfWeek cocok)
                finalShift = defaultShifts[dbDayOfWeek];
            }

            // 3. Logika Piket (Hanya untuk Senin-Jumat jika default-nya 8-5)
            if (jsDayOfWeek >= 1 && jsDayOfWeek <= 5 && finalShift && finalShift.nama_shift.includes('8-5') && shift84) {
                const daysToSaturday = 6 - jsDayOfWeek;
                const saturdayDate = new Date(year, month - 1, i + daysToSaturday);
                const satDateStr = `${saturdayDate.getFullYear()}-${String(saturdayDate.getMonth() + 1).padStart(2, '0')}-${String(saturdayDate.getDate()).padStart(2, '0')}`;
                
                // Apakah ada piket sabtu?
                const piketRes = await pool.query(
                    `SELECT shift_id FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2`,
                    [karyawanId, satDateStr]
                );

                if (piketRes.rows.length > 0 && piketRes.rows[0].shift_id) {
                    finalShift = shift84;
                }
            }

            schedule.push({
                date: dateStr,
                dayOfWeek: jsDayOfWeek, // JS Format untuk Frontend
                shift: finalShift ? {
                    id: finalShift.shift_id,
                    nama_shift: finalShift.nama_shift,
                    jam_masuk: finalShift.jam_masuk,
                    jam_keluar: finalShift.jam_keluar,
                } : null // Null berarti Libur
            });
        }

        return NextResponse.json({ schedule });

    } catch (err: any) {
        console.error("Error fetching jadwal bulanan:", err);
        return NextResponse.json({ message: "Terjadi kesalahan internal server.", error: err.message }, { status: 500 });
    }
}
