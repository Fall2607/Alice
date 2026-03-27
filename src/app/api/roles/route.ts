/**
 * Path: src/app/api/roles/route.ts
 * Deskripsi: Endpoint untuk mengambil daftar role dan menambah role baru menggunakan UUID.
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

// Interface disesuaikan dengan standar UUID (string)
interface Role {
    id: string; 
    nama_role: string;
    deskripsi: string | null;
}

// Handler untuk GET (mendapatkan semua roles)
export async function GET(request: NextRequest) {
    try {
        // Mengurutkan berdasarkan nama agar tampilan di sidebar/list lebih rapi (A-Z)
        const result = await pool.query("SELECT id, nama_role, deskripsi FROM public.roles ORDER BY nama_role ASC");
        return NextResponse.json(result.rows);
    } catch (err) {
        console.error("Error fetching roles:", err);
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan pada server.";
        return NextResponse.json(
            { message: "Gagal mengambil data role.", error: errorMessage },
            { status: 500 }
        );
    }
}

// Handler untuk POST (membuat role baru)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nama_role, deskripsi } = body;

        if (!nama_role) {
            return NextResponse.json(
                { message: "Nama role wajib diisi." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            "INSERT INTO public.roles (nama_role, deskripsi) VALUES ($1, $2) RETURNING *",
            [nama_role, deskripsi || null]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (err: any) {
        console.error("Error creating role:", err);
        const errorMessage = err.message || "An unknown error occurred";
        
        // Menangani error jika nama_role sudah ada (unique constraint)
        if (err.code === "23505") {
            return NextResponse.json(
                { message: `Role dengan nama tersebut sudah terdaftar.` }, 
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Gagal membuat role baru.", error: errorMessage },
            { status: 500 }
        );
    }
}