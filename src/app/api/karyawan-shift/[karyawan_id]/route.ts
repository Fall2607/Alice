import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ karyawan_id: string }> }) {
    try {
        const karyawan_id = (await params).karyawan_id;
        const { searchParams } = new URL(req.url);
        const monthYear = searchParams.get('month'); // format: YYYY-MM
        
        let query = 'SELECT tanggal, shift_id FROM karyawan_shift WHERE karyawan_id = $1';
        const values: any[] = [karyawan_id];
        
        if (monthYear) {
            query += ' AND tanggal LIKE $2';
            values.push(`${monthYear}-%`);
        }
        
        const res = await pool.query(query, values);
        
        // Convert array of rows to a dictionary: { "YYYY-MM-DD": shift_id }
        const shiftMap: Record<string, number> = {};
        res.rows.forEach(row => {
            shiftMap[row.tanggal] = row.shift_id;
        });
        
        return NextResponse.json(shiftMap);
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching shift data', error: error.message }, { status: 500 });
    }
}
