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
  jadwal_kerja_id?: number | null;
  rekening_bsi?: string | null;
  alamat_domisili?: string | null;
  sisa_cuti?: number | null;
}

// Handler untuk GET (mendapatkan semua karyawan)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const superiorId = searchParams.get('superior_id');
    const departemenId = searchParams.get('departemen_id');

    let query = `
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
        k.rekening_bsi,
        k.alamat_domisili,
        k.jabatan_id, -- UUID
        d.nama_departemen,
        lj.nama_level,
        k.user_id, -- UUID
        k.atasan_id, -- Menggunakan ID UUID, bukan NIP
        atasan.nama_lengkap AS nama_atasan,
        k.jadwal_kerja_id,
        jk.nama_jadwal,
        k.sisa_cuti,
        (SELECT COALESCE(SUM(jumlah_hari), 0) FROM pengajuan_cuti pc WHERE pc.karyawan_id = k.id AND pc.status = 'Disetujui' AND EXTRACT(YEAR FROM pc.tanggal_mulai) = EXTRACT(YEAR FROM CURRENT_DATE)) AS cuti_terpakai,
        CASE WHEN k.face_descriptor IS NOT NULL THEN true ELSE false END AS has_face_descriptor
      FROM karyawan k
      LEFT JOIN jabatan j ON k.jabatan_id = j.id
      LEFT JOIN departemen d ON j.departemen_id = d.id
      LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      LEFT JOIN karyawan atasan ON k.atasan_id = atasan.id
      LEFT JOIN jadwal_kerja jk ON k.jadwal_kerja_id = jk.id
    `;
    const values: any[] = [];

    if (superiorId) {
      query = `
        WITH RECURSIVE subordinates AS (
            SELECT id FROM karyawan WHERE atasan_id = $1
            UNION
            SELECT k.id FROM karyawan k
            INNER JOIN subordinates s ON s.id = k.atasan_id
        ),
        delegated_karyawan AS (
            SELECT k.id FROM karyawan k
            INNER JOIN jabatan j ON k.jabatan_id = j.id
            INNER JOIN schedule_delegations sd ON j.departemen_id = sd.departemen_id
            WHERE sd.karyawan_id = $1
        )
        ${query}
        WHERE k.id IN (SELECT id FROM subordinates UNION SELECT id FROM delegated_karyawan)
      `;
      values.push(superiorId);
    }

    if (departemenId) {
      if (values.length > 0) {
        query += ` AND d.id = $${values.length + 1}`;
      } else {
        query += ` WHERE d.id = $${values.length + 1}`;
      }
      values.push(departemenId);
    }

    query += ` ORDER BY k.nama_lengkap ASC`;

    const result = await pool.query(query, values);
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
      rekening_bsi = null,
      alamat_domisili = null,
      jabatan_id = null,
      user_id = null,
      atasan_id = null, // Menggunakan ID UUID
      jadwal_kerja_id = null,
      sisa_cuti = 12, // Default 12 hari
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
        status_kepegawaian, gaji_pokok, jabatan_id, user_id, atasan_id, jadwal_kerja_id,
        rekening_bsi, alamat_domisili, sisa_cuti
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
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
      jadwal_kerja_id,
      rekening_bsi,
      alamat_domisili,
      sisa_cuti,
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
