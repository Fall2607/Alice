import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper kirim email undangan
async function sendInvitationEmail({
  emp,
  batch_name,
  scheduled_date,
  accessCode,
  token,
  baseUrl,
  transporter,
}: {
  emp: { nama_lengkap: string; nip: string; email: string };
  batch_name: string;
  scheduled_date: string;
  accessCode: string;
  token: string;
  baseUrl: string;
  transporter: nodemailer.Transporter;
}) {
  const testUrl = `${baseUrl}/assessment/${token}`;

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
}

function getMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// GET /api/karyawan-test/batch - Ambil rekap batch tes karyawan
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batch_id");
    const batchName = searchParams.get("batch_name");

    let query = `
      SELECT 
        b.id as batch_id,
        b.batch_name,
        b.description,
        b.scheduled_date as batch_scheduled_date,
        b.valid_from as batch_valid_from,
        b.expires_at as batch_expires_at,
        b.created_at as batch_created_at,
        b.updated_at as batch_updated_at,
        ea.id as assessment_id,
        ea.karyawan_id,
        k.nip,
        k.nama_lengkap,
        k.email,
        k.status_kepegawaian,
        d.nama_departemen,
        k.profesi as nama_jabatan,
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
      FROM public.employee_assessment_batches b
      LEFT JOIN public.employee_assessments ea ON b.id = ea.batch_id
      LEFT JOIN public.karyawan k ON ea.karyawan_id = k.id
      LEFT JOIN public.jabatan j ON k.jabatan_id = j.id
      LEFT JOIN public.departemen d ON j.departemen_id = d.id
    `;

    const values: any[] = [];
    const whereClauses: string[] = [];

    if (batchId) {
      values.push(batchId);
      whereClauses.push(`b.id = $${values.length}`);
    }

    if (batchName) {
      values.push(batchName);
      whereClauses.push(`b.batch_name = $${values.length}`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
    }

    query += ` ORDER BY b.created_at DESC, k.nama_lengkap ASC`;

    const result = await pool.query(query, values);

    // Hitung ringkasan batch
    const batchesMap: { [key: string]: any } = {};
    const allAssessments: any[] = [];

    for (const row of result.rows) {
      const bId = row.batch_id;
      if (!batchesMap[bId]) {
        batchesMap[bId] = {
          id: bId,
          batch_name: row.batch_name,
          description: row.description,
          created_at: row.batch_created_at,
          updated_at: row.batch_updated_at,
          scheduled_date: row.batch_scheduled_date,
          valid_from: row.batch_valid_from,
          expires_at: row.batch_expires_at,
          total_karyawan: 0,
          total_completed: 0,
          total_ongoing: 0,
          total_invited: 0,
          karyawan_list: []
        };
      }

      if (row.assessment_id) {
        const assessmentItem = {
          id: row.assessment_id,
          batch_id: row.batch_id,
          batch_name: row.batch_name,
          karyawan_id: row.karyawan_id,
          nip: row.nip,
          nama_lengkap: row.nama_lengkap,
          email: row.email,
          status_kepegawaian: row.status_kepegawaian,
          nama_departemen: row.nama_departemen,
          nama_jabatan: row.nama_jabatan,
          token: row.token,
          access_code: row.access_code,
          status: row.status,
          scheduled_date: row.scheduled_date || row.batch_scheduled_date,
          valid_from: row.valid_from || row.batch_valid_from,
          expires_at: row.expires_at || row.batch_expires_at,
          created_at: row.created_at || row.batch_created_at,
          has_mbti: row.has_mbti,
          has_disc: row.has_disc,
          has_papi: row.has_papi
        };

        batchesMap[bId].total_karyawan += 1;
        if (row.status === 'COMPLETED') batchesMap[bId].total_completed += 1;
        else if (row.status === 'ONGOING') batchesMap[bId].total_ongoing += 1;
        else batchesMap[bId].total_invited += 1;

        batchesMap[bId].karyawan_list.push(assessmentItem);
        allAssessments.push(assessmentItem);
      }
    }

    const batches = Object.values(batchesMap);

    return NextResponse.json({
      success: true,
      data: allAssessments,
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
    const { batch_name, karyawan_ids, scheduled_date, description } = await request.json();

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

    // 1. Insert ke tabel employee_assessment_batches
    const batchRes = await client.query(
      `INSERT INTO public.employee_assessment_batches 
       (batch_name, description, scheduled_date, valid_from, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [batch_name.trim(), description || null, scheduled_date, validFrom, expiresAt]
    );

    const batchId = batchRes.rows[0].id;

    // Setup Transporter SMTP
    const transporter = getMailTransporter();

    const createdAssessments: any[] = [];
    const emailErrors: string[] = [];

    for (const emp of employees) {
      if (!emp.email) {
        emailErrors.push(`Karyawan ${emp.nama_lengkap} (NIP: ${emp.nip}) tidak memiliki email.`);
        continue;
      }

      const token = crypto.randomUUID();
      const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Insert ke employee_assessments dengan batch_id
      const insertRes = await client.query(
        `INSERT INTO public.employee_assessments 
         (batch_id, karyawan_id, batch_name, token, access_code, status, scheduled_date, valid_from, expires_at)
         VALUES ($1, $2, $3, $4, $5, 'INVITED', $6, $7, $8)
         RETURNING id`,
        [batchId, emp.id, batch_name.trim(), token, accessCode, scheduled_date, validFrom, expiresAt]
      );

      // Kirim email
      try {
        await sendInvitationEmail({
          emp,
          batch_name: batch_name.trim(),
          scheduled_date,
          accessCode,
          token,
          baseUrl,
          transporter,
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
      batch_id: batchId,
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

// PUT /api/karyawan-test/batch - Update batch (nama, jadwal, tambah / hapus karyawan)
export async function PUT(request: Request) {
  const client = await pool.connect();

  try {
    const {
      batch_id,
      batch_name,
      scheduled_date,
      description,
      add_karyawan_ids,
      remove_karyawan_ids,
    } = await request.json();

    if (!batch_id) {
      return NextResponse.json(
        { message: "ID Batch (batch_id) wajib disertakan." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // 1. Cek keberadaan batch
    const checkBatch = await client.query(
      `SELECT id, batch_name, scheduled_date, valid_from, expires_at 
       FROM public.employee_assessment_batches 
       WHERE id = $1`,
      [batch_id]
    );

    if (checkBatch.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Batch tidak ditemukan." },
        { status: 404 }
      );
    }

    const currentBatch = checkBatch.rows[0];
    const newBatchName = batch_name ? batch_name.trim() : currentBatch.batch_name;

    let dateStr = scheduled_date;
    if (!dateStr && currentBatch.scheduled_date) {
      if (currentBatch.scheduled_date instanceof Date) {
        dateStr = currentBatch.scheduled_date.toISOString().split("T")[0];
      } else {
        dateStr = String(currentBatch.scheduled_date).split("T")[0];
      }
    } else if (dateStr && typeof dateStr === "string" && dateStr.includes("T")) {
      dateStr = dateStr.split("T")[0];
    }

    const newScheduledDate = dateStr;
    const validFrom = new Date(`${dateStr}T00:00:00`);
    const expiresAt = new Date(`${dateStr}T23:59:59`);

    // 2. Update employee_assessment_batches
    await client.query(
      `UPDATE public.employee_assessment_batches 
       SET batch_name = $1, scheduled_date = $2, valid_from = $3, expires_at = $4, description = $5, updated_at = NOW()
       WHERE id = $6`,
      [newBatchName, newScheduledDate, validFrom, expiresAt, description !== undefined ? description : null, batch_id]
    );

    // 3. Update data pada employee_assessments yang sudah ada di batch ini
    await client.query(
      `UPDATE public.employee_assessments 
       SET batch_name = $1, scheduled_date = $2, valid_from = $3, expires_at = $4, updated_at = NOW()
       WHERE batch_id = $5`,
      [newBatchName, newScheduledDate, validFrom, expiresAt, batch_id]
    );

    // 4. Hapus karyawan dari batch jika diminta
    if (Array.isArray(remove_karyawan_ids) && remove_karyawan_ids.length > 0) {
      // Ambil assessment_id yang akan dihapus
      const toRemoveRes = await client.query(
        `SELECT id FROM public.employee_assessments WHERE batch_id = $1 AND karyawan_id = ANY($2::uuid[])`,
        [batch_id, remove_karyawan_ids]
      );
      const assessmentIdsToRemove = toRemoveRes.rows.map((r) => r.id);

      if (assessmentIdsToRemove.length > 0) {
        // Hapus test results terkait
        await client.query(`DELETE FROM public.mbti_test_results WHERE assessment_id = ANY($1::uuid[])`, [assessmentIdsToRemove]);
        await client.query(`DELETE FROM public.disc_test_results WHERE assessment_id = ANY($1::uuid[])`, [assessmentIdsToRemove]);
        await client.query(`DELETE FROM public.papi_test_results WHERE assessment_id = ANY($1::uuid[])`, [assessmentIdsToRemove]);

        // Hapus employee_assessments
        await client.query(`DELETE FROM public.employee_assessments WHERE id = ANY($1::uuid[])`, [assessmentIdsToRemove]);
      }
    }

    // 5. Tambah karyawan baru ke batch jika diminta
    const emailErrors: string[] = [];
    let addedCount = 0;

    if (Array.isArray(add_karyawan_ids) && add_karyawan_ids.length > 0) {
      // Filter karyawan yang BELUM ada di batch ini
      const existingInBatchRes = await client.query(
        `SELECT karyawan_id FROM public.employee_assessments WHERE batch_id = $1 AND karyawan_id = ANY($2::uuid[])`,
        [batch_id, add_karyawan_ids]
      );
      const existingKaryawanIds = new Set(existingInBatchRes.rows.map((r) => r.karyawan_id));
      const newKaryawanIds = add_karyawan_ids.filter((id: string) => !existingKaryawanIds.has(id));

      if (newKaryawanIds.length > 0) {
        const empRes = await client.query(
          `SELECT id, nip, nama_lengkap, email, status_kepegawaian 
           FROM public.karyawan 
           WHERE id = ANY($1::uuid[]) AND is_active = true`,
          [newKaryawanIds]
        );

        const transporter = getMailTransporter();
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        for (const emp of empRes.rows) {
          if (!emp.email) {
            emailErrors.push(`Karyawan ${emp.nama_lengkap} (NIP: ${emp.nip}) tidak memiliki email.`);
            continue;
          }

          const token = crypto.randomUUID();
          const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

          await client.query(
            `INSERT INTO public.employee_assessments 
             (batch_id, karyawan_id, batch_name, token, access_code, status, scheduled_date, valid_from, expires_at)
             VALUES ($1, $2, $3, $4, $5, 'INVITED', $6, $7, $8)`,
            [batch_id, emp.id, newBatchName, token, accessCode, newScheduledDate, validFrom, expiresAt]
          );

          try {
            await sendInvitationEmail({
              emp,
              batch_name: newBatchName,
              scheduled_date: newScheduledDate,
              accessCode,
              token,
              baseUrl,
              transporter,
            });
          } catch (err: any) {
            console.error(`Error sending email to ${emp.email}:`, err);
            emailErrors.push(`Gagal mengirim email ke ${emp.nama_lengkap} (${emp.email}): ${err.message}`);
          }

          addedCount += 1;
        }
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: `Batch "${newBatchName}" berhasil diperbarui!`,
      added_count: addedCount,
      warnings: emailErrors.length > 0 ? emailErrors : undefined,
    });

  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Update Karyawan Test Batch Error:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui batch tes karyawan.", error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// DELETE /api/karyawan-test/batch - Hapus batch atau hapus satu peserta dari batch
export async function DELETE(request: Request) {
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batch_id");
    const assessmentId = searchParams.get("assessment_id");

    if (!batchId && !assessmentId) {
      return NextResponse.json(
        { message: "Harus menyertakan batch_id atau assessment_id untuk dihapus." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Case 1: Hapus satu peserta (assessment_id)
    if (assessmentId) {
      await client.query(`DELETE FROM public.mbti_test_results WHERE assessment_id = $1`, [assessmentId]);
      await client.query(`DELETE FROM public.disc_test_results WHERE assessment_id = $1`, [assessmentId]);
      await client.query(`DELETE FROM public.papi_test_results WHERE assessment_id = $1`, [assessmentId]);

      const delRes = await client.query(`DELETE FROM public.employee_assessments WHERE id = $1 RETURNING id`, [assessmentId]);

      if (delRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: "Data peserta tes tidak ditemukan." },
          { status: 404 }
        );
      }

      await client.query("COMMIT");
      return NextResponse.json({
        success: true,
        message: "Peserta berhasil dikeluarkan / dihapus dari batch.",
      });
    }

    // Case 2: Hapus seluruh batch (batch_id)
    if (batchId) {
      // Ambil seluruh assessment_id dalam batch
      const eaRes = await client.query(
        `SELECT id FROM public.employee_assessments WHERE batch_id = $1`,
        [batchId]
      );
      const assessmentIds = eaRes.rows.map((r) => r.id);

      if (assessmentIds.length > 0) {
        await client.query(`DELETE FROM public.mbti_test_results WHERE assessment_id = ANY($1::uuid[])`, [assessmentIds]);
        await client.query(`DELETE FROM public.disc_test_results WHERE assessment_id = ANY($1::uuid[])`, [assessmentIds]);
        await client.query(`DELETE FROM public.papi_test_results WHERE assessment_id = ANY($1::uuid[])`, [assessmentIds]);
        await client.query(`DELETE FROM public.employee_assessments WHERE batch_id = $1`, [batchId]);
      }

      const delBatch = await client.query(
        `DELETE FROM public.employee_assessment_batches WHERE id = $1 RETURNING batch_name`,
        [batchId]
      );

      if (delBatch.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: "Batch tidak ditemukan." },
          { status: 404 }
        );
      }

      await client.query("COMMIT");
      return NextResponse.json({
        success: true,
        message: `Batch "${delBatch.rows[0].batch_name}" dan seluruh pesertanya berhasil dihapus.`,
      });
    }

    await client.query("ROLLBACK");
    return NextResponse.json({ message: "Parameter tidak valid." }, { status: 400 });

  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("DELETE Karyawan Test Batch Error:", error);
    return NextResponse.json(
      { message: "Gagal menghapus data batch / peserta tes.", error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
