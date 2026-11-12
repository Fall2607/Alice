import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import {
  evaluateAssessmentCompletion,
  getActiveEssayBundleForOpening,
} from "@/app/lib/essayAssessment";

export const dynamic = "force-dynamic";

interface SubmittedAnswerItem {
  readonly question_id: string;
  readonly answer: string;
}

/**
 * GET: Mengambil soal tes essay untuk sesi kandidat (tanpa mengirim panduan penilaian ke kandidat).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentIdParam = searchParams.get("assessment_id");
    const tokenParam = searchParams.get("token");

    if (!assessmentIdParam && !tokenParam) {
      return NextResponse.json(
        { message: "Assessment ID atau Token wajib disertakan." },
        { status: 400 }
      );
    }

    const sessionRes = assessmentIdParam
      ? await pool.query(
          `SELECT id, job_opening_id, status FROM public.candidate_assessments WHERE id = $1 LIMIT 1`,
          [assessmentIdParam]
        )
      : await pool.query(
          `SELECT id, job_opening_id, status FROM public.candidate_assessments WHERE token = $1 LIMIT 1`,
          [tokenParam]
        );

    if (sessionRes.rows.length === 0) {
      return NextResponse.json(
        { message: "Sesi ujian kandidat tidak ditemukan." },
        { status: 404 }
      );
    }

    const session = sessionRes.rows[0];
    const bundleInfo = await getActiveEssayBundleForOpening(session.job_opening_id);

    if (!bundleInfo) {
      return NextResponse.json({
        essayRequired: false,
        bundle: null,
        questions: [],
        alreadySubmitted: false,
      });
    }

    const [questionsRes, existingResultRes] = await Promise.all([
      pool.query(
        `SELECT id, urutan, pertanyaan
         FROM public.job_essay_questions
         WHERE bundle_id = $1
         ORDER BY urutan ASC, created_at ASC`,
        [bundleInfo.bundleId]
      ),
      pool.query(
        `SELECT id, submitted_at FROM public.essay_test_results WHERE assessment_id = $1 LIMIT 1`,
        [session.id]
      ),
    ]);

    return NextResponse.json({
      essayRequired: true,
      assessmentId: session.id,
      bundle: {
        id: bundleInfo.bundleId,
        nama_bundle: bundleInfo.namaBundle,
        durasi_menit: bundleInfo.durasiMenit,
        question_count: bundleInfo.questionCount,
      },
      questions: questionsRes.rows,
      alreadySubmitted: (existingResultRes.rowCount ?? 0) > 0,
    });
  } catch (error) {
    console.error("GET Assessment Essay Error:", error);
    return NextResponse.json(
      {
        message: "Gagal memuat soal tes essay.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Menyimpan jawaban essay kandidat beserta snapshot soal dan rubrik dari database.
 */
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const {
      assessment_id,
      token,
      answers,
      time_spent_seconds,
      started_at,
    }: {
      assessment_id?: string;
      token?: string;
      answers?: SubmittedAnswerItem[];
      time_spent_seconds?: number;
      started_at?: string;
    } = body;

    let targetAssessmentId = assessment_id;
    let jobOpeningId: string | null = null;

    if (targetAssessmentId) {
      const s = await client.query(
        `SELECT id, job_opening_id FROM public.candidate_assessments WHERE id = $1 LIMIT 1`,
        [targetAssessmentId]
      );
      if (s.rows.length > 0) {
        jobOpeningId = s.rows[0].job_opening_id;
      }
    } else if (token) {
      const s = await client.query(
        `SELECT id, job_opening_id FROM public.candidate_assessments WHERE token = $1 LIMIT 1`,
        [token]
      );
      if (s.rows.length > 0) {
        targetAssessmentId = s.rows[0].id;
        jobOpeningId = s.rows[0].job_opening_id;
      }
    }

    if (!targetAssessmentId) {
      return NextResponse.json(
        { message: "Sesi assessment kandidat tidak ditemukan." },
        { status: 404 }
      );
    }

    const bundleInfo = await getActiveEssayBundleForOpening(jobOpeningId, client);
    if (!bundleInfo) {
      return NextResponse.json(
        { message: "Lowongan ini tidak memiliki modul essay aktif." },
        { status: 400 }
      );
    }

    const questionsRes = await client.query(
      `SELECT id, urutan, pertanyaan, panduan_penilaian
       FROM public.job_essay_questions
       WHERE bundle_id = $1
       ORDER BY urutan ASC, created_at ASC`,
      [bundleInfo.bundleId]
    );

    const answerMap = new Map<string, string>();
    if (Array.isArray(answers)) {
      for (const item of answers) {
        if (item?.question_id) {
          answerMap.set(item.question_id, String(item.answer ?? "").trim());
        }
      }
    }

    // Simpan snapshot pertanyaan dan panduan penilaian agar tetap utuh walau master soal berubah
    const answerSnapshot = questionsRes.rows.map((q) => ({
      question_id: q.id,
      urutan: q.urutan,
      pertanyaan: q.pertanyaan,
      panduan_penilaian: q.panduan_penilaian ?? null,
      answer: answerMap.get(q.id) ?? "",
    }));

    const maxSeconds = bundleInfo.durasiMenit * 60;
    const boundedDuration = Math.min(
      maxSeconds,
      Math.max(0, Math.round(Number(time_spent_seconds) || 0))
    );

    await client.query("BEGIN");

    const existingRes = await client.query(
      `SELECT id FROM public.essay_test_results WHERE assessment_id = $1 LIMIT 1`,
      [targetAssessmentId]
    );

    if (existingRes.rows.length > 0) {
      await client.query(
        `UPDATE public.essay_test_results
         SET bundle_id = $2,
             answers = $3::jsonb,
             time_spent_seconds = $4,
             started_at = COALESCE($5::timestamptz, started_at),
             submitted_at = NOW()
         WHERE assessment_id = $1`,
        [
          targetAssessmentId,
          bundleInfo.bundleId,
          JSON.stringify(answerSnapshot),
          boundedDuration,
          started_at || null,
        ]
      );
    } else {
      await client.query(
        `INSERT INTO public.essay_test_results
           (assessment_id, bundle_id, answers, time_spent_seconds, started_at)
         VALUES ($1, $2, $3::jsonb, $4, $5::timestamptz)`,
        [
          targetAssessmentId,
          bundleInfo.bundleId,
          JSON.stringify(answerSnapshot),
          boundedDuration,
          started_at || null,
        ]
      );
    }

    const completion = await evaluateAssessmentCompletion(targetAssessmentId, client);
    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Jawaban tes essay berhasil disimpan.",
      completion,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POST Assessment Essay Submit Error:", error);
    return NextResponse.json(
      {
        message: "Gagal menyimpan jawaban tes essay.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

