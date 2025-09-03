import { NextResponse } from "next/server";
import pool from "@/app/lib/db"; // Pastikan path ke koneksi pool Anda benar

// Tipe untuk parameter dari URL dinamis
type RouteContext = {
  params: {
    id: string;
  };
};

/**
 * GET: Mengambil satu departemen berdasarkan ID.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const result = await pool.query("SELECT * FROM departemen WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Departemen dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(`API Error - Gagal mengambil departemen ID:`, error);
    let errorMessage = "Terjadi kesalahan pada server.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "Gagal mengambil data departemen", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PUT: Memperbarui departemen berdasarkan ID.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const { nama_departemen, jenis_departemen } = await request.json();

    if (!nama_departemen || !jenis_departemen) {
      return NextResponse.json(
        { message: "Nama dan jenis departemen tidak boleh kosong" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "UPDATE departemen SET nama_departemen = $1, jenis_departemen = $2 WHERE id = $3 RETURNING *",
      [nama_departemen, jenis_departemen, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Departemen dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(`API Error - Gagal memperbarui departemen ID:`, error);
    let errorMessage = "Terjadi kesalahan pada server.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "Gagal memperbarui departemen", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Menghapus departemen berdasarkan ID.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;

    const result = await pool.query(
      "DELETE FROM departemen WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `Departemen dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Departemen '${result.rows[0].nama_departemen}' berhasil dihapus`,
    });
  } catch (error) {
    console.error(`API Error - Gagal menghapus departemen ID:`, error);
    let errorMessage = "Terjadi kesalahan pada server.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "Gagal menghapus departemen", error: errorMessage },
      { status: 500 }
    );
  }
}
