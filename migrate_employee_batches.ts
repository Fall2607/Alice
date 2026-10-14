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
    console.log('1. Membuat tabel employee_assessment_batches jika belum ada...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.employee_assessment_batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        batch_name VARCHAR(255) NOT NULL,
        description TEXT,
        scheduled_date DATE NOT NULL,
        valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_emp_assessment_batches_name ON public.employee_assessment_batches(batch_name);
      CREATE INDEX IF NOT EXISTS idx_emp_assessment_batches_scheduled ON public.employee_assessment_batches(scheduled_date);
    `);

    console.log('2. Menambahkan kolom batch_id di employee_assessments jika belum ada...');
    await client.query(`
      ALTER TABLE public.employee_assessments 
      ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.employee_assessment_batches(id) ON DELETE CASCADE;

      CREATE INDEX IF NOT EXISTS idx_emp_assessments_batch_id ON public.employee_assessments(batch_id);
    `);

    console.log('3. Cek data employee_assessments yang belum memiliki batch_id...');
    const unlinkedRes = await client.query(`
      SELECT id, batch_name, scheduled_date, valid_from, expires_at, created_at
      FROM public.employee_assessments
      WHERE batch_id IS NULL
    `);

    console.log(`Ditemukan ${unlinkedRes.rows.length} entri employee_assessments tanpa batch_id.`);

    if (unlinkedRes.rows.length > 0) {
      // Kelompokkan berdasarkan batch_name & scheduled_date (atau tanggal created_at)
      const groups = new Map<string, typeof unlinkedRes.rows>();

      for (const row of unlinkedRes.rows) {
        // format key
        const schedStr = new Date(row.scheduled_date).toISOString().split('T')[0];
        const groupKey = `${row.batch_name}___${schedStr}`;
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(row);
      }

      console.log(`Ditemukan ${groups.size} kelompok batch unik dari data lama.`);

      for (const [groupKey, rows] of groups.entries()) {
        const first = rows[0];
        const batchName = first.batch_name;
        const scheduledDate = first.scheduled_date;
        const validFrom = first.valid_from;
        const expiresAt = first.expires_at;
        const createdAt = first.created_at;

        // Insert batch baru
        const batchInsert = await client.query(
          `INSERT INTO public.employee_assessment_batches 
           (batch_name, scheduled_date, valid_from, expires_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $5)
           RETURNING id`,
          [batchName, scheduledDate, validFrom, expiresAt, createdAt]
        );

        const newBatchId = batchInsert.rows[0].id;
        const rowIds = rows.map(r => r.id);

        await client.query(
          `UPDATE public.employee_assessments 
           SET batch_id = $1 
           WHERE id = ANY($2::uuid[])`,
          [newBatchId, rowIds]
        );

        console.log(`✅ Berhasil menghubungkan batch "${batchName}" (ID: ${newBatchId}) dengan ${rowIds.length} data karyawan.`);
      }
    }

    await client.query('COMMIT');
    console.log('🎉 Migrasi selesai dengan sukses!');

    // Verifikasi
    const checkBatches = await client.query(`SELECT id, batch_name, scheduled_date, created_at FROM public.employee_assessment_batches`);
    console.log(`Total employee_assessment_batches: ${checkBatches.rows.length}`);
    console.table(checkBatches.rows);

    const checkAssessments = await client.query(`SELECT count(*) as total, count(batch_id) as linked FROM public.employee_assessments`);
    console.log('Status relasi employee_assessments:', checkAssessments.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migrasi gagal:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
