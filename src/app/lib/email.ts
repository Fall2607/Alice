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

interface CutiEmailData {
  toEmail: string;
  approverName: string;
  karyawanName: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  tanggalKembali?: string | null;
  jumlahHari: number;
  alasan: string;
  token: string;
}

export const sendCutiMagicLink = async (data: CutiEmailData) => {
  const transporter = getTransporter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  const approveUrl = `${baseUrl}/api/cuti/magic-approve?token=${data.token}&action=APPROVE&approver=${encodeURIComponent(data.approverName)}`;
  const rejectUrl = `${baseUrl}/api/cuti/magic-approve?token=${data.token}&action=REJECT&approver=${encodeURIComponent(data.approverName)}`;

  const formatTgl = (tglStr: string) => {
    if (!tglStr) return "-";
    return new Date(tglStr).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const tglMulaiFmt = formatTgl(data.tanggalMulai);
  const tglSelesaiFmt = formatTgl(data.tanggalSelesai);
  const tglKembaliFmt = data.tanggalKembali ? formatTgl(data.tanggalKembali) : "<i>(Tidak ditentukan)</i>";

  const isSameDay = data.tanggalMulai === data.tanggalSelesai;
  const rangeDisplay = isSameDay ? tglMulaiFmt : `${tglMulaiFmt} <b>hingga</b> ${tglSelesaiFmt}`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <!-- Header -->
      <div style="background-color: #0f172a; padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Persetujuan Cuti Karyawan</h1>
        <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Tindakan Anda Diperlukan</p>
      </div>

      <!-- Content -->
      <div style="padding: 30px;">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">Halo, ${data.approverName}</h2>
        <p style="color: #475569; line-height: 1.6; font-size: 15px;">Karyawan Anda, <strong style="color: #0f172a;">${data.karyawanName}</strong>, telah mengajukan permohonan cuti. Berikut adalah rinciannya:</p>
        
        <!-- Details Card -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%; vertical-align: top;">Waktu Cuti</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${rangeDisplay} <span style="color: #3b82f6; background: #eff6ff; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px;">${data.jumlahHari} Hari</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Kembali Bekerja</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; border-top: 1px solid #e2e8f0;">${tglKembaliFmt}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; vertical-align: top;">Alasan</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; border-top: 1px solid #e2e8f0; line-height: 1.5; font-style: italic;">"${data.alasan}"</td>
            </tr>
          </table>
        </div>

        <p style="color: #475569; font-size: 15px; margin-bottom: 24px;">Silakan pilih salah satu tindakan di bawah ini untuk menyetujui atau menolak permohonan secara langsung (tanpa perlu login):</p>
        
        <!-- Action Buttons -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr>
            <td style="padding-right: 10px; width: 50%;">
              <a href="${approveUrl}" style="display: block; text-align: center; background-color: #10b981; color: #ffffff; padding: 14px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">✅ Setujui Cuti</a>
            </td>
            <td style="padding-left: 10px; width: 50%;">
              <a href="${rejectUrl}" style="display: block; text-align: center; background-color: #ef4444; color: #ffffff; padding: 14px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">❌ Tolak Cuti</a>
            </td>
          </tr>
        </table>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          Email ini dihasilkan secara otomatis oleh sistem HRIS Alice.<br>
          Tautan pada tombol di atas hanya berlaku untuk satu kali aksi.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"HRIS Alice" <${process.env.SMTP_USER}>`,
    to: data.toEmail,
    subject: "Persetujuan Cuti Karyawan",
    html: htmlContent,
  });
};

interface CutiStatusEmailData {
  toEmail: string;
  karyawanName: string;
  status: 'Disetujui' | 'Ditolak';
  alasanCuti: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  sisaCuti?: number;
  rejectedBy?: string | null;
}

export const sendCutiStatusEmail = async (data: CutiStatusEmailData) => {
  const transporter = getTransporter();
  
  const formatTgl = (tglStr: string) => {
    if (!tglStr) return "-";
    return new Date(tglStr).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const tglMulaiFmt = formatTgl(data.tanggalMulai);
  const tglSelesaiFmt = formatTgl(data.tanggalSelesai);
  const isSameDay = data.tanggalMulai === data.tanggalSelesai;
  const rangeDisplay = isSameDay ? tglMulaiFmt : `${tglMulaiFmt} hingga ${tglSelesaiFmt}`;

  const isApproved = data.status === 'Disetujui';
  const colorCode = isApproved ? '#10b981' : '#ef4444'; // green for approved, red for rejected

  let statusMsg = '';
  if (isApproved) {
    statusMsg = `Selamat, pengajuan cuti Anda telah disetujui.`;
  } else {
    statusMsg = `Mohon maaf, pengajuan cuti Anda telah ditolak.`;
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: ${colorCode}; padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Status Pengajuan Cuti</h1>
      </div>

      <div style="padding: 30px;">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">Halo, ${data.karyawanName}</h2>
        <p style="color: #475569; line-height: 1.6; font-size: 15px;">${statusMsg}</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%; vertical-align: top;">Waktu Cuti</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${rangeDisplay}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; vertical-align: top;">Alasan</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; border-top: 1px solid #e2e8f0; line-height: 1.5; font-style: italic;">"${data.alasanCuti}"</td>
            </tr>
            ${data.rejectedBy && !isApproved ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; vertical-align: top;">Ditolak Oleh</td>
              <td style="padding: 8px 0; color: #ef4444; font-size: 14px; border-top: 1px solid #e2e8f0; font-weight: bold;">${data.rejectedBy}</td>
            </tr>` : ''}
            ${isApproved && data.sisaCuti !== undefined ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; vertical-align: top;">Sisa Cuti Tahunan</td>
              <td style="padding: 8px 0; color: #3b82f6; font-size: 14px; border-top: 1px solid #e2e8f0; font-weight: bold;">${data.sisaCuti} Hari</td>
            </tr>` : ''}
          </table>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          Email ini dihasilkan secara otomatis oleh sistem HRIS Alice.<br>
          Buka dashboard HRIS Anda untuk melihat detail selengkapnya.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"HRIS Alice" <${process.env.SMTP_USER}>`,
    to: data.toEmail,
    subject: `[${data.status.toUpperCase()}] Permohonan Cuti`,
    html: htmlContent,
  });
};
