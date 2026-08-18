import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { sendCutiMagicLink } from "@/app/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { cuti_id, karyawan_id, tanggal_mulai, tanggal_selesai, tanggal_kembali, alasan, jumlah_hari } = await req.json();

    if (!cuti_id || !karyawan_id || !tanggal_mulai || !tanggal_selesai) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const cutiRes = await pool.query(
      `SELECT tanggal_mulai as old_tanggal_mulai, tanggal_selesai as old_tanggal_selesai, alasan as old_alasan, status, backup_jadwal, jenis_cuti, jumlah_hari as old_jumlah_hari FROM pengajuan_cuti WHERE id = $1 AND karyawan_id = $2`,
      [cuti_id, karyawan_id]
    );

    if (cutiRes.rows.length === 0) {
      return NextResponse.json({ message: "Data cuti tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    const cuti = cutiRes.rows[0];

    // Validasi H-1 untuk jadwal awal
    const oldTanggalMulai = new Date(cuti.old_tanggal_mulai);
    oldTanggalMulai.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today > oldTanggalMulai) {
      return NextResponse.json({ message: "Batas maksimal penggantian adalah pada hari-H cuti lama." }, { status: 400 });
    }

    await pool.query('BEGIN');
    try {
      // 1. Dapatkan shift 'Cuti' id
      const shiftRes = await pool.query(`SELECT id FROM shift WHERE nama_shift ILIKE 'Cuti' LIMIT 1`);
      const shiftCutiId = shiftRes.rows.length > 0 ? shiftRes.rows[0].id : null;

      // 2. Selalu Hapus Shift 'Cuti' di rentang tanggal lama, terlepas ada backup atau tidak (agar tidak stuck)
      if (shiftCutiId) {
          let dateArray = [];
          const datesMatch = cuti.old_alasan?.match(/\[DATES:\s*([^\]]+)\]/);
          if (datesMatch) {
              dateArray = datesMatch[1].split(',').map((d: string) => d.trim());
          } else {
              const start = new Date(cuti.old_tanggal_mulai);
              const end = new Date(cuti.old_tanggal_selesai);
              let cur = new Date(start);
              while (cur <= end) {
                  const yyyy = cur.getFullYear();
                  const mm = String(cur.getMonth() + 1).padStart(2, '0');
                  const dd = String(cur.getDate()).padStart(2, '0');
                  dateArray.push(`${yyyy}-${mm}-${dd}`);
                  cur.setDate(cur.getDate() + 1);
              }
          }
          if (dateArray.length > 0) {
              const placeholders = dateArray.map((_: any, i: number) => `$${i + 3}`).join(',');
              await pool.query(
                  `DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND shift_id = $2 AND tanggal IN (${placeholders})`, 
                  [karyawan_id, shiftCutiId, ...dateArray]
              );
          }
      }

      // 3. Restore Backup Jadwal Lama (Jika sudah di-approve dan punya backup)
      const backup = typeof cuti.backup_jadwal === 'string' ? JSON.parse(cuti.backup_jadwal) : cuti.backup_jadwal;
      
      if (backup && Array.isArray(backup) && backup.length > 0) {
        const dates = backup.map((b: any) => b.tanggal);
        const placeholders = dates.map((_: any, i: number) => `$${i + 2}`).join(',');
        
        // Hapus juga shift apapun (berjaga-jaga) pada tanggal backup tersebut sebelum insert backup
        await pool.query(`DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal IN (${placeholders})`, [karyawan_id, ...dates]);
        
        // Insert kembali shift lama
        for (const shift of backup) {
          await pool.query(`
            INSERT INTO karyawan_shift (karyawan_id, shift_id, tanggal, assigned_by)
            VALUES ($1, $2, $3, $4)
          `, [karyawan_id, shift.shift_id, shift.tanggal, shift.assigned_by]);
        }
      }

      // Get atasan_id and nama_lengkap
      const karyRes = await pool.query(`SELECT atasan_id, nama_lengkap FROM karyawan WHERE id = $1`, [karyawan_id]);
      const { atasan_id, nama_lengkap } = karyRes.rows[0] || {};
      const statusAwal = atasan_id ? 'Menunggu Atasan' : 'Menunggu HC';
      const magicToken = crypto.randomBytes(32).toString('hex');

      // 4. Refund Saldo Cuti jika cuti lama sudah disetujui (karena akan diajukan ulang)
      if (cuti.status === 'Disetujui' && cuti.jenis_cuti === 'Tahunan') {
          await pool.query(`UPDATE karyawan SET sisa_cuti = sisa_cuti + $1 WHERE id = $2`, [cuti.old_jumlah_hari, karyawan_id]);
      }

      // 2. Update Pengajuan Cuti (Tanggal baru, reset status, hapus backup)
      await pool.query(`
        UPDATE pengajuan_cuti 
        SET 
          tanggal_mulai = $1, 
          tanggal_selesai = $2, 
          alasan = $3, 
          jumlah_hari = $4,
          status = $5,
          magic_token = $6,
          tanggal_kembali = $7,
          backup_jadwal = NULL,
          approved_by_id = NULL,
          atasan_approved_by_id = NULL,
          spv_approved_by_id = NULL,
          hc_approved_by_id = NULL,
          rejected_by = NULL
        WHERE id = $8
      `, [tanggal_mulai, tanggal_selesai, alasan, jumlah_hari, statusAwal, magicToken, tanggal_kembali, cuti_id]);

      // Kirim Email Magic Link
      try {
          if (statusAwal === 'Menunggu Atasan' && atasan_id) {
              const atasanRes = await pool.query(`SELECT email, nama_lengkap FROM karyawan WHERE id = $1`, [atasan_id]);
              if (atasanRes.rows.length > 0) {
                  const atasanEmail = atasanRes.rows[0].email;
                  const atasanName = atasanRes.rows[0].nama_lengkap;
                  if (atasanEmail) {
                      await sendCutiMagicLink({
                          toEmail: atasanEmail,
                          approverName: atasanName,
                          karyawanName: nama_lengkap || 'Karyawan',
                          tanggalMulai: tanggal_mulai,
                          tanggalSelesai: tanggal_selesai,
                          tanggalKembali: tanggal_kembali,
                          jumlahHari: jumlah_hari,
                          alasan: `[PERMOHONAN GANTI JADWAL]\n${alasan}`,
                          token: magicToken,
                          title: "Persetujuan Pergantian Jadwal Cuti",
                          subject: `Persetujuan Pergantian Jadwal Cuti - ${nama_lengkap || 'Karyawan'}`
                      });
                  }
              }
          } else if (statusAwal === 'Menunggu HC') {
              const hcRes = await pool.query(`
                SELECT u.email, COALESCE(k.nama_lengkap, u.email) as nama_lengkap
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                LEFT JOIN karyawan k ON k.user_id = u.id OR k.email = u.email
                WHERE u.email = 'friscachoiriatul@gmail.com' OR k.nip = '12001059'
              `);
              for (const hc of hcRes.rows) {
                  if (hc.email) {
                      try {
                          await sendCutiMagicLink({
                              toEmail: hc.email,
                              approverName: hc.nama_lengkap,
                              karyawanName: nama_lengkap || 'Karyawan',
                              tanggalMulai: tanggal_mulai,
                              tanggalSelesai: tanggal_selesai,
                              tanggalKembali: tanggal_kembali,
                              jumlahHari: jumlah_hari,
                              alasan: `[PERMOHONAN GANTI JADWAL]\n${alasan}`,
                              token: magicToken,
                              title: "Persetujuan Pergantian Jadwal Cuti",
                              subject: `Persetujuan Pergantian Jadwal Cuti - ${nama_lengkap || 'Karyawan'}`
                          });
                      } catch (emailErr) {
                          console.error("Gagal mengirim magic link HC saat pengajuan:", hc.email, emailErr);
                      }
                  }
              }
          }
      } catch (e) {
          console.error("Gagal mengirim email magic link:", e);
      }

      await pool.query('COMMIT');
      return NextResponse.json({ message: "Jadwal cuti berhasil diganti. Silakan tunggu persetujuan ulang." });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (error: any) {
    console.error("Error reschedule cuti:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server", error: error.message }, { status: 500 });
  }
}
