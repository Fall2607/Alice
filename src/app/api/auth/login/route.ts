import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: "Email dan password wajib diisi." }, { status: 400 });
    }

    // 1. Cari user - Sertakan u.role_id dalam SELECT
    const userResult = await pool.query(
      `SELECT 
        u.id,
        u.email,
        u.password_hash,
        u.karyawan_id,
        u.role_id, -- Diambil untuk kebutuhan hak akses di frontend
        k.nama_lengkap,
        k.jenis_kelamin,
        r.nama_role
      FROM users u
      LEFT JOIN karyawan k ON u.karyawan_id = k.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE LOWER(u.email) = LOWER($1)`,
      [identifier]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
    }

    const payload = {
      userId: user.id,
      karyawanId: user.karyawan_id,
      roleId: user.role_id,
      name: user.nama_lengkap,
      role: user.nama_role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d" });

    return NextResponse.json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,
        karyawan_id: user.karyawan_id,
        role_id: user.role_id, // Kirim role_id ke frontend
        name: user.nama_lengkap,
        email: user.email,
        role: user.nama_role,
        jenis_kelamin: user.jenis_kelamin
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server.", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}