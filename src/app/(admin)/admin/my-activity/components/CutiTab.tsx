"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  CalendarDays,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users,
  Edit,
  XCircle,
  Loader2,
  Clock,
  UserCheck,
  History,
} from "lucide-react";
import Select, { type StylesConfig } from "react-select";
import Swal from "sweetalert2";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface LeaveHistoryItem {
  readonly id: string;
  readonly type: string;
  readonly range: string;
  readonly tanggal_mulai: string;
  readonly tanggal_selesai: string;
  readonly status: string;
  readonly alasan: string;
  readonly jumlah_hari: number;
  readonly rejected_by?: string | null;
}

interface PeerEmployee {
  readonly id: string;
  readonly nama_lengkap: string;
  readonly nama_level?: string | null;
  readonly departemen_id?: string | null;
}

interface RawCutiApiItem {
  readonly id: string;
  readonly jenis_cuti?: string | null;
  readonly tanggal_mulai: string;
  readonly tanggal_selesai: string;
  readonly status: string;
  readonly alasan?: string | null;
  readonly keterangan?: string | null;
  readonly jumlah_hari?: number | null;
  readonly rejected_by?: string | null;
}

interface CutiOptionItem {
  readonly value: string;
  readonly label: string;
}

const CATEGORY_OPTIONS: readonly CutiOptionItem[] = [
  { value: "Tahunan", label: "Cuti Tahunan" },
  { value: "Sakit", label: "Cuti Sakit" },
  { value: "Melahirkan", label: "Cuti Melahirkan" },
  { value: "Izin Penting", label: "Izin Penting (Kedukaan, Menikah, dll)" },
];

const parseLeaveReason = (rawReason?: string | null) => {
  if (!rawReason) return { cleanReason: "-", delegasi: null };
  const delegasiMatch = rawReason.match(/\[DELEGASI:\s*(.*?)\]/);
  const delegasi = delegasiMatch ? delegasiMatch[1].trim() : null;
  const cleanReason = rawReason
    .replace(/\[DATES:.*?\]/g, "")
    .replace(/\[DELEGASI:.*?\]/g, "")
    .trim();
  return { cleanReason: cleanReason || "-", delegasi };
};

export default function CutiTab() {
  const [leaveBalance, setLeaveBalance] = useState<number>(0);
  const [leaveHistory, setLeaveHistory] = useState<readonly LeaveHistoryItem[]>([]);
  const [delegationPeers, setDelegationPeers] = useState<readonly PeerEmployee[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("Semua");

  const [leaveForm, setLeaveForm] = useState({
    tanggal_kembali: "",
    alasan: "",
    kategori: "Tahunan",
    delegasi: "",
  });

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<LeaveHistoryItem | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [selectedDates, setSelectedDates] = useState<readonly Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    readonly type: "error" | "success";
    readonly text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
  const jumlahHari = selectedDates.length;

  const periodDates = useMemo(() => {
    if (!selectedPeriod) return [];
    const [yearStr, monthStr] = selectedPeriod.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    // Cut-off standar Alice HRIS: 26 bulan lalu s/d 25 bulan terpilih
    const startDate = new Date(year, month - 1, 26);
    const endDate = new Date(year, month, 25);

    const dates: Date[] = [];
    const cur = new Date(startDate);
    while (cur <= endDate) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }, [selectedPeriod]);

  const toggleDate = (date: Date) => {
    const isSelected = selectedDates.some((d) => d.getTime() === date.getTime());
    if (isSelected) {
      setSelectedDates(selectedDates.filter((d) => d.getTime() !== date.getTime()));
    } else {
      if (selectedDates.length >= 4) {
        setFeedbackMsg({
          type: "error",
          text: "Maksimal 4 hari cuti dalam satu pengajuan.",
        });
        return;
      }
      setSelectedDates([...selectedDates, date].sort((a, b) => a.getTime() - b.getTime()));
    }
    setFeedbackMsg(null);
  };

  const fetchCutiData = useCallback(async () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) return;
      const user = JSON.parse(userString);
      if (!user.karyawan_id) return;

      const karyawanRes = await fetch(`${baseUrl}/karyawan/${user.karyawan_id}`);
      if (karyawanRes.ok) {
        const kData = await karyawanRes.json();
        setLeaveBalance(kData.sisa_cuti !== undefined ? kData.sisa_cuti : 0);

        const combinedPeers: PeerEmployee[] = [];
        if (kData.departemen_id) {
          const peersRes = await fetch(
            `${baseUrl}/karyawan?departemen_id=${kData.departemen_id}`
          );
          if (peersRes.ok) {
            combinedPeers.push(...(await peersRes.json()));
          }
        }

        const subRes = await fetch(`${baseUrl}/karyawan?superior_id=${user.karyawan_id}`);
        if (subRes.ok) {
          combinedPeers.push(...(await subRes.json()));
        }

        const uniquePeers = Array.from(
          new Map(combinedPeers.map((item) => [item.id, item])).values()
        );
        setDelegationPeers(uniquePeers.filter((p) => p.id !== user.karyawan_id));
      }

      const cutiRes = await fetch(`${baseUrl}/cuti?karyawan_id=${user.karyawan_id}`, {
        cache: "no-store",
      });
      if (cutiRes.ok) {
        const cutiData: RawCutiApiItem[] = await cutiRes.json();
        const mapped: LeaveHistoryItem[] = cutiData.map((c) => ({
          id: c.id,
          type: c.jenis_cuti || "Cuti Tahunan",
          range: `${new Date(c.tanggal_mulai).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })} - ${new Date(c.tanggal_selesai).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}`,
          tanggal_mulai: c.tanggal_mulai,
          tanggal_selesai: c.tanggal_selesai,
          status: c.status,
          alasan: c.alasan || c.keterangan || "-",
          jumlah_hari: c.jumlah_hari || 1,
          rejected_by: c.rejected_by,
        }));
        setLeaveHistory(mapped);
      }
    } catch (err) {
      console.error("Gagal memuat data cuti:", err);
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchCutiData();
  }, [fetchCutiData]);

  // Run entrance animation ONCE on initial mount with clearProps
  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-cuti-form",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "all" }
      );

      gsap.fromTo(
        ".gsap-cuti-side",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "all" }
      );
    },
    { scope: containerRef, dependencies: [] }
  );

  const checkHariH = (tanggal_mulai: string): boolean => {
    const tm = new Date(tanggal_mulai);
    tm.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today <= tm;
  };

  const handleCancelCuti = async (cuti: LeaveHistoryItem) => {
    if (!checkHariH(cuti.tanggal_mulai)) {
      Swal.fire("Gagal", "Pembatalan cuti maksimal diajukan sebelum hari pelaksanaan.", "error");
      return;
    }

    const res = await Swal.fire({
      title: "Batalkan Cuti?",
      text: "Permohonan pembatalan akan dikirimkan kepada atasan Anda untuk disetujui.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0173b6",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Batalkan",
      cancelButtonText: "Batal",
    });

    if (!res.isConfirmed) return;

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch("/api/cuti/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuti_id: cuti.id, karyawan_id: user.karyawan_id }),
      });

      if (response.ok) {
        Swal.fire("Berhasil", "Permohonan pembatalan cuti berhasil dikirim.", "success").then(() => {
          fetchCutiData();
        });
      } else {
        const err = await response.json();
        Swal.fire("Gagal", err.message || "Gagal membatalkan cuti.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openRescheduleModal = (cuti: LeaveHistoryItem) => {
    if (!checkHariH(cuti.tanggal_mulai)) {
      Swal.fire("Gagal", "Ganti tanggal hanya dapat dilakukan sebelum hari pelaksanaan.", "error");
      return;
    }
    setRescheduleData(cuti);
    setIsRescheduleModalOpen(true);

    let prevDates: Date[] = [];
    const reasonText = cuti.alasan || "";
    const datesMatch = reasonText.match(/\[DATES:\s*(.*?)\]/);
    if (datesMatch) {
      const datesArr = datesMatch[1].split(",").map((d: string) => d.trim());
      prevDates = datesArr.map((d: string) => new Date(`${d}T00:00:00`));
    } else {
      const startDate = new Date(cuti.tanggal_mulai);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(cuti.tanggal_selesai);
      endDate.setHours(0, 0, 0, 0);
      const cur = new Date(startDate);
      while (cur <= endDate) {
        prevDates.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
    }

    setSelectedDates(prevDates);
    if (prevDates.length > 0) {
      const firstDate = prevDates[0];
      setSelectedPeriod(
        `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, "0")}`
      );
    }

    const { cleanReason } = parseLeaveReason(cuti.alasan);
    setLeaveForm((prev) => ({
      ...prev,
      alasan: cleanReason,
    }));
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleData || selectedDates.length === 0) {
      Swal.fire("Error", "Pilih tanggal cuti pengganti pada kalender periodik.", "error");
      return;
    }
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const formatDates = selectedDates.map((d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      });

      const newAlasan = `${leaveForm.alasan.replace(/\[DATES:.*\]/, "").trim()} [DATES: ${formatDates.join(", ")}]`;

      const res = await fetch("/api/cuti/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuti_id: rescheduleData.id,
          karyawan_id: user.karyawan_id,
          tanggal_mulai: formatDates[0],
          tanggal_selesai: formatDates[formatDates.length - 1],
          tanggal_kembali: leaveForm.tanggal_kembali || null,
          jumlah_hari: selectedDates.length,
          alasan: newAlasan,
        }),
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Jadwal cuti berhasil diubah.", "success").then(() => {
          setIsRescheduleModalOpen(false);
          fetchCutiData();
        });
      } else {
        const err = await res.json();
        Swal.fire("Gagal", err.message || "Gagal mengubah jadwal cuti.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCutiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    setIsSubmitting(true);

    if (selectedDates.length === 0) {
      setFeedbackMsg({
        type: "error",
        text: "Silakan pilih minimal 1 hari cuti pada kalender periodik.",
      });
      setIsSubmitting(false);
      return;
    }

    if (jumlahHari > 4) {
      setFeedbackMsg({
        type: "error",
        text: "Pengajuan cuti maksimal 4 hari dalam satu pengajuan.",
      });
      setIsSubmitting(false);
      return;
    }

    if (leaveForm.kategori === "Tahunan" && jumlahHari > leaveBalance) {
      setFeedbackMsg({
        type: "error",
        text: `Sisa kuota cuti tahunan tidak mencukupi (${leaveBalance} hari tersisa).`,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const userString = localStorage.getItem("user");
      if (!userString) throw new Error("Sesi tidak ditemukan. Silakan login kembali.");
      const user = JSON.parse(userString);

      const formatYMD = (date: Date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split("T")[0];
      };

      const earliestDate = selectedDates[0];
      const latestDate = selectedDates[selectedDates.length - 1];
      const dateStrings = selectedDates.map((d) => formatYMD(d)).join(",");
      let finalAlasan = `[DATES: ${dateStrings}] ${leaveForm.alasan}`;
      if (leaveForm.delegasi) {
        finalAlasan += `\n[DELEGASI: ${leaveForm.delegasi}]`;
      }

      const payload = {
        karyawan_id: user.karyawan_id,
        jenis_cuti: leaveForm.kategori,
        tanggal_mulai: formatYMD(earliestDate),
        tanggal_selesai: formatYMD(latestDate),
        tanggal_kembali: leaveForm.tanggal_kembali || null,
        jumlah_hari: jumlahHari,
        keterangan: finalAlasan,
      };

      const res = await fetch(`${baseUrl}/cuti`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengajukan cuti.");

      Swal.fire({
        title: "Berhasil Diajukan!",
        text: "Permohonan cuti telah diteruskan kepada atasan untuk proses persetujuan.",
        icon: "success",
        confirmButtonColor: "#0173b6",
      });

      setFeedbackMsg({ type: "success", text: "Pengajuan cuti berhasil dikirim." });
      setLeaveForm({ tanggal_kembali: "", alasan: "", kategori: "Tahunan", delegasi: "" });
      setSelectedDates([]);

      fetchCutiData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      Swal.fire("Gagal", msg, "error");
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const customSelectStyles: StylesConfig<CutiOptionItem, false> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#ffffff" : "#f8fafc",
      borderColor: state.isFocused ? "#0173b6" : "#cbd5e1",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(1, 115, 182, 0.15)" : "none",
      padding: "3px 6px",
      borderRadius: "0.75rem",
      cursor: "pointer",
      fontSize: "0.8125rem",
      fontWeight: 600,
      color: "#0f172a",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: "#0173b6",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
      borderRadius: "0.875rem",
      overflow: "hidden",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e2e8f0",
      padding: "6px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#0173b6" : state.isFocused ? "#f0f7fc" : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#1e293b",
      fontWeight: state.isSelected ? 700 : 600,
      borderRadius: "0.5rem",
      cursor: "pointer",
      padding: "8px 12px",
      fontSize: "0.8125rem",
      transition: "background-color 0.15s ease",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#0f172a",
      fontWeight: 600,
    }),
  };

  const delegationOptions = useMemo(
    () =>
      delegationPeers.map((peer) => ({
        value: peer.nama_lengkap,
        label: `${peer.nama_lengkap}${peer.nama_level ? ` (${peer.nama_level})` : ""}`,
      })),
    [delegationPeers]
  );

  const filteredHistory = useMemo(() => {
    if (statusFilter === "Semua") return leaveHistory;
    if (statusFilter === "Menunggu") {
      return leaveHistory.filter((item) => item.status?.includes("Menunggu"));
    }
    if (statusFilter === "Disetujui") {
      return leaveHistory.filter((item) => item.status === "Disetujui");
    }
    if (statusFilter === "Batal") {
      return leaveHistory.filter(
        (item) => item.status === "Ditolak" || item.status === "Batal"
      );
    }
    return leaveHistory;
  }, [leaveHistory, statusFilter]);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Grid 2-Kolom: Formulir di Kiri (8 Kolom) & Panel Sisa Cuti + Riwayat di Kanan (4 Kolom - Seragam dengan Tab Presensi) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sisi Kiri: Formulir Pengajuan Cuti (8 Kolom) */}
        <div className="lg:col-span-8">
          <div className="gsap-cuti-form bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 sm:p-7 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <CalendarDays className="text-primary" size={22} />
                <span>Formulir Pengajuan Cuti &amp; Izin Mandiri</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Pilih tanggal rencana cuti pada kalender periodik cut-off (26 s/d 25) dengan batas maksimal 4 hari kerja.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleCutiSubmit}>
              {feedbackMsg && (
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 ${
                    feedbackMsg.type === "error"
                      ? "bg-rose-50 text-rose-800 border border-rose-300"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {feedbackMsg.type === "error" ? (
                    <AlertCircle size={18} className="shrink-0 text-rose-600" />
                  ) : (
                    <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  )}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              {/* Dropdown Kategori Cuti */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Kategori Cuti <span className="text-rose-500">*</span>
                </label>
                <div className="relative z-30">
                  <Select
                    options={CATEGORY_OPTIONS}
                    value={CATEGORY_OPTIONS.find((c) => c.value === leaveForm.kategori) || null}
                    onChange={(selected) => {
                      setLeaveForm({ ...leaveForm, kategori: selected ? selected.value : "Tahunan" });
                      setSelectedDates([]);
                      setFeedbackMsg(null);
                    }}
                    styles={customSelectStyles}
                    isSearchable={false}
                  />
                </div>
              </div>

              {leaveForm.kategori !== "Tahunan" ? (
                <div className="p-8 sm:p-10 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                  <AlertCircle size={40} className="text-slate-400 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Pengajuan Khusus / Berkas Fisik
                  </h3>
                  <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                    Pengajuan jenis cuti ini memerlukan formulir manual dan lampiran surat dokter / berkas resmi ke bagian Kepegawaian RSU Avisena.
                  </p>
                </div>
              ) : (
                <>
                  {/* Kalender Periodik Cut-Off (26 - 25) */}
                  <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Calendar size={15} className="text-primary" />
                        <span>Kalender Periodik Cut-Off (26 s/d 25)</span>
                      </label>
                      <input
                        type="month"
                        value={selectedPeriod}
                        onChange={(e) => {
                          setSelectedPeriod(e.target.value);
                          setSelectedDates([]);
                        }}
                        className="bg-white border border-slate-300 text-slate-900 py-1.5 px-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
                      />
                    </div>

                    {/* Kalender Grid */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                      {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day, idx) => (
                        <div
                          key={day}
                          className={`text-center text-[11px] font-bold py-1 uppercase ${
                            idx === 0 || idx === 6 ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                      {[
                        ...Array(periodDates.length > 0 ? periodDates[0].getDay() : 0).fill(null),
                        ...periodDates,
                      ].map((date: Date | null, idx: number) => {
                        if (!date) return <div key={`empty-${idx}`} className="p-1" />;
                        const isSelected = selectedDates.some(
                          (d) => d.getTime() === date.getTime()
                        );
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleDate(date)}
                            className={`p-1 sm:p-2 rounded-xl font-bold flex flex-col items-center justify-center transition-all aspect-square min-h-[38px] ${
                              isSelected
                                ? "bg-primary text-white shadow-xs font-bold scale-105"
                                : "bg-white text-slate-900 hover:bg-blue-50 border border-slate-300 hover:border-primary"
                            } ${isToday && !isSelected ? "ring-2 ring-primary/40 text-primary" : ""} ${
                              isWeekend && !isSelected ? "text-rose-600 bg-rose-50/40" : ""
                            }`}
                          >
                            <span className="text-xs sm:text-sm font-mono tabular-nums">
                              {date.getDate()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Info Durasi Cuti */}
                  <div className="flex items-center justify-between gap-4 bg-blue-50/80 p-3.5 rounded-xl border border-blue-200">
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">
                        Durasi Hari Cuti Terpilih
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        Batas maksimal permohonan mandiri adalah 4 hari kerja.
                      </p>
                    </div>
                    <div className="bg-white px-3.5 py-1.5 rounded-xl border border-blue-200 shadow-2xs text-center">
                      <span
                        className={`text-2xl font-bold font-mono leading-none tabular-nums ${
                          jumlahHari > 4 ? "text-rose-600" : "text-primary"
                        }`}
                      >
                        {jumlahHari}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 ml-1 uppercase">
                        Hari
                      </span>
                    </div>
                  </div>

                  {/* Tanggal Kembali Bekerja */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Tanggal Kembali Bekerja (Opsional)
                    </label>
                    <input
                      type="date"
                      value={leaveForm.tanggal_kembali}
                      min={
                        selectedDates.length > 0
                          ? new Date(selectedDates[selectedDates.length - 1].getTime() + 86400000)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, tanggal_kembali: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-2xs"
                    />
                    <p className="text-[11px] text-slate-500 font-medium">
                      Isi jika terdapat hari libur atau jadwal off sebelum tanggal dinas berikutnya.
                    </p>
                  </div>

                  {/* Dropdown Delegasi dengan react-select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users size={14} className="text-primary" />
                      <span>Delegasi Pekerjaan (Opsional)</span>
                    </label>
                    <div className="relative z-20">
                      <Select
                        options={delegationOptions}
                        value={
                          delegationOptions.find((opt) => opt.value === leaveForm.delegasi) || null
                        }
                        onChange={(selected) =>
                          setLeaveForm({
                            ...leaveForm,
                            delegasi: selected ? selected.value : "",
                          })
                        }
                        isClearable
                        placeholder="-- Pilih Rekan Satu Unit Kerja --"
                        noOptionsMessage={() => "Tidak ada rekan satu unit"}
                        styles={customSelectStyles}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Rekan kerja yang akan mengampu penanganan tugas selama masa cuti Anda.
                    </p>
                  </div>

                  {/* Alasan Lengkap */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Uraian Alasan Cuti <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={leaveForm.alasan}
                      onChange={(e) => setLeaveForm({ ...leaveForm, alasan: e.target.value })}
                      placeholder="Tuliskan keterangan detail keperluan cuti Anda..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none shadow-2xs"
                    />
                  </div>

                  {/* Tombol Submit */}
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      jumlahHari <= 0 ||
                      jumlahHari > 4 ||
                      (leaveForm.kategori === "Tahunan" && jumlahHari > leaveBalance)
                    }
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
                        <span>Ajukan Permohonan Cuti</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Sisi Kanan: Panel Sisa Cuti & Riwayat Pengajuan Cuti (4 Kolom - Seukuran & Seragam dengan Tab Presensi) */}
        <div className="gsap-cuti-side lg:col-span-4 space-y-6">
          {/* Navy Hospital Sisa Kuota Cuti Panel (Identik dengan Panel Ringkasan Bulan Ini) */}
          <div className="rounded-2xl p-6 text-white shadow-xs relative overflow-hidden bg-primary-dark border border-slate-700/50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-xl text-blue-200">
                  <CalendarDays size={16} />
                </div>
                <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                  Sisa Kuota Cuti
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-blue-200/80">
                Tahun {new Date().getFullYear()}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <div>
                  <p className="text-xs font-semibold text-blue-200">Hak Cuti Tahunan</p>
                  <p className="text-[10px] text-blue-300/70">Maks. 4 hari kerja/pengajuan</p>
                </div>
                {isLoading ? (
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                ) : (
                  <span className="text-3xl font-bold font-mono leading-none tabular-nums text-white">
                    {leaveBalance < 10 ? `0${leaveBalance}` : leaveBalance}{" "}
                    <span className="text-xs text-blue-200 font-semibold">HARI</span>
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pt-1 text-xs text-blue-100/90 font-medium">
                <span>Status Kuota</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] font-mono tabular-nums">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {leaveBalance > 0 ? "Tersedia Aktif" : "Habis Terpakai"}
                </span>
              </div>
            </div>
          </div>

          {/* Riwayat Pengajuan Cuti (Format Ringkas, Rapi & Lengkap di Sisi Kanan) */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History size={16} className="text-primary" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Riwayat Pengajuan Cuti
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tabular-nums bg-slate-100 text-slate-700 border border-slate-200">
                  {filteredHistory.length}
                </span>
              </div>

              {/* Status Filter Tabs Ringkas dengan Count */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                {[
                  { id: "Semua", label: "Semua" },
                  { id: "Menunggu", label: "Menunggu" },
                  { id: "Disetujui", label: "Disetujui" },
                  { id: "Batal", label: "Batal" },
                ].map((tab) => {
                  const count =
                    tab.id === "Semua"
                      ? leaveHistory.length
                      : tab.id === "Menunggu"
                      ? leaveHistory.filter((i) => i.status?.includes("Menunggu")).length
                      : tab.id === "Disetujui"
                      ? leaveHistory.filter((i) => i.status === "Disetujui").length
                      : leaveHistory.filter((i) => i.status === "Ditolak" || i.status === "Batal").length;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-2 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
                        statusFilter === tab.id
                          ? "bg-white text-primary shadow-2xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[9px] font-mono tabular-nums px-1 rounded ${
                          statusFilter === tab.id
                            ? "bg-blue-50 text-primary"
                            : "text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List Riwayat Cuti dengan Custom Scroll */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
                ))
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CalendarDays size={28} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">
                    Tidak ada riwayat cuti pada kategori ini
                  </p>
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const { cleanReason, delegasi } = parseLeaveReason(item.alasan);
                  const canEdit =
                    item.status !== "Ditolak" &&
                    item.status !== "Batal" &&
                    item.status !== "Menunggu Pembatalan" &&
                    checkHariH(item.tanggal_mulai);

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200/90 hover:border-primary/50 hover:shadow-xs transition-all bg-white space-y-2"
                    >
                      {/* Baris Atas: Jenis Cuti, Durasi, & Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {item.type}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tabular-nums bg-blue-50 text-primary border border-blue-200">
                            {item.jumlah_hari} Hari
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            item.status === "Disetujui"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : item.status?.includes("Menunggu")
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : "bg-rose-50 text-rose-800 border-rose-300"
                          }`}
                        >
                          {item.status === "Disetujui" ? (
                            <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                          ) : item.status?.includes("Menunggu") ? (
                            <Clock size={11} className="text-amber-600 shrink-0" />
                          ) : (
                            <XCircle size={11} className="text-rose-600 shrink-0" />
                          )}
                          <span>{item.status || "Menunggu"}</span>
                        </span>
                      </div>

                      {/* Baris Tanggal & Delegasi */}
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold font-mono tabular-nums">
                          <Calendar size={13} className="text-primary shrink-0" />
                          <span>{item.range}</span>
                        </div>

                        {delegasi && (
                          <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                            <UserCheck size={11} className="text-primary shrink-0" />
                            <span>Delegasi: <strong className="text-slate-800">{delegasi}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Baris Alasan & Aksi Ganti Jadwal / Batal */}
                      <div className="flex items-end justify-between gap-3 pt-1 border-t border-slate-100">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200/70 line-clamp-2 leading-relaxed italic">
                            <span className="not-italic font-semibold text-slate-700">Keperluan: </span>
                            &quot;{cleanReason}&quot;
                          </p>
                        </div>

                        {canEdit && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openRescheduleModal(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-[0.98] min-h-[30px]"
                              title="Ganti Tanggal Jadwal Cuti"
                            >
                              <Edit size={11} />
                              <span>Ganti</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelCuti(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-[0.98] min-h-[30px]"
                              title="Batalkan Pengajuan Cuti"
                            >
                              <XCircle size={11} />
                              <span>Batal</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Reschedule (Standard Admin Modal) */}
      {isRescheduleModalOpen && rescheduleData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            {/* Header Modal #05445e */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-primary-dark text-white">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit className="text-blue-200" size={16} />
                <span>Ganti Tanggal Jadwal Cuti</span>
              </h3>
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Tutup"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Kalender Periodik (26 s/d 25)
                  </span>
                  <input
                    type="month"
                    value={selectedPeriod}
                    onChange={(e) => {
                      setSelectedPeriod(e.target.value);
                      setSelectedDates([]);
                    }}
                    className="bg-white border border-slate-300 text-slate-900 py-1 px-2.5 rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day, idx) => (
                    <div
                      key={day}
                      className={`text-center text-[10px] font-bold py-1 ${
                        idx === 0 || idx === 6 ? "text-rose-600 font-bold" : "text-slate-600"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                  {[
                    ...Array(periodDates.length > 0 ? periodDates[0].getDay() : 0).fill(null),
                    ...periodDates,
                  ].map((date: Date | null, idx: number) => {
                    if (!date) return <div key={`empty-res-${idx}`} className="p-1" />;
                    const isSelected = selectedDates.some(
                      (d) => d.getTime() === date.getTime()
                    );
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDate(date)}
                        className={`p-1.5 rounded-xl font-bold flex items-center justify-center aspect-square text-xs transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-xs font-bold scale-105"
                            : "bg-white text-slate-900 hover:bg-blue-50 border border-slate-300"
                        } ${isWeekend && !isSelected ? "text-rose-600 bg-rose-50/40" : ""}`}
                      >
                        <span className="font-mono tabular-nums">{date.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Alasan Perubahan</label>
                <textarea
                  rows={3}
                  value={leaveForm.alasan}
                  onChange={(e) => setLeaveForm({ ...leaveForm, alasan: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none text-xs sm:text-sm font-medium resize-none shadow-2xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsRescheduleModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl transition-colors min-h-[38px]"
              >
                Batal
              </button>
              <button
                onClick={handleRescheduleSubmit}
                disabled={selectedDates.length === 0}
                className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-xs uppercase tracking-wider text-xs disabled:opacity-50 min-h-[44px]"
              >
                Simpan Perubahan Tanggal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
