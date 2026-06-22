"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle, CalendarDays } from "lucide-react";
import Modal from "@/app/components/modal";
import Pagination from "@/app/components/admin/Pagination";

interface Shift {
  id: number;
  nama_shift: string;
}

interface JadwalDetail {
  hari: number;
  shift_id: number | null;
}

interface JadwalKerja {
  id: number;
  nama_jadwal: string;
  tipe: string;
  keterangan: string;
}

const HARI_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function TemplateJadwalPage() {
  const [jadwals, setJadwals] = useState<JadwalKerja[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedJadwal, setSelectedJadwal] = useState<JadwalKerja | null>(null);
  const [formData, setFormData] = useState({
    nama_jadwal: "",
    tipe: "FIXED",
    keterangan: "",
    details: Array.from({ length: 7 }, (_, i) => ({ hari: i, shift_id: null as number | null })),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resJadwal, resShift] = await Promise.all([
        fetch('/api/jadwal-kerja'),
        fetch('/api/shift')
      ]);
      if (!resJadwal.ok || !resShift.ok) throw new Error("Gagal memuat data.");
      setJadwals(await resJadwal.json());
      setShifts(await resShift.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedJadwal(null);
  };

  const handleOpenAddModal = () => {
    setFormData({
      nama_jadwal: "", tipe: "FIXED", keterangan: "",
      details: Array.from({ length: 7 }, (_, i) => ({ hari: i, shift_id: null })),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (jadwal: JadwalKerja) => {
    setSelectedJadwal(jadwal);
    try {
      const res = await fetch(`/api/jadwal-kerja/${jadwal.id}`);
      const data = await res.json();
      const details = Array.from({ length: 7 }, (_, i) => {
        const found = data.details?.find((d: any) => d.hari === i);
        return { hari: i, shift_id: found ? found.shift_id : null };
      });
      setFormData({
        nama_jadwal: data.nama_jadwal,
        tipe: data.tipe,
        keterangan: data.keterangan || "",
        details,
      });
      setIsModalOpen(true);
    } catch (err) {
      alert("Gagal mengambil detail jadwal.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const url = selectedJadwal ? `/api/jadwal-kerja/${selectedJadwal.id}` : '/api/jadwal-kerja';
      const method = selectedJadwal ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Gagal menyimpan jadwal.");
      handleCloseModals();
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const confirmDelete = async () => {
    if (!selectedJadwal) return;
    try {
      const response = await fetch(`/api/jadwal-kerja/${selectedJadwal.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus jadwal.");
      handleCloseModals();
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const totalPages = Math.ceil(jadwals.length / itemsPerPage);
  const currentJadwals = jadwals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-dark">Template Jadwal Kerja</h1>
        <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
          <PlusCircle size={20} /> Tambah Jadwal
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden ">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-white uppercase bg-primary-dark">
              <tr>
                <th className="px-6 py-3">Nama Jadwal</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Keterangan</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : currentJadwals.length === 0 ? (
                <tr><td colSpan={4} className="text-center p-8">Tidak ada data jadwal.</td></tr>
              ) : (
                currentJadwals.map((j) => (
                  <tr key={j.id} className="bg-white border-b border-slate-300 last:border-b-0 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{j.nama_jadwal}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${j.tipe === 'FIXED' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                            {j.tipe}
                        </span>
                    </td>
                    <td className="px-6 py-4">{j.keterangan}</td>
                    <td className="px-6 py-4 flex justify-center gap-4">
                      <button onClick={() => handleOpenEditModal(j)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                      <button onClick={() => { setSelectedJadwal(j); setIsDeleteModalOpen(true); }} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* FORM MODAL */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={selectedJadwal ? "Edit Jadwal" : "Tambah Jadwal"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Nama Jadwal</label>
                <input type="text" value={formData.nama_jadwal} onChange={(e) => setFormData({...formData, nama_jadwal: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Tipe Jadwal</label>
                <select value={formData.tipe} onChange={(e) => setFormData({...formData, tipe: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="FIXED">FIXED (Tetap Tiap Minggu)</option>
                    <option value="SHIFT">SHIFT (Berubah-ubah)</option>
                </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Keterangan</label>
            <input type="text" value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
          </div>

          {formData.tipe === 'FIXED' && (
              <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Pengaturan Jam Kerja (Per Hari)</h3>
                  <div className="space-y-2">
                      {formData.details.map((detail, index) => (
                          <div key={index} className="flex items-center gap-4">
                              <div className="w-24 text-sm font-medium">{HARI_NAMES[detail.hari]}</div>
                              <select 
                                value={detail.shift_id || ""} 
                                onChange={(e) => {
                                    const newDetails = [...formData.details];
                                    newDetails[index].shift_id = e.target.value ? parseInt(e.target.value) : null;
                                    setFormData({ ...formData, details: newDetails });
                                }}
                                className="flex-1 px-3 py-1 text-sm border rounded-md"
                              >
                                  <option value="">-- Libur / Off --</option>
                                  {shifts.map(s => (
                                      <option key={s.id} value={s.id}>{s.nama_shift}</option>
                                  ))}
                              </select>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-slate-200 rounded-full">Batal</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-full">Simpan</button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Hapus Jadwal">
        <p>Apakah Anda yakin ingin menghapus {selectedJadwal?.nama_jadwal}?</p>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={handleCloseModals} className="px-4 py-2 bg-slate-200 rounded-full">Batal</button>
          <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-full">Ya, Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
