import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/lib/db";
import { PoolClient } from "pg";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ jobOpeningId: string }> } | { params: { jobOpeningId: string } }
) {
    try {
        const params = await context.params;
        const { jobOpeningId } = params;

        const result = await pool.query(
            `SELECT job_assessment_id, is_active 
             FROM job_opening_assessments 
             WHERE job_opening_id = $1`,
            [jobOpeningId]
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Error fetching job opening assessments:", error);
        return NextResponse.json(
            { message: "Gagal mengambil data", error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ jobOpeningId: string }> } | { params: { jobOpeningId: string } }
) {
    const client: PoolClient = await pool.connect();
    try {
        const params = await context.params;
        const { jobOpeningId } = params;

        const body = await request.json();
        const { selectedAssessmentIds } = body; // array of job_assessment_id UUIDs

        await client.query("BEGIN");

        // Hapus pilihan lama
        await client.query("DELETE FROM job_opening_assessments WHERE job_opening_id = $1", [jobOpeningId]);

        // Insert pilihan baru
        for (const assessmentId of selectedAssessmentIds) {
            await client.query(
                `INSERT INTO job_opening_assessments (job_opening_id, job_assessment_id, is_active) 
                 VALUES ($1, $2, true)`,
                [jobOpeningId, assessmentId]
            );
        }

        await client.query("COMMIT");

        return NextResponse.json({ message: "Berhasil menyimpan pilihan assessment" }, { status: 200 });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error saving job opening assessments:", error);
        return NextResponse.json(
            { message: "Gagal menyimpan pilihan", error: (error as Error).message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
