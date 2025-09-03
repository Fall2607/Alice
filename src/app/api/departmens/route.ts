// src/app/api/departments/route.ts
// Format App Router untuk mendapatkan semua departemen dan membuat baru.

import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// Fungsi untuk menangani request GET
export async function GET() {
    try {
        const result = await pool.query('SELECT * FROM departemen ORDER BY id ASC');
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: 'Error fetching departments', error: error.message }, { status: 500 });
    }
}

// Fungsi untuk menangani request POST
export async function POST(request: Request) {
    try {
        const { nama_departemen, jenis_departemen } = await request.json();

        if (!nama_departemen || !jenis_departemen) {
            return NextResponse.json({ message: 'Nama dan jenis departemen harus diisi.' }, { status: 400 });
        }

        const result = await pool.query(
            'INSERT INTO departemen (nama_departemen, jenis_departemen) VALUES ($1, $2) RETURNING *',
            [nama_departemen, jenis_departemen]
        );
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating department', error: error.message }, { status: 500 });
    }
}
