import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Helper function untuk menghitung jarak Euclidean (Euclidean Distance)
// Semakin kecil nilainya, semakin mirip wajahnya (biasanya threshold 0.45 - 0.5)
function euclideanDistance(desc1: number[], desc2: number[]): number {
  if (desc1.length !== desc2.length) return 999;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
}

export async function POST(request: NextRequest) {
  try {
    const { descriptor, type } = await request.json();

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json({ message: "Data biometrik tidak valid atau rusak." }, { status: 400 });
    }

    // 1. Ambil semua karyawan yang sudah mendaftarkan wajahnya
    const karyawanRes = await pool.query(
      `SELECT k.id, k.nama_lengkap, k.face_descriptor, lj.nama_level as jabatan 
       FROM karyawan k 
       LEFT JOIN jabatan j ON k.jabatan_id = j.id
       LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
       WHERE k.face_descriptor IS NOT NULL`
    );

    if (karyawanRes.rows.length === 0) {
      return NextResponse.json({ message: "Belum ada karyawan yang mendaftarkan data wajah." }, { status: 404 });
    }

    let bestMatch: any = null;
    let minDistance = 999;

    // 2. Loop dan cari wajah yang paling mirip (Threshold standar FaceAPI = 0.5, kita pakai 0.45 agar lebih ketat)
    for (const row of karyawanRes.rows) {
      // Parse descriptor dari database (JSON string/array)
      let dbDescriptor: number[] = [];
      if (typeof row.face_descriptor === 'string') {
          dbDescriptor = JSON.parse(row.face_descriptor);
      } else if (Array.isArray(row.face_descriptor)) {
          dbDescriptor = row.face_descriptor;
      }

      if (dbDescriptor.length === 128) {
        const distance = euclideanDistance(descriptor, dbDescriptor);
        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = row;
        }
      }
    }

    const MATCH_THRESHOLD = 0.45;

    if (!bestMatch || minDistance > MATCH_THRESHOLD) {
      return NextResponse.json(
        { message: "Wajah tidak dikenali. Pastikan posisi wajah sesuai dan pencahayaan cukup." }, 
        { status: 401 }
      );
    }

    // 3. Wajah Dikenali -> Proses Absensi (Masuk / Keluar)
    // Ambil waktu persis di Jakarta (WIB) menghindari offset server Vercel (UTC) dan DB (Rangoon)
    const wibString = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
    const today = new Date(wibString);
    const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Cek apakah karyawan ini sudah absen hari ini
    const absenRes = await pool.query(
      `SELECT * FROM absensi WHERE karyawan_id = $1 AND tanggal = $2`,
      [bestMatch.id, localDateStr]
    );

    let absensiRecord = null;
    let jenisAbsen = "";

    if (type === "in") {
      if (absenRes.rows.length > 0) {
         return NextResponse.json({ 
           message: "Anda sudah melakukan Check-In hari ini.",
           user: { nama: bestMatch.nama_lengkap }
         }, { status: 409 });
      }

      // --- PROSES CHECK-IN ---
      const dayOfWeek = today.getDay();
      const shiftQuery = await pool.query(`
        WITH TargetShift AS (
            SELECT COALESCE(
                (SELECT shift_id FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2),
                (SELECT jkd.shift_id 
                 FROM karyawan k 
                 JOIN jadwal_kerja_detail jkd ON k.jadwal_kerja_id = jkd.jadwal_kerja_id 
                 WHERE k.id = $1 AND jkd.hari = $3)
            ) AS shift_id
        )
        SELECT s.id, s.jam_masuk, s.jam_keluar, s.nama_shift
        FROM shift s
        JOIN TargetShift ts ON ts.shift_id = s.id;
      `, [bestMatch.id, localDateStr, dayOfWeek]);

      let jamMasukNormal = new Date(today);
      jamMasukNormal.setHours(8, 0, 0, 0); // Default 08:00
      let appliedShiftId = null;
      let isLate = false;
      let menitTerlambat = 0;

      let isSpvOrKoor = false;
      if (bestMatch.jabatan) {
          const jab = bestMatch.jabatan.toLowerCase();
          if (jab.includes('supervisor') || jab.includes('koordinator') || jab.includes('manajer') || jab.includes('manager') || jab.includes('direktur')) {
              isSpvOrKoor = true;
          }
      }

      if (shiftQuery.rows.length > 0) {
        let shiftData = shiftQuery.rows[0];
        
        // --- DYNAMIC SPV/KOOR OVERRIDE (Senin - Jumat) ---
        if (isSpvOrKoor && dayOfWeek >= 1 && dayOfWeek <= 5) {
            // Check if they have a shift this Saturday
            // 6 - dayOfWeek gives us the offset to Saturday
            const daysToSaturday = 6 - dayOfWeek;
            const saturdayDate = new Date(today);
            saturdayDate.setDate(today.getDate() + daysToSaturday);
            const satDateStr = new Date(saturdayDate.getTime() - (saturdayDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            
            const piketRes = await pool.query(
                `SELECT shift_id FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2`,
                [bestMatch.id, satDateStr]
            );
            
            if (piketRes.rows.length > 0 && piketRes.rows[0].shift_id) {
                // Ada piket sabtu -> Shift Senin-Jumat jadi 8-4
                const shift84Res = await pool.query(`SELECT * FROM shift WHERE nama_shift LIKE '%8-4 (Senin-Jumat)%' LIMIT 1`);
                if (shift84Res.rows.length > 0) shiftData = shift84Res.rows[0];
            } else {
                // Tidak ada piket sabtu -> Shift Senin-Jumat jadi 8-5
                const shift85Res = await pool.query(`SELECT * FROM shift WHERE nama_shift LIKE '%8-5%' LIMIT 1`);
                if (shift85Res.rows.length > 0) shiftData = shift85Res.rows[0];
            }
        }

        if (!shiftData.jam_masuk) {
            return NextResponse.json({ 
               message: "Jadwal Anda hari ini adalah Libur/Off. Akses Check-In ditolak.",
               user: { nama: bestMatch.nama_lengkap }
            }, { status: 403 });
        }

        appliedShiftId = shiftData.id;
        const [hours, minutes] = shiftData.jam_masuk.split(':');
        jamMasukNormal.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        // Jika tidak ada shift sama sekali, cek apakah dia SPV/Koor (mungkin belum di assign default)
        if (isSpvOrKoor && dayOfWeek >= 1 && dayOfWeek <= 5) {
            // Sama dengan logika di atas
            const daysToSaturday = 6 - dayOfWeek;
            const saturdayDate = new Date(today);
            saturdayDate.setDate(today.getDate() + daysToSaturday);
            const satDateStr = new Date(saturdayDate.getTime() - (saturdayDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            
            const piketRes = await pool.query(
                `SELECT shift_id FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2`,
                [bestMatch.id, satDateStr]
            );
            
            let targetShiftName = (piketRes.rows.length > 0 && piketRes.rows[0].shift_id) ? '%8-4 (Senin-Jumat)%' : '%8-5%';
            const shiftRes = await pool.query(`SELECT * FROM shift WHERE nama_shift LIKE $1 LIMIT 1`, [targetShiftName]);
            
            if (shiftRes.rows.length > 0) {
                const shiftData = shiftRes.rows[0];
                appliedShiftId = shiftData.id;
                const [hours, minutes] = shiftData.jam_masuk.split(':');
                jamMasukNormal.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            } else {
                return NextResponse.json({ message: "Konfigurasi Shift SPV tidak ditemukan di database." }, { status: 500 });
            }
        } else {
            return NextResponse.json({ 
               message: "Anda tidak memiliki jadwal kerja hari ini (Off / Libur). Akses Check-In ditolak.",
               user: { nama: bestMatch.nama_lengkap }
            }, { status: 403 });
        }
      }

      if (today > jamMasukNormal) {
        menitTerlambat = Math.floor((today.getTime() - jamMasukNormal.getTime()) / 60000);
        if (menitTerlambat > 0) isLate = true;
      }

      const insertRes = await pool.query(
        `INSERT INTO absensi (karyawan_id, tanggal, jam_masuk, menit_terlambat, shift_id, is_late) 
         VALUES ($1, $2, (NOW() AT TIME ZONE 'Asia/Jakarta'), $3, $4, $5) RETURNING *`,
        [bestMatch.id, localDateStr, menitTerlambat, appliedShiftId, isLate]
      );
      
      absensiRecord = insertRes.rows[0];
      jenisAbsen = "Check-In";
      
    } else if (type === "out") {
      if (absenRes.rows.length === 0) {
         return NextResponse.json({ 
           message: "Anda belum melakukan Check-In hari ini.",
           user: { nama: bestMatch.nama_lengkap }
         }, { status: 400 });
      }

      const existingAbsen = absenRes.rows[0];
      
      if (existingAbsen.jam_keluar) {
         return NextResponse.json({ 
           message: "Anda sudah melakukan Check-Out hari ini.",
           user: { nama: bestMatch.nama_lengkap }
         }, { status: 409 });
      }

      // --- PROSES CHECK-OUT ---
      const updateRes = await pool.query(
        `UPDATE absensi SET jam_keluar = (NOW() AT TIME ZONE 'Asia/Jakarta') WHERE id = $1 RETURNING *`,
        [existingAbsen.id]
      );
      absensiRecord = updateRes.rows[0];
      jenisAbsen = "Check-Out";
    } else {
      return NextResponse.json({ message: "Tipe absensi (in/out) tidak valid." }, { status: 400 });
    }

    // 4. Return Data Sukses ke Kiosk
    const responseTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

    return NextResponse.json({
      success: true,
      message: `Berhasil melakukan ${jenisAbsen}`,
      type: jenisAbsen,
      user: {
        nama: bestMatch.nama_lengkap,
        jabatan: bestMatch.jabatan || "Pegawai",
        waktu: responseTime,
        status: absensiRecord.menit_terlambat > 0 ? "Terlambat" : "Tepat Waktu",
        menit_terlambat: absensiRecord.menit_terlambat
      }
    });

  } catch (error: any) {
    console.error("Error Verify Face Absensi:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: error.message },
      { status: 500 }
    );
  }
}
