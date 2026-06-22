import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const { nama_shift, jam_masuk, jam_keluar, is_cross_day } = await req.json();
        
        const res = await pool.query(
            'UPDATE shift SET nama_shift = $1, jam_masuk = $2, jam_keluar = $3, is_cross_day = $4 WHERE id = $5 RETURNING *',
            [nama_shift, jam_masuk, jam_keluar, is_cross_day || false, id]
        );
        
        if (res.rowCount === 0) {
            return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
        }
        
        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ message: 'Error updating shift', error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const res = await pool.query('DELETE FROM shift WHERE id = $1 RETURNING *', [id]);
        
        if (res.rowCount === 0) {
            return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Shift deleted' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting shift', error: error.message }, { status: 500 });
    }
}
