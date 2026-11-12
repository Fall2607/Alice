import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import {
  canUserAccessJobOpening,
  verifyAdminRequest,
} from "@/app/lib/recruitmentAuth";

export const dynamic = "force-dynamic";

const VALID_DECISIONS = new Set(["LOLOS", "TIDAK_LOLOS"]);

/**
 * PUT: Menyimpan catatan kualitatif dan rekomendasi Lolos/Tidak Lolos untuk tes essay pelamar.
 * Dapat dilakukan oleh pengaju request (Koordinator), atasannya (Supervisor), atau HC.
 * Keputusan status akhir pelamar tetap dikelola terpisah oleh HC.
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAdminRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Sesi admin tidak valid." }, { status: 401 });
    }

    const body = await request.json();
    const {
      assessment_id,
      review_decision,
      review_notes,
      question_notes,
    }: {
      assessment_id?: string;
      review_decision?: string;
      review_notes?: string;
      question_notes?: Record<string, string>;
    } = body;

    if (!assessment_id) {
      return NextResponse.json(
        { message: "ID sesi assessment wajib disertakan." },
        { status: 400 }
      );
    }

    if (!review_decision || !VALID_DECISIONS.has(review_decision)) {
      return NextResponse.json(
        { message: "Pilih keputusan tes essay: Lolos atau Tidak Lolos." },
        { status: 400 }
      );
    }

    const cleanedNotes = String(review_notes ?? "").trim();
    if (!cleanedNotes) {
      return NextResponse.json(
        { message: "Catatan kualitatif penilaian wajib diisi." },
        { status: 400 }
      );
    }

    const sessionRes = await pool.query(
      `SELECT ca.id, ca.job_opening_id
       FROM public.candidate_assessments ca
       INNER JOIN public.essay_test_results etr ON etr.assessment_id = ca.id
       WHERE ca.id = $1
       LIMIT 1`,
      [assessment_id]
    );

    if (sessionRes.rows.length === 0) {
      return NextResponse.json(
        { message: "Data jawaban essay kandidat tidak ditemukan." },
        { status: 404 }
      );
    }

    const jobOpeningId: string = sessionRes.rows[0].job_opening_id;
    const allowed = await canUserAccessJobOpening({ user, jobOpeningId });
    if (!allowed) {
      return NextResponse.json(
        { message: "Anda tidak memiliki izin menilai kandidat pada lowongan ini." },
        { status: 403 }
      );
    }

    const updateRes = await pool.query(
      `UPDATE public.essay_test_results
       SET review_decision = $2,
           review_notes = $3,
           question_notes = $4::jsonb,
           reviewed_by_karyawan_id = $5,
           reviewed_by_name = $6,
           reviewed_at = NOW()
       WHERE assessment_id = $1
       RETURNING id, assessment_id, review_decision, review_notes, question_notes,
                 reviewed_by_karyawan_id, reviewed_by_name, reviewed_at`,
      [
        assessment_id,
        review_decision,
        cleanedNotes,
        question_notes ? JSON.stringify(question_notes) : null,
        user.karyawanId,
        user.name,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Penilaian tes essay berhasil disimpan.",
      review: updateRes.rows[0],
    });
  } catch (error) {
    console.error("PUT Essay Review Error:", error);
    return NextResponse.json(
      {
        message: "Gagal menyimpan penilaian tes essay.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

