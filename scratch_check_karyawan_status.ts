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

async function checkKaryawanData() {
  try {
    const res = await pool.query(
      `SELECT id, nip, nama_lengkap, email, status_kepegawaian, is_active FROM karyawan LIMIT 20`
    );
    console.log("Karyawan Count:", res.rows.length);
    console.table(res.rows);

    const statuses = await pool.query(
      `SELECT DISTINCT status_kepegawaian FROM karyawan`
    );
    console.log("Distinct Statuses:", statuses.rows);
  } catch (e) {
    console.error("Error check karyawan:", e);
  } finally {
    process.exit(0);
  }
}

checkKaryawanData();
