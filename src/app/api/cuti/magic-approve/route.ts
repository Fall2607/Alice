import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import crypto from "crypto";
import { sendCutiMagicLink, sendCutiStatusEmail } from "@/app/lib/email";
import { injectCutiToShift } from "../inject-shift";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action'); // 'APPROVE' or 'REJECT'
    const approverName = searchParams.get('approver') || 'Atasan/HC';

    if (!token || !action) {
      return new NextResponse("Token dan action tidak valid.", { status: 400 });
    }

    // 1. Cari cuti berdasarkan token di pengajuan_cuti
    const cutiRes = await pool.query(`
        SELECT c.*, k.nama_lengkap, k.atasan_id
        FROM pengajuan_cuti c 
        JOIN karyawan k ON c.karyawan_id = k.id 
        WHERE c.magic_token = $1
    `, [token]);
    
    if (cutiRes.rows.length === 0) {
      return new NextResponse(
        generateHTML("Token Kadaluarsa / Tidak Valid", "Pengajuan cuti ini mungkin sudah diproses atau token tidak ditemukan.", "error"),
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const cuti = cutiRes.rows[0];

    // Jika cuti sudah berstatus akhir
    if (cuti.status === 'Disetujui' || cuti.status === 'Ditolak') {
      return new NextResponse(
        generateHTML("Sudah Diproses", "Pengajuan cuti ini sudah diproses sebelumnya.", "info"),
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    let query = '';
    let params: any[] = [];
    const newMagicToken = crypto.randomBytes(32).toString('hex');
    let message = '';
    
    if (action === 'REJECT') {
      let rejectedByStr = `Atasan (${approverName})`;
      if (cuti.status === 'Menunggu SPV') rejectedByStr = `SPV (${approverName})`;
      if (cuti.status === 'Menunggu HC') rejectedByStr = `HC (${approverName})`;

      query = `UPDATE pengajuan_cuti SET status = 'Ditolak', magic_token = NULL, rejected_by = $2 WHERE id = $1 RETURNING *`;
      params = [cuti.id, rejectedByStr];
      message = `Permohonan cuti ${cuti.nama_lengkap} berhasil ditolak.`;
    } else if (action === 'APPROVE') {
      
      const sendEmailToHC = async (tokenHC: string) => {
        const hcRes = await pool.query(`
          SELECT u.email, COALESCE(k.nama_lengkap, u.email) as nama_lengkap
          FROM users u
          LEFT JOIN roles r ON u.role_id = r.id
          LEFT JOIN karyawan k ON k.user_id = u.id OR k.email = u.email
          WHERE u.email = 'friscachoiriatul@gmail.com' OR k.nip = '12001059'
        `);
        for (const hc of hcRes.rows) {
            if (hc.email) {
                try {
                    await sendCutiMagicLink({
                        toEmail: hc.email, approverName: hc.nama_lengkap, karyawanName: cuti.nama_lengkap,
                        tanggalMulai: cuti.tanggal_mulai, tanggalSelesai: cuti.tanggal_selesai,
                        tanggalKembali: cuti.tanggal_kembali, jumlahHari: cuti.jumlah_hari,
                        alasan: cuti.alasan, token: tokenHC
                    });
                } catch (emailErr) { console.error("Gagal mengirim magic link HC:", emailErr); }
            }
        }
      };

      if (cuti.status === 'Menunggu Atasan') {
        // Cek level atasan
        const atasanRes = await pool.query(`
          SELECT k.id, k.atasan_id, lj.nama_level, k.nama_lengkap, k.email 
          FROM karyawan k
          LEFT JOIN jabatan j ON k.jabatan_id = j.id
          LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
          WHERE k.id = $1
        `, [cuti.atasan_id]);
        
        const atasanInfo = atasanRes.rows[0];
        const isSpvOrHigher = ['Supervisor', 'Wakil Direktur', 'Direktur'].includes(atasanInfo?.nama_level);
        
        // Cek apakah SPV (atasannya atasan) punya email
        let spvInfo = null;
        if (!isSpvOrHigher && atasanInfo?.atasan_id) {
           const spvRes = await pool.query(`SELECT email, nama_lengkap FROM karyawan WHERE id = $1`, [atasanInfo.atasan_id]);
           if (spvRes.rows.length > 0 && spvRes.rows[0].email) {
              spvInfo = spvRes.rows[0];
           }
        }

        if (isSpvOrHigher || !spvInfo) {
          // Lanjut ke HC
          query = `UPDATE pengajuan_cuti SET status = 'Menunggu HC', magic_token = $1, atasan_approved_by_id = $2 WHERE id = $3 RETURNING *`;
          params = [newMagicToken, cuti.atasan_id, cuti.id];
          message = `Permohonan cuti ${cuti.nama_lengkap} disetujui oleh Atasan. Diteruskan ke HC.`;
          await sendEmailToHC(newMagicToken);
        } else {
          // Lanjut ke SPV
          query = `UPDATE pengajuan_cuti SET status = 'Menunggu SPV', magic_token = $1, atasan_approved_by_id = $2 WHERE id = $3 RETURNING *`;
          params = [newMagicToken, cuti.atasan_id, cuti.id];
          message = `Permohonan cuti ${cuti.nama_lengkap} disetujui oleh Atasan. Diteruskan ke SPV untuk persetujuan.`;
          
          try {
             await sendCutiMagicLink({
                 toEmail: spvInfo.email, approverName: spvInfo.nama_lengkap, karyawanName: cuti.nama_lengkap,
                 tanggalMulai: cuti.tanggal_mulai, tanggalSelesai: cuti.tanggal_selesai,
                 tanggalKembali: cuti.tanggal_kembali, jumlahHari: cuti.jumlah_hari,
                 alasan: cuti.alasan, token: newMagicToken
             });
          } catch(e) { console.error("Gagal mengirim email ke SPV:", e); }
        }

      } else if (cuti.status === 'Menunggu SPV') {
         // SPV Approve -> Naik ke HC
         const spvRes = await pool.query(`SELECT atasan_id FROM karyawan WHERE id = $1`, [cuti.atasan_id]);
         const spvId = spvRes.rows[0]?.atasan_id || null;

         query = `UPDATE pengajuan_cuti SET status = 'Menunggu HC', magic_token = $1, spv_approved_by_id = $2 WHERE id = $3 RETURNING *`;
         params = [newMagicToken, spvId, cuti.id];
         message = `Permohonan cuti ${cuti.nama_lengkap} disetujui oleh SPV. Diteruskan ke HC.`;
         await sendEmailToHC(newMagicToken);

      } else if (cuti.status === 'Menunggu HC') {
        // HC approve -> Disetujui final
        query = `UPDATE pengajuan_cuti SET status = 'Disetujui', magic_token = NULL WHERE id = $1 RETURNING *`;
        params = [cuti.id];
        message = `Permohonan cuti ${cuti.nama_lengkap} berhasil DISETUJUI sepenuhnya.`;
      }
    }

    if (query) {
      const result = await pool.query(query, params);
      const updatedCuti = result.rows[0];

      // POTONG SALDO JIKA DISETUJUI FINAL DAN TAHUNAN
      if (action === 'APPROVE' && updatedCuti?.status === 'Disetujui') {
        // POTONG SALDO JIKA TAHUNAN
        if (cuti.jenis_cuti === 'Tahunan') {
          await pool.query(`UPDATE karyawan SET sisa_cuti = sisa_cuti - $1 WHERE id = $2`, [cuti.jumlah_hari, cuti.karyawan_id]);
        }
        
        // INJECT JADWAL CUTI
        await injectCutiToShift(cuti.karyawan_id, cuti.tanggal_mulai, cuti.tanggal_selesai, cuti.atasan_id || cuti.karyawan_id);
      }

      // KIRIM EMAIL NOTIFIKASI KE KARYAWAN
      if (updatedCuti?.status === 'Disetujui' || updatedCuti?.status === 'Ditolak') {
        (async () => {
          try {
            const pemohonRes = await pool.query(`SELECT email, nama_lengkap, sisa_cuti FROM karyawan WHERE id = $1`, [cuti.karyawan_id]);
            const pemohon = pemohonRes.rows[0];
            if (pemohon?.email) {
              await sendCutiStatusEmail({
                toEmail: pemohon.email,
                karyawanName: pemohon.nama_lengkap,
                status: updatedCuti.status as 'Disetujui' | 'Ditolak',
                alasanCuti: cuti.alasan || cuti.keterangan || '-',
                tanggalMulai: cuti.tanggal_mulai,
                tanggalSelesai: cuti.tanggal_selesai,
                sisaCuti: pemohon.sisa_cuti,
                rejectedBy: updatedCuti.rejected_by
              });
            }
          } catch(e) { console.error("Gagal mengirim email status cuti ke karyawan (magic-link):", e); }
        })();
      }

      return new NextResponse(
        generateHTML("Sukses!", message, "success"),
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    } else {
       return new NextResponse("Tindakan tidak dikenali.", { status: 400 });
    }

  } catch (err: any) {
    console.error("Error magic approve:", err);
    return new NextResponse(
      generateHTML("Terjadi Kesalahan", "Sistem mengalami gangguan: " + err.message, "error"),
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

function generateHTML(title: string, desc: string, type: 'success'|'error'|'info') {
  let color = "#3b82f6"; // blue
  if (type === 'success') color = "#10b981"; // green
  if (type === 'error') color = "#ef4444"; // red

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: center; max-width: 400px; width: 90%; }
        h1 { color: ${color}; margin-bottom: 10px; font-size: 24px; font-weight: 800; }
        p { color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 24px; }
        a { display: inline-block; background-color: #0f172a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>${title}</h1>
        <p>${desc}</p>
        <a href="/">Kembali ke Alice</a>
      </div>
    </body>
    </html>
  `;
}
