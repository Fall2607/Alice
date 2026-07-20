import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import crypto from "crypto";
import { sendCutiMagicLink, sendCutiStatusEmail } from "@/app/lib/email";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { cuti_id, action, approver_id, is_hc } = data; // action: 'approve' or 'reject'

    // Ambil data cuti dan pastikan join dengan karyawan untuk cek atasan_id
    const cutiRes = await pool.query(`
      SELECT c.*, k.atasan_id, k.id as p_kary_id, k.nama_lengkap 
      FROM pengajuan_cuti c 
      JOIN karyawan k ON c.karyawan_id = k.id 
      WHERE c.id = $1
    `, [cuti_id]);
    
    if (cutiRes.rows.length === 0) {
      return NextResponse.json({ message: "Pengajuan cuti tidak ditemukan" }, { status: 404 });
    }

    const cuti = cutiRes.rows[0];

    if (cuti.status === 'Disetujui' || cuti.status === 'Ditolak') {
      return NextResponse.json({ message: "Cuti ini sudah diproses sebelumnya." }, { status: 400 });
    }

    let newStatus = cuti.status;
    let query = ``;
    let params: any[] = [];

    if (action === 'reject') {
      newStatus = 'Ditolak';
      
      const approverNameRes = await pool.query(`SELECT nama_lengkap FROM karyawan WHERE id = $1`, [approver_id]);
      const approverName = approverNameRes.rows[0]?.nama_lengkap || 'Atasan/HC';
      const rejectedByStr = is_hc ? `HC (${approverName})` : `Atasan (${approverName})`;

      if (is_hc) {
        query = `UPDATE pengajuan_cuti SET status = $1, hc_approved_by_id = $2, magic_token = NULL, rejected_by = $4 WHERE id = $3 RETURNING *`;
        params = [newStatus, approver_id, cuti_id, rejectedByStr];
      } else {
        query = `UPDATE pengajuan_cuti SET status = $1, atasan_approved_by_id = $2, magic_token = NULL, rejected_by = $4 WHERE id = $3 RETURNING *`;
        params = [newStatus, approver_id, cuti_id, rejectedByStr];
      }
    } else if (action === 'approve') {
      const sendEmailToHC = async (tokenHC: string, namaPemohon: string) => {
        try {
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
                            toEmail: hc.email, approverName: hc.nama_lengkap, karyawanName: namaPemohon,
                            tanggalMulai: cuti.tanggal_mulai, tanggalSelesai: cuti.tanggal_selesai,
                            tanggalKembali: cuti.tanggal_kembali, jumlahHari: cuti.jumlah_hari,
                            alasan: cuti.alasan, token: tokenHC
                        });
                    } catch (emailErr) { console.error("Gagal mengirim ke HC:", emailErr); }
                }
            }
        } catch(e) { console.error("Gagal mengirim magic link HC:", e); }
      };

      if (cuti.status === 'Menunggu Atasan') {
        if (cuti.atasan_id !== approver_id) {
          return NextResponse.json({ message: "Unauthorized. Anda bukan atasan dari pemohon cuti ini." }, { status: 403 });
        }
        
        const newMagicToken = crypto.randomBytes(32).toString('hex');
        
        // Cek level jabatan approver_id
        const atasanRes = await pool.query(`
          SELECT k.id, k.atasan_id, lj.nama_level, k.nama_lengkap, k.email 
          FROM karyawan k
          LEFT JOIN jabatan j ON k.jabatan_id = j.id
          LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
          WHERE k.id = $1
        `, [approver_id]);
        
        const atasanInfo = atasanRes.rows[0];
        const isSpvOrHigher = ['Supervisor', 'Wakil Direktur', 'Direktur'].includes(atasanInfo?.nama_level);

        let spvInfo = null;
        if (!isSpvOrHigher && atasanInfo?.atasan_id) {
           const spvRes = await pool.query(`SELECT email, nama_lengkap FROM karyawan WHERE id = $1`, [atasanInfo.atasan_id]);
           if (spvRes.rows.length > 0 && spvRes.rows[0].email) {
              spvInfo = spvRes.rows[0];
           }
        }

        if (isSpvOrHigher || !spvInfo) {
           newStatus = 'Menunggu HC';
           query = `UPDATE pengajuan_cuti SET status = $1, atasan_approved_by_id = $2, magic_token = $3 WHERE id = $4 RETURNING *`;
           params = [newStatus, approver_id, newMagicToken, cuti_id];
           await sendEmailToHC(newMagicToken, cuti.nama_lengkap);
        } else {
           newStatus = 'Menunggu SPV';
           query = `UPDATE pengajuan_cuti SET status = $1, atasan_approved_by_id = $2, magic_token = $3 WHERE id = $4 RETURNING *`;
           params = [newStatus, approver_id, newMagicToken, cuti_id];
           
           try {
             await sendCutiMagicLink({
                 toEmail: spvInfo.email, approverName: spvInfo.nama_lengkap, karyawanName: cuti.nama_lengkap,
                 tanggalMulai: cuti.tanggal_mulai, tanggalSelesai: cuti.tanggal_selesai,
                 tanggalKembali: cuti.tanggal_kembali, jumlahHari: cuti.jumlah_hari,
                 alasan: cuti.alasan, token: newMagicToken
             });
           } catch(e) { console.error("Gagal mengirim email ke SPV dari dashboard:", e); }
        }
        
      } else if (cuti.status === 'Menunggu SPV') {
         // Verifikasi bahwa approver adalah SPV-nya (atasannya Atasan)
         const spvRes = await pool.query(`SELECT atasan_id FROM karyawan WHERE id = $1`, [cuti.atasan_id]);
         const spvId = spvRes.rows[0]?.atasan_id || null;
         
         if (spvId !== approver_id) {
            return NextResponse.json({ message: "Unauthorized. Anda bukan SPV yang dituju untuk permohonan ini." }, { status: 403 });
         }

         const newMagicToken = crypto.randomBytes(32).toString('hex');
         newStatus = 'Menunggu HC';
         query = `UPDATE pengajuan_cuti SET status = $1, spv_approved_by_id = $2, magic_token = $3 WHERE id = $4 RETURNING *`;
         params = [newStatus, approver_id, newMagicToken, cuti_id];
         await sendEmailToHC(newMagicToken, cuti.nama_lengkap);
      } else if (cuti.status === 'Menunggu HC') {
        if (!is_hc) {
          return NextResponse.json({ message: "Unauthorized. Anda tidak memiliki akses HC." }, { status: 403 });
        }
        newStatus = 'Disetujui';
        query = `UPDATE pengajuan_cuti SET status = $1, hc_approved_by_id = $2, magic_token = NULL WHERE id = $3 RETURNING *`;
        params = [newStatus, approver_id, cuti_id];
        
        // POTONG SALDO CUTI JIKA JENIS TAHUNAN DAN DIAPPROVE FINAL
        if (cuti.jenis_cuti === 'Tahunan') {
            await pool.query(`UPDATE karyawan SET sisa_cuti = sisa_cuti - $1 WHERE id = $2`, [cuti.jumlah_hari, cuti.karyawan_id]);
        }
      }
    }

    if(query) {
      const result = await pool.query(query, params);
      const updatedCuti = result.rows[0];

      if (newStatus === 'Disetujui' || newStatus === 'Ditolak') {
        (async () => {
          try {
            const pemohonRes = await pool.query(`SELECT email, nama_lengkap, sisa_cuti FROM karyawan WHERE id = $1`, [cuti.karyawan_id]);
            const pemohon = pemohonRes.rows[0];
            if (pemohon?.email) {
              await sendCutiStatusEmail({
                toEmail: pemohon.email,
                karyawanName: pemohon.nama_lengkap,
                status: newStatus as 'Disetujui' | 'Ditolak',
                alasanCuti: cuti.alasan || cuti.keterangan || '-',
                tanggalMulai: cuti.tanggal_mulai,
                tanggalSelesai: cuti.tanggal_selesai,
                sisaCuti: pemohon.sisa_cuti,
                rejectedBy: updatedCuti.rejected_by
              });
            }
          } catch(e) { console.error("Gagal mengirim email status cuti ke karyawan (dashboard):", e); }
        })();
      }

      return NextResponse.json({
        message: `Cuti berhasil di-${action}`,
        data: updatedCuti
      });
    }

    return NextResponse.json({ message: "Status cuti tidak valid untuk aksi ini." }, { status: 400 });

  } catch (err: any) {
    console.error("Error approving cuti:", err);
    return NextResponse.json({ message: "Terjadi kesalahan server", error: err.message }, { status: 500 });
  }
}
