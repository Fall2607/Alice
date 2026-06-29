import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request: NextRequest) {
    try {
        const res = await pool.query("SELECT id, nama_departemen FROM departemen ORDER BY nama_departemen ASC");
        return NextResponse.json(res.rows);
    } catch (err: any) {
        console.error("Error fetching departemen:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
