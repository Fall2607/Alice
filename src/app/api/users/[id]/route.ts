import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import bcrypt from "bcrypt";

// Interface untuk error database guna menghindari 'any'
interface DatabaseError extends Error {
  code?: string;
  detail?: string;
}

// Interface untuk data yang akan diupdate
interface UserUpdateInput {
  karyawan_id?: string; // UUID
  email?: string;
  password?: string;
  role_id?: string;    // UUID
}

/**
 * GET: Mengambil satu data user berdasarkan ID (UUID).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const result = await pool.query(
      `
      SELECT 
        u.id, 
        k.nip, -- Diambil dari join tabel karyawan
        u.email,
        k.nama_lengkap,
        u.role_id,
        r.nama_role, 
        u.created_at,
        u.karyawan_id
      FROM users u
      LEFT JOIN karyawan k ON u.karyawan_id = k.id -- Sinkronisasi relasi UUID
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `User dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui";
    return NextResponse.json(
      { message: "Gagal mengambil data user", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Memperbarui data user secara parsial.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body: UserUpdateInput = await request.json();

    const updateFields = [];
    const values = [];
    let queryIndex = 1;

    // Iterasi body untuk membangun query dinamis
    for (const [key, value] of Object.entries(body)) {
      if (!value) continue;

      if (key === "password") {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(value, saltRounds);
        updateFields.push(`password_hash = $${queryIndex++}`);
        values.push(password_hash);
      } else if (["karyawan_id", "email", "role_id"].includes(key)) {
        updateFields.push(`${key} = $${queryIndex++}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data valid yang dikirim untuk diperbarui" },
        { status: 400 }
      );
    }

    values.push(id);
    const updateQuery = `
      UPDATE users
      SET ${updateFields.join(", ")}
      WHERE id = $${queryIndex}
      RETURNING id, email, role_id, karyawan_id, created_at;
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `User dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: unknown) {
    const dbError = err as DatabaseError;
    const errorMessage = dbError.message || "An unknown error occurred";

    // Error duplikasi email
    if (dbError.code === "23505") {
      return NextResponse.json(
        { message: "Error: Email tersebut sudah terdaftar oleh pengguna lain." },
        { status: 409 }
      );
    }

    // Error Foreign Key (ID Karyawan atau Role tidak valid)
    if (dbError.code === "23503") {
      return NextResponse.json(
        { message: "Error: ID Karyawan atau ID Role yang diberikan tidak valid." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Gagal memperbarui data user", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Menghapus data user.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Opsional: Sebelum hapus user, Anda mungkin ingin mengosongkan user_id di tabel karyawan
    // agar data karyawan tidak ikut terhapus atau error jika ada constraint RESTRICT.
    await pool.query("UPDATE karyawan SET user_id = NULL WHERE user_id = $1", [id]);

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id;",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: `User dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `User dengan ID ${id} berhasil dihapus`,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus user";
    return NextResponse.json(
      { message: "Gagal menghapus user", error: errorMessage },
      { status: 500 }
    );
  }
}