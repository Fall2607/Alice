// File: app/(admin)/admin/pegawai/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Loader2,
  AlertTriangle,
  Eye,
} from "lucide-react";
import Modal from "@/app/components/modal";
import Pagination from "@/app/components/admin/Pagination";
import SearchableSelect from "@/app/components/admin/SearchableSelect";

type Option = { value: number | string; label: string };

interface Karyawan {
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
  nama_departemen: string;
  nama_level: string;
}

const DetailRow = ({ label, value }: { label: string; value: any }) => (
  <div className="py-2 px-2 even:bg-slate-50 grid grid-cols-3 gap-4">
    <dt className="font-medium text-slate-500">{label}</dt>
    <dd className="text-slate-700 col-span-2">{value || "-"}</dd>
  </div>
);

export default function EmployeeManagementPage() {
  const [employeeList, setEmployeeList] = useState<Karyawan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<Karyawan | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State untuk filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Option | null>(
    null
  );
  const [selectedLevel, setSelectedLevel] = useState<Option | null>(null);
  const [selectedGender, setSelectedGender] = useState<Option | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Option | null>(null);

  // State untuk options
  const [departmentOptions, setDepartmentOptions] = useState<Option[]>([]);
  const [levelOptions, setLevelOptions] = useState<Option[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Opsi statis untuk filter baru
  const genderOptions: Option[] = [
    { value: "all", label: "Semua Jenis Kelamin" },
    { value: "Laki-laki", label: "Laki-laki" },
    { value: "Perempuan", label: "Perempuan" },
  ];

  const statusOptions: Option[] = [
    { value: "all", label: "Semua Status" },
    { value: "Karyawan Tetap", label: "Karyawan Tetap" },
    { value: "Karyawan Kontrak", label: "Karyawan Kontrak" },
    { value: "Dokter Tetap", label: "Dokter Tetap" },
    { value: "Dokter Mitra", label: "Dokter Mitra" },
    { value: "Aktif", label: "Aktif" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL_LAN ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [karyawanRes, deptRes, levelRes] = await Promise.all([
          fetch(`${baseUrl}/api/karyawan`),
          fetch(`${baseUrl}/api/departments`),
          fetch(`${baseUrl}/api/level-jabatan`),
        ]);
        if (!karyawanRes.ok || !deptRes.ok || !levelRes.ok)
          throw new Error("Gagal mengambil data");
        const karyawanData = await karyawanRes.json();
        const deptData = await deptRes.json();
        const levelData = await levelRes.json();
        setEmployeeList(karyawanData);
        setDepartmentOptions([
          { value: "all", label: "Semua Departemen" },
          ...deptData.map((d: any) => ({
            value: d.nama_departemen,
            label: d.nama_departemen,
          })),
        ]);
        setLevelOptions([
          { value: "all", label: "Semua Level Jabatan" },
          ...levelData.map((l: any) => ({
            value: l.nama_level,
            label: l.nama_level,
          })),
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [baseUrl]);

  // Fungsi untuk mengecek apakah SIP sudah kedaluwarsa
  const isSipExpired = (sipDate?: string | null): boolean => {
    if (!sipDate) {
      return false; // Tidak kedaluwarsa jika tidak ada tanggal SIP
    }
    const expiryDate = new Date(sipDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bandingkan hanya tanggalnya saja
    return expiryDate < today;
  };

  const handleOpenViewModal = (employee: Karyawan) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleOpenDeleteModal = (employee: Karyawan) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;
    try {
      const response = await fetch(
        `${baseUrl}/api/karyawan/${selectedEmployee.nip}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Gagal menghapus pegawai");
      }
      setEmployeeList(
        employeeList.filter((e) => e.nip !== selectedEmployee.nip)
      );
    } catch (error) {
      console.error("Gagal menghapus:", error);
    } finally {
      handleCloseModals();
    }
  };

  const filteredEmployees = employeeList.filter((emp) => {
    const searchMatch =
      emp.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchTerm.toLowerCase());
    const departmentMatch =
      !selectedDepartment ||
      selectedDepartment.value === "all" ||
      emp.nama_departemen === selectedDepartment.value;
    const levelMatch =
      !selectedLevel ||
      selectedLevel.value === "all" ||
      emp.nama_level === selectedLevel.value;
    const genderMatch =
      !selectedGender ||
      selectedGender.value === "all" ||
      emp.jenis_kelamin === selectedGender.value;
    const statusMatch =
      !selectedStatus ||
      selectedStatus.value === "all" ||
      emp.status_kepegawaian === selectedStatus.value;
    return (
      searchMatch && departmentMatch && levelMatch && genderMatch && statusMatch
    );
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedDepartment,
    selectedLevel,
    selectedGender,
    selectedStatus,
  ]);

  const getLevelBadgeClass = (levelName: string) => {
    // ... existing code ...
    switch (levelName) {
      case "Direktur":
        return "bg-purple-100 text-purple-800";
      case "Wakil Direktur":
        return "bg-indigo-100 text-indigo-800";
      case "Supervisor":
        return "bg-blue-100 text-blue-800";
      case "Koordinator":
        return "bg-teal-100 text-teal-800";
      case "Staff":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDepartmentBadgeClass = (departmentName: string) => {
    // ... existing code ...
    if (!departmentName) return "bg-gray-100 text-gray-800";
    if (
      departmentName.toLowerCase().includes("igd") ||
      departmentName.toLowerCase().includes("icu")
    ) {
      return "bg-red-100 text-red-800";
    }
    if (departmentName.toLowerCase().includes("rawat")) {
      return "bg-sky-100 text-sky-800";
    }
    if (
      departmentName.toLowerCase().includes("farmasi") ||
      departmentName.toLowerCase().includes("laboratorium") ||
      departmentName.toLowerCase().includes("radiologi")
    ) {
      return "bg-amber-100 text-amber-800";
    }
    return "bg-gray-100 text-gray-800";
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
          <PlusCircle size={20} />
          Tambah Pegawai
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="relative lg:col-span-1">
          <input
            type="text"
            placeholder="Cari Nama atau NIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm"
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>
        <div>
          {isClient ? (
            <SearchableSelect
              options={departmentOptions}
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              placeholder="Filter departemen..."
            />
          ) : (
            <div className="w-full h-[42px] bg-slate-100 rounded-md animate-pulse"></div>
          )}
        </div>
        <div>
          {isClient ? (
            <SearchableSelect
              options={levelOptions}
              value={selectedLevel}
              onChange={setSelectedLevel}
              placeholder="Filter level jabatan..."
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
              onChange={setSelectedGender}
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
              onChange={setSelectedStatus}
              placeholder="Filter status..."
            />
          ) : (
            <div className="w-full h-[42px] bg-slate-100 rounded-md animate-pulse"></div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            {/* ... existing table code ... */}
            <thead className="text-xs text-white uppercase bg-primary-dark">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nama Pegawai
                </th>
                <th scope="col" className="px-6 py-3">
                  Jabatan
                </th>
                <th scope="col" className="px-6 py-3">
                  Kontak
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-red-500">
                    <AlertTriangle className="inline mr-2" />
                    {error}
                  </td>
                </tr>
              ) : currentEmployees.length > 0 ? (
                currentEmployees.map((employee) => (
                  <tr
                    key={employee.nip}
                    className="bg-white border-b border-slate-300 hover:bg-slate-50"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-slate-900"
                    >
                      <div className="flex items-center gap-2">
                        <span>{employee.nama_lengkap}</span>
                        {employee.sip &&
                          isSipExpired(employee.masa_berlaku_sip) && (
                            <div className="relative group">
                              <AlertTriangle
                                size={16}
                                className="text-red-500 cursor-pointer"
                              />
                              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                SIP sudah habis masa berlaku
                              </span>
                            </div>
                          )}
                      </div>
                      <p className="font-normal text-slate-500 text-xs">
                        NIP: {employee.nip}
                      </p>
                    </th>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeClass(
                          employee.nama_level
                        )}`}
                      >
                        {employee.nama_level || "-"}
                      </span>
                      <p className="text-slate-500 text-xs mt-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getDepartmentBadgeClass(
                            employee.nama_departemen
                          )}`}
                        >
                          {employee.nama_departemen || "-"}
                        </span>
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{employee.handphone || "-"}</p>
                      <p className="text-xs text-slate-500">
                        {employee.email || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          employee.status_kepegawaian === "Karyawan Tetap" ||
                          employee.status_kepegawaian === "Dokter Tetap" ||
                          employee.status_kepegawaian === "Aktif"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {employee.status_kepegawaian}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleOpenViewModal(employee)}
                        className="text-green-600 hover:text-green-800"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </button>
                      <Link
                        href={`/admin/pegawai/edit/${employee.nip}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleOpenDeleteModal(employee)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-500">
                    Tidak ada data pegawai yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        title={`Detail Pegawai: ${selectedEmployee?.nama_lengkap}`}
        size="3xl"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* ... existing modal code ... */}
            <section>
              <h3 className="font-semibold text-primary-dark border-b pb-2 mb-2">
                Data Diri & Kontak
              </h3>
              <dl className="divide-y divide-slate-100">
                <DetailRow label="NIP" value={selectedEmployee.nip} />
                <DetailRow
                  label="Nama Lengkap"
                  value={selectedEmployee.nama_lengkap}
                />
                <DetailRow label="NIK" value={selectedEmployee.nik} />
                <DetailRow
                  label="Tanggal Lahir"
                  value={
                    selectedEmployee.tanggal_lahir
                      ? new Date(
                          selectedEmployee.tanggal_lahir
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"
                  }
                />
                <DetailRow
                  label="Jenis Kelamin"
                  value={selectedEmployee.jenis_kelamin}
                />
                <DetailRow
                  label="No. Handphone"
                  value={selectedEmployee.handphone}
                />
                <DetailRow label="Email" value={selectedEmployee.email} />
                <DetailRow label="Alamat" value={selectedEmployee.alamat} />
              </dl>
            </section>
            <section>
              <h3 className="font-semibold text-primary-dark border-b pb-2 mb-2">
                Informasi Kepegawaian & Profesional
              </h3>
              <dl className="divide-y divide-slate-100">
                <DetailRow
                  label="Tanggal Masuk"
                  value={
                    selectedEmployee.tanggal_masuk
                      ? new Date(
                          selectedEmployee.tanggal_masuk
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"
                  }
                />
                <DetailRow
                  label="Status Kepegawaian"
                  value={selectedEmployee.status_kepegawaian}
                />
                <DetailRow
                  label="Departemen"
                  value={selectedEmployee.nama_departemen}
                />
                <DetailRow
                  label="Level Jabatan"
                  value={selectedEmployee.nama_level}
                />
                <DetailRow label="Profesi" value={selectedEmployee.profesi} />
                <DetailRow label="No. SIP" value={selectedEmployee.sip} />
                <DetailRow
                  label="Masa Berlaku SIP"
                  value={
                    <div className="flex items-center gap-2">
                      <span>
                        {selectedEmployee.masa_berlaku_sip
                          ? new Date(
                              selectedEmployee.masa_berlaku_sip
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                      {selectedEmployee.sip &&
                        isSipExpired(selectedEmployee.masa_berlaku_sip) && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Kedaluwarsa
                          </span>
                        )}
                    </div>
                  }
                />
              </dl>
            </section>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        title="Konfirmasi Hapus"
      >
        <div>
          <p>
            Apakah Anda yakin ingin menghapus data pegawai{" "}
            <strong>{selectedEmployee?.nama_lengkap}</strong>? Tindakan ini
            tidak dapat dibatalkan.
          </p>
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleCloseModals}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
