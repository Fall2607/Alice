// File: src/app/api/auth/menu/route.ts

import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

/**
 * GET: Mengambil daftar menu berdasarkan role user.
 * Alur: Cek role_id -> Join ke role_menu_access -> Filter can_view = true -> Susun Hirarki
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId");

    if (!roleId) {
      return NextResponse.json(
        { message: "Role ID diperlukan." },
        { status: 400 },
      );
    }

    // 1. Ambil semua menu yang diizinkan untuk role ini (termasuk parent jika child-nya diizinkan)
    const menuResult = await pool.query(
      `SELECT 
        m.id, 
        m.parent_id, 
        m.nama_menu as label, 
        m.path as href, 
        m.icon, 
        m.urutan
       FROM public.menus m
       LEFT JOIN public.role_menu_access rma ON m.id = rma.menu_id AND rma.role_id = $1
       WHERE m.is_active = true
         AND (
             rma.can_view = true 
             OR EXISTS (
                 SELECT 1 FROM public.menus sub_m 
                 INNER JOIN public.role_menu_access sub_rma ON sub_m.id = sub_rma.menu_id
                 WHERE sub_m.parent_id = m.id 
                 AND sub_rma.role_id = $1 
                 AND sub_rma.can_view = true
                 AND sub_m.is_active = true
             )
         )
       ORDER BY m.urutan ASC`,
      [roleId],
    );

    const allMenus = menuResult.rows;

    // 2. Susun hirarki (Parent & Sub-menu)
    const menuTree = allMenus
      .filter((m) => !m.parent_id) // Ambil yang tidak punya parent (Level Utama)
      .map((parent) => {
        const subItems = allMenus
          .filter((child) => child.parent_id === parent.id)
          .sort((a, b) => a.urutan - b.urutan)
          .map((child) => ({
            label: child.label,
            href: child.href,
            icon: child.icon,
          }));

        return {
          label: parent.label,
          href: parent.href === "#" ? null : parent.href,
          icon: parent.icon,
          subItems: subItems.length > 0 ? subItems : null,
        };
      });

    return NextResponse.json(menuTree);
  } catch (error) {
    console.error("Menu API Error:", error);
    return NextResponse.json(
      { message: "Gagal memuat menu navigasi." },
      { status: 500 },
    );
  }
}
