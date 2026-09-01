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

async function fixFKs() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Dropping strict Foreign Key constraints on assessment_id...");

    await client.query(`
      ALTER TABLE public.mbti_test_results DROP CONSTRAINT IF EXISTS mbti_test_results_assessment_id_fkey;
      ALTER TABLE public.disc_test_results DROP CONSTRAINT IF EXISTS disc_test_results_assessment_id_fkey;
      ALTER TABLE public.papi_test_results DROP CONSTRAINT IF EXISTS papi_test_results_assessment_id_fkey;
    `);

    await client.query("COMMIT");
    console.log("✅ Berhasil menghapus constraint Foreign Key agar mbti, disc, dan papi mendukung baik kandidat maupun karyawan!");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Gagal drop constraint FK:", e);
  } finally {
    client.release();
    process.exit(0);
  }
}

fixFKs();
