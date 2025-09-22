// File: src/app/api/employee-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

/**
 * GET: Mengambil semua data request pegawai.
 * Data di-join dengan tabel lain untuk mendapatkan informasi yang lengkap.
 */
export async function GET() {
    try {
        // FIX: Query disesuaikan dengan struktur database yang benar
        const result = await pool.query(`
      SELECT
        er.id,
        er.request_date,
        er.quantity,
        er.type,
        er.urgency,
        er.status,
        er.mbti_results,
        -- Menggabungkan nama level dan departemen untuk mendapatkan nama posisi/jabatan
        CONCAT(lj.nama_level, ' - ', d.nama_departemen) AS position,
        k.nama_lengkap AS requester,     -- Mengambil nama requester dari tabel karyawan
        d.nama_departemen AS department  -- Mengambil nama departemen dari posisi yang diminta
      FROM employee_requests er
      LEFT JOIN jabatan j ON er.job_position_id = j.id
      LEFT JOIN departemen d ON j.departemen_id = d.id
      LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      LEFT JOIN karyawan k ON er.requester_nip = k.nip
      ORDER BY
        -- Mengurutkan berdasarkan status, "Menunggu" paling atas
        CASE er.status
          WHEN 'Menunggu Persetujuan' THEN 1
          WHEN 'Disetujui' THEN 2
          WHEN 'Ditolak' THEN 3
          ELSE 4
        END,
        er.request_date DESC;
    `);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("API Error - Gagal mengambil request pegawai:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
        return NextResponse.json({ message: "Gagal mengambil data", error: errorMessage }, { status: 500 });
    }
}

/**
 * POST: Membuat request pegawai baru.
 */
export async function POST(request: Request) {
    try {
        const {
            requester_nip,
            job_position_id,
            quantity,
            type,
            urgency,
            mbti_results,
        } = await request.json();

        // Validasi input
        if (!requester_nip || !job_position_id || !quantity || !type || !urgency) {
            return NextResponse.json({ message: "Data dasar (requester, posisi, jumlah, tipe, urgensi) wajib diisi." }, { status: 400 });
        }

        const result = await pool.query(
            `INSERT INTO employee_requests (
        requester_nip, job_position_id, quantity, type, urgency, mbti_results
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [requester_nip, job_position_id, quantity, type, urgency, mbti_results]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error("API Error - Gagal membuat request pegawai:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
        // Cek jika error disebabkan oleh foreign key yang tidak valid
        if (error instanceof Error && 'code' in error && error.code === '23503') {
            return NextResponse.json({ message: "Gagal: NIP Requester atau ID Posisi Jabatan tidak valid.", error: errorMessage }, { status: 400 });
        }
        return NextResponse.json({ message: "Gagal membuat request baru", error: errorMessage }, { status: 500 });
    }
}

