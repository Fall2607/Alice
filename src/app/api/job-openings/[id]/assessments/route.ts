import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { id } = params;

        const result = await pool.query(
            `SELECT ja.id, ja.job_id, ja.question, ja.type, ja.fuzzy_config, ja.weight, ja.category 
             FROM job_assessments ja
             JOIN job_opening_assessments joa ON ja.id = joa.job_assessment_id
             WHERE joa.job_opening_id = $1 
               AND joa.is_active = true
               AND ja.type != 'SYSTEM_EDUCATION'
             ORDER BY ja.category ASC, ja.created_at ASC`,
            [id]
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Error fetching job opening assessments:", error);
        return NextResponse.json(
            { message: "Gagal mengambil data assessment", error: (error as Error).message },
            { status: 500 }
        );
    }
}
