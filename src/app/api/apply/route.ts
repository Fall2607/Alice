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
    const { applicant, documents, otherDocuments, jobSlug } = body;

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

    // 10. Set Status (PERBAIKAN: Gunakan job_opening_id dan hapus parseInt)
    await client.query(
      `INSERT INTO application_status (candidate_id, job_opening_id, status) VALUES ($1, $2, 'submitted')`,
      [candidateId, jobSlug],
    );

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
