/**
 * Path: app/(kiosk)/absensi/page.tsx
 * Deskripsi: Halaman khusus Kiosk Absensi dengan perbaikan Hydration Error
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  Wifi,
  User,
  ShieldCheck,
} from "lucide-react";

type KioskStatus = "standby" | "scanning" | "success" | "error";

export default function KioskAbsensiPage() {
  const [status, setStatus] = useState<KioskStatus>("standby");
  const [currentTime, setCurrentTime] = useState<Date | null>(null); // Mulai dengan null untuk hindari hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [mockUser, setMockUser] = useState<any>(null);

  // 1. Pastikan komponen sudah mounted di browser
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulasi Proses Scan
  const simulateScan = (isSuccessful: boolean) => {
    setStatus("scanning");

    setTimeout(() => {
      if (isSuccessful) {
        setMockUser({
          nama: "Naufal Habib Hakim",
          nip: "1208573",
          jabatan: "Koordinator IT",
          waktu: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        setStatus("success");

        setTimeout(() => {
          setStatus("standby");
          setMockUser(null);
        }, 4000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("standby"), 3000);
      }
    }, 1500);
  };

  // Jangan render konten yang bergantung pada waktu/client-side sebelum mounted
  if (!mounted || !currentTime) {
    return (
      <div className="min-h-screen bg-[#001b3a] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-dark" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001b3a] text-white font-sans flex flex-col overflow-hidden relative">
      {/* Background Ornamen */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[100px]"></div>

      {/* Header Kiosk */}
      <header className="p-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-primary-dark font-black text-2xl italic">
              A
            </span>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter leading-none uppercase">
              Alice Attendance
            </h2>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-1">
              RSU Avisena Kiosk System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <MapPin size={16} className="text-blue-400" />
            <span className="text-xs font-black uppercase tracking-widest">
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* JAM DIGITAL (SENSITIF HYDRATION) */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 text-blue-400 mb-4 font-bold uppercase tracking-[0.6em] text-xs">
            <Clock size={16} />
            <span>
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-[140px] font-black leading-none tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            {currentTime.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </h1>
        </div>

        {/* AREA SCANNER / FEEDBACK */}
        <div className="w-full max-w-3xl">
          {status === "standby" && (
            <div
              onClick={() => simulateScan(true)}
              className="bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/10 rounded-[60px] p-20 text-center cursor-pointer hover:bg-white/10 hover:border-primary transition-all group"
            >
              <div className="relative inline-block mb-10">
                <QrCode
                  size={140}
                  className="text-white/10 group-hover:text-primary transition-colors duration-500"
                />
                <div className="absolute inset-0 border-4 border-primary/30 rounded-3xl animate-ping opacity-20"></div>
                <div className="absolute inset-0 border-2 border-primary rounded-3xl animate-pulse"></div>
              </div>
              <h3 className="text-3xl font-black tracking-tighter mb-3 uppercase">
                Siap Memindai
              </h3>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                Tunjukkan QR Code Anda ke Kamera
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  simulateScan(false);
                }}
                className="mt-12 text-[10px] font-black text-white/10 uppercase tracking-[0.3em] hover:text-red-500 transition-colors"
              >
                Simulasi Gagal
              </button>
            </div>
          )}

          {status === "scanning" && (
            <div className="bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-[60px] p-24 text-center flex flex-col items-center shadow-2xl">
              <div className="relative">
                <Loader2
                  size={100}
                  className="text-primary animate-spin mb-10"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">
                Memproses...
              </h3>
              <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">
                Sedang Memverifikasi Keamanan
              </p>
            </div>
          )}

          {status === "success" && mockUser && (
            <div className="bg-emerald-600 rounded-[60px] p-12 text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] animate-in zoom-in duration-500 relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] opacity-10">
                <CheckCircle2 size={300} />
              </div>

              <div className="flex items-center gap-12 relative z-10">
                <div className="w-56 h-56 rounded-[48px] border-[12px] border-white/20 overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md">
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={100} className="text-white/50" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-6 bg-white/20 w-fit px-5 py-2 rounded-2xl border border-white/30 backdrop-blur-md">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">
                      Absensi Berhasil
                    </span>
                  </div>
                  <h2 className="text-6xl font-black tracking-tighter mb-2 leading-none">
                    {mockUser.nama}
                  </h2>
                  <p className="text-2xl font-bold text-emerald-100 mb-8 uppercase tracking-widest">
                    {mockUser.jabatan}
                  </p>

                  <div className="grid grid-cols-2 gap-10 border-t border-white/20 pt-8">
                    <div>
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">
                        Pukul
                      </p>
                      <p className="text-4xl font-mono font-black">
                        {mockUser.waktu}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">
                        Keterangan
                      </p>
                      <p className="text-2xl font-black uppercase tracking-tight">
                        Tepat Waktu
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-600 rounded-[60px] p-20 text-white text-center shadow-[0_20px_50px_rgba(220,38,38,0.3)] animate-shake">
              <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-10 backdrop-blur-md border border-white/30">
                <XCircle size={60} />
              </div>
              <h3 className="text-5xl font-black tracking-tighter mb-4 uppercase">
                Akses Ditolak
              </h3>
              <p className="text-red-100 text-xl font-bold px-12 leading-relaxed">
                QR Code tidak dikenal atau sesi Anda telah berakhir. Silakan
                muat ulang halaman profil di ponsel Anda.
              </p>
              <div className="mt-12 flex items-center justify-center gap-2 text-white/40">
                <Loader2 size={14} className="animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Mereset dalam 3 detik
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-10 text-center relative z-10 border-t border-white/5">
        <p className="text-white/10 text-[11px] font-black uppercase tracking-[0.8em]">
          RSU Avisena • Fallen Digital Solution • 2026
        </p>
      </footer>

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-15px);
          }
          75% {
            transform: translateX(15px);
          }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
