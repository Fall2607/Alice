import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import {
  canUserAccessJobOpening,
  verifyAdminRequest,
} from "@/app/lib/recruitmentAuth";

export const dynamic = "force-dynamic";

/**
 * GET: Mengambil paket soal essay yang tersedia untuk job terkait serta paket yang aktif pada lowongan.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobOpeningId: string }> }
) {
  try {
    const user = await verifyAdminRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Sesi admin tidak valid." }, { status: 401 });
    }

    const { jobOpeningId } = await context.params;
    const allowed = await canUserAccessJobOpening({ user, jobOpeningId });
    if (!allowed) {
      return NextResponse.json(
        { message: "Anda tidak memiliki akses ke konfigurasi lowongan ini." },
        { status: 403 }
      );
    }

    const openingRes = await pool.query(
      `SELECT jo.id, jo.job_id, joeb.bundle_id AS selected_bundle_id
       FROM public.job_openings jo
       LEFT JOIN public.job_opening_essay_bundles joeb ON joeb.job_opening_id = jo.id
       WHERE jo.id = $1
       LIMIT 1`,
      [jobOpeningId]
    );

    if (openingRes.rows.length === 0) {
      return NextResponse.json({ message: "Lowongan tidak ditemukan." }, { status: 404 });
    }

    const { job_id: jobId, selected_bundle_id: selectedBundleId } = openingRes.rows[0];

    const bundlesRes = await pool.query(
      `SELECT
         b.id,
         b.nama_bundle,
         b.durasi_menit,
         b.is_active,
         COUNT(q.id)::int AS question_count
       FROM public.job_essay_bundles b
       LEFT JOIN public.job_essay_questions q ON q.bundle_id = b.id
       WHERE b.job_id = $1 AND b.is_active = true
       GROUP BY b.id, b.nama_bundle, b.durasi_menit, b.is_active
       ORDER BY b.created_at ASC`,
      [jobId]
    );

    return NextResponse.json({
      selectedBundleId: selectedBundleId ?? null,
      bundles: bundlesRes.rows,
    });
  } catch (error) {
    console.error("Error fetching job opening essay config:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil konfigurasi paket essay.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT: Menetapkan atau menonaktifkan paket essay untuk suatu lowongan (khusus HC).
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ jobOpeningId: string }> }
) {
  const user = await verifyAdminRequest(request);
  if (!user) {
    return NextResponse.json({ message: "Sesi admin tidak valid." }, { status: 401 });
  }
  if (!user.isHcLowonganManager) {
    return NextResponse.json(
      { message: "Hanya HC yang berhak mengatur paket soal essay lowongan." },
      { status: 403 }
    );
  }

  const { jobOpeningId } = await context.params;
  const body = await request.json();
  const bundleId: string | null = body?.bundleId || null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM public.job_opening_essay_bundles WHERE job_opening_id = $1`,
      [jobOpeningId]
    );

    if (bundleId) {
      // Pastikan bundle berasal dari job_id yang sama dengan lowongan ini
      const validCheck = await client.query(
        `SELECT 1
         FROM public.job_openings jo
         INNER JOIN public.job_essay_bundles b ON b.job_id = jo.job_id
         WHERE jo.id = $1 AND b.id = $2
         LIMIT 1`,
        [jobOpeningId, bundleId]
      );

      if (validCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: "Paket essay tidak sesuai dengan posisi pekerjaan lowongan ini." },
          { status: 400 }
        );
      }

      await client.query(
        `INSERT INTO public.job_opening_essay_bundles (job_opening_id, bundle_id)
         VALUES ($1, $2)`,
        [jobOpeningId, bundleId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({
      success: true,
      message: bundleId
        ? "Paket tes essay berhasil diaktifkan untuk lowongan ini."
        : "Tes essay dinonaktifkan untuk lowongan ini (hanya psikotest).",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating job opening essay bundle:", error);
    return NextResponse.json(
      {
        message: "Gagal menyimpan paket essay lowongan.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

