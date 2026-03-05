import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import bcrypt from "bcrypt";
import { PoolClient } from "pg";

/**
 * GET: Mengambil semua data user.
 * Menggunakan relasi UUID (karyawan_id) untuk menggabungkan data identitas.
 */
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        k.nip, -- NIP sekarang diambil dari tabel karyawan
        u.email,
        k.nama_lengkap,
        r.id as role_id,
        r.nama_role,
        u.karyawan_id
      FROM users u
      LEFT JOIN karyawan k ON u.karyawan_id = k.id -- Join berdasarkan UUID
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY k.nama_lengkap ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil data user",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Membuat user baru.
 * Menerima karyawan_id (UUID) untuk menghubungkan akun login dengan profil karyawan.
 */
export async function POST(request: Request) {
  const client: PoolClient = await pool.connect();
  try {
    const body = await request.json();
    const { karyawan_id, email, password, role_id } = body;

    // Validasi input dasar
    if (!karyawan_id || !email || !password || !role_id) {
      return NextResponse.json(
        { message: "Semua field (karyawan_id, email, password, role_id) wajib diisi" },
        { status: 400 }
      );
    }

    // Memulai transaksi database
    await client.query("BEGIN");

    // 1. Hash password untuk keamanan
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 2. Insert user baru ke tabel users
    // Menggunakan karyawan_id (UUID) sebagai referensi
    const userInsertResult = await client.query(
      `INSERT INTO users (email, password_hash, role_id, karyawan_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, role_id, karyawan_id, created_at`,
      [email, password_hash, role_id, karyawan_id]
    );

    const newUser = userInsertResult.rows[0];
    const newUserId = newUser.id;

    // 3. Update tabel karyawan (Sinkronisasi dua arah)
    // Mengisi user_id pada tabel karyawan dengan ID user yang baru dibuat
    const karyawanUpdateResult = await client.query(
      "UPDATE karyawan SET user_id = $1 WHERE id = $2",
      [newUserId, karyawan_id]
    );

    // Pastikan karyawan memang ada
    if (karyawanUpdateResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `Karyawan dengan ID tersebut tidak ditemukan.` },
        { status: 404 }
      );
    }

    // Berhasil, simpan permanen
    await client.query("COMMIT");

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    // Batalkan semua jika ada kegagalan
    await client.query("ROLLBACK");
    console.error("Error creating user:", error);

    // Cek error constraint unik (Email sudah ada)
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    // Cek error foreign key (ID Karyawan atau Role tidak valid)
    if (error.code === "23503") {
      return NextResponse.json(
        { message: "ID Karyawan atau ID Role tidak valid." },
        { status: 400 }
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
    // Kembalikan koneksi ke pool
    client.release();
  }
}