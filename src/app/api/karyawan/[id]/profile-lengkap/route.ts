import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import type { PoolClient } from "pg";

export const dynamic = "force-dynamic";

let schemaInitialized = false;

async function ensureEmployeeProfileSchema(client: PoolClient | typeof pool) {
  if (schemaInitialized) return;

  await client.query(`
    ALTER TABLE karyawan
      ADD COLUMN IF NOT EXISTS tempat_lahir VARCHAR(150),
      ADD COLUMN IF NOT EXISTS suku_bangsa VARCHAR(100),
      ADD COLUMN IF NOT EXISTS agama VARCHAR(50),
      ADD COLUMN IF NOT EXISTS status_pernikahan VARCHAR(50),
      ADD COLUMN IF NOT EXISTS jumlah_anak INT DEFAULT 0;

    CREATE TABLE IF NOT EXISTS karyawan_spouse (
      id SERIAL PRIMARY KEY,
      karyawan_id UUID NOT NULL REFERENCES karyawan(id) ON DELETE CASCADE,
      nama VARCHAR(255),
      tempat_lahir VARCHAR(150),
      tanggal_lahir DATE,
      no_hp VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS karyawan_parents (
      id SERIAL PRIMARY KEY,
      karyawan_id UUID NOT NULL REFERENCES karyawan(id) ON DELETE CASCADE,
      nama_ayah VARCHAR(255),
      pekerjaan_ayah VARCHAR(150),
      nohp_ayah VARCHAR(50),
      nama_ibu VARCHAR(255),
      pekerjaan_ibu VARCHAR(150),
      nohp_ibu VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS karyawan_siblings (
      id SERIAL PRIMARY KEY,
      karyawan_id UUID NOT NULL REFERENCES karyawan(id) ON DELETE CASCADE,
      nama VARCHAR(255),
      gender VARCHAR(30),
      umur INT,
      hubungan VARCHAR(100),
      pekerjaan VARCHAR(150)
    );

    CREATE TABLE IF NOT EXISTS karyawan_education_formal (
      id SERIAL PRIMARY KEY,
      karyawan_id UUID NOT NULL REFERENCES karyawan(id) ON DELETE CASCADE,
      tingkat VARCHAR(50),
      nama_sekolah VARCHAR(255),
      jurusan VARCHAR(150),
      tahun_masuk INT,
      tahun_lulus INT,
      nomor_ijazah VARCHAR(150),
      ipk VARCHAR(20)
    );

    CREATE TABLE IF NOT EXISTS karyawan_education_nonformal (
      id SERIAL PRIMARY KEY,
      karyawan_id UUID NOT NULL REFERENCES karyawan(id) ON DELETE CASCADE,
      nama_lembaga VARCHAR(255),
      jenis_kursus VARCHAR(200),
      tahun_masuk INT,
      tahun_selesai INT,
      nomor_sertifikat VARCHAR(150)
    );

    CREATE TABLE IF NOT EXISTS karyawan_work_experience (
      id SERIAL PRIMARY KEY,
      karyawan_id UUID NOT NULL REFERENCES karyawan(id) ON DELETE CASCADE,
      nama_instansi VARCHAR(255),
      jabatan_terakhir VARCHAR(150),
      lokasi VARCHAR(150),
      lama_kerja VARCHAR(100),
      tahun_mulai INT,
      tahun_selesai INT,
      alasan_berhenti TEXT
    );

    CREATE TABLE IF NOT EXISTS karyawan_documents (
      id SERIAL PRIMARY KEY,
      karyawan_id UUID NOT NULL UNIQUE REFERENCES karyawan(id) ON DELETE CASCADE,
      cv_url TEXT,
      pas_foto_url TEXT,
      scan_ktp_url TEXT,
      ijazah_url TEXT,
      transkrip_url TEXT,
      kartu_keluarga_url TEXT,
      str_url TEXT,
      paklaring_url TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS karyawan_other_documents (
      id SERIAL PRIMARY KEY,
      karyawan_id UUID NOT NULL REFERENCES karyawan(id) ON DELETE CASCADE,
      nama_dokumen VARCHAR(255),
      file_url TEXT
    );
  `);

  schemaInitialized = true;
}

function hasText(val: unknown): boolean {
  return typeof val === "string" && val.trim().length > 0;
}

export function calculateProfileCompleteness(payload: {
  karyawan: Record<string, any>;
  spouse: Record<string, any> | null;
  parents: Record<string, any> | null;
  educationFormal: Record<string, any>[];
  documents: Record<string, any> | null;
}) {
  const { karyawan, spouse, parents, educationFormal, documents } = payload;

  // 1. Pilar Identitas Diri (25%)
  const missingIdentityFields: string[] = [];
  if (!hasText(karyawan.nama_lengkap)) missingIdentityFields.push("Nama Lengkap");
  if (!hasText(karyawan.nik)) missingIdentityFields.push("NIK (No. KTP)");
  if (!hasText(karyawan.tempat_lahir)) missingIdentityFields.push("Tempat Lahir");
  if (!karyawan.tanggal_lahir) missingIdentityFields.push("Tanggal Lahir");
  if (!hasText(karyawan.jenis_kelamin)) missingIdentityFields.push("Jenis Kelamin");
  if (!hasText(karyawan.agama)) missingIdentityFields.push("Agama");
  if (!hasText(karyawan.status_pernikahan)) missingIdentityFields.push("Status Pernikahan");
  if (!hasText(karyawan.handphone)) missingIdentityFields.push("No. Handphone/WA");
  if (!hasText(karyawan.email)) missingIdentityFields.push("Email");
  if (!hasText(karyawan.alamat)) missingIdentityFields.push("Alamat KTP");

  const isIdentityComplete = missingIdentityFields.length === 0;

  // 2. Pilar Data Keluarga (25%)
  const missingFamilyFields: string[] = [];
  if (!parents || !hasText(parents.nama_ayah)) missingFamilyFields.push("Nama Ayah");
  if (!parents || !hasText(parents.nama_ibu)) missingFamilyFields.push("Nama Ibu");
  if (
    hasText(karyawan.status_pernikahan) &&
    karyawan.status_pernikahan.toLowerCase() === "kawin" &&
    (!spouse || !hasText(spouse.nama))
  ) {
    missingFamilyFields.push("Data Pasangan (Suami/Istri)");
  }
  const isFamilyComplete = missingFamilyFields.length === 0;

  // 3. Pilar Pendidikan Formal (25%)
  const hasValidFormalEdu =
    Array.isArray(educationFormal) &&
    educationFormal.some((e) => hasText(e.nama_sekolah) && (e.tahun_lulus || hasText(String(e.tahun_lulus || ""))));
  const isEducationComplete = hasValidFormalEdu;

  // 4. Pilar Dokumen Utama: Foto, KTP, KK, Ijazah (25%)
  const missingDocFields: string[] = [];
  if (!documents || !hasText(documents.pas_foto_url)) missingDocFields.push("Pas Foto");
  if (!documents || !hasText(documents.scan_ktp_url)) missingDocFields.push("Scan KTP");
  if (!documents || !hasText(documents.kartu_keluarga_url)) missingDocFields.push("Kartu Keluarga (KK)");
  if (!documents || !hasText(documents.ijazah_url)) missingDocFields.push("Ijazah Terakhir");
  const isDocumentsComplete = missingDocFields.length === 0;

  const missingSections: string[] = [];
  if (!isIdentityComplete) {
    missingSections.push(`Identitas Diri (${missingIdentityFields.slice(0, 3).join(", ")}${missingIdentityFields.length > 3 ? ", dst." : ""})`);
  }
  if (!isFamilyComplete) {
    missingSections.push(`Data Keluarga (${missingFamilyFields.join(", ")})`);
  }
  if (!isEducationComplete) {
    missingSections.push("Riwayat Pendidikan Formal (Minimal 1 jenjang)");
  }
  if (!isDocumentsComplete) {
    missingSections.push(`Dokumen Utama (${missingDocFields.join(", ")})`);
  }

  const completedCount = [
    isIdentityComplete,
    isFamilyComplete,
    isEducationComplete,
    isDocumentsComplete,
  ].filter(Boolean).length;

  const percentage = Math.round((completedCount / 4) * 100);

  return {
    is_complete: completedCount === 4,
    percentage,
    missing_sections: missingSections,
    pillars: {
      identity: isIdentityComplete,
      family: isFamilyComplete,
      education: isEducationComplete,
      documents: isDocumentsComplete,
    },
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ensureEmployeeProfileSchema(pool);

    const karRes = await pool.query(
      `SELECT
         k.id, k.nip, k.nama_lengkap, k.nik, k.profesi, k.sip, k.masa_berlaku_sip,
         k.handphone, k.email, k.tanggal_lahir, k.jenis_kelamin, k.alamat, k.alamat_domisili,
         k.tempat_lahir, k.suku_bangsa, k.agama, k.status_pernikahan, k.jumlah_anak,
         k.tanggal_masuk, k.status_kepegawaian, k.rekening_bsi, k.sisa_cuti,
         d.nama_departemen, lj.nama_level, atasan.nama_lengkap AS nama_atasan,
         CASE WHEN k.face_descriptor IS NOT NULL THEN true ELSE false END AS has_face_descriptor
       FROM karyawan k
       LEFT JOIN jabatan j ON k.jabatan_id = j.id
       LEFT JOIN departemen d ON j.departemen_id = d.id
       LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
       LEFT JOIN karyawan atasan ON k.atasan_id = atasan.id
       WHERE k.id = $1`,
      [id]
    );

    if (karRes.rows.length === 0) {
      return NextResponse.json({ message: "Karyawan tidak ditemukan." }, { status: 404 });
    }

    let karyawan = karRes.rows[0];

    // Ambil data tabel relasi
    let [spouseRes, parentsRes, siblingsRes, eduFormalRes, eduNonFormalRes, expRes, docsRes, otherDocsRes] =
      await Promise.all([
        pool.query(`SELECT * FROM karyawan_spouse WHERE karyawan_id = $1 LIMIT 1`, [id]),
        pool.query(`SELECT * FROM karyawan_parents WHERE karyawan_id = $1 LIMIT 1`, [id]),
        pool.query(`SELECT * FROM karyawan_siblings WHERE karyawan_id = $1 ORDER BY id ASC`, [id]),
        pool.query(`SELECT * FROM karyawan_education_formal WHERE karyawan_id = $1 ORDER BY tahun_lulus DESC NULLS LAST, id ASC`, [id]),
        pool.query(`SELECT * FROM karyawan_education_nonformal WHERE karyawan_id = $1 ORDER BY tahun_selesai DESC NULLS LAST, id ASC`, [id]),
        pool.query(`SELECT * FROM karyawan_work_experience WHERE karyawan_id = $1 ORDER BY tahun_selesai DESC NULLS LAST, id ASC`, [id]),
        pool.query(`SELECT * FROM karyawan_documents WHERE karyawan_id = $1 LIMIT 1`, [id]),
        pool.query(`SELECT * FROM karyawan_other_documents WHERE karyawan_id = $1 ORDER BY id ASC`, [id]),
      ]);

    const spouse = spouseRes.rows[0] || null;
    const parents = parentsRes.rows[0] || null;
    const siblings = siblingsRes.rows;
    const educationFormal = eduFormalRes.rows;
    const educationNonFormal = eduNonFormalRes.rows;
    const experience = expRes.rows;
    const documents = docsRes.rows[0] || null;
    const otherDocuments = otherDocsRes.rows;

    const completeness = calculateProfileCompleteness({
      karyawan,
      spouse,
      parents,
      educationFormal,
      documents,
    });

    return NextResponse.json({
      karyawan,
      spouse,
      parents,
      siblings,
      education: {
        formal: educationFormal,
        nonFormal: educationNonFormal,
      },
      experience,
      documents,
      otherDocuments,
      completeness,
      auto_synced_from_candidate: false,
    });
  } catch (err) {
    console.error("Error fetching profile-lengkap karyawan:", err);
    return NextResponse.json(
      {
        message: "Gagal mengambil data profil lengkap karyawan.",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  try {
    const { id } = await params;
    await ensureEmployeeProfileSchema(client);

    const body = await request.json();
    const {
      identity = {},
      spouse = null,
      parents = null,
      siblings = [],
      educationFormal = [],
      educationNonFormal = [],
      experience = [],
      documents = {},
      otherDocuments = [],
    } = body;

    await client.query("BEGIN");

    // 1. Update data pribadi pada tabel karyawan
    await client.query(
      `UPDATE karyawan SET
         nama_lengkap = COALESCE(NULLIF(TRIM($2), ''), nama_lengkap),
         nik = COALESCE(NULLIF(TRIM($3), ''), nik),
         tempat_lahir = $4,
         tanggal_lahir = $5,
         jenis_kelamin = $6,
         suku_bangsa = $7,
         agama = $8,
         status_pernikahan = $9,
         jumlah_anak = $10,
         handphone = $11,
         email = $12,
         alamat = $13,
         alamat_domisili = $14,
         rekening_bsi = $15,
         sip = $16,
         masa_berlaku_sip = $17
       WHERE id = $1`,
      [
        id,
        identity.nama_lengkap || null,
        identity.nik || null,
        identity.tempat_lahir || null,
        identity.tanggal_lahir || null,
        identity.jenis_kelamin || null,
        identity.suku_bangsa || null,
        identity.agama || null,
        identity.status_pernikahan || null,
        Number(identity.jumlah_anak) || 0,
        identity.handphone || null,
        identity.email || null,
        identity.alamat || null,
        identity.alamat_domisili || null,
        identity.rekening_bsi || null,
        identity.sip || null,
        identity.masa_berlaku_sip || null,
      ]
    );

    // 2. Replace Spouse
    await client.query(`DELETE FROM karyawan_spouse WHERE karyawan_id = $1`, [id]);
    if (spouse && hasText(spouse.nama)) {
      await client.query(
        `INSERT INTO karyawan_spouse (karyawan_id, nama, tempat_lahir, tanggal_lahir, no_hp)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          spouse.nama.trim(),
          spouse.tempat_lahir || null,
          spouse.tanggal_lahir || null,
          spouse.no_hp || null,
        ]
      );
    }

    // 3. Replace Parents
    await client.query(`DELETE FROM karyawan_parents WHERE karyawan_id = $1`, [id]);
    if (parents && (hasText(parents.nama_ayah) || hasText(parents.nama_ibu))) {
      await client.query(
        `INSERT INTO karyawan_parents (karyawan_id, nama_ayah, pekerjaan_ayah, nohp_ayah, nama_ibu, pekerjaan_ibu, nohp_ibu)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          id,
          parents.nama_ayah || null,
          parents.pekerjaan_ayah || null,
          parents.nohp_ayah || null,
          parents.nama_ibu || null,
          parents.pekerjaan_ibu || null,
          parents.nohp_ibu || null,
        ]
      );
    }

    // 4. Replace Siblings
    await client.query(`DELETE FROM karyawan_siblings WHERE karyawan_id = $1`, [id]);
    if (Array.isArray(siblings)) {
      for (const sb of siblings) {
        if (!hasText(sb.nama)) continue;
        await client.query(
          `INSERT INTO karyawan_siblings (karyawan_id, nama, gender, umur, hubungan, pekerjaan)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            id,
            sb.nama.trim(),
            sb.gender || null,
            Number(sb.umur) || 0,
            sb.hubungan || null,
            sb.pekerjaan || null,
          ]
        );
      }
    }

    // 5. Replace Formal Education
    await client.query(`DELETE FROM karyawan_education_formal WHERE karyawan_id = $1`, [id]);
    if (Array.isArray(educationFormal)) {
      for (const ef of educationFormal) {
        if (!hasText(ef.nama_sekolah)) continue;
        await client.query(
          `INSERT INTO karyawan_education_formal (karyawan_id, tingkat, nama_sekolah, jurusan, tahun_masuk, tahun_lulus, nomor_ijazah, ipk)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            id,
            ef.tingkat || null,
            ef.nama_sekolah.trim(),
            ef.jurusan || null,
            Number(ef.tahun_masuk) || null,
            Number(ef.tahun_lulus) || null,
            ef.nomor_ijazah || null,
            ef.ipk || null,
          ]
        );
      }
    }

    // 6. Replace Non-Formal Education
    await client.query(`DELETE FROM karyawan_education_nonformal WHERE karyawan_id = $1`, [id]);
    if (Array.isArray(educationNonFormal)) {
      for (const enf of educationNonFormal) {
        if (!hasText(enf.nama_lembaga)) continue;
        await client.query(
          `INSERT INTO karyawan_education_nonformal (karyawan_id, nama_lembaga, jenis_kursus, tahun_masuk, tahun_selesai, nomor_sertifikat)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            id,
            enf.nama_lembaga.trim(),
            enf.jenis_kursus || null,
            Number(enf.tahun_masuk) || null,
            Number(enf.tahun_selesai) || null,
            enf.nomor_sertifikat || null,
          ]
        );
      }
    }

    // 7. Replace Work Experience
    await client.query(`DELETE FROM karyawan_work_experience WHERE karyawan_id = $1`, [id]);
    if (Array.isArray(experience)) {
      for (const ex of experience) {
        if (!hasText(ex.nama_instansi)) continue;
        await client.query(
          `INSERT INTO karyawan_work_experience (karyawan_id, nama_instansi, jabatan_terakhir, lokasi, lama_kerja, tahun_mulai, tahun_selesai, alasan_berhenti)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            id,
            ex.nama_instansi.trim(),
            ex.jabatan_terakhir || null,
            ex.lokasi || null,
            ex.lama_kerja || null,
            Number(ex.tahun_mulai) || null,
            Number(ex.tahun_selesai) || null,
            ex.alasan_berhenti || null,
          ]
        );
      }
    }

    // 8. Upsert Main Documents
    if (documents && typeof documents === "object") {
      await client.query(
        `INSERT INTO karyawan_documents (
           karyawan_id, cv_url, pas_foto_url, scan_ktp_url, ijazah_url, transkrip_url, kartu_keluarga_url, str_url, paklaring_url, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (karyawan_id) DO UPDATE SET
           cv_url = COALESCE(NULLIF($2, ''), karyawan_documents.cv_url),
           pas_foto_url = COALESCE(NULLIF($3, ''), karyawan_documents.pas_foto_url),
           scan_ktp_url = COALESCE(NULLIF($4, ''), karyawan_documents.scan_ktp_url),
           ijazah_url = COALESCE(NULLIF($5, ''), karyawan_documents.ijazah_url),
           transkrip_url = COALESCE(NULLIF($6, ''), karyawan_documents.transkrip_url),
           kartu_keluarga_url = COALESCE(NULLIF($7, ''), karyawan_documents.kartu_keluarga_url),
           str_url = COALESCE(NULLIF($8, ''), karyawan_documents.str_url),
           paklaring_url = COALESCE(NULLIF($9, ''), karyawan_documents.paklaring_url),
           updated_at = NOW()`,
        [
          id,
          documents.cv_url || null,
          documents.pas_foto_url || null,
          documents.scan_ktp_url || null,
          documents.ijazah_url || null,
          documents.transkrip_url || null,
          documents.kartu_keluarga_url || null,
          documents.str_url || null,
          documents.paklaring_url || null,
        ]
      );
    }

    // 9. Replace Other Documents
    await client.query(`DELETE FROM karyawan_other_documents WHERE karyawan_id = $1`, [id]);
    if (Array.isArray(otherDocuments)) {
      for (const od of otherDocuments) {
        if (!hasText(od.nama_dokumen) || !hasText(od.file_url)) continue;
        await client.query(
          `INSERT INTO karyawan_other_documents (karyawan_id, nama_dokumen, file_url)
           VALUES ($1, $2, $3)`,
          [id, od.nama_dokumen.trim(), od.file_url.trim()]
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Profil lengkap dan berkas dokumen berhasil disimpan.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error saving profile-lengkap karyawan:", err);
    return NextResponse.json(
      {
        message: "Gagal menyimpan perubahan profil karyawan.",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
