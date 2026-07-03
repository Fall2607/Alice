import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import jwt from "jsonwebtoken";
import { sendCutiMagicLink } from "@/app/lib/email";

export async function PATCH(request: Request, context: any) {
  const params = await context.params;
  const id = params.id;

  const client = await pool.connect();
  try {
    const { action, approver_id, approver_role } = await request.json();

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { message: "Action tidak valid. Harus 'APPROVE' atau 'REJECT'." },
        { status: 400 }
      );
    }

    if (!approver_id) {
      return NextResponse.json(
        { message: "ID Approver wajib diisi." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Ambil data pengajuan cuti terlebih dahulu
    const cutiRes = await client.query(`SELECT * FROM pengajuan_cuti WHERE id = $1 FOR UPDATE`, [id]);
    
    if (cutiRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Pengajuan cuti tidak ditemukan." }, { status: 404 });
    }

    const cuti = cutiRes.rows[0];

    // Jika sudah Ditolak atau Disetujui, tidak bisa diubah lagi
    if (cuti.status === 'Disetujui' || cuti.status === 'Ditolak' || cuti.status === 'APPROVED' || cuti.status === 'REJECTED') {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `Pengajuan cuti ini sudah berstatus final (${cuti.status}).` },
        { status: 400 }
      );
    }

    if (action === 'REJECT') {
      // Jika ada yang reject, langsung tolak
      await client.query(
        `UPDATE pengajuan_cuti SET status = 'Ditolak', approved_by_id = $1 WHERE id = $2`,
        [approver_id, id]
      );
      await client.query("COMMIT");
      return NextResponse.json({ message: "Pengajuan cuti telah ditolak." });
    }

    // Logika APPROVE bertingkat
    let nextStatus = cuti.status;
    let updateQuery = "";
    let updateParams: any[] = [];

    let spvEmail = null;
    let spvName = null;
    let spvId = null;

    if (cuti.status === 'Menunggu Atasan' || cuti.status === 'PENDING') {
      nextStatus = 'Menunggu SPV';
      updateQuery = `UPDATE pengajuan_cuti SET status = $1::status_cuti, atasan_approved_by_id = $2 WHERE id = $3 RETURNING *`;
      updateParams = [nextStatus, approver_id, id];

      // Cari Atasannya Atasan (SPV)
      const spvRes = await client.query(`
        SELECT a.id, a.email, a.nama_lengkap 
        FROM karyawan k 
        LEFT JOIN karyawan a ON k.atasan_id = a.id 
        WHERE k.id = $1
      `, [approver_id]);
      
      if (spvRes.rows.length > 0 && spvRes.rows[0].email) {
        spvId = spvRes.rows[0].id;
        spvEmail = spvRes.rows[0].email;
        spvName = spvRes.rows[0].nama_lengkap;
      }

    } else if (cuti.status === 'Menunggu SPV') {
      nextStatus = 'Menunggu HC';
      updateQuery = `UPDATE pengajuan_cuti SET status = $1::status_cuti, spv_approved_by_id = $2 WHERE id = $3 RETURNING *`;
      updateParams = [nextStatus, approver_id, id];
    } else if (cuti.status === 'Menunggu HC') {
      nextStatus = 'Disetujui';
      updateQuery = `UPDATE pengajuan_cuti SET status = $1::status_cuti, hc_approved_by_id = $2, approved_by_id = $2 WHERE id = $3 RETURNING *`;
      updateParams = [nextStatus, approver_id, id];

      // Jika disetujui HC, potong sisa cuti karyawan
      const tglMulai = new Date(cuti.tanggal_mulai);
      const tglSelesai = new Date(cuti.tanggal_selesai);
      const durasi = Math.ceil((tglSelesai.getTime() - tglMulai.getTime()) / (1000 * 3600 * 24)) + 1;

      const updateKaryawanRes = await client.query(
        `UPDATE karyawan SET sisa_cuti = sisa_cuti - $1 WHERE id = $2 AND sisa_cuti >= $1 RETURNING sisa_cuti`,
        [durasi, cuti.karyawan_id]
      );

      if (updateKaryawanRes.rowCount === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: "Sisa cuti karyawan tidak mencukupi untuk disetujui." },
          { status: 400 }
        );
      }
    }

    const updateCutiRes = await client.query(updateQuery, updateParams);
    const updatedCuti = updateCutiRes.rows[0];
    await client.query("COMMIT");

    // Kirim email ke SPV jika lanjut ke Menunggu SPV
    if (nextStatus === 'Menunggu SPV' && spvEmail && spvId) {
      try {
        const kRes = await client.query(`SELECT nama_lengkap FROM karyawan WHERE id = $1`, [cuti.karyawan_id]);
        const kName = kRes.rows.length > 0 ? kRes.rows[0].nama_lengkap : 'Karyawan';
        
        const tokenPayload = {
          cuti_id: updatedCuti.id,
          approver_id: spvId,
          role: 'SPV'
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        
        const tMulai = new Date(cuti.tanggal_mulai).toLocaleDateString('id-ID');
        const tSelesai = new Date(cuti.tanggal_selesai).toLocaleDateString('id-ID');
        
        await sendCutiMagicLink(spvEmail, spvName, kName, tMulai, tSelesai, cuti.alasan, token);
      } catch (err) {
        console.error("Gagal kirim email ke SPV:", err);
      }
    }

    return NextResponse.json({
      message: `Pengajuan cuti berhasil diproses. Status sekarang: ${nextStatus}.`,
      data: updatedCuti
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating cuti:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui status cuti", error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
