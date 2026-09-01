import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^#\s][^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = process.env[key] || value;
    }
  });
}

import pool from './src/app/lib/db';

async function clearAllEmployeeAssessments() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Ambil semua ID dari employee_assessments
    const eaRes = await client.query(`SELECT id FROM public.employee_assessments`);
    const empAssessmentIds = eaRes.rows.map(r => r.id);

    console.log(`Ditemukan ${empAssessmentIds.length} data assessment karyawan.`);

    if (empAssessmentIds.length > 0) {
      // 2. Hapus hasil tes MBTI, DISC, PAPI terkait assessment karyawan
      const delMbti = await client.query(`DELETE FROM public.mbti_test_results WHERE assessment_id = ANY($1::uuid[])`, [empAssessmentIds]);
      const delDisc = await client.query(`DELETE FROM public.disc_test_results WHERE assessment_id = ANY($1::uuid[])`, [empAssessmentIds]);
      const delPapi = await client.query(`DELETE FROM public.papi_test_results WHERE assessment_id = ANY($1::uuid[])`, [empAssessmentIds]);

      console.log(`Hapus MBTI results: ${delMbti.rowCount}`);
      console.log(`Hapus DISC results: ${delDisc.rowCount}`);
      console.log(`Hapus PAPI results: ${delPapi.rowCount}`);

      // 3. Hapus seluruh data di employee_assessments
      const delEa = await client.query(`DELETE FROM public.employee_assessments`);
      console.log(`Hapus Batch Employee Assessments: ${delEa.rowCount}`);
    }

    await client.query("COMMIT");
    console.log("✅ Berhasil mengosongkan seluruh batch dan data tes Assesmen Karyawan!");

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Gagal mengosongkan data:", error);
  } finally {
    client.release();
    process.exit(0);
  }
}

clearAllEmployeeAssessments();
