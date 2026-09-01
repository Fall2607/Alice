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

async function resetAdmin001Test() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Cari karyawan NIP ADMIN-001
    const empRes = await client.query(
      `SELECT id, nip, nama_lengkap, email FROM karyawan WHERE nip = $1 OR nip LIKE '%ADMIN%'`,
      ['ADMIN-001']
    );

    console.log("Found Karyawan:", empRes.rows);

    if (empRes.rows.length === 0) {
      console.log("Karyawan NIP ADMIN-001 tidak ditemukan.");
      await client.query("ROLLBACK");
      return;
    }

    const karyawanIds = empRes.rows.map(r => r.id);

    // 2. Cari employee_assessments untuk karyawan ini
    const eaRes = await client.query(
      `SELECT id, token, access_code, status FROM employee_assessments WHERE karyawan_id = ANY($1::uuid[])`,
      [karyawanIds]
    );

    console.log("Found Employee Assessments:", eaRes.rows);

    const assessmentIds = eaRes.rows.map(r => r.id);

    if (assessmentIds.length > 0) {
      // 3. Hapus hasil tes MBTI, DISC, PAPI yang mungkin tersimpan
      await client.query(`DELETE FROM mbti_test_results WHERE assessment_id = ANY($1::uuid[])`, [assessmentIds]);
      await client.query(`DELETE FROM disc_test_results WHERE assessment_id = ANY($1::uuid[])`, [assessmentIds]);
      await client.query(`DELETE FROM papi_test_results WHERE assessment_id = ANY($1::uuid[])`, [assessmentIds]);

      // 4. Reset status employee_assessments ke 'INVITED'
      await client.query(
        `UPDATE employee_assessments SET status = 'INVITED' WHERE id = ANY($1::uuid[])`,
        [assessmentIds]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Berhasil mereset status tes NIP ADMIN-001 kembali ke 'INVITED' & menghapus data hasil tes percobaan.");

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error reset:", error);
  } finally {
    client.release();
    process.exit(0);
  }
}

resetAdmin001Test();
