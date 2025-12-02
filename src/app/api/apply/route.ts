// File: src/app/api/apply/route.ts
import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  
  try {
    const body = await req.json();
    const { applicant, documents, otherDocuments, jobSlug } = body; // Tambah otherDocuments

    if (!jobSlug) return NextResponse.json({ message: "ID Lowongan tidak ditemukan." }, { status: 400 });

    await client.query('BEGIN');

    // 1. Insert CANDIDATES
    const candidateRes = await client.query(
      `INSERT INTO candidates (
        nama, tempat_lahir, tanggal_lahir, no_ktp, suku_bangsa, agama, 
        status_pernikahan, email, no_whatsapp, alamat
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        applicant.fullName, applicant.birthPlace, applicant.birthDate, applicant.ktp,
        applicant.ethnicity, applicant.religion, applicant.maritalStatus,
        applicant.email, applicant.whatsapp, applicant.address
      ]
    );
    const candidateId = candidateRes.rows[0].id;

    // 2. Insert SPOUSE (Jika ada)
    if (applicant.maritalStatus === "Kawin") {
      await client.query(
        `INSERT INTO candidate_spouse (candidate_id, nama, tempat_lahir, tanggal_lahir, no_hp) VALUES ($1, $2, $3, $4, $5)`,
        [candidateId, applicant.spouseName, applicant.spouseBirthPlace, applicant.spouseBirthDate, applicant.spousePhone]
      );
    }

    // 3. Insert PARENTS
    await client.query(
      `INSERT INTO candidate_parents (candidate_id, nama_ayah, pekerjaan_ayah, nohp_ayah, nama_ibu, pekerjaan_ibu, nohp_ibu) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [candidateId, applicant.fatherName, applicant.fatherJob, applicant.fatherPhone, applicant.motherName, applicant.motherJob, applicant.motherPhone]
    );

    // 4. Insert SIBLINGS
    if (applicant.siblings?.length > 0) {
      for (const s of applicant.siblings) {
        await client.query(
          `INSERT INTO candidate_siblings (candidate_id, nama, gender, umur, hubungan, pekerjaan) VALUES ($1, $2, $3, $4, $5, $6)`,
          [candidateId, s.name, s.gender, parseInt(s.age), s.relation, s.job]
        );
      }
    }

    // 5. Insert EDUCATION FORMAL (Update: Ada IPK)
    if (applicant.education.formal?.length > 0) {
      for (const edu of applicant.education.formal) {
        await client.query(
          `INSERT INTO candidate_education_formal (candidate_id, nama_sekolah, tahun_masuk, tahun_lulus, nomor_ijazah, ipk) VALUES ($1, $2, $3, $4, $5, $6)`,
          [candidateId, edu.school, parseInt(edu.yearFrom), parseInt(edu.yearTo), edu.certificateNo, edu.ipk]
        );
      }
    }

    // 6. Insert EDUCATION NON-FORMAL
    if (applicant.education.nonFormal?.length > 0) {
      for (const edu of applicant.education.nonFormal) {
        await client.query(
          `INSERT INTO candidate_education_nonformal (candidate_id, nama_lembaga, tahun_masuk, tahun_selesai, nomor_sertifikat) VALUES ($1, $2, $3, $4, $5)`,
          [candidateId, edu.school, parseInt(edu.yearFrom), parseInt(edu.yearTo), edu.certificateNo]
        );
      }
    }

    // 7. Insert WORK EXPERIENCE
    if (applicant.experience?.length > 0) {
      for (const exp of applicant.experience) {
        await client.query(
          `INSERT INTO candidate_work_experience (candidate_id, nama_instansi, jabatan_terakhir, lokasi, lama_kerja, tahun_mulai, tahun_selesai, alasan_berhenti) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [candidateId, exp.company, exp.position, exp.place, exp.duration, parseInt(exp.fromYear), parseInt(exp.toYear), exp.reasonLeave]
        );
      }
    }

    // 8. Insert MAIN DOCUMENTS (Update: Ada Paklaring)
    const docMap: any = {};
    if (Array.isArray(documents)) {
       documents.forEach((doc: any) => { docMap[doc.type] = doc.url || ""; });
    }
    await client.query(
      `INSERT INTO candidate_documents (
        candidate_id, cv_url, pas_foto_url, scan_ktp_url, ijazah_url, transkrip_url, kartu_keluarga_url, str_url, paklaring_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        candidateId,
        docMap.cv || null, docMap.photo || null, docMap.ktp || null,
        docMap.ijazah || null, docMap.transkrip || null, docMap.kk || null,
        docMap.str || null, docMap.paklaring || null // Field Baru
      ]
    );

    // 9. Insert ADDITIONAL DOCUMENTS (New Table)
    if (Array.isArray(otherDocuments) && otherDocuments.length > 0) {
        for (const doc of otherDocuments) {
            await client.query(
                `INSERT INTO candidate_other_documents (candidate_id, nama_dokumen, file_url) VALUES ($1, $2, $3)`,
                [candidateId, doc.name, doc.url]
            );
        }
    }

    // 10. Set Status
    await client.query(
      `INSERT INTO application_status (candidate_id, job_id, status) VALUES ($1, $2, 'submitted')`,
      [candidateId, parseInt(jobSlug)] 
    );

    await client.query('COMMIT');
    return NextResponse.json({ success: true, message: "Lamaran berhasil dikirim", candidateId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ message: "Gagal menyimpan data", error: errorMessage }, { status: 500 });
  } finally {
    client.release();
  }
}

// GET Handler tetap sama, hanya perlu update jika ingin menampilkan di list
export async function GET(req: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT c.id, c.nama, c.email, c.no_whatsapp, c.created_at, as_stat.status, j.title as job_title, j.id as job_id
      FROM candidates c
      JOIN application_status as_stat ON c.id = as_stat.candidate_id
      LEFT JOIN job_openings j ON as_stat.job_id = j.id
      ORDER BY c.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}