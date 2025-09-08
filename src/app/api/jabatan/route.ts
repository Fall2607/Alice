// File: src/app/api/jabatan/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Tipe data untuk request POST/PUT
interface JabatanInput {
  departemen_id: number;
  level_jabatan_id: number;
}
// Get all jabatan with department and level names
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        j.id,
        j.departemen_id,
        d.nama_departemen,
        j.level_jabatan_id,
        lj.nama_level
      FROM jabatan j
      JOIN departemen d ON j.departemen_id = d.id
      JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      ORDER BY j.id ASC
    `);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Error fetching jabatan:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error fetching jabatan", error: errorMessage },
      { status: 500 }
    );
  }
}

// POST jabatan (create or get existing)
export async function POST(request: Request) {
  try {
    const { departemen_id, level_jabatan_id } = await request.json();

    if (!departemen_id || !level_jabatan_id) {
      return NextResponse.json(
        { message: "Departemen dan Level Jabatan wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Coba cari dulu apakah kombinasi sudah ada
    let result = await pool.query(
      "SELECT id FROM jabatan WHERE departemen_id = $1 AND level_jabatan_id = $2",
      [departemen_id, level_jabatan_id]
    );

    // 2. Jika tidak ditemukan, buat yang baru
    if (result.rows.length === 0) {
      result = await pool.query(
        "INSERT INTO jabatan (departemen_id, level_jabatan_id) VALUES ($1, $2) RETURNING id",
        [departemen_id, level_jabatan_id]
      );
    }

    // 3. Kembalikan ID yang ditemukan atau yang baru dibuat
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal memproses jabatan", error: (error as Error).message },
      { status: 500 }
    );
  }
}
