// File: src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    // Validasi input
    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi." },
        { status: 400 },
      );
    }

    // Cek apakah JWT_SECRET sudah di-set
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET belum diatur di .env.local");
      return NextResponse.json(
        { message: "Kesalahan konfigurasi server." },
        { status: 500 },
      );
    }

    // 1. Cari user berdasarkan email
    const userResult = await pool.query(
      `
      SELECT 
        u.id,
        u.email,
        u.password_hash,
        u.karyawan_id,
        k.nama_lengkap,
        r.nama_role
      FROM users u
      LEFT JOIN karyawan k ON u.karyawan_id = k.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `,
      [identifier],
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 },
      );
    }

    const user = userResult.rows[0];

    // 2. Bandingkan password yang diberikan dengan hash di database
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 },
      );
    }

    // 3. Jika password cocok, buat JWT
    const payload = {
      userId: user.id,
      name: user.nama_lengkap,
      role: user.nama_role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d", // Token akan berlaku selama 1 hari
    });

    // 4. Kirim token dan data user kembali ke client
    return NextResponse.json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,
        name: user.nama_lengkap,
        email: user.email,
        role: user.nama_role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
