/**
 * Path: src/app/api/menus/route.ts
 * Deskripsi: Endpoint untuk mengambil semua menu (GET) dan menambah menu baru (POST).
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET() {
  try {
    // Mengambil semua menu diurutkan berdasarkan parent dan urutan
    const result = await pool.query(`
      SELECT 
        m.id, 
        m.parent_id, 
        m.nama_menu, 
        m.path, 
        m.icon, 
        m.urutan, 
        m.is_active,
        p.nama_menu as parent_name
      FROM menus m
      LEFT JOIN menus p ON m.parent_id = p.id
      ORDER BY m.urutan ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal mengambil data menu.", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parent_id, nama_menu, path, icon, urutan } = body;

    if (!nama_menu || !path) {
      return NextResponse.json({ message: "Nama menu dan Path wajib diisi." }, { status: 400 });
    }

    const query = `
      INSERT INTO menus (parent_id, nama_menu, path, icon, urutan)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [parent_id || null, nama_menu, path, icon || 'Circle', urutan || 0];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error: any) {
    console.error("Error create menu:", error);
    return NextResponse.json({ message: "Gagal menambah menu.", error: error.message }, { status: 500 });
  }
}