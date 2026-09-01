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
import { calculateDISCResult } from './src/app/utils/discUtils';

async function testDiscSubmit() {
  try {
    const assessment_id = 'b3ae6e3e-2dd6-438f-98f6-22d590077d4d'; // NIP ADMIN-001 assessment
    const dummyAnswers = {
      1: { most: '1', least: '2' },
      2: { most: '1', least: '3' }
    };
    const result = calculateDISCResult(dummyAnswers);
    console.log("Calculated Result:", result);

    const check = await pool.query(`SELECT id FROM disc_test_results WHERE assessment_id = $1`, [assessment_id]);
    if ((check.rowCount ?? 0) > 0) {
      await pool.query(
        `UPDATE disc_test_results SET 
         raw_answers = $2, most_d = $3, most_i = $4, most_s = $5, most_c = $6,
         least_d = $7, least_i = $8, least_s = $9, least_c = $10, diff_d = $11, diff_i = $12, diff_s = $13, diff_c = $14
         WHERE assessment_id = $1`,
        [assessment_id, JSON.stringify(dummyAnswers), result.most.D, result.most.I, result.most.S, result.most.C, result.least.D, result.least.I, result.least.S, result.least.C, result.diff.D, result.diff.I, result.diff.S, result.diff.C]
      );
    } else {
      await pool.query(
        `INSERT INTO disc_test_results 
         (assessment_id, raw_answers, most_d, most_i, most_s, most_c, least_d, least_i, least_s, least_c, diff_d, diff_i, diff_s, diff_c) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [assessment_id, JSON.stringify(dummyAnswers), result.most.D, result.most.I, result.most.S, result.most.C, result.least.D, result.least.I, result.least.S, result.least.C, result.diff.D, result.diff.I, result.diff.S, result.diff.C]
      );
    }

    console.log("✅ DISC Submit succeeded!");
  } catch (e: any) {
    console.error("❌ DISC Submit Error:", e);
  } finally {
    process.exit(0);
  }
}

testDiscSubmit();
