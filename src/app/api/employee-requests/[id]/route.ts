// File: src/app/api/employee-requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

/**
 * GET: Mengambil satu data request pegawai berdasarkan ID.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const result = await pool.query(`
      SELECT
        er.id,
        er.request_date,
        er.quantity,
        er.type,
        er.urgency,
        er.status,
        er.mbti_results,
        er.job_position_id,
        CONCAT(lj.nama_level, ' - ', d.nama_departemen) AS position,
        k.nama_lengkap AS requester,
        d.nama_departemen AS department
      FROM employee_requests er
      LEFT JOIN jabatan j ON er.job_position_id = j.id
      LEFT JOIN departemen d ON j.departemen_id = d.id
      LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
      LEFT JOIN karyawan k ON er.requester_nip = k.nip
      WHERE er.id = $1;
    `, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ message: `Request dengan ID ${id} tidak ditemukan.` }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`API Error - Gagal mengambil request pegawai ID ${params.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
        return NextResponse.json({ message: "Gagal mengambil data", error: errorMessage }, { status: 500 });
    }
}

/**
 * PUT: Memperbarui keseluruhan data request pegawai (untuk fitur edit).
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const {
            job_position_id,
            quantity,
            type,
            urgency,
            mbti_results,
        } = await request.json();

        if (!job_position_id || !quantity || !type || !urgency) {
            return NextResponse.json({ message: "Semua field wajib diisi untuk pembaruan." }, { status: 400 });
        }

        const result = await pool.query(
            `UPDATE employee_requests
       SET 
         job_position_id = $1,
         quantity = $2,
         type = $3,
         urgency = $4,
         mbti_results = $5,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
            [job_position_id, quantity, type, urgency, mbti_results, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ message: `Request dengan ID ${id} tidak ditemukan.` }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`API Error - Gagal memperbarui request pegawai ID ${params.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
        return NextResponse.json({ message: "Gagal memperbarui request", error: errorMessage }, { status: 500 });
    }
}

/**
 * PATCH: Memperbarui sebagian data, seperti status (Disetujui/Ditolak).
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        const fieldsToUpdate = Object.keys(body);
        if (fieldsToUpdate.length === 0) {
            return NextResponse.json({ message: "Tidak ada data yang dikirim untuk diperbarui." }, { status: 400 });
        }

        // Membuat query SET secara dinamis
        const setQueryParts = fieldsToUpdate.map((field, index) => `${field} = $${index + 1}`);
        const values = fieldsToUpdate.map(field => body[field]);
        values.push(id); // Menambahkan ID untuk klausa WHERE

        const result = await pool.query(
            `UPDATE employee_requests SET ${setQueryParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ message: `Request dengan ID ${id} tidak ditemukan.` }, { status: 404 });
        }

        // Jika status diubah menjadi 'Disetujui', di sini bisa ditambahkan logika untuk membuat lowongan.
        if (body.status === 'Disetujui') {
            console.log(`(LOG) Request ID ${id} disetujui. Logika pembuatan draf lowongan bisa ditambahkan di sini.`);
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(`API Error - Gagal memperbarui status request ID ${params.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
        return NextResponse.json({ message: "Gagal memperbarui status request", error: errorMessage }, { status: 500 });
    }
}

/**
 * DELETE: Menghapus data request pegawai.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const result = await pool.query("DELETE FROM employee_requests WHERE id = $1 RETURNING id", [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ message: `Request dengan ID ${id} tidak ditemukan.` }, { status: 404 });
        }

        return NextResponse.json({ message: `Request dengan ID ${id} berhasil dihapus.` });
    } catch (error) {
        console.error(`API Error - Gagal menghapus request pegawai ID ${params.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
        return NextResponse.json({ message: "Gagal menghapus request", error: errorMessage }, { status: 500 });
    }
}

