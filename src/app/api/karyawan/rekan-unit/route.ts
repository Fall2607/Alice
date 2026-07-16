import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const karyawanId = searchParams.get('karyawan_id'); // ID si Pengaju

    if (!karyawanId) {
      return NextResponse.json({ message: "karyawan_id diperlukan" }, { status: 400 });
    }

    // Ambil atasan_id dari pengaju, lalu cari semua karyawan yang atasan_id nya SAMA (termasuk dirinya sendiri, nanti difilter di frontend)
    const result = await pool.query(`
      SELECT k.id, k.nama_lengkap, k.nik, j.nama_jabatan
      FROM karyawan k
      LEFT JOIN jabatan j ON k.jabatan_id = j.id
      WHERE k.atasan_id = (SELECT atasan_id FROM karyawan WHERE id = $1)
      ORDER BY k.nama_lengkap ASC
    `, [karyawanId]);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Error fetching rekan unit:", err);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
