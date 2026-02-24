import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Interface untuk error database guna menghindari 'any'
interface DatabaseError extends Error {
  code?: string;
  detail?: string;
}

/**
 * GET: Mengambil satu data request pegawai berdasarkan ID (UUID).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const result = await pool.query(
      `
      SELECT
        er.id,
        er.request_date,
        er.quantity,
        er.type,
        er.urgency,
        er.status,
        er.mbti_results,
        er.job_id,
        j.nama_job AS position,
        k.nama_lengkap AS requester,
        d.nama_departemen AS department,
        lj.nama_level AS level
      FROM employee_requests er
      LEFT JOIN job j ON er.job_id = j.id
      LEFT JOIN karyawan k ON er.requester_id = k.id -- Menggunakan requester_id (UUID)
      LEFT JOIN jabatan kj ON k.jabatan_id = kj.id
      LEFT JOIN departemen d ON kj.departemen_id = d.id
      LEFT JOIN level_jabatan lj ON kj.level_jabatan_id = lj.id
      WHERE er.id = $1;
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Request dengan ID ${id} tidak ditemukan.` },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan tidak diketahui";
    return NextResponse.json(
      { message: "Gagal mengambil data", error: errorMessage },
      { status: 500 },
    );
  }
}

/**
 * PUT: Memperbarui keseluruhan data request pegawai.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const {
      job_id,
      quantity,
      type,
      urgency,
      mbti_results,
    }: {
      job_id: string;
      quantity: number;
      type: string;
      urgency: string;
      mbti_results?: string[];
    } = body;

    if (!job_id || !quantity || !type || !urgency) {
      return NextResponse.json(
        { message: "Semua field wajib diisi untuk pembaruan." },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `UPDATE employee_requests
       SET 
         job_id = $1,
         quantity = $2,
         type = $3,
         urgency = $4,
         mbti_results = $5,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [job_id, quantity, type, urgency, mbti_results, id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Request dengan ID ${id} tidak ditemukan.` },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json(
      { message: "Gagal memperbarui request", error: errorMessage },
      { status: 500 },
    );
  }
}

/**
 * PATCH: Memperbarui status dan membuat lowongan jika disetujui.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const body = await request.json();

  if (body.status === "Disetujui") {
    const client = await pool.connect();
    try {
      const { title, closing_date, opening_status } = body;
      if (!title) {
        return NextResponse.json(
          { message: "Judul lowongan wajib diisi." },
          { status: 400 },
        );
      }

      const finalStatus = opening_status || "Published";
      const postedDate = finalStatus === "Published" ? new Date() : null;

      await client.query("BEGIN");

      const updateResult = await client.query(
        "UPDATE employee_requests SET status = 'Disetujui', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
        [id],
      );

      if (updateResult.rows.length === 0) {
        throw new Error(`Request dengan ID ${id} tidak ditemukan.`);
      }

      const approvedRequest = updateResult.rows[0];

      await client.query(
        `INSERT INTO job_openings (request_id, job_id, title, status, closing_date, posted_date)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          approvedRequest.job_id,
          title,
          finalStatus,
          closing_date || null,
          postedDate,
        ],
      );

      await client.query("COMMIT");
      return NextResponse.json(approvedRequest);
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      return NextResponse.json(
        { message: "Gagal menyetujui request", error: errorMessage },
        { status: 500 },
      );
    } finally {
      client.release();
    }
  } else {
    const fieldsToUpdate = Object.keys(body);
    if (fieldsToUpdate.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data yang dikirim." },
        { status: 400 },
      );
    }

    const setQueryParts = fieldsToUpdate.map(
      (field, i) => `${field} = $${i + 1}`,
    );
    const values = fieldsToUpdate.map((field) => body[field]);
    values.push(id);

    try {
      const result = await pool.query(
        `UPDATE employee_requests SET ${setQueryParts.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
        values,
      );
      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: `Request dengan ID ${id} tidak ditemukan.` },
          { status: 404 },
        );
      }
      return NextResponse.json(result.rows[0]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      return NextResponse.json(
        { message: "Gagal memperbarui request", error: errorMessage },
        { status: 500 },
      );
    }
  }
}

/**
 * DELETE: Menghapus data request pegawai.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const result = await pool.query(
      "DELETE FROM employee_requests WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: `Request dengan ID ${id} tidak ditemukan.` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: `Request dengan ID ${id} berhasil dihapus.`,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json(
      { message: "Gagal menghapus request", error: errorMessage },
      { status: 500 },
    );
  }
}
