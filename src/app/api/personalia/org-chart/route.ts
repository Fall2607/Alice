import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: Request) {
  try {
    const res = await pool.query(`
      SELECT 
        k.id, 
        k.nama_lengkap, 
        k.atasan_id,
        k.jenis_kelamin,
        d.nama_departemen,
        lj.nama_level,
        k.jabatan_id
      FROM karyawan k 
      LEFT JOIN jabatan j ON k.jabatan_id = j.id 
      LEFT JOIN departemen d ON j.departemen_id = d.id 
      LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      WHERE k.status_karyawan = 'Aktif'
      ORDER BY lj.nama_level ASC, k.nama_lengkap ASC
    `);

    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error("Org Chart API Error:", error.message);
    return NextResponse.json(
      { message: "Gagal memuat data struktur organisasi." },
      { status: 500 }
    );
  }
}
