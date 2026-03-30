import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> | { roleId: string } },
) {
  try {
    const resolvedParams = await params;
    const { roleId } = resolvedParams;

    if (!roleId) {
      return NextResponse.json(
        { message: "Role ID tidak ditemukan." },
        { status: 400 },
      );
    }

    // Query dibersihkan dari prefix 'public.' jika menimbulkan masalah
    // dan dipastikan menggunakan alias 'as menu_id'
    const query = `
      SELECT 
        m.id as menu_id,
        m.nama_menu,
        m.path,
        COALESCE(rma.can_view, false) as can_view,
        COALESCE(rma.can_create, false) as can_create,
        COALESCE(rma.can_edit, false) as can_edit,
        COALESCE(rma.can_delete, false) as can_delete
      FROM menus m
      LEFT JOIN role_menu_access rma ON m.id = rma.menu_id AND rma.role_id = $1
      WHERE m.is_active = true
      ORDER BY m.urutan ASC
    `;

    const result = await pool.query(query, [roleId]);

    return NextResponse.json(result.rows || []);
  } catch (error: any) {
    console.error("SQL ERROR:", error.message);
    return NextResponse.json(
      { message: "Gagal mengambil matriks hak akses.", error: error.message },
      { status: 500 },
    );
  }
}
