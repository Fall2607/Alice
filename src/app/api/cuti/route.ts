import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

// GET /api/cuti
// Mengambil daftar pengajuan cuti, mendukung filter by karyawan_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const karyawanId = searchParams.get("karyawan_id");

    let query = `
      SELECT 
        pc.id,
        pc.tanggal_pengajuan,
        pc.tanggal_mulai,
        pc.tanggal_selesai,
        pc.alasan,
        pc.status,
        pc.karyawan_id,
        pc.approved_by_id,
        k.nama_lengkap AS nama_karyawan,
        k.sisa_cuti,
        a.nama_lengkap AS nama_approver
      FROM pengajuan_cuti pc
      LEFT JOIN karyawan k ON pc.karyawan_id = k.id
      LEFT JOIN karyawan a ON pc.approved_by_id = a.id
    `;
    const params: any[] = [];

    if (karyawanId) {
      query += ` WHERE pc.karyawan_id = $1 `;
      params.push(karyawanId);
    }

    query += ` ORDER BY pc.tanggal_pengajuan DESC, pc.tanggal_mulai DESC `;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching cuti:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data cuti", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/cuti
// Mengirim pengajuan cuti baru
export async function POST(request: Request) {
  try {
    const { karyawan_id, tanggal_mulai, tanggal_selesai, alasan } = await request.json();

    if (!karyawan_id || !tanggal_mulai || !tanggal_selesai || !alasan) {
      return NextResponse.json(
        { message: "Semua field (karyawan_id, tanggal_mulai, tanggal_selesai, alasan) wajib diisi." },
        { status: 400 }
      );
    }

    const tglMulai = new Date(tanggal_mulai);
    const tglSelesai = new Date(tanggal_selesai);

    // Validasi Tanggal
    if (tglMulai > tglSelesai) {
      return NextResponse.json(
        { message: "Tanggal mulai tidak boleh lebih besar dari tanggal selesai." },
        { status: 400 }
      );
    }

    // Hitung durasi (asumsi sederhana selisih hari kalender)
    const durasi = Math.ceil((tglSelesai.getTime() - tglMulai.getTime()) / (1000 * 3600 * 24)) + 1;

    // Cek Sisa Cuti
    const karyawanRes = await pool.query(`SELECT sisa_cuti FROM karyawan WHERE id = $1`, [karyawan_id]);
    if (karyawanRes.rows.length === 0) {
      return NextResponse.json({ message: "Karyawan tidak ditemukan." }, { status: 404 });
    }

    const sisaCuti = karyawanRes.rows[0].sisa_cuti;

    if (durasi > sisaCuti) {
      return NextResponse.json(
        { message: `Durasi cuti (${durasi} hari) melebihi sisa kuota cuti Anda (${sisaCuti} hari).` },
        { status: 400 }
      );
    }

    // Insert pengajuan (Status DEFAULT 'PENDING', tanggal_pengajuan otomatis dari CURRENT_DATE)
    const insertRes = await pool.query(
      `INSERT INTO pengajuan_cuti (karyawan_id, tanggal_pengajuan, tanggal_mulai, tanggal_selesai, alasan) 
       VALUES ($1, CURRENT_DATE, $2, $3, $4) 
       RETURNING *`,
      [karyawan_id, tanggal_mulai, tanggal_selesai, alasan]
    );

    return NextResponse.json({
      message: "Pengajuan cuti berhasil dibuat.",
      data: insertRes.rows[0],
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating cuti:", error);
    return NextResponse.json(
      { message: "Gagal mengajukan cuti", error: (error as Error).message },
      { status: 500 }
    );
  }
}
