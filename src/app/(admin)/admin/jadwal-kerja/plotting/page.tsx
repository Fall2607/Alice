"use client";

import { useState, useEffect } from "react";
import { Loader2, UserCheck, CalendarRange, Search, Plus, ShieldCheck, Download, Upload, FileSpreadsheet, CheckSquare, Square, AlertCircle, CheckCircle2, Info, Filter, X } from "lucide-react";
import Select from "react-select";
import Modal from "@/app/components/modal";
import Pagination from "@/app/components/admin/Pagination";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

interface Karyawan {
  id: string;
  nama_lengkap: string;
  nip: string;
  nik: string;
  nama_jadwal?: string;
  jadwal_kerja_id?: number;
  nama_departemen?: string;
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

  const [isAdminOrHRD, setIsAdminOrHRD] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<{value: string, label: string} | null>(null);

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

  // Download Template Modal State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadMonth, setDownloadMonth] = useState("");
  const [downloadUnit, setDownloadUnit] = useState("");
  const [downloadSelectedKarIds, setDownloadSelectedKarIds] = useState<string[]>([]);
  const [downloadSearchKar, setDownloadSearchKar] = useState("");
  const [downloadMode, setDownloadMode] = useState<'schedule' | 'blank'>('schedule');
  const [downloadIncludeExisting, setDownloadIncludeExisting] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Import Result Modal State
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    successCount: number;
    deletedCount?: number;
    failedCount: number;
    failedRows: string[];
  } | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const getShiftCategory = (nama_shift: string): string => {
      const name = nama_shift.toLowerCase();
      if (name.includes('cuti') || name.includes('izin')) return 'Cuti';
      if (name.includes('libur') || name.includes('lepas')) return 'Libur';
      if (name.includes('malam')) return 'Malam';
      if (name.includes('siang')) return 'Siang';
      if (name.includes('middle')) return 'Middle';
      return 'Pagi'; 
  };
  const categories = ['Pagi', 'Middle', 'Siang', 'Malam', 'Libur', 'Cuti'];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      let fetchKaryawanUrl = '/api/karyawan';
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role && (user.role.toLowerCase().includes('admin') || user.role.toLowerCase().includes('hrd'))) {
                setIsAdminOrHRD(true);
            } else if (user.role && !user.role.toLowerCase().includes('admin') && !user.role.toLowerCase().includes('hrd') && user.karyawan_id) {
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
  const fetchBoardData = async (quiet = false) => {
      if (!plotMonth) return;
      if (!quiet) setIsFetchingBoard(true);
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
          if (!quiet) setIsFetchingBoard(false);
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
          let superior_id = null;
          try {
              const userStr = localStorage.getItem("user");
              if (userStr) {
                  const user = JSON.parse(userStr);
                  if (user.role && !user.role.toLowerCase().includes('admin') && !user.role.toLowerCase().includes('hrd') && user.karyawan_id) {
                      superior_id = user.karyawan_id;
                  }
              }
          } catch (e) {}

          const res = await fetch('/api/karyawan-shift/board', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  tanggal: submitTanggal,
                  shift_id: submitShiftId,
                  karyawan_ids: selectedKaryawanIds,
                  superior_id: superior_id
              })
          });
          if (!res.ok) throw new Error("Gagal menyimpan plotting board.");
          showSuccessToast("Berhasil menyimpan assignment!");
          setIsBoardModalOpen(false);
          fetchBoardData(true); // reload quietly to preserve scroll
      } catch (err) {
          showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan.");
      }
  };

  const handleOpenDownloadModal = () => {
    const currentM = plotMonth || new Date().toISOString().substring(0, 7);
    setDownloadMonth(currentM);
    const activeUnitVal = selectedUnit ? selectedUnit.value : "";
    setDownloadUnit(activeUnitVal);
    setDownloadSearchKar("");
    setDownloadMode("schedule");
    setDownloadIncludeExisting(true);

    const targetList = activeUnitVal
      ? karyawans.filter((k) => k.nama_departemen === activeUnitVal)
      : karyawans;
    setDownloadSelectedKarIds(targetList.map((k) => k.id));
    setIsDownloadModalOpen(true);
  };

  const handleSelectAllDownload = () => {
    const filtered = karyawans.filter((k) => {
      const matchUnit = !downloadUnit || k.nama_departemen === downloadUnit;
      const searchLower = downloadSearchKar.toLowerCase();
      const matchSearch =
        !downloadSearchKar ||
        k.nama_lengkap.toLowerCase().includes(searchLower) ||
        (k.nip && k.nip.toLowerCase().includes(searchLower));
      return matchUnit && matchSearch;
    });
    const ids = filtered.map((k) => k.id);
    setDownloadSelectedKarIds(Array.from(new Set([...downloadSelectedKarIds, ...ids])));
  };

  const handleDeselectAllDownload = () => {
    const filtered = karyawans.filter((k) => {
      const matchUnit = !downloadUnit || k.nama_departemen === downloadUnit;
      const searchLower = downloadSearchKar.toLowerCase();
      const matchSearch =
        !downloadSearchKar ||
        k.nama_lengkap.toLowerCase().includes(searchLower) ||
        (k.nip && k.nip.toLowerCase().includes(searchLower));
      return matchUnit && matchSearch;
    });
    const idsToRemove = new Set(filtered.map((k) => k.id));
    setDownloadSelectedKarIds(
      downloadSelectedKarIds.filter((id) => !idsToRemove.has(id))
    );
  };

  const toggleDownloadKaryawan = (id: string) => {
    if (downloadSelectedKarIds.includes(id)) {
      setDownloadSelectedKarIds(downloadSelectedKarIds.filter((v) => v !== id));
    } else {
      setDownloadSelectedKarIds([...downloadSelectedKarIds, id]);
    }
  };

  const handleExecuteDownloadTemplate = async () => {
    if (downloadMode === "schedule" && downloadSelectedKarIds.length === 0) {
      showErrorToast("Pilih minimal 1 karyawan untuk mendownload template jadwal.");
      return;
    }

    try {
      setIsDownloading(true);

      let superior_id = null;
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (
            user.role &&
            !user.role.toLowerCase().includes("admin") &&
            !user.role.toLowerCase().includes("hrd") &&
            user.karyawan_id
          ) {
            superior_id = user.karyawan_id;
          }
        }
      } catch (e) {}

      const res = await fetch("/api/karyawan-shift/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          karyawan_ids: downloadSelectedKarIds,
          month: downloadMonth,
          mode: downloadMode,
          include_existing: downloadIncludeExisting,
          superior_id: superior_id,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal mengunduh template");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Template_Plotting_Shift_${downloadMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      showSuccessToast("Template Excel berhasil diunduh!");
      setIsDownloadModalOpen(false);
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengunduh."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (
          user.role &&
          !user.role.toLowerCase().includes("admin") &&
          !user.role.toLowerCase().includes("hrd") &&
          user.karyawan_id
        ) {
          formData.append("superior_id", user.karyawan_id);
        }
      }
    } catch (e) {}

    try {
      const res = await fetch("/api/karyawan-shift/import", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        showSuccessToast(result.message);
        setIsImportModalOpen(false);
        setImportFile(null);
        fetchBoardData();

        if (result.failedRows && result.failedRows.length > 0) {
          setImportResult(result);
          setIsResultModalOpen(true);
        }
      } else {
        showErrorToast(result.message || "Gagal mengimport file.");
        if (result.failedRows && result.failedRows.length > 0) {
          setImportResult(result);
          setIsResultModalOpen(true);
        }
      }
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Terjadi kesalahan koneksi."
      );
    } finally {
      setIsImporting(false);
    }
  };


  // Filtering for Default List
  const uniqueUnits = Array.from(new Set(karyawans.map(k => k.nama_departemen).filter(Boolean))) as string[];
  const unitOptions = [
      { value: '', label: 'Semua Unit' },
      ...uniqueUnits.map(u => ({ value: u, label: u }))
  ];

  const filteredKaryawans = (selectedUnit && selectedUnit.value !== '')
      ? karyawans.filter(k => k.nama_departemen === selectedUnit.value)
      : karyawans;

  const totalPages = Math.ceil(filteredKaryawans.length / itemsPerPage);
  const currentKaryawans = filteredKaryawans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredKaryawanForModal = filteredKaryawans.filter(k => {
    const searchLower = searchKaryawan.toLowerCase();
    return k.nama_lengkap.toLowerCase().includes(searchLower) || 
           (k.nip && k.nip.toLowerCase().includes(searchLower));
  });

  const filteredBoardData = boardData.filter(b => {
      if (!selectedUnit || selectedUnit.value === '') return true;
      const k = karyawans.find(kar => kar.id === b.karyawan_id);
      return k && k.nama_departemen === selectedUnit.value;
  });

  const filteredKaryawanForDownload = karyawans.filter((k) => {
    const matchUnit = !downloadUnit || k.nama_departemen === downloadUnit;
    const searchLower = downloadSearchKar.toLowerCase();
    const matchSearch =
      !downloadSearchKar ||
      k.nama_lengkap.toLowerCase().includes(searchLower) ||
      (k.nip && k.nip.toLowerCase().includes(searchLower));
    return matchUnit && matchSearch;
  });

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

        {(isAdminOrHRD || uniqueUnits.length > 0) && (
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">Filter Unit:</span>
                <div className="w-72">
                    <Select
                        options={unitOptions}
                        value={selectedUnit || unitOptions[0]}
                        onChange={(option) => setSelectedUnit(option as any)}
                        placeholder="Pilih Unit / Departemen..."
                        isClearable
                        styles={{ menu: base => ({ ...base, zIndex: 50 }) }}
                    />
                </div>
            </div>
        )}

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
                    <th className="px-6 py-3">Nama Pegawai</th>
                    <th className="px-6 py-3">NIP</th>
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
                        <td className="px-6 py-4 font-medium text-slate-900">{kar.nama_lengkap}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{kar.nip}</td>
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
                    <button onClick={handleOpenDownloadModal} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold hover:bg-slate-200 transition-colors">
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
                                                 const assignedInCat = filteredBoardData.filter(b => {
                                                      const shiftInfo = shifts.find(s => s.id === b.shift_id);
                                                      return b.tanggal === dateStr && shiftInfo && getShiftCategory(shiftInfo.nama_shift) === cat;
                                                 });
                                                 
                                                 const isCutiCol = cat === 'Cuti';

                                                 return (
                                                     <td key={cat} onClick={() => !isCutiCol && handleCellClickCat(dateStr, cat)} className={`px-2 py-2 border-r border-slate-200 align-top group transition-colors ${!isCutiCol ? 'cursor-pointer hover:bg-blue-50/50' : 'bg-slate-50/30'}`}>
                                                         <div className="flex flex-wrap gap-1 min-h-[40px] items-start content-start">
                                                              {assignedInCat.length > 0 ? (
                                                                  assignedInCat.map((a, i) => {
                                                                      const shiftInfo = shifts.find(s => s.id === a.shift_id);
                                                                      const shiftName = shiftInfo?.nama_shift || '';
                                                                      
                                                                      let bgClass = 'bg-white text-slate-700 shadow-sm border-slate-200';
                                                                      if (cat === 'Libur') bgClass = 'bg-orange-100 text-orange-800 border-orange-200';
                                                                      if (cat === 'Cuti') bgClass = 'bg-blue-100 text-blue-800 border-blue-200 font-bold';
                                                                      
                                                                      return (
                                                                          <span key={i} title={shiftName} className={`text-[11px] px-2 py-1 rounded border ${bgClass}`}>
                                                                              {a.nama_lengkap.split(' ')[0]} <span className="opacity-50 ml-1">({shiftName})</span>
                                                                          </span>
                                                                      );
                                                                  })
                                                              ) : (
                                                                  !isCutiCol ? (
                                                                  <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                      <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                                                                          <Plus size={12}/> Assign {cat}
                                                                      </span>
                                                                  </div>
                                                                  ) : null
                                                              )}
                                                         </div>
                                                     </td>
                                                 )
                                             } else {
                                                 const s = catOrShift as Shift;
                                                 const assigned = filteredBoardData.filter(b => b.tanggal === dateStr && b.shift_id === s.id);
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
                          placeholder="Cari nama atau NIP pegawai..." 
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
                                          <span className="font-medium text-slate-900">{kar.nama_lengkap}</span>
                                          <p className="text-xs text-slate-500">NIP: {kar.nip}</p>
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

      {/* MODAL DOWNLOAD TEMPLATE EXCEL */}
      <Modal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        title="Download Template Plotting Shift"
        size="2xl"
      >
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 flex items-start gap-3">
            <Info className="text-blue-600 mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-semibold">Konfigurasi Template Excel</p>
              <p className="text-blue-800 text-xs mt-0.5 leading-relaxed">
                Pilih periode dan karyawan yang ingin dibuatkan jadwal plotting shift. Template Excel yang di-generate akan memuat ID Karyawan unik, NIP, Nama, serta pilihan validasi dropdown Shift langsung dari database.
              </p>
            </div>
          </div>

          {/* Section 1: Periode & Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Pilih Periode Bulan & Tahun
              </label>
              <input
                type="month"
                value={downloadMonth}
                onChange={(e) => setDownloadMonth(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium bg-slate-50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              {downloadMonth ? (
                <p className="text-xs text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded px-2.5 py-1.5 mt-1.5 font-medium flex items-center gap-1.5">
                  <span className="font-bold">Periode Cut-Off:</span>
                  <span>
                    {(() => {
                      const [y, m] = downloadMonth.split("-").map(Number);
                      if (!y || !m) return "";
                      const start = new Date(y, m - 2, 26);
                      const end = new Date(y, m - 1, 25);
                      const opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
                      return `${start.toLocaleDateString("id-ID", opt)} s/d ${end.toLocaleDateString("id-ID", opt)}`;
                    })()}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Pilih bulan untuk melihat rentang periode cut-off (26 bulan lalu s/d 25 bulan terpilih).
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Format Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDownloadMode("schedule")}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    downloadMode === "schedule"
                      ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CalendarRange size={16} className="mb-1" />
                  <p className="font-medium">Jadwal Harian</p>
                  <p className="text-[10px] opacity-75 font-normal">Baris tanggal otomatis</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDownloadMode("blank")}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    downloadMode === "blank"
                      ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FileSpreadsheet size={16} className="mb-1" />
                  <p className="font-medium">Format Bebas</p>
                  <p className="text-[10px] opacity-75 font-normal">Baris kosong dropdown</p>
                </button>
              </div>
            </div>
          </div>

          {/* Option: Include Existing Shifts */}
          {downloadMode === "schedule" && (
            <label className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-sm text-slate-700 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={downloadIncludeExisting}
                onChange={(e) => setDownloadIncludeExisting(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="font-semibold text-xs text-slate-800">
                  Sertakan jadwal yang sudah tersimpan saat ini di database
                </span>
                <p className="text-[11px] text-slate-500">
                  Jika dicentang, shift yang sudah pernah di-plot pada periode cut-off ini (26 s/d 25) akan terisi otomatis di template Excel, sehingga Anda hanya perlu merevisi yang berubah.
                </p>
              </div>
            </label>
          )}

          {/* Section 2: Pilih Karyawan */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                Pilih Karyawan
                <span className="text-xs font-normal text-slate-500">
                  ({downloadSelectedKarIds.length} dari {karyawans.length} dipilih)
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllDownload}
                  className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-md transition-colors"
                >
                  <CheckSquare size={13} /> Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllDownload}
                  className="text-xs text-slate-600 hover:text-slate-800 font-medium flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md transition-colors"
                >
                  <Square size={13} /> Batal Semua
                </button>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="flex gap-2">
              {uniqueUnits.length > 0 && (
                <select
                  value={downloadUnit}
                  onChange={(e) => setDownloadUnit(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 w-48 focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Semua Unit / Departemen</option>
                  {uniqueUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              )}

              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari nama atau NIP karyawan..."
                  value={downloadSearchKar}
                  onChange={(e) => setDownloadSearchKar(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {/* List Karyawan */}
            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto bg-white divide-y divide-slate-100">
              {filteredKaryawanForDownload.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Tidak ada karyawan yang sesuai kriteria pencarian.
                </div>
              ) : (
                filteredKaryawanForDownload.map((kar) => {
                  const isChecked = downloadSelectedKarIds.includes(kar.id);
                  return (
                    <label
                      key={kar.id}
                      className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-xs transition-colors hover:bg-slate-50 ${
                        isChecked ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDownloadKaryawan(kar.id)}
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{kar.nama_lengkap}</p>
                          <p className="text-[11px] text-slate-400">NIP: {kar.nip || "-"}</p>
                        </div>
                      </div>
                      {kar.nama_departemen && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                          {kar.nama_departemen}
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-500 font-medium">
              File: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">Template_Plotting_Shift_{downloadMonth}.xlsx</code>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDownloadTemplate}
                disabled={isDownloading || (downloadMode === "schedule" && downloadSelectedKarIds.length === 0)}
                className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Download size={16} />
                )}
                {isDownloading ? "Mengunduh..." : "Download Excel (.xlsx)"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL IMPORT EXCEL */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Jadwal Plotting Shift" size="lg">
        <form onSubmit={handleImportSubmit} className="space-y-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-xs text-emerald-900 space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 size={16} /> Petunjuk Import Jadwal Shift
            </p>
            <ul className="list-disc list-inside space-y-1 text-emerald-800/90 pl-1 leading-relaxed">
              <li>Unggah file template <b>.xlsx</b> yang telah diisi kolom <b>Nama Shift</b>-nya.</li>
              <li>Sistem mencocokkan data secara akurat menggunakan <b>ID Karyawan</b> (UUID) atau <b>NIP</b> / <b>Nama</b>.</li>
              <li>Nama shift dapat dipilih melalui dropdown atau <b>diketik langsung</b> (contoh: <i>Pagi1.1</i>, <i>Siang1.6</i>, <i>Libur / Off</i>, <i>Cuti</i>).</li>
              <li>Jika kolom shift dikosongkan pada tanggal tertentu, sistem akan <b>menghapus plotting khusus</b> tersebut dan mengembalikannya ke jadwal default.</li>
            </ul>
          </div>

          <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-colors">
            <FileSpreadsheet className="mx-auto text-emerald-600 mb-3" size={44} />
            <p className="text-sm font-medium text-slate-700 mb-1">
              Pilih file template Excel yang telah diisi
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Mendukung format file <b>.xlsx</b> atau <b>.csv</b>
            </p>
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="w-full max-w-sm mx-auto text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              required
            />
            {importFile && (
              <p className="text-xs font-semibold text-emerald-700 mt-3">
                File terpilih: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button 
              type="button" 
              onClick={() => setIsImportModalOpen(false)} 
              className="px-5 py-2 bg-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-300 transition-colors text-sm"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={!importFile || isImporting} 
              className="px-6 py-2 bg-emerald-600 text-white rounded-full font-medium shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              {isImporting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
              {isImporting ? 'Memproses Import...' : 'Upload & Simpan Jadwal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL HASIL IMPORT / CATATAN ERROR */}
      <Modal isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} title="Laporan Hasil Import Jadwal" size="lg">
        {importResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-xs text-emerald-700 font-medium">Berhasil Disimpan</p>
                <p className="text-2xl font-bold text-emerald-800">{importResult.successCount}</p>
              </div>
              {importResult.deletedCount !== undefined && importResult.deletedCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-medium">Dikosongkan</p>
                  <p className="text-2xl font-bold text-blue-800">{importResult.deletedCount}</p>
                </div>
              )}
              <div className={`rounded-lg p-3 border ${
                importResult.failedCount > 0 
                  ? "bg-amber-50 border-amber-200" 
                  : "bg-slate-50 border-slate-200"
              }`}>
                <p className={`text-xs font-medium ${importResult.failedCount > 0 ? "text-amber-700" : "text-slate-500"}`}>
                  Catatan / Dilewati
                </p>
                <p className={`text-2xl font-bold ${importResult.failedCount > 0 ? "text-amber-800" : "text-slate-700"}`}>
                  {importResult.failedCount}
                </p>
              </div>
            </div>

            {importResult.failedRows && importResult.failedRows.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-600" />
                  Rincian Baris yang Dilewati / Bermasalah:
                </p>
                <div className="max-h-56 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1 font-mono">
                  {importResult.failedRows.map((err, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-amber-900 border-b border-slate-200/50 pb-1 last:border-b-0">
                      <span className="text-amber-500 font-bold shrink-0">•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsResultModalOpen(false)}
                className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Tutup Laporan
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
