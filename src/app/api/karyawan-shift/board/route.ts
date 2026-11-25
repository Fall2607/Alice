import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export const dynamic = 'force-dynamic';

// GET all overrides for a whole month
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const monthYear = searchParams.get('month'); // YYYY-MM
        const superiorId = searchParams.get('superior_id');
        
        let query = `
            SELECT ks.tanggal, ks.shift_id, k.id as karyawan_id, k.nama_lengkap 
            FROM karyawan_shift ks
            JOIN karyawan k ON ks.karyawan_id = k.id
        `;
        const values: any[] = [];
        const conditions = [];
        
        if (monthYear) {
            const [yStr, mStr] = monthYear.split('-');
            const year = parseInt(yStr, 10);
            const month = parseInt(mStr, 10);
            const pad2 = (n: number) => String(n).padStart(2, '0');
            const startDate = new Date(year, month - 2, 26);
            const endDate = new Date(year, month - 1, 25);
            const startStr = `${startDate.getFullYear()}-${pad2(startDate.getMonth() + 1)}-${pad2(startDate.getDate())}`;
            const endStr = `${endDate.getFullYear()}-${pad2(endDate.getMonth() + 1)}-${pad2(endDate.getDate())}`;

            values.push(startStr);
            values.push(endStr);
            conditions.push(`ks.tanggal::text >= $${values.length - 1} AND ks.tanggal::text <= $${values.length}`);
        }

        if (superiorId) {
            query = `
                WITH RECURSIVE subordinates AS (
                    SELECT id FROM karyawan WHERE atasan_id = $${values.length + 1}
                    UNION
                    SELECT k.id FROM karyawan k
                    INNER JOIN subordinates s ON s.id = k.atasan_id
                ),
                delegated_karyawan AS (
                    SELECT k.id FROM karyawan k
                    INNER JOIN jabatan j ON k.jabatan_id = j.id
                    INNER JOIN schedule_delegations sd ON j.departemen_id = sd.departemen_id
                    WHERE sd.karyawan_id = $${values.length + 1}
                )
                ${query}
            `;
            values.push(superiorId);
            conditions.push(`k.id IN (SELECT id FROM subordinates UNION SELECT id FROM delegated_karyawan)`);
        }
        
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }
        
        const res = await pool.query(query, values);
        return NextResponse.json(res.rows);
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching board data', error: error.message }, { status: 500 });
    }
}

// POST update for a specific Date and Shift
export async function POST(req: Request) {
    const client = await pool.connect();
    try {
        const { tanggal, shift_id, karyawan_ids, superior_id } = await req.json(); // karyawan_ids is array of strings

        await client.query('BEGIN');
        
        // Jika ada superior_id (artinya user adalah SPV/Koordinator), batasi hak hapus hanya untuk bawahan mereka
        let subordinateFilter = "";
        let subordinateValues: any[] = [];
        let placeholderOffset = 3; // $1 = tanggal, $2 = shift_id

        if (superior_id) {
            const subRes = await client.query(`
                WITH RECURSIVE subordinates AS (
                    SELECT id FROM karyawan WHERE atasan_id = $1
                    UNION
                    SELECT k.id FROM karyawan k
                    INNER JOIN subordinates s ON s.id = k.atasan_id
                ),
                delegated_karyawan AS (
                    SELECT k.id FROM karyawan k
                    INNER JOIN jabatan j ON k.jabatan_id = j.id
                    INNER JOIN schedule_delegations sd ON j.departemen_id = sd.departemen_id
                    WHERE sd.karyawan_id = $1
                )
                SELECT id FROM subordinates UNION SELECT id FROM delegated_karyawan
            `, [superior_id]);
            
            const subIds = subRes.rows.map(r => r.id);
            if (subIds.length > 0) {
                subordinateValues = subIds;
                const subPlaceholders = subIds.map((_, i) => `$${placeholderOffset + i}`).join(',');
                subordinateFilter = `AND karyawan_id IN (${subPlaceholders})`;
                placeholderOffset += subIds.length;
            } else {
                // Jika tidak punya bawahan, tidak boleh hapus data siapapun
                subordinateFilter = `AND 1=0`;
            }
        }

        // 1. Delete existing records for this tanggal & shift_id that are NOT in karyawan_ids (Hanya untuk bawahan jika SPV)
        if (karyawan_ids && karyawan_ids.length > 0) {
            // Need to build a dynamic NOT IN list
            const placeholders = karyawan_ids.map((_: any, i: number) => `$${placeholderOffset + i}`).join(',');
            await client.query(`
                DELETE FROM karyawan_shift 
                WHERE tanggal = $1 AND shift_id = $2 
                ${subordinateFilter}
                AND karyawan_id NOT IN (${placeholders})
            `, [tanggal, shift_id, ...subordinateValues, ...karyawan_ids]);
        } else {
            // Delete ALL records for this tanggal & shift_id (Hanya untuk bawahan jika SPV)
            await client.query(`
                DELETE FROM karyawan_shift 
                WHERE tanggal = $1 AND shift_id = $2
                ${subordinateFilter}
            `, [tanggal, shift_id, ...subordinateValues]);
        }

        // Cek apakah shift yang sedang di-plot adalah shift Libur/Off atau Cuti
        const targetShiftRes = await client.query(
            `SELECT id, nama_shift, jam_masuk FROM shift WHERE id = $1 LIMIT 1`,
            [shift_id]
        );
        const targetShiftName = (targetShiftRes.rows[0]?.nama_shift || '').toLowerCase();
        const isTargetOffOrLeave =
            targetShiftName.includes('libur') ||
            targetShiftName.includes('off') ||
            targetShiftName.includes('lepas') ||
            targetShiftName.includes('cuti') ||
            targetShiftName.includes('izin') ||
            !targetShiftRes.rows[0]?.jam_masuk;

        // 2. Insert or Update remaining employees
        for (const k_id of (karyawan_ids || [])) {
            // Cek otorisasi: jika SPV, pastikan ID ada di dalam bawahan
            if (superior_id && !subordinateValues.includes(k_id)) {
                continue; // Skip jika bukan bawahan
            }

            if (isTargetOffOrLeave) {
                // Jika pegawai di-plot Libur/Off/Cuti, hapus shift kerja lain di tanggal yang sama agar tidak bentrok
                await client.query(
                    `DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2 AND shift_id <> $3`,
                    [k_id, tanggal, shift_id]
                );
            } else {
                // Jika pegawai di-plot shift kerja aktif, hapus status Libur/Off di tanggal yang sama
                await client.query(
                    `DELETE FROM karyawan_shift ks
                     USING shift s
                     WHERE ks.shift_id = s.id
                       AND ks.karyawan_id = $1
                       AND ks.tanggal = $2
                       AND ks.shift_id <> $3
                       AND (LOWER(s.nama_shift) LIKE '%libur%' OR LOWER(s.nama_shift) LIKE '%off%' OR LOWER(s.nama_shift) LIKE '%lepas%' OR s.jam_masuk IS NULL)`,
                    [k_id, tanggal, shift_id]
                );
            }

            await client.query(`
                INSERT INTO karyawan_shift (karyawan_id, tanggal, shift_id) 
                VALUES ($1, $2, $3)
                ON CONFLICT (karyawan_id, tanggal, shift_id) 
                DO NOTHING
            `, [k_id, tanggal, shift_id]);
        }
        
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Board updated successfully' });
    } catch (error: any) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Error updating board', error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
