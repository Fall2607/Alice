// File: app/(admin)/admin/request-pegawai/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { PlusCircle, CheckCircle, XCircle, Loader2, AlertTriangle, Info } from "lucide-react";
import Modal from "@/app/components/modal";
import SearchableMultiSelect, { MultiSelectOption } from "@/app/components/admin/SearchableMultiSelect";
import SearchableSelect from "@/app/components/admin/SearchableSelect";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert";

// --- INTERFACES ---
interface JobRequest {
  id: number;
  position: string;
  quantity: number;
  requester: string;
  department: string;
  request_date: string;
  urgency: 'Rendah' | 'Sedang' | 'Tinggi';
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';
}

interface Jabatan {
  id: number;
  nama_jabatan: string;
}

type SelectOption = { value: string | number; label: string };
type MbtiCategorizedOptions = {
  interaction: MultiSelectOption[];
  information: MultiSelectOption[];
  decision: MultiSelectOption[];
  workStyle: MultiSelectOption[];
};

// --- DATA & OPTIONS ---
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

// --- COMPONENT ---
export default function RequestPegawaiPage() {
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<JobRequest | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Form states
  const [requestType, setRequestType] = useState<"penambahan" | "pergantian">("penambahan");
  const [selectedPosition, setSelectedPosition] = useState<SelectOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState<'Rendah' | 'Sedang' | 'Tinggi'>('Rendah');
  const [selectedInteraction, setSelectedInteraction] = useState<MultiSelectOption[]>([]);
  const [selectedInformation, setSelectedInformation] = useState<MultiSelectOption[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<MultiSelectOption[]>([]);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<MultiSelectOption[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [requestsRes, jabatanRes] = await Promise.all([
        fetch(`${baseUrl}/employee-requests`),
        fetch(`${baseUrl}/jabatan`) // Asumsi endpoint ini ada
      ]);
      if (!requestsRes.ok) throw new Error("Gagal memuat data request");
      if (!jabatanRes.ok) throw new Error("Gagal memuat data jabatan");

      const requestsData = await requestsRes.json();
      const jabatanData = await jabatanRes.json();

      setRequests(requestsData);
      setJabatanList(jabatanData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
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
    const counts = allSelectedTraits.reduce((acc, trait) => { acc[trait.type] = (acc[trait.type] || 0) + 1; return acc; }, {} as Record<string, number>);
    const getTopTwo = (c1: string, c2: string) => { const n1 = counts[c1] || 0, n2 = counts[c2] || 0; if (n1 > n2) return [c1, c2]; if (n2 > n1) return [c2, c1]; return n1 > 0 ? [c1, c2] : [null, null]; };
    const d1 = getTopTwo('E', 'I'), d2 = getTopTwo('S', 'N'), d3 = getTopTwo('T', 'F'), d4 = getTopTwo('J', 'P');
    const combos: string[] = [];
    for (const c1 of d1) if (c1) for (const c2 of d2) if (c2) for (const c3 of d3) if (c3) for (const c4 of d4) if (c4) { const combo = `${c1}${c2}${c3}${c4}`; if (!combos.includes(combo)) combos.push(combo); }
    return combos.map(combo => ({ combo, score: combo.split('').reduce((acc, char) => acc + (counts[char] || 0), 0) })).sort((a, b) => b.score - a.score).slice(0, 3).map(i => i.combo);
  }, [selectedInteraction, selectedInformation, selectedDecision, selectedWorkStyle]);

  const positionOptions = useMemo(() => {
    return jabatanList.map(j => ({ value: j.id, label: j.nama_jabatan }));
  }, [jabatanList]);

  const resetForm = () => {
    setRequestType("penambahan");
    setSelectedPosition(null);
    setQuantity(1);
    setUrgency('Rendah');
    setSelectedInteraction([]);
    setSelectedInformation([]);
    setSelectedDecision([]);
    setSelectedWorkStyle([]);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsApproveModalOpen(false);
    setIsRejectModalOpen(false);
    setSelectedRequest(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userString = localStorage.getItem('user');
    if (!userString) {
      showErrorToast("Sesi tidak ditemukan, silakan login ulang.");
      return;
    }
    if (!selectedPosition) {
      showErrorToast("Posisi jabatan wajib diisi.");
      return;
    }
    const user = JSON.parse(userString);
    const body = {
      requester_nip: user.nip,
      job_position_id: selectedPosition.value,
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
      showSuccessToast("Request berhasil dikirim!");
      handleCloseModals();
      fetchData();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  };

  const handleUpdateStatus = async (status: 'Disetujui' | 'Ditolak') => {
    if (!selectedRequest) return;
    try {
      const response = await fetch(`${baseUrl}/employee-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal ${status === 'Disetujui' ? 'menyetujui' : 'menolak'} request`);
      }
      showSuccessToast(`Request berhasil ${status.toLowerCase()}!`);
      handleCloseModals();
      fetchData();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  };

  const getStatusClass = (status: string) => ({ "Menunggu Persetujuan": "bg-yellow-100 text-yellow-800", "Disetujui": "bg-green-100 text-green-800", "Ditolak": "bg-red-100 text-red-800" }[status] || "bg-slate-100 text-slate-800");
  const getUrgencyClass = (urgency: string) => ({ "Tinggi": "text-red-600 font-semibold", "Sedang": "text-yellow-600 font-semibold", "Rendah": "text-green-600 font-semibold" }[urgency] || "text-slate-600");

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-dark">Request Penambahan Pegawai</h1>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark">
          <PlusCircle size={20} /> Buat Request Baru
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-white uppercase bg-primary-dark">
              <tr>
                <th scope="col" className="px-6 py-3">Posisi yang Diajukan</th>
                <th scope="col" className="px-6 py-3">Requester</th>
                <th scope="col" className="px-6 py-3">Tanggal</th>
                <th scope="col" className="px-6 py-3">Urgensi</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-center">Aksi HC</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (<tr><td colSpan={6} className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>)
                : error ? (<tr><td colSpan={6} className="text-center p-8 text-red-500"><AlertTriangle className="inline mr-2" />{error}</td></tr>)
                  : requests.length > 0 ? (
                    requests.map((req) => (
                      <tr key={req.id} className="bg-white border-b border-slate-300 last:border-b-0 hover:bg-slate-50">
                        <th scope="row" className="px-6 py-4 font-medium text-slate-900">{req.position}<p className="font-normal text-slate-500">{req.quantity} orang</p></th>
                        <td className="px-6 py-4">{req.requester}<p className="text-slate-500 text-xs">{req.department}</p></td>
                        <td className="px-6 py-4">{new Date(req.request_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                        <td className={`px-6 py-4 ${getUrgencyClass(req.urgency)}`}>{req.urgency}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(req.status)}`}>{req.status}</span></td>
                        <td className="px-6 py-4 text-center">
                          {req.status === "Menunggu Persetujuan" && (
                            <div className="flex justify-center items-center gap-2">
                              <button onClick={() => { setSelectedRequest(req); setIsApproveModalOpen(true); }} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Setujui"><CheckCircle size={18} /></button>
                              <button onClick={() => { setSelectedRequest(req); setIsRejectModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Tolak"><XCircle size={18} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))) : (<tr><td colSpan={6} className="text-center p-8"><Info className="mx-auto mb-2 text-slate-400" />Tidak ada data request.</td></tr>)
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={handleCloseModals} title="Buat Request Pegawai Baru" size="4xl">
        <form onSubmit={handleSubmit}>
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-medium text-slate-800 mb-3">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Request</label>
                <div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="requestType" value="penambahan" checked={requestType === 'penambahan'} onChange={(e) => setRequestType(e.target.value as any)} />Penambahan</label><label className="flex items-center gap-2"><input type="radio" name="requestType" value="pergantian" checked={requestType === 'pergantian'} onChange={(e) => setRequestType(e.target.value as any)} />Pergantian</label></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posisi Jabatan</label>
                <SearchableSelect options={positionOptions} value={selectedPosition} onChange={(option) => setSelectedPosition(option as SelectOption | null)} placeholder="Pilih posisi jabatan..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Dibutuhkan</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Urgensi</label>
                <select value={urgency} onChange={(e) => setUrgency(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md"><option>Rendah</option><option>Sedang</option><option>Tinggi</option></select>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-3">Preferensi Kepribadian (Pilih minimal 3 total)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Gaya Interaksi</label><SearchableMultiSelect options={mbtiCategorizedOptions.interaction} value={selectedInteraction} onChange={setSelectedInteraction} placeholder="Pilih..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Pendekatan Pengambilan Keputusan</label><SearchableMultiSelect options={mbtiCategorizedOptions.decision} value={selectedDecision} onChange={setSelectedDecision} placeholder="Pilih..." /></div>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Cara Mengolah Informasi</label><SearchableMultiSelect options={mbtiCategorizedOptions.information} value={selectedInformation} onChange={setSelectedInformation} placeholder="Pilih..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Gaya Bekerja & Pengaturan Waktu</label><SearchableMultiSelect options={mbtiCategorizedOptions.workStyle} value={selectedWorkStyle} onChange={setSelectedWorkStyle} placeholder="Pilih..." /></div>
              </div>
            </div>
            <div className="mt-6">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-slate-700 text-center">
                  Tipe Kepribadian yang disarankan (Top 3):
                  {[...selectedInteraction, ...selectedInformation, ...selectedDecision, ...selectedWorkStyle].length < 3
                    ? <span className="ml-2 text-slate-500 italic">Pilih minimal 3 total karakteristik.</span>
                    : <strong className="ml-2 text-blue-700 text-base tracking-widest">{topMbtiResults.join(', ')}</strong>
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={handleCloseModals} className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300">Batal</button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Kirim Request</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isApproveModalOpen} onClose={handleCloseModals} title="Setujui & Buat Lowongan">
        {selectedRequest && <div>
          <div className="space-y-2 text-sm text-slate-600 border-b pb-4 mb-4">
            <p>Anda akan menyetujui permintaan penambahan pegawai untuk:</p>
            <p><strong>Posisi:</strong> {selectedRequest.position}</p>
            <p><strong>Jumlah:</strong> {selectedRequest.quantity} orang</p>
            <p><strong>Departemen:</strong> {selectedRequest.department}</p>
          </div>
          <p className="text-slate-600">Tindakan ini akan secara otomatis membuat draf lowongan baru di halaman Manajemen Lowongan. Lanjutkan?</p>
          <div className="mt-6 flex justify-end gap-4">
            <button onClick={handleCloseModals} className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300">Batal</button>
            <button onClick={() => handleUpdateStatus('Disetujui')} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">Ya, Setujui & Buat Lowongan</button>
          </div>
        </div>}
      </Modal>

      <Modal isOpen={isRejectModalOpen} onClose={handleCloseModals} title="Tolak Request">
        {selectedRequest && <div>
          <p className="text-slate-600">Apakah Anda yakin ingin menolak request untuk posisi <strong>{selectedRequest.position}</strong>?</p>
          <div className="mt-6 flex justify-end gap-4">
            <button onClick={handleCloseModals} className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300">Batal</button>
            <button onClick={() => handleUpdateStatus('Ditolak')} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Ya, Tolak</button>
          </div>
        </div>}
      </Modal>
    </div>
  );
}

