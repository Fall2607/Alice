import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const { assessment_id, test_type, answers, result } = await request.json();

    if (!assessment_id || !test_type || !result) {
      return NextResponse.json({ message: "Data tidak lengkap." }, { status: 400 });
    }

    if (test_type === 'mbti') {
      const check = await pool.query(`SELECT id FROM mbti_test_results WHERE assessment_id = $1`, [assessment_id]);
      if ((check.rowCount ?? 0) > 0) {
        await pool.query(
          `UPDATE mbti_test_results SET 
           raw_answers = $2, score_e = $3, score_i = $4, score_s = $5, score_n = $6,
           score_t = $7, score_f = $8, score_j = $9, score_p = $10, final_result = $11
           WHERE assessment_id = $1`,
          [assessment_id, JSON.stringify(answers), result.score.E, result.score.I, result.score.S, result.score.N, result.score.T, result.score.F, result.score.J, result.score.P, result.type]
        );
      } else {
        await pool.query(
          `INSERT INTO mbti_test_results 
           (assessment_id, raw_answers, score_e, score_i, score_s, score_n, score_t, score_f, score_j, score_p, final_result) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [assessment_id, JSON.stringify(answers), result.score.E, result.score.I, result.score.S, result.score.N, result.score.T, result.score.F, result.score.J, result.score.P, result.type]
        );
      }
    } else if (test_type === 'disc') {
      const check = await pool.query(`SELECT id FROM disc_test_results WHERE assessment_id = $1`, [assessment_id]);
      if ((check.rowCount ?? 0) > 0) {
        await pool.query(
          `UPDATE disc_test_results SET 
           raw_answers = $2, most_d = $3, most_i = $4, most_s = $5, most_c = $6,
           least_d = $7, least_i = $8, least_s = $9, least_c = $10, diff_d = $11, diff_i = $12, diff_s = $13, diff_c = $14
           WHERE assessment_id = $1`,
          [assessment_id, JSON.stringify(answers), result.most.D, result.most.I, result.most.S, result.most.C, result.least.D, result.least.I, result.least.S, result.least.C, result.diff.D, result.diff.I, result.diff.S, result.diff.C]
        );
      } else {
        await pool.query(
          `INSERT INTO disc_test_results 
           (assessment_id, raw_answers, most_d, most_i, most_s, most_c, least_d, least_i, least_s, least_c, diff_d, diff_i, diff_s, diff_c) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [assessment_id, JSON.stringify(answers), result.most.D, result.most.I, result.most.S, result.most.C, result.least.D, result.least.I, result.least.S, result.least.C, result.diff.D, result.diff.I, result.diff.S, result.diff.C]
        );
      }
    } else if (test_type === 'papi') {
      const check = await pool.query(`SELECT id FROM papi_test_results WHERE assessment_id = $1`, [assessment_id]);
      if ((check.rowCount ?? 0) > 0) {
        await pool.query(
          `UPDATE papi_test_results SET 
           raw_answers = $2, score_g = $3, score_l = $4, score_i = $5, score_t = $6,
           score_v = $7, score_s = $8, score_r = $9, score_d = $10, score_c = $11, score_e = $12, score_n = $13, score_a = $14,
           score_p = $15, score_x = $16, score_b = $17, score_o = $18, score_k = $19, score_z = $20, score_f = $21, score_w = $22
           WHERE assessment_id = $1`,
          [assessment_id, JSON.stringify(answers), result.G || 0, result.L || 0, result.I || 0, result.T || 0, result.V || 0, result.S || 0, result.R || 0, result.D || 0, result.C || 0, result.E || 0, result.N || 0, result.A || 0, result.P || 0, result.X || 0, result.B || 0, result.O || 0, result.K || 0, result.Z || 0, result.F || 0, result.W || 0]
        );
      } else {
        await pool.query(
          `INSERT INTO papi_test_results 
           (assessment_id, raw_answers, score_g, score_l, score_i, score_t, score_v, score_s, score_r, score_d, score_c, score_e, score_n, score_a, score_p, score_x, score_b, score_o, score_k, score_z, score_f, score_w) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
          [assessment_id, JSON.stringify(answers), result.G || 0, result.L || 0, result.I || 0, result.T || 0, result.V || 0, result.S || 0, result.R || 0, result.D || 0, result.C || 0, result.E || 0, result.N || 0, result.A || 0, result.P || 0, result.X || 0, result.B || 0, result.O || 0, result.K || 0, result.Z || 0, result.F || 0, result.W || 0]
        );
      }
    } else {
        return NextResponse.json({ message: "Tipe tes tidak valid." }, { status: 400 });
    }

    // Periksa apakah semua tes sudah selesai
    const [mbtiRes, discRes, papiRes] = await Promise.all([
        pool.query(`SELECT 1 FROM mbti_test_results WHERE assessment_id = $1`, [assessment_id]),
        pool.query(`SELECT 1 FROM disc_test_results WHERE assessment_id = $1`, [assessment_id]),
        pool.query(`SELECT 1 FROM papi_test_results WHERE assessment_id = $1`, [assessment_id]),
    ]);

    if ((mbtiRes.rowCount ?? 0) > 0 && (discRes.rowCount ?? 0) > 0 && (papiRes.rowCount ?? 0) > 0) {
        await pool.query(
            "UPDATE public.candidate_assessments SET status = 'COMPLETED' WHERE id = $1",
            [assessment_id]
        );
        await pool.query(
            "UPDATE public.employee_assessments SET status = 'COMPLETED' WHERE id = $1",
            [assessment_id]
        );
    }

    return NextResponse.json({ success: true, message: `Hasil tes ${test_type.toUpperCase()} berhasil disimpan.` });
  } catch (error: any) {
    console.error(`Submit API Error:`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan hasil.", error: error.message }, 
      { status: 500 }
    );
  }
}
