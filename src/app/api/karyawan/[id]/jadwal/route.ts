import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const { jadwal_kerja_id } = await req.json();
        
        const res = await pool.query(
            'UPDATE karyawan SET jadwal_kerja_id = $1 WHERE id = $2 RETURNING *',
            [jadwal_kerja_id || null, id]
        );
        
        if (res.rowCount === 0) {
            return NextResponse.json({ message: 'Karyawan not found' }, { status: 404 });
        }
        
        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ message: 'Error assigning jadwal', error: error.message }, { status: 500 });
    }
}
