import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');
        const unitParam = searchParams.get('unit'); // departemen_id or 'all'
        
        if (!startDateParam || !endDateParam) {
            return NextResponse.json({ message: "Parameter startDate dan endDate wajib diisi." }, { status: 400 });
        }

        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);
        
        // Cek jika date tidak valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({ message: "Format tanggal tidak valid." }, { status: 400 });
        }

        const superiorId = searchParams.get('superior_id') || searchParams.get('superiorId');

        // 1. Ambil Karyawan (Filter by Unit if provided)
        let karQuery = `
            SELECT k.id, k.nama_lengkap as nama, k.jadwal_kerja_id, lj.nama_level as jabatan
            FROM karyawan k
            LEFT JOIN jabatan j ON k.jabatan_id = j.id
            LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
        `;
        const queryParams: any[] = [];
        
        if (unitParam && unitParam !== 'all' && unitParam !== 'Semua Unit') {
            karQuery += ` WHERE j.departemen_id = $1`;
            queryParams.push(unitParam);
        }

        if (superiorId) {
            const recursiveCte = `
                WITH RECURSIVE subordinates AS (
                    SELECT id FROM karyawan WHERE atasan_id = $${queryParams.length + 1}
                    UNION
                    SELECT k.id FROM karyawan k
                    INNER JOIN subordinates s ON s.id = k.atasan_id
                )
            `;
            queryParams.push(superiorId);
            
            if (karQuery.includes('WHERE')) {
                karQuery = `${recursiveCte} ${karQuery} AND k.id IN (SELECT id FROM subordinates)`;
            } else {
                karQuery = `${recursiveCte} ${karQuery} WHERE k.id IN (SELECT id FROM subordinates)`;
            }
        }
        
        karQuery += ` ORDER BY k.nama_lengkap ASC`;

        const karyawanRes = await pool.query(karQuery, queryParams);
        const karyawanList = karyawanRes.rows;

        if (karyawanList.length === 0) {
            return NextResponse.json({ data: [], dates: [] });
        }

        const karyawanIds = karyawanList.map(k => k.id);

        // 2. Ambil Data Absensi Date Range
        const absensiQuery = `
            SELECT karyawan_id, tanggal, jam_masuk, jam_keluar, is_late, menit_terlambat, is_pulang_cepat, menit_pulang_cepat
            FROM absensi
            WHERE tanggal >= $1 AND tanggal <= $2 AND karyawan_id = ANY($3::uuid[])
        `;
        const absensiRes = await pool.query(absensiQuery, [startDateParam, endDateParam, karyawanIds]);
        
        // Map absensi by karyawan_id -> date -> data
        const absensiMap: Record<string, Record<string, any>> = {};
        for (const row of absensiRes.rows) {
            if (!absensiMap[row.karyawan_id]) {
                absensiMap[row.karyawan_id] = {};
            }
            // Format DB date to YYYY-MM-DD
            const d = new Date(row.tanggal);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            const dateStr = d.toISOString().split('T')[0];
            
            const formatTime = (timeVal: any) => {
                if (!timeVal) return null;
                const t = new Date(timeVal);
                return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
            };

            row.jam_masuk = formatTime(row.jam_masuk);
            row.jam_keluar = formatTime(row.jam_keluar);

            absensiMap[row.karyawan_id][dateStr] = row;
        }

        // 2.5 Ambil Data Shift Date Range
        const shiftQuery = `
            SELECT ks.karyawan_id, ks.tanggal, s.nama_shift, s.jam_masuk, s.jam_keluar
            FROM karyawan_shift ks
            JOIN shift s ON ks.shift_id = s.id
            WHERE ks.tanggal >= $1 AND ks.tanggal <= $2 AND ks.karyawan_id = ANY($3::uuid[])
        `;
        const shiftRes = await pool.query(shiftQuery, [startDateParam, endDateParam, karyawanIds]);
        
        const shiftMap: Record<string, Record<string, any>> = {};
        for (const row of shiftRes.rows) {
            if (!shiftMap[row.karyawan_id]) {
                shiftMap[row.karyawan_id] = {};
            }
            const d = new Date(row.tanggal);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            const dateStr = d.toISOString().split('T')[0];
            
            shiftMap[row.karyawan_id][dateStr] = {
                nama_shift: row.nama_shift,
                jam_masuk: row.jam_masuk,
                jam_keluar: row.jam_keluar
            };
        }

        // 2.6 Ambil Data Default Shift dari jadwal_kerja
        const jadwalKerjaIds = Array.from(new Set(karyawanList.map(k => k.jadwal_kerja_id).filter(id => id)));
        const defaultShiftMap: Record<number, Record<number, any>> = {};
        
        if (jadwalKerjaIds.length > 0) {
            const defaultShiftQuery = `
                SELECT jkd.jadwal_kerja_id, jkd.hari, s.nama_shift, s.jam_masuk, s.jam_keluar
                FROM jadwal_kerja_detail jkd
                JOIN shift s ON jkd.shift_id = s.id
                WHERE jkd.jadwal_kerja_id = ANY($1::int[])
            `;
            const dsRes = await pool.query(defaultShiftQuery, [jadwalKerjaIds]);
            for (const row of dsRes.rows) {
                if (!defaultShiftMap[row.jadwal_kerja_id]) {
                    defaultShiftMap[row.jadwal_kerja_id] = {};
                }
                defaultShiftMap[row.jadwal_kerja_id][row.hari] = {
                    nama_shift: row.nama_shift,
                    jam_masuk: row.jam_masuk,
                    jam_keluar: row.jam_keluar
                };
            }
        }

        // 2.7 Ambil Shift 8-4 untuk Override (Piket Sabtu)
        const shift84Query = `SELECT id, nama_shift, jam_masuk, jam_keluar FROM shift WHERE nama_shift LIKE '%8-4 (Senin-Jumat)%' LIMIT 1`;
        const shift84Res = await pool.query(shift84Query);
        let shift84Data: any = null;
        if (shift84Res.rows.length > 0) {
            shift84Data = {
                nama_shift: shift84Res.rows[0].nama_shift,
                jam_masuk: String(shift84Res.rows[0].jam_masuk).substring(0, 5),
                jam_keluar: String(shift84Res.rows[0].jam_keluar).substring(0, 5)
            };
        }

        // Generate dates array
        const dates: string[] = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
        }

        // 3. Susun Response Final
        const result = karyawanList.map(kar => {
            const harian: Record<string, any> = {};
            let totalHadir = 0;
            let totalTelat = 0;
            let totalAlpha = 0;
            let totalIzin = 0;

            for (const dateStr of dates) {
                const currentDate = new Date(dateStr);
                const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                const absenHariIni = absensiMap[kar.id]?.[dateStr];
                let adaShift = shiftMap[kar.id]?.[dateStr]; 
                
                if (!adaShift && kar.jadwal_kerja_id) {
                    adaShift = defaultShiftMap[kar.jadwal_kerja_id]?.[dayOfWeek];
                }

                // DYNAMIC OVERRIDE: Jika 8-5 dan ada piket sabtu di minggu yang sama -> jadi 8-4
                if (dayOfWeek >= 1 && dayOfWeek <= 5 && adaShift && adaShift.nama_shift && adaShift.nama_shift.includes('8-5') && shift84Data) {
                    const daysToSaturday = 6 - dayOfWeek;
                    const satDate = new Date(currentDate);
                    satDate.setDate(currentDate.getDate() + daysToSaturday);
                    const satDateStr = satDate.toISOString().split('T')[0];
                    
                    const adaPiketSabtu = shiftMap[kar.id]?.[satDateStr];
                    if (adaPiketSabtu) {
                        adaShift = shift84Data;
                    }
                }

                // Cek Cuti / Izin dari shift
                const isCuti = adaShift && adaShift.nama_shift.toLowerCase().includes('cuti');

                if (isCuti) {
                    totalIzin++;
                    harian[dateStr] = { status: 'izin', shift: adaShift };
                } else if (absenHariIni) {
                    totalHadir++;
                    if (absenHariIni.is_late) {
                        totalTelat++;
                        harian[dateStr] = { status: 'telat', shift: adaShift, ...absenHariIni };
                    } else {
                        harian[dateStr] = { status: 'hadir', shift: adaShift, ...absenHariIni };
                    }
                } else {
                    if (adaShift) {
                        totalAlpha++;
                        harian[dateStr] = { status: 'alpha', shift: adaShift };
                    } else if (!isWeekend) {
                        totalAlpha++;
                        harian[dateStr] = { status: 'alpha', shift: adaShift };
                    } else {
                        harian[dateStr] = { status: 'libur', shift: adaShift };
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
                    izin: totalIzin
                },
                harian
            };
        });

        return NextResponse.json({ data: result, dates });

    } catch (err: any) {
        console.error("Error fetching rekap absensi:", err);
        return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
    }
}
