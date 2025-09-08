// File: src/app/api/jabatan/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Tipe data untuk request POST/PUT
interface JabatanInput {
    departemen_id: number;
    level_jabatan_id: number;
}

/**
 * @swagger
 * /api/jabatan:
 * get:
 * summary: Mendapatkan semua data jabatan
 * description: Mengambil daftar semua jabatan beserta detail departemen dan level jabatannya.
 * tags: [Jabatan]
 * responses:
 * 200:
 * description: Sukses.
 */
export async function GET() {
    try {
        const result = await pool.query(`
      SELECT
        j.id,
        j.departemen_id,
        d.nama_departemen,
        j.level_jabatan_id,
        lj.nama_level
      FROM jabatan j
      JOIN departemen d ON j.departemen_id = d.id
      JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      ORDER BY j.id ASC
    `);
        return NextResponse.json(result.rows);
    } catch (err) {
        console.error("Error fetching jabatan:", err);
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json(
            { message: "Error fetching jabatan", error: errorMessage },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/jabatan:
 * post:
 * summary: Membuat jabatan baru
 * description: Menambahkan jabatan baru dengan menghubungkan departemen_id dan level_jabatan_id.
 * tags: [Jabatan]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * departemen_id:
 * type: integer
 * level_jabatan_id:
 * type: integer
 * responses:
 * 201:
 * description: Berhasil dibuat.
 */
export async function POST(request: NextRequest) {
    try {
        const { departemen_id, level_jabatan_id }: JabatanInput =
            await request.json();

        if (!departemen_id || !level_jabatan_id) {
            return NextResponse.json(
                { message: "Departemen ID dan Level Jabatan ID wajib diisi" },
                { status: 400 }
            );
        }

        const result = await pool.query(
            "INSERT INTO jabatan (departemen_id, level_jabatan_id) VALUES ($1, $2) RETURNING *",
            [departemen_id, level_jabatan_id]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (err) {
        console.error("Error creating jabatan:", err);
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        // Cek error foreign key untuk memberikan pesan yang lebih jelas
        if (errorMessage.includes("violates foreign key constraint")) {
            return NextResponse.json(
                {
                    message:
                        "Error: departemen_id atau level_jabatan_id tidak valid atau tidak ditemukan.",
                    error: errorMessage,
                },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "Error creating jabatan", error: errorMessage },
            { status: 500 }
        );
    }
}
