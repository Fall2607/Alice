import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ applicationStatusId: string }> } | { params: { applicationStatusId: string } }
) {
    try {
        const params = await context.params;
        const { applicationStatusId } = params;

        const result = await pool.query(
            `SELECT 
                aa.answer_value, 
                aa.fuzzy_score,
                ja.question,
                ja.type,
                ja.weight,
                ja.fuzzy_config
             FROM applicant_assessments aa
             JOIN job_assessments ja ON aa.assessment_id = ja.id
             WHERE aa.application_status_id = $1
             ORDER BY ja.id`,
            [applicationStatusId]
        );

        return NextResponse.json(result.rows);
    } catch (error: any) {
        return NextResponse.json(
            { message: "Gagal mengambil detail skor assessment.", error: error.message },
            { status: 500 }
        );
    }
}
