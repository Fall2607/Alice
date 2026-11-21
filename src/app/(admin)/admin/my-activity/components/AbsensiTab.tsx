"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar,
  LogIn,
  LogOut as LogOutIcon,
  Filter,
  X,
  Loader2,
  ScanFace,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGpsGate } from "@/app/lib/useGpsGate";
import GpsGatePanel from "@/app/components/absensi/GpsGatePanel";
import {
  CAMERA_VIDEO_CONSTRAINTS,
  ensureFaceModelsLoaded,
  FACE_DETECTION_INPUT_SIZE,
  preloadFaceModels,
} from "@/app/lib/faceRecognition";
import { usePreExtractedFace } from "@/app/lib/usePreExtractedFace";
import SearchableSelect from "@/app/components/admin/SearchableSelect";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface AttendanceRecord {
  readonly date: string;
  readonly shift: string;
  readonly in: string;
  readonly out: string;
  readonly status: "Tepat Waktu" | "Terlambat" | "Pulang Cepat";
}

interface AttendanceStats {
  readonly hadir: number;
  readonly terlambat: number;
  readonly score: number;
}

interface RawAttendanceApiItem {
  readonly tanggal: string;
  readonly nama_shift?: string | null;
  readonly jam_masuk?: string | null;
  readonly jam_keluar?: string | null;
  readonly menit_terlambat?: number | null;
  readonly is_late?: boolean | null;
  readonly is_pulang_cepat?: boolean | null;
  readonly menit_pulang_cepat?: number | null;
}

type ScanStatus =
  | "idle"
  | "scanning"
  | "success"
  | "error"
  | "early"
  | "unresolved_checkout"
  | "info";

const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

interface AbsensiTabProps {
  isOpenLiveAbsenFromParent?: boolean;
  onCloseLiveAbsenParent?: () => void;
  onStatsUpdated?: () => void;
}

export default function AbsensiTab({
  isOpenLiveAbsenFromParent = false,
  onCloseLiveAbsenParent,
  onStatsUpdated,
}: AbsensiTabProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const [attendanceLog, setAttendanceLog] = useState<readonly AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({ hadir: 0, terlambat: 0, score: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [karyawanId, setKaryawanId] = useState<string | null>(null);

  // Live Absen States
  const [isLiveAbsenOpen, setIsLiveAbsenOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [cachedDescriptor, setCachedDescriptor] = useState<number[] | null>(null);
  const [scanResultMsg, setScanResultMsg] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external open trigger
  useEffect(() => {
    if (isOpenLiveAbsenFromParent) {
      setIsLiveAbsenOpen(true);
    }
  }, [isOpenLiveAbsenFromParent]);

  const handleCloseModal = () => {
    setIsLiveAbsenOpen(false);
    if (onCloseLiveAbsenParent) {
      onCloseLiveAbsenParent();
    }
  };

  const gps = useGpsGate(isLiveAbsenOpen);
  const gpsUnlocked = gps.isReady && gps.inArea;

  const {
    isFaceLocked,
    consumeFreshDescriptor,
    extractLiveDescriptor,
    clearPreExtractedFace,
  } = usePreExtractedFace({
    videoRef,
    enabled: isLiveAbsenOpen && gpsUnlocked && isCameraReady && scanStatus === "idle",
    inputSize: FACE_DETECTION_INPUT_SIZE.MOBILE,
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  const extractTime = (timeStr?: string | null): string => {
    if (!timeStr) return "-";
    try {
      const timePart = timeStr.includes(" ")
        ? timeStr.split(" ")[1]?.substring(0, 5)
        : timeStr.includes("T")
        ? timeStr.split("T")[1]?.substring(0, 5)
        : timeStr.substring(0, 5);

      if (timePart && timePart.includes(":")) {
        const [rawH, rawM] = timePart.split(":");
        if (
          rawH !== undefined &&
          rawM !== undefined &&
          !isNaN(Number(rawH)) &&
          !isNaN(Number(rawM))
        ) {
          return `${rawH.padStart(2, "0")}:${rawM.padStart(2, "0")}`;
        }
      }

      return "-";
    } catch {
      return "-";
    }
  };

  const fetchAbsensi = useCallback(
    async (kId: string, month: number, year: number) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${baseUrl}/absensi/${kId}?month=${month}&year=${year}`);
        if (response.ok) {
          const rawData: RawAttendanceApiItem[] = await response.json();
          let hadirCount = 0;
          let terlambatCount = 0;

          const formattedLogs: AttendanceRecord[] = rawData.map((item) => {
            let dateStr = "-";
            if (item.tanggal) {
              const dateOnly = item.tanggal.split("T")[0];
              const [y, m, d] = dateOnly.split("-").map(Number);
              if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                const dateObj = new Date(y, m - 1, d);
                dateStr = dateObj.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "2-digit",
                  month: "short",
                });
              }
            }

            const inTime = extractTime(item.jam_masuk);
            const outTime = extractTime(item.jam_keluar);

            let status: AttendanceRecord["status"] = "Tepat Waktu";
            if (item.menit_terlambat && item.menit_terlambat > 0) {
              status = "Terlambat";
              terlambatCount++;
            } else if (item.is_pulang_cepat) {
              status = "Pulang Cepat";
            }
            hadirCount++;

            return {
              date: dateStr,
              shift: item.nama_shift || "Shift Normal",
              in: inTime,
              out: outTime,
              status,
            };
          });

          const scorePercent =
            hadirCount === 0
              ? 100
              : Math.round(((hadirCount - terlambatCount) / hadirCount) * 100);

          setAttendanceLog(formattedLogs);
          setStats({
            hadir: hadirCount,
            terlambat: terlambatCount,
            score: scorePercent,
          });
        }
      } catch (err) {
        console.error("Gagal mengambil log absensi:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl]
  );

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) return;
    try {
      const user = JSON.parse(userString);
      if (user.karyawan_id) {
        setKaryawanId(user.karyawan_id);
        fetchAbsensi(user.karyawan_id, selectedMonth, selectedYear);
      }
    } catch (e) {
      console.error("Gagal membaca sesi user:", e);
    }
  }, [selectedMonth, selectedYear, fetchAbsensi]);

  useEffect(() => {
    preloadFaceModels(FACE_DETECTION_INPUT_SIZE.MOBILE);
  }, []);

  // Load Models & Kamera saat Live Absen Aktif
  useEffect(() => {
    if (!isLiveAbsenOpen || !gpsUnlocked) return;

    let activeStream: MediaStream | null = null;
    let isMounted = true;

    const setupCamera = async () => {
      try {
        const [, stream] = await Promise.all([
          ensureFaceModelsLoaded(FACE_DETECTION_INPUT_SIZE.MOBILE),
          navigator.mediaDevices?.getUserMedia
            ? navigator.mediaDevices.getUserMedia({ video: CAMERA_VIDEO_CONSTRAINTS })
            : Promise.resolve(null),
        ]);

        if (!isMounted) {
          stream?.getTracks().forEach((track) => track.stop());
          return;
        }

        activeStream = stream;
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          if (videoRef.current.readyState >= 2) {
            setIsCameraReady(true);
          }
        } else {
          setScanResultMsg("Kamera tidak dapat diakses.");
        }
      } catch (err) {
        console.error("Gagal setup kamera/model:", err);
        if (isMounted) setScanResultMsg("Kamera tidak dapat diakses.");
      }
    };

    setupCamera();

    return () => {
      isMounted = false;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      clearPreExtractedFace();
      setIsCameraReady(false);
      setScanStatus("idle");
      setScanResultMsg("");
      setCachedDescriptor(null);
    };
  }, [isLiveAbsenOpen, gpsUnlocked, clearPreExtractedFace]);

  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-absensi-filter",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "all" }
      );

      gsap.fromTo(
        ".gsap-absensi-side",
        { opacity: 0, x: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", delay: 0.1, clearProps: "all" }
      );
    },
    { scope: containerRef, dependencies: [] }
  );

  const handleScanAbsen = async (
    type: "in" | "out",
    forceEarlyOut = false,
    forceNewCheckIn = false
  ) => {
    if (scanStatus === "scanning") return;
    if (!karyawanId) return;

    const preExtracted = cachedDescriptor ?? consumeFreshDescriptor();
    if (!videoRef.current && !preExtracted) return;

    setScanStatus("scanning");
    setScanResultMsg("Memverifikasi biometrik wajah...");

    try {
      let faceDescriptor = preExtracted;
      if (!faceDescriptor) {
        await new Promise<void>((resolve) => setTimeout(resolve, 20));
        faceDescriptor = await extractLiveDescriptor();

        if (!faceDescriptor) {
          setScanStatus("error");
          setScanResultMsg("Wajah tidak terdeteksi. Posisikan wajah tegak ke arah kamera.");
          setTimeout(() => {
            setScanStatus("idle");
            setScanResultMsg("");
          }, 3000);
          return;
        }
      }

      const loc = gps.getLatestPosition();
      if (!loc) {
        setScanStatus("error");
        setCachedDescriptor(null);
        setScanResultMsg("GPS tidak aktif. Nyalakan lokasi perangkat Anda.");
        setTimeout(() => {
          setScanStatus("idle");
          setScanResultMsg("");
        }, 4000);
        return;
      }

      const response = await fetch("/api/absensi/verify-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descriptor: faceDescriptor,
          type,
          forceEarlyOut,
          forceNewCheckIn,
          karyawan_id: karyawanId,
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        if (resData.isEarly) {
          setCachedDescriptor(faceDescriptor);
          setScanStatus("early");
          setScanResultMsg(resData.message);
          return;
        }
        if (resData.isUnresolvedCheckout) {
          setCachedDescriptor(faceDescriptor);
          setScanStatus("unresolved_checkout");
          setScanResultMsg(resData.message);
          return;
        }
        if (resData.isOutOfArea) {
          setScanStatus("error");
          setCachedDescriptor(null);
          setScanResultMsg(resData.message);
          setTimeout(() => {
            setScanStatus("idle");
            setScanResultMsg("");
          }, 5000);
          return;
        }
        if (response.status === 409 || response.status === 403) {
          setScanStatus("info");
          setCachedDescriptor(null);
          setScanResultMsg(resData.message);
          setTimeout(() => {
            setScanStatus("idle");
            setScanResultMsg("");
          }, 4000);
          return;
        }

        setScanStatus("error");
        setCachedDescriptor(null);
        setScanResultMsg(resData.message || "Verifikasi biometrik gagal.");
        setTimeout(() => {
          setScanStatus("idle");
          setScanResultMsg("");
        }, 4000);
        return;
      }

      setScanStatus("success");
      setScanResultMsg(resData.message || "Presensi berhasil dicatat.");
      setTimeout(() => {
        handleCloseModal();
        if (karyawanId) {
          fetchAbsensi(karyawanId, selectedMonth, selectedYear);
        }
        if (onStatsUpdated) {
          onStatsUpdated();
        }
      }, 2000);
    } catch (err) {
      console.error("Kesalahan jaringan proses absensi:", err);
      setScanStatus("error");
      setCachedDescriptor(null);
      setScanResultMsg("Terjadi gangguan koneksi ke server presensi.");
      setTimeout(() => {
        setScanStatus("idle");
        setScanResultMsg("");
      }, 4000);
    }
  };

  const handleResetFilter = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  };

  const isFilterActive =
    selectedMonth !== currentDate.getMonth() + 1 ||
    selectedYear !== currentDate.getFullYear();

  const yearOptions = Array.from({ length: 5 }).map((_, i) => {
    const yr = currentDate.getFullYear() - i;
    return { value: yr, label: yr.toString() };
  });

  return (
    <div ref={containerRef} className="space-y-6">
      {/* FILTER & PENCARIAN (Layer 3 Standard) */}
      <div className="gsap-absensi-filter bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-primary" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filter Periode Presensi
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isFilterActive && (
              <button
                onClick={handleResetFilter}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset Bulan</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
          {/* Kolom 1: Pilih Bulan */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Pilih Bulan
            </label>
            <SearchableSelect
              options={MONTH_OPTIONS}
              value={MONTH_OPTIONS.find((m) => m.value === selectedMonth) || null}
              onChange={(opt) => {
                if (opt) setSelectedMonth(Number(opt.value));
              }}
              isClearable={false}
              placeholder="Pilih Bulan..."
            />
          </div>

          {/* Kolom 2: Pilih Tahun */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Pilih Tahun
            </label>
            <SearchableSelect
              options={yearOptions}
              value={yearOptions.find((y) => y.value === selectedYear) || null}
              onChange={(opt) => {
                if (opt) setSelectedYear(Number(opt.value));
              }}
              isClearable={false}
              placeholder="Pilih Tahun..."
            />
          </div>

          {/* Kolom 3: Shortcut Bulan Cepat */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Periode Cepat
            </label>
            <div className="grid grid-cols-2 gap-1.5 h-[38px]">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setSelectedMonth(now.getMonth() + 1);
                  setSelectedYear(now.getFullYear());
                }}
                className={`w-full h-full rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${
                  selectedMonth === currentDate.getMonth() + 1 &&
                  selectedYear === currentDate.getFullYear()
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                Bulan Berjalan
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  now.setMonth(now.getMonth() - 1);
                  setSelectedMonth(now.getMonth() + 1);
                  setSelectedYear(now.getFullYear());
                }}
                className="w-full h-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
              >
                Bulan Lalu
              </button>
            </div>
          </div>

          {/* Kolom 4: Tombol Absen Sekarang Full di Ujung Kanan */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Presensi Mandiri
            </label>
            <button
              type="button"
              onClick={() => setIsLiveAbsenOpen(true)}
              className="w-full h-[38px] inline-flex items-center justify-center gap-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-[0.98]"
            >
              <ScanFace size={18} className="shrink-0" />
              <span className="whitespace-nowrap">Absen Sekarang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Tabel Log & Side Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Tabel Data Log Kehadiran */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary-dark">
              Catatan Log Presensi Harian
            </h2>
            <span className="text-xs font-semibold text-slate-500 font-mono tabular-nums">
              Total <strong className="text-slate-800">{attendanceLog.length}</strong> hari tercatat
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-xs text-white uppercase bg-primary-dark font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-white">Tanggal</th>
                    <th scope="col" className="px-6 py-3.5 text-white">Shift Dinas</th>
                    <th scope="col" className="px-6 py-3.5 text-center text-white">Masuk (WIB)</th>
                    <th scope="col" className="px-6 py-3.5 text-center text-white">Pulang (WIB)</th>
                    <th scope="col" className="px-6 py-3.5 text-right text-white">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded-md w-28" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded-md w-24" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="h-6 bg-slate-100 rounded-lg mx-auto w-16" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="h-6 bg-slate-100 rounded-lg mx-auto w-16" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="h-4 bg-slate-100 rounded-md w-20 ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : attendanceLog.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
                      >
                        Belum ada catatan presensi pada periode bulan terpilih.
                      </td>
                    </tr>
                  ) : (
                    attendanceLog.map((log, idx) => (
                      <tr
                        key={idx}
                        className="gsap-absensi-table-row hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 text-xs">
                            {log.date}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/70">
                            {log.shift}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/60 tabular-nums">
                            <LogIn size={13} /> {log.in}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-primary-dark bg-blue-50 px-3 py-1 rounded-lg border border-blue-200/60 tabular-nums">
                            <LogOutIcon size={13} /> {log.out}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              log.status === "Tepat Waktu"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : log.status === "Terlambat"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Summary Panel Eksekutif & 3 Aktivitas Terkini */}
        <div className="gsap-absensi-side lg:col-span-4 space-y-6">
          {/* Navy Hospital Summary Panel */}
          <div className="rounded-2xl p-6 text-white shadow-xs relative overflow-hidden bg-primary-dark border border-slate-700/50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-xl text-blue-200">
                  <Calendar size={16} />
                </div>
                <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                  Ringkasan Bulan Ini
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-blue-200/80">
                {MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label} {selectedYear}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <div>
                  <p className="text-xs font-semibold text-blue-200">Total Hadir</p>
                  <p className="text-[10px] text-blue-300/70">Presensi tercatat sukses</p>
                </div>
                {isLoading ? (
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                ) : (
                  <span className="text-3xl font-bold font-mono leading-none tabular-nums text-white">
                    {stats.hadir < 10 ? `0${stats.hadir}` : stats.hadir}{" "}
                    <span className="text-xs text-blue-200 font-semibold">HARI</span>
                  </span>
                )}
              </div>

              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <div>
                  <p className="text-xs font-semibold text-blue-200">Terlambat</p>
                  <p className="text-[10px] text-blue-300/70">Melebihi toleransi shift</p>
                </div>
                {isLoading ? (
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                ) : (
                  <span className="text-3xl font-bold font-mono text-amber-300 leading-none tabular-nums">
                    {stats.terlambat < 10 ? `0${stats.terlambat}` : stats.terlambat}{" "}
                    <span className="text-xs text-blue-200 font-semibold">HARI</span>
                  </span>
                )}
              </div>

              <div className="flex justify-between items-end pt-1">
                <div>
                  <p className="text-xs font-semibold text-blue-200">Tingkat Ketepatan</p>
                  <p className="text-[10px] text-blue-300/70">Skor performa waktu</p>
                </div>
                {isLoading ? (
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                ) : (
                  <span className="text-3xl font-bold font-mono text-emerald-300 leading-none tabular-nums">
                    {stats.score}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mini Activity List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <Clock size={14} className="text-primary" />
                <span>Aktivitas Terkini</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                3 Hari Terakhir
              </span>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl animate-pulse"
                  >
                    <div className="h-10 w-10 bg-slate-200 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-2 bg-slate-200 rounded w-1/3" />
                    </div>
                  </div>
                ))
              ) : attendanceLog.length === 0 ? (
                <div className="py-6 text-center text-xs font-semibold text-slate-400">
                  Belum ada data presensi terkini.
                </div>
              ) : (
                attendanceLog.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 hover:bg-white hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-primary shadow-xs">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">
                          {item.date}
                        </p>
                        <p className="text-[11px] font-mono font-semibold text-slate-500 tabular-nums mt-0.5">
                          {item.in} WIB &bull; {item.shift}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[11px] font-semibold leading-tight rounded-full ${
                        item.status === "Tepat Waktu"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Live Absen Biometrik Wajah (Standard Modal Layout) */}
      {isLiveAbsenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh] border border-slate-200">
            {/* Header Modal Mengikuti Standar Admin #05445e */}
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-primary-dark text-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 text-white rounded-xl flex items-center justify-center">
                  <ScanFace size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Presensi Mandiri</h3>
                  <p className="text-[11px] text-blue-200 font-medium">
                    Verifikasi Biometrik Wajah &amp; GPS RSU Avisena
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-rose-500 transition-colors"
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>

            {!gpsUnlocked ? (
              <div className="p-6 overflow-y-auto">
                <GpsGatePanel gps={gps} theme="light" />
              </div>
            ) : (
              <>
                <div className="relative flex-1 bg-slate-900 min-h-[300px] flex items-center justify-center overflow-hidden">
                  {!isCameraReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                      <p className="text-xs text-slate-300 font-semibold">Menghubungkan Kamera...</p>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedData={() => {
                      if (videoRef.current && videoRef.current.readyState >= 2) {
                        setIsCameraReady(true);
                      }
                    }}
                    onPlaying={() => setIsCameraReady(true)}
                    className={`w-full h-full object-cover ${!isCameraReady ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                    style={{ transform: "scaleX(-1)" }}
                  />

                  {/* Frame Guideline */}
                  {isCameraReady && scanStatus === "idle" && (
                    <>
                      <div
                        className={`absolute inset-0 border-[3px] m-8 rounded-[36px] pointer-events-none transition-colors duration-300 ${
                          isFaceLocked ? "border-emerald-400/50" : "border-white/20"
                        }`}
                      >
                        <div
                          className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-[34px] transition-colors duration-300 ${
                            isFaceLocked ? "border-emerald-400" : "border-primary"
                          }`}
                        />
                        <div
                          className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-[34px] transition-colors duration-300 ${
                            isFaceLocked ? "border-emerald-400" : "border-primary"
                          }`}
                        />
                        <div
                          className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-[34px] transition-colors duration-300 ${
                            isFaceLocked ? "border-emerald-400" : "border-primary"
                          }`}
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-[34px] transition-colors duration-300 ${
                            isFaceLocked ? "border-emerald-400" : "border-primary"
                          }`}
                        />
                      </div>
                      <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                        <span
                          className={`px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border transition-all duration-300 ${
                            isFaceLocked
                              ? "bg-emerald-500/90 text-white border-emerald-300/60 shadow-lg"
                              : "bg-slate-900/65 text-white/85 border-white/15"
                          }`}
                        >
                          {isFaceLocked ? "Wajah Terdeteksi • Siap Absen" : "Mendeteksi Wajah..."}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Status Overlays */}
                  {scanStatus === "scanning" && (
                    <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                      <ScanFace className="w-16 h-16 text-white animate-pulse mb-3" />
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        {scanResultMsg}
                      </p>
                    </div>
                  )}
                  {scanStatus === "success" && (
                    <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-white p-6">
                      <CheckCircle2 className="w-16 h-16 mb-3" />
                      <p className="text-sm font-bold text-center">{scanResultMsg}</p>
                    </div>
                  )}
                  {scanStatus === "error" && (
                    <div className="absolute inset-0 bg-rose-600/90 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-white p-6">
                      <AlertCircle className="w-16 h-16 mb-3" />
                      <p className="text-xs font-bold text-center leading-relaxed">
                        {scanResultMsg}
                      </p>
                    </div>
                  )}
                  {scanStatus === "info" && (
                    <div className="absolute inset-0 bg-[#0173b6]/95 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-white p-6">
                      <AlertCircle className="w-16 h-16 mb-3" />
                      <p className="text-xs font-bold text-center leading-relaxed">
                        {scanResultMsg}
                      </p>
                    </div>
                  )}
                  {scanStatus === "early" && (
                    <div className="absolute inset-0 bg-amber-600/95 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-white p-6 text-center">
                      <AlertCircle className="w-14 h-14 mb-3" />
                      <p className="text-xs font-bold mb-4 leading-relaxed">
                        {scanResultMsg}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setScanStatus("idle");
                            setCachedDescriptor(null);
                          }}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all min-h-[44px]"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleScanAbsen("out", true, false)}
                          className="px-4 py-2 bg-white text-amber-700 rounded-xl text-xs font-bold shadow-lg transition-all min-h-[44px]"
                        >
                          Tetap Pulang
                        </button>
                      </div>
                    </div>
                  )}
                  {scanStatus === "unresolved_checkout" && (
                    <div className="absolute inset-0 bg-slate-800/95 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-white p-6 text-center">
                      <Clock className="w-14 h-14 text-amber-400 mb-3" />
                      <p className="text-xs font-bold mb-4 leading-relaxed">
                        {scanResultMsg}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleScanAbsen("out", false, false)}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all min-h-[44px]"
                        >
                          Keluar Shift Sebelumnya
                        </button>
                        <button
                          onClick={() => handleScanAbsen("in", false, true)}
                          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg transition-all min-h-[44px]"
                        >
                          Masuk Shift Baru
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
                  <div className="flex gap-3 w-full">
                    <button
                      disabled={scanStatus !== "idle" || !isCameraReady}
                      onClick={() => handleScanAbsen("in")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-[44px]"
                    >
                      <LogIn size={16} />
                      <span>Absen Masuk</span>
                    </button>
                    <button
                      disabled={scanStatus !== "idle" || !isCameraReady}
                      onClick={() => handleScanAbsen("out")}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-[44px]"
                    >
                      <LogOutIcon size={16} />
                      <span>Absen Pulang</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-center font-semibold text-slate-400 uppercase tracking-wider">
                    Posisikan wajah Anda terlihat jelas di dalam area bingkai
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
