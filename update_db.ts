import pool from "./src/app/lib/db";

async function updateDB() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Membuat tabel job_opening_assessments...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_opening_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_opening_id UUID NOT NULL REFERENCES job_openings(id) ON DELETE CASCADE,
        job_assessment_id UUID NOT NULL REFERENCES job_assessments(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_opening_id, job_assessment_id)
      );
    `);

    console.log("Membuat tabel candidate_otps...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS candidate_otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_used BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

  // CANDIDATE EDUCATION FORMAL
  await client.query(`
    CREATE TABLE IF NOT EXISTS candidate_education_formal (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
      tingkat VARCHAR(50),
      nama_sekolah VARCHAR(255) NOT NULL,
      jurusan VARCHAR(255),
      tahun_masuk INT,
      tahun_lulus INT,
      nomor_ijazah VARCHAR(100),
      ipk VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

    await client.query("COMMIT");
    console.log("✅ Update Database Berhasil!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Gagal Update Database:", error);
  } finally {
    client.release();
    process.exit(0);
  }
}

updateDB();

