// File: src/app/api/auth/register/complete/route.ts

import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import bcrypt from "bcrypt";

/**
 * POST: Memproses pembuatan akun berdasarkan token registrasi yang dikirim dari email.
 * Fungsi ini akan memverifikasi token, mengenkripsi password, membuat user baru,
 * dan menghubungkannya dengan data profil karyawan secara transaksional.
 */
export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const { token, password } = await request.json();

    // Validasi data input
    if (!token || !password) {
      return NextResponse.json(
        { message: "Data tidak lengkap." },
        { status: 400 },
      );
    }

    // 1. Verifikasi token di tabel karyawan dan pastikan belum memiliki akun (user_id IS NULL)
    const employeeResult = await client.query(
      `SELECT id, email, nama_lengkap, nip 
       FROM karyawan 
       WHERE registration_token = $1 
       AND registration_expires > NOW() 
       AND user_id IS NULL`,
      [token],
    );

    if (employeeResult.rows.length === 0) {
      return NextResponse.json(
        {
          message:
            "Token tidak valid atau sudah kedaluwarsa. Silakan lakukan verifikasi email kembali.",
        },
        { status: 400 },
      );
    }

    const employee = employeeResult.rows[0];

    // 2. Mulai Transaksi Database untuk menjaga integritas data
    await client.query("BEGIN");

    // 3. Hash Password untuk keamanan (Enkripsi satu arah)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Cari ID Role default untuk pendaftaran mandiri (misal: 'Karyawan')
    const roleResult = await client.query(
      "SELECT id FROM roles WHERE nama_role = 'Karyawan' LIMIT 1",
    );
    const roleId = roleResult.rows[0]?.id;

    // 5. Insert data ke tabel users (Kredensial Login)
    const userInsertResult = await client.query(
      `INSERT INTO users (email, password_hash, role_id, karyawan_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [employee.email, passwordHash, roleId, employee.id],
    );

    const newUserId = userInsertResult.rows[0].id;

    // 6. Update tabel karyawan (Sinkronisasi ID user dan pembersihan token registrasi)
    await client.query(
      `UPDATE karyawan 
       SET user_id = $1, 
           registration_token = NULL, 
           registration_expires = NULL 
       WHERE id = $2`,
      [newUserId, employee.id],
    );

    // Selesaikan transaksi jika semua langkah berhasil
    await client.query("COMMIT");

    return NextResponse.json({
      message: "Akun berhasil dibuat! Silakan login menggunakan email Anda.",
    });
  } catch (error: unknown) {
    // Batalkan semua perubahan jika terjadi kesalahan di tengah jalan
    await client.query("ROLLBACK");
    console.error("Final registration error:", error);
    return NextResponse.json(
      { message: "Gagal menyelesaikan pendaftaran akun." },
      { status: 500 },
    );
  } finally {
    // Pastikan koneksi client dikembalikan ke pool
    client.release();
  }
}
