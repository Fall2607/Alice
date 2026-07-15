import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
    try {
        const query = `
            SELECT 
                sd.id,
                sd.karyawan_id,
                k.nama_lengkap as nama_karyawan,
                sd.departemen_id,
                d.nama_departemen,
                sd.created_at
            FROM schedule_delegations sd
            JOIN karyawan k ON sd.karyawan_id = k.id
            JOIN departemen d ON sd.departemen_id = d.id
            ORDER BY sd.created_at DESC
        `;
        const res = await pool.query(query);
        return NextResponse.json(res.rows);
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching delegations', error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const client = await pool.connect();
    try {
        const { karyawan_id, departemen_ids } = await req.json();
        
        if (!karyawan_id || !departemen_ids || !Array.isArray(departemen_ids) || departemen_ids.length === 0) {
            return NextResponse.json({ message: 'Karyawan dan setidaknya satu Departemen harus diisi' }, { status: 400 });
        }

        await client.query('BEGIN');
        
        const insertedData = [];
        let duplicateCount = 0;

        for (const depId of departemen_ids) {
            try {
                const query = `
                    INSERT INTO schedule_delegations (karyawan_id, departemen_id)
                    VALUES ($1, $2)
                    RETURNING *
                `;
                const res = await client.query(query, [karyawan_id, depId]);
                insertedData.push(res.rows[0]);
            } catch (err: any) {
                if (err.code === '23505') { // Unique violation
                    duplicateCount++;
                } else {
                    throw err;
                }
            }
        }
        
        await client.query('COMMIT');
        
        if (insertedData.length === 0 && duplicateCount > 0) {
            return NextResponse.json({ message: 'Semua delegasi yang dipilih sudah ada untuk karyawan tersebut.' }, { status: 400 });
        }

        return NextResponse.json({ 
            message: 'Berhasil menyimpan delegasi',
            inserted: insertedData,
            duplicatesSkipped: duplicateCount
        });
    } catch (error: any) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Error creating delegation', error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
