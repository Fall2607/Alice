import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function PATCH(request: Request, context: any) {
  const params = await context.params;
  const id = params.id;

  try {
    const { status, approved_by_id } = await request.json();

    if (!status || !['Disetujui', 'Ditolak'].includes(status)) {
      return NextResponse.json(
        { message: "Status tidak valid. Harus 'Disetujui' atau 'Ditolak'." },
        { status: 400 }
      );
    }

    if (!approved_by_id) {
      return NextResponse.json(
        { message: "ID Atasan (approved_by_id) wajib diisi." },
        { status: 400 }
      );
    }

    const checkRes = await pool.query(`SELECT * FROM pengajuan_lembur WHERE id = $1`, [id]);
    
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ message: "Pengajuan lembur tidak ditemukan." }, { status: 404 });
    }

    const lembur = checkRes.rows[0];

    if (lembur.status !== 'Pending') {
      return NextResponse.json(
        { message: `Pengajuan lembur ini sudah diproses (${lembur.status}).` },
        { status: 400 }
      );
    }

    const updateRes = await pool.query(
      `UPDATE pengajuan_lembur 
       SET status = $1::status_approval_enum, approved_by_id = $2 
       WHERE id = $3 
       RETURNING *`,
      [status, approved_by_id, id]
    );

    return NextResponse.json({
      message: `Pengajuan lembur berhasil di-${status.toLowerCase()}.`,
      data: updateRes.rows[0]
    });

  } catch (error) {
    console.error("Error updating lembur:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui status lembur", error: (error as Error).message },
      { status: 500 }
    );
  }
}
