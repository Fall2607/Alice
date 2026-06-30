import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month'); // YYYY-MM
        const unitParam = searchParams.get('unit'); // departemen_id or 'all'
        
        let dateFilter = monthParam ? `${monthParam}-%` : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-%`;
        const todayDateStr = new Date().toISOString().split('T')[0];

        const superiorId = searchParams.get('superior_id') || searchParams.get('superiorId');

        // Base Karyawan Query
        let karQuery = `SELECT k.id FROM karyawan k`;
        const queryParams: any[] = [];
        
        if (unitParam && unitParam !== 'all' && unitParam !== 'Semua Unit') {
            karQuery = `
                SELECT k.id 
                FROM karyawan k
                LEFT JOIN jabatan j ON k.jabatan_id = j.id
                WHERE j.departemen_id = $1
            `;
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

        const karyawanRes = await pool.query(karQuery, queryParams);
        const totalKaryawan = karyawanRes.rows.length;
        const karyawanIds = karyawanRes.rows.map(r => r.id);

        if (totalKaryawan === 0) {
            return NextResponse.json({
                totalKaryawan: 0,
                hadirHariIni: 0,
                terlambatHariIni: 0,
                alphaHariIni: 0,
                kehadiranBulanIni: 0
            });
        }

        // Stats Hari Ini
        let queryHadir = `SELECT id, is_late FROM absensi WHERE tanggal = $1 AND karyawan_id = ANY($2::uuid[])`;
        const hadirRes = await pool.query(queryHadir, [todayDateStr, karyawanIds]);
        
        const hadirHariIni = hadirRes.rows.length;
        const terlambatHariIni = hadirRes.rows.filter(r => r.is_late).length;
        // Simple Alpha estimation (if they didn't clock in, they might be alpha, though it could be leave)
        const alphaHariIni = totalKaryawan - hadirHariIni; 

        // Rata-rata Bulan Ini (approximate)
        let queryBulan = `SELECT COUNT(id) as total_absen FROM absensi WHERE tanggal::text LIKE $1 AND karyawan_id = ANY($2::uuid[])`;
        const bulanRes = await pool.query(queryBulan, [dateFilter, karyawanIds]);
        
        // Asumsi hari kerja efektif sebulan sekitar 22 hari
        const totalExpectedAbsen = totalKaryawan * 22; 
        const actualAbsen = parseInt(bulanRes.rows[0].total_absen || '0');
        const kehadiranBulanIni = totalExpectedAbsen > 0 ? ((actualAbsen / totalExpectedAbsen) * 100).toFixed(1) : 0;

        return NextResponse.json({
            totalKaryawan,
            hadirHariIni,
            terlambatHariIni,
            alphaHariIni,
            kehadiranBulanIni: Math.min(Number(kehadiranBulanIni), 100) // cap at 100%
        });

    } catch (err: any) {
        console.error("Error fetching dashboard absensi:", err);
        return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
    }
}
