//Path: src/app/(public)/assessment/[token]/dashboard/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  ClipboardList,
  Image as ImageIcon,
  CheckCircle2,
  ChevronLeft,
  User,
  ShieldCheck,
  Timer as TimerIcon,
  Zap,
  Check,
  LogOut,
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  Lock
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
  const [isFinalizing, setIsFinalizing] = useState(false);

  const checkStatus = async () => {
    let assessmentId = sessionStorage.getItem("assessment_id");
    let url = assessmentId ? `/api/assessment/status?id=${assessmentId}` : `/api/assessment/status?token=${token}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        if (data.assessment_id) {
          sessionStorage.setItem("assessment_id", data.assessment_id);
        }
        setCompletedTests(data.completed);
      }
    } catch (err) {
      console.error("Gagal memeriksa status tes:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Verifikasi keamanan rute
    const verifiedToken = sessionStorage.getItem("verified_token");
    if (verifiedToken !== token && token !== "ALICE-PREVIEW") {
      router.replace(`/assessment/${token}`);
    }

    checkStatus();
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
    const durations = { mbti: 15, disc: 20, papi: 30 };
    setGlobalTimeLeft((durations as any)[type] * 60);
    setIsTimerRunning(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinishTest = async () => {
    setIsTimerRunning(false);
    
    let assessmentId = sessionStorage.getItem("assessment_id");

    // Jika assessmentId belum tersimpan di sessionStorage, recover via token API
    if (!assessmentId && token) {
      try {
        const statusRes = await fetch(`/api/assessment/status?token=${token}`);
        const statusData = await statusRes.json();
        if (statusData.success && statusData.assessment_id) {
          assessmentId = String(statusData.assessment_id);
          sessionStorage.setItem("assessment_id", assessmentId);
        }
      } catch (e) {
        console.error("Gagal recover assessment_id:", e);
      }
    }

    if (currentTest && assessmentId) {
      let result;
      if (currentTest === 'mbti') result = getMbtiResult(answers);
      else if (currentTest === 'disc') result = calculateDISCResult(answers);
      else if (currentTest === 'papi') result = calculatePAPIResult(answers);
      
      try {
        const submitRes = await fetch('/api/assessment/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessment_id: assessmentId,
            test_type: currentTest,
            answers,
            result
          })
        });
        
        if (submitRes.ok) {
          setCompletedTests(prev => ({ ...prev, [currentTest]: true }));
          await checkStatus();
        } else {
          const errData = await submitRes.json();
          console.error("Gagal simpan tes:", errData.message);
        }
      } catch (err) {
        console.error("Gagal menyimpan hasil tes", err);
      }
    }

    setView("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler Tombol "Selesaikan & Keluar Ujian"
  const handleFinalizeAll = async () => {
    setIsFinalizing(true);
    const assessmentId = sessionStorage.getItem("assessment_id");
    try {
      await fetch('/api/assessment/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          token
        })
      });
      setView("result");
    } catch (err) {
      console.error("Gagal menyelesaikan rangkaian ujian:", err);
      setView("result");
    } finally {
      setIsFinalizing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const completedCount = (completedTests.mbti ? 1 : 0) + (completedTests.disc ? 1 : 0) + (completedTests.papi ? 1 : 0);
  const isAllTestsDone = completedCount === 3;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans selection:bg-blue-100 selection:text-[#0173b6]">
      <main className="container mx-auto p-4 md:p-10">
        {/* VIEW: DASHBOARD */}
        {view === "dashboard" && (
          <div className="max-w-3xl mx-auto py-6 animate-in fade-in duration-700 space-y-6">
            {/* Header Portal Card */}
            <div className="p-6 md:p-8 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0173b6]"></div>
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-[#0173b6] border border-blue-100 shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-sm">
                <User size={32} />
              </div>
              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2">
                  <ShieldCheck size={14} className="text-[#0173b6]" />
                  <code className="text-[10px] text-[#0173b6] font-mono font-bold tracking-widest uppercase truncate max-w-[200px]">
                    SESSION TOKEN: {token}
                  </code>
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">
                  Portal Ujian Psikometri Digital
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Silakan selesaikan 3 modul tes kepribadian di bawah ini secara mandiri dan jujur.
                </p>
              </div>
            </div>

            {/* Overall Progress Banner & Complete Action Button */}
            <div className={`p-6 rounded-xl border transition-all duration-500 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 ${
              isAllTestsDone 
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-500" 
                : "bg-white border-slate-200"
            }`}>
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    isAllTestsDone ? "bg-white/20 text-white" : "bg-blue-50 text-[#0173b6]"
                  }`}>
                    Progress Pengerjaan
                  </span>
                  <span className="text-xs font-bold font-mono">
                    {completedCount} / 3 Sub-Tes Selesai
                  </span>
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">
                  {isAllTestsDone ? (
                    <span className="flex items-center gap-2 justify-center sm:justify-start">
                      <Sparkles size={18} className="text-amber-300 shrink-0" />
                      Seluruh Sub-Tes Telah Selesai!
                    </span>
                  ) : (
                    "Modul Ujian Psikometri Terdaftar"
                  )}
                </h3>
                <p className={`text-xs ${isAllTestsDone ? "text-emerald-100" : "text-slate-500"}`}>
                  {isAllTestsDone 
                    ? "Semua jawaban telah tersimpan. Klik tombol di samping untuk memfinalisasi & menyelesaikan ujian."
                    : "Selesaikan semua sub-tes yang tersedia untuk menutup rangkaian ujian ini."}
                </p>
              </div>

              {/* ACTION BUTTON: FINISH & EXIT */}
              <button
                onClick={handleFinalizeAll}
                disabled={!isAllTestsDone || isFinalizing}
                className={`w-full sm:w-auto px-8 py-4 font-black rounded-lg uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg ${
                  isAllTestsDone 
                    ? "bg-white text-emerald-800 hover:bg-emerald-50 shadow-emerald-900/20 active:scale-95 cursor-pointer" 
                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                }`}
              >
                {isFinalizing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : isAllTestsDone ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    Selesaikan & Kirim Hasil Ujian
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Selesaikan 3/3 Tes Untuk Keluar ({completedCount}/3)
                  </>
                )}
              </button>
            </div>

            {/* Test Cards List */}
            <div className="space-y-4">
              {/* MBTI Card */}
              <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-100 hover:border-[#0173b6] transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group shadow-sm hover:shadow-xl shadow-blue-900/5">
                <div className="flex items-center gap-6 w-full sm:flex-1">
                  <div className={`h-16 w-16 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                    completedTests.mbti ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-[#0173b6] border-blue-100 group-hover:bg-[#0173b6] group-hover:text-white"
                  }`}>
                    {completedTests.mbti ? <CheckCircle2 size={32} /> : <LayoutGrid size={32} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black uppercase text-sm text-slate-800 group-hover:text-[#0173b6] transition-colors">
                        Kepribadian (MBTI)
                      </h4>
                      {completedTests.mbti && (
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded">Selesai</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[10px] font-medium max-w-sm uppercase tracking-tight italic leading-relaxed">
                      Analisis karakter melalui 28 butir pernyataan berpasangan. Durasi: ±15 Menit.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartTest("mbti")}
                  disabled={completedTests.mbti}
                  className={`w-full sm:w-auto px-8 py-3.5 font-black rounded-lg uppercase text-[10px] tracking-widest transition-all shadow-blue-900/10 active:scale-95 ${
                    completedTests.mbti ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-[#0173b6] text-white hover:bg-[#015a8f]'
                  }`}
                >
                  {completedTests.mbti ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      Selesai <Check size={14} />
                    </span>
                  ) : (
                    'Mulai Ujian'
                  )}
                </button>
              </div>

              {/* DISC Card */}
              <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-100 hover:border-orange-500 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group shadow-sm hover:shadow-xl shadow-orange-900/5">
                <div className="flex items-center gap-6 w-full sm:flex-1">
                  <div className={`h-16 w-16 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                    completedTests.disc ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-500 border-orange-100 group-hover:bg-orange-500 group-hover:text-white"
                  }`}>
                    {completedTests.disc ? <CheckCircle2 size={32} /> : <Zap size={32} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black uppercase text-sm text-slate-800 group-hover:text-orange-500 transition-colors">
                        Profil Perilaku (DISC)
                      </h4>
                      {completedTests.disc && (
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded">Selesai</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[10px] font-medium max-w-sm uppercase tracking-tight italic leading-relaxed">
                      Evaluasi gaya kerja melalui 24 set pilihan Most & Least. Durasi: ±20 Menit.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartTest("disc")}
                  disabled={completedTests.disc}
                  className={`w-full sm:w-auto px-8 py-3.5 font-black rounded-lg uppercase text-[10px] tracking-widest transition-all shadow-orange-900/10 active:scale-95 ${
                    completedTests.disc ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {completedTests.disc ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      Selesai <Check size={14} />
                    </span>
                  ) : (
                    'Mulai Ujian'
                  )}
                </button>
              </div>

              {/* PAPI Card */}
              <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-100 hover:border-emerald-500 transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group shadow-sm hover:shadow-xl shadow-emerald-900/5">
                <div className="flex items-center gap-6 w-full sm:flex-1">
                  <div className={`h-16 w-16 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                    completedTests.papi ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-emerald-50 text-emerald-500 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white"
                  }`}>
                    {completedTests.papi ? <CheckCircle2 size={32} /> : <ClipboardList size={32} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black uppercase text-sm text-slate-800 group-hover:text-emerald-500 transition-colors">
                        Gaya Kerja (PAPI Kostick)
                      </h4>
                      {completedTests.papi && (
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded">Selesai</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[10px] font-medium max-w-sm uppercase tracking-tight italic leading-relaxed">
                      Penilaian peran dan kebutuhan profesional (90 Soal). Durasi: ±30 Menit.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartTest("papi")}
                  disabled={completedTests.papi}
                  className={`w-full sm:w-auto px-8 py-3.5 font-black rounded-lg uppercase text-[10px] tracking-widest transition-all shadow-emerald-900/10 active:scale-95 ${
                    completedTests.papi ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {completedTests.papi ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      Selesai <Check size={14} />
                    </span>
                  ) : (
                    'Mulai Ujian'
                  )}
                </button>
              </div>

              {/* CFIT / Vision Test (Locked) Card */}
              <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 flex items-center justify-between opacity-40 grayscale pointer-events-none">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                    CFIT
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-xs text-slate-600 mb-0.5">
                      Tes Kemampuan Kognitif (CFIT)
                    </h4>
                    <p className="text-[10px] text-slate-400">Modul Ujian Tahap Pengembangan</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1.5 rounded-full bg-white">
                  Tahap Pengembangan
                </span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: TEST EXECUTION (MBTI, DISC, PAPI) */}
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

        {/* VIEW: FINAL RESULT & COMPLETION */}
        {view === "result" && (
          <div className="max-w-md mx-auto py-16 px-6 text-center animate-in zoom-in duration-700">
            <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-100 shadow-2xl shadow-blue-900/5 space-y-6">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest inline-block mb-3">
                  Sesi Ujian Terverifikasi
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none uppercase">
                  Ujian Selesai!
                </h2>
              </div>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Seluruh jawaban tes psikometri Anda (MBTI, DISC, PAPI Kostick) telah berhasil dienkripsi dan disimpan dengan aman ke dalam sistem HRIS RSU Avisena.
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left text-xs font-medium text-slate-600 space-y-2">
                <p className="font-bold text-slate-800">Langkah Selanjutnya:</p>
                <p>• Tim Human Capital akan melakukan evaluasi hasil tes Anda.</p>
                <p>• Anda dapat menutup halaman browser ini dengan aman.</p>
              </div>
              <button
                onClick={() => {
                  sessionStorage.clear();
                  router.replace("/");
                }}
                className="w-full py-4 bg-slate-900 text-white rounded-lg font-black text-xs uppercase tracking-wider hover:bg-[#0173b6] transition-all active:scale-95 shadow-xl"
              >
                Tutup & Selesai
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
