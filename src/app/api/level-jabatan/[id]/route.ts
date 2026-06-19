// File: src/app/api/level-jabatan/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Mendefinisikan tipe data untuk objek LevelJabatan
interface LevelJabatan {
    id: number;
    nama_level: string;
}

/**
 * @swagger
 * /api/level-jabatan/{id}:
 * get:
 * summary: Mendapatkan detail level jabatan
 * description: Mengambil data satu level jabatan berdasarkan ID.
 * tags: [Level Jabatan]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Sukses.
 * 404:
 * description: Level jabatan tidak ditemukan.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await pool.query("SELECT * FROM level_jabatan WHERE id = $1", [
            id,
        ]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: `Level jabatan dengan ID ${id} tidak ditemukan` },
                { status: 404 }
            );
        }
        return NextResponse.json(result.rows[0]);
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
 * /api/level-jabatan/{id}:
 * put:
 * summary: Memperbarui level jabatan
 * description: Mengubah data satu level jabatan berdasarkan ID.
 * tags: [Level Jabatan]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
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
 * 200:
 * description: Berhasil diperbarui.
 * 404:
 * description: Level jabatan tidak ditemukan.
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { nama_level }: Partial<LevelJabatan> = await request.json();

        if (!nama_level) {
            return NextResponse.json(
                { message: "Nama level wajib diisi" },
                { status: 400 }
            );
        }

        const result = await pool.query(
            "UPDATE level_jabatan SET nama_level = $1 WHERE id = $2 RETURNING *",
            [nama_level, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: `Level jabatan dengan ID ${id} tidak ditemukan` },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating level jabatan:", err);
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json(
            { message: "Error updating level jabatan", error: errorMessage },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/level-jabatan/{id}:
 * delete:
 * summary: Menghapus level jabatan
 * description: Menghapus data satu level jabatan berdasarkan ID.
 * tags: [Level Jabatan]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Berhasil dihapus.
 * 404:
 * description: Level jabatan tidak ditemukan.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await pool.query(
            "DELETE FROM level_jabatan WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: `Level jabatan dengan ID ${id} tidak ditemukan` },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: `Level jabatan dengan ID ${id} berhasil dihapus`,
        });
    } catch (err) {
        console.error("Error deleting level jabatan:", err);
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json(
            { message: "Error deleting level jabatan", error: errorMessage },
            { status: 500 }
        );
    }
}
