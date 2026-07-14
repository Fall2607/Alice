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
    const { descriptor, type, forceEarlyOut, forceNewCheckIn, karyawan_id } = await request.json();

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json({ message: "Data biometrik tidak valid atau rusak." }, { status: 400 });
    }

    let queryStr = `SELECT k.id, k.nama_lengkap, k.face_descriptor, lj.nama_level as jabatan 
       FROM karyawan k 
       LEFT JOIN jabatan j ON k.jabatan_id = j.id
       LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
       WHERE k.face_descriptor IS NOT NULL`;
    let queryParams: any[] = [];
       
    if (karyawan_id) {
       queryStr += ` AND k.id = $1`;
       queryParams.push(karyawan_id);
    }
    
    const karyawanRes = await pool.query(queryStr, queryParams);

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

    // Threshold standar FaceAPI = 0.5. 
    // Jika karyawan_id diberikan (user sudah input NIP terlebih dahulu), kita hanya melakukan pencocokan 1-to-1.
    // Karena NIP sudah menjadi lapis keamanan pertama, kita bisa sangat melonggarkan threshold wajah ke 0.55 atau 0.6
    // agar karyawan lebih mudah absen meski pencahayaan kurang baik atau memakai kacamata/masker sebagian.
    // Jika tanpa NIP (1-to-N pencocokan massal), kita gunakan 0.40 agar tidak tertukar.
    const MATCH_THRESHOLD = karyawan_id ? 0.60 : 0.40;

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

    // Ambil data absensi TERBARU (terakhir kali) milik karyawan
    const absenRes = await pool.query(
      `SELECT * FROM absensi WHERE karyawan_id = $1 ORDER BY tanggal DESC LIMIT 1`,
      [bestMatch.id]
    );

    let absensiRecord = null;
    let jenisAbsen = "";

    if (type === "in") {
      if (absenRes.rows.length > 0) {
         const lastAbsen = absenRes.rows[0];
         const lastAbsDate = new Date(lastAbsen.tanggal);
         const lastAbsenDateStr = `${lastAbsDate.getFullYear()}-${String(lastAbsDate.getMonth() + 1).padStart(2, '0')}-${String(lastAbsDate.getDate()).padStart(2, '0')}`;
         
         if (lastAbsenDateStr === localDateStr) {
             return NextResponse.json({ 
               message: "Anda sudah melakukan Check-In hari ini.",
               user: { nama: bestMatch.nama_lengkap }
             }, { status: 409 });
         }
         
         if (lastAbsen.jam_keluar === null) {
             if (!forceNewCheckIn) {
                 return NextResponse.json({ 
                   isUnresolvedCheckout: true,
                   message: "Anda belum Check-Out untuk shift sebelumnya. Pilih tindakan yang ingin dilakukan.",
                   user: { nama: bestMatch.nama_lengkap }
                 }, { status: 400 });
             }
             // Jika forceNewCheckIn = true, eksekusi lanjut ke bawah (membuat check-in baru, yang lama otomatis dianggap gagal)
         }
      }

      // --- PROSES CHECK-IN ---
      const dayOfWeek = today.getDay();
      // 1. Dapatkan semua shift hari ini dari karyawan_shift (override)
      const overrideShiftsRes = await pool.query(
          `SELECT shift_id FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2`,
          [bestMatch.id, localDateStr]
      );
      
      let shiftIds = overrideShiftsRes.rows.map(r => r.shift_id);
      
      // 2. Jika tidak ada override, gunakan jadwal reguler
      if (shiftIds.length === 0) {
          const defaultShiftRes = await pool.query(
              `SELECT jkd.shift_id 
               FROM karyawan k 
               JOIN jadwal_kerja_detail jkd ON k.jadwal_kerja_id = jkd.jadwal_kerja_id 
               WHERE k.id = $1 AND jkd.hari = $2`,
              [bestMatch.id, dayOfWeek]
          );
          shiftIds = defaultShiftRes.rows.map(r => r.shift_id);
      }

      // 3. Ambil detail shift
      let shiftQuery: any = { rows: [] };
      if (shiftIds.length > 0) {
          // Ambil semua shift yang ditugaskan
          const shiftsRes = await pool.query(
              `SELECT id, jam_masuk, jam_keluar, nama_shift 
               FROM shift 
               WHERE id = ANY($1::int[])`,
              [shiftIds]
          );
          
          if (shiftsRes.rows.length === 1) {
              shiftQuery.rows = shiftsRes.rows;
          } else if (shiftsRes.rows.length > 1) {
              // Jika Double Shift, pilih shift yang paling dekat waktunya
              const nowHour = today.getHours() + today.getMinutes() / 60;
              let closestDiff = Infinity;
              let closestShift = shiftsRes.rows[0];
              
              for (const s of shiftsRes.rows) {
                  if (!s.jam_masuk || !s.jam_keluar) continue;
                  const targetTime = type === 'in' ? s.jam_masuk : s.jam_keluar;
                  const [h, m] = targetTime.split(':').map(Number);
                  const shiftHour = h + m / 60;
                  
                  // Perhitungan jarak waktu absolut (jam)
                  let diff = Math.abs(nowHour - shiftHour);
                  
                  // Handle kasus shift lintas hari (misal jam_masuk 20:00, jam_keluar 05:00)
                  // Jika beda > 12 jam, kemungkinan melintasi tengah malam
                  if (diff > 12) {
                      diff = 24 - diff; 
                  }
                  
                  if (diff < closestDiff) {
                      closestDiff = diff;
                      closestShift = s;
                  }
              }
              shiftQuery.rows = [closestShift];
          }
      }

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
        
        // --- DYNAMIC PIKET OVERRIDE FOR 8-5 WORKERS (Senin - Jumat) ---
        // Hanya yang jadwal default-nya 8-5 yang akan dicek piket sabtunya.
        // Pekerja 8-4 akan tetap 8-4 sesuai jadwal aslinya.
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && shiftData.nama_shift && shiftData.nama_shift.includes('8-5')) {
            const daysToSaturday = 6 - dayOfWeek;
            const saturdayDate = new Date(today);
            saturdayDate.setDate(today.getDate() + daysToSaturday);
            const satDateStr = `${saturdayDate.getFullYear()}-${String(saturdayDate.getMonth() + 1).padStart(2, '0')}-${String(saturdayDate.getDate()).padStart(2, '0')}`;
            
            const piketRes = await pool.query(
                `SELECT shift_id FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2 LIMIT 1`,
                [bestMatch.id, satDateStr]
            );
            
            if (piketRes.rows.length > 0 && piketRes.rows[0].shift_id) {
                // Ada piket sabtu -> Shift Senin-Jumat ditimpa jadi 8-4
                const shift84Res = await pool.query(`SELECT * FROM shift WHERE nama_shift LIKE '%8-4 (Senin-Jumat)%' LIMIT 1`);
                if (shift84Res.rows.length > 0) shiftData = shift84Res.rows[0];
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
            const satDateStr = `${saturdayDate.getFullYear()}-${String(saturdayDate.getMonth() + 1).padStart(2, '0')}-${String(saturdayDate.getDate()).padStart(2, '0')}`;
            
            const piketRes = await pool.query(
                `SELECT shift_id FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2 LIMIT 1`,
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
           message: "Anda belum pernah melakukan Check-In.",
           user: { nama: bestMatch.nama_lengkap }
         }, { status: 400 });
      }

      const existingAbsen = absenRes.rows[0];
      
      if (existingAbsen.jam_keluar) {
         return NextResponse.json({ 
           message: "Anda sudah melakukan Check-Out untuk shift ini.",
           user: { nama: bestMatch.nama_lengkap }
         }, { status: 409 });
      }
      
      const lastAbsDate = new Date(existingAbsen.tanggal);
      const lastAbsenDateStr = `${lastAbsDate.getFullYear()}-${String(lastAbsDate.getMonth() + 1).padStart(2, '0')}-${String(lastAbsDate.getDate()).padStart(2, '0')}`;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      
      if (lastAbsenDateStr !== localDateStr && lastAbsenDateStr !== yesterdayStr) {
         return NextResponse.json({ 
           message: "Check-Out ditolak. Sesi Check-In Anda sudah kedaluwarsa (lebih dari 1 hari yang lalu). Silakan hubungi HC.",
           user: { nama: bestMatch.nama_lengkap }
         }, { status: 400 });
      }

      // --- PROSES CHECK-OUT ---
      // 1. Cek Jam Keluar Shift
      let jamKeluarNormal = null;
      if (existingAbsen.shift_id) {
          let currentShiftId = existingAbsen.shift_id;
          const shiftRes = await pool.query(`SELECT id, nama_shift, jam_keluar FROM shift WHERE id = $1`, [currentShiftId]);
          
          if (shiftRes.rows.length > 0) {
              let shiftData = shiftRes.rows[0];
              
              // RE-EVALUASI DYNAMIC OVERRIDE: 
              // Jika pagi harinya tercatat 8-5 padahal dia ada piket Sabtu, perbaiki shiftnya jadi 8-4 di sini.
              const dayOfWeek = today.getDay();
              if (dayOfWeek >= 1 && dayOfWeek <= 5 && shiftData.nama_shift && shiftData.nama_shift.includes('8-5')) {
                  const daysToSaturday = 6 - dayOfWeek;
                  const saturdayDate = new Date(today);
                  saturdayDate.setDate(today.getDate() + daysToSaturday);
                  const satDateStr = `${saturdayDate.getFullYear()}-${String(saturdayDate.getMonth() + 1).padStart(2, '0')}-${String(saturdayDate.getDate()).padStart(2, '0')}`;
                  
                  const piketRes = await pool.query(
                      `SELECT shift_id FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2`,
                      [bestMatch.id, satDateStr]
                  );
                  
                  if (piketRes.rows.length > 0 && piketRes.rows[0].shift_id) {
                      const shift84Res = await pool.query(`SELECT id, nama_shift, jam_keluar FROM shift WHERE nama_shift LIKE '%8-4 (Senin-Jumat)%' LIMIT 1`);
                      if (shift84Res.rows.length > 0) {
                          shiftData = shift84Res.rows[0];
                          currentShiftId = shiftData.id;
                          
                          // Update langsung record check-in hari ini agar sinkron selamanya
                          await pool.query(`UPDATE absensi SET shift_id = $1 WHERE id = $2`, [currentShiftId, existingAbsen.id]);
                      }
                  }
              }

              if (shiftData.jam_keluar) {
                  const [hours, minutes] = shiftData.jam_keluar.split(':');
                  jamKeluarNormal = new Date(today);
                  jamKeluarNormal.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
              }
          }
      }

      // 2. Tahan jika kepagian
      if (jamKeluarNormal && today < jamKeluarNormal && !forceEarlyOut) {
          // Bug Fix: Jangan tambahkan timeZone: "Asia/Jakarta" lagi karena jamKeluarNormal sudah dimanipulasi manual mengikuti WIB
          const timeString = jamKeluarNormal.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
          return NextResponse.json({ 
              isEarly: true,
              message: `Belum waktunya pulang. Shift Anda berakhir pukul ${timeString}.`,
              user: { nama: bestMatch.nama_lengkap }
          }, { status: 403 });
      }

      // 3. Update Database
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
