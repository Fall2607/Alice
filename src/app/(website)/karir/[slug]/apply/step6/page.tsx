"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, ArrowRight, ClipboardList, CheckCircle2, DollarSign, Type, AlertCircle, Loader2
} from "lucide-react";
import { useApply } from "../ApplyContext";

interface JobAssessment {
  id: string;
  question: string;
  type: "NUMBER" | "SCALE" | "CHOICE";
  fuzzy_config: any;
  weight: number;
}

export default function Step6AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { state, setAssessmentAnswer } = useApply();
  
  // Local state to track validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<JobAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
      const fetchQuestions = async () => {
          try {
              const res = await fetch(`/api/job-assessments/${slug}`);
              if (res.ok) {
                  const data = await res.json();
                  setQuestions(data);
              }
          } catch (err) {
              console.error(err);
          } finally {
              setIsLoading(false);
          }
      };
      if (slug) fetchQuestions();
  }, [slug]);

  const handleNext = () => {
    // Validasi Sederhana
    const newErrors: Record<string, string> = {};
    for (const q of questions) {
        if (!state.assessmentAnswers?.[q.id]) {
            newErrors[q.id] = "Pertanyaan ini wajib dijawab.";
        }
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    router.push(`/karir/${slug}/apply/step7`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-primary" size={28}/> Assessment Pendahuluan
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Jawablah pertanyaan berikut dengan sejujurnya. Pertanyaan ini disesuaikan khusus untuk posisi yang Anda lamar.
        </p>
      </div>

      <div className="space-y-8">
        {isLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" size={32}/></div>
        ) : questions.length === 0 ? (
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                <p className="text-blue-700 font-medium">Tidak ada soal assessment untuk lowongan ini.</p>
                <button onClick={handleNext} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">Lewati Assessment</button>
            </div>
        ) : questions.map((q, index) => {
            const answer = state.assessmentAnswers?.[q.id] || "";
            const hasError = !!errors[q.id];

            return (
                <div key={q.id} className={`bg-slate-50/50 p-6 rounded-2xl border ${hasError ? 'border-red-300 bg-red-50/20' : 'border-slate-100 hover:border-primary/20 hover:shadow-md'} transition-all duration-300`}>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-start gap-2">
                        <span className="bg-primary text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                            {index + 1}
                        </span>
                        <span>{q.question} <span className="text-red-500">*</span></span>
                    </label>

                    <div className="ml-8">
                        {q.type === "NUMBER" && (
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                <input 
                                    type="number" 
                                    value={answer as string}
                                    onChange={(e) => {
                                        setAssessmentAnswer(q.id, e.target.value);
                                        if (errors[q.id]) setErrors(prev => ({...prev, [q.id]: ""}));
                                    }}
                                    placeholder="Masukkan Angka..."
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} bg-white outline-none transition-all text-sm font-medium`}
                                />
                            </div>
                        )}

                        {q.type === "SCALE" && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center max-w-md">
                                    <span className="text-xs text-slate-500 font-medium">Sangat Rendah (1)</span>
                                    <span className="text-xs text-slate-500 font-medium">Sangat Tinggi (5)</span>
                                </div>
                                <div className="flex gap-2 max-w-md">
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        const val = i + 1;
                                        const isSelected = answer === val.toString();
                                        return (
                                            <button
                                                key={val}
                                                onClick={() => {
                                                    setAssessmentAnswer(q.id, val.toString());
                                                    if (errors[q.id]) setErrors(prev => ({...prev, [q.id]: ""}));
                                                }}
                                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${isSelected ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105' : 'bg-white text-slate-600 border-slate-200 hover:border-primary/50 hover:bg-slate-50'}`}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {q.type === "CHOICE" && (
                            <div className="space-y-2">
                                {Object.keys(q.fuzzy_config || {}).map((opt) => {
                                    const isSelected = answer === opt;
                                    return (
                                        <label key={opt} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white hover:border-primary/50'}`}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary' : 'border-slate-300'}`}>
                                                {isSelected && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name={q.id} 
                                                className="hidden" 
                                                checked={isSelected}
                                                onChange={() => {
                                                    setAssessmentAnswer(q.id, opt);
                                                    if (errors[q.id]) setErrors(prev => ({...prev, [q.id]: ""}));
                                                }}
                                            />
                                            <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-slate-700'}`}>{opt}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        
                        {hasError && <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1"><AlertCircle size={12}/> {errors[q.id]}</p>}
                    </div>
                </div>
            );
        })}

        {/* FOOTER NAVIGATION */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 mt-8">
          <button 
            onClick={() => router.push(`/karir/${slug}/apply/step5`)} 
            className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors text-sm"
          >
            Kembali
          </button>
          <button 
            onClick={handleNext} 
            className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center gap-2 group"
          >
            Lanjut ke Review <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
          </button>
        </div>
      </div>
    </div>
  );
}
