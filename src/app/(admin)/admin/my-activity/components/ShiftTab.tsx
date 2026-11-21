"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Users,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  Loader2,
  ArrowLeftRight,
  Search,
  UserCheck,
} from "lucide-react";
import Select, { type StylesConfig } from "react-select";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface UnitShiftItem {
  readonly karyawan_id: string;
  readonly nama_lengkap: string;
  readonly tanggal: string;
  readonly shift_id?: number | null;
  readonly nama_shift?: string | null;
}

interface ShiftSelectOption {
  readonly value: string;
  readonly label: string;
}

const getInitials = (name: string): string => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getShiftBadgeClass = (shiftName?: string | null): string => {
  if (!shiftName) return "bg-slate-100 text-slate-700 border-slate-200";
  const lower = shiftName.toLowerCase();
  if (lower.includes("pagi")) return "bg-sky-100 text-sky-800 border-sky-300 font-bold";
  if (lower.includes("siang") || lower.includes("sore"))
    return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
  if (lower.includes("malam")) return "bg-indigo-100 text-indigo-800 border-indigo-300 font-bold";
  if (lower.includes("libur") || lower.includes("off"))
    return "bg-slate-100 text-slate-700 border-slate-300 font-bold";
  return "bg-blue-100 text-blue-800 border-blue-300 font-bold";
};

export default function ShiftTab() {
  const [userKaryawanId, setUserKaryawanId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    return `${yyyy}-${mm}`;
  });
  const [jadwalUnit, setJadwalUnit] = useState<readonly UnitShiftItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRekanJadwal, setSelectedRekanJadwal] = useState<UnitShiftItem | null>(null);
  const [mySelectedJadwalString, setMySelectedJadwalString] = useState("");
  const [alasan, setAlasan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userDataStr = localStorage.getItem("user");
    if (userDataStr) {
      try {
        const user = JSON.parse(userDataStr);
        if (user.karyawan_id) {
          setUserKaryawanId(user.karyawan_id);
        }
      } catch (e) {
        console.error("Gagal membaca session user:", e);
      }
    }
  }, []);

  const fetchJadwalUnit = async (kId: string, month: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(
        `/api/tukar-shift/jadwal-unit?karyawan_id=${kId}&bulan=${month}`
      );
      if (res.ok) {
        const data: UnitShiftItem[] = await res.json();
        setJadwalUnit(data);
      } else {
        setErrorMessage("Gagal memuat jadwal shift unit kerja.");
      }
    } catch (err) {
      console.error("Gagal memuat jadwal unit:", err);
      setErrorMessage("Koneksi gagal saat memuat jadwal shift unit.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userKaryawanId && selectedMonth) {
      fetchJadwalUnit(userKaryawanId, selectedMonth);
    }
  }, [userKaryawanId, selectedMonth]);

  const myJadwalList = useMemo(
    () => jadwalUnit.filter((j) => j.karyawan_id === userKaryawanId),
    [jadwalUnit, userKaryawanId]
  );

  const rekanJadwalList = useMemo(() => {
    // Filter rekan satu unit kerja dan kecualikan yang sedang berstatus cuti
    const list = jadwalUnit.filter(
      (j) =>
        j.karyawan_id !== userKaryawanId &&
        !j.nama_shift?.toLowerCase().includes("cuti")
    );
    if (!searchTerm.trim()) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter(
      (j) =>
        j.nama_lengkap.toLowerCase().includes(lower) ||
        j.tanggal.toLowerCase().includes(lower) ||
        (j.nama_shift && j.nama_shift.toLowerCase().includes(lower))
    );
  }, [jadwalUnit, userKaryawanId, searchTerm]);

  // Run entrance animation ONCE on initial mount with clearProps
  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-shift-header",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "all" }
      );

      gsap.fromTo(
        ".gsap-shift-my-card",
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.03,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    },
    { scope: containerRef, dependencies: [] }
  );

  const openModal = (rekanJadwal: UnitShiftItem) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedRekanJadwal(rekanJadwal);
    setMySelectedJadwalString("");
    setAlasan("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRekanJadwal) return;

    if (!mySelectedJadwalString) {
      setErrorMessage("Silakan pilih jadwal dinas Anda yang akan ditukar.");
      return;
    }

    const [myTanggal, myShiftIdStr] = mySelectedJadwalString.split("|");
    const myShiftId = myShiftIdStr ? parseInt(myShiftIdStr, 10) : null;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/tukar-shift/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          karyawan_pengaju_id: userKaryawanId,
          karyawan_pengganti_id: selectedRekanJadwal.karyawan_id,
          tanggal_pengaju: myTanggal,
          tanggal_pengganti: selectedRekanJadwal.tanggal,
          shift_pengaju_id: myShiftId,
          shift_pengganti_id: selectedRekanJadwal.shift_id,
          alasan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengajukan pertukaran shift.");
      }

      setSuccessMessage(
        `Permohonan tukar shift tanggal ${myTanggal} dengan ${selectedRekanJadwal.nama_lengkap} (${selectedRekanJadwal.tanggal}) berhasil diajukan.`
      );
      setIsModalOpen(false);
      fetchJadwalUnit(userKaryawanId, selectedMonth);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectStyles: StylesConfig<ShiftSelectOption, false> = {
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
      "&:hover": {
        borderColor: "#0173b6",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 60,
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
    }),
    singleValue: (base) => ({
      ...base,
      color: "#0f172a",
      fontWeight: 600,
    }),
  };

  const myShiftSelectOptions: readonly ShiftSelectOption[] = useMemo(
    () =>
      myJadwalList
        .filter((item) => !item.nama_shift?.toLowerCase().includes("cuti"))
        .map((item) => ({
          value: `${item.tanggal}|${item.shift_id || ""}`,
          label: `${item.tanggal} — Shift: ${item.nama_shift || "Libur / Off"}`,
        })),
    [myJadwalList]
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* FILTER & PENCARIAN (Layer 3 - High Contrast & Sharp) */}
      <div className="gsap-shift-header bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <RefreshCw size={20} className="text-primary" />
              <span>Tukar Shift Unit Kerja</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Pantau jadwal dinas rekan satu unit kerja dan ajukan permohonan tukar shift secara resmi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Pilih Bulan:
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
            />
          </div>
        </div>

        {/* Input Pencarian Rekan */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari nama rekan, tanggal, atau shift..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[40px] pl-10 pr-9 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none shadow-2xs transition-all"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 font-mono tabular-nums">
            <span>Dinas Saya: <strong className="text-primary font-bold">{myJadwalList.length}</strong> shift</span>
            <span>&bull;</span>
            <span>Jadwal Rekan: <strong className="text-slate-900 font-bold">{rekanJadwalList.length}</strong> slot</span>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 text-xs sm:text-sm font-bold shadow-2xs animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* SECTION 1: Ringkasan Jadwal Dinas Pribadi Saya */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
            <UserCheck size={16} className="text-primary" />
            <span>Jadwal Dinas Saya Bulan Ini</span>
          </h3>
          <span className="text-xs font-mono text-slate-600 font-bold tabular-nums bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {myJadwalList.length} Shift Terdaftar
          </span>
        </div>

        {myJadwalList.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-xl text-center text-xs font-semibold text-slate-500 border border-dashed border-slate-200">
            Belum ada plot jadwal dinas pribadi pada bulan terpilih.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {myJadwalList.slice(0, 14).map((j, idx) => (
              <div
                key={idx}
                className="gsap-shift-my-card p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-primary/50 hover:shadow-xs transition-all text-center space-y-1.5"
              >
                <p className="text-xs font-mono font-bold text-slate-700 tabular-nums">
                  {j.tanggal}
                </p>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider border ${getShiftBadgeClass(
                    j.nama_shift
                  )}`}
                >
                  {j.nama_shift || "Off"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Tabel Jadwal Shift Rekan Satu Unit */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary-dark">
            Jadwal Shift Rekan Unit (Siap Ditukar)
          </h2>
          <span className="text-xs font-semibold text-slate-600 font-mono tabular-nums">
            Menampilkan <strong className="text-slate-900 font-bold">{rekanJadwalList.length}</strong> jadwal rekan
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-xs bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="text-xs text-white uppercase bg-primary-dark font-semibold">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-white">Tanggal</th>
                  <th scope="col" className="px-6 py-3.5 text-white">Nama Rekan Kerja</th>
                  <th scope="col" className="px-6 py-3.5 text-white">Shift Dinas</th>
                  <th scope="col" className="px-6 py-3.5 text-center text-white">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded-md w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100" />
                          <div className="h-4 bg-slate-100 rounded-md w-36" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-slate-100 rounded-md w-24" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="h-8 bg-slate-100 rounded-xl w-28 mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : rekanJadwalList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      <Users size={28} className="mx-auto mb-2 text-slate-400" />
                      Tidak ada jadwal dinas rekan yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  rekanJadwalList.map((jadwal, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/90 transition-colors"
                    >
                      {/* Tanggal */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 tabular-nums text-xs">
                        {jadwal.tanggal}
                      </td>

                      {/* Nama & Avatar Inisial */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary font-bold text-xs border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                            {getInitials(jadwal.nama_lengkap)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {jadwal.nama_lengkap}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Rekan Unit Kerja
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Shift Dinas */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getShiftBadgeClass(
                            jadwal.nama_shift
                          )}`}
                        >
                          {jadwal.nama_shift || "Libur / Off"}
                        </span>
                      </td>

                      {/* Aksi Tukar Shift */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openModal(jadwal)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-300 text-slate-800 hover:text-primary hover:border-primary hover:bg-blue-50 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-[0.98] min-h-[36px]"
                        >
                          <ArrowLeftRight size={13} />
                          <span>Tukar Shift</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form Tukar Shift (Mengikuti Standar Modal Admin) */}
      {isModalOpen && selectedRekanJadwal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
            {/* Header Modal #05445e */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-primary-dark text-white">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ArrowLeftRight className="text-blue-200" size={18} />
                <span>Formulir Pengajuan Tukar Shift</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Form */}
            <div className="p-6 overflow-y-auto max-h-[72vh] space-y-5">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2.5 text-xs font-bold">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <form id="tukarShiftFormModal" onSubmit={handleSubmit} className="space-y-5">
                {/* Info Rekan Box */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 space-y-1.5">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Jadwal Rekan yang Dituju
                  </p>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedRekanJadwal.nama_lengkap}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 font-mono tabular-nums pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-primary" />
                      {selectedRekanJadwal.tanggal}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-primary" />
                      {selectedRekanJadwal.nama_shift || "Libur / Off"}
                    </span>
                  </div>
                </div>

                {/* Dropdown Jadwal Pribadi dengan react-select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Pilih Jadwal Anda yang Akan Ditukar <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative z-30">
                    <Select
                      options={myShiftSelectOptions}
                      value={
                        myShiftSelectOptions.find(
                          (opt) => opt.value === mySelectedJadwalString
                        ) || null
                      }
                      onChange={(selected) =>
                        setMySelectedJadwalString(selected ? selected.value : "")
                      }
                      isClearable
                      placeholder="-- Pilih Jadwal Dinas Anda Bulan Ini --"
                      noOptionsMessage={() => "Tidak ada jadwal dinas pribadi pada bulan ini"}
                      styles={selectStyles}
                    />
                  </div>
                </div>

                {/* Alasan Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Alasan Tukar Shift <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    placeholder="Tuliskan alasan permohonan pertukaran dinas Anda..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-700 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors min-h-[38px]"
              >
                Batal
              </button>
              <button
                type="submit"
                form="tukarShiftFormModal"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-[0.98] min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Ajukan Tukar Shift</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
