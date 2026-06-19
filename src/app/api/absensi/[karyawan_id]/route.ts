import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ karyawan_id: string }> }
) {
  try {
    const { karyawan_id } = await params;

    const result = await pool.query(
      `SELECT 
         id, 
         tanggal, 
         jam_masuk, 
         jam_keluar, 
         menit_terlambat 
       FROM absensi 
       WHERE karyawan_id = $1 
       ORDER BY tanggal DESC
       LIMIT 30`,
      [karyawan_id]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Error fetching absensi:", err);
    return NextResponse.json(
      { message: "Error fetching absensi", error: (err as Error).message },
      { status: 500 }
    );
  }
}
