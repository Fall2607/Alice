/**
 * Path: src/app/api/job-openings/route.ts
 * Deskripsi: API untuk mengambil data lowongan pekerjaan dengan penghitung kandidat otomatis.
 * Perbaikan: Memastikan subquery applicant_count menggunakan job_opening_id yang benar.
 */

import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";

// Memaksa route ini agar selalu dirender secara dinamis
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    // --- LANGKAH 1: AUTO-CLOSE LOWONGAN KADALUARSA ---
    await client.query(`
      UPDATE job_openings
      SET status = 'Closed', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'Published'
      AND closing_date IS NOT NULL
      AND closing_date < CURRENT_DATE
    `);

    // --- LANGKAH 2: AMBIL DATA DENGAN JUMLAH PELAMAR ---
    // Subquery menghitung jumlah baris di application_status yang merujuk ke ID lowongan ini.
    let query = `
      SELECT
        jo.id,
        jo.title,
        jo.status,
        jo.posted_date,
        jo.closing_date,
        j.jenis_job AS category,
        j.nama_job AS position_name,
        (
          SELECT COUNT(*)::int 
          FROM application_status 
          WHERE job_opening_id = jo.id
        ) AS applicant_count
      FROM job_openings jo
      LEFT JOIN job j ON jo.job_id = j.id
    `;

    const values: any[] = [];

    if (statusFilter) {
      query += ` WHERE jo.status::text = $1`;
      values.push(statusFilter);
    }

    query += ` ORDER BY jo.posted_date DESC, jo.created_at DESC`;

    const result = await client.query(query, values);

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("API Error [GET /api/job-openings]:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      { message: "Gagal mengambil data lowongan", error: errorMessage },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}