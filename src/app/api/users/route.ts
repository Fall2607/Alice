// File: src/app/api/users/route.ts
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import bcrypt from "bcrypt";
import { PoolClient } from "pg";

// GET: Mengambil semua data user dengan join ke tabel karyawan dan roles
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.nip, 
        u.email,
        k.nama_lengkap,
        r.id as role_id,
        r.nama_role
      FROM users u
      LEFT JOIN karyawan k on u.nip = k.nip
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Gagal mengambil data user",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// POST: Membuat user baru dan mengupdate tabel karyawan
export async function POST(request: Request) {
  const client: PoolClient = await pool.connect();
  try {
    const { nip, email, password, role_id } = await request.json();

    if (!nip || !email || !password || !role_id) {
      return NextResponse.json(
        { message: "Semua field (nip, email, password, role_id) wajib diisi" },
        { status: 400 }
      );
    }

    // Memulai transaksi
    await client.query("BEGIN");

    // 1. Hash password sebelum disimpan
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 2. Insert user baru dan dapatkan ID-nya
    const userInsertResult = await client.query(
      "INSERT INTO users (nip, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING id, nip, email, role_id, created_at",
      [nip, email, password_hash, role_id]
    );

    const newUser = userInsertResult.rows[0];
    const newUserId = newUser.id;

    // 3. Update tabel karyawan dengan user_id yang baru dibuat
    const karyawanUpdateResult = await client.query(
      "UPDATE karyawan SET user_id = $1 WHERE nip = $2",
      [newUserId, nip]
    );

    // Periksa apakah ada baris karyawan yang diperbarui
    if (karyawanUpdateResult.rowCount === 0) {
      // Jika tidak ada, batalkan transaksi dan beri tahu user
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `Karyawan dengan NIP ${nip} tidak ditemukan.` },
        { status: 404 }
      );
    }

    // Jika semua berhasil, commit transaksi
    await client.query("COMMIT");

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    // Jika terjadi error, batalkan semua perubahan
    await client.query("ROLLBACK");

    if (error instanceof Error && "code" in error && error.code === "23505") {
      return NextResponse.json(
        { message: "Email atau NIP sudah terdaftar." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        message: "Gagal membuat user baru",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    // Pastikan koneksi client dikembalikan ke pool
    client.release();
  }
}
