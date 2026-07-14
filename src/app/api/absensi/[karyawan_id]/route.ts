import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ karyawan_id: string }> }
) {
  try {
    const { karyawan_id } = await params;

    const url = new URL(request.url);
    const monthStr = url.searchParams.get("month");
    const yearStr = url.searchParams.get("year");

    let query = `
       SELECT 
         a.id, 
         a.tanggal, 
         a.jam_masuk, 
         a.jam_keluar, 
         a.menit_terlambat,
         s.nama_shift
       FROM absensi a
       LEFT JOIN shift s ON a.shift_id = s.id
       WHERE a.karyawan_id = $1
    `;
    const params: any[] = [karyawan_id];

    if (monthStr && yearStr) {
       query += ` AND EXTRACT(MONTH FROM a.tanggal) = $2 AND EXTRACT(YEAR FROM a.tanggal) = $3`;
       params.push(parseInt(monthStr), parseInt(yearStr));
    }

    query += ` ORDER BY a.tanggal DESC`;

    const result = await pool.query(query, params);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Error fetching absensi:", err);
    return NextResponse.json(
      { message: "Error fetching absensi", error: (err as Error).message },
      { status: 500 }
    );
  }
}
