import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { sendCutiMagicLink } from "@/app/lib/email";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { karyawan_id, jenis_cuti, tanggal_mulai, tanggal_selesai, tanggal_kembali, jumlah_hari, keterangan } = data;

    if (jumlah_hari > 4) {
      return NextResponse.json({ message: "Pengajuan cuti tidak dapat melebihi 4 hari." }, { status: 400 });
    }

    // Ambil atasan_id (kita gunakan kolom atasan_id jika ada, jika tidak ada, top level)
    const karyRes = await pool.query(`SELECT atasan_id, sisa_cuti, nama_lengkap FROM karyawan WHERE id = $1`, [karyawan_id]);
    if (karyRes.rows.length === 0) {
      return NextResponse.json({ message: "Karyawan tidak ditemukan" }, { status: 404 });
    }

    const { atasan_id, sisa_cuti, nama_lengkap } = karyRes.rows[0];

    // Cek sisa cuti jika jenis cuti = Tahunan
    if (jenis_cuti === 'Tahunan' && sisa_cuti < jumlah_hari) {
      return NextResponse.json({ message: `Sisa cuti tidak mencukupi. Sisa cuti Anda: ${sisa_cuti} hari.` }, { status: 400 });
    }

    // Status sesuai enum pengajuan_cuti
    const statusAwal = atasan_id ? 'Menunggu Atasan' : 'Menunggu HC';
    const magicToken = crypto.randomBytes(32).toString('hex');

    const insertQuery = `
      INSERT INTO pengajuan_cuti (karyawan_id, jenis_cuti, tanggal_mulai, tanggal_selesai, tanggal_kembali, jumlah_hari, alasan, status, magic_token, tanggal_pengajuan)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
      RETURNING *;
    `;

    // Note: Kita menggabungkan alasan ke kolom 'alasan'.
    const result = await pool.query(insertQuery, [
      karyawan_id, jenis_cuti, tanggal_mulai, tanggal_selesai, tanggal_kembali, jumlah_hari, keterangan, statusAwal, magicToken
    ]);

    // Kirim Email Magic Link
    try {
        if (statusAwal === 'Menunggu Atasan' && atasan_id) {
            const atasanRes = await pool.query(`SELECT email, nama_lengkap FROM karyawan WHERE id = $1`, [atasan_id]);
            if (atasanRes.rows.length > 0) {
                const atasanEmail = atasanRes.rows[0].email;
                const atasanName = atasanRes.rows[0].nama_lengkap;
                if (atasanEmail) {
                    await sendCutiMagicLink({
                        toEmail: atasanEmail,
                        approverName: atasanName,
                        karyawanName: nama_lengkap,
                        tanggalMulai: tanggal_mulai,
                        tanggalSelesai: tanggal_selesai,
                        tanggalKembali: tanggal_kembali,
                        jumlahHari: jumlah_hari,
                        alasan: keterangan,
                        token: magicToken
                    });
                }
            }
        } else if (statusAwal === 'Menunggu HC') {
            const hcRes = await pool.query(`
              SELECT u.email, COALESCE(k.nama_lengkap, u.email) as nama_lengkap
              FROM users u
              LEFT JOIN roles r ON u.role_id = r.id
              LEFT JOIN karyawan k ON k.user_id = u.id OR k.email = u.email
              WHERE u.email = 'friscachoiriatul@gmail.com' OR k.nip = '12001059'
            `);
            for (const hc of hcRes.rows) {
                if (hc.email) {
                    try {
                        await sendCutiMagicLink({
                            toEmail: hc.email,
                            approverName: hc.nama_lengkap,
                            karyawanName: nama_lengkap,
                            tanggalMulai: tanggal_mulai,
                            tanggalSelesai: tanggal_selesai,
                            tanggalKembali: tanggal_kembali,
                            jumlahHari: jumlah_hari,
                            alasan: keterangan,
                            token: magicToken
                        });
                    } catch (emailErr) {
                        console.error("Gagal mengirim magic link HC saat pengajuan:", hc.email, emailErr);
                    }
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
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Karena pengajuan_cuti mungkin tidak menyimpan atasan_id (sebagai foreign key pemiliknya), kita bisa filter via JOIN ke karyawan
    let query = `
      SELECT c.*, k.nama_lengkap, lj.nama_level AS nama_jabatan 
      FROM pengajuan_cuti c
      JOIN karyawan k ON c.karyawan_id = k.id
      LEFT JOIN jabatan j ON k.jabatan_id = j.id
      LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
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
      // Mendukung 2-tier: melihat bawahan langsung, dan bawahannya bawahan (untuk Menunggu SPV)
      query += ` AND (k.atasan_id = $${paramCount} OR k.atasan_id IN (SELECT id FROM karyawan WHERE atasan_id = $${paramCount}))`;
      params.push(atasan_id);
      paramCount++;
    }

    if (status) {
      if (status === 'Menunggu') {
        // Admin melihat SEMUA pending cuti (Menunggu Atasan / Menunggu SPV / Menunggu HC)
        query += ` AND c.status::text ILIKE $${paramCount}`;
        params.push('%Menunggu%');
      } else if (status.includes(',')) {
        const statuses = status.split(',').map(s => s.trim());
        const placeholders = statuses.map((_, i) => `$${paramCount + i}`).join(', ');
        query += ` AND c.status IN (${placeholders})`;
        params.push(...statuses);
        paramCount += statuses.length - 1;
      } else {
        query += ` AND c.status = $${paramCount}`;
        params.push(status);
      }
      paramCount++;
    }

    if (year && month) {
      query += ` AND EXTRACT(YEAR FROM c.tanggal_mulai) = $${paramCount} AND EXTRACT(MONTH FROM c.tanggal_mulai) = $${paramCount + 1}`;
      params.push(year, month);
      paramCount += 2;
    }

    query += ` ORDER BY c.tanggal_pengajuan DESC, c.id DESC`;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);

  } catch (err: any) {
    console.error("Error fetching cuti:", err);
    return NextResponse.json({ message: "Terjadi kesalahan server", error: err.message }, { status: 500 });
  }
}
