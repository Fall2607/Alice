/**
 * Path: src/app/api/menus/[id]/route.ts
 * Deskripsi: Endpoint detail menu untuk update (PATCH) dan hapus (DELETE).
 * Perbaikan: Menambahkan filter kolom valid untuk mencegah error SQL 500.
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    /**
     * DAFTAR KOLOM VALID (Whitelist)
     * Kita hanya mengizinkan kolom yang benar-benar ada di tabel 'menus'.
     * Ini mencegah error jika frontend mengirim data tambahan seperti 'parent_name'.
     */
    const allowedColumns = [
      "parent_id",
      "nama_menu",
      "path",
      "icon",
      "urutan",
      "is_active"
    ];

    // Filter body agar hanya berisi kolom yang diizinkan
    const updateData: Record<string, any> = {};
    Object.keys(body).forEach((key) => {
      if (allowedColumns.includes(key)) {
        // Jika parent_id kosong string, ubah jadi null untuk database
        if (key === "parent_id" && body[key] === "") {
          updateData[key] = null;
        } else {
          updateData[key] = body[key];
        }
      }
    });

    const fields = Object.keys(updateData);
    
    if (fields.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data valid untuk diperbarui." }, 
        { status: 400 }
      );
    }

    // Bangun query secara dinamis
    const setQuery = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const values = Object.values(updateData);
    values.push(id); // ID untuk klausa WHERE

    const query = `
      UPDATE public.menus 
      SET ${setQuery} 
      WHERE id = $${values.length} 
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Menu tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);

  } catch (error: any) {
    console.error("PATCH Menu Error:", error.message);
    return NextResponse.json(
      { message: "Gagal update menu.", error: error.message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 1. Cek apakah menu ini memiliki sub-menu (child)
    const checkChild = await pool.query(
      "SELECT id FROM public.menus WHERE parent_id = $1", 
      [id]
    );

    if (checkChild.rowCount && checkChild.rowCount > 0) {
      return NextResponse.json(
        { message: "Hapus semua sub-menu terlebih dahulu sebelum menghapus kategori utama." }, 
        { status: 400 }
      );
    }

    // 2. Eksekusi penghapusan
    const result = await pool.query(
      "DELETE FROM public.menus WHERE id = $1 RETURNING id", 
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Menu tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ message: "Menu berhasil dihapus secara permanen." });

  } catch (error: any) {
    console.error("DELETE Menu Error:", error.message);
    return NextResponse.json(
      { message: "Gagal menghapus menu.", error: error.message }, 
      { status: 500 }
    );
  }
}