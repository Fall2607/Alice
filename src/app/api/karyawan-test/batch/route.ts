import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

// GET /api/karyawan-test/batch - Ambil rekap batch tes karyawan
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchName = searchParams.get("batch_name");

    let query = `
      SELECT 
        ea.id,
        ea.karyawan_id,
        k.nip,
        k.nama_lengkap,
        k.email,
        k.status_kepegawaian,
        d.nama_departemen,
        k.profesi as nama_jabatan,
        ea.batch_name,
        ea.token,
        ea.access_code,
        ea.status,
        ea.scheduled_date,
        ea.valid_from,
        ea.expires_at,
        ea.created_at,
        (SELECT 1 FROM mbti_test_results m WHERE m.assessment_id = ea.id LIMIT 1) IS NOT NULL as has_mbti,
        (SELECT 1 FROM disc_test_results d WHERE d.assessment_id = ea.id LIMIT 1) IS NOT NULL as has_disc,
        (SELECT 1 FROM papi_test_results p WHERE p.assessment_id = ea.id LIMIT 1) IS NOT NULL as has_papi
      FROM public.employee_assessments ea
      JOIN public.karyawan k ON ea.karyawan_id = k.id
      LEFT JOIN public.jabatan j ON k.jabatan_id = j.id
      LEFT JOIN public.departemen d ON j.departemen_id = d.id
    `;

    const values: any[] = [];
    if (batchName) {
      query += ` WHERE ea.batch_name = $1`;
      values.push(batchName);
    }

    query += ` ORDER BY ea.created_at DESC, k.nama_lengkap ASC`;

    const result = await pool.query(query, values);

    // Hitung ringkasan batch
    const batchesMap: { [key: string]: any } = {};
    for (const row of result.rows) {
      const bName = row.batch_name;
      if (!batchesMap[bName]) {
        batchesMap[bName] = {
          batch_name: bName,
          created_at: row.created_at,
          scheduled_date: row.scheduled_date,
          total_karyawan: 0,
          total_completed: 0,
          total_ongoing: 0,
          total_invited: 0,
          karyawan_list: []
        };
      }
      batchesMap[bName].total_karyawan += 1;
      if (row.status === 'COMPLETED') batchesMap[bName].total_completed += 1;
      else if (row.status === 'ONGOING') batchesMap[bName].total_ongoing += 1;
      else batchesMap[bName].total_invited += 1;

      batchesMap[bName].karyawan_list.push(row);
    }

    const batches = Object.values(batchesMap);

    return NextResponse.json({
      success: true,
      data: result.rows,
      batches: batches
    });
  } catch (error: any) {
    console.error("GET Karyawan Test Batch Error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data batch tes karyawan.", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/karyawan-test/batch - Buat batch tes & kirim email magic link
export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const { batch_name, karyawan_ids, scheduled_date } = await request.json();

    if (!batch_name || !Array.isArray(karyawan_ids) || karyawan_ids.length === 0 || !scheduled_date) {
      return NextResponse.json(
        { message: "Nama batch, daftar karyawan, dan tanggal tes wajib diisi." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Ambil data karyawan terpilih
    const empRes = await client.query(
      `SELECT id, nip, nama_lengkap, email, status_kepegawaian 
       FROM public.karyawan 
       WHERE id = ANY($1::uuid[]) AND is_active = true`,
      [karyawan_ids]
    );

    const employees = empRes.rows;
    if (employees.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Tidak ada karyawan aktif yang ditemukan untuk ID yang dipilih." },
        { status: 400 }
      );
    }

    const validFrom = new Date(`${scheduled_date}T00:00:00`);
    const expiresAt = new Date(`${scheduled_date}T23:59:59`);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Setup Transporter SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const createdAssessments: any[] = [];
    const emailErrors: string[] = [];

    for (const emp of employees) {
      if (!emp.email) {
        emailErrors.push(`Karyawan ${emp.nama_lengkap} (NIP: ${emp.nip}) tidak memiliki email.`);
        continue;
      }

      const token = crypto.randomUUID();
      const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Insert ke employee_assessments
      const insertRes = await client.query(
        `INSERT INTO public.employee_assessments 
         (karyawan_id, batch_name, token, access_code, status, scheduled_date, valid_from, expires_at)
         VALUES ($1, $2, $3, $4, 'INVITED', $5, $6, $7)
         RETURNING id`,
        [emp.id, batch_name, token, accessCode, scheduled_date, validFrom, expiresAt]
      );

      const testUrl = `${baseUrl}/assessment/${token}`;

      // Kirim email
      try {
        await transporter.sendMail({
          from: `"People Development RSU Avisena" <${process.env.SMTP_USER}>`,
          to: emp.email,
          subject: `[INTERNAL] Undangan Tes Psikometri Karyawan: ${batch_name} - RSU Avisena`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; padding: 30px; border-radius: 16px; color: #1e293b; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 30px;">
                 <span style="font-size: 24px; font-weight: 900; color: #0173b6; letter-spacing: -0.05em;">ALICE EMPLOYEE ASSESSMENT</span>
                 <p style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 5px;">RSU Avisena Human Capital</p>
              </div>
              <p>Yth. <strong>${emp.nama_lengkap}</strong> (${emp.nip}),</p>
              <p>Dalam rangka pelaksanaan program evaluasi dan pengembangan kompetensi staf (<strong>${batch_name}</strong>) di RSU Avisena, Anda diundang untuk mengikuti **Ujian Psikometri Online (MBTI, DISC, & PAPI Kostik)**.</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                 <p style="margin: 0 0 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; font-weight: 800;">Kode Akses Otorisasi Karyawan</p>
                 <h1 style="margin: 0; font-size: 40px; letter-spacing: 0.2em; color: #0173b6; font-family: 'Courier New', Courier, monospace; font-weight: 900;">${accessCode}</h1>
                 <p style="margin: 15px 0 0 0; font-size: 10px; color: #94a3b8; font-style: italic;">* Kode rahasia khusus akun Anda dan valid pada jadwal yang ditentukan</p>
              </div>

              <div style="text-align: center; margin: 35px 0;">
                <a href="${testUrl}" style="background-color: #0173b6; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Buka Modul Tes Kepribadian</a>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; color: #64748b;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 150px;">Tanggal Pelaksanaan</td>
                  <td style="padding: 6px 0; font-weight: 800; color: #0173b6;">: ${new Date(scheduled_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Sub-Tes Dikerjakan</td>
                  <td style="padding: 6px 0;">: MBTI, DISC, PAPI Kostick</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Perangkat Rekomendasi</td>
                  <td style="padding: 6px 0;">: Smartphone / PC / Laptop dengan koneksi stabil</td>
                </tr>
              </table>

              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; font-size: 11px; color: #b45309; line-height: 1.6;">
                <strong>Catatan Penting:</strong> Mohon pengerjaan dilakukan secara jujur dan mandiri di lingkungan yang kondusif. Hasil tes akan menjadi bagian dari pertimbangan evaluasi kepegawaian Anda.
              </div>

              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Email ini dikirim otomatis oleh Sistem HRIS RSU Avisena. Mohon tidak membalas email ini.</p>
            </div>
          `,
        });
      } catch (err: any) {
        console.error(`Error sending email to ${emp.email}:`, err);
        emailErrors.push(`Gagal mengirim email ke ${emp.nama_lengkap} (${emp.email}): ${err.message}`);
      }

      createdAssessments.push({
        id: insertRes.rows[0].id,
        karyawan_id: emp.id,
        nama_lengkap: emp.nama_lengkap,
        email: emp.email,
        token,
        accessCode
      });
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: `Berhasil membuat batch tes "${batch_name}" untuk ${createdAssessments.length} karyawan!`,
      created_count: createdAssessments.length,
      warnings: emailErrors.length > 0 ? emailErrors : undefined
    });

  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Create Karyawan Test Batch Error:", error);
    return NextResponse.json(
      { message: "Gagal membuat batch tes karyawan.", error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
