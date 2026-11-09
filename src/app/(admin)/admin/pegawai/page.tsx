"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Loader2,
  AlertTriangle,
  Eye,
  Info,
  ScanFace,
  Users,
  ShieldCheck,
  Stethoscope,
  X,
  RotateCcw,
  Briefcase,
  CreditCard,
} from "lucide-react";
import Modal from "@/app/components/modal";
import Pagination from "@/app/components/admin/Pagination";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

// Renamed to FormOption to avoid naming collisions with external components
type FormOption = { value: string; label: string };

type SipStatus = "expired" | "expiring_soon" | "safe" | "none";

interface Karyawan {
  id: string; // UUID Primary Key
  nip: string;
  nama_lengkap: string;
  nik: string;
  profesi: string;
  sip?: string;
  masa_berlaku_sip?: string;
  handphone: string;
  email: string;
  tanggal_lahir?: string;
  jenis_kelamin: string;
  alamat?: string;
  tanggal_masuk?: string;
  status_kepegawaian: string;
  gaji_pokok?: number;
  jabatan_id?: string; // UUID
  nama_departemen: string;
  nama_level: string;
  atasan_id?: string;
  nama_atasan?: string;
  sipStatus?: SipStatus;
  has_face_descriptor?: boolean;
  rekening_bsi?: string;
  alamat_domisili?: string;
}

interface Departemen {
  id: string; // UUID
  nama_departemen: string;
}

interface LevelJabatan {
  id: string; // UUID
  nama_level: string;
}

const getInitials = (name: string): string => {
  if (!name) return "??";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getSipStatus = (sipDate: string | null | undefined): SipStatus => {
  if (!sipDate) return "none";
  const expiry = new Date(sipDate);
  if (isNaN(expiry.getTime())) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setHours(0, 0, 0, 0);
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  expiry.setHours(0, 0, 0, 0);
  if (expiry < today) return "expired";
  if (expiry >= today && expiry <= threeMonthsFromNow) return "expiring_soon";
  return "safe";
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyle: { [key: string]: string } = {
    "Karyawan Tetap": "bg-blue-100 text-blue-800 border-blue-200/60",
    "Karyawan Kontrak": "bg-amber-100 text-amber-800 border-amber-200/60",
    "Dokter Tetap": "bg-emerald-100 text-emerald-800 border-emerald-200/60",
    "Dokter Mitra": "bg-purple-100 text-purple-800 border-purple-200/60",
  };
  const style = statusStyle[status] || "bg-slate-100 text-slate-800 border-slate-200/60";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold leading-tight rounded-full border ${style}`}
    >
      {status}
    </span>
  );
};

export default function EmployeeManagementPage() {
  const [employeeList, setEmployeeList] = useState<Karyawan[]>([]);
  const [departments, setDepartments] = useState<Departemen[]>([]);
  const [levels, setLevels] = useState<LevelJabatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState<FormOption | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<FormOption | null>(null);
  const [selectedGender, setSelectedGender] = useState<FormOption | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<FormOption | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [sipCurrentPage, setSipCurrentPage] = useState(1);
  const sipItemsPerPage = 10;

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Karyawan | null>(null);
  const [resignDate, setResignDate] = useState("");
  const [resignReason, setResignReason] = useState("");
  const [isResigning, setIsResigning] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [karyawanRes, deptRes, levelRes] = await Promise.all([
        fetch(`${baseUrl}/karyawan`),
        fetch(`${baseUrl}/departments`),
        fetch(`${baseUrl}/level-jabatan`),
      ]);

      if (!karyawanRes.ok) throw new Error("Gagal memuat data karyawan");
      if (!deptRes.ok) throw new Error("Gagal memuat data departemen");
      if (!levelRes.ok) throw new Error("Gagal memuat data level jabatan");

      const karyawanData = await karyawanRes.json();
      const deptData = await deptRes.json();
      const levelData = await levelRes.json();

      setEmployeeList(karyawanData);
      setDepartments(deptData);
      setLevels(levelData);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, [baseUrl]);

  const genderOptions: FormOption[] = [
    { value: "all", label: "Semua Jenis Kelamin" },
    { value: "Laki-laki", label: "Laki-laki" },
    { value: "Perempuan", label: "Perempuan" },
  ];
  const statusOptions: FormOption[] = [
    { value: "all", label: "Semua Status" },
    { value: "Karyawan Tetap", label: "Karyawan Tetap" },
    { value: "Karyawan Kontrak", label: "Karyawan Kontrak" },
    { value: "Dokter Tetap", label: "Dokter Tetap" },
    { value: "Dokter Mitra", label: "Dokter Mitra" },
  ];

  const processedEmployees = useMemo(() => {
    return employeeList
      .filter((emp) => {
        const searchMatch =
          !searchTerm ||
          emp.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.nip.toLowerCase().includes(searchTerm.toLowerCase());
        const departmentMatch =
          !selectedDept ||
          selectedDept.value === "all" ||
          emp.nama_departemen === selectedDept.label;
        const levelMatch =
          !selectedLevel ||
          selectedLevel.value === "all" ||
          emp.nama_level === selectedLevel.label;
        const genderMatch =
          !selectedGender ||
          selectedGender.value === "all" ||
          emp.jenis_kelamin === selectedGender.value;
        const statusMatch =
          !selectedStatus ||
          selectedStatus.value === "all" ||
          emp.status_kepegawaian === selectedStatus.value;
        return (
          searchMatch &&
          departmentMatch &&
          levelMatch &&
          genderMatch &&
          statusMatch
        );
      })
      .map((emp) => ({
        ...emp,
        sipStatus: getSipStatus(emp.masa_berlaku_sip),
      }));
  }, [
    employeeList,
    searchTerm,
    selectedDept,
    selectedLevel,
    selectedGender,
    selectedStatus,
  ]);

  // Urutan SIP: expired terlama lebih dulu -> expired terbaru -> expiring_soon terdekat -> expiring_soon terjauh
  const employeesWithSipIssues = useMemo(() => {
    const statusOrder = { expired: 1, expiring_soon: 2 };
    return processedEmployees
      .filter(
        (emp) =>
          emp.sipStatus === "expired" || emp.sipStatus === "expiring_soon",
      )
      .sort((a, b) => {
        const statusDiff =
          statusOrder[a.sipStatus as keyof typeof statusOrder] -
          statusOrder[b.sipStatus as keyof typeof statusOrder];
        if (statusDiff !== 0) return statusDiff;

        const timeA = a.masa_berlaku_sip ? new Date(a.masa_berlaku_sip).getTime() : 0;
        const timeB = b.masa_berlaku_sip ? new Date(b.masa_berlaku_sip).getTime() : 0;
        if (timeA !== timeB) return timeA - timeB;

        return a.nama_lengkap.localeCompare(b.nama_lengkap);
      });
  }, [processedEmployees]);

  const otherEmployees = useMemo(() => {
    return processedEmployees
      .filter((emp) => emp.sipStatus === "safe" || emp.sipStatus === "none")
      .sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap));
  }, [processedEmployees]);

  useEffect(() => {
    setCurrentPage(1);
    setSipCurrentPage(1);
  }, [searchTerm, selectedDept, selectedLevel, selectedGender, selectedStatus]);

  const hasActiveFilters = Boolean(
    searchTerm ||
      (selectedDept && selectedDept.value !== "all") ||
      (selectedLevel && selectedLevel.value !== "all") ||
      (selectedGender && selectedGender.value !== "all") ||
      (selectedStatus && selectedStatus.value !== "all")
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDept(null);
    setSelectedLevel(null);
    setSelectedGender(null);
    setSelectedStatus(null);
  };

  const handleCloseModals = () => {
    setIsDetailModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
    setResignDate("");
    setResignReason("");
  };

  const handleOpenDetailModal = (employee: Karyawan) => {
    setSelectedEmployee(employee);
    setIsDetailModalOpen(true);
  };

  const handleOpenDeleteModal = (employee: Karyawan) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;
    if (!resignDate || !resignReason.trim()) {
      showErrorToast("Tanggal keluar dan alasan resign wajib diisi!");
      return;
    }

    setIsResigning(true);
    try {
      const response = await fetch(
        `${baseUrl}/karyawan/${selectedEmployee.id}/resign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tanggal_keluar: resignDate,
            alasan_resign: resignReason,
          }),
        },
      );
      if (!response.ok) throw new Error("Gagal memberhentikan data pegawai.");
      showSuccessToast("Data pegawai berhasil diberhentikan (Resign)!");
      setEmployeeList(employeeList.filter((e) => e.id !== selectedEmployee.id));
      handleCloseModals();
    } catch (err: unknown) {
      showErrorToast(
        err instanceof Error ? err.message : "Gagal memberhentikan pegawai.",
      );
    } finally {
      setIsResigning(false);
    }
  };

  const itemOffset = (currentPage - 1) * itemsPerPage;
  const currentItems = otherEmployees.slice(
    itemOffset,
    itemOffset + itemsPerPage,
  );
  const totalPages = Math.ceil(otherEmployees.length / itemsPerPage);

  const sipItemOffset = (sipCurrentPage - 1) * sipItemsPerPage;
  const currentSipItems = employeesWithSipIssues.slice(
    sipItemOffset,
    sipItemOffset + sipItemsPerPage,
  );
  const sipTotalPages = Math.ceil(employeesWithSipIssues.length / sipItemsPerPage);

  return (
    <div className="p-8 font-sans min-h-screen space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary font-bold uppercase tracking-wider text-xs">
            <Users size={15} />
            <span>Direktori Kepegawaian & SDM</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark tracking-tight">
            Manajemen Pegawai
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Kelola data induk karyawan, riwayat status profesional (SIP), penempatan unit kerja, dan biometrik presensi.
          </p>
        </div>

        <Link
          href="/admin/pegawai/tambah"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-xl shadow-xs transition-all active:scale-[0.98] text-xs uppercase tracking-wider min-h-[44px]"
        >
          <PlusCircle size={16} />
          <span>Tambah Pegawai Baru</span>
        </Link>
      </div>

      {/* Filter Section (Langsung di bawah header) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Filter & Pencarian Pegawai
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Input Search NIP / Nama */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari NIP atau Nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={15}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Departemen */}
          <div>
            {isClient ? (
              <SearchableSelect
                options={[
                  { value: "all", label: "Semua Departemen" },
                  ...departments.map((d) => ({
                    value: d.id,
                    label: d.nama_departemen,
                  })),
                ]}
                value={selectedDept}
                onChange={(val) => setSelectedDept(val as FormOption | null)}
                placeholder="Semua Departemen"
              />
            ) : (
              <div className="w-full h-[38px] bg-slate-100 rounded-xl animate-pulse"></div>
            )}
          </div>

          {/* Filter Level Jabatan */}
          <div>
            {isClient ? (
              <SearchableSelect
                options={[
                  { value: "all", label: "Semua Level Jabatan" },
                  ...levels.map((l) => ({ value: l.id, label: l.nama_level })),
                ]}
                value={selectedLevel}
                onChange={(val) => setSelectedLevel(val as FormOption | null)}
                placeholder="Semua Level"
              />
            ) : (
              <div className="w-full h-[38px] bg-slate-100 rounded-xl animate-pulse"></div>
            )}
          </div>

          {/* Filter Jenis Kelamin */}
          <div>
            {isClient ? (
              <SearchableSelect
                options={genderOptions}
                value={selectedGender}
                onChange={(val) => setSelectedGender(val as FormOption | null)}
                placeholder="Semua Jenis Kelamin"
              />
            ) : (
              <div className="w-full h-[38px] bg-slate-100 rounded-xl animate-pulse"></div>
            )}
          </div>

          {/* Filter Status Kepegawaian */}
          <div>
            {isClient ? (
              <SearchableSelect
                options={statusOptions}
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val as FormOption | null)}
                placeholder="Semua Status"
              />
            ) : (
              <div className="w-full h-[38px] bg-slate-100 rounded-xl animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      {/* SIP Memerlukan Perhatian (Tabel Terpisah Berwarna Merah Standar, Maksimal 10 Baris) */}
      {employeesWithSipIssues.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle size={20} className="shrink-0" />
              <span>SIP Memerlukan Perhatian</span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
                {employeesWithSipIssues.length} Pegawai
              </span>
              {employeesWithSipIssues.length > sipItemsPerPage && (
                <span className="text-xs font-medium text-slate-500 font-mono tabular-nums">
                  (Menampilkan {sipItemOffset + 1}–{Math.min(sipItemOffset + sipItemsPerPage, employeesWithSipIssues.length)})
                </span>
              )}
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-red-200 shadow-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-xs text-white uppercase bg-primary-dark font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Nama Pegawai</th>
                    <th scope="col" className="px-6 py-3.5">Profesi & Jabatan</th>
                    <th scope="col" className="px-6 py-3.5">Departemen</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Masa Berlaku SIP</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {currentSipItems.map((emp) => {
                    const initials = getInitials(emp.nama_lengkap);
                    const isExpired = emp.sipStatus === "expired";

                    return (
                      <tr
                        key={emp.id}
                        className={`transition-colors ${
                          isExpired
                            ? "bg-red-50 hover:bg-red-100/80 text-red-950"
                            : "bg-yellow-50 hover:bg-yellow-100/80 text-yellow-950"
                        }`}
                      >
                        {/* Nama Pegawai */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border ${
                                isExpired
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }`}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => handleOpenDetailModal(emp)}
                                className="font-bold text-sm hover:underline text-left block truncate"
                              >
                                {emp.nama_lengkap}
                              </button>
                              <p className="text-xs font-mono tabular-nums opacity-75">
                                NIP: {emp.nip}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Profesi & Jabatan */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-xs">{emp.profesi || "-"}</p>
                          <p className="text-[11px] opacity-75 font-medium">
                            {emp.nama_level || "Staf"}
                          </p>
                        </td>

                        {/* Departemen */}
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-white/80 border border-slate-200/70 text-slate-800">
                            {emp.nama_departemen || "-"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={emp.status_kepegawaian} />
                        </td>

                        {/* Masa Berlaku SIP */}
                        <td className="px-6 py-4 font-mono tabular-nums">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">
                              {emp.masa_berlaku_sip
                                ? new Date(emp.masa_berlaku_sip).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </span>
                            {isExpired ? (
                              <span className="px-2.5 py-0.5 text-xs font-semibold text-red-800 bg-red-200/90 rounded-full border border-red-300">
                                SIP Kedaluwarsa
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 text-xs font-semibold text-yellow-800 bg-yellow-200/90 rounded-full border border-yellow-300">
                                SIP Akan Habis
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenDetailModal(emp)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-primary hover:bg-white transition-colors"
                              title="Lihat Detail Profil"
                            >
                              <Eye size={16} />
                            </button>
                            <Link
                              href={`/admin/pegawai/edit/${emp.id}`}
                              className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-white transition-colors"
                              title="Perbarui SIP"
                            >
                              <Edit size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={sipCurrentPage}
              totalPages={sipTotalPages}
              onPageChange={setSipCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Main Employee Directory Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary-dark">
            {employeesWithSipIssues.length > 0
              ? "Daftar Pegawai Lainnya"
              : "Daftar Seluruh Pegawai"}
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Total {otherEmployees.length} pegawai
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="text-xs text-white uppercase bg-primary-dark font-semibold">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Nama Pegawai</th>
                  <th scope="col" className="px-6 py-3.5">Profesi & Jabatan</th>
                  <th scope="col" className="px-6 py-3.5">Departemen</th>
                  <th scope="col" className="px-6 py-3.5">Status Kepegawaian</th>
                  <th scope="col" className="px-6 py-3.5">Biometrik Presensi</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="text-center p-12">
                      <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">
                        Memuat data pegawai...
                      </p>
                    </td>
                  </tr>
                )}
                {!isLoading && error && (
                  <tr>
                    <td colSpan={6} className="text-center p-12 text-rose-500">
                      <AlertTriangle className="mx-auto mb-2" size={24} />
                      <p className="text-xs font-bold">{error}</p>
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !error &&
                  currentItems.length > 0 &&
                  currentItems.map((employee) => {
                    const initials = getInitials(employee.nama_lengkap);

                    return (
                      <tr
                        key={employee.id}
                        className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        {/* Kolom Pegawai (Avatar + Nama + NIP) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary font-bold text-xs border border-blue-200/60 flex items-center justify-center shrink-0 shadow-xs">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => handleOpenDetailModal(employee)}
                                className="font-bold text-slate-900 text-sm hover:text-primary transition-colors text-left block truncate"
                                title="Klik untuk melihat profil lengkap"
                              >
                                {employee.nama_lengkap}
                              </button>
                              <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                                NIP: {employee.nip}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Kolom Profesi & Level */}
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800 text-xs">
                              {employee.profesi || "-"}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {employee.nama_level || "Staf"}
                            </p>
                          </div>
                        </td>

                        {/* Kolom Departemen */}
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                            {employee.nama_departemen || "-"}
                          </span>
                        </td>

                        {/* Kolom Status Kepegawaian */}
                        <td className="px-6 py-4">
                          <StatusBadge status={employee.status_kepegawaian} />
                        </td>

                        {/* Kolom Status Biometrik Wajah */}
                        <td className="px-6 py-4">
                          {employee.has_face_descriptor ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70">
                              <ShieldCheck size={13} className="text-emerald-600" />
                              <span>Terdaftar</span>
                            </span>
                          ) : (
                            <Link
                              href={`/admin/pegawai/enroll-face?nip=${employee.nip}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 hover:bg-amber-100 transition-colors"
                              title="Daftarkan Biometrik Wajah Pegawai"
                            >
                              <ScanFace size={13} className="text-amber-600" />
                              <span>Belum Ada</span>
                            </Link>
                          )}
                        </td>

                        {/* Kolom Aksi */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenDetailModal(employee)}
                              className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-blue-50 transition-colors"
                              title="Lihat Detail Profil"
                              aria-label="Lihat Detail"
                            >
                              <Eye size={16} />
                            </button>
                            <Link
                              href={`/admin/pegawai/edit/${employee.id}`}
                              className="p-2 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                              title="Edit Data Pegawai"
                              aria-label="Edit Pegawai"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => handleOpenDeleteModal(employee)}
                              className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Resign / Berhentikan"
                              aria-label="Resign Pegawai"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {!isLoading && !error && currentItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-12">
                      <Info className="mx-auto mb-2 text-slate-300" size={32} />
                      <p className="text-xs font-bold text-slate-500">
                        Tidak ada data pegawai yang sesuai dengan filter pencarian.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                        >
                          Reset Semua Filter
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal Detail Pegawai (Bespoke Medical HR Profile) */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModals}
        title="Detail Data Pegawai"
        size="5xl"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Header Profil Singkat */}
            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary text-white text-xl font-bold flex items-center justify-center shadow-xs shrink-0">
                  {getInitials(selectedEmployee.nama_lengkap)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedEmployee.nama_lengkap}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="font-mono tabular-nums font-semibold">
                      NIP: {selectedEmployee.nip}
                    </span>
                    <span>•</span>
                    <span className="font-medium">{selectedEmployee.profesi}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selectedEmployee.status_kepegawaian} />
                {selectedEmployee.has_face_descriptor ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Wajah Terdaftar</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                    <ScanFace size={14} className="text-amber-600" />
                    <span>Belum Ada Wajah</span>
                  </span>
                )}
              </div>
            </div>

            {/* Grid 4 Kartu Rincian Profil */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Kartu Informasi Pribadi */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Users size={15} />
                  <span>Informasi Pribadi</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">NIP</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {selectedEmployee.nip}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">NIK (KTP)</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {selectedEmployee.nik}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Jenis Kelamin</span>
                    <span className="font-semibold text-slate-900">
                      {selectedEmployee.jenis_kelamin}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Tanggal Lahir</span>
                    <span className="font-semibold text-slate-900 font-mono tabular-nums">
                      {selectedEmployee.tanggal_lahir
                        ? new Date(selectedEmployee.tanggal_lahir).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium shrink-0">Alamat KTP</span>
                    <span className="font-medium text-slate-800 text-right">
                      {selectedEmployee.alamat || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium shrink-0">Domisili</span>
                    <span className="font-medium text-slate-800 text-right">
                      {selectedEmployee.alamat_domisili || selectedEmployee.alamat || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kartu Informasi Kepegawaian */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Briefcase size={15} />
                  <span>Informasi Kepegawaian</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Departemen</span>
                    <span className="font-bold text-slate-900">
                      {selectedEmployee.nama_departemen || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Level Jabatan</span>
                    <span className="font-semibold text-slate-900">
                      {selectedEmployee.nama_level || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Atasan Langsung</span>
                    <span className="font-semibold text-slate-900">
                      {selectedEmployee.nama_atasan || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Status Kerja</span>
                    <StatusBadge status={selectedEmployee.status_kepegawaian} />
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Tanggal Masuk</span>
                    <span className="font-semibold text-slate-900 font-mono tabular-nums">
                      {selectedEmployee.tanggal_masuk
                        ? new Date(selectedEmployee.tanggal_masuk).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kartu Informasi Profesional & SIP */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Stethoscope size={15} />
                  <span>Kredensial Profesional (SIP)</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Profesi Medis</span>
                    <span className="font-bold text-slate-900">
                      {selectedEmployee.profesi || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Nomor SIP</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {selectedEmployee.sip || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Masa Berlaku SIP</span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="font-semibold text-slate-900">
                        {selectedEmployee.masa_berlaku_sip
                          ? new Date(selectedEmployee.masa_berlaku_sip).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                      {selectedEmployee.sipStatus === "expired" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">
                          Kedaluwarsa
                        </span>
                      )}
                      {selectedEmployee.sipStatus === "expiring_soon" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                          Akan Habis
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Kartu Kontak & Finansial */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CreditCard size={15} />
                  <span>Kontak & Finansial</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Email</span>
                    <span className="font-medium text-slate-900">
                      {selectedEmployee.email || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">No. Handphone</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {selectedEmployee.handphone || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 font-medium">Rekening BSI</span>
                    <span className="font-mono font-bold text-primary tabular-nums">
                      {selectedEmployee.rekening_bsi || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href={`/admin/pegawai/edit/${selectedEmployee.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
              >
                <Edit size={14} />
                <span>Edit Data Pegawai</span>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Konfirmasi Resign Pegawai */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        title="Konfirmasi Resign Pegawai"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-1.5">
            <p className="text-xs text-rose-800 font-medium">
              Anda akan memproses pemberhentian status kepegawaian untuk:
            </p>
            <p className="font-bold text-slate-900 text-sm">
              {selectedEmployee?.nama_lengkap}{" "}
              <span className="font-mono text-xs text-slate-500">
                (NIP: {selectedEmployee?.nip})
              </span>
            </p>
            <p className="text-[11px] text-slate-500">
              Data tetap tersimpan di riwayat arsip kepegawaian dan status diubah menjadi nonaktif.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Tanggal Keluar Resmi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-bold text-slate-800 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono tabular-nums"
                value={resignDate}
                onChange={(e) => setResignDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Alasan Resign / Pemberhentian <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-700 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                placeholder="Tuliskan keterangan detail alasan pengunduran diri / pemberhentian..."
                value={resignReason}
                onChange={(e) => setResignReason(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              onClick={handleCloseModals}
              disabled={isResigning}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50 min-h-[40px]"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              disabled={isResigning}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 min-h-[40px]"
            >
              {isResigning && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Ya, Proses Resign</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
