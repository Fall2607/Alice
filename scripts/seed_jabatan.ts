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

    const dbDepartemenRes = await pool.query('SELECT id, nama_departemen FROM departemen');
    const dbDepartemen = dbDepartemenRes.rows;

    const dbLevelJabatanRes = await pool.query('SELECT id, nama_level FROM level_jabatan');
    const dbLevelJabatan = dbLevelJabatanRes.rows;

    let insertedCount = 0;

    const unitMapping: Record<string, string> = {
      'ADMINISTRASI': 'ADM',
      'GA': 'GA - UMUM'
    };

    for (const item of unitMatrix) {
      // Find matching departemen (case insensitive)
      const unitName = unitMapping[item.unit.toUpperCase()] || item.unit;
      const dept = dbDepartemen.find(d => d.nama_departemen.toUpperCase() === unitName.toUpperCase());

      
      if (dept) {
        // Iterate through roles: staff, supervisor, koordinator, komite
        const roles = ['staff', 'supervisor', 'koordinator', 'komite'];
        for (const role of roles) {
          if (item[role] > 0) {
            // Find level_jabatan id
            const level = dbLevelJabatan.find(l => l.nama_level.toUpperCase() === role.toUpperCase());
            if (level) {
              // Check if already exists
              const existRes = await pool.query(
                'SELECT id FROM jabatan WHERE departemen_id = $1 AND level_jabatan_id = $2',
                [dept.id, level.id]
              );
              if (existRes.rowCount === 0) {
                await pool.query(
                  'INSERT INTO jabatan (departemen_id, level_jabatan_id) VALUES ($1, $2)',
                  [dept.id, level.id]
                );
                insertedCount++;
              }
            }
          }
        }
      }
    }

    console.log(`Berhasil menambahkan ${insertedCount} data jabatan baru dari unit yang cocok.`);

  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

main();
