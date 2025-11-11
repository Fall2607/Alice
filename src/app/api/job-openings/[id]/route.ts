// File: src/app/api/job-openings/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";

/**
 * GET: Mengambil detail satu lowongan pekerjaan.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 🔧 ubah di sini
) {
  try {
    const { id } = await context.params; // 🔧 gunakan await
    const result = await pool.query(
      `
      SELECT
        jo.id,
        jo.title,
        jo.status,
        jo.posted_date,
        jo.closing_date,
        j.nama_job,
        j.jenis_job AS category,
        j.deskripsi_job,
        j.kualifikasi_job
      FROM job_openings jo
      LEFT JOIN job j ON jo.job_id = j.id
      WHERE jo.id = $1;
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("API Error - Gagal mengambil detail lowongan:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Memperbarui lowongan (misal: mempublikasikan, edit judul).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 🔧 ubah di sini
) {
  try {
    const { id } = await context.params; // 🔧 gunakan await
    const body = await req.json();

    const fieldsToUpdate = Object.keys(body);
    if (fieldsToUpdate.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data yang dikirim untuk diperbarui." },
        { status: 400 }
      );
    }

    if (body.status === "Published") {
      const current = await pool.query(
        "SELECT posted_date FROM job_openings WHERE id = $1",
        [id]
      );
      if (!current.rows[0].posted_date) {
        body.posted_date = new Date();
      }
    }

    const setQueryParts = fieldsToUpdate.map(
      (field, index) => `${field} = $${index + 1}`
    );
    const values = fieldsToUpdate.map((field) => body[field]);
    values.push(id);

    const result = await pool.query(
      `UPDATE job_openings 
       SET ${setQueryParts.join(", ")}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${values.length} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Lowongan dengan ID ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("API Error - Gagal memperbarui lowongan:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json(
      { message: "Gagal memperbarui lowongan", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Menghapus lowongan.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 🔧 ubah di sini
) {
  try {
    const { id } = await context.params; // 🔧 gunakan await
    await pool.query("DELETE FROM job_openings WHERE id = $1", [id]);
    return NextResponse.json({ message: "Lowongan berhasil dihapus" });
  } catch (error) {
    console.error("API Error - Gagal menghapus lowongan:", error);
    return NextResponse.json({ message: "Gagal menghapus" }, { status: 500 });
  }
}
