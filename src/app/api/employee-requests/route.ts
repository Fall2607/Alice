// File: src/app/api/employee-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        er.id,
        er.request_date,
        er.quantity,
        er.type,
        er.urgency,
        er.status,
        er.mbti_results,
        j.nama_job AS position,          -- Mengambil nama dari tabel 'job'
        k.nama_lengkap AS requester,
        d.nama_departemen AS department,
        lj.nama_level AS level
      FROM employee_requests er
      LEFT JOIN job j ON er.job_id = j.id -- JOIN ke tabel 'job'
      LEFT JOIN karyawan k ON er.requester_nip = k.nip
      LEFT JOIN jabatan kj ON k.jabatan_id = kj.id
      LEFT JOIN departemen d ON kj.departemen_id = d.id
      LEFT JOIN level_jabatan lj ON kj.level_jabatan_id = lj.id
      ORDER BY
        CASE er.status
          WHEN 'Menunggu Persetujuan' THEN 1
          WHEN 'Disetujui' THEN 2
          WHEN 'Ditolak' THEN 3
          ELSE 4
        END,
        er.request_date DESC;
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("API Error - Gagal mengambil request pegawai:", error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ message: "Gagal mengambil data", error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      requester_nip,
      job_id, // Menggunakan job_id
      quantity,
      type,
      urgency,
      mbti_results,
    } = await request.json();

    if ( !requester_nip || !job_id || !quantity || !type || !urgency ) {
      return NextResponse.json( { message: "Data dasar (requester, posisi, jumlah, tipe, urgensi) wajib diisi." }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO employee_requests (
        requester_nip, job_id, quantity, type, urgency, mbti_results
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [requester_nip, job_id, quantity, type, urgency, mbti_results]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("API Error - Gagal membuat request pegawai:", error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
    if (error instanceof Error && 'code' in error && error.code === '23503') {
        return NextResponse.json({ message: "Gagal: NIP Requester atau ID Posisi Jabatan tidak valid.", error: errorMessage }, { status: 400 });
    }
    return NextResponse.json({ message: "Gagal membuat request baru", error: errorMessage }, { status: 500 });
  }
}

