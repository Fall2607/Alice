import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function PATCH(request: Request, context: any) {
  // Gunakan await untuk mengakses context.params karena di Next.js 15+ params berbentuk Promise
  const params = await context.params;
  const id = params.id;

  const client = await pool.connect();
  try {
    const { status, approved_by_id } = await request.json();

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { message: "Status tidak valid. Harus 'APPROVED' atau 'REJECTED'." },
        { status: 400 }
      );
    }

    if (!approved_by_id) {
      return NextResponse.json(
        { message: "ID Atasan (approved_by_id) wajib diisi." },
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

    // Jika status sudah berubah sebelumnya, tolak
    if (cuti.status !== 'PENDING') {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `Pengajuan cuti ini sudah diproses (${cuti.status}).` },
        { status: 400 }
      );
    }

    // Hitung durasi hari
    const tglMulai = new Date(cuti.tanggal_mulai);
    const tglSelesai = new Date(cuti.tanggal_selesai);
    const durasi = Math.ceil((tglSelesai.getTime() - tglMulai.getTime()) / (1000 * 3600 * 24)) + 1;

    // Jika disetujui, potong sisa cuti karyawan
    if (status === 'APPROVED') {
      const updateKaryawanRes = await client.query(
        `UPDATE karyawan 
         SET sisa_cuti = sisa_cuti - $1 
         WHERE id = $2 AND sisa_cuti >= $1
         RETURNING sisa_cuti`,
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

    // Update status pengajuan cuti
    const updateCutiRes = await client.query(
      `UPDATE pengajuan_cuti 
       SET status = $1::status_cuti, approved_by_id = $2 
       WHERE id = $3 
       RETURNING *`,
      [status, approved_by_id, id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: `Pengajuan cuti berhasil di-${status.toLowerCase()}.`,
      data: updateCutiRes.rows[0]
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
