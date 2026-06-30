import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email wajib diisi." }, { status: 400 });
    }

    // 1. Cek apakah email sudah ada di tabel candidates
    const candidateRes = await pool.query(`SELECT id, nama FROM candidates WHERE LOWER(email) = LOWER($1) LIMIT 1`, [email]);
    
    if (candidateRes.rows.length === 0) {
      return NextResponse.json({ message: "Data tidak ditemukan. Anda belum pernah melamar." }, { status: 404 });
    }

    const candidate = candidateRes.rows[0];

    // 2. Generate OTP (4 digit)
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    // 3. Simpan ke candidate_otps
    await pool.query(
        `INSERT INTO candidate_otps (email, otp_code, expires_at) VALUES ($1, $2, $3)`,
        [email, otpCode, expiresAt]
    );

    // 4. Kirim Email via Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Karir RSU Avisena" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Kode OTP Login Lamaran - ${otpCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; text-align: center;">Verifikasi Login Pelamar</h2>
          <p style="color: #475569; font-size: 16px;">Halo <strong>${candidate.nama}</strong>,</p>
          <p style="color: #475569; font-size: 16px;">Anda telah meminta untuk menarik data lamaran Anda sebelumnya. Berikut adalah kode OTP Anda (berlaku 10 menit):</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 30px; background-color: #f1f5f9; color: #0f172a; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
              ${otpCode}
            </span>
          </div>
          <p style="color: #475569; font-size: 14px;">Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
          <hr style="border-color: #f1f5f9; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Tim Rekrutmen RSU Avisena</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Kode OTP telah dikirim ke email." });
  } catch (error: any) {
    console.error("Error Send OTP:", error);
    return NextResponse.json({ message: "Gagal mengirim OTP", error: error.message }, { status: 500 });
  }
}
