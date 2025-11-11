// File: src/app/api/job-openings/route.ts
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

/**
 * GET: Mengambil semua data lowongan pekerjaan yang ada.
 */
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        jo.id,
        jo.title,
        jo.status,
        jo.posted_date,
        jo.closing_date,
        j.jenis_job AS category
      FROM job_openings jo
      LEFT JOIN job j ON jo.job_id = j.id
      ORDER BY jo.created_at DESC;
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("API Error - Gagal mengambil lowongan:", error);
    return NextResponse.json({ message: "Gagal mengambil data lowongan" }, { status: 500 });
  }
}