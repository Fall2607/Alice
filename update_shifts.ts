import pool from './src/app/lib/db';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually
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

async function main() {
  try {
    const res = await pool.query("SELECT id, nama_shift FROM shift");
    console.log("Current shifts:", res.rows);

    const oldShifts = ["Shift 1", "Shift 2", "Shift 3", "Shift Pagi", "Shift Siang", "Shift Malam", "Pagi", "Siang", "Malam"];
    
    for (const row of res.rows) {
        if (oldShifts.includes(row.nama_shift) || row.nama_shift.match(/Shift [123]/)) {
            console.log(`Deleting ${row.nama_shift} (ID: ${row.id})`);
            await pool.query("DELETE FROM karyawan_shift WHERE shift_id = $1", [row.id]);
            await pool.query("DELETE FROM jadwal_kerja_detail WHERE shift_id = $1", [row.id]);
            await pool.query("DELETE FROM shift WHERE id = $1", [row.id]);
        }
    }

    const newShifts = [
      { name: "Of1.1", start: "08:00", end: "17:00" },
      { name: "NS1.1", start: "08:00", end: "16:00" },
      { name: "NS1.2", start: "08:00", end: "13:00" },
      { name: "Pagi1.1", start: "07:00", end: "14:00" },
      { name: "Siang1.6", start: "14:00", end: "21:00" },
      { name: "Malam1.2", start: "21:00", end: "07:00" },
      { name: "Shift1.3", start: "06:00", end: "14:00" },
      { name: "Middle1.2", start: "10:00", end: "18:00" },
      { name: "Siang1.7", start: "14:00", end: "22:00" },
      { name: "Middle1.8", start: "12:00", end: "19:00" },
      { name: "Shift1.6", start: "08:00", end: "15:00" },
      { name: "Pagi1.2", start: "07:00", end: "15:00" },
      { name: "Middle1.6", start: "12:00", end: "20:00" },
      { name: "Middle1.10", start: "09:00", end: "17:00" },
      { name: "Shift1", start: "05:00", end: "13:00" },
      { name: "Siang1", start: "11:00", end: "19:00" },
      { name: "Middle1.3", start: "11:00", end: "18:00" },
      { name: "Middle1.7", start: "10:00", end: "17:00" },
      { name: "Siang1.5", start: "13:00", end: "19:00" },
      { name: "Siang1.2", start: "13:00", end: "20:00" },
      { name: "Shift1.4", start: "06:30", end: "13:30" },
      { name: "Siang1.4", start: "13:30", end: "20:30" },
      { name: "Malam1", start: "20:30", end: "06:30" },
    ];

    for (const s of newShifts) {
      const hStart = parseInt(s.start.split(":")[0]);
      const hEnd = parseInt(s.end.split(":")[0]);
      const isCross = hEnd < hStart;

      const exist = await pool.query("SELECT id FROM shift WHERE nama_shift = $1", [s.name]);
      if (exist.rows.length > 0) {
        await pool.query(`
          UPDATE shift SET jam_masuk = $1, jam_keluar = $2, is_cross_day = $3 WHERE nama_shift = $4
        `, [s.start, s.end, isCross, s.name]);
      } else {
        await pool.query(`
          INSERT INTO shift (nama_shift, jam_masuk, jam_keluar, is_cross_day)
          VALUES ($1, $2, $3, $4)
        `, [s.name, s.start, s.end, isCross]);
      }
    }

    console.log("Successfully updated shifts");

  } catch (e) {
    console.error("Error updating shifts:", e);
  } finally {
    process.exit(0);
  }
}

main();
