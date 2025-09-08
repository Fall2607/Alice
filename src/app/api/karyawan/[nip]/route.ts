// File: src/app/api/karyawan/[nip]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Tipe data untuk input Karyawan (bisa null untuk beberapa field)
interface KaryawanInput {
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
  jabatan_id?: number | null;
  user_id?: number | null;
  atasan_nip?: string | null;
}

// Handler untuk GET (mendapatkan satu karyawan by NIP)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nip: string }> | { nip: string } }
) {
  try {
    const { nip } = await params;

    const result = await pool.query(
      `
      SELECT
        k.nip, k.nama_lengkap, k.nik, k.profesi, k.sip, k.masa_berlaku_sip,
        k.handphone, k.email, k.tanggal_lahir, k.jenis_kelamin, k.alamat,
        k.tanggal_masuk, k.status_kepegawaian, k.gaji_pokok, j.id as jabatan_id,
        d.nama_departemen, lj.nama_level, k.user_id, k.atasan_nip,
        atasan.nama_lengkap AS nama_atasan
      FROM karyawan k
      LEFT JOIN jabatan j ON k.jabatan_id = j.id
      LEFT JOIN departemen d ON j.departemen_id = d.id
      LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      LEFT JOIN karyawan atasan ON k.atasan_nip = atasan.nip
      WHERE k.nip = $1
    `,
      [nip]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Karyawan dengan NIP ${nip} tidak ditemukan` },
        { status: 404 }
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error fetching karyawan", error: errorMessage },
      { status: 500 }
    );
  }
}

// Handler untuk PUT (memperbarui seluruh data karyawan by NIP)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ nip: string }> | { nip: string } }
) {
  try {
    const { nip } = await params;

    const {
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
      atasan_nip,
    }: KaryawanInput = await request.json();

    if (!nama_lengkap || !nik) {
      return NextResponse.json(
        { message: "Nama Lengkap dan NIK wajib diisi" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE karyawan SET
        nama_lengkap = $1, nik = $2, profesi = $3, sip = $4, masa_berlaku_sip = $5,
        handphone = $6, email = $7, tanggal_lahir = $8, jenis_kelamin = $9,
        alamat = $10, tanggal_masuk = $11, status_kepegawaian = $12,
        gaji_pokok = $13, jabatan_id = $14, user_id = $15, atasan_nip = $16
      WHERE nip = $17
      RETURNING *;
    `;
    const values = [
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
      atasan_nip,
      nip,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Karyawan dengan NIP ${nip} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error updating karyawan", error: errorMessage },
      { status: 500 }
    );
  }
}

// Handler untuk PATCH (memperbarui sebagian data karyawan by NIP)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ nip: string }> | { nip: string } }
) {
  try {
    const { nip } = await params;
    const body = await request.json();

    // Daftar field yang diizinkan untuk di-update
    const validFields: (keyof KaryawanInput)[] = [
      "nama_lengkap",
      "nik",
      "profesi",
      "sip",
      "masa_berlaku_sip",
      "handphone",
      "email",
      "tanggal_lahir",
      "jenis_kelamin",
      "alamat",
      "tanggal_masuk",
      "status_kepegawaian",
      "gaji_pokok",
      "jabatan_id",
      "user_id",
      "atasan_nip",
    ];

    // Filter field dari body request yang valid dan ada di daftar
    const fieldsToUpdate = Object.keys(body).filter((field) =>
      validFields.includes(field as keyof KaryawanInput)
    );

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada field valid yang dikirim untuk diupdate" },
        { status: 400 }
      );
    }

    // Buat query SET secara dinamis
    const setQueryParts = fieldsToUpdate.map(
      (field, index) => `${field} = $${index + 1}`
    );
    const setQueryString = setQueryParts.join(", ");

    // Ambil values sesuai urutan field yang valid
    const values = fieldsToUpdate.map((field) => body[field]);
    values.push(nip); // Tambahkan NIP di akhir untuk klausa WHERE

    const query = `
      UPDATE karyawan
      SET ${setQueryString}
      WHERE nip = $${values.length}
      RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Karyawan dengan NIP ${nip} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error updating karyawan", error: errorMessage },
      { status: 500 }
    );
  }
}

// Handler untuk DELETE (menghapus karyawan by NIP)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ nip: string }> | { nip: string } }
) {
  try {
    const { nip } = await params;

    const result = await pool.query(
      "DELETE FROM karyawan WHERE nip = $1 RETURNING *",
      [nip]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: `Karyawan dengan NIP ${nip} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Karyawan dengan NIP ${nip} berhasil dihapus`,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error deleting karyawan", error: errorMessage },
      { status: 500 }
    );
  }
}
