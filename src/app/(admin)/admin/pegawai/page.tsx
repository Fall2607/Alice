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

const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm even:bg-slate-50/50">
    <div className="font-medium text-slate-500">{label}</div>
    <div className="col-span-2 text-slate-900 break-words">{children}</div>
  </div>
);

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
    "Karyawan Tetap": "bg-blue-100 text-blue-800",
    "Karyawan Kontrak": "bg-amber-100 text-amber-800",
    "Dokter Tetap": "bg-emerald-100 text-emerald-800",
    "Dokter Mitra": "bg-slate-100 text-slate-800",
  };
  const style = statusStyle[status] || "bg-gray-100 text-gray-800";
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold leading-tight rounded-full ${style}`}
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

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Karyawan | null>(
    null,
  );
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

      if (!karyawanRes.ok) throw new Error(`Gagal memuat data karyawan`);
      if (!deptRes.ok) throw new Error(`Gagal memuat data departemen`);
      if (!levelRes.ok) throw new Error(`Gagal memuat data level`);

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

  const employeesWithSipIssues = useMemo(() => {
    const statusOrder = { expired: 1, expiring_soon: 2 };
    return processedEmployees
      .filter(
        (emp) =>
          emp.sipStatus === "expired" || emp.sipStatus === "expiring_soon",
      )
      .sort((a, b) => {
        const statusDifference =
          statusOrder[a.sipStatus as keyof typeof statusOrder] -
          statusOrder[b.sipStatus as keyof typeof statusOrder];
        if (statusDifference !== 0) return statusDifference;
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
  }, [searchTerm, selectedDept, selectedLevel, selectedGender, selectedStatus]);

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

  const renderTableRows = (employees: Karyawan[]) => {
    return employees.map((employee) => {
      const rowClass = {
        expired: "bg-red-50 hover:bg-red-100",
        expiring_soon: "bg-yellow-50 hover:bg-yellow-100",
        safe: "bg-white hover:bg-slate-50",
        none: "bg-white hover:bg-slate-50",
      }[employee.sipStatus!];

      return (
        <tr
          key={employee.id}
          className={`${rowClass} border-b border-slate-300 last:border-b-0`}
        >
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium text-slate-900">
                  {employee.nama_lengkap}
                </p>
                <p className="text-xs text-slate-500">NIP: {employee.nip}</p>
              </div>
              {employee.sipStatus === "expired" && (
                <span className="px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-200 rounded-full">
                  SIP Kedaluwarsa
                </span>
              )}
              {employee.sipStatus === "expiring_soon" && (
                <span className="px-2 py-0.5 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">
                  SIP Akan Habis
                </span>
              )}
            </div>
          </td>
          <td className="px-6 py-4">{employee.profesi}</td>
          <td className="px-6 py-4">{employee.nama_departemen || "-"}</td>
          <td className="px-6 py-4">
            <StatusBadge status={employee.status_kepegawaian} />
          </td>
          <td className="px-6 py-4 flex items-center justify-center gap-2">
            {!employee.has_face_descriptor && (
               <Link
                 href={`/admin/pegawai/enroll-face?nip=${employee.nip}`}
                 className="text-emerald-600 hover:text-emerald-800"
                 title="Daftarkan Wajah Karyawan (Enroll Face)"
               >
                 <ScanFace size={18} />
               </Link>
            )}
            <button
              onClick={() => handleOpenDetailModal(employee)}
              className="text-slate-500 hover:text-primary"
              title="Lihat Detail"
            >
              <Eye size={18} />
            </button>
            <Link
              href={`/admin/pegawai/edit/${employee.id}`}
              className="text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <Edit size={18} />
            </Link>
            <button
              onClick={() => handleOpenDeleteModal(employee)}
              className="text-red-600 hover:text-red-800"
              title="Resign / Berhentikan"
            >
              <Trash2 size={18} />
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-dark">
          Manajemen Pegawai
        </h1>
        <Link
          href="/admin/pegawai/tambah"
          className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark"
        >
          <PlusCircle size={20} /> Tambah Pegawai
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="relative lg:col-span-1">
          <input
            type="text"
            placeholder="Cari NIP atau Nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
        </div>
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
              placeholder="Filter departemen..."
            />
          ) : (
            <div className="w-full h-[42px] bg-slate-100 rounded-md animate-pulse"></div>
          )}
        </div>
        <div>
          {isClient ? (
            <SearchableSelect
              options={[
                { value: "all", label: "Semua Level" },
                ...levels.map((l) => ({ value: l.id, label: l.nama_level })),
              ]}
              value={selectedLevel}
              onChange={(val) => setSelectedLevel(val as FormOption | null)}
              placeholder="Filter level..."
            />
          ) : (
            <div className="w-full h-[42px] bg-slate-100 rounded-md animate-pulse"></div>
          )}
        </div>
        <div>
          {isClient ? (
            <SearchableSelect
              options={genderOptions}
              value={selectedGender}
              onChange={(val) => setSelectedGender(val as FormOption | null)}
              placeholder="Filter jenis kelamin..."
            />
          ) : (
            <div className="w-full h-[42px] bg-slate-100 rounded-md animate-pulse"></div>
          )}
        </div>
        <div>
          {isClient ? (
            <SearchableSelect
              options={statusOptions}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val as FormOption | null)}
              placeholder="Filter status..."
            />
          ) : (
            <div className="w-full h-[42px] bg-slate-100 rounded-md animate-pulse"></div>
          )}
        </div>
      </div>

      {employeesWithSipIssues.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-red-600 mb-3 flex items-center gap-2">
            SIP Memerlukan Perhatian
          </h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-white uppercase bg-primary-dark">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Nama Pegawai
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Profesi
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Departemen
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>{renderTableRows(employeesWithSipIssues)}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-primary-dark py-4">
        {employeesWithSipIssues.length > 0
          ? "Daftar Pegawai Lainnya"
          : "Daftar Pegawai"}
      </h2>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-white uppercase bg-primary-dark">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nama Pegawai
                </th>
                <th scope="col" className="px-6 py-3">
                  Profesi
                </th>
                <th scope="col" className="px-6 py-3">
                  Departemen
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-red-500">
                    <AlertTriangle className="inline mr-2" /> {error}
                  </td>
                </tr>
              )}
              {!isLoading &&
                !error &&
                currentItems.length > 0 &&
                renderTableRows(currentItems)}
              {!isLoading && !error && currentItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    <Info className="mx-auto mb-2 text-slate-400" />
                    Tidak ada data pegawai yang cocok dengan filter.
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

      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModals}
        title="Detail Pegawai"
        size="5xl"
      >
        {selectedEmployee && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-800 px-4">
                  Informasi Pribadi
                </h3>
                <div className="mt-2 overflow-hidden border border-slate-200 rounded-lg">
                  <dl>
                    <DetailRow label="Nama Lengkap">
                      {selectedEmployee.nama_lengkap}
                    </DetailRow>
                    <DetailRow label="NIP">{selectedEmployee.nip}</DetailRow>
                    <DetailRow label="NIK">{selectedEmployee.nik}</DetailRow>
                    <DetailRow label="Jenis Kelamin">
                      {selectedEmployee.jenis_kelamin}
                    </DetailRow>
                    <DetailRow label="Tanggal Lahir">
                      {selectedEmployee.tanggal_lahir
                        ? new Date(
                            selectedEmployee.tanggal_lahir,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </DetailRow>
                    <DetailRow label="Alamat">
                      {selectedEmployee.alamat}
                    </DetailRow>
                  </dl>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 px-4">
                  Informasi Kontak
                </h3>
                <div className="mt-2 overflow-hidden border border-slate-200 rounded-lg">
                  <dl>
                    <DetailRow label="Email">
                      {selectedEmployee.email}
                    </DetailRow>
                    <DetailRow label="No. Handphone">
                      {selectedEmployee.handphone}
                    </DetailRow>
                    <DetailRow label="Alamat Domisili">
                      {selectedEmployee.alamat_domisili || selectedEmployee.alamat}
                    </DetailRow>
                  </dl>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 px-4">
                  Informasi Finansial
                </h3>
                <div className="mt-2 overflow-hidden border border-slate-200 rounded-lg">
                  <dl>
                    <DetailRow label="Rekening BSI">
                      {selectedEmployee.rekening_bsi || "-"}
                    </DetailRow>
                  </dl>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-800 px-4">
                  Informasi Kepegawaian
                </h3>
                <div className="mt-2 overflow-hidden border border-slate-200 rounded-lg">
                  <dl>
                    <DetailRow label="Departemen">
                      {selectedEmployee.nama_departemen || "-"}
                    </DetailRow>
                    <DetailRow label="Level Jabatan">
                      {selectedEmployee.nama_level || "-"}
                    </DetailRow>
                    <DetailRow label="Atasan">
                      {selectedEmployee.nama_atasan || "-"}
                    </DetailRow>
                    <DetailRow label="Status">
                      <StatusBadge
                        status={selectedEmployee.status_kepegawaian}
                      />
                    </DetailRow>
                    <DetailRow label="Tanggal Masuk">
                      {selectedEmployee.tanggal_masuk
                        ? new Date(
                            selectedEmployee.tanggal_masuk,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </DetailRow>
                  </dl>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 px-4">
                  Informasi Profesional
                </h3>
                <div className="mt-2 overflow-hidden border border-slate-200 rounded-lg">
                  <dl>
                    <DetailRow label="Profesi">
                      {selectedEmployee.profesi}
                    </DetailRow>
                    <DetailRow label="Nomor SIP">
                      {selectedEmployee.sip || "-"}
                    </DetailRow>
                    <DetailRow label="Masa Berlaku SIP">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>
                          {selectedEmployee.masa_berlaku_sip
                            ? new Date(
                                selectedEmployee.masa_berlaku_sip,
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "-"}
                        </span>
                        {selectedEmployee.sipStatus === "expired" && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Kedaluwarsa
                          </span>
                        )}
                        {selectedEmployee.sipStatus === "expiring_soon" && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Akan Habis
                          </span>
                        )}
                      </div>
                    </DetailRow>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        title="Konfirmasi Resign Pegawai"
      >
        <div>
          <p className="mb-4 text-slate-600">
            Anda akan memberhentikan status kepegawaian untuk{" "}
            <strong className="text-slate-800">{selectedEmployee?.nama_lengkap}</strong>.
            Data ini tidak akan dihapus dari sistem, namun statusnya akan menjadi nonaktif.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tanggal Keluar <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                value={resignDate}
                onChange={(e) => setResignDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Alasan Resign / Berhenti <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-24"
                placeholder="Tuliskan alasan pengunduran diri / pemberhentian..."
                value={resignReason}
                onChange={(e) => setResignReason(e.target.value)}
                required
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleCloseModals}
              disabled={isResigning}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              disabled={isResigning}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isResigning && <Loader2 className="w-4 h-4 animate-spin" />}
              Ya, Proses Resign
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
