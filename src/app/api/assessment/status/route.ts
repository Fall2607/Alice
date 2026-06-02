import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessment_id = searchParams.get('id');

    if (!assessment_id) {
      return NextResponse.json({ message: "Assessment ID diperlukan." }, { status: 400 });
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

    return NextResponse.json({ success: true, completed });
  } catch (error: any) {
    console.error(`Status API Error:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memeriksa status.", error: error.message }, 
      { status: 500 }
    );
  }
}
