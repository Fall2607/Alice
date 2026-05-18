/**
 * Path: src/app/api/assessment/verify/route.ts
 * Deskripsi: API untuk melakukan verifikasi kode akses/OTP saat kandidat membuka link ujian.
 */

import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const { token, access_code } = await request.json();

    if (!token || !access_code) {
      return NextResponse.json(
        { message: "Token rute dan kode akses diperlukan." }, 
        { status: 400 }
      );
    }

    // 1. Ambil data sesi berdasarkan token dan kode akses
    const result = await pool.query(
      `SELECT 
        id, 
        candidate_id, 
        status, 
        expires_at 
       FROM public.candidate_assessments 
       WHERE token = $1 AND access_code = $2`,
      [token, access_code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Kode akses tidak cocok atau link ujian salah. Silakan periksa kembali." }, 
        { status: 401 }
      );
    }

    const assessment = result.rows[0];

    // 2. Validasi Kedaluwarsa Sesi (Batas waktu 48 jam)
    if (new Date(assessment.expires_at) < new Date()) {
      // Update status otomatis menjadi EXPIRED di database
      await pool.query(
        "UPDATE public.candidate_assessments SET status = 'EXPIRED' WHERE id = $1",
        [assessment.id]
      );
      return NextResponse.json(
        { message: "Masa berlaku pengerjaan link ujian ini telah kedaluwarsa (Batas 48 Jam)." }, 
        { status: 410 }
      );
    }

    // 3. Validasi status pengerjaan sebelumnya
    if (assessment.status === 'COMPLETED') {
      return NextResponse.json(
        { message: "Anda telah menyelesaikan rangkaian penilaian psikometri ini sebelumnya." }, 
        { status: 409 }
      );
    }

    // 4. Update status sesi menjadi ONGOING jika baru pertama kali dibuka
    if (assessment.status === 'INVITED') {
      await pool.query(
        "UPDATE public.candidate_assessments SET status = 'ONGOING' WHERE id = $1",
        [assessment.id]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verifikasi berhasil! Selamat mengerjakan.",
      assessmentId: assessment.id,
      candidateId: assessment.candidate_id
    });

  } catch (error: any) {
    console.error("Verification API Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server.", error: error.message }, 
      { status: 500 }
    );
  }
}