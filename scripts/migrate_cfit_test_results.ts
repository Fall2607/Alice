import fs from 'fs';
import path from 'path';

// Parse .env.local
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

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('1. Membuat tabel public.cfit_test_results jika belum ada...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.cfit_test_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assessment_id UUID NOT NULL,
        raw_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
        subtest_1_score INTEGER NOT NULL DEFAULT 0,
        subtest_2_score INTEGER NOT NULL DEFAULT 0,
        subtest_3_score INTEGER NOT NULL DEFAULT 0,
        subtest_4_score INTEGER NOT NULL DEFAULT 0,
        total_score INTEGER NOT NULL DEFAULT 0,
        iq_score INTEGER NOT NULL DEFAULT 0,
        category VARCHAR(100) NOT NULL,
        time_spent_seconds JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_cfit_test_results_assessment_id 
        ON public.cfit_test_results(assessment_id);

      CREATE INDEX IF NOT EXISTS idx_cfit_test_results_iq 
        ON public.cfit_test_results(iq_score);
    `);

    await client.query('COMMIT');
    console.log('Migrasi tabel cfit_test_results BERHASIL dibuat!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migrasi GAGAL:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
