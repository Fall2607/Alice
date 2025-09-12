// File: app/api/users/route.ts
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import bcrypt from 'bcrypt';

// GET: Mengambil semua data user dengan join ke tabel karyawan dan roles
export async function GET() {
    try {
        const result = await pool.query(`
      SELECT 
        u.id, 
        u.nip, 
        u.email,
        k.nama_lengkap,
        r.nama_role, 
        u.created_at
      FROM users u
      LEFT JOIN karyawan k on u.nip = k.nip
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id ASC
    `);
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ message: "Gagal mengambil data user", error: (error as Error).message }, { status: 500 });
    }
}

// POST: Membuat user baru
export async function POST(request: Request) {
    try {
        const { nip, email, password, role_id, status } = await request.json();

        if (!nip || !email || !password || !role_id || !status) {
            return NextResponse.json({ message: "Semua field (nip, email, password, role_id) wajib diisi" }, { status: 400 });
        }

        // Hash password sebelum disimpan
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            "INSERT INTO users (nip, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING id, nip, email, role_id, created_at",
            [nip, email, password_hash, role_id, status]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        // Menangani error jika ada duplikasi email atau nip
        if (error instanceof Error && 'code' in error && error.code === '23505') {
            return NextResponse.json({ message: "Email atau NIP sudah terdaftar." }, { status: 409 });
        }
        return NextResponse.json({ message: "Gagal membuat user baru", error: (error as Error).message }, { status: 500 });
    }
}

