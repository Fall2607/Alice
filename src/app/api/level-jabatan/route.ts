// File: src/app/api/level-jabatan/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Mendefinisikan tipe data untuk objek LevelJabatan
interface LevelJabatan {
    id: number;
    nama_level: string;
}

/**
 * @swagger
 * /api/level-jabatan:
 * get:
 * summary: Mendapatkan semua level jabatan
 * description: Mengambil daftar semua level jabatan yang tersedia.
 * tags: [Level Jabatan]
 * responses:
 * 200:
 * description: Sukses.
 */
export async function GET() {
    try {
        const result = await pool.query("SELECT * FROM level_jabatan ORDER BY id ASC");
        return NextResponse.json(result.rows);
    } catch (err) {
        console.error("Error fetching level jabatan:", err);
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json(
            { message: "Error fetching level jabatan", error: errorMessage },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/level-jabatan:
 * post:
 * summary: Membuat level jabatan baru
 * description: Menambahkan level jabatan baru ke dalam database.
 * tags: [Level Jabatan]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nama_level:
 * type: string
 * responses:
 * 201:
 * description: Berhasil dibuat.
 */
export async function POST(request: NextRequest) {
    try {
        const { nama_level }: Partial<LevelJabatan> = await request.json();

        if (!nama_level) {
            return NextResponse.json(
                { message: "Nama level wajib diisi" },
                { status: 400 }
            );
        }

        const result = await pool.query(
            "INSERT INTO level_jabatan (nama_level) VALUES ($1) RETURNING *",
            [nama_level]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (err) {
        console.error("Error creating level jabatan:", err);
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json(
            { message: "Error creating level jabatan", error: errorMessage },
            { status: 500 }
        );
    }
}
