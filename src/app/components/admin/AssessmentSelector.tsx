"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, ListChecks, AlertCircle, CheckCircle2 } from "lucide-react";

interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  type: string;
  weight: number;
}

export default function AssessmentSelector({ jobOpeningId, jobId }: { jobOpeningId: string, jobId: string }) {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string>("");
  const [initialBundle, setInitialBundle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [jobOpeningId, jobId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const qRes = await fetch(`/api/job-assessments/${jobId}`);
      let allQuestions: AssessmentQuestion[] = [];
      if (qRes.ok) {
        allQuestions = await qRes.json();
        setQuestions(allQuestions);
      }

      const sRes = await fetch(`/api/job-opening-assessments/${jobOpeningId}`);
      if (sRes.ok) {
        const selectedData = await sRes.json();
        const activeIds = selectedData.map((d: any) => d.job_assessment_id);
        
        if (activeIds.length > 0 && allQuestions.length > 0) {
            // Temukan bundle dari salah satu ID yang aktif
            const activeQ = allQuestions.find(q => activeIds.includes(q.id));
            if (activeQ) {
                setSelectedBundle(activeQ.category || 'Umum');
                setInitialBundle(activeQ.category || 'Umum');
            }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      // Ambil semua ID pertanyaan yang sesuai dengan bundle terpilih
      const selectedIds = questions.filter(q => (q.category || 'Umum') === selectedBundle).map(q => q.id);

      const res = await fetch(`/api/job-opening-assessments/${jobOpeningId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedAssessmentIds: selectedIds })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Bundle assessment berhasil diaktifkan untuk lowongan ini!' });
        setInitialBundle(selectedBundle);
      } else {
        throw new Error(data.error || data.message || "Gagal menyimpan");
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const groupedQuestions = questions.reduce((acc, q) => {
    const cat = q.category || 'Umum';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {} as Record<string, AssessmentQuestion[]>);

  const availableBundles = Object.keys(groupedQuestions);

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ListChecks size={20} className="text-primary"/> Pilih Bundle Assessment
          </h2>
          <p className="text-xs text-slate-500 mt-1">Pilih paket soal yang sesuai dengan spesialisasi lowongan ini.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleSave} 
             disabled={isSaving || !selectedBundle}
             className="px-6 py-2 bg-primary text-white rounded text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan Pilihan Bundle
           </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <AlertCircle size={14} /> {message.text}
        </div>
      )}

      {questions.length === 0 ? (
         <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
             <p className="text-slate-500 text-sm font-medium">Master Job ini belum memiliki bundle assessment.</p>
             <p className="text-xs text-slate-400 mt-2">Silakan tambahkan di menu Manajemen Posisi Pekerjaan.</p>
         </div>
      ) : (
         <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableBundles.map(bundle => (
                    <div 
                        key={bundle} 
                        onClick={() => setSelectedBundle(bundle)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden ${selectedBundle === bundle ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                    >
                        {selectedBundle === bundle && (
                            <div className="absolute top-3 right-3 text-primary">
                                <CheckCircle2 size={20} className="fill-primary/20"/>
                            </div>
                        )}
                        <h3 className={`font-black uppercase tracking-wide text-sm mb-1 pr-6 ${selectedBundle === bundle ? 'text-primary' : 'text-slate-700'}`}>{bundle}</h3>
                        <p className="text-xs text-slate-500 font-medium">{groupedQuestions[bundle].length} Pertanyaan</p>
                        
                        {initialBundle === bundle && selectedBundle !== bundle && (
                            <div className="mt-3 inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">Bundle Aktif Saat Ini</div>
                        )}
                        {initialBundle === bundle && selectedBundle === bundle && (
                            <div className="mt-3 inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">Bundle Aktif Saat Ini</div>
                        )}
                    </div>
                ))}
            </div>

            {selectedBundle && (
                <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            Preview Soal: <span className="text-primary uppercase">{selectedBundle}</span>
                        </h4>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-slate-400 text-xs uppercase font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-3 w-12 text-center">No</th>
                                <th className="px-5 py-3">Pertanyaan</th>
                                <th className="px-5 py-3 text-center">Tipe Jawaban</th>
                                <th className="px-5 py-3 text-center">Bobot</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {groupedQuestions[selectedBundle].map((q, idx) => (
                                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                                    <td className="px-5 py-3 font-medium text-slate-700">{q.question}</td>
                                    <td className="px-5 py-3 text-center">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded border border-slate-200 font-bold uppercase tracking-wide">
                                           {q.type}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-center font-bold text-slate-600">{q.weight}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
         </div>
      )}
    </div>
  );
}
