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

async function updateMenuIcon() {
  try {
    const res = await pool.query(
      `UPDATE menus SET icon = 'ClipboardCheck' WHERE path = '/admin/karyawan-test'`
    );
    console.log("✅ Berhasil mengubah ikon menu Assesmen Karyawan menjadi 'ClipboardCheck'");
  } catch (e) {
    console.error("Gagal update icon:", e);
  } finally {
    process.exit(0);
  }
}

updateMenuIcon();
