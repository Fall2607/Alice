// File: src/app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import bcrypt from "bcrypt";

// Interface untuk data yang akan diupdate, tanpa 'status'
interface UserUpdateInput {
  nip?: string;
  email?: string;
  password?: string;
  role_id?: number;
}

// Handler untuk GET (mendapatkan satu user berdasarkan ID)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT 
        u.id, 
        u.nip, 
        u.email,
        k.nama_lengkap,
        u.role_id,
        r.nama_role, 
        u.created_at
        -- REMOVED: Menghapus u.status dari query
      FROM users u
      LEFT JOIN karyawan k on u.nip = k.nip
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
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Gagal mengambil data user", error: errorMessage },
      { status: 500 }
    );
  }
}

// Handler untuk PATCH (memperbarui data user berdasarkan ID)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UserUpdateInput = await request.json();

    const updateFields = [];
    const values = [];
    let queryIndex = 1;

    for (const [key, value] of Object.entries(body)) {
      if (key === "password" && value) {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(value, saltRounds);
        updateFields.push(`password_hash = $${queryIndex++}`);
        values.push(password_hash);
        // FIX: Menghapus 'status' dari field yang bisa diupdate
      } else if (["nip", "email", "role_id"].includes(key)) {
        updateFields.push(`${key} = $${queryIndex++}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data yang dikirim untuk diupdate" },
        { status: 400 }
      );
    }

    values.push(id);
    const updateQuery = `
      UPDATE users
      SET ${updateFields.join(", ")}
      WHERE id = $${queryIndex}
      RETURNING id, nip, email, role_id, created_at;
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: `User dengan ID ${id} tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";

    if (errorMessage.includes("duplicate key value")) {
      return NextResponse.json(
        { message: "Error: Email atau NIP yang diupdate sudah terdaftar." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Gagal mengupdate data user", error: errorMessage },
      { status: 500 }
    );
  }
}

// Handler untuk DELETE (menghapus user berdasarkan ID)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *;",
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
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Gagal menghapus user", error: errorMessage },
      { status: 500 }
    );
  }
}
