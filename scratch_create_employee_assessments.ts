import fs from 'fs';
import path from 'path';

// Parse .env.local manually
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          process.env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
  }
} catch (e) {
  console.error("Could not parse .env.local", e);
}

import pool from "./src/app/lib/db";

async function createTable() {
  const client = await pool.connect();
  try {
    console.log("Membuat tabel employee_assessments...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.employee_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        karyawan_id UUID NOT NULL REFERENCES public.karyawan(id) ON DELETE CASCADE,
        batch_name VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        access_code VARCHAR(10) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'INVITED',
        scheduled_date DATE NOT NULL,
        valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_emp_assessments_token ON public.employee_assessments(token);
      CREATE INDEX IF NOT EXISTS idx_emp_assessments_karyawan ON public.employee_assessments(karyawan_id);
    `);
    console.log("✅ Tabel employee_assessments berhasil dibuat!");
  } catch (error) {
    console.error("❌ Gagal membuat tabel:", error);
  } finally {
    client.release();
    process.exit(0);
  }
}

createTable();
