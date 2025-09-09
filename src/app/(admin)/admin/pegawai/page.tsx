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
} from "lucide-react";
import Modal from "@/app/components/modal"; // Path diubah menjadi relatif
import Pagination from "@/app/components/admin/Pagination"; // Path diubah menjadi relatif

// Interface disesuaikan dengan data yang diterima dari API (termasuk join)
interface Karyawan {
  nip: string;
  nama_lengkap: string;
  profesi: string;
  handphone: string;
  email: string;
  status_kepegawaian: string;
  nama_departemen: string;
  nama_level: string;
}

export default function EmployeeManagementPage() {
  const [employeeList, setEmployeeList] = useState<Karyawan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<Karyawan | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State untuk pencarian dan paginasi
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL_LAN ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${baseUrl}/api/karyawan`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data karyawan");
        }
        const data = await response.json();
        setEmployeeList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, [baseUrl]);

  const handleOpenDeleteModal = (employee: Karyawan) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
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
        throw new Error("Gagal menghapus pegawai.");
      }
      setEmployeeList(
        employeeList.filter((emp) => emp.nip !== selectedEmployee.nip)
      );
      handleCloseModal();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus."
      );
    }
  };

  // Logika Filter dan Paginasi
  const filteredEmployees = employeeList.filter(
    (emp) =>
      emp.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
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

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari berdasarkan Nama atau NIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm"
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col flex-grow">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-sm text-left text-slate-500">
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
                    <Loader2 className="animate-spin" />
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
                      {employee.nama_lengkap}
                      <p className="font-normal text-slate-500 text-xs">
                        NIP: {employee.nip}
                      </p>
                    </th>
                    <td className="px-6 py-4">
                      {employee.nama_level || "-"}
                      <p className="text-slate-500 text-xs">
                        {employee.nama_departemen || "-"}
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
                          employee.status_kepegawaian === "Dokter Tetap"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {employee.status_kepegawaian}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-4">
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        title="Konfirmasi Hapus"
      >
        <div>
          <p>
            Apakah Anda yakin ingin menghapus data pegawai{" "}
            <strong>{selectedEmployee?.nama_lengkap}</strong>?
          </p>
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleCloseModal}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              className="rounded-full bg-red-600 px-4 py-2 text-sm text-white"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
