// File: src/app/api/job-openings/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";
import {
  canUserAccessJobOpening,
  verifyAdminRequest,
} from "@/app/lib/recruitmentAuth";

export const dynamic = "force-dynamic";

/**
 * GET: Mengambil detail satu lowongan pekerjaan.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const isAdminScope = searchParams.get("scope") === "admin";

    let canManageLowongan = false;
    if (isAdminScope) {
      const user = await verifyAdminRequest(req);
      if (!user) {
        return NextResponse.json(
          { message: "Sesi admin tidak valid." },
          { status: 401 }
        );
      }
      const allowed = await canUserAccessJobOpening({ user, jobOpeningId: id });
      if (!allowed) {
        return NextResponse.json(
          { message: "Anda tidak memiliki akses melihat detail lowongan ini." },
          { status: 403 }
        );
      }
      canManageLowongan = user.isHcLowonganManager;
    }

    const result = await pool.query(
      `
      SELECT
        jo.id,
        jo.job_id,
        jo.request_id,
        jo.title,
        jo.status,
        jo.posted_date,
        jo.closing_date,
        j.nama_job,
        j.jenis_job AS category,
        j.deskripsi_job,
        j.kualifikasi_job,
        req_k.nama_lengkap AS requester_name,
        lj.nama_level AS requester_level,
        d.nama_departemen AS requester_department,
        jeb.nama_bundle AS essay_bundle_name
      FROM job_openings jo
      LEFT JOIN job j ON jo.job_id = j.id
      LEFT JOIN employee_requests er ON jo.request_id = er.id
      LEFT JOIN karyawan req_k ON er.requester_id = req_k.id
      LEFT JOIN jabatan req_j ON req_k.jabatan_id = req_j.id
      LEFT JOIN level_jabatan lj ON req_j.level_jabatan_id = lj.id
      LEFT JOIN departemen d ON req_j.departemen_id = d.id
      LEFT JOIN job_opening_essay_bundles joeb ON joeb.job_opening_id = jo.id
      LEFT JOIN job_essay_bundles jeb ON joeb.bundle_id = jeb.id AND jeb.is_active = true
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

    const row = result.rows[0];
    if (isAdminScope) {
      return NextResponse.json({
        ...row,
        can_manage_lowongan: canManageLowongan,
      });
    }
    return NextResponse.json(row);
  } catch (error) {
    console.error("API Error - Gagal mengambil detail lowongan:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Memperbarui lowongan (khusus HC).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAdminRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Sesi admin tidak valid." }, { status: 401 });
    }
    if (!user.isHcLowonganManager) {
      return NextResponse.json(
        { message: "Hanya HC yang berhak mengubah data lowongan." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const allowedFields = new Set(["title", "status", "closing_date", "posted_date"]);
    const fieldsToUpdate = Object.keys(body).filter((k) => allowedFields.has(k));
    if (fieldsToUpdate.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data valid yang dikirim untuk diperbarui." },
        { status: 400 }
      );
    }

    if (body.status === "Published") {
      const current = await pool.query(
        "SELECT posted_date FROM job_openings WHERE id = $1",
        [id]
      );
      if (current.rows.length > 0 && !current.rows[0].posted_date && !body.posted_date) {
        body.posted_date = new Date();
        if (!fieldsToUpdate.includes("posted_date")) fieldsToUpdate.push("posted_date");
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
 * DELETE: Menghapus lowongan (khusus HC).
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAdminRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Sesi admin tidak valid." }, { status: 401 });
    }
    if (!user.isHcLowonganManager) {
      return NextResponse.json(
        { message: "Hanya HC yang berhak menghapus lowongan." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    await pool.query("DELETE FROM job_openings WHERE id = $1", [id]);
    return NextResponse.json({ message: "Lowongan berhasil dihapus" });
  } catch (error) {
    console.error("API Error - Gagal menghapus lowongan:", error);
    return NextResponse.json({ message: "Gagal menghapus" }, { status: 500 });
  }
}
