import nodemailer from "nodemailer";

export const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendCutiMagicLink = async (
  toEmail: string,
  approverName: string,
  karyawanName: string,
  tanggalMulai: string,
  tanggalSelesai: string,
  alasan: string,
  token: string
) => {
  const transporter = getTransporter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  const approveUrl = `${baseUrl}/api/cuti/magic-approve?token=${token}&action=APPROVE`;
  const rejectUrl = `${baseUrl}/api/cuti/magic-approve?token=${token}&action=REJECT`;

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
      <h2 style="color: #1e293b;">Halo, ${approverName}</h2>
      <p style="color: #64748b;">Karyawan Anda, <strong>${karyawanName}</strong>, mengajukan permohonan cuti dengan detail sebagai berikut:</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Mulai:</strong> ${tanggalMulai}</p>
        <p style="margin: 0 0 10px 0;"><strong>Selesai:</strong> ${tanggalSelesai}</p>
        <p style="margin: 0;"><strong>Alasan:</strong> ${alasan}</p>
      </div>

      <p style="color: #64748b; margin-bottom: 20px;">Silakan pilih salah satu tindakan di bawah ini untuk menyetujui atau menolak permohonan ini secara langsung:</p>
      
      <div style="display: flex; gap: 10px; margin-bottom: 30px;">
        <a href="${approveUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">✅ Setujui Cuti</a>
        <span style="display:inline-block; width:10px;"></span>
        <a href="${rejectUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">❌ Tolak Cuti</a>
      </div>
      
      <p style="color: #94a3b8; font-size: 12px;">Email ini dihasilkan secara otomatis oleh sistem HRIS Alice. Tombol di atas dapat digunakan satu kali.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"HRIS RSU Avisena" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Persetujuan Cuti: ${karyawanName}`,
    html: htmlContent,
  });
};
