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
    const personalId = searchParams.get("personal_id") || searchParams.get("personalId");

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

    // 1. Hitung agregasi rekap presensi cut-off dengan formula terstandarisasi:
    // ((Tepat Waktu + Terlambat + Cuti + Izin) * 100) / (Total Hari Evaluasi s/d Hari Ini - Libur)
    const rekapResult = await calculateAbsensiRekap({
      startDate,
      endDate,
      unit: unitParam,
      superiorId,
    });

    const { summary, data: karyawanData, dates } = rekapResult;
    const totalKaryawan = summary.totalKaryawan;

    // Hitung personalRekap jika personalId dikirim (untuk tampilan staf mandiri di dashboard awal login)
    let personalRekap = null;
    if (personalId) {
      let foundPersonal = karyawanData.find((k) => k.id === personalId);
      if (!foundPersonal) {
        const allRekap = await calculateAbsensiRekap({
          startDate,
          endDate,
        });
        foundPersonal = allRekap.data.find((k) => k.id === personalId);
      }
      if (foundPersonal) {
        const hadirPlusCutiIzin =
          foundPersonal.rekap.hadir + foundPersonal.rekap.cuti + foundPersonal.rekap.izin;
        const hariWajibNonLibur = hadirPlusCutiIzin + foundPersonal.rekap.alpha;
        personalRekap = {
          hadir: foundPersonal.rekap.hadir,
          tepatWaktu: Math.max(0, foundPersonal.rekap.hadir - foundPersonal.rekap.telat),
          telat: foundPersonal.rekap.telat,
          alpha: foundPersonal.rekap.alpha,
          libur: foundPersonal.rekap.libur,
          cuti: foundPersonal.rekap.cuti,
          izin: foundPersonal.rekap.izin,
          hariWajibNonLibur,
          kehadiranRate: foundPersonal.rates.kehadiranFisik,
          cutiRate: foundPersonal.rates.cutiRate,
          izinRate: foundPersonal.rates.izinRate,
        };
      }
    }

    if (totalKaryawan === 0) {
      return NextResponse.json({
        totalKaryawan: 0,
        hadirHariIni: 0,
        tepatWaktuHariIni: 0,
        terlambatHariIni: 0,
        cutiHariIni: 0,
        izinHariIni: 0,
        liburHariIni: 0,
        alphaHariIni: 0,
        kehadiranHariIniRate: 0,
        kehadiranBulanIni: 0,
        cutiRateBulanIni: 0,
        izinRateBulanIni: 0,
        totalDinasAktif: 0,
        totalTepatWaktuCutOff: 0,
        totalTelatCutOff: 0,
        totalHadirCutOff: 0,
        totalAlphaCutOff: 0,
        totalCutiCutOff: 0,
        totalIzinCutOff: 0,
        totalLiburCutOff: 0,
        personalRekap,
        cutOffStart: startDate,
        cutOffEnd: endDate,
      });
    }

    // 2. Stats Real-time Hari Ini menggunakan standar klasifikasi yang sama
    let hadirHariIni = 0;
    let terlambatHariIni = 0;
    let cutiHariIni = 0;
    let izinHariIni = 0;
    let liburHariIni = 0;
    let alphaHariIni = 0;

    if (dates.includes(todayDateStr)) {
      for (const kar of karyawanData) {
        const st = kar.harian[todayDateStr]?.status;
        if (st === "hadir") {
          hadirHariIni++;
        } else if (st === "telat") {
          hadirHariIni++;
          terlambatHariIni++;
        } else if (st === "cuti") {
          cutiHariIni++;
        } else if (st === "izin") {
          izinHariIni++;
        } else if (st === "libur") {
          liburHariIni++;
        } else if (st === "alpha") {
          alphaHariIni++;
        }
      }
    } else {
      // Jika bulan cut-off yang dipilih bukan periode hari ini, evaluasi status hari ini secara terpisah
      const todayRekap = await calculateAbsensiRekap({
        startDate: todayDateStr,
        endDate: todayDateStr,
        unit: unitParam,
        superiorId,
      });
      hadirHariIni = todayRekap.summary.totalHadir;
      terlambatHariIni = todayRekap.summary.totalTelat;
      cutiHariIni = todayRekap.summary.totalCuti;
      izinHariIni = todayRekap.summary.totalIzin;
      liburHariIni = todayRekap.summary.totalLibur;
      alphaHariIni = todayRekap.summary.totalAlpha;
    }

    const tepatWaktuHariIni = Math.max(0, hadirHariIni - terlambatHariIni);
    // Rumus Harian: ((Tepat Waktu + Terlambat + Cuti + Izin) * 100) / (Total Karyawan - Libur Hari Ini)
    const wajibHadirHariIni = Math.max(0, totalKaryawan - liburHariIni);
    const hadirPlusCutiIzinHariIni = hadirHariIni + cutiHariIni + izinHariIni;
    const kehadiranHariIniRate =
      wajibHadirHariIni > 0
        ? Math.min(Number(((hadirPlusCutiIzinHariIni * 100) / wajibHadirHariIni).toFixed(1)), 100)
        : 100;

    const totalTepatWaktuCutOff = Math.max(0, summary.totalHadir - summary.totalTelat);

    return NextResponse.json({
      totalKaryawan,
      hadirHariIni,
      tepatWaktuHariIni,
      terlambatHariIni,
      cutiHariIni,
      izinHariIni,
      liburHariIni,
      alphaHariIni,
      kehadiranHariIniRate,
      // Persentase Kehadiran Periode Cut-Off: ((Tepat Waktu + Terlambat + Cuti + Izin) * 100) / (Total Hari Evaluasi - Libur)
      kehadiranBulanIni: summary.kehadiranRate,
      cutiRateBulanIni: summary.cutiRate,
      izinRateBulanIni: summary.izinRate,
      totalDinasAktif: summary.totalJadwalTerencana,
      totalHadirCutOff: summary.totalHadir,
      totalTepatWaktuCutOff,
      totalTelatCutOff: summary.totalTelat,
      totalAlphaCutOff: summary.totalAlpha,
      totalCutiCutOff: summary.totalCuti,
      totalIzinCutOff: summary.totalIzin,
      totalLiburCutOff: summary.totalLibur,
      personalRekap,
      cutOffStart: startDate,
      cutOffEnd: endDate,
    });
  } catch (err: any) {
    console.error("Error fetching dashboard absensi:", err);
    return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
  }
}
