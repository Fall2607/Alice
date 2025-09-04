// File: src/app/api/jobs/route.ts

import { NextResponse } from "next/server";
import pool from "@/app/lib/db"; // Menggunakan koneksi database yang sama

// Mendefinisikan tipe data untuk objek Job
// Perhatikan bahwa deskripsi dan kualifikasi adalah array of string
interface Job {
  id: number;
  nama_job: string;
  jenis_job: "Medis" | "Non-Medis";
  deskripsi_job: string[];
  kualifikasi_job: string[];
}

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM job ORDER BY id ASC");
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    // Penanganan error yang lebih aman
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error fetching jobs", error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      nama_job,
      jenis_job,
      deskripsi_job,
      kualifikasi_job,
    }: Partial<Job> = await request.json();

    if (!nama_job || !jenis_job) {
      return NextResponse.json(
        { message: "Nama dan jenis pekerjaan wajib diisi" },
        { status: 400 }
      );
    }

    // Pastikan data array yang dikirim di-stringifikasi untuk disimpan di kolom JSONB
    const result = await pool.query(
      "INSERT INTO job (nama_job, jenis_job, deskripsi_job, kualifikasi_job) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        nama_job,
        jenis_job,
        JSON.stringify(deskripsi_job || []),
        JSON.stringify(kualifikasi_job || []),
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("Error creating job:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error creating job", error: errorMessage },
      { status: 500 }
    );
  }
}
