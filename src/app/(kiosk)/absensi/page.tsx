"use client";

import React, { useEffect, useState, useRef } from "react";
import { Camera, Clock, CheckCircle2, AlertCircle, ScanFace, MapPin, Wifi, Loader2, User, ShieldCheck } from "lucide-react";

export default function KioskAbsensiPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "error" | "early">("idle");
  const [cachedDescriptor, setCachedDescriptor] = useState<number[] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mockUser, setMockUser] = useState<any>(null);
  const faceapiRef = useRef<any>(null);

  // NIP Flow States
  const [step, setStep] = useState<"input-nip" | "camera">("input-nip");
  const [nipInput, setNipInput] = useState("");
  const [karyawanInfo, setKaryawanInfo] = useState<{id: string, nama_lengkap: string} | null>(null);
  const [nipError, setNipError] = useState("");
  const [isCheckingNip, setIsCheckingNip] = useState(false);

  const handleCheckNip = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nipInput) {
      setNipError("NIP tidak boleh kosong");
      return;
    }
    setIsCheckingNip(true);
    setNipError("");
    try {
      const res = await fetch("/api/absensi/check-nip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip: nipInput })
      });
      const data = await res.json();
      if (!res.ok) {
        setNipError(data.message || "NIP tidak ditemukan");
      } else {
        setKaryawanInfo(data);
        setStep("camera");
      }
    } catch (e) {
      setNipError("Terjadi kesalahan jaringan");
    } finally {
      setIsCheckingNip(false);
    }
  };

  // Hydration fix & Live Clock
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Load AI Models dynamically to avoid SSR TextEncoder error
    const loadModels = async () => {
      try {
        const fa = await import("@vladmandic/face-api");
        faceapiRef.current = fa;
        const MODEL_URL = "/models";
        await Promise.all([
          fa.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          fa.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          fa.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("Model Kiosk AI Loaded");
      } catch (err) {
        console.error("Gagal memuat model:", err);
      }
    };
    loadModels();

    return () => clearInterval(timer);
  }, []);

  // Membuka akses kamera (Visualisasi)
  useEffect(() => {
    if (isClient && step === "camera" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      let activeStream: MediaStream | null = null;
      navigator.mediaDevices
        .getUserMedia({ 
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: "user"
          } 
        })
        .then((stream) => {
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Akses kamera ditolak atau tidak tersedia:", err);
        });

      // Cleanup stream when component unmounts or step changes
      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [isClient, step]);

  // Proses absensi (AI Scan)
  const handleScanAbsen = async (type: "in" | "out", forceEarlyOut: boolean = false, forceNewCheckIn: boolean = false) => {
    if (scanStatus === "scanning") return;
    if (!videoRef.current && !cachedDescriptor) return;
    
    setScanStatus("scanning");
    
    // Trik UI Unblocking: Beri jeda 100ms agar browser bisa menggambar layar biru dulu sebelum AI membajak Main Thread
    setTimeout(async () => {
      try {
        let faceDescriptor = cachedDescriptor;
        if (!faceDescriptor) {
            const faceapi = faceapiRef.current;
            if (!faceapi) return;

            // 1. Deteksi Wajah dari Kiosk
            const detection = await faceapi
              .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (!detection) {
              setScanStatus("error");
              setMockUser({ errorMessage: "Wajah tidak terdeteksi. Silakan coba lagi." });
              setTimeout(() => { setScanStatus("idle"); setMockUser(null); }, 4000);
              return;
            }
            faceDescriptor = Array.from(detection.descriptor);
        }

        // 2. Kirim descriptor ke API Backend untuk pencocokan & absensi
        const response = await fetch("/api/absensi/verify-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descriptor: faceDescriptor, type, forceEarlyOut, forceNewCheckIn, karyawan_id: karyawanInfo?.id }),
        });

        const resData = await response.json();

        if (!response.ok) {
          if (resData.isEarly) {
             setCachedDescriptor(faceDescriptor);
             setScanStatus("early");
             setMockUser({ nama: resData.user.nama, errorMessage: resData.message });
             return; // Jangan di-reset otomatis
          }
          if (resData.isUnresolvedCheckout) {
             setCachedDescriptor(faceDescriptor);
             setScanStatus("unresolved_checkout");
             setMockUser({ nama: resData.user.nama, errorMessage: resData.message });
             return; // Jangan di-reset otomatis
          }
          setScanStatus("error");
          setCachedDescriptor(null);
          setMockUser({ errorMessage: resData.message || "Wajah tidak dikenali." });
          setTimeout(() => { setScanStatus("idle"); setMockUser(null); }, 5000);
        } else {
          setScanStatus("success");
          setCachedDescriptor(null);
          setMockUser({
            nama: resData.user.nama,
            jabatan: resData.user.jabatan,
            waktu: resData.user.waktu,
            status: resData.user.status,
            type: resData.type
          });
          setTimeout(() => { setScanStatus("idle"); setMockUser(null); }, 5000);
        }

      } catch (error) {
        console.error(error);
        setScanStatus("error");
        setCachedDescriptor(null);
        setMockUser({ errorMessage: "Terjadi kesalahan sistem." });
        setTimeout(() => { setScanStatus("idle"); setMockUser(null); }, 5000);
      }
    }, 100);
  };

  if (!isClient || !currentTime) return (
    <div className="min-h-screen bg-[#001b3a] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#001b3a] flex flex-col font-sans text-slate-100 overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#0173b6]/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* HEADER */}
      <header className="relative z-10 px-8 py-6 flex justify-between items-center bg-[#001b3a]/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <ScanFace size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-white">
              Alice
            </h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-1">
              Smart Attendance System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <MapPin size={16} className="text-blue-400" />
            <span className="text-xs font-black uppercase tracking-widest text-white">
              Lobby Utama
            </span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Wifi size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              System Online
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 lg:p-6 w-full max-w-4xl mx-auto">
        
        {/* Waktu Digital */}
        <div className="text-center mb-6 lg:mb-10 lg:mt-[-40px]">
          <div className="flex items-center justify-center gap-2 lg:gap-3 text-blue-400 mb-2 font-bold uppercase tracking-[0.4em] lg:tracking-[0.6em] text-[10px]">
            <Clock size={14} />
            <span>
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black leading-none tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] font-mono">
            {currentTime.toLocaleTimeString("id-ID", {
              hour: "2-digit", minute: "2-digit", second: "2-digit"
            })}
          </h1>
        </div>

        {step === "input-nip" ? (
          <div className="w-full max-w-md bg-white/5 p-6 lg:p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <User size={32} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-black text-center mb-2">Identifikasi Diri</h2>
            <p className="text-sm text-slate-400 text-center mb-8">Masukkan Nomor Induk Pegawai (NIP) Anda sebelum melakukan pemindaian wajah.</p>
            
            <form onSubmit={handleCheckNip} className="flex flex-col gap-4">
              <div>
                <input 
                  type="text"
                  name="nip"
                  id="nip"
                  autoComplete="username"
                  value={nipInput}
                  onChange={(e) => setNipInput(e.target.value)}
                  placeholder="Ketik NIP Anda di sini..."
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-center text-xl font-bold tracking-widest text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  autoFocus
                />
                {nipError && <p className="text-rose-400 text-xs font-bold text-center mt-2 animate-shake">{nipError}</p>}
              </div>
              <button 
                type="submit"
                disabled={isCheckingNip}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-center gap-2"
              >
                {isCheckingNip ? <Loader2 size={18} className="animate-spin" /> : "Lanjut Verifikasi Wajah"}
              </button>
            </form>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
            <div className="mb-6 flex items-center justify-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md">
               <User size={16} className="text-emerald-400" />
               <span className="text-sm font-bold">Halo, {karyawanInfo?.nama_lengkap}</span>
               <button onClick={() => { setStep("input-nip"); setNipInput(""); }} className="ml-2 text-[10px] bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider hover:bg-white/20 transition-colors">Ganti</button>
            </div>

        {/* Camera Container */}
        <div className="relative group mx-auto w-fit">
          {/* Border Frame for Camera */}
          <div className={`absolute -inset-2 rounded-[40px] blur-xl transition-all duration-700 ${
            scanStatus === "idle" ? "bg-blue-600/20 group-hover:bg-blue-500/40" :
            scanStatus === "scanning" ? "bg-blue-500/60 animate-pulse" :
            scanStatus === "success" ? "bg-emerald-500/60" :
            "bg-rose-500/60"
          }`}></div>
          
          <div className="relative w-[300px] h-[400px] lg:w-[400px] lg:h-[500px] bg-black/50 rounded-[32px] overflow-hidden border-2 border-white/10 shadow-2xl flex items-center justify-center backdrop-blur-md cursor-pointer">
            
            {/* Video Element */}
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform scale-x-[-1] opacity-80" 
            />

            {/* Placeholder jika tidak ada video */}
            {!videoRef.current?.srcObject && scanStatus !== "error" && scanStatus !== "success" && scanStatus !== "early" && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                 <Camera size={80} className="mb-6 opacity-30" />
                 <p className="text-xs font-bold uppercase tracking-[0.2em] text-center px-10">Kamera tidak terdeteksi.<br/><span className="text-[10px] text-white/30">Klik untuk simulasi absensi.</span></p>
               </div>
            )}

            {/* Standby Overlay UI */}
            {scanStatus === "idle" && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Face Guide Bracket */}
                    <div className="absolute top-[20%] bottom-[20%] left-[15%] right-[15%] border-2 border-dashed border-white/20 rounded-[100px] transition-all"></div>
                    <div className="absolute bottom-10 w-full text-center">
                        <span className="bg-black/50 text-white/80 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-xl">
                            Posisikan Wajah Di Tengah
                        </span>
                    </div>
                </div>
            )}

            {/* Scanning Overlay (HUD) */}
            {scanStatus === "scanning" && (
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="w-full h-full relative">
                  {/* Scanner line */}
                  <div className="absolute left-0 right-0 h-1 bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  
                  {/* Face Guide Highlighted */}
                  <div className="absolute top-[20%] bottom-[20%] left-[15%] right-[15%] border-2 border-blue-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.3)] rounded-[100px]"></div>
                  
                  {/* Grid / Dots overlay to make it look like AI */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                </div>
                <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[2px]"></div>
                <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-400/30">
                    <Loader2 size={18} className="animate-spin" /> Mengidentifikasi Biometrik...
                  </div>
                </div>
              </div>
            )}

            {/* Success Overlay */}
            {scanStatus === "success" && mockUser && (
              <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center animate-in fade-in zoom-in duration-300 z-30">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <div className="flex items-center gap-2 mb-4 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                    <ShieldCheck size={14} className="text-emerald-400"/>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-100">Identity Verified</span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-1">{mockUser.nama}</h2>
                <p className="text-emerald-200 text-xs font-bold tracking-widest uppercase mb-8">{mockUser.jabatan}</p>
                
                <div className="w-full bg-black/20 p-4 rounded-2xl border border-emerald-500/30 flex justify-between items-center">
                  <div className="text-left">
                     <span className="text-[10px] uppercase tracking-widest text-emerald-400 block mb-1">{mockUser.type || "Check-In"}</span>
                     <span className="text-2xl font-mono font-black leading-none">{mockUser.waktu}</span>
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] uppercase tracking-widest text-emerald-400 block mb-1">Status Kehadiran</span>
                     <span className="text-sm font-black uppercase tracking-widest text-white">{mockUser.status || "Tepat Waktu"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {scanStatus === "error" && (
              <div className="absolute inset-0 bg-rose-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center animate-in fade-in zoom-in duration-300 z-30 animate-shake">
                <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.5)] mb-6 border-4 border-rose-400/50">
                  <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-3">Wajah Tidak Dikenali</h2>
                <p className="text-rose-200 text-xs font-bold leading-relaxed px-4 opacity-80">
                  {mockUser?.errorMessage || "Sistem tidak dapat mencocokkan profil wajah. Pastikan Anda tidak menggunakan masker/kacamata gelap, atau pencahayaan cukup."}
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setScanStatus("idle"); setMockUser(null); setCachedDescriptor(null); }}
                  className="mt-8 bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-colors"
                >
                  Kembali
                </button>
              </div>
            )}

            {/* Early Check-Out Overlay (Amber) */}
            {scanStatus === "early" && (
              <div className="absolute inset-0 bg-amber-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center animate-in fade-in zoom-in duration-300 z-30 animate-shake">
                <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)] mb-6 border-4 border-amber-400/50">
                  <Clock size={40} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-3">Pulang Cepat?</h2>
                <p className="text-amber-200 text-xs font-bold leading-relaxed px-4 opacity-80 mb-2">
                  Halo {mockUser?.nama},
                </p>
                <p className="text-amber-200 text-[11px] font-bold leading-relaxed px-4 opacity-80">
                  {mockUser?.errorMessage}
                </p>
                <div className="flex gap-4 mt-8 w-full max-w-[300px]">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setScanStatus("idle"); setMockUser(null); setCachedDescriptor(null); }}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleScanAbsen("out", true); }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 border border-amber-400/50 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-colors"
                  >
                    Tetap Pulang
                  </button>
                </div>
              </div>
            )}

            {/* Unresolved Checkout Overlay (Indigo) */}
            {scanStatus === "unresolved_checkout" && (
              <div className="absolute inset-0 bg-indigo-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center animate-in fade-in zoom-in duration-300 z-30 animate-shake">
                <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] mb-4 border-4 border-indigo-400/50">
                  <AlertCircle size={30} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight mb-2">Sesi Menggantung</h2>
                <p className="text-indigo-200 text-[10px] font-bold leading-relaxed px-2 opacity-80 mb-4">
                  Halo {mockUser?.nama}, {mockUser?.errorMessage}
                </p>
                <div className="flex flex-col gap-3 w-full max-w-[300px]">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleScanAbsen("out"); }}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 border border-indigo-400/50 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-colors"
                  >
                    Check-Out Sesi Lama
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleScanAbsen("in", false, true); }}
                    className="w-full bg-rose-500 hover:bg-rose-600 border border-rose-400/50 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-colors"
                  >
                    Abaikan & Mulai Baru
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setScanStatus("idle"); setMockUser(null); setCachedDescriptor(null); }}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-8 flex gap-4 lg:gap-6 w-full max-w-lg mx-auto">
           <button 
             onClick={() => handleScanAbsen("in")} 
             disabled={scanStatus === "scanning"}
             className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#001b3a] py-4 lg:py-5 rounded-2xl font-black uppercase tracking-widest text-xs lg:text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
           >
               Check In
           </button>
           <button 
             onClick={() => handleScanAbsen("out")} 
             disabled={scanStatus === "scanning"}
             className="flex-1 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white py-4 lg:py-5 rounded-2xl font-black uppercase tracking-widest text-xs lg:text-sm transition-all shadow-lg shadow-rose-500/20 active:scale-95"
           >
               Check Out
           </button>
        </div>
        </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 p-6 text-center border-t border-white/5">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">
          RSU Avisena &bull; Alice Vision System &bull; {currentTime.getFullYear()}
        </p>
      </footer>

      {/* ANIMATIONS */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
