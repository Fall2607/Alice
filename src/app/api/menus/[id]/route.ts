/**
 * Path: src/app/api/menus/[id]/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const fields = Object.keys(body);
    if (fields.length === 0) return NextResponse.json({ message: "Tidak ada data update." }, { status: 400 });

    const setQuery = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const values = Object.values(body);
    values.push(id);

    const query = `UPDATE menus SET ${setQuery} WHERE id = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rowCount === 0) return NextResponse.json({ message: "Menu tidak ditemukan." }, { status: 404 });
    return NextResponse.json(result.rows[0]);

  } catch (error: any) {
    return NextResponse.json({ message: "Gagal update menu.", error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Cek apakah punya child
    const checkChild = await pool.query("SELECT id FROM menus WHERE parent_id = $1", [id]);
    if (checkChild.rowCount! > 0) {
      return NextResponse.json({ message: "Hapus sub-menu terlebih dahulu sebelum menghapus kategori utama." }, { status: 400 });
    }

    await pool.query("DELETE FROM menus WHERE id = $1", [id]);
    return NextResponse.json({ message: "Menu berhasil dihapus." });

  } catch (error: any) {
    return NextResponse.json({ message: "Gagal hapus menu.", error: error.message }, { status: 500 });
  }
}