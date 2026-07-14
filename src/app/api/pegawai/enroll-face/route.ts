import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const { nip, face_descriptor } = await request.json();

    if (!nip || !face_descriptor) {
      return NextResponse.json({ message: "NIP dan face_descriptor diperlukan." }, { status: 400 });
    }

    // Ubah ke format Multi-Descriptor (2D Array)
    let descriptorToSave = face_descriptor;
    if (typeof face_descriptor === 'string') {
        descriptorToSave = JSON.parse(face_descriptor);
    }
    
    // Pastikan selalu disimpan sebagai array of arrays (koleksi wajah)
    const descriptorStr = JSON.stringify([descriptorToSave]);

    // Update kolom face_descriptor untuk karyawan dengan nip yang sesuai
    const updateRes = await pool.query(
      `UPDATE karyawan SET face_descriptor = $1 WHERE nip = $2 RETURNING id, nama_lengkap`,
      [descriptorStr, nip]
    );

    if (updateRes.rowCount === 0) {
      return NextResponse.json({ message: "Karyawan dengan NIP tersebut tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Data wajah berhasil didaftarkan.",
      data: updateRes.rows[0]
    });
  } catch (error: any) {
    console.error(`Enroll Face API Error:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan data wajah.", error: error.message }, 
      { status: 500 }
    );
  }
}
