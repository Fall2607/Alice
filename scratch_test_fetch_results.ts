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

async function testFetchEmpResults() {
  try {
    const eaRes = await pool.query(`SELECT id FROM employee_assessments ORDER BY created_at DESC LIMIT 1`);
    if (eaRes.rows.length === 0) return;

    const id = eaRes.rows[0].id;
    const [mbti, disc, papi] = await Promise.all([
      pool.query(`SELECT * FROM mbti_test_results WHERE assessment_id = $1`, [id]),
      pool.query(`SELECT * FROM disc_test_results WHERE assessment_id = $1`, [id]),
      pool.query(`SELECT * FROM papi_test_results WHERE assessment_id = $1`, [id]),
    ]);

    console.log("Assessment ID:", id);
    console.log("MBTI:", mbti.rows[0] || null);
    console.log("DISC:", disc.rows[0] || null);
    console.log("PAPI:", papi.rows[0] || null);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

testFetchEmpResults();
