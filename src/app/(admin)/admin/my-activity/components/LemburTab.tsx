"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  History,
  Loader2,
  Timer,
} from "lucide-react";

interface LemburItem {
  readonly id?: string;
  readonly tanggal_lembur: string;
  readonly jam_mulai: string;
  readonly jam_selesai: string;
  readonly kegiatan: string;
  readonly status: "Disetujui" | "Menunggu" | "Ditolak" | string;
}

interface LemburFormState {
  readonly tanggal_lembur: string;
  readonly jam_mulai: string;
  readonly jam_selesai: string;
  readonly kegiatan: string;
}

export default function LemburTab() {
  const [lemburHistory, setLemburHistory] = useState<readonly LemburItem[]>([]);
  const [totalJamDisetujui, setTotalJamDisetujui] = useState<number>(0);
  const [lemburForm, setLemburForm] = useState<LemburFormState>({
    tanggal_lembur: "",
    jam_mulai: "",
    jam_selesai: "",
    kegiatan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    readonly type: "error" | "success";
    readonly text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const calculateHours = (data: readonly LemburItem[]) => {
    let totalHours = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    data.forEach((item) => {
      if (item.status === "Disetujui") {
        const dateObj = new Date(item.tanggal_lembur);
        if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
          const start = new Date(item.jam_mulai);
          const end = new Date(item.jam_selesai);
          const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          if (diffHours > 0) totalHours += diffHours;
        }
      }
    });
    setTotalJamDisetujui(Math.round(totalHours * 10) / 10);
  };

  const fetchLembur = async () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) return;
      const user = JSON.parse(userString);
      if (!user.karyawan_id) return;

      const res = await fetch(`${baseUrl}/lembur?karyawan_id=${user.karyawan_id}`);
      if (res.ok) {
        const data: LemburItem[] = await res.json();
        setLemburHistory(data);
        calculateHours(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data lembur:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLembur();
  }, [baseUrl]);

  // Hitung estimasi jam lembur formulir input
  const estimatedHours = React.useMemo(() => {
    if (!lemburForm.jam_mulai || !lemburForm.jam_selesai) return null;
    const [startH, startM] = lemburForm.jam_mulai.split(":").map(Number);
    const [endH, endM] = lemburForm.jam_selesai.split(":").map(Number);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return null;

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const diff = endTotal - startTotal;
    if (diff <= 0) return null;

    const hours = Math.round((diff / 60) * 10) / 10;
    return hours;
  }, [lemburForm.jam_mulai, lemburForm.jam_selesai]);

  const handleLemburSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    setIsSubmitting(true);

    try {
      const userString = localStorage.getItem("user");
      if (!userString) throw new Error("Sesi tidak ditemukan. Silakan login kembali.");
      const user = JSON.parse(userString);

      const startDT = new Date(`${lemburForm.tanggal_lembur}T${lemburForm.jam_mulai}:00`);
      const endDT = new Date(`${lemburForm.tanggal_lembur}T${lemburForm.jam_selesai}:00`);

      if (endDT <= startDT) {
        throw new Error("Jam selesai harus lebih besar dari jam mulai.");
      }

      const payload = {
        karyawan_id: user.karyawan_id,
        tanggal_lembur: lemburForm.tanggal_lembur,
        jam_mulai: startDT.toISOString(),
        jam_selesai: endDT.toISOString(),
        kegiatan: lemburForm.kegiatan,
      };

      const res = await fetch(`${baseUrl}/lembur`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengajukan lembur.");

      setFeedbackMsg({
        type: "success",
        text: "Permohonan lembur dinas berhasil dikirim.",
      });
      setLemburForm({
        tanggal_lembur: "",
        jam_mulai: "",
        jam_selesai: "",
        kegiatan: "",
      });

      fetchLembur();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (isoString: string): string => {
    if (!isoString) return "-";
    try {
      return new Date(isoString).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sisi Kiri: Main Content Card */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <div className="h-5 w-1.5 bg-primary rounded-full"></div>
              Formulir Pengajuan Lembur
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Catat tugas dinas lembur di luar jam shift resmi untuk diverifikasi atasan langsung.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLemburSubmit}>
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

            {/* Tanggal Lembur */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Tanggal Lembur <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={lemburForm.tanggal_lembur}
                  onChange={(e) =>
                    setLemburForm({ ...lemburForm, tanggal_lembur: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Jam Mulai & Selesai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Jam Mulai (WIB) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={lemburForm.jam_mulai}
                  onChange={(e) =>
                    setLemburForm({ ...lemburForm, jam_mulai: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono tabular-nums"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Jam Selesai (WIB) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={lemburForm.jam_selesai}
                  onChange={(e) =>
                    setLemburForm({ ...lemburForm, jam_selesai: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono tabular-nums"
                />
              </div>
            </div>

            {/* Estimasi Durasi Jam Lembur Preview */}
            {estimatedHours !== null && (
              <div className="flex items-center justify-between gap-3 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 text-xs">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Timer size={16} />
                  <span>Estimasi Durasi Kerja Lembur:</span>
                </div>
                <span className="font-mono font-bold text-primary text-sm tabular-nums">
                  {estimatedHours} Jam
                </span>
              </div>
            )}

            {/* Deskripsi Kegiatan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Uraian Kegiatan Pekerjaan Lembur <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={lemburForm.kegiatan}
                onChange={(e) =>
                  setLemburForm({ ...lemburForm, kegiatan: e.target.value })
                }
                placeholder="Tuliskan uraian pekerjaan lembur yang diselesaikan..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-700 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
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
                  <span>Memproses Permohonan...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Ajukan Permohonan Lembur</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Sisi Kanan: Summary Card & Riwayat */}
      <div className="lg:col-span-4 space-y-6">
        {/* Hospital Navy Total Lembur Card */}
        <div className="rounded-2xl p-6 text-white shadow-xs relative overflow-hidden bg-primary-dark border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/10 rounded-xl text-blue-200">
              <Clock size={16} />
            </div>
            <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              Total Lembur Disetujui (Bulan Ini)
            </h3>
          </div>

          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-12 w-20 bg-white/10 rounded animate-pulse" />
            ) : (
              <span className="text-5xl font-bold font-mono leading-none tracking-tight tabular-nums text-white">
                {totalJamDisetujui < 10 ? `0${totalJamDisetujui}` : totalJamDisetujui}
              </span>
            )}
            <span className="text-sm font-bold text-blue-200 uppercase tracking-wider">
              Jam Kerja
            </span>
          </div>

          <p className="text-xs text-blue-100/90 mt-4 font-medium leading-relaxed">
            Akumulasi jam lembur yang telah diverifikasi dan disetujui atasan pada periode aktif berjalan.
          </p>
        </div>

        {/* Riwayat Lembur Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History size={14} className="text-primary" />
            <span>Riwayat Tugas Lembur</span>
          </h3>

          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
              ))
            ) : lemburHistory.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <Clock size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">Belum ada riwayat lembur</p>
              </div>
            ) : (
              lemburHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-primary/40 hover:shadow-xs transition-all bg-white space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {new Date(item.tanggal_lembur).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "Disetujui"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "Ditolak"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status || "Menunggu"}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-primary flex items-center gap-1.5 tabular-nums font-mono">
                    <Clock size={12} />
                    <span>
                      {formatTime(item.jam_mulai)} - {formatTime(item.jam_selesai)} WIB
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    "{item.kegiatan}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
