import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Data tidak lengkap. Email wajib diisi." }, 
        { status: 400 }
      );
    }

    // 1. Cek apakah user terdaftar
    // PERBAIKAN: Menggunakan u.id untuk menghindari ambiguitas kolom id
    const userResult = await pool.query(
      `SELECT u.id, k.nama_lengkap 
       FROM users u 
       LEFT JOIN karyawan k ON u.karyawan_id = k.id 
       WHERE u.email = $1`, 
      [email]
    );
    
    if (userResult.rows.length === 0) {
      // Keamanan: Tetap berikan pesan sukses agar hacker tidak tahu email mana yang terdaftar
      return NextResponse.json({ 
        message: "Jika email terdaftar, instruksi reset akan dikirim ke kotak masuk Anda." 
      });
    }

    const user = userResult.rows[0];

    // 2. Buat Token Reset (Berlaku 1 jam)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); 

    // 3. Simpan Token ke Database
    await pool.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3",
      [token, expires, email]
    );

    // 4. Konfigurasi Transporter menggunakan .env.local
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // 5. Kirim Email Sesungguhnya
    await transporter.sendMail({
      from: `"IT Departemen RSU Avisena" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Atur Ulang Password - RSU Avisena",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 25px; border-radius: 16px; color: #334155;">
          <div style="text-align: center; margin-bottom: 20px;">
             <h2 style="color: #1e40af; margin: 0;">Atur Ulang Password</h2>
             <p style="font-size: 14px; color: #64748b;">Sistem HRIS RSU Avisena</p>
          </div>
          <p>Halo <strong>${user.nama_lengkap || 'User'}</strong>,</p>
          <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Atur Ulang Password Saya</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
            Tautan ini akan kedaluwarsa dalam 1 jam. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini dengan aman. Akun Anda tetap aman.
          </p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">© ${new Date().getFullYear()} RSU Avisena. IT Digital Solution.</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      message: "Tautan reset password telah berhasil dikirim ke email Anda." 
    });

  } catch (error: unknown) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ 
      message: "Gagal mengirim email. Terjadi kesalahan pada internal server.",
    }, { status: 500 });
  }
}