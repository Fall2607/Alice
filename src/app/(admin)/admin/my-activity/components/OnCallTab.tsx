"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  PhoneCall,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  History,
  Loader2,
  Timer,
  Building2,
  UserCheck,
  Siren,
} from "lucide-react";
import Select, { type StylesConfig } from "react-select";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface OnCallItem {
  readonly id: string;
  readonly tanggal: string;
  readonly jam_mulai: string;
  readonly jam_selesai: string;
  readonly durasi_jam: number;
  readonly kategori: string;
  readonly unit_pemanggil: string;
  readonly pemberi_instruksi: string;
  readonly tindakan: string;
  readonly status: "Disetujui" | "Menunggu Verifikasi" | "Ditolak";
}

const ONCALL_CATEGORY_OPTIONS: readonly SelectOption[] = [
  { value: "On Call Cyto / Operasi Darurat", label: "On Call Cyto / Operasi Darurat (OK)" },
  { value: "On Call IGD / Penanganan Kritis", label: "On Call IGD / Penanganan Pasien Kritis" },
  { value: "On Call Visite / Konsultasi Spesialis", label: "On Call Visite / Konsultasi Medis" },
  { value: "On Call Backup Penunjang Medis", label: "On Call Backup Lab / Radiologi / Farmasi" },
  { value: "On Call Gangguan Sistem / Sarpras", label: "On Call Darurat IT & IPSRS Rumah Sakit" },
];

const UNIT_OPTIONS: readonly SelectOption[] = [
  { value: "IGD 24 Jam", label: "Instalasi Gawat Darurat (IGD 24 Jam)" },
  { value: "Kamar Operasi (OK)", label: "Instalasi Kamar Operasi (OK / Bedah)" },
  { value: "ICU / NICU", label: "Intensive Care Unit (ICU / NICU)" },
  { value: "Rawat Inap & VK", label: "Instalasi Rawat Inap & Kebidanan (VK)" },
  { value: "Laboratorium & Radiologi", label: "Instalasi Laboratorium & Radiologi" },
  { value: "Instalasi Farmasi", label: "Instalasi Farmasi 24 Jam" },
  { value: "IT & IPSRS", label: "Unit IT, SIMRS & Pemeliharaan Sarpras" },
];

const INITIAL_ONCALL_HISTORY: readonly OnCallItem[] = [
  {
    id: "OC-2026-014",
    tanggal: "2026-11-18",
    jam_mulai: "21:30",
    jam_selesai: "00:30",
    durasi_jam: 3,
    kategori: "On Call Cyto / Operasi Darurat",
    unit_pemanggil: "Kamar Operasi (OK)",
    pemberi_instruksi: "dr. Budi Santoso, Sp.OG",
    tindakan: "Asistensi tindakan Sectio Caesarea (SC) Cyto pasien rujukan gawat janin.",
    status: "Disetujui",
  },
  {
    id: "OC-2026-019",
    tanggal: "2026-11-23",
    jam_mulai: "02:00",
    jam_selesai: "04:30",
    durasi_jam: 2.5,
    kategori: "On Call IGD / Penanganan Kritis",
    unit_pemanggil: "IGD 24 Jam",
    pemberi_instruksi: "dr. Rina Kartika (Dokter Jaga IGD)",
    tindakan: "Penanganan observasi resusitasi dan stabilisasi pasien trauma kecelakaan lalu lintas.",
    status: "Menunggu Verifikasi",
  },
];

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    backgroundColor: state.isFocused ? "#ffffff" : "#f8fafc",
    borderColor: state.isFocused ? "#0173b6" : "#e2e8f0",
    borderRadius: "0.75rem",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(1, 115, 182, 0.18)" : "none",
    fontSize: "0.8125rem",
    fontWeight: 700,
    "&:hover": {
      borderColor: "#0173b6",
    },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.8125rem",
    fontWeight: state.isSelected ? 700 : 500,
    backgroundColor: state.isSelected
      ? "#0173b6"
      : state.isFocused
      ? "#eff6ff"
      : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1e293b",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    overflow: "hidden",
    zIndex: 30,
  }),
};

export default function OnCallTab() {
  const [onCallHistory, setOnCallHistory] = useState<readonly OnCallItem[]>(
    INITIAL_ONCALL_HISTORY
  );

  const [formState, setFormState] = useState({
    kategori: ONCALL_CATEGORY_OPTIONS[0].value,
    unit_pemanggil: UNIT_OPTIONS[0].value,
    tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
    pemberi_instruksi: "",
    tindakan: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    readonly type: "error" | "success";
    readonly text: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-oncall-form",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "all" }
      );
      gsap.fromTo(
        ".gsap-oncall-side",
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.35, ease: "power2.out", delay: 0.08, clearProps: "all" }
      );
    },
    { scope: containerRef, dependencies: [] }
  );

  // Mendukung panggilan lintas tengah malam (contoh 22:00 s/d 01:30 = 3.5 jam)
  const estimatedHours = useMemo(() => {
    if (!formState.jam_mulai || !formState.jam_selesai) return null;
    const [startH, startM] = formState.jam_mulai.split(":").map(Number);
    const [endH, endM] = formState.jam_selesai.split(":").map(Number);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return null;

    const startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    const diff = endMinutes - startMinutes;
    if (diff <= 0 || diff > 16 * 60) return null;
    return Math.round((diff / 60) * 10) / 10;
  }, [formState.jam_mulai, formState.jam_selesai]);

  const totalJamDisetujui = useMemo(() => {
    return onCallHistory
      .filter((item) => item.status === "Disetujui")
      .reduce((acc, item) => acc + item.durasi_jam, 0);
  }, [onCallHistory]);

  const totalPanggilanBulanIni = onCallHistory.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!estimatedHours || estimatedHours <= 0) {
      setFeedbackMsg({
        type: "error",
        text: "Mohon periksa kembali jam panggilan masuk dan jam selesai penanganan.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newEntry: OnCallItem = {
        id: `OC-2026-0${20 + onCallHistory.length}`,
        tanggal: formState.tanggal,
        jam_mulai: formState.jam_mulai,
        jam_selesai: formState.jam_selesai,
        durasi_jam: estimatedHours,
        kategori: formState.kategori,
        unit_pemanggil: formState.unit_pemanggil,
        pemberi_instruksi: formState.pemberi_instruksi.trim() || "Dokter Jaga / Koordinator Unit",
        tindakan: formState.tindakan.trim(),
        status: "Menunggu Verifikasi",
      };

      setOnCallHistory((prev) => [newEntry, ...prev]);
      setFormState({
        kategori: ONCALL_CATEGORY_OPTIONS[0].value,
        unit_pemanggil: UNIT_OPTIONS[0].value,
        tanggal: "",
        jam_mulai: "",
        jam_selesai: "",
        pemberi_instruksi: "",
        tindakan: "",
      });
      setIsSubmitting(false);
      setFeedbackMsg({
        type: "success",
        text: "Klaim penugasan On Call berhasil dicatat ke dalam daftar pengajuan (Simulasi UI).",
      });
    }, 450);
  };

  return (
    <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sisi Kiri: Formulir Pencatatan On Call */}
      <div className="lg:col-span-8">
        <div className="gsap-oncall-form bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-primary-dark tracking-tight flex items-center gap-2.5">
                <PhoneCall className="text-primary" size={20} />
                <span>Formulir Klaim &amp; Pencatatan Tugas On Call</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Catat kehadiran panggilan darurat (Cyto/Standby) di luar jam shift reguler untuk perhitungan insentif dan rekap kehadiran medis.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-bold shrink-0 self-start sm:self-center">
              <Siren size={14} className="text-amber-600" />
              <span>Siaga Panggilan 24/7 RS</span>
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {feedbackMsg && (
              <div
                className={`p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 ${
                  feedbackMsg.type === "error"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {feedbackMsg.type === "error" ? (
                  <AlertCircle size={18} className="shrink-0" />
                ) : (
                  <CheckCircle2 size={18} className="shrink-0" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* Baris 1: Kategori On Call & Unit Pemanggil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Siren size={13} className="text-primary" />
                  <span>Jenis Panggilan On Call</span>
                  <span className="text-rose-500">*</span>
                </label>
                <Select<SelectOption, false>
                  instanceId="oncall-category-select"
                  options={ONCALL_CATEGORY_OPTIONS}
                  value={
                    ONCALL_CATEGORY_OPTIONS.find((opt) => opt.value === formState.kategori) ||
                    ONCALL_CATEGORY_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    opt && setFormState({ ...formState, kategori: opt.value })
                  }
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 size={13} className="text-primary" />
                  <span>Instalasi / Unit Pemanggil</span>
                  <span className="text-rose-500">*</span>
                </label>
                <Select<SelectOption, false>
                  instanceId="oncall-unit-select"
                  options={UNIT_OPTIONS}
                  value={
                    UNIT_OPTIONS.find((opt) => opt.value === formState.unit_pemanggil) ||
                    UNIT_OPTIONS[0]
                  }
                  onChange={(opt) =>
                    opt && setFormState({ ...formState, unit_pemanggil: opt.value })
                  }
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>
            </div>

            {/* Baris 2: Tanggal Panggilan & Dokter / Pejabat Pemberi Instruksi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary" />
                  <span>Tanggal Panggilan On Call</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formState.tanggal}
                  onChange={(e) =>
                    setFormState({ ...formState, tanggal: e.target.value })
                  }
                  className="w-full px-4 py-2.5 min-h-[44px] bg-slate-50/80 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <UserCheck size={13} className="text-primary" />
                  <span>DPJP / Atasan Pemberi Instruksi</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.pemberi_instruksi}
                  onChange={(e) =>
                    setFormState({ ...formState, pemberi_instruksi: e.target.value })
                  }
                  placeholder="Contoh: dr. Budi Santoso, Sp.OG / Kepala Ruang OK"
                  className="w-full px-4 py-2.5 min-h-[44px] bg-slate-50/80 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Baris 3: Jam Panggilan Masuk & Jam Selesai Penanganan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock size={13} className="text-primary" />
                  <span>Jam Mulai Penanganan (WIB)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formState.jam_mulai}
                  onChange={(e) =>
                    setFormState({ ...formState, jam_mulai: e.target.value })
                  }
                  className="w-full px-4 py-2.5 min-h-[44px] bg-slate-50/80 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock size={13} className="text-primary" />
                  <span>Jam Selesai Penanganan (WIB)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formState.jam_selesai}
                  onChange={(e) =>
                    setFormState({ ...formState, jam_selesai: e.target.value })
                  }
                  className="w-full px-4 py-2.5 min-h-[44px] bg-slate-50/80 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono tabular-nums"
                />
              </div>
            </div>

            {/* Preview Durasi On Call */}
            {estimatedHours !== null && (
              <div className="flex items-center justify-between gap-3 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 text-xs">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Timer size={16} />
                  <span>Estimasi Durasi Penugasan On Call:</span>
                </div>
                <span className="font-mono font-bold text-primary text-sm tabular-nums">
                  {estimatedHours} Jam
                </span>
              </div>
            )}

            {/* Baris 4: Uraian Tindakan Medis / Operasional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Uraian Tindakan / Penanganan yang Dilakukan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={formState.tindakan}
                onChange={(e) =>
                  setFormState({ ...formState, tindakan: e.target.value })
                }
                placeholder="Tuliskan rincian tindakan medis/operasional darurat yang ditangani selama sesi On Call..."
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/90 rounded-xl font-medium text-slate-700 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-xs active:scale-[0.98] text-xs uppercase tracking-wider disabled:opacity-50 min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memproses Klaim On Call...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Ajukan Klaim Tugas On Call</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Sisi Kanan: Summary Card & Riwayat On Call */}
      <div className="gsap-oncall-side lg:col-span-4 space-y-6">
        {/* Hospital Navy Summary Card */}
        <div className="rounded-2xl p-6 text-white shadow-xs relative overflow-hidden bg-primary-dark border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-xl text-blue-200">
                <PhoneCall size={16} />
              </div>
              <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                Total On Call (Cut-Off 26–25)
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-mono font-bold text-blue-100 tabular-nums">
              {totalPanggilanBulanIni}x Panggilan
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold font-mono leading-none tracking-tight tabular-nums text-white">
              {totalJamDisetujui < 10 ? `0${totalJamDisetujui}` : totalJamDisetujui}
            </span>
            <span className="text-sm font-bold text-blue-200 uppercase tracking-wider">
              Jam Disetujui
            </span>
          </div>

          <p className="text-xs text-blue-100/90 mt-4 font-medium leading-relaxed">
            Akumulasi durasi penanganan panggilan On Call darurat yang telah diverifikasi oleh Kepala Unit / DPJP dan HC.
          </p>
        </div>

        {/* Riwayat Panggilan On Call Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History size={14} className="text-primary" />
            <span>Riwayat Panggilan On Call</span>
          </h3>

          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {onCallHistory.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <PhoneCall size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">
                  Belum ada riwayat tugas On Call
                </p>
              </div>
            ) : (
              onCallHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-primary/40 hover:shadow-xs transition-all bg-white space-y-2.5"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums">
                        {item.id} • {item.unit_pemanggil}
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        item.status === "Disetujui"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : item.status === "Ditolak"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-primary tabular-nums font-mono bg-blue-50/60 px-2.5 py-1.5 rounded-lg border border-blue-100">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>
                        {item.jam_mulai} – {item.jam_selesai} WIB
                      </span>
                    </span>
                    <span>{item.durasi_jam} Jam</span>
                  </div>

                  <div className="text-[11px] space-y-1">
                    <p className="font-bold text-slate-700">{item.kategori}</p>
                    <p className="text-slate-500">
                      Instruksi: <strong className="text-slate-700">{item.pemberi_instruksi}</strong>
                    </p>
                    <p className="text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      &quot;{item.tindakan}&quot;
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
