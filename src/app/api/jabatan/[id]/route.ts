// File: src/app/api/jabatan/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Tipe data untuk request PUT
interface JabatanInput {
    departemen_id: number;
    level_jabatan_id: number;
}

/**
 * @swagger
 * /api/jabatan/{id}:
 * get:
 * summary: Mendapatkan detail jabatan
 * description: Mengambil data satu jabatan berdasarkan ID.
 * tags: [Jabatan]
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
 * description: Jabatan tidak ditemukan.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const { id } = await params;
        const result = await pool.query(
            `
      SELECT
        j.id,
        j.departemen_id,
        d.nama_departemen,
        j.level_jabatan_id,
        lj.nama_level
      FROM jabatan j
      JOIN departemen d ON j.departemen_id = d.id
      JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      WHERE j.id = $1
    `,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: `Jabatan dengan ID ${id} tidak ditemukan` },
                { status: 404 }
            );
        }
        return NextResponse.json(result.rows[0]);
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
 * /api/jabatan/{id}:
 * put:
 * summary: Memperbarui jabatan
 * description: Mengubah data satu jabatan berdasarkan ID.
 * tags: [Jabatan]
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
 * departemen_id:
 * type: integer
 * level_jabatan_id:
 * type: integer
 * responses:
 * 200:
 * description: Berhasil diperbarui.
 * 404:
 * description: Jabatan tidak ditemukan.
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const { id } = await params;
        const { departemen_id, level_jabatan_id }: JabatanInput =
            await request.json();

        if (!departemen_id || !level_jabatan_id) {
            return NextResponse.json(
                { message: "Departemen ID dan Level Jabatan ID wajib diisi" },
                { status: 400 }
            );
        }

        const result = await pool.query(
            "UPDATE jabatan SET departemen_id = $1, level_jabatan_id = $2 WHERE id = $3 RETURNING *",
            [departemen_id, level_jabatan_id, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: `Jabatan dengan ID ${id} tidak ditemukan` },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating jabatan:", err);
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
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
            { message: "Error updating jabatan", error: errorMessage },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/jabatan/{id}:
 * delete:
 * summary: Menghapus jabatan
 * description: Menghapus data satu jabatan berdasarkan ID.
 * tags: [Jabatan]
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
 * description: Jabatan tidak ditemukan.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const { id } = await params;
        const result = await pool.query(
            "DELETE FROM jabatan WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: `Jabatan dengan ID ${id} tidak ditemukan` },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: `Jabatan dengan ID ${id} berhasil dihapus`,
        });
    } catch (err) {
        console.error("Error deleting jabatan:", err);
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json(
            { message: "Error deleting jabatan", error: errorMessage },
            { status: 500 }
        );
    }
}
