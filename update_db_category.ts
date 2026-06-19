import pool from "./src/app/lib/db";

async function addCategoryToAssessments() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Menambahkan kolom category pada tabel job_assessments...");
    
    await client.query(`
      ALTER TABLE job_assessments 
      ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'Umum';
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

addCategoryToAssessments();
