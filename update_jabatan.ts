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
    // 1. Dapatkan ID Level Jabatan Supervisor
    const levelRes = await pool.query(`SELECT id FROM level_jabatan WHERE UPPER(nama_level) = 'SUPERVISOR'`);
    if (levelRes.rowCount === 0) {
      throw new Error("Level jabatan 'Supervisor' tidak ditemukan.");
    }
    const supervisorId = levelRes.rows[0].id;

    // --- BAGIAN 1: HAPUS JABATAN ---
    const departemenHapus = ['CASEMIX', 'LAB', 'BILLING', 'IGD'];
    
    // Cari departemen_id untuk yang akan dihapus
    const deptHapusRes = await pool.query(
      `SELECT id, nama_departemen FROM departemen WHERE UPPER(nama_departemen) = ANY($1::text[])`,
      [departemenHapus]
    );
    
    const idHapus = deptHapusRes.rows.map(d => d.id);
    
    if (idHapus.length > 0) {
      let deleteCount = 0;
      for (const dId of idHapus) {
        const deleteRes = await pool.query(
          `DELETE FROM jabatan WHERE level_jabatan_id = $1 AND departemen_id = $2`,
          [supervisorId, dId]
        );
        deleteCount += deleteRes.rowCount || 0;
      }
      console.log(`Berhasil menghapus ${deleteCount} data jabatan Supervisor dari departemen: ${departemenHapus.join(', ')}`);
    } else {
      console.log(`Tidak menemukan departemen untuk dihapus.`);
    }


    // --- BAGIAN 2: TAMBAH JABATAN BARU ---
    const departemenTambah = ['RANAP', 'RAJAL', 'DENSUS', 'PENUNJANG', 'FINANCE'];
    
    const deptTambahRes = await pool.query(
      `SELECT id, nama_departemen FROM departemen WHERE UPPER(nama_departemen) = ANY($1::text[])`,
      [departemenTambah]
    );

    let insertedCount = 0;
    
    for (const deptName of departemenTambah) {
      const dept = deptTambahRes.rows.find(d => d.nama_departemen.toUpperCase() === deptName);
      if (dept) {
        // Cek apakah sudah ada
        const existRes = await pool.query(
          `SELECT id FROM jabatan WHERE level_jabatan_id = $1 AND departemen_id = $2`,
          [supervisorId, dept.id]
        );
        
        if (existRes.rowCount === 0) {
          await pool.query(
            `INSERT INTO jabatan (departemen_id, level_jabatan_id) VALUES ($1, $2)`,
            [dept.id, supervisorId]
          );
          insertedCount++;
        } else {
            console.log(`Jabatan Supervisor untuk departemen ${deptName} sudah ada.`);
        }
      } else {
        console.log(`Peringatan: Departemen '${deptName}' tidak ditemukan di database.`);
      }
    }

    console.log(`Berhasil menambahkan ${insertedCount} data jabatan Supervisor untuk departemen baru.`);

  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

main();
