"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Key,
  Users,
  Search,
  X,
  RotateCcw,
  CheckCircle2,
  Building2,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Info,
} from "lucide-react";
import Select from "react-select";
import Swal from "sweetalert2";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

import Modal from "@/app/components/modal";
import Pagination from "@/app/components/admin/Pagination";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

interface Delegation {
  id: string;
  karyawan_id: string;
  nama_karyawan: string;
  departemen_id: string;
  nama_departemen: string;
  created_at: string;
}

interface Karyawan {
  id: string;
  nama_lengkap: string;
  nip?: string;
}

interface Departemen {
  id: string;
  nama_departemen: string;
}

type FormOption = { value: string | number; label: string };

export default function DelegasiJadwalPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
  const [departemens, setDepartemens] = useState<Departemen[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<FormOption | null>({
    value: "all",
    label: "Semua Unit",
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState<FormOption | null>(null);
  const [selectedDepartemens, setSelectedDepartemens] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resDel, resKar, resDep] = await Promise.all([
        fetch("/api/jadwal-kerja/delegasi"),
        fetch("/api/karyawan"),
        fetch("/api/departemen"),
      ]);

      if (resDel.ok) setDelegations(await resDel.json());
      if (resKar.ok) setKaryawans(await resKar.json());
      if (resDep.ok) setDepartemens(await resDep.json());
    } catch (error) {
      console.error(error);
      showErrorToast("Gagal memuat data delegasi wewenang.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedKaryawan) {
      showErrorToast("Silakan pilih staff yang akan didelegasikan.");
      return;
    }

    if (!selectedDepartemens || selectedDepartemens.length === 0) {
      showErrorToast("Pilih minimal satu unit/departemen wewenang.");
      return;
    }

    setIsSubmitting(true);
    try {
      const departemen_ids = selectedDepartemens.map((d) => d.value);

      const res = await fetch("/api/jadwal-kerja/delegasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          karyawan_id: selectedKaryawan.value,
          departemen_ids,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.duplicatesSkipped > 0) {
          showSuccessToast(
            `Berhasil menambahkan ${data.inserted.length} delegasi (${data.duplicatesSkipped} dilewati karena sudah ada).`
          );
        } else {
          showSuccessToast("Akses delegasi jadwal berhasil diberikan.");
        }
        setIsAddModalOpen(false);
        setSelectedKaryawan(null);
        setSelectedDepartemens([]);
        fetchData();
      } else {
        showErrorToast(data.message || "Gagal menambahkan delegasi.");
      }
    } catch (error) {
      showErrorToast("Terjadi kendala saat memproses tindakan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWithConfirmation = async (del: Delegation) => {
    const result = await Swal.fire({
      title: "Cabut Akses Delegasi?",
      text: `Apakah Anda yakin ingin mencabut hak akses jadwal ${del.nama_karyawan} untuk unit ${del.nama_departemen}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Cabut Akses",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-2xl font-sans",
        confirmButton: "rounded-xl font-bold px-4 py-2 text-xs uppercase tracking-wider",
        cancelButton: "rounded-xl font-bold px-4 py-2 text-xs uppercase tracking-wider",
      },
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/jadwal-kerja/delegasi/${del.id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccessToast(`Akses delegasi untuk ${del.nama_karyawan} berhasil dicabut.`);
        fetchData();
      } else {
        showErrorToast("Gagal mencabut delegasi.");
      }
    } catch (error) {
      showErrorToast("Terjadi kesalahan sistem.");
    }
  };

  // Options dropdown
  const karyawanOptions: FormOption[] = useMemo(() => {
    return karyawans.map((k) => ({
      value: k.id,
      label: k.nama_lengkap + (k.nip ? ` (NIP: ${k.nip})` : ""),
    }));
  }, [karyawans]);

  const departemenOptions: FormOption[] = useMemo(() => {
    return departemens.map((d) => ({
      value: d.id,
      label: d.nama_departemen,
    }));
  }, [departemens]);

  const unitFilterOptions: FormOption[] = useMemo(() => {
    return [
      { value: "all", label: "Semua Unit" },
      ...departemens.map((d) => ({ value: d.nama_departemen, label: d.nama_departemen })),
    ];
  }, [departemens]);

  // Filtering
  const filteredDelegations = useMemo(() => {
    return delegations.filter((del) => {
      const matchSearch =
        !searchQuery.trim() ||
        del.nama_karyawan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        del.nama_departemen.toLowerCase().includes(searchQuery.toLowerCase());
      const matchUnit =
        !selectedUnitFilter ||
        selectedUnitFilter.value === "all" ||
        del.nama_departemen === selectedUnitFilter.value;
      return matchSearch && matchUnit;
    });
  }, [delegations, searchQuery, selectedUnitFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredDelegations.length / itemsPerPage);
  const currentDelegations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDelegations.slice(start, start + itemsPerPage);
  }, [filteredDelegations, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedUnitFilter]);

  // Aggregate stats
  const distinctStaffCount = useMemo(() => {
    return new Set(delegations.map((d) => d.karyawan_id)).size;
  }, [delegations]);

  const distinctDeptCount = useMemo(() => {
    return new Set(delegations.map((d) => d.departemen_id)).size;
  }, [delegations]);

  // GSAP: Entrance animation
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".del-header", {
        y: -12,
        opacity: 0,
        duration: 0.45,
        clearProps: "all",
      })
        .from(
          ".del-kpi-card",
          {
            y: 14,
            opacity: 0,
            duration: 0.35,
            stagger: 0.05,
            clearProps: "all",
          },
          "-=0.2"
        )
        .from(
          ".del-filter",
          {
            y: 12,
            opacity: 0,
            duration: 0.35,
            clearProps: "all",
          },
          "-=0.15"
        )
        .from(
          ".del-table-container",
          {
            y: 16,
            opacity: 0,
            duration: 0.4,
            clearProps: "all",
          },
          "-=0.15"
        );
    },
    { scope: containerRef, dependencies: [] }
  );

  // GSAP: Row micro-stagger
  useGSAP(
    () => {
      if (!tableContainerRef.current) return;
      const rows = tableContainerRef.current.querySelectorAll(".del-row");
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: "power2.out", clearProps: "all" }
        );
      }
    },
    { scope: containerRef, dependencies: [currentDelegations] }
  );

  return (
    <div ref={containerRef} className="p-8 font-sans min-h-screen space-y-6">
      {/* LAYER 1: HEADER HALAMAN */}
      <div className="del-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[#0173b6] font-bold uppercase tracking-wider text-xs">
            <Key size={16} />
            <span>Otoritas &amp; Hak Akses Jadwal</span>
          </div>
          <h1 className="text-3xl font-bold text-[#05445e] tracking-tight">
            Delegasi Akses Jadwal Pegawai
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-2xl">
            Berikan wewenang khusus kepada Staff (Non-Koordinator) untuk mengatur jadwal dinas pada departemen/unit yang dipilih tanpa mengubah role asli.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-sm min-h-[42px] bg-[#0173b6] hover:bg-[#005f98] text-white font-bold px-5 rounded-xl shadow-xs transition-all active:scale-[0.98] border-0 text-xs uppercase tracking-wider gap-2 shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Delegasi Akses</span>
        </button>
      </div>

      {/* LAYER 2: KPI / SUMMARY RIBBON (4 METRICS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="del-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Delegasi</p>
            <p className="text-2xl font-black text-slate-800 font-mono tabular-nums mt-0.5">
              {delegations.length} <span className="text-xs font-semibold text-slate-400 font-sans">Wewenang</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <Key size={22} />
          </div>
        </div>

        <div className="del-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Staff Pemegang Akses</p>
            <p className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">
              {distinctStaffCount} <span className="text-xs font-semibold text-slate-400 font-sans">Pegawai</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
        </div>

        <div className="del-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Didelegasikan</p>
            <p className="text-2xl font-black text-indigo-600 font-mono tabular-nums mt-0.5">
              {distinctDeptCount} <span className="text-xs font-semibold text-slate-400 font-sans">Unit</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building2 size={22} />
          </div>
        </div>

        <div className="del-kpi-card bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Otoritas</p>
            <p className="text-2xl font-black text-[#0173b6] font-mono tabular-nums mt-0.5">
              Aktif <span className="text-xs font-semibold text-slate-400 font-sans">Terpantau</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0173b6] flex items-center justify-center font-bold">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* LAYER 3: KONTROL FILTER & PENCARIAN */}
      <div className="del-filter bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Filter &amp; Pencarian Delegasi
          </span>
          {(searchQuery || (selectedUnitFilter && selectedUnitFilter.value !== "all")) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedUnitFilter({ value: "all", label: "Semua Unit" });
              }}
              className="btn btn-xs btn-ghost text-xs font-bold text-[#0173b6] hover:bg-blue-50 rounded-lg gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Input Pencarian */}
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Cari nama staff atau departemen wewenang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[38px] pl-9 pr-8 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0173b6] focus:ring-2 focus:ring-[#0173b6]/20 outline-none transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Unit Filter Dropdown */}
          <div>
            <SearchableSelect
              options={unitFilterOptions}
              value={selectedUnitFilter}
              onChange={(opt) => setSelectedUnitFilter(opt)}
              placeholder="Filter Berdasarkan Unit..."
              isClearable={false}
            />
          </div>
        </div>
      </div>

      {/* LAYER 4: BARIS JUDUL & COUNTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-[#05445e] tracking-tight">
            Daftar Wewenang Delegasi Jadwal
          </h2>
          <span className="badge badge-sm badge-neutral font-mono tabular-nums text-xs">
            {filteredDelegations.length} Akses
          </span>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Info size={14} className="text-[#0173b6]" />
          <span>Staff yang didelegasikan dapat membuka menu manajemen jadwal untuk unit terkait</span>
        </div>
      </div>

      {/* LAYER 5: TABEL DATA EKSEKUTIF */}
      <div
        ref={tableContainerRef}
        className="del-table-container bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#05445e] text-white uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-6">Nama Staff (Delegator)</th>
                <th className="py-3.5 px-6">Departemen / Unit Wewenang</th>
                <th className="py-3.5 px-6 font-mono">Tanggal Diberikan</th>
                <th className="py-3.5 px-4 text-center">Status Akses</th>
                <th className="py-3.5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-[#0173b6] animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Memuat berkas hak akses delegasi...</p>
                  </td>
                </tr>
              ) : currentDelegations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <AlertTriangle size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Belum ada delegasi akses jadwal</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Klik "Tambah Delegasi Akses" untuk memberikan wewenang ke staff.
                    </p>
                  </td>
                </tr>
              ) : (
                currentDelegations.map((del, idx) => (
                  <tr
                    key={del.id}
                    className={`del-row hover:bg-blue-50/40 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0173b6] border border-blue-100 flex items-center justify-center font-black text-xs shrink-0">
                          {del.nama_karyawan.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{del.nama_karyawan}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID Pegawai: {del.karyawan_id.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="badge badge-sm badge-info text-white bg-blue-600 border-blue-700 font-bold text-[10px]">
                        {del.nama_departemen}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 font-mono tabular-nums text-slate-600 font-semibold">
                      {new Date(del.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="badge badge-sm badge-success text-white font-bold text-[10px]">
                        Aktif
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => handleDeleteWithConfirmation(del)}
                        className="btn btn-xs btn-ghost text-rose-600 hover:bg-rose-50 rounded-lg px-2.5 py-1 font-bold text-[11px] gap-1"
                        title="Cabut Wewenang Akses"
                      >
                        <Trash2 size={14} />
                        <span>Cabut Akses</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* MODAL TAMBAH DELEGASI */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Delegasi Akses Jadwal"
        size="lg"
      >
        <form onSubmit={handleAdd} className="space-y-4 p-1">
          <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="text-[#0173b6] mt-0.5 shrink-0" size={16} />
            <div>
              <p className="font-bold">Ketentuan Delegasi Wewenang</p>
              <p className="text-blue-800/90 text-[11px] mt-0.5 leading-relaxed">
                Staff yang dipilih akan diberikan hak akses untuk mengelola jadwal kerja pada unit yang ditentukan, tanpa mengubah data hak akses atau role sistem secara keseluruhan.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Pilih Staff (Delegator)
            </label>
            <SearchableSelect
              options={karyawanOptions}
              value={selectedKaryawan}
              onChange={(opt) => setSelectedKaryawan(opt)}
              placeholder="Cari dan pilih nama staff..."
              isClearable={true}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Pilih Unit / Departemen Wewenang
            </label>
            <Select
              isMulti
              options={departemenOptions}
              value={selectedDepartemens}
              onChange={(val) => setSelectedDepartemens(val as any[])}
              placeholder="Pilih satu atau beberapa unit..."
              className="text-xs font-semibold"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ? "#0173b6" : "#e2e8f0",
                  borderRadius: "0.75rem",
                  padding: "2px",
                  backgroundColor: "#f8fafc",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#0173b6" },
                }),
              }}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn btn-sm btn-ghost text-xs font-bold text-slate-600 rounded-xl px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-sm bg-[#0173b6] hover:bg-[#005f98] text-white font-bold rounded-xl px-5 border-0 text-xs uppercase tracking-wider shadow-xs gap-1.5"
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : "Berikan Wewenang"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
