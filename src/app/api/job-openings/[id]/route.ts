// File: src/app/api/job-openings/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";

/**
 * GET: Mengambil detail satu lowongan pekerjaan.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const result = await pool.query(`
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
    `, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ message: "Lowongan tidak ditemukan" }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("API Error - Gagal mengambil detail lowongan:", error);
        return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
    }
}

/**
 * PATCH: Memperbarui lowongan (misal: mempublikasikan).
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        // Logika untuk update, misal: mengubah status menjadi 'Published'
        // ...
        return NextResponse.json({ message: "Dalam pengembangan" });
    } catch (error) {
        return NextResponse.json({ message: "Gagal memperbarui" }, { status: 500 });
    }
}

/**
 * DELETE: Menghapus lowongan.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        await pool.query("DELETE FROM job_openings WHERE id = $1", [id]);
        return NextResponse.json({ message: "Lowongan berhasil dihapus" });
    } catch (error) {
        return NextResponse.json({ message: "Gagal menghapus" }, { status: 500 });
    }
}
