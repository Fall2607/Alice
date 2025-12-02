// File: src/app/api/apply/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const candidateRes = await pool.query(`SELECT * FROM candidates WHERE id = $1`, [id]);
    if (candidateRes.rows.length === 0) return NextResponse.json({ message: "Kandidat tidak ditemukan" }, { status: 404 });
    const candidate = candidateRes.rows[0];

    // Update query untuk mengambil other_documents
    const [spouse, parents, siblings, eduFormal, eduNonFormal, experience, docs, otherDocs, appData] = await Promise.all([
      pool.query(`SELECT * FROM candidate_spouse WHERE candidate_id = $1`, [id]),
      pool.query(`SELECT * FROM candidate_parents WHERE candidate_id = $1`, [id]),
      pool.query(`SELECT * FROM candidate_siblings WHERE candidate_id = $1`, [id]),
      pool.query(`SELECT * FROM candidate_education_formal WHERE candidate_id = $1 ORDER BY tahun_masuk DESC`, [id]),
      pool.query(`SELECT * FROM candidate_education_nonformal WHERE candidate_id = $1 ORDER BY tahun_masuk DESC`, [id]),
      pool.query(`SELECT * FROM candidate_work_experience WHERE candidate_id = $1 ORDER BY tahun_mulai DESC`, [id]),
      pool.query(`SELECT * FROM candidate_documents WHERE candidate_id = $1`, [id]),
      // Fetch Dokumen Tambahan
      pool.query(`SELECT * FROM candidate_other_documents WHERE candidate_id = $1`, [id]),
      pool.query(`SELECT ast.status, ast.updated_at, j.title AS job_title, j.id AS job_id FROM application_status ast LEFT JOIN job_openings j ON ast.job_id = j.id WHERE ast.candidate_id = $1`, [id]),
    ]);

    const fullData = {
      ...candidate,
      application: {
        status: appData.rows[0]?.status || 'Unknown',
        jobTitle: appData.rows[0]?.job_title || 'Tidak Diketahui',
        jobId: appData.rows[0]?.job_id || null,
        appliedAt: appData.rows[0]?.updated_at || null,
      },
      spouse: spouse.rows[0] || null,
      parents: parents.rows[0] || null,
      siblings: siblings.rows,
      education: { formal: eduFormal.rows, nonFormal: eduNonFormal.rows },
      experience: experience.rows,
      documents: docs.rows[0] || null,
      otherDocuments: otherDocs.rows, // Data dokumen tambahan
    };

    return NextResponse.json(fullData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Gagal mengambil detail", error: String(error) }, { status: 500 });
  }
}