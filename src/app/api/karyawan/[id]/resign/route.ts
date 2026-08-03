import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Parse JSON body
    const body = await request.json();
    const { tanggal_keluar, alasan_resign } = body;

    if (!tanggal_keluar || !alasan_resign) {
      return NextResponse.json(
        { message: "Tanggal keluar dan alasan resign wajib diisi." },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Update the karyawan record
    const result = await pool.query(
      `UPDATE karyawan 
       SET is_active = false, 
           tanggal_keluar = $1, 
           alasan_resign = $2 
       WHERE id = $3 
       RETURNING id`,
      [tanggal_keluar, alasan_resign, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Karyawan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Berhasil memberhentikan karyawan.",
      success: true,
    });
  } catch (error: any) {
    console.error("Error resigning karyawan:", error.message);
    return NextResponse.json(
      { message: "Gagal memberhentikan karyawan." },
      { status: 500 }
    );
  }
}
