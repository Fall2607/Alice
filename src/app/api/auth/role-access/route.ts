/**
 * Path: src/app/api/auth/role-access/[roleId]/route.ts
 * Deskripsi: Endpoint untuk mengambil matriks izin seluruh menu untuk Role ID tertentu.
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> | { roleId: string } }
) {
  try {
    // Next.js 15 mewajibkan await pada params
    const resolvedParams = await params;
    const { roleId } = resolvedParams;

    if (!roleId) {
      return NextResponse.json({ message: "Role ID tidak valid." }, { status: 400 });
    }

    /**
     * Query ini menggabungkan tabel 'menus' dengan 'role_menu_access'.
     * Menggunakan LEFT JOIN agar semua menu tetap muncul di daftar, 
     * meskipun role tersebut belum pernah diatur izinnya (menggunakan COALESCE untuk default false).
     */
    const result = await pool.query(
      `SELECT 
        m.id as menu_id,
        m.nama_menu,
        m.path,
        COALESCE(rma.can_view, false) as can_view,
        COALESCE(rma.can_create, false) as can_create,
        COALESCE(rma.can_edit, false) as can_edit,
        COALESCE(rma.can_delete, false) as can_delete
       FROM public.menus m
       LEFT JOIN public.role_menu_access rma ON m.id = rma.menu_id AND rma.role_id = $1
       WHERE m.path != '#' -- Mengabaikan menu parent kategori jika hanya ingin mengatur menu aksi
       ORDER BY m.urutan ASC`,
      [roleId]
    );

    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    console.error("Get Role Access Error:", error);
    const msg = error instanceof Error ? error.message : "Gagal mengambil data akses.";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}