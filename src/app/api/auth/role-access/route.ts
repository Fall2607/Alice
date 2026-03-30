/**
 * Path: src/app/api/auth/role-access/route.ts
 * Deskripsi: Endpoint untuk menyimpan/sinkronisasi matriks izin per role.
 */

import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { role_id, permissions } = body;

    // Validasi input: Pastikan role_id ada dan permissions adalah array
    if (!role_id || !Array.isArray(permissions)) {
      return NextResponse.json(
        { message: "Format data tidak valid atau data kosong." },
        { status: 400 },
      );
    }

    // Gunakan transaksi database untuk memastikan seluruh data tersimpan dengan benar (atomicity)
    await client.query("BEGIN");

    /**
     * Mekanisme UPSERT (INSERT ... ON CONFLICT).
     * Jika kombinasi role_id dan menu_id sudah ada, maka update kolom izinnya.
     * Jika belum ada, maka buat baris baru di tabel role_menu_access.
     */
    for (const p of permissions) {
      await client.query(
        `INSERT INTO public.role_menu_access 
         (role_id, menu_id, can_view, can_create, can_edit, can_delete)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (role_id, menu_id) 
         DO UPDATE SET 
            can_view = EXCLUDED.can_view,
            can_create = EXCLUDED.can_create,
            can_edit = EXCLUDED.can_edit,
            can_delete = EXCLUDED.can_delete`,
        [
          role_id,
          p.menu_id,
          p.can_view,
          p.can_create,
          p.can_edit,
          p.can_delete,
        ],
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({
      message: "Konfigurasi hak akses berhasil diperbarui.",
    });
  } catch (error: unknown) {
    // Batalkan semua perubahan jika terjadi kesalahan di tengah jalan
    await client.query("ROLLBACK");
    console.error("Save Role Access Error:", error);
    const msg =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan internal server.";
    return NextResponse.json({ message: msg }, { status: 500 });
  } finally {
    // Selalu lepaskan koneksi client kembali ke pool agar tidak terjadi memory leak
    client.release();
  }
}
