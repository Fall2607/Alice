import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { calculateAbsensiRekap, getCutOffPeriodDates } from "@/app/lib/absensiRekap";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month"); // YYYY-MM
    const unitParam = searchParams.get("unit"); // departemen_id or 'all'
    const superiorId = searchParams.get("superior_id") || searchParams.get("superiorId");

    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const todayDateStr = today.toISOString().split("T")[0];

    // Tentukan rentang cut-off (26 s/d 25)
    let startDate: string;
    let endDate: string;

    if (monthParam) {
      const [yStr, mStr] = monthParam.split("-");
      const yNum = parseInt(yStr, 10);
      const mNum = parseInt(mStr, 10);
      const pad2 = (n: number) => String(n).padStart(2, "0");

      const startCutOff = new Date(yNum, mNum - 2, 26);
      const endCutOff = new Date(yNum, mNum - 1, 25);
      startDate = `${startCutOff.getFullYear()}-${pad2(startCutOff.getMonth() + 1)}-${pad2(startCutOff.getDate())}`;
      endDate = `${endCutOff.getFullYear()}-${pad2(endCutOff.getMonth() + 1)}-${pad2(endCutOff.getDate())}`;
    } else {
      const cutOff = getCutOffPeriodDates(today);
      startDate = cutOff.startDateStr;
      endDate = cutOff.endDateStr;
    }

    // 1. Hitung agregasi rekap presensi cut-off dengan formula terstandarisasi
    const rekapResult = await calculateAbsensiRekap({
      startDate,
      endDate,
      unit: unitParam,
      superiorId,
    });

    const { summary, data: karyawanData } = rekapResult;
    const totalKaryawan = summary.totalKaryawan;

    if (totalKaryawan === 0) {
      return NextResponse.json({
        totalKaryawan: 0,
        hadirHariIni: 0,
        terlambatHariIni: 0,
        alphaHariIni: 0,
        kehadiranBulanIni: 100,
        cutiRateBulanIni: 0,
        izinRateBulanIni: 0,
        totalDinasAktif: 0,
        cutOffStart: startDate,
        cutOffEnd: endDate,
      });
    }

    const karyawanIds = karyawanData.map((k) => k.id);

    // 2. Stats Real-time Hari Ini
    const queryHadir = `
      SELECT id, is_late 
      FROM absensi 
      WHERE tanggal = $1 AND karyawan_id = ANY($2::uuid[])
    `;
    const hadirRes = await pool.query(queryHadir, [todayDateStr, karyawanIds]);

    const hadirHariIni = hadirRes.rows.length;
    const terlambatHariIni = hadirRes.rows.filter((r) => r.is_late).length;
    const alphaHariIni = Math.max(0, totalKaryawan - hadirHariIni);

    return NextResponse.json({
      totalKaryawan,
      hadirHariIni,
      terlambatHariIni,
      alphaHariIni,
      // Persentase kehadiran fisik: (Hadir / (Hadir + Alpha)) * 100
      kehadiranBulanIni: summary.kehadiranRate,
      // Persentase Cuti & Izin terpisah
      cutiRateBulanIni: summary.cutiRate,
      izinRateBulanIni: summary.izinRate,
      totalDinasAktif: summary.totalDinasAktif,
      totalHadirCutOff: summary.totalHadir,
      totalTelatCutOff: summary.totalTelat,
      totalAlphaCutOff: summary.totalAlpha,
      totalCutiCutOff: summary.totalCuti,
      totalIzinCutOff: summary.totalIzin,
      totalLiburCutOff: summary.totalLibur,
      cutOffStart: startDate,
      cutOffEnd: endDate,
    });
  } catch (err: any) {
    console.error("Error fetching dashboard absensi:", err);
    return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
  }
}
