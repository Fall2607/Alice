import pool from "./src/app/lib/db";

async function seedAssessments() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Memperbaiki Foreign Key job_assessments...");
    // Bersihkan data lama yang salah reference
    await client.query("DELETE FROM job_assessments");

    // Drop constraint lama (yang salah mengarah ke job_openings)
    await client.query(`
      ALTER TABLE job_assessments 
      DROP CONSTRAINT IF EXISTS fk_job_openings;
    `);

    // Tambahkan constraint baru yang mengarah ke tabel job (menggunakan ON DELETE CASCADE)
    // Coba tambahkan, tapi drop dulu constraint yang namanya mungkin berbeda
    await client.query(`
      ALTER TABLE job_assessments 
      DROP CONSTRAINT IF EXISTS job_assessments_job_id_fkey;
    `);

    await client.query(`
      ALTER TABLE job_assessments 
      ADD CONSTRAINT job_assessments_job_id_fkey 
      FOREIGN KEY (job_id) REFERENCES job(id) ON DELETE CASCADE;
    `);

    console.log("Mengambil semua master job...");
    const jobsResult = await client.query("SELECT id, nama_job FROM job");
    const jobs = jobsResult.rows;

    console.log(`Ditemukan ${jobs.length} master job. Memulai proses seeding...`);

    for (const job of jobs) {
      // 1. Soal Gaji (NUMBER)
      const gajiQuestion = "Berapa ekspektasi gaji Anda per bulan?";
      const gajiConfig = {
        ideal_min: 4000000,
        ideal_max: 6000000,
        tolerance_min: 3500000,
        tolerance_max: 8000000,
      };

      // 2. Soal Kompetensi (SCALE)
      const kompetensiQuestion = `Seberapa mahir Anda dalam menguasai keterampilan yang dibutuhkan untuk posisi ${job.nama_job}? (1-5)`;
      const kompetensiConfig = {
        target_score: 5,
        min_score: 2,
      };

      // 3. Soal Shifting (CHOICE)
      const shiftingQuestion = "Apakah Anda bersedia untuk bekerja dengan sistem shift (termasuk malam dan hari libur)?";
      const shiftingConfig = {
        "Ya, sangat bersedia": 100,
        "Ya, tapi dengan syarat tertentu": 70,
        "Tidak bersedia": 0,
      };

      // 4. Soal Pengalaman Spesifik (CHOICE) - Menjawab feedback AI terkait relevansi pengalaman
      const expQuestion = `Berapa lama pengalaman kerja Anda yang secara KHUSUS relevan dengan posisi ${job.nama_job} (bukan di bidang lain)?`;
      const expConfig = {
        "Belum ada pengalaman relevan": 0,
        "Kurang dari 1 tahun": 40,
        "1 - 3 tahun": 80,
        "Lebih dari 3 tahun": 100,
      };

      // 5. Soal Edukasi / Penilaian Sistem (SYSTEM_EDUCATION)
      const jobName = job.nama_job.toLowerCase();
      let keywords = "";
      let levelConfig = { "SMA": 40, "D3": 80, "S1": 100, "S2": 100, "S3": 100 };
      
      if (jobName.includes("it") || jobName.includes("programmer") || jobName.includes("sistem") || jobName.includes("data")) {
          keywords = "informatika, komputer, sistem informasi, software, teknologi, it";
      } else if (jobName.includes("perawat") || jobName.includes("nurse")) {
          keywords = "keperawatan, ners, kesehatan";
      } else if (jobName.includes("admin") || jobName.includes("keuangan") || jobName.includes("billing")) {
          keywords = "akuntansi, manajemen, administrasi, ekonomi, bisnis, keuangan";
      } else if (jobName.includes("medis") || jobName.includes("dokter")) {
          keywords = "kedokteran, medis, profesi dokter";
          levelConfig = { "SMA": 0, "D3": 0, "S1": 100, "S2": 100, "S3": 100 };
      } else if (jobName.includes("farmasi") || jobName.includes("apoteker")) {
          keywords = "farmasi, apoteker, obat";
      } else if (jobName.includes("lab") || jobName.includes("analis")) {
          keywords = "analis kesehatan, laboratorium medis, biologi";
      } else {
          keywords = "semua jurusan, manajemen, umum, komunikasi";
      }

      const eduConfig = {
          keywords: keywords,
          ...levelConfig,
          min_ipk: 2.75,
          ideal_ipk: 3.5
      };

      // Insert ke job_assessments
      await client.query(
        `INSERT INTO job_assessments (job_id, question, type, fuzzy_config, weight, category) 
         VALUES ($1, $2, 'NUMBER'::assessment_type, $3::jsonb, $4, 'Umum')`,
        [job.id, gajiQuestion, JSON.stringify(gajiConfig), 1.0]
      );

      await client.query(
        `INSERT INTO job_assessments (job_id, question, type, fuzzy_config, weight, category) 
         VALUES ($1, $2, 'SCALE'::assessment_type, $3::jsonb, $4, 'Umum')`,
        [job.id, kompetensiQuestion, JSON.stringify(kompetensiConfig), 1.5]
      );

      await client.query(
        `INSERT INTO job_assessments (job_id, question, type, fuzzy_config, weight, category) 
         VALUES ($1, $2, 'CHOICE'::assessment_type, $3::jsonb, $4, 'Umum')`,
        [job.id, shiftingQuestion, JSON.stringify(shiftingConfig), 1.0]
      );

      await client.query(
        `INSERT INTO job_assessments (job_id, question, type, fuzzy_config, weight, category) 
         VALUES ($1, $2, 'CHOICE'::assessment_type, $3::jsonb, $4, 'Umum')`,
        [job.id, expQuestion, JSON.stringify(expConfig), 2.0]
      );

      await client.query(
        `INSERT INTO job_assessments (job_id, question, type, fuzzy_config, weight, category) 
         VALUES ($1, $2, 'SYSTEM_EDUCATION'::assessment_type, $3::jsonb, $4, 'Umum')`,
        [job.id, "Penilaian Pendidikan Sistem", JSON.stringify(eduConfig), 3.0]
      );
    }

    await client.query("COMMIT");
    console.log(`✅ Berhasil melakukan seeding 3 pertanyaan untuk ${jobs.length} master job!`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Gagal Seeding:", error);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedAssessments();
