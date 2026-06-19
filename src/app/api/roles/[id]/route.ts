// File: src/app/api/roles/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Handler untuk GET (mendapatkan satu role by ID)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await pool.query("SELECT * FROM roles WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: `Role dengan ID ${id} tidak ditemukan` },
                { status: 404 }
            );
        }
        return NextResponse.json(result.rows[0]);
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json(
            { message: "Error fetching role", error: errorMessage },
            { status: 500 }
        );
    }
}

// Handler untuk PUT (memperbarui role by ID)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { nama_role, deskripsi } = await request.json();

        if (!nama_role) {
            return NextResponse.json(
                { message: "Nama role wajib diisi" },
                { status: 400 }
            );
        }

        const result = await pool.query(
            "UPDATE roles SET nama_role = $1, deskripsi = $2 WHERE id = $3 RETURNING *",
            [nama_role, deskripsi, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: `Role dengan ID ${id} tidak ditemukan` },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json(
            { message: "Error updating role", error: errorMessage },
            { status: 500 }
        );
    }
}

// Handler untuk DELETE (menghapus role by ID)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const result = await pool.query(
            "DELETE FROM roles WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: `Role dengan ID ${id} tidak ditemukan` },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: `Role dengan ID ${id} berhasil dihapus`,
        });
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json(
            { message: "Error deleting role", error: errorMessage },
            { status: 500 }
        );
    }
}
