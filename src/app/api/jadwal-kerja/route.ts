import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
    try {
        const res = await pool.query('SELECT * FROM jadwal_kerja ORDER BY id ASC');
        return NextResponse.json(res.rows);
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching jadwal', error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const client = await pool.connect();
    try {
        const { nama_jadwal, tipe, keterangan, details } = await req.json();
        
        await client.query('BEGIN');
        const res = await client.query(
            'INSERT INTO jadwal_kerja (nama_jadwal, tipe, keterangan) VALUES ($1, $2, $3) RETURNING *',
            [nama_jadwal, tipe, keterangan]
        );
        const newJadwalId = res.rows[0].id;

        if (details && Array.isArray(details)) {
            for (const d of details) {
                await client.query(
                    'INSERT INTO jadwal_kerja_detail (jadwal_kerja_id, hari, shift_id) VALUES ($1, $2, $3)',
                    [newJadwalId, d.hari, d.shift_id || null]
                );
            }
        }
        
        await client.query('COMMIT');
        return NextResponse.json(res.rows[0], { status: 201 });
    } catch (error: any) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Error creating jadwal', error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
