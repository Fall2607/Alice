import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: "Data tidak lengkap." }, { status: 400 });
    }

    // 1. Cari user berdasarkan token dan cek masa berlaku
    const userResult = await pool.query(
      `SELECT id FROM users 
       WHERE reset_password_token = $1 
       AND reset_password_expires > NOW()`, 
      [token]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ 
        message: "Token reset tidak valid atau sudah kedaluwarsa. Silakan ajukan ulang." 
      }, { status: 400 });
    }

    const userId = userResult.rows[0].id;

    // 2. Hash password baru
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // 3. Update password dan bersihkan token agar tidak bisa dipakai ulang
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, 
           reset_password_token = NULL, 
           reset_password_expires = NULL 
       WHERE id = $2`,
      [passwordHash, userId]
    );

    return NextResponse.json({ message: "Password Anda berhasil diperbarui. Silakan login." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Gagal memperbarui password." }, { status: 500 });
  }
}