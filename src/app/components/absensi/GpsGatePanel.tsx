"use client";

import React from "react";
import { Loader2, MapPin, MapPinOff, LocateFixed, RefreshCw, ShieldAlert } from "lucide-react";
import { ABSENSI_GEOFENCE, formatDistance } from "@/app/lib/geofence";
import type { GpsGateState } from "@/app/lib/useGpsGate";

type Props = {
  gps: GpsGateState;
  theme?: "dark" | "light";
};

/**
 * Panel pengunci halaman absensi.
 * Ditampilkan selama GPS belum aktif / izin lokasi belum diberikan / user di luar area absensi.
 */
export default function GpsGatePanel({ gps, theme = "dark" }: Props) {
  const dark = theme === "dark";
  const { status, errorMessage, distance, inArea } = gps;

  const c = {
    card: dark
      ? "bg-white/5 border-white/10 text-slate-100 backdrop-blur-md shadow-2xl"
      : "bg-white border-slate-100 text-slate-800 shadow-sm",
    muted: dark ? "text-slate-400" : "text-slate-500",
    stepBox: dark ? "bg-black/30 border-white/10" : "bg-slate-50 border-slate-100",
    stepNum: dark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600",
    btnSecondary: dark
      ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
      : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700",
  };

  let icon: React.ReactNode;
  let iconWrap = "";
  let title = "";
  let message = errorMessage;
  let steps: string[] = [];
  let action: React.ReactNode = null;

  const retryBtn = (label = "Coba Lagi") => (
    <button
      type="button"
      onClick={gps.retry}
      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-center gap-2"
    >
      <RefreshCw size={16} /> {label}
    </button>
  );

  if (status === "checking") {
    icon = <Loader2 size={32} className="animate-spin text-blue-400" />;
    iconWrap = "bg-blue-500/20";
    title = "Mendeteksi Lokasi";
    message = "Mohon izinkan akses lokasi bila browser meminta. Sistem sedang mencari sinyal GPS Anda...";
  } else if (status === "denied") {
    icon = <ShieldAlert size={32} className="text-rose-400" />;
    iconWrap = "bg-rose-500/20";
    title = "Izin Lokasi Ditolak";
    steps = [
      "Ketuk ikon gembok / info (ⓘ) di sebelah kiri alamat website.",
      "Pilih menu \"Izin\" / \"Setelan situs\" lalu buka \"Lokasi\".",
      "Ubah menjadi \"Izinkan\", kemudian muat ulang halaman ini.",
    ];
    action = (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} /> Muat Ulang Halaman
        </button>
        <button
          type="button"
          onClick={gps.retry}
          className={`w-full border py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${c.btnSecondary}`}
        >
          Sudah Diizinkan? Cek Lagi
        </button>
      </div>
    );
  } else if (status === "unavailable" || status === "timeout") {
    icon = <MapPinOff size={32} className="text-amber-400" />;
    iconWrap = "bg-amber-500/20";
    title = status === "unavailable" ? "GPS Belum Aktif" : "Sinyal GPS Lemah";
    steps = [
      "Usap layar dari atas ke bawah untuk membuka panel notifikasi.",
      "Aktifkan ikon \"Lokasi\" / \"GPS\".",
      "Kembali ke halaman ini, sistem akan mendeteksi otomatis.",
    ];
    action = retryBtn();
  } else if (status === "insecure" || status === "unsupported") {
    icon = <MapPinOff size={32} className="text-rose-400" />;
    iconWrap = "bg-rose-500/20";
    title = status === "insecure" ? "Koneksi Tidak Aman" : "Perangkat Tidak Didukung";
  } else if (status === "ready" && !inArea) {
    icon = <MapPin size={32} className="text-rose-400" />;
    iconWrap = "bg-rose-500/20";
    title = "Di Luar Area Absensi";
    message = `Anda berada ${distance !== null ? formatDistance(distance) : "-"} dari ${ABSENSI_GEOFENCE.name}. Absensi hanya dapat dilakukan dalam radius ${formatDistance(ABSENSI_GEOFENCE.radiusMeters)}. Halaman akan terbuka otomatis saat Anda berada di dalam area.`;
    action = retryBtn("Perbarui Lokasi");
  }

  return (
    <div className={`w-full max-w-md mx-auto p-6 lg:p-8 rounded-3xl border animate-in zoom-in-95 duration-300 ${c.card}`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto ${iconWrap}`}>{icon}</div>
      <h2 className="text-xl lg:text-2xl font-black text-center mb-2">{title}</h2>
      <p className={`text-sm text-center mb-6 leading-relaxed ${c.muted}`}>{message}</p>

      {steps.length > 0 && (
        <ol className={`mb-6 space-y-3 p-4 rounded-2xl border ${c.stepBox}`}>
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-xs font-semibold leading-relaxed">
              <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${c.stepNum}`}>
                {i + 1}
              </span>
              <span className="pt-1">{s}</span>
            </li>
          ))}
        </ol>
      )}

      {action}

      <div className={`mt-6 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] ${c.muted}`}>
        <LocateFixed size={12} /> GPS wajib aktif untuk absensi
      </div>
    </div>
  );
}

