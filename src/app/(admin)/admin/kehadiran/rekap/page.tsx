"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Download, CalendarDays, Users, Clock, AlertTriangle, TableProperties, Grid, Loader2, Calendar } from "lucide-react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface KaryawanRekap {
  id: string;
  nama: string;
  jabatan: string;
  rekap: { hadir: number; telat: number; alpha: number; izin: number };
  harian: Record<string, { status: string; jam_masuk?: string; is_late?: boolean }>;
}

export default function RekapAbsensiPage() {
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDateObj, endDateObj] = dateRange;
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"table" | "heatmap">("table");
  
  const [departemenList, setDepartemenList] = useState<{id: string, nama_departemen: string}[]>([]);
  const [data, setData] = useState<KaryawanRekap[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const totalKaryawan = data.length;
  const workingDays = dates.filter(d => {
    const day = new Date(d).getDay();
    return day !== 0 && day !== 6; // exclude weekend
  }).length;
  
  const avgKehadiran = totalKaryawan > 0 && workingDays > 0
    ? (data.reduce((acc, curr) => acc + curr.rekap.hadir, 0) / (totalKaryawan * workingDays) * 100).toFixed(1) 
    : "0";
  const totalTelat = data.reduce((acc, curr) => acc + curr.rekap.telat, 0);
  const totalAlpha = data.reduce((acc, curr) => acc + curr.rekap.alpha, 0);

  useEffect(() => {
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateRange([firstDay, lastDay]);

    // Fetch Departemen
    fetch('/api/departemen')
      .then(res => res.json())
      .then(data => setDepartemenList(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!startDateObj || !endDateObj) return;
    
    const formatYMD = (date: Date) => {
      const d = new Date(date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().split('T')[0];
    };

    const startStr = formatYMD(startDateObj);
    const endStr = formatYMD(endDateObj);

    let superiorParam = "";
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        const role = userObj.role?.toLowerCase() || "";
        if (role === "spv" || role === "supervisor" || role === "koordinator") {
          superiorParam = `&superiorId=${userObj.karyawan_id}`;
        }
      }
    } catch (e) {
      console.error(e);
    }

    setIsLoading(true);
    fetch(`/api/absensi/rekap?startDate=${startStr}&endDate=${endStr}&unit=${selectedUnit}${superiorParam}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.data) {
          setData(resData.data);
          setDates(resData.dates || []);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [startDateObj, endDateObj, selectedUnit]);

  const filteredData = data.filter(k => k.nama.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Rekapitulasi Kehadiran</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Pantau kedisiplinan dan riwayat absensi karyawan per unit.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg shrink-0">
          <button 
            onClick={() => setViewType("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewType === "table" ? "bg-white text-[#0173b6] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <TableProperties size={16} /> Tabel
          </button>
          <button 
            onClick={() => setViewType("heatmap")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewType === "heatmap" ? "bg-white text-[#0173b6] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Grid size={16} /> Heatmap
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col xl:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full md:w-64 shrink-0">
            <Select 
              options={[
                { value: "all", label: "Semua Unit (Seluruh Karyawan)" },
                ...departemenList.map(dep => ({ value: dep.id, label: dep.nama_departemen }))
              ]}
              value={{
                value: selectedUnit,
                label: selectedUnit === "all" ? "Semua Unit (Seluruh Karyawan)" : departemenList.find(d => d.id === selectedUnit)?.nama_departemen || "Semua Unit"
              }}
              onChange={(selectedOption) => setSelectedUnit(selectedOption?.value || "all")}
              placeholder="Pilih Unit / Departemen..."
              className="text-sm font-semibold"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '2px',
                  boxShadow: 'none',
                  '&:hover': {
                    border: '1px solid #cbd5e1'
                  }
                })
              }}
            />
          </div>
          
          <div className="relative w-full md:w-64 shrink-0 z-10">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-20 pointer-events-none">
              <Calendar size={16} />
            </div>
            <DatePicker
              selectsRange={true}
              startDate={startDateObj || undefined}
              endDate={endDateObj || undefined}
              onChange={(update) => setDateRange(update)}
              dateFormat="dd MMM yyyy"
              placeholderText="Pilih Rentang Tanggal"
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-10 pr-4 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0173b6]/20 focus:border-[#0173b6] transition-all"
              wrapperClassName="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full xl:w-64">
            <input 
              type="text" 
              placeholder="Cari nama karyawan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 pl-10 pr-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0173b6]/20 focus:border-[#0173b6] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
          <button className="flex items-center gap-2 bg-[#0173b6] hover:bg-[#005f98] text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-100 shrink-0">
            <Download size={16} />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total Karyawan", value: totalKaryawan, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
          { title: "Avg Kehadiran", value: `${Math.min(Number(avgKehadiran), 100)}%`, icon: CalendarDays, color: "text-emerald-500", bg: "bg-emerald-50" },
          { title: "Total Terlambat", value: totalTelat, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "Total Alpha", value: totalAlpha, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-32">
            <Loader2 className="w-8 h-8 text-[#0173b6] animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-500 animate-pulse">Menghitung kalkulasi absensi...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-32">
            <AlertTriangle className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-bold text-slate-600">Tidak Ada Data</p>
            <p className="text-sm text-slate-400">Silakan sesuaikan tanggal atau unit yang dipilih.</p>
          </div>
        ) : viewType === "table" ? (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Karyawan</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-center">Hadir</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-center">Terlambat</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-center">Alpha</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-center">Izin / Cuti</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((kar, idx) => (
                  <tr key={kar.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
                          {kar.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{kar.nama}</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5">{kar.jabatan}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold text-sm">
                        {kar.rekap.hadir}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${kar.rekap.telat > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                        {kar.rekap.telat}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${kar.rekap.alpha > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                        {kar.rekap.alpha}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                        {kar.rekap.izin}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* HEATMAP VIEW */
          <div className="overflow-x-auto p-6 custom-scrollbar">
            <div className="flex items-center gap-6 mb-6 px-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-400"></div><span className="text-xs font-bold text-slate-600">Hadir Tepat Waktu</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-400"></div><span className="text-xs font-bold text-slate-600">Terlambat</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-400"></div><span className="text-xs font-bold text-slate-600">Alpha</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-400"></div><span className="text-xs font-bold text-slate-600">Cuti / Izin</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-slate-200"></div><span className="text-xs font-bold text-slate-600">Libur</span></div>
            </div>

            <div className="inline-block min-w-full">
              <div className="flex mb-2">
                <div className="w-64 shrink-0 px-4 text-xs font-bold text-slate-500 uppercase">Karyawan</div>
                <div className="flex flex-1 gap-1">
                  {dates.map(dateStr => {
                    const dayNum = parseInt(dateStr.split('-')[2], 10);
                    return (
                      <div key={dateStr} className="w-8 shrink-0 text-center text-[10px] font-bold text-slate-400" title={dateStr}>
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {filteredData.map((kar) => (
                <div key={kar.id} className="flex items-center mb-1 hover:bg-slate-50 py-1 rounded-md transition-colors">
                  <div className="w-64 shrink-0 px-4 truncate">
                    <p className="text-xs font-bold text-slate-700 truncate" title={kar.nama}>{kar.nama}</p>
                    <p className="text-[10px] text-slate-400 truncate">{kar.jabatan}</p>
                  </div>
                  <div className="flex flex-1 gap-1">
                    {dates.map(dateStr => {
                      const statusObj = kar.harian[dateStr];
                      let bgColor = "bg-slate-100";
                      let tooltip = `${dateStr} - Tidak ada data`;

                      if (statusObj) {
                        if (statusObj.status === 'hadir') { bgColor = "bg-emerald-400"; tooltip = `${dateStr}: Hadir (${statusObj.jam_masuk})`; }
                        else if (statusObj.status === 'telat') { bgColor = "bg-amber-400"; tooltip = `${dateStr}: Terlambat (${statusObj.jam_masuk})`; }
                        else if (statusObj.status === 'alpha') { bgColor = "bg-red-400"; tooltip = `${dateStr}: Alpha`; }
                        else if (statusObj.status === 'izin') { bgColor = "bg-blue-400"; tooltip = `${dateStr}: Izin / Cuti`; }
                        else if (statusObj.status === 'libur') { bgColor = "bg-slate-200"; tooltip = `${dateStr}: Libur Akhir Pekan`; }
                      }

                      return (
                        <div 
                          key={dateStr} 
                          title={tooltip}
                          className={`w-8 h-8 rounded-sm shrink-0 cursor-pointer transition-transform hover:scale-110 shadow-sm ${bgColor}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
