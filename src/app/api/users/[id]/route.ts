// File: app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import bcrypt from 'bcrypt';

// PUT: Memperbarui data user berdasarkan ID
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { nip, email, password, role_id, status } = await request.json();

        if (!nip || !email || !role_id || !status) {
            return NextResponse.json({ message: "NIP, email, role wajib diisi" }, { status: 400 });
        }

        let query;
        let queryParams;

        // Cek apakah password juga ingin di-update
        if (password) {
            // Jika ada password baru, hash terlebih dahulu
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);
            query = `
        UPDATE users 
        SET nip = $1, email = $2, password_hash = $3, role_id = $4 = $5 
        WHERE id = $6 RETURNING id, nip, email, role_id
      `;
            queryParams = [nip, email, password_hash, role_id, status, id];
        } else {
            // Jika tidak ada password baru, jangan update hash-nya
            query = `
        UPDATE users 
        SET nip = $1, email = $2, role_id = $3 
        WHERE id = $5 RETURNING id, nip, email, role_id
      `;
            queryParams = [nip, email, role_id, status, id];
        }

        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === '23505') {
            return NextResponse.json({ message: "Email atau NIP sudah terdaftar untuk user lain." }, { status: 409 });
        }
        return NextResponse.json(
            { message: "Gagal memperbarui user", error: (error as Error).message },
            { status: 500 }
        );
    }
}

// DELETE: Menghapus data user berdasarkan ID
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [
            id,
        ]);

        if (result.rowCount === 0) {
            return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json({ message: "User berhasil dihapus" });
    } catch (error) {
        return NextResponse.json(
            { message: "Gagal menghapus user", error: (error as Error).message },
            { status: 500 }
        );
    }
}

