import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, action } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email wajib diisi." }, { status: 400 });
    }

    // TAHAP 1: VERIFIKASI DATA KARYAWAN
    if (action === "check") {
      const result = await pool.query(
        `SELECT id, nip, nama_lengkap, email, user_id 
         FROM karyawan 
         WHERE email = $1`, 
        [email]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: "Email tidak terdaftar sebagai karyawan. Silakan hubungi HRD." },
          { status: 404 }
        );
      }

      const karyawan = result.rows[0];

      // Cek apakah sudah punya akun
      if (karyawan.user_id) {
        return NextResponse.json(
          { message: "Akun sudah terdaftar. Silakan gunakan fitur Lupa Password jika kendala login." },
          { status: 409 }
        );
      }

      return NextResponse.json({
        message: "Data ditemukan.",
        data: {
          nip: karyawan.nip,
          nama: karyawan.nama_lengkap,
          email: karyawan.email
        }
      });
    }

    // TAHAP 2: KIRIM LINK REGISTRASI
    if (action === "invite") {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 3600000); // Berlaku 24 jam

      const updateResult = await pool.query(
        `UPDATE karyawan 
         SET registration_token = $1, registration_expires = $2 
         WHERE email = $3 AND user_id IS NULL
         RETURNING nama_lengkap`,
        [token, expires, email]
      );

      if (updateResult.rows.length === 0) {
        return NextResponse.json({ message: "Gagal memproses undangan." }, { status: 500 });
      }

      const namaKaryawan = updateResult.rows[0].nama_lengkap;

      // Konfigurasi Nodemailer
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const regUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/register/complete?token=${token}`;

      await transporter.sendMail({
        from: `"HRIS RSU Avisena" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Undangan Registrasi Akun HRIS - RSU Avisena",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
            <h2 style="color: #1e293b;">Halo, ${namaKaryawan}</h2>
            <p style="color: #64748b;">Profil Anda telah terdaftar di sistem HRIS RSU Avisena. Silakan klik tombol di bawah ini untuk melengkapi pendaftaran akun Anda.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${regUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Selesaikan Pendaftaran</a>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">Link ini berlaku selama 24 jam. Jika Anda tidak merasa meminta ini, silakan abaikan.</p>
          </div>
        `,
      });

      return NextResponse.json({ message: "Link registrasi telah dikirim ke email Anda." });
    }

    return NextResponse.json({ message: "Aksi tidak valid." }, { status: 400 });
  } catch (error) {
    console.error("Register invite error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}