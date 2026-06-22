"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle, Clock } from "lucide-react";
import Modal from "@/app/components/modal";
import Pagination from "@/app/components/admin/Pagination";

interface Shift {
  id: number;
  nama_shift: string;
  jam_masuk: string;
  jam_keluar: string;
  is_cross_day: boolean;
}

export default function MasterShiftPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    nama_shift: "",
    jam_masuk: "",
    jam_keluar: "",
    is_cross_day: false,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchShifts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/shift');
      if (!response.ok) throw new Error(`Error: Gagal memuat data shift.`);
      const data: Shift[] = await response.json();
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedShift(null);
  };

  const handleOpenAddModal = () => {
    setFormData({ nama_shift: "", jam_masuk: "", jam_keluar: "", is_cross_day: false });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/shift', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Gagal menambahkan shift.");
      handleCloseModals();
      fetchShifts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const handleOpenEditModal = (shift: Shift) => {
    setSelectedShift(shift);
    setFormData({
      nama_shift: shift.nama_shift,
      jam_masuk: shift.jam_masuk,
      jam_keluar: shift.jam_keluar,
      is_cross_day: shift.is_cross_day,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedShift) return;
    try {
      const response = await fetch(`/api/shift/${selectedShift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Gagal memperbarui shift.");
      handleCloseModals();
      fetchShifts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const handleOpenDeleteModal = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedShift) return;
    try {
      const response = await fetch(`/api/shift/${selectedShift.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus shift.");
      handleCloseModals();
      fetchShifts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const totalPages = Math.ceil(shifts.length / itemsPerPage);
  const currentShifts = shifts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-dark">Master Shift</h1>
        <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
          <PlusCircle size={20} /> Tambah Shift
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden ">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-white uppercase bg-primary-dark">
              <tr>
                <th className="px-6 py-3">Nama Shift</th>
                <th className="px-6 py-3">Jam Masuk</th>
                <th className="px-6 py-3">Jam Keluar</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : currentShifts.length === 0 ? (
                <tr><td colSpan={4} className="text-center p-8">Tidak ada data shift.</td></tr>
              ) : (
                currentShifts.map((shift) => (
                  <tr key={shift.id} className="bg-white border-b border-slate-300 last:border-b-0 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{shift.nama_shift}</td>
                    <td className="px-6 py-4">{shift.jam_masuk}</td>
                    <td className="px-6 py-4">{shift.jam_keluar}</td>
                    <td className="px-6 py-4 flex justify-center gap-4">
                      <button onClick={() => handleOpenEditModal(shift)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                      <button onClick={() => handleOpenDeleteModal(shift)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* ADD MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseModals} title="Tambah Shift">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Shift</label>
            <input type="text" value={formData.nama_shift} onChange={(e) => setFormData({...formData, nama_shift: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jam Masuk (HH:mm)</label>
              <input type="time" value={formData.jam_masuk} onChange={(e) => setFormData({...formData, jam_masuk: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jam Keluar (HH:mm)</label>
              <input type="time" value={formData.jam_keluar} onChange={(e) => setFormData({...formData, jam_keluar: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-slate-200 rounded-full">Batal</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-full">Simpan</button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={handleCloseModals} title="Edit Shift">
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Shift</label>
            <input type="text" value={formData.nama_shift} onChange={(e) => setFormData({...formData, nama_shift: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jam Masuk (HH:mm)</label>
              <input type="time" value={formData.jam_masuk} onChange={(e) => setFormData({...formData, jam_masuk: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jam Keluar (HH:mm)</label>
              <input type="time" value={formData.jam_keluar} onChange={(e) => setFormData({...formData, jam_keluar: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-slate-200 rounded-full">Batal</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-full">Simpan</button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Hapus Shift">
        <p>Apakah Anda yakin ingin menghapus {selectedShift?.nama_shift}?</p>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={handleCloseModals} className="px-4 py-2 bg-slate-200 rounded-full">Batal</button>
          <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-full">Ya, Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
