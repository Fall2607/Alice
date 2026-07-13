import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { sendCutiMagicLink } from "@/app/lib/email";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { karyawan_id, jenis_cuti, tanggal_mulai, tanggal_selesai, tanggal_kembali, jumlah_hari, keterangan } = data;

    // Ambil atasan_id dari karyawan
    const karyRes = await pool.query(`SELECT atasan_id, sisa_cuti, nama_lengkap FROM karyawan WHERE id = $1`, [karyawan_id]);
    if (karyRes.rows.length === 0) {
      return NextResponse.json({ message: "Karyawan tidak ditemukan" }, { status: 404 });
    }

    const { atasan_id, sisa_cuti, nama_lengkap } = karyRes.rows[0];

    // Cek sisa cuti jika jenis cuti = Tahunan
    if (jenis_cuti === 'Tahunan' && sisa_cuti < jumlah_hari) {
      return NextResponse.json({ message: `Sisa cuti tidak mencukupi. Sisa cuti Anda: ${sisa_cuti} hari.` }, { status: 400 });
    }

    // Tentukan status awal
    // Jika tidak punya atasan_id (Top Level), langsung lompat ke PENDING_HC
    const statusAwal = atasan_id ? 'PENDING_ATASAN' : 'PENDING_HC';

    const magicToken = crypto.randomBytes(32).toString('hex');

    const insertQuery = `
      INSERT INTO cuti (karyawan_id, jenis_cuti, tanggal_mulai, tanggal_selesai, tanggal_kembali, jumlah_hari, keterangan, status, atasan_id, magic_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      karyawan_id, jenis_cuti, tanggal_mulai, tanggal_selesai, tanggal_kembali, jumlah_hari, keterangan, statusAwal, atasan_id, magicToken
    ]);

    // Kirim Email Magic Link
    try {
        if (statusAwal === 'PENDING_ATASAN' && atasan_id) {
            const atasanRes = await pool.query(`SELECT email, nama_lengkap FROM karyawan WHERE id = $1`, [atasan_id]);
            if (atasanRes.rows.length > 0) {
                const atasanEmail = atasanRes.rows[0].email;
                const atasanName = atasanRes.rows[0].nama_lengkap;
                if (atasanEmail) {
                    await sendCutiMagicLink(atasanEmail, atasanName, nama_lengkap, tanggal_mulai, tanggal_selesai, keterangan, magicToken);
                }
            }
        } else if (statusAwal === 'PENDING_HC') {
            const hcRes = await pool.query(`
              SELECT k.email, k.nama_lengkap 
              FROM karyawan k
              JOIN users u ON k.user_id = u.id
              JOIN roles r ON u.role_id = r.id
              WHERE r.nama_role ILIKE '%hrd%' OR r.nama_role ILIKE '%hc%' OR r.nama_role ILIKE '%human capital%'
            `);
            for (const hc of hcRes.rows) {
                if (hc.email) {
                    await sendCutiMagicLink(hc.email, hc.nama_lengkap, nama_lengkap, tanggal_mulai, tanggal_selesai, keterangan, magicToken);
                }
            }
        }
    } catch (e) {
        console.error("Gagal mengirim email magic link:", e);
    }

    return NextResponse.json({
      message: "Pengajuan cuti berhasil dikirim",
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error("Error submitting cuti:", err);
    return NextResponse.json({ message: "Terjadi kesalahan server", error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const karyawan_id = searchParams.get('karyawan_id');
    const atasan_id = searchParams.get('atasan_id');
    const status = searchParams.get('status');

    let query = `
      SELECT c.*, k.nama_lengkap, j.nama_jabatan 
      FROM cuti c
      JOIN karyawan k ON c.karyawan_id = k.id
      LEFT JOIN jabatan j ON k.jabatan_id = j.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (karyawan_id) {
      query += ` AND c.karyawan_id = $${paramCount}`;
      params.push(karyawan_id);
      paramCount++;
    }

    if (atasan_id) {
      query += ` AND c.atasan_id = $${paramCount}`;
      params.push(atasan_id);
      paramCount++;
    }

    if (status) {
      query += ` AND c.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);

  } catch (err: any) {
    console.error("Error fetching cuti:", err);
    return NextResponse.json({ message: "Terjadi kesalahan server", error: err.message }, { status: 500 });
  }
}
