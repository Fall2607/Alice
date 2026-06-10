import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

// GET /api/lembur
// Mengambil daftar pengajuan lembur, mendukung filter by karyawan_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const karyawanId = searchParams.get("karyawan_id");

    let query = `
      SELECT 
        pl.id,
        pl.tanggal_pengajuan,
        pl.tanggal_lembur,
        pl.jam_mulai,
        pl.jam_selesai,
        pl.kegiatan,
        pl.tipe_lembur,
        pl.status,
        pl.karyawan_id,
        pl.assigner_id,
        pl.approved_by_id,
        k.nama_lengkap AS nama_karyawan,
        a.nama_lengkap AS nama_approver,
        asg.nama_lengkap AS nama_assigner
      FROM pengajuan_lembur pl
      LEFT JOIN karyawan k ON pl.karyawan_id = k.id
      LEFT JOIN karyawan a ON pl.approved_by_id = a.id
      LEFT JOIN karyawan asg ON pl.assigner_id = asg.id
    `;
    const params: any[] = [];

    if (karyawanId) {
      query += ` WHERE pl.karyawan_id = $1 `;
      params.push(karyawanId);
    }

    query += ` ORDER BY pl.tanggal_pengajuan DESC, pl.tanggal_lembur DESC `;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching lembur:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data lembur", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/lembur
// Mengirim pengajuan lembur baru (oleh karyawan, tipe_lembur = 'Pengajuan')
export async function POST(request: Request) {
  try {
    const { karyawan_id, tanggal_lembur, jam_mulai, jam_selesai, kegiatan } = await request.json();

    if (!karyawan_id || !tanggal_lembur || !jam_mulai || !jam_selesai || !kegiatan) {
      return NextResponse.json(
        { message: "Semua field (karyawan_id, tanggal_lembur, jam_mulai, jam_selesai, kegiatan) wajib diisi." },
        { status: 400 }
      );
    }

    const start = new Date(jam_mulai);
    const end = new Date(jam_selesai);

    if (end <= start) {
      return NextResponse.json(
        { message: "Jam selesai harus lebih besar dari jam mulai." },
        { status: 400 }
      );
    }

    // Insert pengajuan lembur
    // tipe_lembur di-set statis ke 'Pengajuan' karena ini dari Employee Self-Service
    const insertRes = await pool.query(
      `INSERT INTO pengajuan_lembur 
        (karyawan_id, tanggal_pengajuan, tanggal_lembur, jam_mulai, jam_selesai, kegiatan, tipe_lembur, status) 
       VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, 'Pengajuan', 'Pending') 
       RETURNING *`,
      [karyawan_id, tanggal_lembur, jam_mulai, jam_selesai, kegiatan]
    );

    return NextResponse.json({
      message: "Pengajuan lembur berhasil dibuat.",
      data: insertRes.rows[0],
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating lembur:", error);
    return NextResponse.json(
      { message: "Gagal mengajukan lembur", error: (error as Error).message },
      { status: 500 }
    );
  }
}
