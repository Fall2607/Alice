// File: src/app/api/roles/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Tipe data untuk Role
interface Role {
    id: number;
    nama_role: string;
    deskripsi: string | null;
}

// Handler untuk GET (mendapatkan semua roles)
export async function GET(request: NextRequest) {
    try {
        const result = await pool.query("SELECT * FROM roles ORDER BY id ASC");
        return NextResponse.json(result.rows);
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json(
            { message: "Error fetching roles", error: errorMessage },
            { status: 500 }
        );
    }
}

// Handler untuk POST (membuat role baru)
export async function POST(request: NextRequest) {
    try {
        const { nama_role, deskripsi }: Partial<Role> = await request.json();

        if (!nama_role) {
            return NextResponse.json(
                { message: "Nama role wajib diisi" },
                { status: 400 }
            );
        }

        const result = await pool.query(
            "INSERT INTO roles (nama_role, deskripsi) VALUES ($1, $2) RETURNING *",
            [nama_role, deskripsi || null]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        // Menangani error jika nama_role sudah ada (unique constraint)
        if (errorMessage.includes('duplicate key value violates unique constraint "roles_nama_role_key"')) {
            return NextResponse.json({ message: `Role dengan nama "${(err as any).detail.match(/\((.*?)\)/)[1]}" sudah ada.` }, { status: 409 });
        }
        return NextResponse.json(
            { message: "Error creating role", error: errorMessage },
            { status: 500 }
        );
    }
}
