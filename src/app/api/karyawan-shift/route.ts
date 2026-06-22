import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(req: Request) {
    const client = await pool.connect();
    try {
        const body = await req.json();
        const payload = Array.isArray(body) ? body : [body];

        await client.query('BEGIN');
        
        for (const item of payload) {
            const { karyawan_id, tanggal, shift_id } = item;
            if (!shift_id) {
                await client.query('DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2', [karyawan_id, tanggal]);
            } else {
                await client.query(`
                    INSERT INTO karyawan_shift (karyawan_id, tanggal, shift_id) 
                    VALUES ($1, $2, $3)
                    ON CONFLICT (karyawan_id, tanggal) 
                    DO UPDATE SET shift_id = EXCLUDED.shift_id
                `, [karyawan_id, tanggal, shift_id]);
            }
        }
        
        await client.query('COMMIT');
        return NextResponse.json({ message: 'Shift(s) successfully plotted', count: payload.length });
    } catch (error: any) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: 'Error setting shift', error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
