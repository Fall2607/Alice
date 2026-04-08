/** Path: app/(admin)/admin/request-pegawai/page.tsx
 * Deskripsi: Manajemen Request Pegawai dengan tata letak yang lebih lebar dan rapi.
 * Skema Warna: Kustom Primary (#0173b6).
 */

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  PlusCircle,
  Loader2,
  Info,
  X,
  Search as SearchIcon,
  ChevronDown,
  ChevronLeft,
  Send,
  Users,
  LayoutGrid,
  FileText,
  Clock,
  Zap,
  Target,
  Trophy,
  Medal,
  Award,
  Check,
  Ban,
} from "lucide-react";

// --- KOMPONEN INTERNAL ---

const Modal = ({ isOpen, onClose, title, children, size = "md" }: any) => {
  if (!isOpen) return null;
  const sizeClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`bg-white rounded-[32px] shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} animate-in zoom-in duration-300 border border-white overflow-hidden`}
      >
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-black text-primary-dark tracking-tight leading-none">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

const SearchableSelect = ({ options, value, onChange, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(
    () =>
      options.filter((opt: any) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [options, searchTerm],
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer flex justify-between items-center text-sm font-bold text-slate-700 hover:border-primary/40 transition-all"
      >
        <span className={value ? "text-primary-dark" : "text-slate-400"}>
          {value ? value.label : placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[110] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-top-1">
          <div className="p-3 border-b bg-slate-50/50">
            <input
              type="text"
              className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl outline-none"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt: any) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-5 py-3 text-sm cursor-pointer hover:bg-primary/5 transition-colors ${value?.value === opt.value ? "bg-primary/5 text-primary font-black" : "text-slate-600 font-bold"}`}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-5 py-6 text-xs text-center text-slate-400 italic">
                Data tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchableMultiSelect = ({
  options,
  value,
  onChange,
  placeholder,
}: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const toggleOption = (opt: any) => {
    const isSelected = value.some((v: any) => v.value === opt.value);
    if (isSelected) onChange(value.filter((v: any) => v.value !== opt.value));
    else onChange([...value, opt]);
  };
  const filteredOptions = options.filter((opt: any) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl min-h-[50px] shadow-inner">
        {value.length === 0 && (
          <span className="text-slate-300 font-bold px-2 py-1 text-[10px]">
            Pilih karakteristik...
          </span>
        )}
        {value.map((v: any) => (
          <span
            key={v.value}
            className="bg-primary text-white pl-3 pr-2 py-1.5 rounded-xl flex items-center gap-2 font-black text-[9px] uppercase shadow-sm"
          >
            {v.label}
            <button
              type="button"
              onClick={() => toggleOption(v)}
              className="hover:bg-black/10 rounded-full p-0.5"
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
        <div className="p-2 border-b bg-slate-50/50">
          <input
            type="text"
            placeholder="Cari kriteria..."
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-h-40 overflow-y-auto p-1 custom-scrollbar text-[10px]">
          {filteredOptions.map((opt: any) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 p-2.5 hover:bg-primary/5 cursor-pointer rounded-xl transition-all"
            >
              <input
                type="checkbox"
                checked={value.some((v: any) => v.value === opt.value)}
                onChange={() => toggleOption(opt)}
                className="w-4 h-4 rounded border-slate-300 text-primary"
              />
              <span className="font-black text-slate-600 uppercase">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- DATA & LOGIC ---

const mbtiCategorizedOptions = {
  interaction: [
    { value: "e1", label: "Supel, mudah bergaul", type: "E" },
    { value: "e2", label: "Energik dan antusias", type: "E" },
    { value: "e3", label: "Senang bekerja dalam tim", type: "E" },
    { value: "e4", label: "Mudah mengutarakan pendapat", type: "E" },
    { value: "i1", label: "Pendiam, fokus, observatif", type: "I" },
    { value: "i2", label: "Lebih suka bekerja sendiri", type: "I" },
    { value: "i3", label: "Berpikir matang sebelum bicara", type: "I" },
  ],
  information: [
    { value: "s1", label: "Detail-oriented dan teliti", type: "S" },
    { value: "s2", label: "Praktis dan realistis", type: "S" },
    { value: "s3", label: "Fokus pada fakta nyata", type: "S" },
    { value: "n1", label: "Visioner & penuh ide baru", type: "N" },
    { value: "n2", label: "Kreatif & inovatif", type: "N" },
    { value: "n3", label: "Berpikir konsep besar", type: "N" },
  ],
  decision: [
    { value: "t1", label: "Logis & analitis", type: "T" },
    { value: "t2", label: "Objektif dalam keputusan", type: "T" },
    { value: "t3", label: "Tegas dalam berpendapat", type: "T" },
    { value: "f1", label: "Empatik & peduli sesama", type: "F" },
    { value: "f2", label: "Harmonis & kerja sama", type: "F" },
    { value: "f3", label: "Mudah memahami perasaan", type: "F" },
  ],
  workStyle: [
    { value: "j1", label: "Teratur & terstruktur", type: "J" },
    { value: "j2", label: "Disiplin & tepat waktu", type: "J" },
    { value: "j3", label: "Menyukai perencanaan", type: "J" },
    { value: "p1", label: "Fleksibel & mudah adaptasi", type: "P" },
    { value: "p2", label: "Santai & tidak kaku", type: "P" },
    { value: "p3", label: "Spontan & terbuka", type: "P" },
  ],
};

const mbtiTypes = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
];

export default function RequestPegawaiPage() {
  const [view, setView] = useState<"list" | "add">("list");
  const [requests, setRequests] = useState<any[]>([]);
  const [jobList, setJobList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const [requestType, setRequestType] = useState<"penambahan" | "pergantian">(
    "penambahan",
  );
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState("Rendah");
  const [selectedInteraction, setSelectedInteraction] = useState<any[]>([]);
  const [selectedInformation, setSelectedInformation] = useState<any[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<any[]>([]);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<any[]>([]);
  const [lowonganTitle, setLowonganTitle] = useState("");
  const [lowonganClosingDate, setLowonganClosingDate] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const topMbtiResults = useMemo(() => {
    const all = [
      ...selectedInteraction,
      ...selectedInformation,
      ...selectedDecision,
      ...selectedWorkStyle,
    ];
    if (all.length === 0) return [];
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    all.forEach((t) => {
      (counts as any)[t.type]++;
    });
    const scored = mbtiTypes.map((type) => {
      const score = type
        .split("")
        .reduce((acc, letter) => acc + (counts as any)[letter], 0);
      return { type, score };
    });
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter((x) => x.score > 0);
  }, [
    selectedInteraction,
    selectedInformation,
    selectedDecision,
    selectedWorkStyle,
  ]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, jobsRes] = await Promise.all([
        fetch(`${baseUrl}/employee-requests`),
        fetch(`${baseUrl}/jobs`),
      ]);
      if (reqRes.ok) setRequests(await reqRes.json());
      if (jobsRes.ok) setJobList(await jobsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [baseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.karyawan_id || !selectedPosition) return;
    const body = {
      requester_id: user.karyawan_id,
      job_id: selectedPosition.value,
      quantity,
      type: requestType,
      urgency,
      mbti_results: topMbtiResults.map((r) => r.type),
    };
    try {
      const res = await fetch(`${baseUrl}/employee-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setView("list");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleActionHC = async (status: "Disetujui" | "Ditolak") => {
    if (!selectedRequest) return;
    const body: any = { status };
    if (status === "Disetujui") {
      body.title = lowonganTitle;
      body.closing_date = lowonganClosingDate || null;
    }
    try {
      const res = await fetch(
        `${baseUrl}/employee-requests/${selectedRequest.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (res.ok) {
        setIsApproveModalOpen(false);
        setIsRejectModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (view === "add") {
    return (
      <div className="p-8 max-w-[1400px] mx-auto font-sans animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-[10px] uppercase tracking-wide mb-3 transition-all hover:-translate-x-1"
            >
              <ChevronLeft size={16} /> Kembali ke Daftar
            </button>
            <h1 className="text-4xl font-black text-primary-dark tracking-tighter leading-none mb-2">
              Buat Request Pegawai
            </h1>
            <p className="text-slate-400 font-medium text-xs">
              Isi spesifikasi kebutuhan tenaga kerja unit Anda.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setView("list")}
              className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-4 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary-dark shadow-xl shadow-primary/20 flex items-center gap-3"
            >
              <Send size={16} /> Kirim Pengajuan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative">
              <h3 className="text-[10px] font-black text-primary-dark uppercase tracking-widest mb-8 flex items-center gap-3">
                <div className="w-1 h-5 bg-primary rounded-full"></div>
                Informasi Dasar
              </h3>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">
                    Kategori Request
                  </label>
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => setRequestType("penambahan")}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${requestType === "penambahan" ? "bg-white text-primary shadow-sm" : "text-slate-400"}`}
                    >
                      Penambahan
                    </button>
                    <button
                      onClick={() => setRequestType("pergantian")}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${requestType === "pergantian" ? "bg-white text-primary shadow-sm" : "text-slate-400"}`}
                    >
                      Pergantian
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">
                    Posisi Jabatan
                  </label>
                  <SearchableSelect
                    options={jobList.map((j) => ({
                      value: j.id,
                      label: j.nama_job,
                    }))}
                    value={selectedPosition}
                    onChange={setSelectedPosition}
                    placeholder="Pilih jabatan..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">
                      Kuantitas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-primary-dark"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">
                      Prioritas
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-primary-dark appearance-none outline-none focus:border-primary"
                    >
                      <option>Rendah</option>
                      <option>Sedang</option>
                      <option>Tinggi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-dark rounded-[32px] p-10 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-52 h-52 bg-primary/10 rounded-full blur-[80px]"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Trophy className="text-yellow-400" size={20} />
                  <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">
                    Benchmark MBTI (Top 3)
                  </h4>
                </div>
                <div className="space-y-4">
                  {topMbtiResults.length > 0 ? (
                    topMbtiResults.map((res, idx) => (
                      <div
                        key={res.type}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${idx === 0 ? "bg-white/10 border-white/20" : "bg-transparent border-white/5"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm ${idx === 0 ? "bg-yellow-400 text-slate-900" : "bg-white/5 text-white/40"}`}
                          >
                            {idx === 0 ? <Medal size={18} /> : idx + 1}
                          </div>
                          <p className="text-lg font-black font-mono tracking-tight">
                            {res.type}
                          </p>
                        </div>
                        <p className="text-sm font-black text-primary">
                          {Math.round(
                            (res.score / (topMbtiResults[0]?.score || 1)) * 100,
                          )}
                          %
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-white/30 font-bold italic">
                      Pilih kriteria psikometri untuk melihat profil ideal.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-[40px] p-10 md:p-14 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
              <h3 className="text-xl font-black text-primary-dark tracking-tight flex items-center gap-4">
                <div className="w-8 h-2 bg-primary rounded-full"></div>
                Karakteristik Ideal
              </h3>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
                <Target size={14} className="text-primary" />
                <span className="text-[8px] font-black uppercase text-primary">
                  Intelligence
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              {Object.entries(mbtiCategorizedOptions).map(([key, opts]) => (
                <div key={key} className="space-y-4">
                  <label className="text-[9px] font-black text-primary-dark uppercase ml-1">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <SearchableMultiSelect
                    options={opts}
                    value={
                      key === "interaction"
                        ? selectedInteraction
                        : key === "information"
                          ? selectedInformation
                          : key === "decision"
                            ? selectedDecision
                            : selectedWorkStyle
                    }
                    onChange={
                      key === "interaction"
                        ? setSelectedInteraction
                        : key === "information"
                          ? setSelectedInformation
                          : key === "decision"
                            ? setSelectedDecision
                            : setSelectedWorkStyle
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-12 p-6 bg-slate-50 rounded-[24px] border border-slate-100 flex items-center gap-5">
              <Info size={24} className="text-primary shrink-0" />
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic text-center">
                Benchmark dihitung berdasarkan probabilitas kecocokan tertinggi
                dari data profil industri serupa.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 px-12 font-sans max-w-full mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-primary-dark tracking-tighter leading-none mb-2">
            Manajemen Request Pegawai
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            Kelola daftar permintaan penambahan atau pergantian staf unit kerja.
          </p>
        </div>
        <button
          onClick={() => setView("add")}
          className="flex items-center gap-3 bg-primary text-white font-black py-4 px-8 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 text-[10px] uppercase tracking-widest"
        >
          <PlusCircle size={18} /> Buat Request Baru
        </button>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary-dark text-white uppercase font-black text-[10px] tracking-wider">
                <th className="px-10 py-5">Posisi yang Diajukan</th>
                <th className="px-10 py-5">Departemen</th>
                <th className="px-10 py-5">Status</th>
                <th className="px-10 py-5">Tanggal Request</th>
                <th className="px-10 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <Loader2
                      className="animate-spin text-primary mx-auto"
                      size={32}
                    />
                  </td>
                </tr>
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 tracking-tight leading-none mb-1.5">
                          {req.position}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {req.quantity} Orang • {req.level}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-xs font-bold text-slate-500">
                        {req.department}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div
                        className={`inline-flex items-center px-3 py-1.5 rounded-xl font-black uppercase text-[8px] tracking-widest ${
                          req.status === "Disetujui"
                            ? "bg-green-100 text-green-700"
                            : req.status === "Ditolak"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {req.status}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-xs font-bold text-slate-500">
                        {new Date(req.request_date).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="flex justify-center gap-3">
                        {req.status === "Menunggu Persetujuan" ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setLowonganTitle(req.position);
                                setIsApproveModalOpen(true);
                              }}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                              title="Setujui"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setIsRejectModalOpen(true);
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Tolak"
                            >
                              <Ban size={18} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">
                            Selesai
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]"
                  >
                    Belum Ada Pengajuan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Persetujuan HC"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleActionHC("Disetujui");
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
              Judul Posting Lowongan
            </label>
            <input
              type="text"
              value={lowonganTitle}
              onChange={(e) => setLowonganTitle(e.target.value)}
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-primary-dark outline-none focus:bg-white focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
              Batas Akhir Lamaran
            </label>
            <input
              type="date"
              value={lowonganClosingDate}
              onChange={(e) => setLowonganClosingDate(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-primary-dark outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all text-[10px] uppercase active:scale-95"
          >
            Verifikasi & Terbitkan
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Tolak Pengajuan"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white shadow-sm">
            <Ban size={32} />
          </div>
          <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8 px-4">
            Tolak pengajuan staf untuk <br />
            <span className="text-primary-dark font-black uppercase">
              {selectedRequest?.position}
            </span>
            ?
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-200 transition-all text-[9px] uppercase tracking-widest"
            >
              Batal
            </button>
            <button
              onClick={() => handleActionHC("Ditolak")}
              className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 shadow-xl shadow-red-200 transition-all text-[9px] uppercase tracking-widest active:scale-95"
            >
              Ya, Tolak
            </button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
