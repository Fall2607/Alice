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

async function testBatchQuery() {
  try {
    const query = `
      SELECT 
        ea.id,
        ea.karyawan_id,
        k.nip,
        k.nama_lengkap,
        k.email,
        k.status_kepegawaian,
        d.nama_departemen,
        k.profesi as nama_jabatan,
        ea.batch_name,
        ea.token,
        ea.access_code,
        ea.status,
        ea.scheduled_date,
        ea.valid_from,
        ea.expires_at,
        ea.created_at,
        (SELECT 1 FROM mbti_test_results m WHERE m.assessment_id = ea.id LIMIT 1) IS NOT NULL as has_mbti,
        (SELECT 1 FROM disc_test_results d WHERE d.assessment_id = ea.id LIMIT 1) IS NOT NULL as has_disc,
        (SELECT 1 FROM papi_test_results p WHERE p.assessment_id = ea.id LIMIT 1) IS NOT NULL as has_papi
      FROM public.employee_assessments ea
      JOIN public.karyawan k ON ea.karyawan_id = k.id
      LEFT JOIN public.jabatan j ON k.jabatan_id = j.id
      LEFT JOIN public.departemen d ON j.departemen_id = d.id
      ORDER BY ea.created_at DESC, k.nama_lengkap ASC
    `;

    const res = await pool.query(query);
    console.log("✅ Query Berhasil! Total baris employee_assessments:", res.rows.length);
  } catch (e) {
    console.error("❌ Query Gagal:", e);
  } finally {
    process.exit(0);
  }
}

testBatchQuery();
