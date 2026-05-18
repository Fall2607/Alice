/**
 * Path: src/app/api/apply/route.ts
 * Deskripsi: API untuk menangani proses lamaran kandidat.
 * Perbaikan: Sinkronisasi kolom job_opening_id dan penanganan UUID (Hapus parseInt).
 */

import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const { applicant, documents, otherDocuments, jobSlug, assessmentAnswers } = body;

    // jobSlug di sini diasumsikan sebagai UUID dari job_openings.id
    if (!jobSlug)
      return NextResponse.json(
        { message: "ID Lowongan tidak ditemukan." },
        { status: 400 },
      );

    await client.query("BEGIN");

    // 1. Insert CANDIDATES (Tambahkan source 'RECRUITMENT')
    const candidateRes = await client.query(
      `INSERT INTO candidates (
        nama, tempat_lahir, tanggal_lahir, no_ktp, suku_bangsa, agama, 
        status_pernikahan, email, no_whatsapp, alamat, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'RECRUITMENT') RETURNING id`,
      [
        applicant.fullName,
        applicant.birthPlace,
        applicant.birthDate,
        applicant.ktp,
        applicant.ethnicity,
        applicant.religion,
        applicant.maritalStatus,
        applicant.email,
        applicant.whatsapp,
        applicant.address,
      ],
    );
    const candidateId = candidateRes.rows[0].id;

    // 2. Insert SPOUSE (Jika ada)
    if (applicant.maritalStatus === "Kawin") {
      await client.query(
        `INSERT INTO candidate_spouse (candidate_id, nama, tempat_lahir, tanggal_lahir, no_hp) VALUES ($1, $2, $3, $4, $5)`,
        [
          candidateId,
          applicant.spouseName,
          applicant.spouseBirthPlace,
          applicant.spouseBirthDate,
          applicant.spousePhone,
        ],
      );
    }

    // 3. Insert PARENTS
    await client.query(
      `INSERT INTO candidate_parents (candidate_id, nama_ayah, pekerjaan_ayah, nohp_ayah, nama_ibu, pekerjaan_ibu, nohp_ibu) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        candidateId,
        applicant.fatherName,
        applicant.fatherJob,
        applicant.fatherPhone,
        applicant.motherName,
        applicant.motherJob,
        applicant.motherPhone,
      ],
    );

    // 4. Insert SIBLINGS
    if (applicant.siblings?.length > 0) {
      for (const s of applicant.siblings) {
        await client.query(
          `INSERT INTO candidate_siblings (candidate_id, nama, gender, umur, hubungan, pekerjaan) VALUES ($1, $2, $3, $4, $5, $6)`,
          [candidateId, s.name, s.gender, parseInt(s.age), s.relation, s.job],
        );
      }
    }

    // 5. Insert EDUCATION FORMAL
    if (applicant.education.formal?.length > 0) {
      for (const edu of applicant.education.formal) {
        await client.query(
          `INSERT INTO candidate_education_formal (candidate_id, nama_sekolah, tahun_masuk, tahun_lulus, nomor_ijazah, ipk) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            candidateId,
            edu.school,
            parseInt(edu.yearFrom),
            parseInt(edu.yearTo),
            edu.certificateNo,
            edu.ipk,
          ],
        );
      }
    }

    // 6. Insert EDUCATION NON-FORMAL
    if (applicant.education.nonFormal?.length > 0) {
      for (const edu of applicant.education.nonFormal) {
        await client.query(
          `INSERT INTO candidate_education_nonformal (candidate_id, nama_lembaga, tahun_masuk, tahun_selesai, nomor_sertifikat) VALUES ($1, $2, $3, $4, $5)`,
          [
            candidateId,
            edu.school,
            parseInt(edu.yearFrom),
            parseInt(edu.yearTo),
            edu.certificateNo,
          ],
        );
      }
    }

    // 7. Insert WORK EXPERIENCE
    if (applicant.experience?.length > 0) {
      for (const exp of applicant.experience) {
        await client.query(
          `INSERT INTO candidate_work_experience (candidate_id, nama_instansi, jabatan_terakhir, lokasi, lama_kerja, tahun_mulai, tahun_selesai, alasan_berhenti) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            candidateId,
            exp.company,
            exp.position,
            exp.place,
            exp.duration,
            parseInt(exp.fromYear),
            parseInt(exp.toYear),
            exp.reasonLeave,
          ],
        );
      }
    }

    // 8. Insert MAIN DOCUMENTS
    const docMap: any = {};
    if (Array.isArray(documents)) {
      documents.forEach((doc: any) => {
        docMap[doc.type] = doc.url || "";
      });
    }
    await client.query(
      `INSERT INTO candidate_documents (
        candidate_id, cv_url, pas_foto_url, scan_ktp_url, ijazah_url, transkrip_url, kartu_keluarga_url, str_url, paklaring_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        candidateId,
        docMap.cv || null,
        docMap.photo || null,
        docMap.ktp || null,
        docMap.ijazah || null,
        docMap.transkrip || null,
        docMap.kk || null,
        docMap.str || null,
        docMap.paklaring || null,
      ],
    );

    // 9. Insert ADDITIONAL DOCUMENTS
    if (Array.isArray(otherDocuments) && otherDocuments.length > 0) {
      for (const doc of otherDocuments) {
        await client.query(
          `INSERT INTO candidate_other_documents (candidate_id, nama_dokumen, file_url) VALUES ($1, $2, $3)`,
          [candidateId, doc.name, doc.url],
        );
      }
    }

    // 10. Set Status dan Simpan ID Lamaran
    const appStatusRes = await client.query(
      `INSERT INTO application_status (candidate_id, job_opening_id, status) VALUES ($1, $2, 'submitted') RETURNING id`,
      [candidateId, jobSlug],
    );
    const applicationStatusId = appStatusRes.rows[0].id;

    // 11. Proses Kalkulasi Fuzzy Logic & Simpan Assessment
    if (assessmentAnswers && Object.keys(assessmentAnswers).length > 0) {
        const assessmentsRes = await client.query(
            `SELECT id, type, fuzzy_config, weight FROM job_assessments WHERE job_id = $1`,
            [jobSlug]
        );

        let totalScore = 0;
        let totalWeight = 0;

        for (const assessment of assessmentsRes.rows) {
            const answer = assessmentAnswers[assessment.id];
            let fuzzyScore = 0.0;
            const weight = parseFloat(assessment.weight) || 1.0;
            const config = assessment.fuzzy_config || {};

            if (answer !== undefined && answer !== "") {
                if (assessment.type === 'NUMBER') {
                    const val = parseFloat(answer);
                    if (val >= config.ideal_min && val <= config.ideal_max) {
                        fuzzyScore = 100.0;
                    } else if (val >= config.tolerance_min && val < config.ideal_min) {
                        const range = config.ideal_min - config.tolerance_min;
                        fuzzyScore = range > 0 ? ((val - config.tolerance_min) / range) * 100 : 0;
                    } else if (val > config.ideal_max && val <= config.tolerance_max) {
                        const range = config.tolerance_max - config.ideal_max;
                        fuzzyScore = range > 0 ? ((config.tolerance_max - val) / range) * 100 : 0;
                    } else {
                        fuzzyScore = 0.0;
                    }
                } else if (assessment.type === 'SCALE') {
                    const val = parseFloat(answer);
                    if (val >= config.target_score) {
                        fuzzyScore = 100.0;
                    } else if (val <= config.min_score) {
                        fuzzyScore = 0.0;
                    } else {
                        const range = config.target_score - config.min_score;
                        fuzzyScore = range > 0 ? ((val - config.min_score) / range) * 100 : 0;
                    }
                } else if (assessment.type === 'CHOICE') {
                    fuzzyScore = parseFloat(config[answer]) || 0.0;
                }
            }

            // Batasi skor maksimal 100 dan minimal 0
            fuzzyScore = Math.max(0, Math.min(100, fuzzyScore));

            totalScore += fuzzyScore * weight;
            totalWeight += weight;

            // Simpan ke applicant_assessments
            await client.query(
                `INSERT INTO applicant_assessments (application_status_id, assessment_id, answer_value, fuzzy_score) 
                 VALUES ($1, $2, $3, $4)`,
                [applicationStatusId, assessment.id, String(answer || ""), fuzzyScore]
            );
        }

        // Update total suitability_match
        const suitabilityMatch = totalWeight > 0 ? (totalScore / totalWeight) : 0.0;
        await client.query(
            `UPDATE application_status SET suitability_match = $1 WHERE id = $2`,
            [suitabilityMatch, applicationStatusId]
        );
    }

    await client.query("COMMIT");
    return NextResponse.json({
      success: true,
      message: "Lamaran berhasil dikirim",
      candidateId,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("API Error Detail:", error.message);
    return NextResponse.json(
      { message: "Gagal menyimpan data lamaran.", error: error.message },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

export async function GET(req: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.nama, 
        c.email, 
        c.no_whatsapp, 
        c.created_at, 
        as_stat.status, 
        as_stat.suitability_match,
        as_stat.id as application_status_id,
        jo.title as job_title, 
        jo.id as job_opening_id
      FROM candidates c
      JOIN application_status as_stat ON c.id = as_stat.candidate_id
      LEFT JOIN job_openings jo ON as_stat.job_opening_id = jo.id
      ORDER BY c.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal mengambil data pelamar.", error: error.message },
      { status: 500 },
    );
  }
}
