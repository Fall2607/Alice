// File: src/app/api/jobs/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"; // Menggunakan NextRequest
import pool from "@/app/lib/db";

// Mendefinisikan tipe data untuk objek Job
interface Job {
  id: number;
  nama_job: string;
  jenis_job: "Medis" | "Non-Medis";
  deskripsi_job: string[];
  kualifikasi_job: string[];
}

/**
 * @swagger
 * /api/jobs/{id}:
 * get:
 * summary: Mendapatkan detail pekerjaan
 * description: Mengambil data satu pekerjaan berdasarkan ID.
 * tags: [Jobs]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Sukses.
 * 404:
 * description: Pekerjaan tidak ditemukan.
 */
export async function GET(
  request: NextRequest,
  // Tipe diubah untuk mencerminkan bahwa params mungkin perlu di-await
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Menambahkan await untuk mengatasi error di environment tertentu
    const { id } = await params;
    const result = await pool.query("SELECT * FROM job WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Pekerjaan dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching job:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error fetching job", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/jobs/{id}:
 * put:
 * summary: Memperbarui pekerjaan
 * description: Mengubah data satu pekerjaan berdasarkan ID.
 * tags: [Jobs]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nama_job:
 * type: string
 * jenis_job:
 * type: string
 * enum: [Medis, Non-Medis]
 * deskripsi_job:
 * type: array
 * items:
 * type: string
 * kualifikasi_job:
 * type: array
 * items:
 * type: string
 * responses:
 * 200:
 * description: Berhasil diperbarui.
 * 404:
 * description: Pekerjaan tidak ditemukan.
 */
export async function PUT(
  request: NextRequest,
  // Tipe diubah untuk mencerminkan bahwa params mungkin perlu di-await
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Menambahkan await untuk mengatasi error di environment tertentu
    const { id } = await params;
    const {
      nama_job,
      jenis_job,
      deskripsi_job,
      kualifikasi_job,
    }: Partial<Job> = await request.json();

    if (!nama_job || !jenis_job) {
      return NextResponse.json(
        { message: "Nama dan jenis pekerjaan wajib diisi" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "UPDATE job SET nama_job = $1, jenis_job = $2, deskripsi_job = $3, kualifikasi_job = $4 WHERE id = $5 RETURNING *",
      [
        nama_job,
        jenis_job,
        JSON.stringify(deskripsi_job || []),
        JSON.stringify(kualifikasi_job || []),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Pekerjaan dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating job:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error updating job", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/jobs/{id}:
 * delete:
 * summary: Menghapus pekerjaan
 * description: Menghapus data satu pekerjaan berdasarkan ID.
 * tags: [Jobs]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Berhasil dihapus.
 * 404:
 * description: Pekerjaan tidak ditemukan.
 */
export async function DELETE(
  request: NextRequest,
  // Tipe diubah untuk mencerminkan bahwa params mungkin perlu di-await
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Menambahkan await untuk mengatasi error di environment tertentu
    const { id } = await params;
    const result = await pool.query(
      "DELETE FROM job WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: `Pekerjaan dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Pekerjaan dengan ID ${id} berhasil dihapus`,
    });
  } catch (err) {
    console.error("Error deleting job:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error deleting job", error: errorMessage },
      { status: 500 }
    );
  }
}
