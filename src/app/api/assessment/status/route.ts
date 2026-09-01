import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let assessment_id = searchParams.get('id');
    const token = searchParams.get('token');

    // Jika id tidak ada tapi token ada, cari ID dari token
    if (!assessment_id && token) {
      const candRes = await pool.query(`SELECT id FROM candidate_assessments WHERE token = $1`, [token]);
      if (candRes.rows.length > 0) {
        assessment_id = candRes.rows[0].id;
      } else {
        const empRes = await pool.query(`SELECT id FROM employee_assessments WHERE token = $1`, [token]);
        if (empRes.rows.length > 0) {
          assessment_id = empRes.rows[0].id;
        }
      }
    }

    if (!assessment_id) {
      return NextResponse.json({ message: "Assessment ID atau Token diperlukan." }, { status: 400 });
    }

    const [mbtiRes, discRes, papiRes] = await Promise.all([
      pool.query(`SELECT 1 FROM mbti_test_results WHERE assessment_id = $1`, [assessment_id]),
      pool.query(`SELECT 1 FROM disc_test_results WHERE assessment_id = $1`, [assessment_id]),
      pool.query(`SELECT 1 FROM papi_test_results WHERE assessment_id = $1`, [assessment_id]),
    ]);

    const completed = {
      mbti: (mbtiRes.rowCount ?? 0) > 0,
      disc: (discRes.rowCount ?? 0) > 0,
      papi: (papiRes.rowCount ?? 0) > 0,
    };

    const isAllCompleted = completed.mbti && completed.disc && completed.papi;

    // Jika ketiga tes sudah selesai, otomatis update status di database ke COMPLETED
    if (isAllCompleted) {
      await pool.query(
        "UPDATE public.candidate_assessments SET status = 'COMPLETED' WHERE id = $1",
        [assessment_id]
      );
      await pool.query(
        "UPDATE public.employee_assessments SET status = 'COMPLETED' WHERE id = $1",
        [assessment_id]
      );
    }

    return NextResponse.json({
      success: true,
      assessment_id,
      completed,
      isAllCompleted
    });

  } catch (error: any) {
    console.error(`Status API Error:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memeriksa status.", error: error.message }, 
      { status: 500 }
    );
  }
}
