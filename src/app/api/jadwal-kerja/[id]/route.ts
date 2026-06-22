import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const res = await pool.query('SELECT * FROM jadwal_kerja WHERE id = $1', [id]);
        if (res.rowCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        
        const detailsRes = await pool.query(`
            SELECT jkd.id, jkd.hari, jkd.shift_id, s.nama_shift, s.jam_masuk, s.jam_keluar
            FROM jadwal_kerja_detail jkd
            LEFT JOIN shift s ON s.id = jkd.shift_id
            WHERE jkd.jadwal_kerja_id = $1
            ORDER BY jkd.hari ASC
        `, [id]);

        return NextResponse.json({ ...res.rows[0], details: detailsRes.rows });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching jadwal', error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const client = await pool.connect();
    try {
        const id = (await params).id;
        const { nama_jadwal, tipe, keterangan, details } = await req.json();
        
        await client.query('BEGIN');
        
        const res = await client.query(
            'UPDATE jadwal_kerja SET nama_jadwal = $1, tipe = $2, keterangan = $3 WHERE id = $4 RETURNING *',
            [nama_jadwal, tipe, keterangan, id]
        );
        
        if (res.rowCount === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ message: 'Jadwal not found' }, { status: 404 });
        }

        // Update details if provided
        if (details && Array.isArray(details)) {
            await client.query('DELETE FROM jadwal_kerja_detail WHERE jadwal_kerja_id = $1', [id]);
            for (const d of details) {
                await client.query(
                    'INSERT INTO jadwal_kerja_detail (jadwal_kerja_id, hari, shift_id) VALUES ($1, $2, $3)',
                    [id, d.hari, d.shift_id || null]
                );
            }
        }
        
        await client.query('COMMIT');
        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Error updating jadwal', error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const res = await pool.query('DELETE FROM jadwal_kerja WHERE id = $1 RETURNING *', [id]);
        
        if (res.rowCount === 0) {
            return NextResponse.json({ message: 'Jadwal not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Jadwal deleted' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting jadwal', error: error.message }, { status: 500 });
    }
}
