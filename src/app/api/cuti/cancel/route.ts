import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { sendCutiMagicLink } from "@/app/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { cuti_id, karyawan_id } = await req.json();

    if (!cuti_id || !karyawan_id) {
      return NextResponse.json({ message: "ID Cuti dan Karyawan diperlukan" }, { status: 400 });
    }

    const cutiRes = await pool.query(
      `SELECT tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, status, backup_jadwal FROM pengajuan_cuti WHERE id = $1 AND karyawan_id = $2`,
      [cuti_id, karyawan_id]
    );

    if (cutiRes.rows.length === 0) {
      return NextResponse.json({ message: "Data cuti tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    const cuti = cutiRes.rows[0];

    if (cuti.status === 'Batal') {
      return NextResponse.json({ message: "Cuti ini sudah dibatalkan" }, { status: 400 });
    }

    // Validasi H-1
    const tanggalMulai = new Date(cuti.tanggal_mulai);
    tanggalMulai.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today >= tanggalMulai) {
      return NextResponse.json({ message: "Batas maksimal pembatalan adalah H-1 sebelum tanggal cuti." }, { status: 400 });
    }

    // Jika cuti belum disetujui sepenuhnya, langsung batalkan tanpa persetujuan atasan
    if (cuti.status !== 'Disetujui') {
      await pool.query('BEGIN');
      try {
        await pool.query(
          `UPDATE pengajuan_cuti SET status = $1, backup_jadwal = NULL, magic_token = NULL WHERE id = $2`,
          ['Batal', cuti_id]
        );
        await pool.query('COMMIT');
        return NextResponse.json({ message: "Cuti berhasil dibatalkan." });
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
    }

    // Get atasan details for email (hanya jika cuti sudah Disetujui sebelumnya)
    const karyRes = await pool.query(`SELECT atasan_id, nama_lengkap FROM karyawan WHERE id = $1`, [karyawan_id]);
    const { atasan_id, nama_lengkap } = karyRes.rows[0] || {};
    const magicToken = crypto.randomBytes(32).toString('hex');
    
    await pool.query('BEGIN');
    try {
      // Set status to Menunggu Pembatalan
      await pool.query(
        `UPDATE pengajuan_cuti SET status = $1, magic_token = $2 WHERE id = $3`,
        ['Menunggu Pembatalan', magicToken, cuti_id]
      );

      // Send Email to Atasan
      try {
          if (atasan_id) {
              const atasanRes = await pool.query(`SELECT email, nama_lengkap FROM karyawan WHERE id = $1`, [atasan_id]);
              if (atasanRes.rows.length > 0) {
                  const atasanEmail = atasanRes.rows[0].email;
                  const atasanName = atasanRes.rows[0].nama_lengkap;
                  if (atasanEmail) {
                      await sendCutiMagicLink({
                          toEmail: atasanEmail,
                          approverName: atasanName,
                          karyawanName: nama_lengkap || 'Karyawan',
                          tanggalMulai: cuti.tanggal_mulai,
                          tanggalSelesai: cuti.tanggal_selesai,
                          tanggalKembali: null,
                          jumlahHari: cuti.jumlah_hari,
                          alasan: `[PERMOHONAN PEMBATALAN]\n${cuti.alasan}`,
                          token: magicToken,
                          title: "Persetujuan Pembatalan Cuti",
                          subject: `Persetujuan Pembatalan Cuti - ${nama_lengkap || 'Karyawan'}`
                      });
                  }
              }
          }
      } catch (e) {
          console.error("Gagal mengirim email magic link pembatalan:", e);
      }

      await pool.query('COMMIT');
      return NextResponse.json({ message: "Permohonan pembatalan berhasil dikirim. Menunggu persetujuan atasan." });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (error: any) {
    console.error("Error cancel cuti:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server", error: error.message }, { status: 500 });
  }
}
