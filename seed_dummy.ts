import pool from "./src/app/lib/db";
import crypto from "crypto";

async function seedDummy() {
  const client = await pool.connect();
  try {
    console.log("Menambahkan SYSTEM_EDUCATION ke assessment_type ENUM...");
    try {
      await client.query(`ALTER TYPE assessment_type ADD VALUE 'SYSTEM_EDUCATION';`);
      console.log("Berhasil menambah SYSTEM_EDUCATION ke ENUM.");
    } catch (e: any) {
      if (e.code === '42710') {
         console.log("SYSTEM_EDUCATION sudah ada dalam ENUM.");
      } else {
         console.error("Gagal alter enum:", e);
      }
    }

    await client.query("BEGIN");

    console.log("Mengambil satu master job (IT) untuk dijadikan dummy...");
    // Coba cari job yang namanya mengandung 'IT' atau 'Programmer'
    let jobResult = await client.query("SELECT id, nama_job FROM job WHERE nama_job ILIKE '%IT%' OR nama_job ILIKE '%Programmer%' OR nama_job ILIKE '%Software%' LIMIT 1");
    
    if (jobResult.rows.length === 0) {
        // Jika tidak ada, ambil job apa saja
        jobResult = await client.query("SELECT id, nama_job FROM job LIMIT 1");
    }

    if (jobResult.rows.length === 0) {
        throw new Error("Tabel job kosong! Tidak bisa membuat dummy lowongan.");
    }

    const job = jobResult.rows[0];
    const dummyOpeningId = crypto.randomUUID();

    console.log(`Membuat dummy lowongan untuk posisi: ${job.nama_job}`);

    // Insert Lowongan (Job Opening)
    await client.query(`
        INSERT INTO job_openings (id, job_id, title, status, posted_date, closing_date)
        VALUES ($1, $2, $3, 'Published', NOW(), NOW() + INTERVAL '30 days')
        ON CONFLICT (id) DO NOTHING;
    `, [dummyOpeningId, job.id, `Lowongan: ${job.nama_job} (Batch Juni)`]);

    console.log("Membuat Bundle Assessment khusus IT Database...");
    
    // Hapus assessment lama untuk job ini agar rapi (opsional)
    // await client.query("DELETE FROM job_assessments WHERE job_id = $1", [job.id]);

    const eduQuestion = "Sistem mendeteksi pendidikan terakhir Anda.";
    const eduConfig = {
        "S3": 100,
        "S2": 100,
        "S1": 80,
        "D3": 40,
        "SMA": 0,
        "SMK": 0,
        "keywords": "Informatika, Komputer, Sistem Informasi, Software"
    };

    const q1 = await client.query(`
        INSERT INTO job_assessments (job_id, category, question, type, fuzzy_config, weight)
        VALUES ($1, $2, $3, 'SYSTEM_EDUCATION'::assessment_type, $4::jsonb, $5)
        RETURNING id;
    `, [job.id, 'IT Database', eduQuestion, JSON.stringify(eduConfig), 2.0]);

    const gajiConfig = { ideal_min: 5000000, ideal_max: 7000000, tolerance_min: 4000000, tolerance_max: 9000000 };
    const q2 = await client.query(`
        INSERT INTO job_assessments (job_id, category, question, type, fuzzy_config, weight)
        VALUES ($1, $2, $3, 'NUMBER'::assessment_type, $4::jsonb, $5)
        RETURNING id;
    `, [job.id, 'IT Database', 'Ekspektasi Gaji Anda?', JSON.stringify(gajiConfig), 1.0]);

    // Aktifkan bundle ini untuk dummy lowongan yang baru dibuat
    await client.query(`
        INSERT INTO job_opening_assessments (job_opening_id, job_assessment_id, is_active)
        VALUES ($1, $2, true), ($1, $3, true)
        ON CONFLICT DO NOTHING;
    `, [dummyOpeningId, q1.rows[0].id, q2.rows[0].id]);

    await client.query("COMMIT");
    console.log(`✅ Sukses! Lowongan Dummy berhasil dibuat dengan ID: ${dummyOpeningId}`);
    console.log(`Silakan cek halaman Detail Lowongan Anda.`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Gagal Seeding Dummy:", error);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedDummy();
