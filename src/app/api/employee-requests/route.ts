import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Interface untuk menangani error dari PostgreSQL secara type-safe
interface DatabaseError extends Error {
  code?: string;
  detail?: string;
}

/**
 * GET: Mengambil semua permintaan pegawai.
 * Relasi diubah dari NIP ke ID (UUID) karyawan.
 */
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
        j.nama_job AS position,
        k.nama_lengkap AS requester,
        d.nama_departemen AS department,
        lj.nama_level AS level
      FROM employee_requests er
      LEFT JOIN job j ON er.job_id = j.id
      -- Menghubungkan menggunakan ID (UUID), bukan NIP
      LEFT JOIN karyawan k ON er.requester_id = k.id 
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
  } catch (error: unknown) {
    console.error("API Error - Gagal mengambil request pegawai:", error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui";
    return NextResponse.json(
      { message: "Gagal mengambil data", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST: Membuat permintaan pegawai baru.
 * requester_id harus berupa UUID yang valid dari tabel karyawan.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Destructuring dengan tipe data eksplisit (UUID sebagai string)
    const {
      requester_id,
      job_id,
      quantity,
      type,
      urgency,
      mbti_results,
    }: {
      requester_id: string; // UUID karyawan
      job_id: string;        // UUID job
      quantity: number;
      type: string;
      urgency: string;
      mbti_results?: string[];
    } = body;

    // Validasi input wajib
    if (!requester_id || !job_id || !quantity || !type || !urgency) {
      return NextResponse.json(
        { message: "Data dasar (requester_id, job_id, jumlah, tipe, urgensi) wajib diisi." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO employee_requests (
        requester_id, job_id, quantity, type, urgency, mbti_results
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [requester_id, job_id, quantity, type, urgency, mbti_results]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    console.error("API Error - Gagal membuat request pegawai:", error);

    if (error instanceof Error) {
      const dbError = error as DatabaseError;

      // Kode '23503' adalah foreign_key_violation di PostgreSQL
      // Ini terjadi jika requester_id atau job_id tidak ada di tabel induknya
      if (dbError.code === "23503") {
        return NextResponse.json(
          {
            message: "Gagal: ID Requester (Karyawan) atau ID Job tidak valid.",
            error: dbError.message,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: "Gagal membuat request baru", error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}