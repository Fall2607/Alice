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

async function checkEmpAssessments() {
  try {
    const empAssessments = await pool.query(`SELECT * FROM employee_assessments`);
    console.log("Employee Assessments:", empAssessments.rows);

    for (const ea of empAssessments.rows) {
      const mbti = await pool.query(`SELECT id FROM mbti_test_results WHERE assessment_id = $1`, [ea.id]);
      const disc = await pool.query(`SELECT id FROM disc_test_results WHERE assessment_id = $1`, [ea.id]);
      const papi = await pool.query(`SELECT id FROM papi_test_results WHERE assessment_id = $1`, [ea.id]);
      console.log(`Assessment ID ${ea.id} (Status: ${ea.status}):`, {
        mbti_completed: mbti.rowCount > 0,
        disc_completed: disc.rowCount > 0,
        papi_completed: papi.rowCount > 0,
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkEmpAssessments();
