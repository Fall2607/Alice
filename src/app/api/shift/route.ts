import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const res = await pool.query('SELECT * FROM shift ORDER BY id ASC');
        return NextResponse.json(res.rows);
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching shift', error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { nama_shift, jam_masuk, jam_keluar, is_cross_day } = await req.json();
        const res = await pool.query(
            'INSERT INTO shift (nama_shift, jam_masuk, jam_keluar, is_cross_day) VALUES ($1, $2, $3, $4) RETURNING *',
            [nama_shift, jam_masuk, jam_keluar, is_cross_day || false]
        );
        return NextResponse.json(res.rows[0], { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error creating shift', error: error.message }, { status: 500 });
    }
}
