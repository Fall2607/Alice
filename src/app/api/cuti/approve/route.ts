import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import crypto from "crypto";
import { sendCutiMagicLink } from "@/app/lib/email";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { cuti_id, action, approver_id, is_hc } = data; // action: 'approve' or 'reject'

    // Ambil data cuti
    const cutiRes = await pool.query(`SELECT * FROM cuti WHERE id = $1`, [cuti_id]);
    if (cutiRes.rows.length === 0) {
      return NextResponse.json({ message: "Pengajuan cuti tidak ditemukan" }, { status: 404 });
    }

    const cuti = cutiRes.rows[0];

    if (cuti.status === 'APPROVED' || cuti.status === 'REJECTED' || cuti.status === 'CANCELLED') {
      return NextResponse.json({ message: "Cuti ini sudah diproses sebelumnya." }, { status: 400 });
    }

    let newStatus = cuti.status;
    let query = ``;
    let params: any[] = [];

    if (action === 'reject') {
      newStatus = 'REJECTED';
      if (is_hc) {
        query = `UPDATE cuti SET status = $1, approved_by_hc_id = $2, magic_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`;
        params = [newStatus, approver_id, cuti_id];
      } else {
        query = `UPDATE cuti SET status = $1, approved_by_atasan_id = $2, magic_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`;
        params = [newStatus, approver_id, cuti_id];
      }
    } else if (action === 'approve') {
      if (cuti.status === 'PENDING_ATASAN') {
        // Harus diverifikasi bahwa yg approve adalah atasannya
        if (cuti.atasan_id !== approver_id) {
          return NextResponse.json({ message: "Unauthorized. Anda bukan atasan dari pemohon cuti ini." }, { status: 403 });
        }
        
        const newMagicToken = crypto.randomBytes(32).toString('hex');
        newStatus = 'PENDING_HC';
        query = `UPDATE cuti SET status = $1, approved_by_atasan_id = $2, magic_token = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`;
        params = [newStatus, approver_id, newMagicToken, cuti_id];
        
        // Asynchronously send emails to HC
        (async () => {
          try {
              const pemohonRes = await pool.query(`SELECT nama_lengkap FROM karyawan WHERE id = $1`, [cuti.karyawan_id]);
              const namaPemohon = pemohonRes.rows[0]?.nama_lengkap || 'Karyawan';
              
              const hcRes = await pool.query(`
                SELECT k.email, k.nama_lengkap 
                FROM karyawan k
                JOIN users u ON k.user_id = u.id
                JOIN roles r ON u.role_id = r.id
                WHERE r.nama_role ILIKE '%hrd%' OR r.nama_role ILIKE '%hc%' OR r.nama_role ILIKE '%human capital%'
              `);
              for (const hc of hcRes.rows) {
                  if (hc.email) {
                      await sendCutiMagicLink(hc.email, hc.nama_lengkap, namaPemohon, cuti.tanggal_mulai, cuti.tanggal_selesai, cuti.keterangan, newMagicToken);
                  }
              }
          } catch(e) { console.error("Gagal mengirim magic link HC setelah Atasan approve di dashboard:", e); }
        })();
        
      } else if (cuti.status === 'PENDING_HC') {
        if (!is_hc) {
          return NextResponse.json({ message: "Unauthorized. Anda tidak memiliki akses HC." }, { status: 403 });
        }
        newStatus = 'APPROVED';
        query = `UPDATE cuti SET status = $1, approved_by_hc_id = $2, magic_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`;
        params = [newStatus, approver_id, cuti_id];
        
        // POTONG SALDO CUTI JIKA JENIS TAHUNAN DAN DIAPPROVE FINAL
        if (cuti.jenis_cuti === 'Tahunan') {
            await pool.query(`UPDATE karyawan SET sisa_cuti = sisa_cuti - $1 WHERE id = $2`, [cuti.jumlah_hari, cuti.karyawan_id]);
        }
      }
    }

    const result = await pool.query(query, params);

    return NextResponse.json({
      message: `Cuti berhasil di-${action}`,
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error("Error approving cuti:", err);
    return NextResponse.json({ message: "Terjadi kesalahan server", error: err.message }, { status: 500 });
  }
}
