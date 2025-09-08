// File: app/(admin)/admin/departemen/page.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle } from "lucide-react";
import Modal from "@/app/components/modal"; // Menggunakan komponen Modal eksternal
import Pagination from "@/app/components/admin/Pagination"; // Menggunakan komponen Pagination eksternal

// --- Tipe Data ---
interface Department {
  id: number;
  nama_departemen: string;
  jenis_departemen: string;
}

// --- Komponen Utama Halaman ---
export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [formData, setFormData] = useState({
    nama_departemen: "",
    jenis_departemen: "Medis",
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // jika di browser
  const baseUrl =
    window.location.hostname === "localhost"
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : process.env.NEXT_PUBLIC_API_BASE_URL_LAN;

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
      const response = await fetch(`${baseUrl}/api/departments`);
      if (!response.ok)
        throw new Error(`Error ${response.status}: Gagal memuat data.`);
      const data: Department[] = await response.json();
      setDepartments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak terduga."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleOpenAddModal = () => {
    setFormData({ nama_departemen: "", jenis_departemen: "Medis" });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
      const response = await fetch(`${baseUrl}/api/departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menambahkan departemen.");
      }
      handleCloseModals();
      fetchDepartments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const handleOpenEditModal = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      nama_departemen: department.nama_departemen,
      jenis_departemen: department.jenis_departemen,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDepartment) return;
    try {
      if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
      const response = await fetch(
        `${baseUrl}/api/departments/${selectedDepartment.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal memperbarui departemen.");
      }
      handleCloseModals();
      fetchDepartments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const handleOpenDeleteModal = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDepartment) return;
    try {
      if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
      const response = await fetch(
        `${baseUrl}/api/departments/${selectedDepartment.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus departemen.");
      }
      handleCloseModals();
      fetchDepartments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const currentDepartments = departments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-dark">
          Manajemen Departemen
        </h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <PlusCircle size={20} />
          Tambah Departemen
        </button>
      </div>

      <div className="flex flex-col">
        <div className="bg-white shadow-md rounded-lg overflow-hidden ">
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-white uppercase bg-primary-dark">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Nama Departemen
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Jenis Departemen
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-red-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle size={24} />
                        <span>{error}</span>
                      </div>
                    </td>
                  </tr>
                ) : currentDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8">
                      Tidak ada data departemen.
                    </td>
                  </tr>
                ) : (
                  currentDepartments.map((dept) => (
                    <tr
                      key={dept.id}
                      className="bg-white border-b border-slate-300 last:border-b-0 hover:bg-slate-50"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap"
                      >
                        {dept.nama_departemen}
                      </th>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            dept.jenis_departemen.toLowerCase() === "medis"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {dept.jenis_departemen}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-4">
                        <button
                          onClick={() => handleOpenEditModal(dept)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(dept)}
                          className="text-red-600 hover:text-red-800"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
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

      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        title="Tambah Departemen Baru"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nama_departemen_add"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Departemen
              </label>
              <input
                type="text"
                id="nama_departemen_add"
                value={formData.nama_departemen}
                onChange={(e) =>
                  setFormData({ ...formData, nama_departemen: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label
                htmlFor="jenis_departemen_add"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Jenis Departemen
              </label>
              <select
                id="jenis_departemen_add"
                value={formData.jenis_departemen}
                onChange={(e) =>
                  setFormData({ ...formData, jenis_departemen: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option>Medis</option>
                <option>Non-Medis</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCloseModals}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Tambah
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        title="Edit Departemen"
      >
        <form onSubmit={handleUpdateSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nama_departemen_edit"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Departemen
              </label>
              <input
                type="text"
                id="nama_departemen_edit"
                value={formData.nama_departemen}
                onChange={(e) =>
                  setFormData({ ...formData, nama_departemen: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label
                htmlFor="jenis_departemen_edit"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Jenis Departemen
              </label>
              <select
                id="jenis_departemen_edit"
                value={formData.jenis_departemen}
                onChange={(e) =>
                  setFormData({ ...formData, jenis_departemen: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option>Medis</option>
                <option>Non-Medis</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCloseModals}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        title="Konfirmasi Hapus"
      >
        <div>
          <p className="text-slate-600">
            Apakah Anda yakin ingin menghapus departemen{" "}
            <strong>{selectedDepartment?.nama_departemen}</strong>?
          </p>
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleCloseModals}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
