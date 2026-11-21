import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const karyawanId = searchParams.get('karyawan_id');
    const bulan = searchParams.get('bulan'); // format YYYY-MM

    if (!karyawanId || !bulan) {
      return NextResponse.json({ message: "karyawan_id dan bulan diperlukan" }, { status: 400 });
    }

    // Ambil jadwal shift seluruh rekan di bawah atasan yang sama pada bulan tersebut,
    // mengecualikan user yang sedang cuti pada tanggal terkait (baik status Disetujui maupun Menunggu)
    const result = await pool.query(`
      SELECT 
        ks.id as karyawan_shift_id,
        ks.tanggal,
        k.id as karyawan_id,
        k.nama_lengkap,
        s.id as shift_id,
        s.nama_shift
      FROM karyawan_shift ks
      JOIN karyawan k ON k.id = ks.karyawan_id
      LEFT JOIN shift s ON s.id = ks.shift_id
      LEFT JOIN jabatan j ON k.jabatan_id = j.id
      WHERE (
        (
          (SELECT atasan_id FROM karyawan WHERE id = $1) IS NOT NULL
          AND k.atasan_id = (SELECT atasan_id FROM karyawan WHERE id = $1)
        )
        OR
        (
          (SELECT atasan_id FROM karyawan WHERE id = $1) IS NULL
          AND (
            j.departemen_id = (
              SELECT j2.departemen_id 
              FROM karyawan k2 
              LEFT JOIN jabatan j2 ON k2.jabatan_id = j2.id 
              WHERE k2.id = $1
            )
            OR
            (
              SELECT j2.departemen_id 
              FROM karyawan k2 
              LEFT JOIN jabatan j2 ON k2.jabatan_id = j2.id 
              WHERE k2.id = $1
            ) IS NULL
          )
        )
      )
        AND ks.tanggal LIKE $2 || '%'
        AND (s.nama_shift IS NULL OR s.nama_shift NOT ILIKE '%cuti%')
        AND NOT EXISTS (
          SELECT 1 FROM pengajuan_cuti pc
          WHERE pc.karyawan_id = ks.karyawan_id
            AND pc.status IN ('Disetujui', 'Menunggu Atasan', 'Menunggu SPV', 'Menunggu HC')
            AND (
              (ks.tanggal::date >= pc.tanggal_mulai::date AND ks.tanggal::date <= pc.tanggal_selesai::date)
              OR pc.alasan LIKE '%' || ks.tanggal || '%'
            )
        )
      ORDER BY ks.tanggal ASC, k.nama_lengkap ASC
    `, [karyawanId, bulan]);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Error fetching jadwal unit:", err);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
