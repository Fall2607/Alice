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

    // 1. Ambil data sesi berdasarkan token dan kode akses (cek candidate_assessments lalu employee_assessments)
    let result = await pool.query(
      `SELECT 
        id, 
        candidate_id, 
        status, 
        expires_at,
        valid_from,
        'candidate' as assessment_type
       FROM public.candidate_assessments 
       WHERE token = $1 AND access_code = $2`,
      [token, access_code]
    );

    let isEmployee = false;
    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT 
          id, 
          karyawan_id as candidate_id, 
          status, 
          expires_at,
          valid_from,
          'employee' as assessment_type
         FROM public.employee_assessments 
         WHERE token = $1 AND access_code = $2`,
        [token, access_code]
      );
      if (result.rows.length > 0) {
        isEmployee = true;
      }
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Kode akses tidak cocok atau link ujian salah. Silakan periksa kembali." }, 
        { status: 401 }
      );
    }

    const assessment = result.rows[0];

    // 2. Validasi Jadwal Pelaksanaan
    const now = new Date();
    
    // Periksa apakah jadwal tes belum dimulai
    if (assessment.valid_from && now < new Date(assessment.valid_from)) {
      const formattedDate = new Date(assessment.valid_from).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return NextResponse.json(
        { message: `Ujian baru bisa diakses mulai ${formattedDate} pukul 00:00.` }, 
        { status: 403 }
      );
    }

    // Validasi Kedaluwarsa Sesi
    if (new Date(assessment.expires_at) < now) {
      const tableName = isEmployee ? 'public.employee_assessments' : 'public.candidate_assessments';
      await pool.query(
        `UPDATE ${tableName} SET status = 'EXPIRED' WHERE id = $1`,
        [assessment.id]
      );
      return NextResponse.json(
        { message: "Masa berlaku pengerjaan link ujian ini telah berakhir (Hanya valid pada tanggal yang dijadwalkan)." }, 
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
      const tableName = isEmployee ? 'public.employee_assessments' : 'public.candidate_assessments';
      await pool.query(
        `UPDATE ${tableName} SET status = 'ONGOING' WHERE id = $1`,
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