/**
 * Path: src/app/api/apply/[id]/route.ts
 * Deskripsi: API untuk mengambil profil lengkap kandidat.
 * Perbaikan: Sinkronisasi kolom job_opening_id untuk menghindari SQL Error 500.
 */

import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // 1. Ambil data induk kandidat
    const candidateRes = await pool.query(`SELECT * FROM candidates WHERE id = $1`, [id]);
    if (candidateRes.rows.length === 0) {
      return NextResponse.json({ message: "Kandidat tidak ditemukan" }, { status: 404 });
    }
    const candidate = candidateRes.rows[0];

    // 2. Ambil semua detail terkait (Gunakan Promise.all untuk performa)
    // PERBAIKAN: Query appData diubah dari job_id ke job_opening_id
    const [spouse, parents, siblings, eduFormal, eduNonFormal, experience, docs, otherDocs, appData] = await Promise.all([
      pool.query(`SELECT * FROM candidate_spouse WHERE candidate_id = $1`, [id]),
      pool.query(`SELECT * FROM candidate_parents WHERE candidate_id = $1`, [id]),
      pool.query(`SELECT * FROM candidate_siblings WHERE candidate_id = $1`, [id]),
      pool.query(`SELECT * FROM candidate_education_formal WHERE candidate_id = $1 ORDER BY tahun_masuk DESC`, [id]),
      pool.query(`SELECT * FROM candidate_education_nonformal WHERE candidate_id = $1 ORDER BY tahun_masuk DESC`, [id]),
      pool.query(`SELECT * FROM candidate_work_experience WHERE candidate_id = $1 ORDER BY tahun_mulai DESC`, [id]),
      pool.query(`SELECT * FROM candidate_documents WHERE candidate_id = $1`, [id]),
      pool.query(`SELECT * FROM candidate_other_documents WHERE candidate_id = $1`, [id]),
      // Join ke job_openings menggunakan kolom baru: job_opening_id
      pool.query(`
        SELECT 
          ast.status, 
          ast.updated_at as applied_at, 
          jo.title AS job_title 
        FROM application_status ast 
        LEFT JOIN job_openings jo ON ast.job_opening_id = jo.id 
        WHERE ast.candidate_id = $1
      `, [id]),
    ]);

    // 3. Susun objek JSON yang rapi untuk Frontend
    const fullData = {
      ...candidate,
      application: {
        status: appData.rows[0]?.status || 'Submitted',
        jobTitle: appData.rows[0]?.job_title || 'Posisi Tidak Diketahui',
        appliedAt: appData.rows[0]?.applied_at || candidate.created_at,
      },
      spouse: spouse.rows[0] || null,
      parents: parents.rows[0] || null,
      siblings: siblings.rows,
      education: { 
        formal: eduFormal.rows, 
        nonFormal: eduNonFormal.rows 
      },
      experience: experience.rows,
      documents: docs.rows[0] || null,
      otherDocuments: otherDocs.rows,
    };

    return NextResponse.json(fullData);
  } catch (error: any) {
    console.error("API Detail Error:", error.message);
    return NextResponse.json(
      { message: "Gagal mengambil detail profil.", error: error.message }, 
      { status: 500 }
    );
  }
}