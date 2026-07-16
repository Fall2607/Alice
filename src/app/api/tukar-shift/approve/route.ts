import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: "Token tidak ditemukan." }, { status: 400 });
    }

    const result = await pool.query(`
      SELECT r.*, 
        p.nama_lengkap as pengaju_nama, 
        g.nama_lengkap as pengganti_nama,
        sp.nama_shift as shift_pengaju_nama, 
        sg.nama_shift as shift_pengganti_nama
      FROM tukar_shift_requests r
      JOIN karyawan p ON p.id = r.karyawan_pengaju_id
      JOIN karyawan g ON g.id = r.karyawan_pengganti_id
      LEFT JOIN shift sp ON sp.id = r.shift_pengaju_id
      LEFT JOIN shift sg ON sg.id = r.shift_pengganti_id
      WHERE token_persetujuan = $1 AND token_expires > NOW()
    `, [token]);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Pengajuan tidak ditemukan atau token sudah kedaluwarsa." }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error get tukar shift request:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const { token, action } = await request.json(); // action: 'APPROVE' or 'REJECT'

    if (!token || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Dapatkan data request
    const requestResult = await client.query(`
      SELECT * FROM tukar_shift_requests 
      WHERE token_persetujuan = $1 AND token_expires > NOW() FOR UPDATE
    `, [token]);

    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: "Token tidak valid atau kedaluwarsa." }, { status: 400 });
    }

    const reqData = requestResult.rows[0];

    if (action === 'REJECT') {
      await client.query(`UPDATE tukar_shift_requests SET status = 'REJECTED', token_persetujuan = NULL WHERE id = $1`, [reqData.id]);
      await client.query('COMMIT');
      return NextResponse.json({ message: "Pengajuan tukar shift berhasil ditolak." });
    }

    // Jika APPROVE, kita lakukan swap jadwal
    if (action === 'APPROVE') {
      // a. Hapus jadwal asli Pengaju
      await client.query('DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2', [reqData.karyawan_pengaju_id, reqData.tanggal_pengaju]);
      
      // b. Hapus jadwal asli Pengganti
      await client.query('DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2', [reqData.karyawan_pengganti_id, reqData.tanggal_pengganti]);

      // c. Masukkan jadwal baru untuk Pengaju (menggunakan shift pengganti)
      if (reqData.shift_pengganti_id) {
        await client.query(`
          INSERT INTO karyawan_shift (karyawan_id, tanggal, shift_id) 
          VALUES ($1, $2, $3)
        `, [reqData.karyawan_pengaju_id, reqData.tanggal_pengaju, reqData.shift_pengganti_id]);
      }

      // d. Masukkan jadwal baru untuk Pengganti (menggunakan shift pengaju)
      if (reqData.shift_pengaju_id) {
        await client.query(`
          INSERT INTO karyawan_shift (karyawan_id, tanggal, shift_id) 
          VALUES ($1, $2, $3)
        `, [reqData.karyawan_pengganti_id, reqData.tanggal_pengganti, reqData.shift_pengaju_id]);
      }

      // e. Update status request
      await client.query(`UPDATE tukar_shift_requests SET status = 'APPROVED', token_persetujuan = NULL WHERE id = $1`, [reqData.id]);

      await client.query('COMMIT');
      return NextResponse.json({ message: "Pengajuan berhasil disetujui dan jadwal telah ditukar!" });
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error approve tukar shift:", error);
    return NextResponse.json({ message: "Gagal memproses persetujuan." }, { status: 500 });
  } finally {
    client.release();
  }
}
