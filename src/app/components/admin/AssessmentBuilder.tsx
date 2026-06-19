"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, Loader2, Target, Settings, AlertCircle, Edit2, Check } from "lucide-react";
import Select from "react-select";

interface FuzzyConfig {
  ideal_min?: number;
  ideal_max?: number;
  tolerance_min?: number;
  tolerance_max?: number;
  target_score?: number;
  min_score?: number;
  [key: string]: any; 
}

interface AssessmentQuestion {
  id?: string;
  job_id?: string;
  category?: string;
  question: string;
  type: "NUMBER" | "SCALE" | "CHOICE" | "SYSTEM_EDUCATION";
  fuzzy_config: FuzzyConfig;
  weight: number;
  choicesList?: { label: string, score: number }[]; 
}

interface AssessmentBundle {
  name: string;
  isEditingName?: boolean;
  questions: AssessmentQuestion[];
}

export default function AssessmentBuilder({ jobId }: { jobId: string }) {
  const [bundles, setBundles] = useState<AssessmentBundle[]>([]);
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
        
        // Group into bundles
        const grouped: Record<string, AssessmentQuestion[]> = {};
        data.forEach((q: any) => {
            if (q.type === 'CHOICE') {
                q.choicesList = Object.entries(q.fuzzy_config).map(([label, score]) => ({ label, score: Number(score) }));
            }
            const cat = q.category || 'Umum';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(q);
        });

        const initialBundles = Object.entries(grouped).map(([name, qs]) => ({
            name,
            isEditingName: false,
            questions: qs
        }));

        setBundles(initialBundles.length > 0 ? initialBundles : [{ name: "Umum", isEditingName: false, questions: [] }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBundle = () => {
    setBundles([...bundles, { name: `Bundle Baru ${bundles.length + 1}`, isEditingName: true, questions: [] }]);
  };

  const removeBundle = (bIndex: number) => {
    if (confirm("Yakin ingin menghapus seluruh bundle ini?")) {
        setBundles(bundles.filter((_, i) => i !== bIndex));
    }
  };

  const updateBundleName = (bIndex: number, newName: string) => {
    const newB = [...bundles];
    newB[bIndex].name = newName;
    setBundles(newB);
  };

  const toggleEditBundleName = (bIndex: number) => {
    const newB = [...bundles];
    newB[bIndex].isEditingName = !newB[bIndex].isEditingName;
    setBundles(newB);
  };

  const addQuestion = (bIndex: number) => {
    const newB = [...bundles];
    newB[bIndex].questions.push({
      category: newB[bIndex].name,
      question: "",
      type: "NUMBER",
      weight: 1.0,
      fuzzy_config: { ideal_min: 0, ideal_max: 0, tolerance_min: 0, tolerance_max: 0 },
      choicesList: []
    });
    setBundles(newB);
  };

  const removeQuestion = (bIndex: number, qIndex: number) => {
    const newB = [...bundles];
    newB[bIndex].questions = newB[bIndex].questions.filter((_, i) => i !== qIndex);
    setBundles(newB);
  };

  const updateQuestion = (bIndex: number, qIndex: number, field: keyof AssessmentQuestion, value: any) => {
    const newB = [...bundles];
    const q = newB[bIndex].questions[qIndex];
    (q as any)[field] = value;
    
    if (field === "type") {
        if (value === "NUMBER") q.fuzzy_config = { ideal_min: 0, ideal_max: 0, tolerance_min: 0, tolerance_max: 0 };
        if (value === "SCALE") q.fuzzy_config = { target_score: 5, min_score: 3 };
        if (value === "CHOICE") {
            q.fuzzy_config = { "Pilihan A": 100, "Pilihan B": 50, "Pilihan C": 0 };
            q.choicesList = [
                { label: "Pilihan A", score: 100 },
                { label: "Pilihan B", score: 50 },
                { label: "Pilihan C", score: 0 }
            ];
        }
        if (value === "SYSTEM_EDUCATION") {
            q.question = "Sistem mendeteksi pendidikan terakhir Anda.";
            q.fuzzy_config = {
                "S3": 100, "S2": 100, "S1": 80, "D3": 40, "SMA": 0, "SMK": 0,
                "keywords": "Informatika, Komputer"
            };
        }
    }
    setBundles(newB);
  };

  const updateFuzzyConfig = (bIndex: number, qIndex: number, key: string, value: any) => {
    const newB = [...bundles];
    newB[bIndex].questions[qIndex].fuzzy_config = { ...newB[bIndex].questions[qIndex].fuzzy_config, [key]: value };
    setBundles(newB);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      // Flatten bundles to single array
      const flatPayload: any[] = [];
      bundles.forEach(b => {
          b.questions.forEach(q => {
              const out = { ...q, category: b.name };
              if (out.type === 'CHOICE' && out.choicesList) {
                  const newConfig: any = {};
                  out.choicesList.forEach(c => {
                      if (c.label.trim() !== '') newConfig[c.label.trim()] = c.score;
                  });
                  out.fuzzy_config = newConfig;
              }
              delete out.choicesList; 
              flatPayload.push(out);
          });
      });

      const res = await fetch(`/api/job-assessments/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessments: flatPayload })
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
      setTimeout(() => setMessage(null), 5000); 
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Target size={20} className="text-primary"/> Builder Bundle Assessment
          </h2>
          <p className="text-xs text-slate-500 mt-1">Buat beberapa paket/bundle soal spesifik (misal: IT Network, IT Database).</p>
        </div>
        <div className="flex gap-2">
           <button onClick={addBundle} className="px-4 py-2 border border-slate-200 text-slate-600 rounded text-xs font-bold hover:bg-slate-50 flex items-center gap-2">
              <Plus size={14}/> Bundle Baru
           </button>
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

      <div className="space-y-10 mb-8">
        {bundles.map((bundle, bIdx) => (
            <div key={bIdx} className="border-2 border-slate-100 rounded-xl overflow-hidden shadow-sm">
                {/* Bundle Header */}
                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b-2 border-slate-100">
                    <div className="flex items-center gap-3 w-1/2">
                        {bundle.isEditingName ? (
                            <div className="flex items-center gap-2 w-full">
                                <input 
                                    type="text" 
                                    value={bundle.name} 
                                    onChange={(e) => updateBundleName(bIdx, e.target.value)}
                                    className="px-3 py-1.5 border border-primary rounded text-sm font-bold text-primary w-full focus:outline-none focus:ring-2 ring-primary/20"
                                    placeholder="Nama Bundle (Cth: Spesialis Database)"
                                    autoFocus
                                />
                                <button onClick={() => toggleEditBundleName(bIdx)} className="p-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors"><Check size={16}/></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <h3 className="text-base font-black text-slate-700 uppercase tracking-wide">Bundle: <span className="text-primary">{bundle.name}</span></h3>
                                <button onClick={() => toggleEditBundleName(bIdx)} className="text-slate-400 hover:text-primary transition-colors"><Edit2 size={14}/></button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => removeBundle(bIdx)} className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
                        <Trash2 size={14}/> Hapus Bundle
                    </button>
                </div>

                {/* Bundle Questions */}
                <div className="p-6 bg-white space-y-6">
                    {bundle.questions.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                            <p className="text-slate-400 text-sm font-medium">Bundle ini belum memiliki pertanyaan.</p>
                        </div>
                    ) : bundle.questions.map((q, qIdx) => (
                        <div key={qIdx} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow relative">
                             <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                             <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-5 items-start md:items-center pl-6">
                                <div className="flex-1 w-full">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Pertanyaan {qIdx + 1}</label>
                                    <input 
                                       type="text" 
                                       value={q.question} 
                                       onChange={(e) => updateQuestion(bIdx, qIdx, "question", e.target.value)}
                                       placeholder="Cth: Berapa ekspektasi gaji Anda?"
                                       className="w-full px-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-primary focus:border-primary transition-colors bg-slate-50 focus:bg-white"
                                    />
                                </div>
                                <div className="w-full md:w-64">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Tipe Jawaban</label>
                                    <Select 
                                        value={{ value: q.type, label: q.type === "NUMBER" ? "ANGKA (Min-Max)" : q.type === "SCALE" ? "SKALA (Rating)" : q.type === "CHOICE" ? "PILIHAN (Multichoice)" : "SISTEM (Riwayat Pendidikan)" }}
                                        onChange={(val: any) => updateQuestion(bIdx, qIdx, "type", val.value)}
                                        options={[
                                            { value: "NUMBER", label: "ANGKA (Min-Max)" },
                                            { value: "SCALE", label: "SKALA (Rating)" },
                                            { value: "CHOICE", label: "PILIHAN (Multichoice)" },
                                            { value: "SYSTEM_EDUCATION", label: "SISTEM (Riwayat Pendidikan)" },
                                        ]}
                                        className="text-sm"
                                        styles={{ control: (base) => ({ ...base, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', padding: '0px', minHeight: '38px', borderRadius: '0.375rem', boxShadow: 'none' }) }}
                                    />
                                </div>
                                <div className="w-24">
                                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Bobot</label>
                                     <input 
                                        type="number" step="0.1" 
                                        value={q.weight} 
                                        onChange={(e) => updateQuestion(bIdx, qIdx, "weight", parseFloat(e.target.value) || 1)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-primary focus:border-primary bg-slate-50 focus:bg-white text-center font-bold text-slate-700"
                                     />
                                </div>
                                <div className="pt-5 flex items-center justify-center">
                                   <button onClick={() => removeQuestion(bIdx, qIdx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={18}/></button>
                                </div>
                             </div>

                             {/* FUZZY CONFIG */}
                             <div className="p-5 bg-slate-50/50 pl-6">
                                <h4 className="text-[10px] font-black text-primary-dark mb-4 uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Konfigurasi Fuzzy</h4>
                                
                                {q.type === "NUMBER" && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                                            <label className="block text-xs font-bold text-emerald-600 mb-1.5">Ideal Min (100%)</label>
                                            <input type="number" value={q.fuzzy_config.ideal_min || 0} onChange={(e) => updateFuzzyConfig(bIdx, qIdx, "ideal_min", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm bg-slate-50 focus:bg-white" />
                                        </div>
                                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                                            <label className="block text-xs font-bold text-emerald-600 mb-1.5">Ideal Max (100%)</label>
                                            <input type="number" value={q.fuzzy_config.ideal_max || 0} onChange={(e) => updateFuzzyConfig(bIdx, qIdx, "ideal_max", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm bg-slate-50 focus:bg-white" />
                                        </div>
                                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                                            <label className="block text-xs font-bold text-rose-500 mb-1.5">Toleransi Bawah (0%)</label>
                                            <input type="number" value={q.fuzzy_config.tolerance_min || 0} onChange={(e) => updateFuzzyConfig(bIdx, qIdx, "tolerance_min", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm bg-slate-50 focus:bg-white" />
                                        </div>
                                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                                            <label className="block text-xs font-bold text-rose-500 mb-1.5">Toleransi Atas (0%)</label>
                                            <input type="number" value={q.fuzzy_config.tolerance_max || 0} onChange={(e) => updateFuzzyConfig(bIdx, qIdx, "tolerance_max", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm bg-slate-50 focus:bg-white" />
                                        </div>
                                    </div>
                                )}

                                {q.type === "SCALE" && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm col-span-2 md:col-span-1">
                                            <label className="block text-xs font-bold text-emerald-600 mb-1.5">Target Score (100%)</label>
                                            <input type="number" value={q.fuzzy_config.target_score || 5} onChange={(e) => updateFuzzyConfig(bIdx, qIdx, "target_score", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm bg-slate-50 focus:bg-white" />
                                        </div>
                                        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm col-span-2 md:col-span-1">
                                            <label className="block text-xs font-bold text-rose-500 mb-1.5">Min Score (0%)</label>
                                            <input type="number" value={q.fuzzy_config.min_score || 0} onChange={(e) => updateFuzzyConfig(bIdx, qIdx, "min_score", Number(e.target.value))} className="w-full border border-slate-200 p-2 rounded-md text-sm bg-slate-50 focus:bg-white" />
                                        </div>
                                    </div>
                                )}

                                {q.type === "CHOICE" && (
                                    <div className="space-y-3">
                                        <div className="bg-white p-4 border border-slate-200 rounded-md shadow-sm max-w-2xl">
                                            <div className="grid grid-cols-12 gap-3 mb-2 px-1">
                                                <div className="col-span-7 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teks Pilihan Ganda</div>
                                                <div className="col-span-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Skor (0-100%)</div>
                                            </div>
                                            {(q.choicesList || []).map((choice, optIdx) => (
                                                <div key={optIdx} className="grid grid-cols-12 gap-3 items-center mb-3">
                                                    <div className="col-span-7">
                                                        <input 
                                                            type="text" value={choice.label} 
                                                            onChange={(e) => {
                                                                const newB = [...bundles];
                                                                newB[bIdx].questions[qIdx].choicesList![optIdx].label = e.target.value;
                                                                setBundles(newB);
                                                            }}
                                                            className="w-full border border-slate-200 p-2 rounded-md text-sm bg-slate-50 focus:bg-white" 
                                                        />
                                                    </div>
                                                    <div className="col-span-4 relative">
                                                        <input 
                                                            type="number" value={choice.score} 
                                                            onChange={(e) => {
                                                                const newB = [...bundles];
                                                                newB[bIdx].questions[qIdx].choicesList![optIdx].score = Number(e.target.value);
                                                                setBundles(newB);
                                                            }}
                                                            className="w-full border border-slate-200 p-2 rounded-md text-sm bg-slate-50 focus:bg-white text-center font-bold text-slate-700" 
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                                                    </div>
                                                    <div className="col-span-1 flex justify-center">
                                                        <button onClick={() => {
                                                            const newB = [...bundles];
                                                            newB[bIdx].questions[qIdx].choicesList!.splice(optIdx, 1);
                                                            setBundles(newB);
                                                        }} className="p-2 text-slate-300 hover:text-red-500 rounded-md"><Trash2 size={16}/></button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const newB = [...bundles];
                                                newB[bIdx].questions[qIdx].choicesList!.push({ label: `Pilihan ${newB[bIdx].questions[qIdx].choicesList!.length + 1}`, score: 0 });
                                                setBundles(newB);
                                            }} className="text-xs font-bold text-primary hover:text-primary-dark mt-2 flex items-center gap-1.5 p-2 rounded-md hover:bg-primary/5 transition-colors"><Plus size={14}/> Tambah Pilihan</button>
                                        </div>
                                    </div>
                                )}

                                {q.type === "SYSTEM_EDUCATION" && (
                                    <div className="space-y-4">
                                        <div className="bg-white p-4 border border-slate-200 rounded-md shadow-sm max-w-4xl">
                                            <p className="text-xs text-slate-500 mb-4">Sistem akan otomatis mengecek riwayat pendidikan kandidat. Silakan atur persentase skor untuk masing-masing jenjang pendidikan dan jurusan.</p>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                                                {['S3', 'S2', 'S1', 'D3', 'SMA', 'SMK'].map(level => (
                                                    <div key={level}>
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{level} (%)</label>
                                                        <input 
                                                            type="number" 
                                                            value={q.fuzzy_config[level] ?? 0} 
                                                            onChange={(e) => updateFuzzyConfig(bIdx, qIdx, level, Number(e.target.value))}
                                                            className="w-full border border-slate-200 p-2 rounded-md text-sm bg-slate-50 focus:bg-white text-center font-bold text-slate-700" 
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Keywords Jurusan yang Dicari (pisahkan dengan koma)</label>
                                                <input 
                                                    type="text" 
                                                    value={q.fuzzy_config.keywords || ""} 
                                                    onChange={(e) => updateFuzzyConfig(bIdx, qIdx, "keywords", e.target.value)}
                                                    placeholder="Cth: Informatika, Ilmu Komputer, Sistem Informasi"
                                                    className="w-full border border-slate-200 p-2 rounded-md text-sm bg-slate-50 focus:bg-white" 
                                                />
                                                <p className="text-[9px] text-slate-400 mt-1.5 leading-tight">Jika jurusan kandidat mengandung kata-kata di atas, skor jenjang pendidikan akan dikalikan 100%. Jika melenceng jauh, bisa dikalikan lebih rendah di sisi backend.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    ))}

                    <button onClick={() => addQuestion(bIdx)} className="w-full py-4 border-2 border-dashed border-primary/30 text-primary font-bold rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <Plus size={16} /> Tambah Pertanyaan ke Bundle Ini
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
