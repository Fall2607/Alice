import { Pool, PoolClient } from "pg";
import pool from "@/app/lib/db";

export const MAX_ESSAY_DURATION_MINUTES = 30;

export interface ActiveEssayBundleInfo {
  readonly bundleId: string;
  readonly namaBundle: string;
  readonly durasiMenit: number;
  readonly questionCount: number;
}

type Queryable = Pool | PoolClient;

/**
 * Mengambil konfigurasi paket essay aktif pada suatu lowongan beserta jumlah soalnya.
 * Mengembalikan null apabila lowongan belum memilih paket essay atau paket tidak punya soal.
 */
export async function getActiveEssayBundleForOpening(
  jobOpeningId: string | null | undefined,
  db: Queryable = pool
): Promise<ActiveEssayBundleInfo | null> {
  if (!jobOpeningId) return null;

  const res = await db.query(
    `SELECT
       b.id AS bundle_id,
       b.nama_bundle,
       LEAST(GREATEST(b.durasi_menit, 1), $2)::int AS durasi_menit,
       COUNT(q.id)::int AS question_count
     FROM public.job_opening_essay_bundles joeb
     INNER JOIN public.job_essay_bundles b ON joeb.bundle_id = b.id
     INNER JOIN public.job_essay_questions q ON q.bundle_id = b.id
     WHERE joeb.job_opening_id = $1
       AND b.is_active = true
     GROUP BY b.id, b.nama_bundle, b.durasi_menit
     HAVING COUNT(q.id) > 0
     LIMIT 1`,
    [jobOpeningId, MAX_ESSAY_DURATION_MINUTES]
  );

  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  return {
    bundleId: row.bundle_id,
    namaBundle: row.nama_bundle,
    durasiMenit: row.durasi_menit,
    questionCount: row.question_count,
  };
}

export interface AssessmentCompletionStatus {
  readonly completed: {
    readonly mbti: boolean;
    readonly disc: boolean;
    readonly papi: boolean;
    readonly cfit: boolean;
    readonly essay: boolean;
  };
  readonly essayRequired: boolean;
  readonly essayConfig: ActiveEssayBundleInfo | null;
  readonly isAllCompleted: boolean;
}

/**
 * Menghitung kelengkapan seluruh modul tes untuk sebuah assessment_id,
 * termasuk modul essay jika lowongan kandidat memiliki paket soal essay aktif,
 * dan memperbarui status sesi ke COMPLETED bila semua modul selesai.
 */
export async function evaluateAssessmentCompletion(
  assessmentId: string,
  db: Queryable = pool
): Promise<AssessmentCompletionStatus> {
  const [candSessionRes, mbtiRes, discRes, papiRes, cfitRes, essayRes] =
    await Promise.all([
      db.query(
        `SELECT job_opening_id FROM public.candidate_assessments WHERE id = $1 LIMIT 1`,
        [assessmentId]
      ),
      db.query(`SELECT 1 FROM public.mbti_test_results WHERE assessment_id = $1 LIMIT 1`, [assessmentId]),
      db.query(`SELECT 1 FROM public.disc_test_results WHERE assessment_id = $1 LIMIT 1`, [assessmentId]),
      db.query(`SELECT 1 FROM public.papi_test_results WHERE assessment_id = $1 LIMIT 1`, [assessmentId]),
      db.query(`SELECT 1 FROM public.cfit_test_results WHERE assessment_id = $1 LIMIT 1`, [assessmentId]),
      db.query(`SELECT 1 FROM public.essay_test_results WHERE assessment_id = $1 LIMIT 1`, [assessmentId]),
    ]);

  const jobOpeningId: string | null =
    candSessionRes.rows[0]?.job_opening_id ?? null;

  const essayConfig = await getActiveEssayBundleForOpening(jobOpeningId, db);
  const essayRequired = essayConfig !== null;

  const completed = {
    mbti: (mbtiRes.rowCount ?? 0) > 0,
    disc: (discRes.rowCount ?? 0) > 0,
    papi: (papiRes.rowCount ?? 0) > 0,
    cfit: (cfitRes.rowCount ?? 0) > 0,
    essay: (essayRes.rowCount ?? 0) > 0,
  };

  const isAllCompleted =
    completed.mbti &&
    completed.disc &&
    completed.papi &&
    completed.cfit &&
    (!essayRequired || completed.essay);

  if (isAllCompleted) {
    await db.query(
      "UPDATE public.candidate_assessments SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1",
      [assessmentId]
    );
    await db.query(
      "UPDATE public.employee_assessments SET status = 'COMPLETED' WHERE id = $1",
      [assessmentId]
    );
  }

  return {
    completed,
    essayRequired,
    essayConfig,
    isAllCompleted,
  };
}

