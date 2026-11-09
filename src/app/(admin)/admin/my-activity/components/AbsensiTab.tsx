"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  LogIn,
  LogOut as LogOutIcon,
  Filter,
  Camera,
  X,
  Loader2,
  ScanFace,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Clock,
  Check,
} from "lucide-react";
import { useGpsGate } from "@/app/lib/useGpsGate";
import GpsGatePanel from "@/app/components/absensi/GpsGatePanel";

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
}

type ScanStatus =
  | "idle"
  | "scanning"
  | "success"
  | "error"
  | "early"
  | "unresolved_checkout"
  | "info";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export default function AbsensiTab() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
  const faceapiRef = useRef<any>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const gps = useGpsGate(isLiveAbsenOpen);
  const gpsUnlocked = gps.isReady && gps.inArea;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  // Waktu absensi di database diselaraskan +7 jam ke zona waktu WIB (Asia/Jakarta)
  const toWibDate = (timeStr?: string | null): Date | null => {
    if (!timeStr) return null;
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getTime() + 7 * 60 * 60 * 1000);
  };

  const extractTime = (timeStr?: string | null): string => {
    if (!timeStr) return "-";
    try {
      const timePart = timeStr.includes("T")
        ? timeStr.substring(11, 16)
        : timeStr.includes(" ")
        ? timeStr.split(" ")[1]?.substring(0, 5)
        : timeStr.substring(0, 5);

      if (timePart && timePart.includes(":")) {
        const [rawH, rawM] = timePart.split(":").map(Number);
        if (!isNaN(rawH) && !isNaN(rawM)) {
          const adjustedHour = String((rawH + 7) % 24).padStart(2, "0");
          const adjustedMinute = String(rawM).padStart(2, "0");
          return `${adjustedHour}:${adjustedMinute}`;
        }
      }

      const wibDate = toWibDate(timeStr);
      if (wibDate) {
        const hours = String(wibDate.getUTCHours()).padStart(2, "0");
        const minutes = String(wibDate.getUTCMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      }

      return "-";
    } catch {
      return "-";
    }
  };

  const fetchAbsensi = async (kId: string, month: number, year: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/absensi/${kId}?month=${month}&year=${year}`);
      if (response.ok) {
        const rawData: RawAttendanceApiItem[] = await response.json();
        let hadirCount = 0;
        let terlambatCount = 0;

        const formattedLogs: AttendanceRecord[] = rawData.map((item) => {
          const dateObj = new Date(item.tanggal);
          const dateStr = dateObj.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "short",
          });

          const inTime = extractTime(item.jam_masuk);
          const outTime = extractTime(item.jam_keluar);
          const jamKeluarWib = toWibDate(item.jam_keluar);
          const jamMasukWib = toWibDate(item.jam_masuk);

          let status: AttendanceRecord["status"] = "Tepat Waktu";
          if (item.menit_terlambat && item.menit_terlambat > 0) {
            status = "Terlambat";
            terlambatCount++;
          } else if (item.jam_keluar && jamKeluarWib && jamMasukWib) {
            if (jamKeluarWib.getUTCHours() < 17) {
              status = "Pulang Cepat";
            }
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
            ? 0
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
  };

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
      console.error("Gagal membaca user:", e);
    }
  }, [selectedMonth, selectedYear]);

  // Load Models & Kamera saat Live Absen Aktif
  useEffect(() => {
    if (!isLiveAbsenOpen || !gpsUnlocked) return;

    let activeStream: MediaStream | null = null;
    let isMounted = true;

    const setupCamera = async () => {
      try {
        const fa = await import("@vladmandic/face-api");
        if (isMounted) faceapiRef.current = fa;

        await Promise.all([
          fa.nets.tinyFaceDetector.loadFromUri("/models"),
          fa.nets.faceLandmark68Net.loadFromUri("/models"),
          fa.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);

        if (navigator.mediaDevices?.getUserMedia && isMounted) {
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = activeStream;
            setIsCameraReady(true);
          }
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
      setIsCameraReady(false);
      setScanStatus("idle");
      setScanResultMsg("");
      setCachedDescriptor(null);
    };
  }, [isLiveAbsenOpen, gpsUnlocked]);

  const handleScanAbsen = async (
    type: "in" | "out",
    forceEarlyOut = false,
    forceNewCheckIn = false
  ) => {
    if (scanStatus === "scanning") return;
    if (!videoRef.current && !cachedDescriptor) return;
    if (!karyawanId) return;

    setScanStatus("scanning");
    setScanResultMsg("Memverifikasi biometrik wajah...");

    setTimeout(async () => {
      try {
        let faceDescriptor = cachedDescriptor;
        if (!faceDescriptor) {
          const faceapi = faceapiRef.current;
          if (!faceapi) return;

          const detection = await faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.4 })
            )
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!detection) {
            setScanStatus("error");
            setScanResultMsg("Wajah tidak terdeteksi. Posisikan wajah Anda tegak ke arah kamera.");
            setTimeout(() => {
              setScanStatus("idle");
              setScanResultMsg("");
            }, 3000);
            return;
          }
          faceDescriptor = Array.from(detection.descriptor);
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
          setScanResultMsg(resData.message || "Wajah tidak cocok dengan data terdaftar.");
          setTimeout(() => {
            setScanStatus("idle");
            setScanResultMsg("");
          }, 4000);
        } else {
          setScanStatus("success");
          setCachedDescriptor(null);
          setScanResultMsg(resData.message || "Presensi berhasil dicatat.");
          setTimeout(() => {
            setIsLiveAbsenOpen(false);
            if (karyawanId) {
              fetchAbsensi(karyawanId, selectedMonth, selectedYear);
            }
          }, 1800);
        }
      } catch (error) {
        console.error(error);
        setScanStatus("error");
        setScanResultMsg("Terjadi gangguan koneksi sistem.");
        setTimeout(() => {
          setScanStatus("idle");
          setScanResultMsg("");
        }, 3000);
      }
    }, 400);
  };

  function logDateOnly(fullDate: string) {
    if (!fullDate || !fullDate.includes(",")) return fullDate;
    return fullDate.split(",")[1].trim();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sisi Kiri: Log Kehadiran Utama */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <div className="h-5 w-1.5 bg-primary rounded-full"></div>
                Log Kehadiran Bulanan
              </h2>
              <p className="text-slate-500 text-xs font-medium mt-1">
                Catatan jam masuk dan jam keluar berdasarkan biometrik wajah serta geofence RSU Avisena.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Tombol Absen Sekarang */}
              <button
                onClick={() => setIsLiveAbsenOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-[0.98] min-h-[40px]"
              >
                <Camera size={15} />
                <span>Absen Sekarang</span>
              </button>

              {/* Filter Periode */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all text-xs font-bold min-h-[40px] active:scale-[0.98] ${
                    isFilterOpen
                      ? "bg-slate-100 text-slate-900 border-slate-300"
                      : "bg-slate-50 text-slate-700 border-slate-200/90 hover:text-primary hover:bg-white"
                  }`}
                >
                  <Filter size={14} />
                  <span>
                    {MONTHS[selectedMonth - 1]} {selectedYear}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Pilih Periode Presensi
                    </span>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {MONTHS.map((m, i) => (
                          <option key={i} value={i + 1}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {Array.from({ length: 5 }).map((_, i) => (
                          <option key={i} value={currentDate.getFullYear() - i}>
                            {currentDate.getFullYear() - i}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full py-2 bg-blue-50 text-primary font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>Terapkan</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabel Log Kehadiran Mengikuti Standar Admin Pegawai */}
          <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-xs text-white uppercase bg-primary-dark font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Tanggal</th>
                    <th scope="col" className="px-6 py-3.5">Shift Kerja</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Masuk (WIB)</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Pulang (WIB)</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded-md w-28" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded-md w-20" />
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
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 text-xs">
                            {log.date}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200/60">
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
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-tight ${
                              log.status === "Tepat Waktu"
                                ? "bg-emerald-100 text-emerald-800"
                                : log.status === "Terlambat"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
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
      </div>

      {/* Sisi Kanan: Summary Panel & Aktivitas Terakhir */}
      <div className="lg:col-span-4 space-y-6">
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
              {MONTHS[selectedMonth - 1]} {selectedYear}
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
                        {logDateOnly(item.date)}
                      </p>
                      <p className="text-[11px] font-mono font-semibold text-slate-500 tabular-nums mt-0.5">
                        {item.in} WIB
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[11px] font-semibold leading-tight rounded-full ${
                      item.status === "Tepat Waktu"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
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

      {/* Modal Live Absen Biometrik Wajah */}
      {isLiveAbsenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh] border border-slate-100">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center">
                  <ScanFace size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Presensi Mandiri</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Verifikasi Biometrik Wajah & GPS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLiveAbsenOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
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
                      <p className="text-xs text-slate-300">Menghubungkan Kamera...</p>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isCameraReady ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                    style={{ transform: "scaleX(-1)" }}
                  />

                  {/* Frame Guideline */}
                  {isCameraReady && scanStatus === "idle" && (
                    <div className="absolute inset-0 border-[3px] border-white/20 m-8 rounded-[36px] pointer-events-none">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-[34px]" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-[34px]" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-[34px]" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-[34px]" />
                    </div>
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
                  {scanStatus === "early" && (
                    <div className="absolute inset-0 bg-amber-600/95 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-white p-6 text-center">
                      <AlertCircle className="w-14 h-14 mb-3" />
                      <p className="text-xs font-bold mb-4 leading-relaxed">
                        {scanResultMsg}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setScanStatus("idle")}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleScanAbsen("out", true, false)}
                          className="px-4 py-2 bg-white text-amber-700 rounded-xl text-xs font-bold shadow-lg transition-all"
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
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all"
                        >
                          Keluar Shift Sebelumnya
                        </button>
                        <button
                          onClick={() => handleScanAbsen("in", false, true)}
                          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg transition-all"
                        >
                          Masuk Shift Baru
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex gap-3 w-full">
                    <button
                      disabled={scanStatus !== "idle" || !isCameraReady}
                      onClick={() => handleScanAbsen("in")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-[44px]"
                    >
                      <LogIn size={16} /> Absen Masuk
                    </button>
                    <button
                      disabled={scanStatus !== "idle" || !isCameraReady}
                      onClick={() => handleScanAbsen("out")}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] min-h-[44px]"
                    >
                      <LogOutIcon size={16} /> Absen Pulang
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
