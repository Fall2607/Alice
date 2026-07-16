import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const karyawanId = searchParams.get('karyawan_id');
    const bulan = searchParams.get('bulan'); // format YYYY-MM

    if (!karyawanId || !bulan) {
      return NextResponse.json({ message: "karyawan_id dan bulan diperlukan" }, { status: 400 });
    }

    // Ambil jadwal shift seluruh rekan di bawah atasan yang sama, pada bulan tersebut
    const result = await pool.query(`
      SELECT 
        ks.id as karyawan_shift_id,
        ks.tanggal,
        k.id as karyawan_id,
        k.nama_lengkap,
        s.id as shift_id,
        s.nama_shift
      FROM karyawan_shift ks
      JOIN karyawan k ON k.id = ks.karyawan_id
      LEFT JOIN shift s ON s.id = ks.shift_id
      WHERE k.atasan_id = (SELECT atasan_id FROM karyawan WHERE id = $1)
        AND ks.tanggal LIKE $2 || '%'
      ORDER BY ks.tanggal ASC, k.nama_lengkap ASC
    `, [karyawanId, bulan]);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Error fetching jadwal unit:", err);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
