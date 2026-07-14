"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  LogIn,
  LogOut as LogOutIcon,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Camera,
  X,
  Loader2,
  ScanFace,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function AbsensiTab() {
  const [attendanceLog, setAttendanceLog] = useState<any[]>([]);
  const [stats, setStats] = useState({ hadir: 0, terlambat: 0, score: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [karyawanId, setKaryawanId] = useState<string | null>(null);
  
  // Live Absen States
  const [isLiveAbsenOpen, setIsLiveAbsenOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "error" | "early" | "unresolved_checkout" | "info">("idle");
  const [cachedDescriptor, setCachedDescriptor] = useState<number[] | null>(null);
  const [scanResultMsg, setScanResultMsg] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceapiRef = useRef<any>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const fetchAbsensi = async (kId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/absensi/${kId}`);
      if (response.ok) {
        const data = await response.json();
        let hadir = 0;
        let terlambat = 0;

        const formattedLogs = data.map((item: any) => {
          const dateObj = new Date(item.tanggal);
          const dateStr = dateObj.toLocaleDateString("id-ID", { weekday: 'long', day: '2-digit', month: 'short' });
          
          const extractTime = (timeStr: string) => {
             if (!timeStr) return "-";
             if (timeStr.includes("T")) return timeStr.substring(11, 16);
             const parts = timeStr.split(" ");
             if (parts.length > 1) return parts[1].substring(0, 5);
             return "-";
          };

          const inTime = extractTime(item.jam_masuk);
          const outTime = extractTime(item.jam_keluar);
          const jamKeluarObj = item.jam_keluar ? new Date(item.jam_keluar) : null;
          const jamMasukObj = item.jam_masuk ? new Date(item.jam_masuk) : null;
          
          let status = "Tepat Waktu";
          if (item.menit_terlambat > 0) {
             status = "Terlambat";
             terlambat++;
          } else if (item.jam_keluar && jamKeluarObj && jamMasukObj) {
             if (jamKeluarObj.getHours() < 17) {
                 status = "Pulang Cepat";
             }
          }
          hadir++;
          return { date: dateStr, shift: item.nama_shift || "Umum", in: inTime, out: outTime, status: status };
        });

        setAttendanceLog(formattedLogs);
        setStats({
          hadir,
          terlambat,
          score: hadir === 0 ? 0 : Math.round(((hadir - terlambat) / hadir) * 100)
        });
      }
    } catch (err) {
      console.error("Failed to fetch absensi", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) return;
    const user = JSON.parse(userString);
    if (!user.karyawan_id) return;
    setKaryawanId(user.karyawan_id);
    fetchAbsensi(user.karyawan_id);
  }, [baseUrl]);

  // Load Models
  useEffect(() => {
    if (!isLiveAbsenOpen) return;
    
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
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && isMounted) {
          activeStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" } 
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
        activeStream.getTracks().forEach(track => track.stop());
      }
      setIsCameraReady(false);
      setScanStatus("idle");
      setScanResultMsg("");
      setCachedDescriptor(null);
    };
  }, [isLiveAbsenOpen]);

  const handleScanAbsen = async (type: "in" | "out", forceEarlyOut: boolean = false, forceNewCheckIn: boolean = false) => {
    if (scanStatus === "scanning") return;
    if (!videoRef.current && !cachedDescriptor) return;
    if (!karyawanId) return;
    
    setScanStatus("scanning");
    setScanResultMsg("Memindai wajah...");
    
    setTimeout(async () => {
      try {
        let faceDescriptor = cachedDescriptor;
        if (!faceDescriptor) {
            const faceapi = faceapiRef.current;
            if (!faceapi) return;

            const detection = await faceapi
              .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (!detection) {
              setScanStatus("error");
              setScanResultMsg("Wajah tidak terdeteksi. Silakan coba lagi.");
              setTimeout(() => { setScanStatus("idle"); setScanResultMsg(""); }, 3000);
              return;
            }
            faceDescriptor = Array.from(detection.descriptor);
        }

        const response = await fetch("/api/absensi/verify-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descriptor: faceDescriptor, type, forceEarlyOut, forceNewCheckIn, karyawan_id: karyawanId }),
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
          setScanStatus("error");
          setCachedDescriptor(null);
          setScanResultMsg(resData.message || "Wajah tidak dikenali.");
          setTimeout(() => { setScanStatus("idle"); setScanResultMsg(""); }, 4000);
        } else {
          setScanStatus("success");
          setCachedDescriptor(null);
          setScanResultMsg(resData.message || "Absen berhasil!");
          setTimeout(() => { 
            setIsLiveAbsenOpen(false); 
            fetchAbsensi(karyawanId); // Refresh logs
          }, 2000);
        }
      } catch (error) {
        console.error(error);
        setScanStatus("error");
        setCachedDescriptor(null);
        setScanResultMsg("Terjadi kesalahan sistem.");
        setTimeout(() => { setScanStatus("idle"); setScanResultMsg(""); }, 4000);
      }
    }, 100);
  };



  function logDateOnly(fullDate: string) {
    if (!fullDate || !fullDate.includes(",")) return fullDate;
    return fullDate.split(",")[1].trim();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sisi Kiri: Main Content */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/40 border border-white p-8 md:p-10 relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none text-slate-900">
            <Calendar size={180} />
          </div>

          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
                Log Kehadiran Bulanan
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsLiveAbsenOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
                >
                  <Camera size={14} /> Absen Sekarang
                </button>
                <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 border border-slate-100 transition-all">
                  <Filter size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Tanggal</th>
                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Shift</th>
                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Masuk</th>
                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Pulang</th>
                    <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-2"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                        <td className="py-4 px-2"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                        <td className="py-4 px-2"><div className="h-6 bg-slate-100 rounded-lg mx-auto w-16"></div></td>
                        <td className="py-4 px-2"><div className="h-6 bg-slate-100 rounded-lg mx-auto w-16"></div></td>
                        <td className="py-4 px-2 flex justify-end"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                      </tr>
                    ))
                  ) : attendanceLog.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Belum ada log absensi bulan ini.
                      </td>
                    </tr>
                  ) : (
                    attendanceLog.map((log, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-2">
                          <span className="text-xs font-bold text-slate-700">{log.date}</span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{log.shift}</span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                            <LogIn size={12} /> {log.in}
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                            <LogOutIcon size={12} /> {log.out}
                          </div>
                        </td>
                        <td className="py-4 text-right px-2">
                          <span className={`text-[9px] font-black uppercase tracking-tight ${log.status === "Tepat Waktu" ? "text-emerald-500" : "text-amber-500"}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center">
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                Lihat Laporan Lengkap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Summary Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group border transition-all duration-500 bg-slate-900 border-slate-800">
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-white/10 rounded-lg">
              <Calendar size={14} />
            </div>
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Ringkasan Bulan Ini
            </h3>
          </div>
          <div className="space-y-5 relative z-10">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Hadir</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-800 rounded animate-pulse"></div>
              ) : (
                <span className="text-3xl font-black leading-none">
                  {stats.hadir < 10 ? `0${stats.hadir}` : stats.hadir} <span className="text-[10px] text-slate-500">HARI</span>
                </span>
              )}
            </div>
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Terlambat</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-800 rounded animate-pulse"></div>
              ) : (
                <span className="text-3xl font-black text-amber-500 leading-none">
                  {stats.terlambat < 10 ? `0${stats.terlambat}` : stats.terlambat} <span className="text-[10px] text-slate-500">KALI</span>
                </span>
              )}
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-emerald-400">
              <ArrowUpRight size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {isLoading ? "Menghitung Skor..." : `Skor Kehadiran: ${stats.score}%`}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-lg shadow-slate-200/40 p-6 flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
              Aktivitas Terakhir
            </h3>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl animate-pulse">
                  <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : (
              attendanceLog.slice(0, 3).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-400">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{logDateOnly(item.date)}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.in}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest ${item.status === "Tepat Waktu" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                    {item.status}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-300 font-bold text-[9px] uppercase tracking-widest">
              <ShieldCheck size={12} />
              <span>Alice Security Guard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Absen Modal */}
      {isLiveAbsenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <ScanFace size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Live Absen</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Self-Service</p>
                </div>
              </div>
              <button 
                onClick={() => setIsLiveAbsenOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Camera Area */}
            <div className="relative flex-1 bg-slate-900 min-h-[300px] flex items-center justify-center overflow-hidden">
              {!isCameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                  <p className="text-xs text-slate-400 font-medium">Menginisialisasi Kamera...</p>
                </div>
              )}
              
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className={`w-full h-full object-cover ${!isCameraReady ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                style={{ transform: "scaleX(-1)" }}
              />

              {/* Scan Overlay Guidelines */}
              {isCameraReady && scanStatus === "idle" && (
                <div className="absolute inset-0 border-[3px] border-white/20 m-8 rounded-[40px] pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-[38px]"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-[38px]"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-[38px]"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-[38px]"></div>
                </div>
              )}

              {/* Status Overlays */}
              {scanStatus === "scanning" && (
                <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
                  <ScanFace className="w-16 h-16 text-white animate-pulse mb-4" />
                  <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">{scanResultMsg}</p>
                </div>
              )}
              {scanStatus === "success" && (
                <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-20 h-20 text-white mb-4" />
                  <p className="text-sm font-bold text-white uppercase tracking-widest">{scanResultMsg}</p>
                </div>
              )}
              {scanStatus === "error" && (
                <div className="absolute inset-0 bg-rose-600/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-in zoom-in duration-300">
                  <AlertCircle className="w-20 h-20 text-white mb-4" />
                  <p className="text-sm font-bold text-white text-center px-6">{scanResultMsg}</p>
                </div>
              )}
              {scanStatus === "early" && (
                <div className="absolute inset-0 bg-amber-600/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-6 animate-in zoom-in duration-300">
                  <AlertCircle className="w-16 h-16 text-white mb-4" />
                  <p className="text-xs font-bold text-white text-center mb-6 leading-relaxed">{scanResultMsg}</p>
                  <div className="flex gap-3">
                    <button onClick={() => setScanStatus("idle")} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all">Batal</button>
                    <button onClick={() => handleScanAbsen("out", true, false)} className="px-4 py-2 bg-white text-amber-600 rounded-xl text-xs font-bold transition-all shadow-lg">Tetap Pulang</button>
                  </div>
                </div>
              )}
              {scanStatus === "unresolved_checkout" && (
                <div className="absolute inset-0 bg-purple-600/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-6 animate-in zoom-in duration-300">
                  <AlertCircle className="w-16 h-16 text-white mb-4" />
                  <p className="text-xs font-bold text-white text-center mb-6 leading-relaxed">{scanResultMsg}</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleScanAbsen("out", false, false)} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all">Keluar Shift Lama</button>
                    <button onClick={() => handleScanAbsen("in", false, true)} className="px-4 py-2 bg-white text-purple-600 rounded-xl text-xs font-bold transition-all shadow-lg">Masuk Shift Baru</button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3 shrink-0">
              <div className="flex gap-3 w-full">
                <button 
                  disabled={scanStatus !== "idle" || !isCameraReady}
                  onClick={() => handleScanAbsen("in")}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={16} /> Check In
                </button>
                <button 
                  disabled={scanStatus !== "idle" || !isCameraReady}
                  onClick={() => handleScanAbsen("out")}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <LogOutIcon size={16} /> Check Out
                </button>
              </div>
              <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest">
                Pastikan wajah Anda terlihat jelas dalam bingkai
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
