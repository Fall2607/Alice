import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { evaluateAssessmentCompletion } from "@/app/lib/essayAssessment";

export const dynamic = "force-dynamic";

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

    const completion = await evaluateAssessmentCompletion(assessment_id);

    return NextResponse.json({
      success: true,
      assessment_id,
      completed: completion.completed,
      essayRequired: completion.essayRequired,
      essayConfig: completion.essayConfig,
      isAllCompleted: completion.isAllCompleted,
    });

  } catch (error: any) {
    console.error(`Status API Error:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memeriksa status.", error: error.message }, 
      { status: 500 }
    );
  }
}
