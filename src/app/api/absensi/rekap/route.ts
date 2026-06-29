import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month'); // YYYY-MM
        const unitParam = searchParams.get('unit'); // departemen_id or 'all'
        
        if (!monthParam) {
            return NextResponse.json({ message: "Parameter month (YYYY-MM) wajib diisi." }, { status: 400 });
        }

        const [yearStr, monthStr] = monthParam.split("-");
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        const daysInMonth = new Date(year, month, 0).getDate();

        // 1. Ambil Karyawan (Filter by Unit if provided)
        let karQuery = `
            SELECT k.id, k.nama_lengkap as nama, lj.nama_level as jabatan
            FROM karyawan k
            LEFT JOIN jabatan j ON k.jabatan_id = j.id
            LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
        `;
        const queryParams: any[] = [];
        
        if (unitParam && unitParam !== 'all' && unitParam !== 'Semua Unit') {
            karQuery += ` WHERE j.departemen_id = $1`;
            queryParams.push(unitParam);
        }
        
        karQuery += ` ORDER BY k.nama_lengkap ASC`;

        const karyawanRes = await pool.query(karQuery, queryParams);
        const karyawanList = karyawanRes.rows;

        if (karyawanList.length === 0) {
            return NextResponse.json({ data: [] });
        }

        const karyawanIds = karyawanList.map(k => k.id);

        // 2. Ambil Data Absensi Bulan Ini
        const absensiQuery = `
            SELECT karyawan_id, tanggal, jam_masuk, jam_keluar, is_late, menit_terlambat
            FROM absensi
            WHERE tanggal::text LIKE $1 AND karyawan_id = ANY($2::uuid[])
        `;
        const absensiRes = await pool.query(absensiQuery, [`${monthParam}-%`, karyawanIds]);
        
        // Map absensi by karyawan_id -> date -> data
        const absensiMap: Record<string, Record<string, any>> = {};
        for (const row of absensiRes.rows) {
            if (!absensiMap[row.karyawan_id]) {
                absensiMap[row.karyawan_id] = {};
            }
            // Format DB date to YYYY-MM-DD
            const d = new Date(row.tanggal);
            // Fix timezone issue when formatting to string
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            const dateStr = d.toISOString().split('T')[0];
            
            absensiMap[row.karyawan_id][dateStr] = row;
        }

        // 2.5 Ambil Data Shift Bulan Ini
        const shiftQuery = `
            SELECT karyawan_id, tanggal
            FROM karyawan_shift
            WHERE tanggal::text LIKE $1 AND karyawan_id = ANY($2::uuid[])
        `;
        const shiftRes = await pool.query(shiftQuery, [`${monthParam}-%`, karyawanIds]);
        
        const shiftMap: Record<string, Record<string, boolean>> = {};
        for (const row of shiftRes.rows) {
            if (!shiftMap[row.karyawan_id]) {
                shiftMap[row.karyawan_id] = {};
            }
            const d = new Date(row.tanggal);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            const dateStr = d.toISOString().split('T')[0];
            
            shiftMap[row.karyawan_id][dateStr] = true;
        }

        // 3. Susun Response Final
        const result = karyawanList.map(kar => {
            const harian: Record<string, any> = {};
            let totalHadir = 0;
            let totalTelat = 0;
            let totalAlpha = 0; // Simple calc: weekdays without presence

            for (let i = 1; i <= daysInMonth; i++) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const currentDate = new Date(year, month - 1, i);
                const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                const absenHariIni = absensiMap[kar.id]?.[dateStr];
                const adaShift = shiftMap[kar.id]?.[dateStr];

                if (absenHariIni) {
                    totalHadir++;
                    if (absenHariIni.is_late) {
                        totalTelat++;
                        harian[dateStr] = { status: 'telat', ...absenHariIni };
                    } else {
                        harian[dateStr] = { status: 'hadir', ...absenHariIni };
                    }
                } else {
                    if (adaShift) {
                        totalAlpha++;
                        harian[dateStr] = { status: 'alpha' };
                    } else if (!isWeekend) {
                        totalAlpha++;
                        harian[dateStr] = { status: 'alpha' };
                    } else {
                        harian[dateStr] = { status: 'libur' };
                    }
                }
            }

            return {
                id: kar.id,
                nama: kar.nama,
                jabatan: kar.jabatan || 'Staff',
                rekap: {
                    hadir: totalHadir,
                    telat: totalTelat,
                    alpha: totalAlpha,
                    izin: 0 // Placeholder until cuti table is integrated
                },
                harian
            };
        });

        return NextResponse.json({ data: result, daysInMonth, year, month });

    } catch (err: any) {
        console.error("Error fetching rekap absensi:", err);
        return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
    }
}
