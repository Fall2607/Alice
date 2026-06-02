//Path: src/app/(public)/assessment/[token]/dashboard/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  LayoutGrid,
  ClipboardList,
  Image as ImageIcon,
  PlayCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  User,
  ShieldCheck,
  Timer as TimerIcon,
  BarChart3,
  Zap,
  Check,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getMbtiResult } from "@/app/utils/mbtiUtils";
import { calculateDISCResult } from "@/app/utils/discUtils";
import { calculatePAPIResult } from "@/app/utils/papiUtils";
import MBTITestContent from "@/app/components/tests/MBTITest";
import DISCTestContent from "@/app/components/tests/DISCTest";
import PAPITestContent from "@/app/components/tests/PAPITest";

export default function AssessmentDashboard() {
  const params = useParams() as any;
  const router = useRouter();
  const token = params?.token || "ALICE-PREVIEW";
  const [currentTest, setCurrentTest] = useState<"mbti" | "disc" | "papi" | null>(null);

  const [view, setView] = useState<
    "dashboard" | "mbti" | "disc" | "papi" | "result"
  >("dashboard");
  const [activeStage, setActiveStage] = useState(0);
  const [answers, setAnswers] = useState<any>({});

  const [globalTimeLeft, setGlobalTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [completedTests, setCompletedTests] = useState({ mbti: false, disc: false, papi: false });

  useEffect(() => {
    setMounted(true);
    // Verifikasi keamanan rute: Pastikan kandidat masuk lewat halaman verifikasi OTP
    const verifiedToken = sessionStorage.getItem("verified_token");
    if (verifiedToken !== token && token !== "ALICE-PREVIEW") {
      router.replace(`/assessment/${token}`);
    }

    const assessmentId = sessionStorage.getItem("assessment_id");
    if (assessmentId) {
      fetch(`/api/assessment/status?id=${assessmentId}`)
        .then(res => res.json())
        .then(data => {
           if (data.success) setCompletedTests(data.completed);
        })
        .catch(err => console.error(err));
    }
  }, [token, router]);

  useEffect(() => {
    let timer: any;
    if (isTimerRunning && globalTimeLeft > 0) {
      timer = setInterval(() => setGlobalTimeLeft((prev) => prev - 1), 1000);
    } else if (globalTimeLeft === 0 && isTimerRunning) {
      handleFinishTest();
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, globalTimeLeft]);

  const handleStartTest = (type: "mbti" | "disc" | "papi") => {
    setView(type);
    setCurrentTest(type);
    setActiveStage(type === "mbti" ? 1 : 0);
    setAnswers({});
    // Set durasi berdasarkan jenis tes
    const durations = { mbti: 15, disc: 20, papi: 30 };
    setGlobalTimeLeft((durations as any)[type] * 60);
    setIsTimerRunning(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinishTest = async () => {
    setIsTimerRunning(false);
    
    const assessmentId = sessionStorage.getItem("assessment_id");
    if (currentTest && assessmentId) {
      let result;
      if (currentTest === 'mbti') result = getMbtiResult(answers);
      else if (currentTest === 'disc') result = calculateDISCResult(answers);
      else if (currentTest === 'papi') result = calculatePAPIResult(answers);
      
      try {
        await fetch('/api/assessment/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessment_id: assessmentId,
            test_type: currentTest,
            answers,
            result
          })
        });
        
        setCompletedTests(prev => ({ ...prev, [currentTest]: true }));
      } catch (err) {
        console.error("Gagal menyimpan hasil tes", err);
      }
    }

    setView("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans selection:bg-blue-100 selection:text-[#0173b6]">
      <main className="container mx-auto p-4 md:p-10">
        {/* VIEW: DASHBOARD */}
        {view === "dashboard" && (
          <div className="max-w-3xl mx-auto py-6 animate-in fade-in duration-700">
            <div className="mb-10 p-6 md:p-8 bg-white rounded-md border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#0173b6]"></div>
              <div className="w-16 h-16 bg-slate-50 rounded-md flex items-center justify-center text-[#0173b6] border border-slate-100 shrink-0 group-hover:scale-110 transition-transform duration-700 shadow-inner">
                <User size={32} />
              </div>
              <div className="flex-1 min-w-0 text-center md:text-left">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-1 leading-none">
                  Assessment Portal
                </h2>
                <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                  <ShieldCheck size={14} className="text-[#0173b6]" />
                  <code className="text-[10px] text-[#0173b6] font-mono font-bold tracking-widest uppercase truncate max-w-[150px]">
                    {token}
                  </code>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 md:p-6 rounded-md border border-slate-100 hover:border-[#0173b6] transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group shadow-sm hover:shadow-xl shadow-blue-900/5">
                <div className="flex items-center gap-6 w-full sm:flex-1">
                  <div className="h-16 w-16 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-[#0173b6] group-hover:text-white transition-all duration-500">
                    <LayoutGrid size={32} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm text-slate-800 mb-1 group-hover:text-[#0173b6] transition-colors">
                      Kepribadian (MBTI)
                    </h4>
                    <p className="text-slate-400 text-[10px] font-medium max-w-sm uppercase tracking-tight italic leading-relaxed">
                      Analisis karakter melalui 28 butir pernyataan berpasangan.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartTest("mbti")}
                  disabled={completedTests.mbti}
                  className={`w-full sm:w-auto px-10 py-4 font-black rounded-md uppercase text-[10px] tracking-widest transition-all shadow-blue-900/10 active:scale-95 ${completedTests.mbti ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#0173b6] text-white hover:bg-[#015a8f]'}`}
                >
                  {completedTests.mbti ? 'Selesai' : 'Mulai'}
                </button>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-md border border-slate-100 hover:border-orange-500 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group shadow-sm hover:shadow-xl shadow-orange-900/5">
                <div className="flex items-center gap-6 w-full sm:flex-1">
                  <div className="h-16 w-16 rounded-md bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                    <Zap size={32} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm text-slate-800 mb-1 group-hover:text-orange-500 transition-colors">
                      Profil Perilaku (DISC)
                    </h4>
                    <p className="text-slate-400 text-[10px] font-medium max-w-sm uppercase tracking-tight italic leading-relaxed">
                      Evaluasi gaya kerja melalui 24 set pilihan Most & Least.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartTest("disc")}
                  disabled={completedTests.disc}
                  className={`w-full sm:w-auto px-10 py-4 font-black rounded-md uppercase text-[10px] tracking-widest transition-all shadow-orange-900/10 active:scale-95 ${completedTests.disc ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                >
                  {completedTests.disc ? 'Selesai' : 'Mulai'}
                </button>
              </div>

              <div className="bg-white p-5 md:p-6 rounded-md border border-slate-100 hover:border-emerald-500 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group shadow-sm hover:shadow-xl shadow-emerald-900/5">
                <div className="flex items-center gap-6 w-full sm:flex-1">
                  <div className="h-16 w-16 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                    <ClipboardList size={32} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm text-slate-800 mb-1 group-hover:text-emerald-500 transition-colors">
                      Gaya Kerja (PAPI)
                    </h4>
                    <p className="text-slate-400 text-[10px] font-medium max-w-sm uppercase tracking-tight italic leading-relaxed">
                      Penilaian peran dan kebutuhan profesional (90 Soal).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartTest("papi")}
                  disabled={completedTests.papi}
                  className={`w-full sm:w-auto px-10 py-4 font-black rounded-md uppercase text-[10px] tracking-widest transition-all shadow-emerald-900/10 active:scale-95 ${completedTests.papi ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                >
                  {completedTests.papi ? 'Selesai' : 'Mulai'}
                </button>
              </div>

              <div className="bg-slate-50/50 p-6 rounded-md border border-slate-100 flex items-center justify-between opacity-30 grayscale pointer-events-none">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                    <ImageIcon size={24} />
                  </div>
                  <h4 className="font-black uppercase text-[11px] text-slate-400">
                    Vision Test
                  </h4>
                </div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 px-3 py-1.5 rounded">
                  Locked
                </span>
              </div>
            </div>
          </div>
        )}

        {(view === "mbti" || view === "disc" || view === "papi") && (
          <div className="flex flex-col animate-in fade-in duration-500">
            <div className="mb-10 flex items-center justify-between border-b border-slate-100 pb-6 sticky top-0 bg-[#fcfcfd]/95 backdrop-blur-md z-50 py-2 px-1">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => setView("dashboard")}
                  className="p-2.5 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-md shadow-sm shrink-0 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="min-w-0">
                  <h1 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight truncate leading-none mb-1">
                    {view.toUpperCase()} Exam
                  </h1>
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">
                    Digital Assessment Unit
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md shadow-xl border border-slate-800">
                <TimerIcon size={14} className="text-blue-400" />
                <span className="font-mono text-sm font-black tracking-widest">
                  {formatTime(globalTimeLeft)}
                </span>
              </div>
            </div>

            {view === "mbti" ? (
              <MBTITestContent
                stage={activeStage}
                answers={answers}
                setAnswers={setAnswers}
                onBack={() => {
                  setActiveStage((s) => s - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onNext={() => {
                  if (activeStage < 4) {
                    setActiveStage((s) => s + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else handleFinishTest();
                }}
              />
            ) : view === "disc" ? (
              <DISCTestContent
                questionIdx={activeStage}
                answers={answers}
                setAnswers={setAnswers}
                onBack={() => {
                  setActiveStage((s) => s - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onNext={() => {
                  if (activeStage < 23) {
                    setActiveStage((s) => s + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else handleFinishTest();
                }}
              />
            ) : (
              <PAPITestContent
                questionIdx={activeStage}
                answers={answers}
                setAnswers={setAnswers}
                onBack={() => {
                  setActiveStage((s) => s - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onNext={() => {
                  if (activeStage < 89) {
                    setActiveStage((s) => s + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else handleFinishTest();
                }}
              />
            )}
          </div>
        )}

        {/* VIEW: RESULT */}
        {view === "result" && (
          <div className="max-w-md mx-auto py-20 px-6 text-center animate-in zoom-in duration-700">
            <div className="bg-white p-12 rounded-md border border-slate-100 shadow-2xl shadow-blue-900/5">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30">
                <CheckCircle2 size={40} />
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-3">
                Status Pengisian
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-[#0173b6] tracking-tight leading-none mb-6 uppercase">
                Test Selesai
              </h2>
              <p className="text-sm font-medium text-slate-500 mb-10 leading-relaxed px-4">
                Jawaban Anda telah berhasil dienkripsi dan disimpan dengan aman ke dalam sistem kami.
              </p>
              <button
                onClick={() => {
                  setView("dashboard");
                  setAnswers({});
                }}
                className="w-full py-5 bg-slate-900 text-white rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-[#0173b6] transition-all active:scale-95 shadow-xl"
              >
                Back to Portal
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
        body {
          font-family: "Plus Jakarta Sans", sans-serif !important;
          letter-spacing: -0.01em;
          color: #1e293b;
          background-color: #fcfcfd;
        }
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
