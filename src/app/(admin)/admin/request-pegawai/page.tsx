"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle, 
  Info, 
  X,
  Search as SearchIcon,
  ChevronDown
} from "lucide-react";

// --- KOMPONEN INTERNAL UNTUK MENGHINDARI ERROR RESOLUSI ---

// Komponen Modal Internal
const Modal = ({ isOpen, onClose, title, children, size = "md" }: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode; 
  size?: string;
}) => {
  if (!isOpen) return null;
  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className={`bg-white rounded-xl shadow-xl w-full ${sizeClasses[size] || sizeClasses.md} my-8`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Komponen Searchable Select Internal (Dengan Fitur Pencarian)
const SearchableSelect = ({ options, value, onChange, placeholder }: {
  options: { value: string | number; label: string }[];
  value: { value: string | number; label: string } | null;
  onChange: (option: { value: string | number; label: string } | null) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex justify-between items-center text-sm min-h-[40px]"
      >
        <span className={value ? "text-slate-900" : "text-gray-400"}>
          {value ? value.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[60] w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b bg-slate-50">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.value}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-primary/5 transition-colors ${value?.value === opt.value ? "bg-primary/10 text-primary font-semibold" : "text-slate-700"}`}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-xs text-center text-slate-400 italic">Data tidak ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Komponen Multi Select Internal (Dengan Fitur Pencarian)
const SearchableMultiSelect = ({ options, value, onChange, placeholder }: {
  options: { value: string; label: string; type: string }[];
  value: { value: string; label: string; type: string }[];
  onChange: (val: { value: string; label: string; type: string }[]) => void;
  placeholder: string;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const toggleOption = (opt: any) => {
    const isSelected = value.some((v: any) => v.value === opt.value);
    if (isSelected) {
      onChange(value.filter((v: any) => v.value !== opt.value));
    } else {
      onChange([...value, opt]);
    }
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-white text-sm">
        {value.length === 0 && <span className="text-gray-400">{placeholder}</span>}
        {value.map((v: any) => (
          <span key={v.value} className="bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1 font-medium text-xs">
            {v.label}
            <button type="button" onClick={() => toggleOption(v)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="border rounded-md bg-slate-50 overflow-hidden">
        <div className="p-2 border-b bg-white">
          <input 
            type="text" 
            placeholder="Cari karakteristik..." 
            className="w-full px-2 py-1 text-xs border rounded outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-h-32 overflow-y-auto p-1 text-xs">
          {filteredOptions.map((opt: any) => (
            <label key={opt.value} className="flex items-center gap-2 p-2 hover:bg-white cursor-pointer rounded transition-colors text-slate-700">
              <input 
                type="checkbox" 
                checked={value.some((v: any) => v.value === opt.value)}
                onChange={() => toggleOption(opt)}
                className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
              />
              {opt.label}
            </label>
          ))}
          {filteredOptions.length === 0 && (
            <div className="p-2 text-center text-slate-400 italic text-[10px]">Kriteria tidak ditemukan</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- INTERFACES ---
interface JobRequest {
  id: string; 
  position: string;
  quantity: number;
  requester: string;
  department: string;
  level: string;
  request_date: string;
  urgency: 'Rendah' | 'Sedang' | 'Tinggi';
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';
}

interface Job {
  id: string; 
  nama_job: string;
}

type FormOption = { value: string; label: string };

type MbtiTrait = { value: string; label: string; type: string };

type MbtiCategorizedOptions = {
  interaction: MbtiTrait[];
  information: MbtiTrait[];
  decision: MbtiTrait[];
  workStyle: MbtiTrait[];
};

// --- DATA MBTI ---
const mbtiCategorizedOptions: MbtiCategorizedOptions = {
    interaction: [
        { value: 'e1', label: 'Supel, mudah bergaul', type: 'E' }, { value: 'e2', label: 'Energik dan antusias', type: 'E' }, { value: 'e3', label: 'Senang bekerja dalam tim', type: 'E' }, { value: 'e4', label: 'Mudah mengutarakan pendapat', type: 'E' }, { value: 'e5', label: 'Suka terjun langsung ke aktivitas', type: 'E' },
        { value: 'i1', label: 'Pendiam, fokus, observatif', type: 'I' }, { value: 'i2', label: 'Lebih suka bekerja sendiri', type: 'I' }, { value: 'i3', label: 'Berpikir matang sebelum bicara', type: 'I' }, { value: 'i4', label: 'Mendalam dalam analisis', type: 'I' }, { value: 'i5', label: 'Menyukai ruang kerja yang tenang', type: 'I' },
    ],
    information: [
        { value: 's1', label: 'Detail-oriented dan teliti', type: 'S' }, { value: 's2', label: 'Praktis dan realistis', type: 'S' }, { value: 's3', label: 'Fokus pada fakta & pengalaman nyata', type: 'S' }, { value: 's4', label: 'Menyukai instruksi yang jelas', type: 'S' }, { value: 's5', label: 'Mengandalkan data & prosedur', type: 'S' },
        { value: 'n1', label: 'Visioner & penuh ide baru', type: 'N' }, { value: 'n2', label: 'Kreatif & inovatif', type: 'N' }, { value: 'n3', label: 'Senang berpikir konsep besar (big picture)', type: 'N' }, { value: 'n4', label: 'Tertarik pada peluang masa depan', type: 'N' }, { value: 'n5', label: 'Suka eksplorasi & mencoba hal baru', type: 'N' },
    ],
    decision: [
        { value: 't1', label: 'Logis & analitis', type: 'T' }, { value: 't2', label: 'Objektif dalam mengambil keputusan', type: 'T' }, { value: 't3', label: 'Tegas dalam menyampaikan pendapat', type: 'T' }, { value: 't4', label: 'Berorientasi pada hasil', type: 'T' }, { value: 't5', label: 'Mementingkan keadilan daripada perasaan', type: 'T' },
        { value: 'f1', label: 'Empatik & peduli pada orang lain', type: 'F' }, { value: 'f2', label: 'Harmonis & mengutamakan kerja sama', type: 'F' }, { value: 'f3', label: 'Mudah memahami perasaan orang lain', type: 'F' }, { value: 'f4', label: 'Ramah & suportif', type: 'F' }, { value: 'f5', label: 'Berorientasi pada nilai dan hubungan baik', type: 'F' },
    ],
    workStyle: [
        { value: 'j1', label: 'Teratur & terstruktur', type: 'J' }, { value: 'j2', label: 'Disiplin & tepat waktu', type: 'J' }, { value: 'j3', label: 'Menyukai perencanaan yang jelas', type: 'J' }, { value: 'j4', label: 'Fokus pada target & tenggat waktu', type: 'J' }, { value: 'j5', label: 'Lebih suka kepastian daripada spontanitas', type: 'J' },
        { value: 'p1', label: 'Fleksibel & mudah beradaptasi', type: 'P' }, { value: 'p2', label: 'Santai & tidak kaku', type: 'P' }, { value: 'p3', label: 'Spontan & terbuka dengan perubahan', type: 'P' }, { value: 'p4', label: 'Suka mencoba cara baru', type: 'P' }, { value: 'p5', label: 'Lebih nyaman dengan kebebasan', type: 'P' },
    ]
};

export default function RequestPegawaiPage() {
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [jobList, setJobList] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<JobRequest | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Form states
  const [requestType, setRequestType] = useState<"penambahan" | "pergantian">("penambahan");
  const [selectedPosition, setSelectedPosition] = useState<FormOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState<'Rendah' | 'Sedang' | 'Tinggi'>('Rendah');
  const [selectedInteraction, setSelectedInteraction] = useState<MbtiTrait[]>([]);
  const [selectedInformation, setSelectedInformation] = useState<MbtiTrait[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<MbtiTrait[]>([]);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<MbtiTrait[]>([]);

  // Job Opening states
  const [lowonganTitle, setLowonganTitle] = useState("");
  const [lowonganClosingDate, setLowonganClosingDate] = useState("");
  const [lowonganStatus, setLowonganStatus] = useState<'Published' | 'Draft'>('Published');

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const [requestsRes, jobsRes] = await Promise.all([
            fetch(`${baseUrl}/employee-requests`),
            fetch(`${baseUrl}/jobs`)
        ]);
        if (!requestsRes.ok) throw new Error("Gagal memuat data request");
        if (!jobsRes.ok) throw new Error("Gagal memuat data pekerjaan (jobs)");
        
        const requestsData = await requestsRes.json();
        const jobsData = await jobsRes.json();

        setRequests(requestsData);
        setJobList(jobsData);
    } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [baseUrl]);

  const topMbtiResults = useMemo(() => {
    const allSelectedTraits = [...selectedInteraction, ...selectedInformation, ...selectedDecision, ...selectedWorkStyle];
    if (allSelectedTraits.length < 3) return [];
    
    const counts = allSelectedTraits.reduce((acc, trait) => { 
      acc[trait.type] = (acc[trait.type] || 0) + 1; 
      return acc; 
    }, {} as Record<string, number>);

    const getTopTwo = (c1: string, c2: string) => { 
      const n1 = counts[c1] || 0, n2 = counts[c2] || 0; 
      if (n1 > n2) return [c1, c2]; 
      if (n2 > n1) return [c2, c1]; 
      return n1 > 0 ? [c1, c2] : [null, null]; 
    };

    const d1 = getTopTwo('E', 'I'), d2 = getTopTwo('S', 'N'), d3 = getTopTwo('T', 'F'), d4 = getTopTwo('J', 'P');
    const combos: string[] = [];
    
    for (const c1 of d1) if (c1) 
      for (const c2 of d2) if (c2) 
        for (const c3 of d3) if (c3) 
          for (const c4 of d4) if (c4) { 
            const combo = `${c1}${c2}${c3}${c4}`; 
            if (!combos.includes(combo)) combos.push(combo); 
          }

    return combos
      .map(combo => ({ 
        combo, 
        score: combo.split('').reduce((acc, char) => acc + (counts[char] || 0), 0) 
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(i => i.combo);
  }, [selectedInteraction, selectedInformation, selectedDecision, selectedWorkStyle]);

  const positionOptions = useMemo(() => {
    return jobList.map(j => ({ value: j.id, label: j.nama_job }));
  }, [jobList]);

  const resetForm = () => {
    setRequestType("penambahan");
    setSelectedPosition(null);
    setQuantity(1);
    setUrgency('Rendah');
    setSelectedInteraction([]);
    setSelectedInformation([]);
    setSelectedDecision([]);
    setSelectedWorkStyle([]);
    setLowonganTitle("");
    setLowonganClosingDate("");
    setLowonganStatus('Published');
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsApproveModalOpen(false);
    setIsRejectModalOpen(false);
    setSelectedRequest(null);
    resetForm();
  };

  const handleOpenApproveModal = (request: JobRequest) => {
    setSelectedRequest(request);
    setLowonganTitle(request.position);
    setLowonganStatus('Published');
    setLowonganClosingDate("");
    setIsApproveModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userString) {
        showErrorToast("Sesi tidak ditemukan. Mohon login ulang.");
        return;
    }
    if (!selectedPosition) {
        showErrorToast("Posisi jabatan wajib diisi.");
        return;
    }
    
    const user = JSON.parse(userString);
    
    // SINKRONISASI KRUSIAL: Menggunakan karyawan_id (UUID dari tabel karyawan)
    // Error sebelumnya terjadi karena mengirim ID User ke FK yang mengharapkan ID Karyawan.
    const requesterId = user.karyawan_id;

    if (!requesterId) {
        showErrorToast("ID Karyawan tidak ditemukan. Mohon Logout dan Login kembali.");
        return;
    }

    const body = {
        requester_id: requesterId, 
        job_id: selectedPosition.value,
        quantity,
        type: requestType,
        urgency,
        mbti_results: topMbtiResults,
    };

    try {
        const response = await fetch(`${baseUrl}/employee-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal mengirim request");
        }
        showSuccessToast("Request penambahan pegawai berhasil dikirim!");
        handleCloseModals();
        fetchData();
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        showErrorToast(msg);
    }
  };

  const handleConfirmAndCreateLowongan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
        const body = {
            status: 'Disetujui',
            title: lowonganTitle,
            closing_date: lowonganClosingDate || null,
            opening_status: lowonganStatus
        };
        const response = await fetch(`${baseUrl}/employee-requests/${selectedRequest.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal menyetujui request");
        }
        showSuccessToast("Request disetujui & lowongan berhasil diproses!");
        handleCloseModals();
        fetchData();
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        showErrorToast(msg);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
        const response = await fetch(`${baseUrl}/employee-requests/${selectedRequest.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Ditolak' })
        });
        if (!response.ok) throw new Error("Gagal menolak request");
        showSuccessToast("Request berhasil ditolak.");
        handleCloseModals();
        fetchData();
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        showErrorToast(msg);
    }
  };

  // Helper Toast (Internal fallback jika component eksternal gagal)
  const showSuccessToast = (msg: string) => console.log("SUCCESS:", msg);
  const showErrorToast = (msg: string) => console.error("ERROR:", msg);

  const getStatusClass = (status: string) => ({ 
    "Menunggu Persetujuan": "bg-yellow-100 text-yellow-800", 
    "Disetujui": "bg-green-100 text-green-800", 
    "Ditolak": "bg-red-100 text-red-800" 
  }[status] || "bg-slate-100 text-slate-800");

  const getUrgencyClass = (urgency: string) => ({ 
    "Tinggi": "text-red-600 font-bold", 
    "Sedang": "text-yellow-600 font-bold", 
    "Rendah": "text-green-600 font-bold" 
  }[urgency] || "text-slate-600");

  return (
    <div className="p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-dark">Request Penambahan Pegawai</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          <PlusCircle size={20} /> Buat Request Baru
        </button>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-white uppercase bg-primary-dark">
              <tr>
                <th scope="col" className="px-6 py-4">Posisi yang Diajukan</th>
                <th scope="col" className="px-6 py-4">Requester</th>
                <th scope="col" className="px-6 py-4">Tanggal</th>
                <th scope="col" className="px-6 py-4">Urgensi</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-center">Aksi HC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? ( 
                <tr><td colSpan={6} className="text-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr> 
              ) : error ? ( 
                <tr><td colSpan={6} className="text-center p-12 text-red-500"><AlertTriangle className="mx-auto mb-2" />{error}</td></tr> 
              ) : requests.length > 0 ? (
                requests.map((req) => (
                <tr key={req.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <th scope="row" className="px-6 py-4 font-medium text-slate-900">
                    {req.position}
                    <p className="font-normal text-slate-500 text-xs mt-1">{req.quantity} orang</p>
                  </th>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800">{req.requester}</span>
                    <p className="text-slate-500 text-[10px] uppercase font-bold mt-0.5 tracking-tight">{req.level}, {req.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(req.request_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </td>
                  <td className={`px-6 py-4 ${getUrgencyClass(req.urgency)} text-xs`}>{req.urgency}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${getStatusClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {req.status === "Menunggu Persetujuan" && (
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => handleOpenApproveModal(req)} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Setujui"><CheckCircle size={20} /></button>
                        <button onClick={() => { setSelectedRequest(req); setIsRejectModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Tolak"><XCircle size={20} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))) : ( 
                <tr><td colSpan={6} className="text-center p-12"><Info className="mx-auto mb-2 text-slate-400" />Tidak ada data request saat ini.</td></tr> 
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH REQUEST */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseModals} title="Buat Request Pegawai Baru" size="4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Jenis Request</label>
                  <div className="flex gap-4 p-2 bg-white rounded-md border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600">
                      <input type="radio" name="requestType" value="penambahan" checked={requestType === 'penambahan'} onChange={(e) => setRequestType(e.target.value as any)} className="text-primary focus:ring-primary w-4 h-4" />
                      Penambahan
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600">
                      <input type="radio" name="requestType" value="pergantian" checked={requestType === 'pergantian'} onChange={(e) => setRequestType(e.target.value as any)} className="text-primary focus:ring-primary w-4 h-4" />
                      Pergantian
                    </label>
                  </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Posisi Jabatan</label>
                <SearchableSelect options={positionOptions} value={selectedPosition} onChange={(option: any) => setSelectedPosition(option)} placeholder="Cari posisi jabatan..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Jumlah Dibutuhkan (Orang)</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tingkat Urgensi</label>
                <select value={urgency} onChange={(e) => setUrgency(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary bg-white transition-all">
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Kriteria Kepribadian (MBTI)</h3>
            <p className="text-[10px] text-slate-400 mb-4 italic font-medium">* Pilih karakteristik minimal dari 3 kategori untuk mendapatkan benchmark akurat.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                  <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-tighter">Gaya Interaksi</label><SearchableMultiSelect options={mbtiCategorizedOptions.interaction} value={selectedInteraction} onChange={setSelectedInteraction as any} placeholder="Pilih karakteristik..." /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-tighter">Pengambilan Keputusan</label><SearchableMultiSelect options={mbtiCategorizedOptions.decision} value={selectedDecision} onChange={setSelectedDecision as any} placeholder="Pilih karakteristik..." /></div>
              </div>
              <div className="space-y-4">
                  <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-tighter">Pengolahan Informasi</label><SearchableMultiSelect options={mbtiCategorizedOptions.information} value={selectedInformation} onChange={setSelectedInformation as any} placeholder="Pilih karakteristik..." /></div>
                  <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-tighter">Gaya Kerja</label><SearchableMultiSelect options={mbtiCategorizedOptions.workStyle} value={selectedWorkStyle} onChange={setSelectedWorkStyle} placeholder="Pilih karakteristik..." /></div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary-dark uppercase tracking-wider">Benchmark MBTI:</span>
                <span className="text-[10px] text-primary font-medium italic opacity-70">Rekomendasi otomatis</span>
              </div>
              <div className="flex gap-2">
                {topMbtiResults.length > 0 ? topMbtiResults.map(res => (
                  <span key={res} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-tighter shadow-sm">{res}</span>
                )) : <span className="text-xs italic text-slate-400 font-medium">Lengkapi kriteria di atas</span>}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-slate-200">
            <button type="button" onClick={handleCloseModals} className="rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Batal</button>
            <button type="submit" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-md">Kirim Pengajuan</button>
          </div>
        </form>
      </Modal>

      {/* MODAL APPROVE */}
      <Modal isOpen={isApproveModalOpen} onClose={handleCloseModals} title="Setujui & Buat Lowongan">
        {selectedRequest && (
          <form onSubmit={handleConfirmAndCreateLowongan} className="space-y-5">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex gap-3 items-start">
              <Info size={20} className="text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-green-800 font-medium leading-relaxed">Persetujuan akan membuat permintaan ini aktif dan draf lowongan dapat dilihat di sistem rekrutmen.</p>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest">Judul Lowongan Kerja</label>
                <input type="text" value={lowonganTitle} onChange={(e) => setLowonganTitle(e.target.value)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary transition-all" />
            </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest">Tanggal Tutup Lamaran</label>
                <input type="date" value={lowonganClosingDate} onChange={(e) => setLowonganClosingDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-3 text-center tracking-widest">Pilih Status Awal</label>
              <div className="grid grid-cols-2 gap-3">
                  <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${lowonganStatus === 'Published' ? 'border-primary bg-primary text-white shadow-lg scale-105' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-500'}`}>
                      <input type="radio" value="Published" checked={lowonganStatus === 'Published'} onChange={(e) => setLowonganStatus(e.target.value as any)} className="hidden" /> 
                      <span className="text-xs font-bold uppercase tracking-widest">PUBLIKASI</span>
                      <span className="text-[9px] mt-1 opacity-80">Post Langsung Ke Web</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${lowonganStatus === 'Draft' ? 'border-primary bg-primary text-white shadow-lg scale-105' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-500'}`}>
                      <input type="radio" value="Draft" checked={lowonganStatus === 'Draft'} onChange={(e) => setLowonganStatus(e.target.value as any)} className="hidden" /> 
                      <span className="text-xs font-bold uppercase tracking-widest">SIMPAN DRAF</span>
                      <span className="text-[9px] mt-1 opacity-80">Hanya Internal</span>
                  </label>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-slate-100">
              <button type="button" onClick={handleCloseModals} className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200">Batal</button>
              <button type="submit" className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 shadow-md">Konfirmasi & Setujui</button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL REJECT */}
      <Modal isOpen={isRejectModalOpen} onClose={handleCloseModals} title="Tolak Permintaan">
       {selectedRequest && (
         <div className="space-y-6">
          <p className="text-slate-600 text-sm font-medium leading-relaxed text-center py-6">Apakah Anda yakin ingin menolak permintaan <br/><span className="font-extrabold text-slate-800 text-lg uppercase">{selectedRequest.position}</span>?</p>
          <div className="flex justify-center gap-4 pt-5 border-t border-slate-100">
            <button onClick={handleCloseModals} className="rounded-lg bg-slate-100 px-7 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200">Batal</button>
            <button onClick={handleReject} className="rounded-lg bg-red-600 px-7 py-2.5 text-sm font-bold text-white hover:bg-red-700 shadow-md">Ya, Tolak</button>
          </div>
         </div>
       )}
      </Modal>
    </div>
  );
}