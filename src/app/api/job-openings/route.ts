/**
 * Path: src/app/api/job-openings/route.ts
 * Deskripsi: API untuk mengambil data lowongan pekerjaan dengan penghitung kandidat otomatis.
 * Perbaikan: Memastikan subquery applicant_count menggunakan job_opening_id yang benar.
 */

import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";
import { verifyAdminRequest } from "@/app/lib/recruitmentAuth";

// Memaksa route ini agar selalu dirender secara dinamis
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const scope = searchParams.get('scope');

    // --- LANGKAH 1: AUTO-CLOSE LOWONGAN KADALUARSA ---
    await client.query(`
      UPDATE job_openings
      SET status = 'Closed', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'Published'
      AND closing_date IS NOT NULL
      AND closing_date < CURRENT_DATE
    `);

    if (scope === "admin") {
      const user = await verifyAdminRequest(req);
      if (!user) {
        return NextResponse.json(
          { message: "Sesi admin tidak valid." },
          { status: 401 }
        );
      }
      if (!user.canViewLowongan) {
        return NextResponse.json(
          { message: "Anda tidak memiliki izin mengakses daftar lowongan." },
          { status: 403 }
        );
      }

      if (user.isHcLowonganManager) {
        const hcResult = await client.query(`
          SELECT
            jo.id,
            jo.title,
            jo.status,
            jo.posted_date,
            jo.closing_date,
            jo.request_id,
            j.jenis_job AS category,
            j.nama_job AS position_name,
            req_k.nama_lengkap AS requester_name,
            lj.nama_level AS requester_level,
            d.nama_departemen AS requester_department,
            jeb.nama_bundle AS essay_bundle_name,
            (
              SELECT COUNT(*)::int
              FROM application_status
              WHERE job_opening_id = jo.id
            ) AS applicant_count
          FROM job_openings jo
          LEFT JOIN job j ON jo.job_id = j.id
          LEFT JOIN employee_requests er ON jo.request_id = er.id
          LEFT JOIN karyawan req_k ON er.requester_id = req_k.id
          LEFT JOIN jabatan req_j ON req_k.jabatan_id = req_j.id
          LEFT JOIN level_jabatan lj ON req_j.level_jabatan_id = lj.id
          LEFT JOIN departemen d ON req_j.departemen_id = d.id
          LEFT JOIN job_opening_essay_bundles joeb ON joeb.job_opening_id = jo.id
          LEFT JOIN job_essay_bundles jeb ON joeb.bundle_id = jeb.id AND jeb.is_active = true
          ORDER BY jo.posted_date DESC NULLS LAST, jo.created_at DESC
        `);
        return NextResponse.json({
          can_manage_lowongan: true,
          jobs: hcResult.rows,
        });
      }

      if (!user.karyawanId) {
        return NextResponse.json({ can_manage_lowongan: false, jobs: [] });
      }

      const unitResult = await client.query(
        `WITH RECURSIVE subordinates AS (
           SELECT id, 0 AS depth
           FROM public.karyawan
           WHERE id = $1
           UNION ALL
           SELECT k.id, s.depth + 1
           FROM public.karyawan k
           INNER JOIN subordinates s ON k.atasan_id = s.id
           WHERE s.depth < 15
         )
         SELECT
           jo.id,
           jo.title,
           jo.status,
           jo.posted_date,
           jo.closing_date,
           jo.request_id,
           j.jenis_job AS category,
           j.nama_job AS position_name,
           req_k.nama_lengkap AS requester_name,
           lj.nama_level AS requester_level,
           d.nama_departemen AS requester_department,
           jeb.nama_bundle AS essay_bundle_name,
           (
             SELECT COUNT(*)::int
             FROM application_status
             WHERE job_opening_id = jo.id
           ) AS applicant_count
         FROM job_openings jo
         INNER JOIN employee_requests er ON jo.request_id = er.id
         INNER JOIN subordinates sub ON er.requester_id = sub.id
         LEFT JOIN job j ON jo.job_id = j.id
         LEFT JOIN karyawan req_k ON er.requester_id = req_k.id
         LEFT JOIN jabatan req_j ON req_k.jabatan_id = req_j.id
         LEFT JOIN level_jabatan lj ON req_j.level_jabatan_id = lj.id
         LEFT JOIN departemen d ON req_j.departemen_id = d.id
         LEFT JOIN job_opening_essay_bundles joeb ON joeb.job_opening_id = jo.id
         LEFT JOIN job_essay_bundles jeb ON joeb.bundle_id = jeb.id AND jeb.is_active = true
         ORDER BY jo.posted_date DESC NULLS LAST, jo.created_at DESC`,
        [user.karyawanId]
      );

      return NextResponse.json({
        can_manage_lowongan: false,
        jobs: unitResult.rows,
      });
    }

    // --- LANGKAH 2: AMBIL DATA PUBLIK (Halaman Karir) ---
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