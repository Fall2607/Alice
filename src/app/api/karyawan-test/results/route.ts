import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessment_id");

    if (!assessmentId) {
      return NextResponse.json(
        { message: "Assessment ID wajib diisi." },
        { status: 400 }
      );
    }

    // Ambil detail entri employee_assessments + karyawan
    const empRes = await pool.query(
      `SELECT 
        ea.id,
        COALESCE(b.batch_name, ea.batch_name) as batch_name,
        ea.batch_id,
        ea.status,
        COALESCE(b.scheduled_date, ea.scheduled_date) as scheduled_date,
        k.id as karyawan_id,
        k.nip,
        k.nama_lengkap,
        k.email,
        k.status_kepegawaian,
        d.nama_departemen,
        k.profesi as nama_jabatan
       FROM public.employee_assessments ea
       LEFT JOIN public.employee_assessment_batches b ON ea.batch_id = b.id
       JOIN public.karyawan k ON ea.karyawan_id = k.id
       LEFT JOIN public.jabatan j ON k.jabatan_id = j.id
       LEFT JOIN public.departemen d ON j.departemen_id = d.id
       WHERE ea.id = $1`,
      [assessmentId]
    );

    if (empRes.rows.length === 0) {
      return NextResponse.json(
        { message: "Data tes karyawan tidak ditemukan." },
        { status: 404 }
      );
    }

    const assessment = empRes.rows[0];

    // Query hasil MBTI, DISC, PAPI
    const [mbtiRes, discRes, papiRes] = await Promise.all([
      pool.query(`SELECT * FROM public.mbti_test_results WHERE assessment_id = $1`, [assessmentId]),
      pool.query(`SELECT * FROM public.disc_test_results WHERE assessment_id = $1`, [assessmentId]),
      pool.query(`SELECT * FROM public.papi_test_results WHERE assessment_id = $1`, [assessmentId]),
    ]);

    return NextResponse.json({
      success: true,
      assessment,
      results: {
        mbti: mbtiRes.rows[0] || null,
        disc: discRes.rows[0] || null,
        papi: papiRes.rows[0] || null,
      }
    });

  } catch (error: any) {
    console.error("GET Karyawan Test Results Error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data hasil tes.", error: error.message },
      { status: 500 }
    );
  }
}
