import { NextResponse } from "next/server";
import pool from "@/app/lib/db"; // Pastikan path ke koneksi pool Anda benar

/**
 * GET: Mengambil semua data departemen dari database.
 * @returns {Promise<NextResponse>} Response JSON berisi array departemen atau pesan error.
 */
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM departemen ORDER BY id ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("API Error - Gagal mengambil departemen:", error);
    // Penanganan error yang lebih aman tanpa 'any'
    let errorMessage = "Terjadi kesalahan pada server.";
    if (error instanceof Error) {
      // Jika objek error adalah instance dari Error, kita bisa aman mengakses properti message
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "Gagal mengambil data departemen", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST: Membuat departemen baru di database.
 * @param {Request} request - Request object yang berisi body JSON.
 * @returns {Promise<NextResponse>} Response JSON berisi data departemen yang baru dibuat atau pesan error.
 */
export async function POST(request: Request) {
  try {
    const { nama_departemen, jenis_departemen } = await request.json();

    // Validasi input sederhana
    if (!nama_departemen || !jenis_departemen) {
      return NextResponse.json(
        { message: "Nama dan jenis departemen tidak boleh kosong" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "INSERT INTO departemen (nama_departemen, jenis_departemen) VALUES ($1, $2) RETURNING *",
      [nama_departemen, jenis_departemen]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("API Error - Gagal membuat departemen:", error);
    // Penanganan error yang lebih aman tanpa 'any'
    let errorMessage = "Terjadi kesalahan pada server.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "Gagal membuat departemen baru", error: errorMessage },
      { status: 500 }
    );
  }
}
