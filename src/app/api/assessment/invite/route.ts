import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const { candidate_id, job_opening_id, email, candidate_name, job_title, scheduled_date } = await request.json();

    // Validasi data input wajib
    if (!candidate_id || !job_opening_id || !email || !candidate_name || !job_title || !scheduled_date) {
      return NextResponse.json(
        { message: "Informasi kandidat, lowongan, email, dan tanggal tes wajib diisi." }, 
        { status: 400 }
      );
    }

    // Memulai Transaksi Database
    await client.query("BEGIN");

    // 1. Generate Token (UUID acak untuk URL) & OTP (6 digit angka acak)
    const token = crypto.randomUUID();
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString(); // OTP: '100000' - '999999'
    
    const validFrom = new Date(`${scheduled_date}T00:00:00`);
    const expiresAt = new Date(`${scheduled_date}T23:59:59`); // Masa berlaku diakhiri di penghujung hari jadwal tes

    // 2. Simpan Sesi Assessment baru ke tabel candidate_assessments
    const assessmentRes = await client.query(
      `INSERT INTO public.candidate_assessments (candidate_id, job_opening_id, token, access_code, status, valid_from, expires_at)
       VALUES ($1, $2, $3, $4, 'INVITED', $5, $6)
       RETURNING id`,
      [candidate_id, job_opening_id, token, accessCode, validFrom, expiresAt]
    );

    // 3. Update status pelamar di application_status menjadi 'ASSESSMENT'
    await client.query(
      `UPDATE public.application_status 
       SET status = 'ASSESSMENT', updated_at = NOW()
       WHERE candidate_id = $1 AND job_opening_id = $2`,
      [candidate_id, job_opening_id]
    );

    // Selesaikan transaksi DB
    await client.query("COMMIT");

    // 4. Konfigurasi SMTP Transporter Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // true untuk port 465, false untuk port lainnya
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Link Ujian mengarah ke rute publik assessment
    const testUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/assessment/${token}`;

    // 5. Kirim Template Email Otorisasi
    await transporter.sendMail({
      from: `"People Development RSU Avisena" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Undangan Tes Psikometri Seleksi: ${job_title} - RSU Avisena`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; padding: 30px; border-radius: 16px; color: #1e293b; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
             <span style="font-size: 24px; font-weight: 900; color: #0173b6; letter-spacing: -0.05em;">ALICE ASSESSMENT</span>
             <p style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 5px;">RSU Avisena Recruitment</p>
          </div>
          <p>Yth. <strong>${candidate_name}</strong>,</p>
          <p>Terima kasih atas partisipasi Anda dalam seleksi penerimaan staf untuk posisi <strong>${job_title}</strong> di RSU Avisena.</p>
          <p>Kami dengan senang hati mengundang Anda untuk mengikuti tahapan seleksi berikutnya, yaitu <strong>Ujian Psikometri Online (MBTI, DISC, & PAPI Kostik)</strong>.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
             <p style="margin: 0 0 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; font-weight: 800;">Kode Akses Otorisasi</p>
             <h1 style="margin: 0; font-size: 40px; letter-spacing: 0.2em; color: #0173b6; font-family: 'Courier New', Courier, monospace; font-weight: 900;">${accessCode}</h1>
             <p style="margin: 15px 0 0 0; font-size: 10px; color: #94a3b8; font-style: italic;">* Kode bersifat rahasia dan hanya valid selama masa ujian aktif</p>
          </div>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${testUrl}" style="background-color: #0173b6; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Buka Modul Ujian</a>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; color: #64748b;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 150px;">Jadwal Pelaksanaan</td>
              <td style="padding: 6px 0; font-weight: 800; color: #0173b6;">: ${new Date(scheduled_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} (Hanya 1 Hari)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Durasi Tes</td>
              <td style="padding: 6px 0;">: ± 45 Menit (Sistem Timer Aktif)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Perangkat Rekomendasi</td>
              <td style="padding: 6px 0;">: Smartphone / PC dengan koneksi stabil</td>
            </tr>
          </table>

          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; font-size: 11px; color: #b45309; line-height: 1.6;">
            <strong>Penting:</strong> Pastikan Anda mengerjakan ujian di lingkungan yang kondusif. Sistem akan otomatis menyimpan progres pengerjaan Anda saat batas waktu habis.
          </div>

          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Email ini dikirim otomatis oleh Sistem Rekrutmen RSU Avisena. Mohon tidak membalas email ini.</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Undangan ujian psikometri berhasil dikirim ke email pelamar!" 
    });

  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Invite Assessment Error:", error);
    return NextResponse.json(
      { message: "Gagal mengirimkan undangan tes.", error: error.message }, 
      { status: 500 }
    );
  } finally {
    client.release();
  }
}