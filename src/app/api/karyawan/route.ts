import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Tipe data untuk input Karyawan (diperbarui untuk UUID)
interface KaryawanInput {
  id?: string; // UUID (opsional saat input)
  nip: string;
  nama_lengkap: string;
  nik: string;
  profesi?: string | null;
  sip?: string | null;
  masa_berlaku_sip?: string | null;
  handphone?: string | null;
  email?: string | null;
  tanggal_lahir?: string | null;
  jenis_kelamin?: string | null;
  alamat?: string | null;
  tanggal_masuk?: string | null;
  status_kepegawaian?: string | null;
  gaji_pokok?: number | null;
  jabatan_id?: string | null; // Sekarang UUID (string)
  user_id?: string | null; // Sekarang UUID (string)
  atasan_id?: string | null; // Sekarang UUID (string), menggantikan atasan_nip
}

// Handler untuk GET (mendapatkan semua karyawan)
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        k.id, -- Primary Key UUID
        k.nip,
        k.nama_lengkap,
        k.nik,
        k.profesi,
        k.sip,
        k.masa_berlaku_sip,
        k.handphone,
        k.email,
        k.tanggal_lahir,
        k.jenis_kelamin,
        k.alamat,
        k.tanggal_masuk,
        k.status_kepegawaian,
        k.gaji_pokok,
        k.jabatan_id, -- UUID
        d.nama_departemen,
        lj.nama_level,
        k.user_id, -- UUID
        k.atasan_id, -- Menggunakan ID UUID, bukan NIP
        atasan.nama_lengkap AS nama_atasan,
        CASE WHEN k.face_descriptor IS NOT NULL THEN true ELSE false END AS has_face_descriptor
      FROM karyawan k
      LEFT JOIN jabatan j ON k.jabatan_id = j.id
      LEFT JOIN departemen d ON j.departemen_id = d.id
      LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      LEFT JOIN karyawan atasan ON k.atasan_id = atasan.id
      ORDER BY k.nama_lengkap ASC
    `);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Error fetching karyawan:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error fetching karyawan", error: errorMessage },
      { status: 500 },
    );
  }
}

// Handler untuk POST (membuat karyawan baru)
export async function POST(request: NextRequest) {
  try {
    const {
      nip,
      nama_lengkap,
      nik,
      profesi = null,
      sip = null,
      masa_berlaku_sip = null,
      handphone = null,
      email = null,
      tanggal_lahir = null,
      jenis_kelamin = null,
      alamat = null,
      tanggal_masuk = null,
      status_kepegawaian = null,
      gaji_pokok = null,
      jabatan_id = null,
      user_id = null,
      atasan_id = null, // Menggunakan ID UUID
    }: KaryawanInput = await request.json();

    if (!nip || !nama_lengkap || !nik) {
      return NextResponse.json(
        { message: "NIP, Nama Lengkap, dan NIK wajib diisi" },
        { status: 400 },
      );
    }

    // Query diperbarui: atasan_nip menjadi atasan_id
    const query = `
      INSERT INTO karyawan (
        nip, nama_lengkap, nik, profesi, sip, masa_berlaku_sip, handphone,
        email, tanggal_lahir, jenis_kelamin, alamat, tanggal_masuk,
        status_kepegawaian, gaji_pokok, jabatan_id, user_id, atasan_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *;
    `;

    const values = [
      nip,
      nama_lengkap,
      nik,
      profesi,
      sip,
      masa_berlaku_sip,
      handphone,
      email,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      tanggal_masuk,
      status_kepegawaian,
      gaji_pokok,
      jabatan_id,
      user_id,
      atasan_id,
    ];

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("Error creating karyawan:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";

    // Cek error duplikasi atau foreign key
    if (errorMessage.includes("duplicate key value")) {
      return NextResponse.json(
        {
          message: "Error: NIP, NIK, atau Email sudah terdaftar.",
          error: errorMessage,
        },
        { status: 409 },
      );
    }
    if (errorMessage.includes("violates foreign key constraint")) {
      return NextResponse.json(
        {
          message:
            "Error: ID Jabatan, User, atau Atasan tidak valid (UUID mismatch).",
          error: errorMessage,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Error creating karyawan", error: errorMessage },
      { status: 500 },
    );
  }
}
