import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { verifyAdminRequest } from "@/app/lib/recruitmentAuth";
import { MAX_ESSAY_DURATION_MINUTES } from "@/app/lib/essayAssessment";

export const dynamic = "force-dynamic";

interface IncomingQuestion {
  readonly id?: string;
  readonly pertanyaan: string;
  readonly panduan_penilaian?: string | null;
}

interface IncomingBundle {
  readonly id?: string;
  readonly nama_bundle: string;
  readonly durasi_menit?: number;
  readonly is_active?: boolean;
  readonly questions: readonly IncomingQuestion[];
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/**
 * GET: Mengambil daftar paket/bundle soal essay beserta butir pertanyaan untuk suatu posisi pekerjaan.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = await verifyAdminRequest(request);
    if (!user || (!user.isHcJobPositionManager && !user.isHcLowonganManager)) {
      return NextResponse.json(
        { message: "Akses ditolak: hanya HC yang dapat mengakses bank soal essay." },
        { status: 403 }
      );
    }

    const { jobId } = await context.params;
    const bundlesRes = await pool.query(
      `SELECT id, job_id, nama_bundle, durasi_menit, is_active, created_at, updated_at
       FROM public.job_essay_bundles
       WHERE job_id = $1
       ORDER BY created_at ASC, nama_bundle ASC`,
      [jobId]
    );

    const questionsRes = await pool.query(
      `SELECT q.id, q.bundle_id, q.pertanyaan, q.panduan_penilaian, q.urutan
       FROM public.job_essay_questions q
       INNER JOIN public.job_essay_bundles b ON q.bundle_id = b.id
       WHERE b.job_id = $1
       ORDER BY q.urutan ASC, q.created_at ASC`,
      [jobId]
    );

    const questionsByBundle = new Map<string, typeof questionsRes.rows>();
    for (const q of questionsRes.rows) {
      const list = questionsByBundle.get(q.bundle_id) ?? [];
      list.push(q);
      questionsByBundle.set(q.bundle_id, list);
    }

    const payload = bundlesRes.rows.map((bundle) => ({
      ...bundle,
      questions: questionsByBundle.get(bundle.id) ?? [],
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching job essay bundles:", error);
    return NextResponse.json(
      {
        message: "Gagal memuat bank soal essay.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT: Menyimpan paket/bundle soal essay per posisi pekerjaan (khusus HC).
 * Mempertahankan UUID bundle yang masih ada agar relasi di lowongan aktif tidak terputus.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const user = await verifyAdminRequest(request);
  if (!user) {
    return NextResponse.json({ message: "Sesi admin tidak valid." }, { status: 401 });
  }
  if (!user.isHcJobPositionManager) {
    return NextResponse.json(
      { message: "Akses ditolak: hanya HC yang dapat mengubah soal essay." },
      { status: 403 }
    );
  }

  const { jobId } = await context.params;
  const body = await request.json();
  const bundles: IncomingBundle[] = Array.isArray(body?.bundles) ? body.bundles : [];

  for (const bundle of bundles) {
    if (!bundle.nama_bundle?.trim()) {
      return NextResponse.json(
        { message: "Nama paket soal essay tidak boleh kosong." },
        { status: 400 }
      );
    }
    const questions = Array.isArray(bundle.questions) ? bundle.questions : [];
    for (const question of questions) {
      if (!question.pertanyaan?.trim()) {
        return NextResponse.json(
          { message: `Pertanyaan kosong ditemukan pada paket "${bundle.nama_bundle}".` },
          { status: 400 }
        );
      }
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const keptBundleIds: string[] = [];

    for (const bundle of bundles) {
      const clampedDuration = Math.min(
        MAX_ESSAY_DURATION_MINUTES,
        Math.max(1, Math.round(Number(bundle.durasi_menit) || MAX_ESSAY_DURATION_MINUTES))
      );
      const isActive = bundle.is_active !== false;
      let bundleId: string;

      if (isUuid(bundle.id)) {
        const updateRes = await client.query(
          `UPDATE public.job_essay_bundles
           SET nama_bundle = $1, durasi_menit = $2, is_active = $3, updated_at = NOW()
           WHERE id = $4 AND job_id = $5
           RETURNING id`,
          [bundle.nama_bundle.trim(), clampedDuration, isActive, bundle.id, jobId]
        );
        if (updateRes.rows.length > 0) {
          bundleId = updateRes.rows[0].id;
        } else {
          const insertRes = await client.query(
            `INSERT INTO public.job_essay_bundles (job_id, nama_bundle, durasi_menit, is_active)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [jobId, bundle.nama_bundle.trim(), clampedDuration, isActive]
          );
          bundleId = insertRes.rows[0].id;
        }
      } else {
        const insertRes = await client.query(
          `INSERT INTO public.job_essay_bundles (job_id, nama_bundle, durasi_menit, is_active)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [jobId, bundle.nama_bundle.trim(), clampedDuration, isActive]
        );
        bundleId = insertRes.rows[0].id;
      }

      keptBundleIds.push(bundleId);

      // Sinkronkan pertanyaan di dalam bundle
      await client.query(
        `DELETE FROM public.job_essay_questions WHERE bundle_id = $1`,
        [bundleId]
      );

      const questions = Array.isArray(bundle.questions) ? bundle.questions : [];
      for (let idx = 0; idx < questions.length; idx++) {
        const q = questions[idx];
        await client.query(
          `INSERT INTO public.job_essay_questions (bundle_id, pertanyaan, panduan_penilaian, urutan)
           VALUES ($1, $2, $3, $4)`,
          [
            bundleId,
            q.pertanyaan.trim(),
            q.panduan_penilaian?.trim() || null,
            idx + 1,
          ]
        );
      }
    }

    if (keptBundleIds.length > 0) {
      await client.query(
        `DELETE FROM public.job_essay_bundles
         WHERE job_id = $1 AND NOT (id = ANY($2::uuid[]))`,
        [jobId, keptBundleIds]
      );
    } else {
      await client.query(
        `DELETE FROM public.job_essay_bundles WHERE job_id = $1`,
        [jobId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({
      success: true,
      message: "Bank soal essay berhasil disimpan.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error saving job essay bundles:", error);
    return NextResponse.json(
      {
        message: "Gagal menyimpan bank soal essay.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

