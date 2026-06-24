import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#\s][^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

import { Pool } from 'pg';


const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: String(process.env.PGPASSWORD),
  port: Number(process.env.PGPORT) || 5432,
});

async function main() {
  try {
    const rawData = fs.readFileSync(path.join(process.cwd(), 'docx/unitdanjabatan.json'), 'utf-8');
    const jsonData = JSON.parse(rawData);

    const unitMatrix = jsonData.unit_position_matrix;
    const jsonUnits = unitMatrix.map((item: any) => item.unit);
    const jsonLevels = Object.keys(unitMatrix[0]).filter(k => k !== 'unit' && k !== 'total');

    const dbDepartemenRes = await pool.query('SELECT id, nama_departemen FROM departemen');
    const dbDepartemen = dbDepartemenRes.rows;
    const dbDepartemenNames = dbDepartemen.map(d => d.nama_departemen);

    const dbLevelJabatanRes = await pool.query('SELECT id, nama_level FROM level_jabatan');
    const dbLevelJabatan = dbLevelJabatanRes.rows;
    const dbLevelNames = dbLevelJabatan.map(l => l.nama_level);

    console.log('--- PERBANDINGAN DEPARTEMEN ---');
    console.log(`Ada di JSON tapi tidak ada di DB:`, jsonUnits.filter((u: string) => !dbDepartemenNames.some(d => d.toUpperCase() === u.toUpperCase())));
    console.log(`Ada di DB tapi tidak ada di JSON:`, dbDepartemenNames.filter((d: string) => !jsonUnits.some((u: string) => d.toUpperCase() === u.toUpperCase())));

    console.log('\n--- PERBANDINGAN LEVEL JABATAN ---');
    console.log(`Level dari JSON:`, jsonLevels);
    console.log(`Level dari DB:`, dbLevelNames);
    
  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

main();
