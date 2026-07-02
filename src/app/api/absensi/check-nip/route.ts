import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { nip } = await request.json();

    if (!nip) {
      return NextResponse.json({ message: "NIP wajib diisi." }, { status: 400 });
    }

    const queryStr = `SELECT id, nama_lengkap FROM karyawan WHERE nip = $1 LIMIT 1`;
    const karyawanRes = await pool.query(queryStr, [nip]);

    if (karyawanRes.rows.length === 0) {
      return NextResponse.json({ message: "NIP tidak ditemukan atau tidak valid." }, { status: 404 });
    }

    const karyawan = karyawanRes.rows[0];

    return NextResponse.json({
      id: karyawan.id,
      nama_lengkap: karyawan.nama_lengkap
    }, { status: 200 });

  } catch (error) {
    console.error("Error checking NIP:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal." }, { status: 500 });
  }
}
