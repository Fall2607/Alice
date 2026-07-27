import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { cuti_id, karyawan_id, tanggal_mulai, tanggal_selesai, alasan, jumlah_hari } = await req.json();

    if (!cuti_id || !karyawan_id || !tanggal_mulai || !tanggal_selesai) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const cutiRes = await pool.query(
      `SELECT tanggal_mulai as old_tanggal_mulai, status, backup_jadwal FROM pengajuan_cuti WHERE id = $1 AND karyawan_id = $2`,
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

    if (today >= oldTanggalMulai) {
      return NextResponse.json({ message: "Batas maksimal penggantian adalah H-1 sebelum tanggal cuti lama." }, { status: 400 });
    }

    await pool.query('BEGIN');
    try {
      // 1. Restore Backup Jadwal Lama (Jika sudah di-approve dan punya backup)
      const backup = typeof cuti.backup_jadwal === 'string' ? JSON.parse(cuti.backup_jadwal) : cuti.backup_jadwal;
      
      if (backup && Array.isArray(backup) && backup.length > 0) {
        const dates = backup.map((b: any) => b.tanggal);
        const placeholders = dates.map((_: any, i: number) => `$${i + 2}`).join(',');
        
        // Hapus Shift 'Cuti' yang terinjeksi
        await pool.query(`DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal IN (${placeholders})`, [karyawan_id, ...dates]);
        
        // Insert kembali shift lama
        for (const shift of backup) {
          await pool.query(`
            INSERT INTO karyawan_shift (karyawan_id, shift_id, tanggal, assigned_by)
            VALUES ($1, $2, $3, $4)
          `, [karyawan_id, shift.shift_id, shift.tanggal, shift.assigned_by]);
        }
      }

      // 2. Update Pengajuan Cuti (Tanggal baru, reset status, hapus backup)
      await pool.query(`
        UPDATE pengajuan_cuti 
        SET 
          tanggal_mulai = $1, 
          tanggal_selesai = $2, 
          alasan = $3, 
          jumlah_hari = $4,
          status = 'Menunggu Atasan',
          backup_jadwal = NULL,
          approved_by_id = NULL,
          atasan_approved_by_id = NULL,
          spv_approved_by_id = NULL,
          hc_approved_by_id = NULL,
          rejected_by = NULL
        WHERE id = $5
      `, [tanggal_mulai, tanggal_selesai, alasan, jumlah_hari, cuti_id]);

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
