// src/app/api/departments/[id]/route.ts
// Format App Router untuk operasi GET by ID, PUT, dan DELETE

import { NextResponse } from 'next/server';
import pool from '@/app/lib/db'; // Path disesuaikan

// Mendefinisikan tipe untuk parameter URL
type Params = {
  id: string;
};

// Fungsi untuk menangani request GET by ID
export async function GET(request: Request, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params; // pakai await di sini
    const result = await pool.query('SELECT * FROM departemen WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: `Department with ID ${id} not found.` }, { status: 404 });
    }
    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching department', error: error.message }, { status: 500 });
  }
}


export async function PUT(request: Request, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const { nama_departemen, jenis_departemen } = await request.json();

    if (!nama_departemen || !jenis_departemen) {
      return NextResponse.json({ message: 'Nama dan jenis departemen harus diisi.' }, { status: 400 });
    }

    const result = await pool.query(
      'UPDATE departemen SET nama_departemen = $1, jenis_departemen = $2 WHERE id = $3 RETURNING *',
      [nama_departemen, jenis_departemen, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: `Department with ID ${id} not found.` }, { status: 404 });
    }
    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating department', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;
    const result = await pool.query('DELETE FROM departemen WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: `Department with ID ${id} not found.` }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Error deleting department', error: error.message }, { status: 500 });
  }
}
