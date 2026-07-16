import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      karyawan_pengaju_id,
      karyawan_pengganti_id,
      tanggal_pengaju,
      tanggal_pengganti,
      shift_pengaju_id,
      shift_pengganti_id,
      alasan
    } = body;

    if (!karyawan_pengaju_id || !karyawan_pengganti_id || !tanggal_pengaju || !tanggal_pengganti) {
      return NextResponse.json({ message: "Data pengajuan tidak lengkap." }, { status: 400 });
    }

    // 1. Ambil data pengaju, pengganti, dan atasan mereka
    const infoResult = await pool.query(`
      SELECT 
        p.nama_lengkap as pengaju_nama,
        g.nama_lengkap as pengganti_nama,
        a.nama_lengkap as atasan_nama,
        a.email as atasan_email,
        p.atasan_id as pengaju_atasan,
        g.atasan_id as pengganti_atasan,
        sp.nama_shift as shift_pengaju_nama,
        sg.nama_shift as shift_pengganti_nama
      FROM karyawan p
      JOIN karyawan g ON g.id = $2
      LEFT JOIN karyawan a ON a.id = p.atasan_id
      LEFT JOIN shift sp ON sp.id = $3
      LEFT JOIN shift sg ON sg.id = $4
      WHERE p.id = $1
    `, [karyawan_pengaju_id, karyawan_pengganti_id, shift_pengaju_id || null, shift_pengganti_id || null]);

    if (infoResult.rows.length === 0) {
      return NextResponse.json({ message: "Karyawan tidak ditemukan." }, { status: 404 });
    }

    const info = infoResult.rows[0];

    // 2. Validasi harus satu atasan (satu unit)
    if (info.pengaju_atasan !== info.pengganti_atasan) {
      return NextResponse.json({ message: "Tukar shift hanya bisa dilakukan dengan rekan di unit (atasan) yang sama." }, { status: 400 });
    }

    if (!info.atasan_email) {
      return NextResponse.json({ message: "Atasan tidak memiliki email yang terdaftar untuk menerima notifikasi." }, { status: 400 });
    }

    // 3. Buat Token Persetujuan (Berlaku 24 jam)
    const token = crypto.randomBytes(32).toString("hex");

    // 4. Simpan ke database
    await pool.query(`
      INSERT INTO tukar_shift_requests (
        karyawan_pengaju_id, karyawan_pengganti_id, tanggal_pengaju, tanggal_pengganti, 
        shift_pengaju_id, shift_pengganti_id, alasan, token_persetujuan, token_expires
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() + INTERVAL '24 hours')
    `, [
      karyawan_pengaju_id, karyawan_pengganti_id, tanggal_pengaju, tanggal_pengganti, 
      shift_pengaju_id || null, shift_pengganti_id || null, alasan, token
    ]);

    // 5. Kirim Email ke Atasan
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const approveUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/tukar-shift/approve?token=${token}`;
    const descPengaju = info.shift_pengaju_nama ? `${info.shift_pengaju_nama} (${tanggal_pengaju})` : `Libur/Off (${tanggal_pengaju})`;
    const descPengganti = info.shift_pengganti_nama ? `${info.shift_pengganti_nama} (${tanggal_pengganti})` : `Libur/Off (${tanggal_pengganti})`;

    await transporter.sendMail({
      from: `"Sistem HRIS - RSU Avisena" <${process.env.SMTP_USER}>`,
      to: info.atasan_email,
      subject: "Persetujuan Tukar Shift - HRIS RSU Avisena",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 25px; border-radius: 16px; color: #334155;">
          <div style="text-align: center; margin-bottom: 20px;">
             <h2 style="color: #1e40af; margin: 0;">Persetujuan Tukar Shift</h2>
             <p style="font-size: 14px; color: #64748b;">Mohon ditinjau pengajuan berikut</p>
          </div>
          <p>Halo Bapak/Ibu <strong>${info.atasan_nama}</strong>,</p>
          <p>Terdapat pengajuan tukar shift dari tim Anda dengan rincian sebagai berikut:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Pemohon</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${info.pengaju_nama}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Shift Asal</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${descPengaju}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Ditukar Dengan</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${info.pengganti_nama}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Shift Pengganti</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${descPengganti}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Alasan</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${alasan || '-'}</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${approveUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Lihat & Berikan Keputusan</a>
          </div>
          
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
            Tautan ini akan kedaluwarsa dalam 24 jam. Jika sudah disetujui, sistem akan otomatis menukar jadwal mereka di data absensi.
          </p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">© ${new Date().getFullYear()} RSU Avisena. IT Digital Solution.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Pengajuan berhasil dikirim ke atasan Anda untuk disetujui." }, { status: 201 });

  } catch (error) {
    console.error("Error submit tukar shift:", error);
    return NextResponse.json({ message: "Gagal mengajukan tukar shift.", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
