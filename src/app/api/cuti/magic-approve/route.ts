import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import crypto from "crypto";
import { sendCutiMagicLink } from "@/app/lib/email";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action'); // 'APPROVE' or 'REJECT'

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
      query = `UPDATE pengajuan_cuti SET status = 'Ditolak', magic_token = NULL WHERE id = $1`;
      params = [cuti.id];
      message = `Permohonan cuti ${cuti.nama_lengkap} berhasil ditolak.`;
    } else if (action === 'APPROVE') {
      if (cuti.status === 'Menunggu Atasan') {
        // Atasan approve -> Naik ke Menunggu HC
        query = `UPDATE pengajuan_cuti SET status = 'Menunggu HC', magic_token = $1, atasan_approved_by_id = $2 WHERE id = $3`;
        params = [newMagicToken, cuti.atasan_id, cuti.id];
        message = `Permohonan cuti ${cuti.nama_lengkap} disetujui (Tahap 1). Diteruskan ke HC untuk persetujuan final.`;
        
        // Kirim email ke HC
        const hcRes = await pool.query(`
          SELECT k.email, k.nama_lengkap 
          FROM karyawan k
          JOIN users u ON k.user_id = u.id
          JOIN roles r ON u.role_id = r.id
          WHERE r.nama_role ILIKE '%hrd%' OR r.nama_role ILIKE '%hc%' OR r.nama_role ILIKE '%human capital%'
        `);
        for (const hc of hcRes.rows) {
            if (hc.email) {
                await sendCutiMagicLink(hc.email, hc.nama_lengkap, cuti.nama_lengkap, cuti.tanggal_mulai, cuti.tanggal_selesai, cuti.alasan, newMagicToken);
            }
        }
      } else if (cuti.status === 'Menunggu HC') {
        // HC approve -> Disetujui final
        query = `UPDATE pengajuan_cuti SET status = 'Disetujui', magic_token = NULL WHERE id = $1`;
        params = [cuti.id];
        message = `Permohonan cuti ${cuti.nama_lengkap} berhasil DISETUJUI sepenuhnya.`;
        
        if (cuti.jenis_cuti === 'Tahunan') {
            await pool.query(`UPDATE karyawan SET sisa_cuti = sisa_cuti - $1 WHERE id = $2`, [cuti.jumlah_hari, cuti.karyawan_id]);
        }
      }
    }

    if (query) {
      await pool.query(query, params);
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
