import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import jwt from "jsonwebtoken";
import { sendCutiMagicLink } from "@/app/lib/email";

// GET /api/cuti
// Mengambil daftar pengajuan cuti, mendukung filter by karyawan_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const karyawanId = searchParams.get("karyawan_id");
    const waitingForId = searchParams.get("waiting_for_id");

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
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (karyawanId) {
      query += ` AND pc.karyawan_id = $${paramIndex} `;
      params.push(karyawanId);
      paramIndex++;
    }

    if (waitingForId) {
      query += ` 
        AND (
          (pc.status = 'Menunggu Atasan' AND k.atasan_id = $${paramIndex})
          OR
          (pc.status = 'Menunggu SPV' AND k.atasan_id IN (SELECT id FROM karyawan WHERE atasan_id = $${paramIndex}))
        )
      `;
      params.push(waitingForId);
      paramIndex++;
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

    // Cek Sisa Cuti dan Data Karyawan serta Atasan
    const karyawanRes = await pool.query(`
      SELECT k.nama_lengkap, k.sisa_cuti, k.atasan_id, 
             a.nama_lengkap as atasan_nama, a.email as atasan_email
      FROM karyawan k
      LEFT JOIN karyawan a ON k.atasan_id = a.id
      WHERE k.id = $1
    `, [karyawan_id]);
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

    // Insert pengajuan dengan status awal 'Menunggu Atasan'
    const insertRes = await pool.query(
      `INSERT INTO pengajuan_cuti (karyawan_id, tanggal_pengajuan, tanggal_mulai, tanggal_selesai, alasan, status) 
       VALUES ($1, CURRENT_DATE, $2, $3, $4, 'Menunggu Atasan') 
       RETURNING *`,
      [karyawan_id, tanggal_mulai, tanggal_selesai, alasan]
    );

    const cutiRecord = insertRes.rows[0];
    const kData = karyawanRes.rows[0];

    // Kirim Email ke Atasan jika Atasan memiliki email
    if (kData.atasan_id && kData.atasan_email) {
      try {
        const tokenPayload = {
          cuti_id: cutiRecord.id,
          approver_id: kData.atasan_id,
          role: 'ATASAN'
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        
        await sendCutiMagicLink(
          kData.atasan_email,
          kData.atasan_nama,
          kData.nama_lengkap,
          tglMulai.toLocaleDateString('id-ID'),
          tglSelesai.toLocaleDateString('id-ID'),
          alasan,
          token
        );
      } catch (err) {
        console.error("Gagal mengirim email magic link:", err);
        // Kita tidak block response jika email gagal, biarkan pengajuan tetap masuk
      }
    }

    return NextResponse.json({
      message: "Pengajuan cuti berhasil dibuat.",
      data: cutiRecord,
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating cuti:", error);
    return NextResponse.json(
      { message: "Gagal mengajukan cuti", error: (error as Error).message },
      { status: 500 }
    );
  }
}
