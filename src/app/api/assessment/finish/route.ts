import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const { assessment_id, token } = await request.json();

    let targetId = assessment_id;

    if (!targetId && token) {
      const candRes = await pool.query(`SELECT id FROM candidate_assessments WHERE token = $1`, [token]);
      if (candRes.rows.length > 0) {
        targetId = candRes.rows[0].id;
      } else {
        const empRes = await pool.query(`SELECT id FROM employee_assessments WHERE token = $1`, [token]);
        if (empRes.rows.length > 0) {
          targetId = empRes.rows[0].id;
        }
      }
    }

    if (!targetId) {
      return NextResponse.json({ message: "Assessment ID atau Token wajib diisi." }, { status: 400 });
    }

    // Update status di kedua tabel
    await pool.query(
      "UPDATE public.candidate_assessments SET status = 'COMPLETED' WHERE id = $1",
      [targetId]
    );
    await pool.query(
      "UPDATE public.employee_assessments SET status = 'COMPLETED' WHERE id = $1",
      [targetId]
    );

    return NextResponse.json({
      success: true,
      message: "Seluruh tes psikometri berhasil diselesaikan dan disimpan."
    });

  } catch (error: any) {
    console.error("Finish Assessment Error:", error);
    return NextResponse.json(
      { message: "Gagal menyelesaikan sesi ujian.", error: error.message },
      { status: 500 }
    );
  }
}
