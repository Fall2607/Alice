/** Path: src/app/(public)/assessment/[token]/dashboard/page.tsx 
 * Deskripsi: Halaman utama pengerjaan tes dengan struktur yang disatukan untuk Pratinjau.
 * Perbaikan: Mengatasi error resolusi modul dengan internal shim dan penggabungan data.
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Clock, LayoutGrid, ClipboardList, Image as ImageIcon, PlayCircle, 
  CheckCircle2, ChevronLeft, ChevronRight, User, ShieldCheck, 
  Timer as TimerIcon, BarChart3, Zap, Check
} from "lucide-react";
import { useParams } from "next/navigation";
import { mbtiPairs } from "@/app/data/tests/mbtiData";
import { getMbtiResult } from "@/app/utils/mbtiUtils";
import MBTITestContent from "@/app/components/tests/MBTI/MBTITestContent";

// ==============================================================================
// 4. MAIN ASSESSMENT DASHBOARD
// ==============================================================================
export default function AssessmentDashboard() {
  const params = useParams() as any;
  const token = params?.token || "PREVIEW-MODE";

  const [view, setView] = useState<"dashboard" | "mbti" | "result">("dashboard");
  const [mbtiStage, setMbtiStage] = useState(1);
  const [mbtiAnswers, setMbtiAnswers] = useState<Record<number, 'A' | 'B'>>({});
  
  // State Timer
  const [globalTimeLeft, setGlobalTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Logika Timer Global
  useEffect(() => {
    let timer: any;
    if (isTimerRunning && globalTimeLeft > 0) {
      timer = setInterval(() => setGlobalTimeLeft(prev => prev - 1), 1000);
    } else if (globalTimeLeft === 0 && isTimerRunning) {
      handleFinishMBTI();
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, globalTimeLeft]);

  const handleStartMBTI = () => {
    setView("mbti");
    setMbtiStage(1);
    setMbtiAnswers({});
    setGlobalTimeLeft(15 * 60);
    setIsTimerRunning(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishMBTI = () => {
    setIsTimerRunning(false);
    setView("result");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans selection:bg-blue-100 selection:text-[#0173b6]">
      <main className="container mx-auto p-4 md:p-10">
        
        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && (
          <div className="max-w-3xl mx-auto py-6 animate-in fade-in duration-700">
            <div className="mb-10 p-6 md:p-8 bg-white rounded-md border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#0173b6]"></div>
              <div className="w-16 h-16 bg-slate-50 rounded-md flex items-center justify-center text-[#0173b6] border border-slate-100 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <User size={32} />
              </div>
              <div className="flex-1 min-w-0 text-center md:text-left">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2 leading-none">Assessment Portal</h2>
                <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
                  <ShieldCheck size={14} className="text-[#0173b6]" />
                  <code className="text-[10px] text-[#0173b6] font-mono font-bold tracking-widest uppercase truncate max-w-[150px]">{token}</code>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-md border border-slate-100 hover:border-[#0173b6] transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group shadow-sm hover:shadow-xl hover:shadow-blue-900/5">
                <div className="flex items-center gap-6 w-full sm:flex-1">
                  <div className="h-16 w-16 rounded-md bg-blue-50 flex items-center justify-center text-[#0173b6] border border-blue-100 group-hover:bg-[#0173b6] group-hover:text-white transition-all duration-500">
                    <LayoutGrid size={32} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm text-slate-800 mb-1 group-hover:text-[#0173b6] transition-colors">Tes Kepribadian (MBTI)</h4>
                    <p className="text-slate-400 text-[10px] font-medium max-w-sm uppercase tracking-tight italic">Analisis karakter menggunakan 28 butir pernyataan berpasangan.</p>
                    <div className="flex items-center gap-2 mt-3 text-[9px] font-black text-slate-300 uppercase bg-slate-50 w-fit px-2 py-0.5 rounded border border-slate-100">
                       <Clock size={12} /> 15 Menit
                    </div>
                  </div>
                </div>
                <button onClick={handleStartMBTI} className="w-full sm:w-auto px-10 py-4 bg-[#0173b6] text-white font-black rounded-md uppercase text-[10px] tracking-widest hover:bg-[#015a8f] transition-all shadow-lg active:scale-95 shadow-blue-900/10">Mulai Tes</button>
              </div>

              {/* Locked Placeholders */}
              {[
                { name: 'DISC Profile', icon: <Zap />, color: 'text-orange-500' },
                { name: 'PAPI Kostik', icon: <ClipboardList />, color: 'text-emerald-500' },
                { name: 'Vision Test', icon: <ImageIcon />, color: 'text-amber-500' }
              ].map(test => (
                <div key={test.name} className="bg-slate-50/50 p-6 rounded-md border border-slate-100 flex items-center justify-between opacity-30 grayscale pointer-events-none">
                  <div className="flex items-center gap-6">
                    <div className={`h-12 w-12 rounded-md bg-white border border-slate-100 flex items-center justify-center ${test.color}`}><React.Fragment>{test.icon}</React.Fragment></div>
                    <h4 className="font-black uppercase text-[11px] text-slate-400">{test.name}</h4>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 px-3 py-1.5 rounded">Locked</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: MBTI EXAM */}
        {view === 'mbti' && (
          <div className="flex flex-col animate-in fade-in duration-500">
            <div className="mb-10 flex items-center justify-between border-b border-slate-100 pb-6 sticky top-0 bg-[#fcfcfd]/95 backdrop-blur-md z-10 py-2">
              <div className="flex items-center gap-4 min-w-0">
                <button onClick={() => setView('dashboard')} className="p-2.5 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-md shadow-sm shrink-0 transition-colors"><ChevronLeft size={20}/></button>
                <div className="min-w-0">
                   <h1 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight truncate leading-none mb-1">MBTI Exam</h1>
                   <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Myers-Briggs Type Indicator</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md shadow-xl border border-slate-800">
                <TimerIcon size={14} className="text-blue-400" />
                <span className="font-mono text-sm font-black tracking-widest">{formatTime(globalTimeLeft)}</span>
              </div>
            </div>
            
            <MBTITestContent 
              stage={mbtiStage}
              answers={mbtiAnswers}
              setAnswers={setMbtiAnswers}
              onBack={() => { setMbtiStage(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onNext={() => {
                if (mbtiStage < 4) { setMbtiStage(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } 
                else handleFinishMBTI();
              }}
            />
          </div>
        )}

        {/* VIEW: RESULT */}
        {view === 'result' && (
          <div className="max-w-md mx-auto py-20 px-6 text-center animate-in zoom-in duration-700">
            <div className="bg-white p-12 rounded-md border border-slate-100 shadow-2xl shadow-blue-900/5">
              <div className="w-20 h-20 bg-[#0173b6] text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/30"><BarChart3 size={40} /></div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-3">Hasil Psikometri</p>
              <h2 className="text-7xl font-black text-[#0173b6] tracking-tighter mb-10 leading-none">{getMbtiResult(mbtiAnswers)}</h2>
              <button onClick={() => { setView('dashboard'); setMbtiStage(1); setMbtiAnswers({}); }} className="w-full py-5 bg-slate-900 text-white rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-[#0173b6] transition-all active:scale-95 shadow-xl">Back to Portal</button>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { 
          font-family: 'Plus Jakarta Sans', sans-serif !important; 
          letter-spacing: -0.01em; 
          color: #1e293b;
          background-color: #fcfcfd;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}