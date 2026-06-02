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
    const today = new Date();
    // Konversi ke format YYYY-MM-DD lokal
    const localDateStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

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
      const jamMasukNormal = new Date(today);
      jamMasukNormal.setHours(8, 0, 0, 0);
      
      let menitTerlambat = 0;
      if (today > jamMasukNormal) {
        menitTerlambat = Math.floor((today.getTime() - jamMasukNormal.getTime()) / 60000);
      }

      const insertRes = await pool.query(
        `INSERT INTO absensi (karyawan_id, tanggal, jam_masuk, menit_terlambat) 
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3) RETURNING *`,
        [bestMatch.id, localDateStr, menitTerlambat]
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
        `UPDATE absensi SET jam_keluar = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [existingAbsen.id]
      );
      absensiRecord = updateRes.rows[0];
      jenisAbsen = "Check-Out";
    } else {
      return NextResponse.json({ message: "Tipe absensi (in/out) tidak valid." }, { status: 400 });
    }

    // 4. Return Data Sukses ke Kiosk
    const responseTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

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
