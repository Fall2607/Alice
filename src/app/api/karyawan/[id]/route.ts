import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Tipe data untuk input Karyawan (diperbarui untuk UUID)
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
  jabatan_id?: string | null; // UUID (string)
  user_id?: string | null; // UUID (string)
  atasan_id?: string | null; // UUID (string), penggantikan atasan_nip
}

/**
 * GET: Mendapatkan detail satu karyawan berdasarkan ID (UUID)
 * Mengapa ID? Agar URL tetap valid meskipun NIP karyawan tersebut diperbaiki/diubah.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT
        k.id, k.nip, k.nama_lengkap, k.nik, k.profesi, k.sip, k.masa_berlaku_sip,
        k.handphone, k.email, k.tanggal_lahir, k.jenis_kelamin, k.alamat,
        k.tanggal_masuk, k.status_kepegawaian, k.gaji_pokok, k.jabatan_id,
        d.nama_departemen, lj.nama_level, k.user_id, k.atasan_id,
        atasan.nama_lengkap AS nama_atasan,
        CASE WHEN k.face_descriptor IS NOT NULL THEN true ELSE false END AS has_face_descriptor
      FROM karyawan k
      LEFT JOIN jabatan j ON k.jabatan_id = j.id
      LEFT JOIN departemen d ON j.departemen_id = d.id
      LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      LEFT JOIN karyawan atasan ON k.atasan_id = atasan.id
      WHERE k.id = $1 -- Menggunakan PK ID untuk performa terbaik
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Karyawan dengan ID ${id} tidak ditemukan` },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching detail karyawan:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error fetching karyawan", error: errorMessage },
      { status: 500 },
    );
  }
}

/**
 * PUT: Memperbarui seluruh data karyawan
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const { id } = await params;
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
      atasan_id,
    }: KaryawanInput = await request.json();

    if (!nama_lengkap || !nik) {
      return NextResponse.json(
        { message: "Nama Lengkap dan NIK wajib diisi" },
        { status: 400 },
      );
    }

    const query = `
      UPDATE karyawan SET
        nama_lengkap = $1, nik = $2, profesi = $3, sip = $4, masa_berlaku_sip = $5,
        handphone = $6, email = $7, tanggal_lahir = $8, jenis_kelamin = $9,
        alamat = $10, tanggal_masuk = $11, status_kepegawaian = $12,
        gaji_pokok = $13, jabatan_id = $14, user_id = $15, atasan_id = $16
      WHERE id = $17 -- Update berdasarkan PK ID
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
      atasan_id,
      id,
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Karyawan tidak ditemukan` },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating karyawan:", err);
    return NextResponse.json(
      { message: "Error updating karyawan", error: (err as Error).message },
      { status: 500 },
    );
  }
}

/**
 * PATCH: Memperbarui sebagian data karyawan
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const { id } = await params;
    const body = await request.json();

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
      "atasan_id",
    ];

    const fieldsToUpdate = Object.keys(body).filter((field) =>
      validFields.includes(field as keyof KaryawanInput),
    );

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada field valid untuk diupdate" },
        { status: 400 },
      );
    }

    const setQueryParts = fieldsToUpdate.map(
      (field, index) => `${field} = $${index + 1}`,
    );
    const values = fieldsToUpdate.map((field) => body[field]);
    values.push(id);

    const query = `UPDATE karyawan SET ${setQueryParts.join(", ")} WHERE id = $${values.length} RETURNING *;`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0)
      return NextResponse.json(
        { message: "Karyawan tidak ditemukan" },
        { status: 404 },
      );
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json(
      { message: "Error patching karyawan", error: (err as Error).message },
      { status: 500 },
    );
  }
}

/**
 * DELETE: Menghapus data karyawan
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      "DELETE FROM karyawan WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rowCount === 0)
      return NextResponse.json(
        { message: "Karyawan tidak ditemukan" },
        { status: 404 },
      );
    return NextResponse.json({ message: "Karyawan berhasil dihapus" });
  } catch (err) {
    return NextResponse.json(
      { message: "Error deleting karyawan", error: (err as Error).message },
      { status: 500 },
    );
  }
}
