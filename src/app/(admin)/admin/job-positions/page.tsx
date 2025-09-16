// File: app/(admin)/admin/job-positions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Loader2, Eye, Search } from "lucide-react";
import Modal from "@/app/components/modal";
import Pagination from "@/app/components/admin/Pagination";
import DynamicInputList from "@/app/components/admin/DynamicInputList";

interface JobPosition {
  id: number;
  nama_job: string;
  jenis_job: "Medis" | "Non-Medis";
  deskripsi_job: string[];
  kualifikasi_job: string[];
}

export default function JobPositionsPage() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(
    null
  );
  const [formData, setFormData] = useState({
    nama_job: "",
    jenis_job: "Non-Medis" as "Medis" | "Non-Medis",
    deskripsi_job: [] as string[],
    kualifikasi_job: [] as string[],
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State pencarian terpisah
  const [searchTermMedis, setSearchTermMedis] = useState("");
  const [searchTermNonMedis, setSearchTermNonMedis] = useState("");

  const [currentPageMedis, setCurrentPageMedis] = useState(1);
  const [currentPageNonMedis, setCurrentPageNonMedis] = useState(1);
  const itemsPerPage = 10;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${baseUrl}/jobs`);
      if (!response.ok) throw new Error("Gagal memuat data posisi pekerjaan.");
      const data = await response.json();
      setPositions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  // Reset paginasi saat filter pencarian berubah
  useEffect(() => {
    setCurrentPageMedis(1);
  }, [searchTermMedis]);

  useEffect(() => {
    setCurrentPageNonMedis(1);
  }, [searchTermNonMedis]);

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedPosition(null);
  };

  const handleOpenAddModal = () => {
    setFormData({
      nama_job: "",
      jenis_job: "Non-Medis",
      deskripsi_job: [""],
      kualifikasi_job: [""],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (pos: JobPosition) => {
    setSelectedPosition(pos);
    setFormData({ ...pos });
    setIsEditModalOpen(true);
  };

  const handleOpenDetailsModal = (pos: JobPosition) => {
    setSelectedPosition(pos);
    setFormData({ ...pos });
    setIsDetailsModalOpen(true);
  };

  const handleOpenDeleteModal = (pos: JobPosition) => {
    setSelectedPosition(pos);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, method: "POST" | "PUT") => {
    e.preventDefault();
    const url =
      method === "POST"
        ? `${baseUrl}/jobs`
        : `${baseUrl}/jobs/${selectedPosition?.id}`;

    const body = {
      ...formData,
      deskripsi_job: formData.deskripsi_job.filter(
        (line) => line.trim() !== ""
      ),
      kualifikasi_job: formData.kualifikasi_job.filter(
        (line) => line.trim() !== ""
      ),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok)
        throw new Error(
          `Gagal ${method === "POST" ? "menambah" : "memperbarui"} data.`
        );
      fetchPositions();
      handleCloseModals();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const confirmDelete = async () => {
    if (!selectedPosition) return;
    await fetch(`${baseUrl}/jobs/${selectedPosition.id}`, {
      method: "DELETE",
    });
    setPositions(positions.filter((p) => p.id !== selectedPosition.id));
    handleCloseModals();
  };

  // Logika filter dan paginasi
  const medisPositions = positions.filter(
    (p) =>
      p.jenis_job === "Medis" &&
      p.nama_job.toLowerCase().includes(searchTermMedis.toLowerCase())
  );
  const nonMedisPositions = positions.filter(
    (p) =>
      p.jenis_job === "Non-Medis" &&
      p.nama_job.toLowerCase().includes(searchTermNonMedis.toLowerCase())
  );

  const totalPagesMedis = Math.ceil(medisPositions.length / itemsPerPage);
  const currentMedisPositions = medisPositions.slice(
    (currentPageMedis - 1) * itemsPerPage,
    currentPageMedis * itemsPerPage
  );

  const totalPagesNonMedis = Math.ceil(nonMedisPositions.length / itemsPerPage);
  const currentNonMedisPositions = nonMedisPositions.slice(
    (currentPageNonMedis - 1) * itemsPerPage,
    currentPageNonMedis * itemsPerPage
  );

  const renderTable = (
    title: string,
    data: JobPosition[],
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void,
    searchTerm: string,
    setSearchTerm: (term: string) => void
  ) => (
    <div className="flex flex-col">
      <h2 className="text-xl font-bold text-primary-dark mb-4 px-4 pt-4">
        {title}
      </h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden flex-grow flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder={`Cari di ${title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-white uppercase bg-primary-dark">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nama Posisi
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={2} className="text-center p-8">
                    <Loader2 className="animate-spin" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center p-8 text-slate-500">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                data.map((pos) => (
                  <tr
                    key={pos.id}
                    className="bg-white border-b border-slate-300 last:border-b-0 hover:bg-slate-50"
                  >
                    <th scope="row" className="px-6 py-4 font-medium">
                      {pos.nama_job}
                    </th>
                    <td className="px-6 py-4 flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleOpenDetailsModal(pos)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(pos)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(pos)}
                        className="text-red-600 hover:text-red-800"
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
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-primary-dark">
          Manajemen Posisi Pekerjaan
        </h1>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark"
        >
          <PlusCircle size={20} />
          Tambah Posisi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
        {renderTable(
          "Posisi Non-Medis",
          currentNonMedisPositions,
          currentPageNonMedis,
          totalPagesNonMedis,
          setCurrentPageNonMedis,
          searchTermNonMedis,
          setSearchTermNonMedis
        )}
        {renderTable(
          "Posisi Medis",
          currentMedisPositions,
          currentPageMedis,
          totalPagesMedis,
          setCurrentPageMedis,
          searchTermMedis,
          setSearchTermMedis
        )}
      </div>

      {/* Modal Tambah */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        title="Tambah Posisi Baru"
        size="4xl"
      >
        <form onSubmit={(e) => handleSubmit(e, "POST")}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Posisi
                </label>
                <input
                  type="text"
                  value={formData.nama_job}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_job: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.jenis_job}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jenis_job: e.target.value as "Medis" | "Non-Medis",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option>Non-Medis</option>
                  <option>Medis</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DynamicInputList
                label="Kualifikasi"
                initialValues={formData.kualifikasi_job}
                onChange={(values) =>
                  setFormData({ ...formData, kualifikasi_job: values })
                }
              />
              <DynamicInputList
                label="Deskripsi"
                initialValues={formData.deskripsi_job}
                onChange={(values) =>
                  setFormData({ ...formData, deskripsi_job: values })
                }
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCloseModals}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Tambah
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Info */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        title="Edit Info Posisi"
      >
        <form onSubmit={(e) => handleSubmit(e, "PUT")}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Posisi
              </label>
              <input
                type="text"
                value={formData.nama_job}
                onChange={(e) =>
                  setFormData({ ...formData, nama_job: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={formData.jenis_job}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jenis_job: e.target.value as "Medis" | "Non-Medis",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>Non-Medis</option>
                <option>Medis</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCloseModals}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Detail */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        title={`Detail untuk ${selectedPosition?.nama_job}`}
        size="4xl"
      >
        <form onSubmit={(e) => handleSubmit(e, "PUT")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DynamicInputList
              label="Kualifikasi"
              initialValues={formData.kualifikasi_job}
              onChange={(values) =>
                setFormData({ ...formData, kualifikasi_job: values })
              }
            />
            <DynamicInputList
              label="Deskripsi"
              initialValues={formData.deskripsi_job}
              onChange={(values) =>
                setFormData({ ...formData, deskripsi_job: values })
              }
            />
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCloseModals}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Simpan Detail
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        title="Konfirmasi Hapus"
      >
        <div>
          <p>
            Apakah Anda yakin ingin menghapus posisi{" "}
            <strong>{selectedPosition?.nama_job}</strong>?
          </p>
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleCloseModals}
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
