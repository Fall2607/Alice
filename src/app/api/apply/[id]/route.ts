// File: src/app/api/apply/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";

/**
 * GET: Mengambil detail lengkap pelamar beserta posisi yang dilamar.
 */
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // 1. Ambil Data Utama Kandidat
        const candidateRes = await pool.query(
            `SELECT * FROM candidates WHERE id = $1`,
            [id]
        );

        if (candidateRes.rows.length === 0) {
            return NextResponse.json(
                { message: "Kandidat tidak ditemukan" },
                { status: 404 }
            );
        }
        const candidate = candidateRes.rows[0];

        // 2. Ambil Semua Data Relasi secara Paralel (Optimasi Performa)
        const [
            spouse,
            parents,
            siblings,
            eduFormal,
            eduNonFormal,
            experience,
            docs,
            applicationData
        ] = await Promise.all([
            // Pasangan
            pool.query(`SELECT * FROM candidate_spouse WHERE candidate_id = $1`, [id]),
            // Orang Tua
            pool.query(`SELECT * FROM candidate_parents WHERE candidate_id = $1`, [id]),
            // Saudara
            pool.query(`SELECT * FROM candidate_siblings WHERE candidate_id = $1`, [id]),
            // Pendidikan Formal
            pool.query(`SELECT * FROM candidate_education_formal WHERE candidate_id = $1 ORDER BY tahun_masuk DESC`, [id]),
            // Pendidikan Non-Formal
            pool.query(`SELECT * FROM candidate_education_nonformal WHERE candidate_id = $1 ORDER BY tahun_masuk DESC`, [id]),
            // Pengalaman Kerja
            pool.query(`SELECT * FROM candidate_work_experience WHERE candidate_id = $1 ORDER BY tahun_mulai DESC`, [id]),
            // Dokumen
            pool.query(`SELECT * FROM candidate_documents WHERE candidate_id = $1`, [id]),
            // Status Lamaran & Info Lowongan (JOIN)
            pool.query(
                `SELECT 
           ast.status, 
           ast.updated_at,
           j.title AS job_title,
           j.id AS job_id
         FROM application_status ast
         LEFT JOIN job_openings j ON ast.job_id = j.id
         WHERE ast.candidate_id = $1`,
                [id]
            ),
        ]);

        // 3. Susun Response Object yang Rapi
        const fullData = {
            // Data Diri
            ...candidate,

            // Info Lamaran (Penting untuk Admin)
            application: {
                status: applicationData.rows[0]?.status || 'Unknown',
                jobTitle: applicationData.rows[0]?.job_title || 'Tidak Diketahui',
                jobId: applicationData.rows[0]?.job_id || null,
                appliedAt: applicationData.rows[0]?.updated_at || null,
            },

            // Data Keluarga
            spouse: spouse.rows[0] || null,
            parents: parents.rows[0] || null,
            siblings: siblings.rows,

            // Riwayat
            education: {
                formal: eduFormal.rows,
                nonFormal: eduNonFormal.rows
            },
            experience: experience.rows,

            // Dokumen
            documents: docs.rows[0] || null
        };

        return NextResponse.json(fullData);

    } catch (error) {
        console.error("API Error [GET Detail Pelamar]:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan server";
        return NextResponse.json(
            { message: "Gagal mengambil detail pelamar", error: errorMessage },
            { status: 500 }
        );
    }
}