// File: src/app/api/job-openings/route.ts
import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";

/**
 * GET: Mengambil data lowongan pekerjaan.
 * Mendukung filter query param, contoh: /api/job-openings?status=Published
 */
export async function GET(req: NextRequest) {
  try {
    // Gunakan nextUrl untuk parsing parameter yang lebih aman di Next.js
    const searchParams = req.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');

    let query = `
      SELECT
        jo.id,
        jo.title,
        jo.status,
        jo.posted_date,
        jo.closing_date,
        j.jenis_job AS category,
        j.nama_job AS position_name
      FROM job_openings jo
      LEFT JOIN job j ON jo.job_id = j.id
    `;

    const values: any[] = [];

    // Jika ada filter status, tambahkan klausa WHERE
    // Kita gunakan casting ::text untuk menghindari error tipe data ENUM vs String
    if (statusFilter) {
      query += ` WHERE jo.status::text = $1`;
      values.push(statusFilter);
    }

    query += ` ORDER BY jo.posted_date DESC, jo.created_at DESC`;

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows);
  } catch (error) {
    // Log error detail ke terminal server agar mudah didebug
    console.error("API Error [GET /api/job-openings]:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      { message: "Gagal mengambil data lowongan", error: errorMessage },
      { status: 500 }
    );
  }
}