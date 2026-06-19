import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { PoolClient } from "pg";

export async function GET(
    request: Request,
    context: { params: Promise<{ jobId: string }> }
) {
    try {
        // Handle Next.js 15 promise-based params and older sync params
        const params = await context.params;
        const { jobId } = params;

        const result = await pool.query(
            `SELECT id, job_id, question, type, fuzzy_config, weight, category 
             FROM job_assessments 
             WHERE job_id = $1 
             ORDER BY category ASC, created_at ASC`,
            [jobId]
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Error fetching job assessments:", error);
        return NextResponse.json(
            { message: "Gagal mengambil data assessment", error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    context: { params: Promise<{ jobId: string }> }
) {
    const client: PoolClient = await pool.connect();
    try {
        const params = await context.params;
        const { jobId } = params;

        const body = await request.json();
        const assessments = body.assessments || [];

        // Memulai transaksi
        await client.query("BEGIN");

        // 1. Hapus semua assessment lama untuk job ini
        await client.query("DELETE FROM job_assessments WHERE job_id = $1", [jobId]);

        // 2. Insert assessment yang baru (Bulk Insert / Loop)
        for (const item of assessments) {
            // Parameterized query: sangat aman dari SQL Injection
            await client.query(
                `INSERT INTO job_assessments (job_id, question, type, fuzzy_config, weight, category) 
                 VALUES ($1, $2, $3::assessment_type, $4::jsonb, $5, $6)`,
                [
                    jobId,
                    item.question,
                    item.type,
                    item.fuzzy_config ? JSON.stringify(item.fuzzy_config) : null,
                    item.weight || 1.0,
                    item.category || 'Umum'
                ]
            );
        }

        // Commit transaksi
        await client.query("COMMIT");

        return NextResponse.json({ message: "Berhasil menyimpan assessment" }, { status: 200 });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error saving job assessments:", error);
        return NextResponse.json(
            { message: "Gagal menyimpan assessment", error: (error as Error).message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
