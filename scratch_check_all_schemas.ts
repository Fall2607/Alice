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

async function checkAllSchemas() {
  try {
    const mbtiCols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mbti_test_results'`);
    console.log("mbti_test_results columns:", mbtiCols.rows.map(r => r.column_name));

    const papiCols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'papi_test_results'`);
    console.log("papi_test_results columns:", papiCols.rows.map(r => r.column_name));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkAllSchemas();
