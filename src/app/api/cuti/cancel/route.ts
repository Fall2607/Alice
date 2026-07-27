import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { cuti_id, karyawan_id } = await req.json();

    if (!cuti_id || !karyawan_id) {
      return NextResponse.json({ message: "ID Cuti dan Karyawan diperlukan" }, { status: 400 });
    }

    const cutiRes = await pool.query(
      `SELECT tanggal_mulai, status, backup_jadwal FROM pengajuan_cuti WHERE id = $1 AND karyawan_id = $2`,
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

    await pool.query('BEGIN');
    try {
      // 1. Restore Backup Jadwal
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

      // 2. Update Status Cuti
      await pool.query(
        `UPDATE pengajuan_cuti SET status = $1, backup_jadwal = NULL WHERE id = $2`,
        ['Batal', cuti_id]
      );

      await pool.query('COMMIT');
      return NextResponse.json({ message: "Cuti berhasil dibatalkan dan jadwal telah dikembalikan." });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (error: any) {
    console.error("Error cancel cuti:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server", error: error.message }, { status: 500 });
  }
}
