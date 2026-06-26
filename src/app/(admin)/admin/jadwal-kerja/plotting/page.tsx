"use client";

import { useState, useEffect } from "react";
import { Loader2, UserCheck, CalendarRange, Search, Plus, ShieldCheck, Download, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import Modal from "@/app/components/modal";
import Pagination from "@/app/components/admin/Pagination";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

interface Karyawan {
  id: string;
  nama_lengkap: string;
  nik: string;
  nama_jadwal?: string;
  jadwal_kerja_id?: number;
}

interface Shift {
  id: number;
  nama_shift: string;
  jam_masuk?: string;
  jam_keluar?: string;
}

interface JadwalKerja {
  id: number;
  nama_jadwal: string;
}

interface BoardData {
  tanggal: string;
  shift_id: number;
  karyawan_id: string;
  nama_lengkap: string;
}

export default function ManajemenJadwalKaryawanPage() {
  const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [jadwals, setJadwals] = useState<JadwalKerja[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'DEFAULT' | 'BOARD_SHIFT' | 'BOARD_PIKET'>('DEFAULT');

  // --- TAB 1: DEFAULT STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState<Karyawan | null>(null);
  const [assignFormData, setAssignFormData] = useState({ jadwal_kerja_id: "" });

  // --- TAB 2 & 3: BOARD STATE ---
  const [plotMonth, setPlotMonth] = useState("");
  const [boardData, setBoardData] = useState<BoardData[]>([]);
  const [isFetchingBoard, setIsFetchingBoard] = useState(false);
  
  // Board Modal
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState<{tanggal: string, shift_id: number, shift_name: string} | null>(null);
  const [activeCatCell, setActiveCatCell] = useState<{tanggal: string, category: string} | null>(null);
  const [selectedShiftVariant, setSelectedShiftVariant] = useState<number | null>(null);
  const [selectedKaryawanIds, setSelectedKaryawanIds] = useState<string[]>([]);
  const [searchKaryawan, setSearchKaryawan] = useState("");

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const getShiftCategory = (nama_shift: string): string => {
      const name = nama_shift.toLowerCase();
      if (name.includes('libur') || name.includes('lepas')) return 'Libur';
      if (name.includes('malam')) return 'Malam';
      if (name.includes('siang')) return 'Siang';
      if (name.includes('middle')) return 'Middle';
      return 'Pagi'; 
  };
  const categories = ['Pagi', 'Middle', 'Siang', 'Malam', 'Libur'];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      let fetchKaryawanUrl = '/api/karyawan';
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role && !user.role.toLowerCase().includes('admin') && !user.role.toLowerCase().includes('hrd') && user.karyawan_id) {
                fetchKaryawanUrl = `/api/karyawan?superior_id=${user.karyawan_id}`;
            }
        }
      } catch (e) {}

      const [resKar, resShift, resJadwal] = await Promise.all([
        fetch(fetchKaryawanUrl), 
        fetch('/api/shift'),
        fetch('/api/jadwal-kerja')
      ]);
      if (resKar.ok) setKaryawans(await resKar.json());
      if (resShift.ok) setShifts(await resShift.json());
      if (resJadwal.ok) setJadwals(await resJadwal.json());
      
      const today = new Date();
      const localMonthStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().substring(0, 7);
      setPlotMonth(localMonthStr);
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Board Data
  const fetchBoardData = async () => {
      if (!plotMonth) return;
      setIsFetchingBoard(true);
      try {
          let fetchBoardUrl = `/api/karyawan-shift/board?month=${plotMonth}`;
          try {
              const userStr = localStorage.getItem("user");
              if (userStr) {
                  const user = JSON.parse(userStr);
                  if (user.role && !user.role.toLowerCase().includes('admin') && !user.role.toLowerCase().includes('hrd') && user.karyawan_id) {
                      fetchBoardUrl += `&superior_id=${user.karyawan_id}`;
                  }
              }
          } catch (e) {}

          const res = await fetch(fetchBoardUrl);
          if (res.ok) {
              setBoardData(await res.json());
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsFetchingBoard(false);
      }
  };

  useEffect(() => {
      if (activeTab === 'BOARD_SHIFT' || activeTab === 'BOARD_PIKET') {
          fetchBoardData();
      }
  }, [plotMonth, activeTab]);

  // --- ACTIONS TAB 1 ---
  const handleOpenAssignModal = (kar: Karyawan) => {
    setSelectedKaryawan(kar);
    setAssignFormData({ jadwal_kerja_id: kar.jadwal_kerja_id ? kar.jadwal_kerja_id.toString() : "" });
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedKaryawan) return;
    try {
      const response = await fetch(`/api/karyawan/${selectedKaryawan.id}/jadwal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jadwal_kerja_id: assignFormData.jadwal_kerja_id ? parseInt(assignFormData.jadwal_kerja_id) : null
        }),
      });
      if (!response.ok) throw new Error("Gagal assign jadwal default.");
      showSuccessToast("Jadwal default berhasil diatur!");
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  // --- ACTIONS TAB 2 & 3 ---
  const getDaysInMonth = (onlySaturdays = false) => {
      if (!plotMonth) return [];
      const [year, month] = plotMonth.split("-");
      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
      const days = [];
      for (let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${year}-${month}-${String(i).padStart(2, '0')}`;
          if (onlySaturdays) {
             if (new Date(dateStr).getDay() === 6) days.push(dateStr);
          } else {
             days.push(dateStr);
          }
      }
      return days;
  };

  const getDayName = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short' });
  };

  const handleCellClick = (tanggal: string, shift: Shift) => {
      setActiveCell({ tanggal, shift_id: shift.id, shift_name: shift.nama_shift });
      setActiveCatCell(null);
      // Find who is already assigned here
      const assigned = boardData.filter(b => b.tanggal === tanggal && b.shift_id === shift.id).map(b => b.karyawan_id);
      setSelectedKaryawanIds(assigned);
      setSearchKaryawan("");
      setIsBoardModalOpen(true);
  };

  const handleCellClickCat = (tanggal: string, category: string) => {
      setActiveCatCell({ tanggal, category });
      setActiveCell(null);
      
      const variants = shifts.filter(s => getShiftCategory(s.nama_shift) === category);
      if (variants.length > 0) {
          const firstVariantId = variants[0].id;
          setSelectedShiftVariant(firstVariantId);
          const assigned = boardData.filter(b => b.tanggal === tanggal && b.shift_id === firstVariantId).map(b => b.karyawan_id);
          setSelectedKaryawanIds(assigned);
      } else {
          setSelectedShiftVariant(null);
          setSelectedKaryawanIds([]);
      }
      
      setSearchKaryawan("");
      setIsBoardModalOpen(true);
  };

  const handleVariantChange = (shiftIdStr: string) => {
      const shiftId = parseInt(shiftIdStr);
      setSelectedShiftVariant(shiftId);
      if (activeCatCell) {
          const assigned = boardData.filter(b => b.tanggal === activeCatCell.tanggal && b.shift_id === shiftId).map(b => b.karyawan_id);
          setSelectedKaryawanIds(assigned);
      }
  };

  const toggleKaryawanSelection = (id: string) => {
      if (selectedKaryawanIds.includes(id)) {
          setSelectedKaryawanIds(selectedKaryawanIds.filter(v => v !== id));
      } else {
          setSelectedKaryawanIds([...selectedKaryawanIds, id]);
      }
  };

  const handleBoardSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      let submitTanggal = "";
      let submitShiftId = 0;

      if (activeCell) {
          submitTanggal = activeCell.tanggal;
          submitShiftId = activeCell.shift_id;
      } else if (activeCatCell && selectedShiftVariant) {
          submitTanggal = activeCatCell.tanggal;
          submitShiftId = selectedShiftVariant;
      } else {
          return;
      }

      try {
          const res = await fetch('/api/karyawan-shift/board', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  tanggal: submitTanggal,
                  shift_id: submitShiftId,
                  karyawan_ids: selectedKaryawanIds
              })
          });
          if (!res.ok) throw new Error("Gagal menyimpan plotting board.");
          showSuccessToast("Berhasil menyimpan assignment!");
          setIsBoardModalOpen(false);
          fetchBoardData(); // reload
      } catch (err) {
          showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
      }
  };

  const handleDownloadTemplate = () => {
      // Create empty template data
      const templateData = [
          { "NIP": "RSU001", "Nama Karyawan": "John Doe", "Tanggal": "2026-06-27", "Nama Shift": "Shift Pagi" },
          { "NIP": "RSU002", "Nama Karyawan": "Jane Doe", "Tanggal": "2026-06-27", "Nama Shift": "Shift Siang" }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template Plotting");
      
      XLSX.writeFile(workbook, "Template_Plotting_Shift.xlsx");
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!importFile) return;
      
      setIsImporting(true);
      const formData = new FormData();
      formData.append("file", importFile);

      try {
          const res = await fetch('/api/karyawan-shift/import', {
              method: 'POST',
              body: formData
          });
          const result = await res.json();
          if (res.ok) {
              showSuccessToast(result.message);
              setIsImportModalOpen(false);
              setImportFile(null);
              fetchBoardData();
          } else {
              showErrorToast(result.message || "Gagal mengimport file.");
              if (result.failedRows && result.failedRows.length > 0) {
                 console.error("Failed Rows:", result.failedRows);
                 alert("Beberapa data gagal diimport:\n" + result.failedRows.slice(0, 10).join("\n") + (result.failedRows.length > 10 ? "\n...dan lainnya" : ""));
              }
          }
      } catch (err) {
          showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
      } finally {
          setIsImporting(false);
      }
  };


  // Filtering for Default List
  const totalPages = Math.ceil(karyawans.length / itemsPerPage);
  const currentKaryawans = karyawans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredKaryawanForModal = karyawans.filter(k => 
      k.nama_lengkap.toLowerCase().includes(searchKaryawan.toLowerCase()) || 
      k.nik.includes(searchKaryawan)
  );

  // Filter shifts based on active tab
  const shiftingCols = shifts.filter(s => s.nama_shift.toLowerCase().includes('shift') || s.nama_shift.toLowerCase().includes('libur'));
  const piketCols = shifts.filter(s => s.nama_shift.includes('8-4 (Sabtu)'));

  return (
    <div className="p-8">
      <div className="flex flex-col mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary-dark">Manajemen Jadwal Karyawan</h1>
        <p className="text-sm text-slate-500 max-w-4xl">
          Gunakan <b>Assign Jadwal Default</b> untuk jadwal rutin. <br/>
          Gunakan <b>Board Shifting</b> khusus untuk tenaga medis / lapangan (Pagi/Siang/Malam/Libur). <br/>
          Gunakan <b>Board Piket Sabtu</b> untuk mengatur piket Koordinator/SPV. (Piket otomatis memicu jam 8-4 Mon-Fri).
        </p>

        <div className="flex border-b">
          <button 
            className={`py-2 px-4 font-semibold ${activeTab === 'DEFAULT' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('DEFAULT')}
          >
            <UserCheck className="inline-block mr-2" size={18}/>
            Assign Default
          </button>
          <button 
            className={`py-2 px-4 font-semibold ${activeTab === 'BOARD_SHIFT' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('BOARD_SHIFT')}
          >
            <CalendarRange className="inline-block mr-2" size={18}/>
            Board Shifting (24/7)
          </button>
          <button 
            className={`py-2 px-4 font-semibold ${activeTab === 'BOARD_PIKET' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('BOARD_PIKET')}
          >
            <ShieldCheck className="inline-block mr-2" size={18}/>
            Board Piket Sabtu (SPV)
          </button>
        </div>
      </div>

      {activeTab === 'DEFAULT' && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden ">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-white uppercase bg-primary-dark">
                  <tr>
                    <th className="px-6 py-3">NIK</th>
                    <th className="px-6 py-3">Nama Karyawan</th>
                    <th className="px-6 py-3 text-center">Jadwal Default</th>
                    <th className="px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={4} className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></td></tr>
                  ) : currentKaryawans.length === 0 ? (
                    <tr><td colSpan={4} className="text-center p-8">Tidak ada data karyawan.</td></tr>
                  ) : (
                    currentKaryawans.map((kar) => (
                      <tr key={kar.id} className="bg-white border-b border-slate-300 last:border-b-0 hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{kar.nik}</td>
                        <td className="px-6 py-4">{kar.nama_lengkap}</td>
                        <td className="px-6 py-4 text-center">
                            {kar.nama_jadwal ? (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{kar.nama_jadwal}</span>
                            ) : (
                                <span className="text-xs text-red-500 italic">Belum Diatur</span>
                            )}
                        </td>
                        <td className="px-6 py-4 flex justify-center gap-4">
                            <button onClick={() => handleOpenAssignModal(kar)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold">
                                <UserCheck size={14} /> Assign Template
                            </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
      )}

      {(activeTab === 'BOARD_SHIFT' || activeTab === 'BOARD_PIKET') && (
          <div className="bg-white p-6 shadow-md rounded-lg">
             <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <label className="font-semibold text-slate-700">Pilih Bulan & Tahun:</label>
                    <input 
                        type="month" 
                        value={plotMonth} 
                        onChange={(e) => setPlotMonth(e.target.value)} 
                        className="border rounded-md px-3 py-2 bg-slate-50 font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold hover:bg-slate-200 transition-colors">
                        <Download size={16} /> Template Excel
                    </button>
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                        <Upload size={16} /> Import Excel
                    </button>
                </div>
             </div>

             <div className="overflow-x-auto border border-slate-300 rounded-lg max-h-[70vh]">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-slate-800 text-white sticky top-0 z-10">
                         <tr>
                             <th className="px-4 py-3 border-r border-slate-600 w-24">Tanggal</th>
                             {activeTab === 'BOARD_SHIFT' ? categories.map(cat => (
                                 <th key={cat} className="px-4 py-3 border-r border-slate-600 min-w-[200px] font-semibold text-center">
                                     {cat}
                                 </th>
                             )) : piketCols.map(s => (
                                 <th key={s.id} className="px-4 py-3 border-r border-slate-600 min-w-[200px] font-semibold text-center">
                                     {s.nama_shift} {s.jam_masuk && <span className="text-xs font-normal opacity-80 block">{s.jam_masuk.slice(0,5)} - {s.jam_keluar?.slice(0,5)}</span>}
                                 </th>
                             ))}
                         </tr>
                     </thead>
                     <tbody>
                         {isFetchingBoard ? (
                             <tr><td colSpan={10} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32}/></td></tr>
                         ) : (
                             getDaysInMonth(activeTab === 'BOARD_PIKET').map(dateStr => {
                                 const isWeekend = new Date(dateStr).getDay() === 0;
                                 return (
                                     <tr key={dateStr} className={`border-b border-slate-200 ${isWeekend ? 'bg-red-50/40' : 'hover:bg-slate-50'}`}>
                                         <td className={`px-4 py-3 border-r border-slate-200 font-medium ${isWeekend ? 'text-red-600' : 'text-slate-700'}`}>
                                             <div className="flex flex-col items-center">
                                                 <span className="text-lg">{new Date(dateStr).getDate()}</span>
                                                 <span className="text-xs">{getDayName(dateStr)}</span>
                                             </div>
                                         </td>
                                         {(activeTab === 'BOARD_SHIFT' ? categories : piketCols).map((catOrShift, idx) => {
                                             if (activeTab === 'BOARD_SHIFT') {
                                                 const cat = catOrShift as string;
                                                 const assignedInCat = boardData.filter(b => {
                                                      const shiftInfo = shifts.find(s => s.id === b.shift_id);
                                                      return b.tanggal === dateStr && shiftInfo && getShiftCategory(shiftInfo.nama_shift) === cat;
                                                 });

                                                 return (
                                                     <td key={cat} onClick={() => handleCellClickCat(dateStr, cat)} className="px-2 py-2 border-r border-slate-200 cursor-pointer align-top group hover:bg-blue-50/50 transition-colors">
                                                         <div className="flex flex-wrap gap-1 min-h-[40px] items-start content-start">
                                                              {assignedInCat.length > 0 ? (
                                                                  assignedInCat.map((a, i) => {
                                                                      const shiftInfo = shifts.find(s => s.id === a.shift_id);
                                                                      const shiftName = shiftInfo?.nama_shift || '';
                                                                      return (
                                                                          <span key={i} title={shiftName} className={`text-[11px] px-2 py-1 rounded border ${cat === 'Libur' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-white text-slate-700 shadow-sm border-slate-200'}`}>
                                                                              {a.nama_lengkap.split(' ')[0]} <span className="opacity-50 ml-1">({shiftName})</span>
                                                                          </span>
                                                                      );
                                                                  })
                                                              ) : (
                                                                  <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                      <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                                                                          <Plus size={12}/> Assign {cat}
                                                                      </span>
                                                                  </div>
                                                              )}
                                                         </div>
                                                     </td>
                                                 )
                                             } else {
                                                 const s = catOrShift as Shift;
                                                 const assigned = boardData.filter(b => b.tanggal === dateStr && b.shift_id === s.id);
                                                 return (
                                                     <td 
                                                        key={s.id} 
                                                        onClick={() => handleCellClick(dateStr, s)}
                                                        className="px-2 py-2 border-r border-slate-200 cursor-pointer align-top group hover:bg-blue-50/50 transition-colors"
                                                     >
                                                         <div className="flex flex-wrap gap-1 min-h-[40px] items-start content-start">
                                                             {assigned.length > 0 ? (
                                                                 assigned.map((a, i) => (
                                                                     <span key={i} className={`text-[11px] px-2 py-1 rounded border bg-white text-slate-700 shadow-sm border-slate-200`}>
                                                                         {a.nama_lengkap.split(' ')[0]}
                                                                     </span>
                                                                 ))
                                                             ) : (
                                                                 <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                     <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                                                                         <Plus size={12}/> Assign
                                                                     </span>
                                                                 </div>
                                                             )}
                                                         </div>
                                                     </td>
                                                 )
                                             }
                                         })}
                                     </tr>
                                 )
                             })
                         )}
                     </tbody>
                 </table>
             </div>
          </div>
      )}


      {/* MODAL ASSIGN DEFAULT */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Assign Jadwal: ${selectedKaryawan?.nama_lengkap}`}>
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-sm text-slate-500 mb-4">
              Jadwal default ini akan selalu diterapkan ke karyawan setiap minggunya secara berulang.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Pilih Template Jadwal</label>
            <select value={assignFormData.jadwal_kerja_id} onChange={(e) => setAssignFormData({ jadwal_kerja_id: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                <option value="">-- Tidak Ada Jadwal (Bebas / Dihapus) --</option>
                {jadwals.map(j => (
                    <option key={j.id} value={j.id}>{j.nama_jadwal}</option>
                ))}
            </select>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-full">Batal</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-full">Simpan Jadwal</button>
          </div>
        </form>
      </Modal>

      {/* MODAL BOARD ASSIGNMENT */}
      <Modal isOpen={isBoardModalOpen} onClose={() => setIsBoardModalOpen(false)} title="Assign Pegawai" size="2xl">
          {(activeCell || activeCatCell) && (
              <form onSubmit={handleBoardSubmit} className="space-y-4">
                  <div className="bg-slate-100 p-4 rounded-lg flex justify-between items-center mb-4 border border-slate-200">
                      <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tanggal</p>
                          <p className="text-lg font-bold text-slate-800">{new Date((activeCell?.tanggal || activeCatCell?.tanggal) as string).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{activeCatCell ? `Kategori: ${activeCatCell.category}` : "Shift"}</p>
                          <p className="text-lg font-bold text-primary">{activeCatCell ? activeCatCell.category : activeCell?.shift_name}</p>
                      </div>
                  </div>

                  {activeCatCell && (
                      <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2 text-slate-700">Pilih Varian Shift</label>
                          <select 
                              className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"
                              value={selectedShiftVariant || ""}
                              onChange={(e) => handleVariantChange(e.target.value)}
                              required
                          >
                              {shifts.filter(s => getShiftCategory(s.nama_shift) === activeCatCell.category).map(s => (
                                  <option key={s.id} value={s.id}>
                                      {s.nama_shift} {s.jam_masuk ? `(${s.jam_masuk.slice(0,5)} - ${s.jam_keluar?.slice(0,5)})` : ''}
                                  </option>
                              ))}
                          </select>
                      </div>
                  )}

                  <div className="relative">
                      <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input 
                          type="text" 
                          placeholder="Cari nama atau NIK pegawai..." 
                          value={searchKaryawan}
                          onChange={(e) => setSearchKaryawan(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      />
                  </div>

                  <div className="border rounded-md overflow-hidden h-[300px] overflow-y-auto bg-white">
                      {filteredKaryawanForModal.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">Karyawan tidak ditemukan.</div>
                      ) : (
                          <div className="divide-y divide-slate-100">
                              {filteredKaryawanForModal.map(kar => (
                                  <label key={kar.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                                      <input 
                                          type="checkbox" 
                                          checked={selectedKaryawanIds.includes(kar.id)}
                                          onChange={() => toggleKaryawanSelection(kar.id)}
                                          className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                      />
                                      <div>
                                          <p className="font-medium text-slate-800">{kar.nama_lengkap}</p>
                                          <p className="text-xs text-slate-500">NIK: {kar.nik}</p>
                                      </div>
                                  </label>
                              ))}
                          </div>
                      )}
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                      <p className="text-sm text-slate-500">
                          <span className="font-semibold text-slate-800">{selectedKaryawanIds.length}</span> pegawai terpilih
                      </p>
                      <div className="flex gap-3">
                          <button type="button" onClick={() => setIsBoardModalOpen(false)} className="px-5 py-2 bg-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-300 transition-colors">Batal</button>
                          <button type="submit" className="px-5 py-2 bg-primary text-white rounded-full font-medium shadow-sm hover:bg-primary-dark transition-colors">Simpan Pegawai</button>
                      </div>
                  </div>
              </form>
          )}
      </Modal>

      {/* MODAL IMPORT EXCEL */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Template Jadwal" size="md">
          <form onSubmit={handleImportSubmit} className="space-y-6">
              <div className="text-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                  <FileSpreadsheet className="mx-auto text-slate-400 mb-3" size={48} />
                  <p className="text-sm text-slate-600 mb-4">
                      Unggah file <b>.xlsx</b> atau <b>.csv</b> yang telah Anda isi sesuai dengan format Template.
                  </p>
                  <input 
                      type="file" 
                      accept=".xlsx, .xls, .csv" 
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      required
                  />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-5 py-2 bg-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-300 transition-colors">Batal</button>
                  <button type="submit" disabled={!importFile || isImporting} className="px-5 py-2 bg-emerald-600 text-white rounded-full font-medium shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      {isImporting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                      {isImporting ? 'Mengimport...' : 'Import Data'}
                  </button>
              </div>
          </form>
      </Modal>
    </div>
  );
}
