"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, Loader2, Target, Settings, AlertCircle } from "lucide-react";
import Select from "react-select";

interface FuzzyConfig {
  ideal_min?: number;
  ideal_max?: number;
  tolerance_min?: number;
  tolerance_max?: number;
  target_score?: number;
  min_score?: number;
  [key: string]: any; // Untuk mapping teks pilihan ganda (misal "Ya": 100)
}

interface AssessmentQuestion {
  id?: string;
  job_id?: string;
  question: string;
  type: "NUMBER" | "SCALE" | "CHOICE";
  fuzzy_config: FuzzyConfig;
  weight: number;
  choicesList?: { label: string, score: number }[]; // UI State for Choice
}

export default function AssessmentBuilder({ jobId }: { jobId: string }) {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [jobId]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/job-assessments/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        const formattedData = data.map((q: any) => {
            if (q.type === 'CHOICE') {
                q.choicesList = Object.entries(q.fuzzy_config).map(([label, score]) => ({ label, score: Number(score) }));
            }
            return q;
        });
        setQuestions(formattedData.length > 0 ? formattedData : []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        type: "NUMBER",
        weight: 1.0,
        fuzzy_config: { ideal_min: 0, ideal_max: 0, tolerance_min: 0, tolerance_max: 0 },
        choicesList: []
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof AssessmentQuestion, value: any) => {
    const newQ = [...questions];
    newQ[index] = { ...newQ[index], [field]: value };
    
    // Reset fuzzy config jika tipe berubah
    if (field === "type") {
        if (value === "NUMBER") newQ[index].fuzzy_config = { ideal_min: 0, ideal_max: 0, tolerance_min: 0, tolerance_max: 0 };
        if (value === "SCALE") newQ[index].fuzzy_config = { target_score: 5, min_score: 3 };
        if (value === "CHOICE") {
            newQ[index].fuzzy_config = { "Pilihan A": 100, "Pilihan B": 50, "Pilihan C": 0 };
            newQ[index].choicesList = [
                { label: "Pilihan A", score: 100 },
                { label: "Pilihan B", score: 50 },
                { label: "Pilihan C", score: 0 }
            ];
        }
    }
    
    setQuestions(newQ);
  };

  const updateFuzzyConfig = (index: number, key: string, value: any) => {
    const newQ = [...questions];
    newQ[index].fuzzy_config = { ...newQ[index].fuzzy_config, [key]: value };
    setQuestions(newQ);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      // Transform choicesList back to fuzzy_config object format
      const payload = questions.map(q => {
          const out = { ...q };
          if (out.type === 'CHOICE' && out.choicesList) {
              const newConfig: any = {};
              out.choicesList.forEach(c => {
                  if (c.label.trim() !== '') newConfig[c.label.trim()] = c.score;
              });
              out.fuzzy_config = newConfig;
          }
          delete out.choicesList; // Hapus state UI agar tidak masuk ke DB
          return out;
      });

      const res = await fetch(`/api/job-assessments/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessments: payload })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Assessment berhasil disimpan!' });
      } else {
        throw new Error(data.error || data.message || "Gagal menyimpan");
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 10000); // 10 seconds to read
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Target size={20} className="text-primary"/> Builder Assessment & Fuzzy Logic
          </h2>
          <p className="text-xs text-slate-500 mt-1">Buat kriteria seleksi otomatis berbasis persentase (Fuzzy Logic).</p>
        </div>
        <div className="flex gap-2">
           <button onClick={fetchQuestions} className="px-4 py-2 border border-slate-200 text-slate-600 rounded text-xs font-bold hover:bg-slate-50">Reset</button>
           <button 
             onClick={handleSave} 
             disabled={isSaving}
             className="px-6 py-2 bg-primary text-white rounded text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2"
           >
             {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
           </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <AlertCircle size={14} /> {message.text}
        </div>
      )}

      <div className="space-y-6 mb-8">
        {questions.length === 0 ? (
           <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
               <p className="text-slate-500 text-sm font-medium">Belum ada pertanyaan assessment.</p>
           </div>
        ) : questions.map((q, i) => (
          <div key={i} className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
             <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-5 items-start md:items-center">
                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div>
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Pertanyaan Assessment</label>
                    <input 
                       type="text" 
                       value={q.question} 
                       onChange={(e) => updateQuestion(i, "question", e.target.value)}
                       placeholder="Cth: Berapa ekspektasi gaji Anda?"
                       className="w-full px-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-primary focus:border-primary transition-colors bg-slate-50 focus:bg-white placeholder:text-slate-300"
                    />
                </div>
                <div className="w-full md:w-64">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Tipe Jawaban</label>
                    <Select 
                        value={{ value: q.type, label: q.type === "NUMBER" ? "ANGKA (Min-Max)" : q.type === "SCALE" ? "SKALA (Rating)" : "PILIHAN (Multichoice)" }}
                        onChange={(val: any) => updateQuestion(i, "type", val.value)}
                        options={[
                            { value: "NUMBER", label: "ANGKA (Min-Max)" },
                            { value: "SCALE", label: "SKALA (Rating)" },
                            { value: "CHOICE", label: "PILIHAN (Multichoice)" },
                        ]}
                        className="text-sm"
                        styles={{
                            control: (base) => ({ ...base, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', padding: '0px', minHeight: '38px', borderRadius: '0.375rem', boxShadow: 'none', '&:hover': { borderColor: '#cbd5e1' } })
                        }}
                    />
                </div>
                <div className="w-24">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Bobot</label>
                     <input 
                        type="number" step="0.1" 
                        value={q.weight} 
                        onChange={(e) => updateQuestion(i, "weight", parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-primary focus:border-primary bg-slate-50 focus:bg-white transition-colors text-center font-bold text-slate-700"
                     />
                </div>
                <div className="pt-5 flex items-center justify-center">
                   <button onClick={() => removeQuestion(i)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={18}/></button>
                </div>
             </div>

             {/* FUZZY CONFIG BUILDER */}
             <div className="p-5 bg-slate-50/50">
                <h4 className="text-[10px] font-black text-primary-dark mb-4 uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Konfigurasi Penilaian (Fuzzy Logic)</h4>
                
                {q.type === "NUMBER" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                            <label className="block text-xs font-bold text-emerald-600 mb-1.5">Ideal Min (100%)</label>
                            <input type="number" value={q.fuzzy_config.ideal_min || 0} onChange={(e) => updateFuzzyConfig(i, "ideal_min", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm focus:outline-emerald-500 bg-slate-50 focus:bg-white" placeholder="Cth: 4000000" />
                            <p className="text-[9px] text-slate-400 mt-1.5 leading-tight">Batas bawah untuk mendapatkan skor sempurna.</p>
                        </div>
                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                            <label className="block text-xs font-bold text-emerald-600 mb-1.5">Ideal Max (100%)</label>
                            <input type="number" value={q.fuzzy_config.ideal_max || 0} onChange={(e) => updateFuzzyConfig(i, "ideal_max", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm focus:outline-emerald-500 bg-slate-50 focus:bg-white" placeholder="Cth: 6000000" />
                            <p className="text-[9px] text-slate-400 mt-1.5 leading-tight">Batas atas untuk mendapatkan skor sempurna.</p>
                        </div>
                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                            <label className="block text-xs font-bold text-rose-500 mb-1.5">Toleransi Bawah (0%)</label>
                            <input type="number" value={q.fuzzy_config.tolerance_min || 0} onChange={(e) => updateFuzzyConfig(i, "tolerance_min", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm focus:outline-rose-500 bg-slate-50 focus:bg-white" placeholder="Cth: 3500000" />
                            <p className="text-[9px] text-slate-400 mt-1.5 leading-tight">Di bawah angka ini, kandidat mendapat skor 0.</p>
                        </div>
                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                            <label className="block text-xs font-bold text-rose-500 mb-1.5">Toleransi Atas (0%)</label>
                            <input type="number" value={q.fuzzy_config.tolerance_max || 0} onChange={(e) => updateFuzzyConfig(i, "tolerance_max", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm focus:outline-rose-500 bg-slate-50 focus:bg-white" placeholder="Cth: 8000000" />
                            <p className="text-[9px] text-slate-400 mt-1.5 leading-tight">Di atas angka ini, kandidat mendapat skor 0.</p>
                        </div>
                    </div>
                )}

                {q.type === "SCALE" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-emerald-600 mb-1.5">Target Score (100%)</label>
                            <input type="number" value={q.fuzzy_config.target_score || 5} onChange={(e) => updateFuzzyConfig(i, "target_score", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm focus:outline-emerald-500 bg-slate-50 focus:bg-white" />
                        </div>
                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-rose-500 mb-1.5">Min Score (0%)</label>
                            <input type="number" value={q.fuzzy_config.min_score || 0} onChange={(e) => updateFuzzyConfig(i, "min_score", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm focus:outline-rose-500 bg-slate-50 focus:bg-white" />
                        </div>
                    </div>
                )}

                {q.type === "CHOICE" && (
                    <div className="space-y-3">
                        <div className="bg-white p-4 border border-slate-200 rounded-md shadow-sm max-w-2xl">
                            <div className="grid grid-cols-12 gap-3 mb-2 px-1">
                                <div className="col-span-7 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teks Pilihan Ganda</div>
                                <div className="col-span-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Skor (0-100%)</div>
                                <div className="col-span-1"></div>
                            </div>
                            {(q.choicesList || []).map((choice, optIdx) => (
                                <div key={optIdx} className="grid grid-cols-12 gap-3 items-center mb-3">
                                    <div className="col-span-7">
                                        <input 
                                            type="text" 
                                            value={choice.label} 
                                            onChange={(e) => {
                                                const newQ = [...questions];
                                                newQ[i].choicesList![optIdx].label = e.target.value;
                                                setQuestions(newQ);
                                            }}
                                            className="w-full border border-slate-200 p-2 rounded-md text-sm focus:outline-primary bg-slate-50 focus:bg-white transition-colors" placeholder="Cth: Ya, Kapan Saja" 
                                        />
                                    </div>
                                    <div className="col-span-4 relative">
                                        <input 
                                            type="number" 
                                            value={choice.score} 
                                            onChange={(e) => {
                                                const newQ = [...questions];
                                                newQ[i].choicesList![optIdx].score = Number(e.target.value);
                                                setQuestions(newQ);
                                            }}
                                            className="w-full border border-slate-200 p-2 rounded-md text-sm focus:outline-primary bg-slate-50 focus:bg-white transition-colors text-center font-bold text-slate-700" placeholder="Skor" 
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button onClick={() => {
                                            const newQ = [...questions];
                                            newQ[i].choicesList!.splice(optIdx, 1);
                                            setQuestions(newQ);
                                        }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => {
                                const newQ = [...questions];
                                newQ[i].choicesList!.push({ label: `Pilihan Baru ${newQ[i].choicesList!.length + 1}`, score: 0 });
                                setQuestions(newQ);
                            }} className="text-xs font-bold text-primary hover:text-primary-dark mt-2 flex items-center gap-1.5 p-2 rounded-md hover:bg-primary/5 transition-colors"><Plus size={14}/> Tambah Pilihan</button>
                        </div>
                    </div>
                )}
             </div>
          </div>
        ))}
      </div>

      <button onClick={addQuestion} className="w-full py-5 border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 shadow-sm">
        <Plus size={18} /> Tambah Pertanyaan Assessment
      </button>

    </div>
  );
}
