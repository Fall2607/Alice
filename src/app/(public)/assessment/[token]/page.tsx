/** Path: src/app/(public)/assessment/[token]/page.tsx
 * Deskripsi: Sistem Assessment Terintegrasi (Single File).
 * Fitur: Verifikasi NIK, Dashboard, dan Modul Tes (MBTI, PAPI, Vision).
 * Optimasi: Mobile Friendly, Fit-to-Screen (h-screen), dan Sharp Design.
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Fingerprint,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Clock,
  LayoutGrid,
  ClipboardList,
  Image as ImageIcon,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Timer,
  Info,
  HelpCircle,
  X,
  User,
  Circle,
  Layout,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

// --- MAIN APP COMPONENT ---
export default function App() {
  const params = useParams();
  const token = params.token;

  // View State: 'verify' | 'dashboard' | 'mbti' | 'papi' | 'vision'
  const [view, setView] = useState("verify");
  const [nik, setNik] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(0);
  const [itemTimeLeft, setItemTimeLeft] = useState(10);
  const [showNav, setShowNav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Logika Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view !== "verify" && view !== "dashboard" && globalTimeLeft > 0) {
      interval = setInterval(() => {
        setGlobalTimeLeft((prev) => prev - 1);
        if (view === "vision" && itemTimeLeft > 0) {
          setItemTimeLeft((v) => v - 1);
        } else if (view === "vision" && itemTimeLeft === 0) {
          handleNext();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, globalTimeLeft, itemTimeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleStart = (testId: string, duration: number) => {
    setView(testId);
    setGlobalTimeLeft(duration * 60);
    setCurrentQuestion(0);
    setItemTimeLeft(10);
    setShowNav(false);
  };

  const handleNext = () => {
    if (currentQuestion < 9) {
      setCurrentQuestion((prev) => prev + 1);
      setItemTimeLeft(10);
    } else {
      setView("dashboard");
    }
  };

  if (!mounted) return null;

  // --- VIEW: VERIFY ---
  const renderVerify = () => (
    <div className="flex-1 flex flex-col items-center justify-start animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#0173b6] border border-blue-100">
            <Fingerprint size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-2">
            Verifikasi Akses
          </h1>
          <p className="text-slate-400 text-xs font-medium px-4">
            Masukkan 6 digit terakhir NIK untuk validasi identitas peserta.
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-md border border-slate-200 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setView("dashboard");
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                NIK Suffix
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="w-full text-center text-3xl tracking-[0.6em] py-4 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#0173b6] outline-none transition-all font-black text-[#0173b6]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#0173b6] text-white font-black py-4 rounded-md hover:bg-[#015a8f] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest active:scale-95"
            >
              Mulai Sesi <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // --- VIEW: DASHBOARD ---
  const renderDashboard = () => (
    <div className="flex-1 overflow-y-auto bg-[#fcfcfd]">
      <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-700">
        <div className="mb-8 p-5 bg-white rounded-md border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#0173b6]"></div>
          <div className="w-12 h-12 bg-slate-50 rounded-md flex items-center justify-center text-[#0173b6] border border-slate-100 shrink-0">
            <User size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate">
              Profil Peserta
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase">
                Akses:
              </span>
              <code className="text-[9px] text-[#0173b6] font-mono font-bold truncate">
                {token}
              </code>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">
            <CheckCircle2 size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              Active
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
            Modul Seleksi
          </h3>
          <p className="text-slate-400 text-[11px] mt-1 italic">
            Pilih modul yang tersedia untuk memulai penilaian.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              id: "mbti",
              title: "Kepribadian (MBTI)",
              dur: 15,
              icon: <LayoutGrid />,
              desc: "Analisis tipe psikologis dan preferensi gaya kerja.",
              status: "Ready",
            },
            {
              id: "papi",
              title: "PAPI Kostik",
              dur: 20,
              icon: <ClipboardList />,
              desc: "Menilai kecenderungan perilaku dalam lingkungan kerja.",
              status: "Completed",
            },
            {
              id: "vision",
              title: "Persepsi Gambar",
              dur: 5,
              icon: <ImageIcon />,
              desc: "Uji ketelitian visual dengan batasan waktu per item.",
              status: "Ready",
            },
          ].map((test) => {
            const isCompleted = test.status === "Completed";
            return (
              <div
                key={test.id}
                className={`bg-white p-5 rounded-md border transition-all flex flex-col sm:flex-row items-center justify-between gap-5 group shadow-sm ${isCompleted ? "border-slate-100 bg-slate-50/50" : "border-slate-200 hover:border-[#0173b6]"}`}
              >
                <div className="flex items-center gap-5 w-full sm:flex-1">
                  <div
                    className={`h-14 w-14 rounded-md flex items-center justify-center border shadow-inner transition-all ${isCompleted ? "bg-slate-100 opacity-30" : "bg-white border-slate-100 group-hover:bg-blue-50"}`}
                  >
                    {React.cloneElement(test.icon as React.ReactElement, {
                      size: 28,
                      className: isCompleted
                        ? "text-slate-400"
                        : "text-[#0173b6]",
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4
                        className={`font-black uppercase text-xs tracking-tight ${isCompleted ? "text-slate-400" : "text-slate-800"}`}
                      >
                        {test.title}
                      </h4>
                      {isCompleted && (
                        <span className="bg-emerald-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                          <CheckCircle2 size={8} /> Submited
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[10px] font-medium leading-relaxed line-clamp-1">
                      {test.desc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isCompleted && handleStart(test.id, test.dur)}
                  disabled={isCompleted}
                  className={`w-full sm:w-auto px-8 py-3 rounded-md font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${isCompleted ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed" : "bg-white text-[#0173b6] border border-slate-200 hover:bg-[#0173b6] hover:text-white shadow-sm"}`}
                >
                  {isCompleted ? "Selesai" : "Mulai Tes"}{" "}
                  {!isCompleted && <PlayCircle size={14} />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-[#05445e] rounded-md text-white flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden shadow-xl">
          <div className="p-3 bg-white/10 rounded-md shrink-0 border border-white/10 backdrop-blur-md">
            <Info size={28} className="text-emerald-400" />
          </div>
          <div className="relative z-10">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-1.5 text-emerald-400">
              Instruksi Seleksi
            </h4>
            <p className="text-[11px] text-blue-50/70 leading-relaxed font-medium">
              Sistem merekam aktivitas pengerjaan Anda secara berkala. Anda
              tidak dapat mengulang tes yang sudah disubmit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // --- VIEW: EXAM LAYOUT (FIT TO SCREEN) ---
  const renderExamLayout = (content: React.ReactNode) => (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-in fade-in duration-500">
      {/* Exam Sticky Header */}
      <div className="h-14 px-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setView("dashboard")}
            className="p-2 -ml-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-[9px] font-black text-slate-800 uppercase truncate">
              {view === "mbti"
                ? "Kepribadian MBTI"
                : view === "papi"
                  ? "PAPI Kostik"
                  : "Persepsi Visual"}
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0173b6]"
                  style={{ width: `${(currentQuestion + 1) * 10}%` }}
                ></div>
              </div>
              <span className="text-[7px] font-bold text-slate-400 uppercase">
                {currentQuestion + 1}/10
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {view === "vision" && (
            <div className="flex items-center gap-2 pr-3 border-r border-slate-100 mr-2">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                Time
              </span>
              <div
                className={`text-sm font-black font-mono leading-none ${itemTimeLeft <= 3 ? "text-red-500 scale-110" : "text-amber-500"} transition-all`}
              >
                0:{itemTimeLeft < 10 ? `0${itemTimeLeft}` : itemTimeLeft}
              </div>
            </div>
          )}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border ${globalTimeLeft < 60 ? "bg-red-50 border-red-100 text-red-600 animate-pulse" : "bg-slate-50 border-slate-100 text-slate-500"}`}
          >
            <Timer size={14} />
            <span className="font-mono text-xs font-black leading-none">
              {formatTime(globalTimeLeft)}
            </span>
          </div>
          <button
            onClick={() => setShowNav(!showNav)}
            className={`p-2 rounded md:hidden ${showNav ? "bg-[#0173b6] text-white" : "bg-slate-50 text-slate-400"}`}
          >
            <Layout size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-[#fcfcfd]">
          <div className="flex-1 p-4 md:p-10 max-w-2xl mx-auto w-full">
            {content}
          </div>

          {/* Mobile Footer Nav */}
          <div className="md:hidden p-4 bg-white border-t border-slate-100 flex justify-between gap-4 sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <button
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion((c) => c - 1)}
              className="flex-1 py-3 bg-slate-50 text-slate-400 font-black rounded text-[9px] uppercase tracking-widest disabled:opacity-30"
            >
              Kembali
            </button>
            <button
              onClick={handleNext}
              className="flex-[2] py-3 bg-[#0173b6] text-white font-black rounded text-[9px] uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95"
            >
              {currentQuestion === 9 ? "Selesaikan" : "Selanjutnya"}
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <aside
          className={`${showNav ? "translate-x-0" : "translate-x-full md:translate-x-0"} fixed md:static right-0 top-0 h-full w-64 bg-[#05445e] p-6 text-white shadow-2xl md:shadow-none transition-transform duration-300 z-50 shrink-0 border-l border-white/5`}
        >
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-200">
              Navigasi Soal
            </h4>
            <button onClick={() => setShowNav(false)}>
              <X size={20} />
            </button>
          </div>
          <h4 className="hidden md:flex text-[9px] font-black uppercase tracking-[0.2em] text-blue-200 mb-6 items-center gap-2">
            <ClipboardList size={12} /> Peta Pertanyaan
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <button
                key={i}
                disabled={i > currentQuestion && view !== "vision"}
                onClick={() => {
                  setCurrentQuestion(i);
                  setShowNav(false);
                }}
                className={`aspect-square rounded flex items-center justify-center text-[10px] font-black border transition-all ${i === currentQuestion ? "bg-white text-primary-dark border-white" : i < currentQuestion ? "bg-emerald-500/30 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/20 border-white/5"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#fcfcfd] font-sans overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        {view === "verify" && renderVerify()}
        {view === "dashboard" && renderDashboard()}
        {(view === "mbti" || view === "papi" || view === "vision") &&
          renderExamLayout(
            view === "mbti" ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-6 md:mb-8 border-b border-slate-50 pb-6">
                  <span className="text-[8px] font-black text-[#0173b6] uppercase tracking-[0.3em]">
                    Pertanyaan {currentQuestion + 1}
                  </span>
                  <h3 className="text-lg md:text-xl font-black text-slate-800 leading-snug uppercase mt-2">
                    {currentQuestion % 2 === 0
                      ? "Saya lebih suka mendiskusikan ide baru dengan kelompok besar."
                      : "Saya cenderung membuat keputusan berdasarkan fakta objektif."}
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    "Sangat Tidak Setuju",
                    "Tidak Setuju",
                    "Netral",
                    "Setuju",
                    "Sangat Setuju",
                  ].map((l, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-blue-50 transition-all group active:scale-[0.98] shadow-sm"
                    >
                      <input
                        type="radio"
                        name="mbti"
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 border-2 border-slate-300 rounded-full peer-checked:border-[#0173b6] peer-checked:bg-[#0173b6] transition-all flex items-center justify-center">
                        <Circle
                          className="h-1.5 w-1.5 text-white opacity-0 peer-checked:opacity-100"
                          fill="white"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-[#0173b6] uppercase">
                        {l}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="hidden md:flex mt-10 justify-end">
                  <button
                    onClick={handleNext}
                    className="px-12 py-3.5 bg-[#0173b6] text-white font-black rounded-md text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all"
                  >
                    {currentQuestion === 9 ? "Selesaikan" : "Berikutnya"}
                  </button>
                </div>
              </div>
            ) : view === "papi" ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-6 text-center md:text-left">
                  <span className="text-[8px] font-black text-[#0173b6] uppercase tracking-[0.3em]">
                    Forced Choice — Item {currentQuestion + 1}
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      id: "A",
                      t: "Saya adalah orang yang selalu berusaha keras untuk mencapai hasil yang sempurna.",
                    },
                    {
                      id: "B",
                      t: "Saya lebih menyukai bekerja dengan arahan yang jelas dari pimpinan saya.",
                    },
                  ].map((o) => (
                    <button
                      key={o.id}
                      onClick={handleNext}
                      className="w-full p-6 bg-white border border-slate-200 rounded-md hover:border-[#0173b6] hover:bg-blue-50 transition-all group text-left relative overflow-hidden shadow-sm active:scale-95"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-[#0173b6]"></div>
                      <div className="flex gap-4 items-start">
                        <span className="text-2xl font-black text-slate-200 group-hover:text-[#0173b6]/20 shrink-0">
                          {o.id}
                        </span>
                        <p className="text-xs md:text-sm font-black text-slate-700 uppercase tracking-tight mt-1 leading-tight">
                          {o.t}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-500">
                <div className="w-full max-w-sm mb-6 text-center px-4">
                  <p className="text-slate-400 font-black text-[8px] uppercase tracking-[0.2em] mb-2">
                    Visual Assessment {currentQuestion + 1}
                  </p>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${(itemTimeLeft / 10) * 100}%`,
                        transition: "width 1s linear",
                      }}
                    ></div>
                  </div>
                </div>
                <div className="w-full max-w-md aspect-video bg-white rounded border-2 border-dashed border-slate-200 mb-8 flex items-center justify-center text-slate-300 relative overflow-hidden shadow-sm group">
                  <ImageIcon
                    size={48}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0173b6]/20 animate-pulse"></div>
                </div>
                <p className="text-slate-800 font-black mb-6 text-[9px] uppercase tracking-[0.2em] text-center">
                  Tentukan Pola Identik:
                </p>
                <div className="grid grid-cols-2 gap-3 w-full max-w-md px-4">
                  {["Pola A", "Pola B", "Pola C", "Pola D"].map((o) => (
                    <button
                      key={o}
                      onClick={handleNext}
                      className="py-4 bg-white border border-slate-200 rounded font-black text-slate-400 hover:bg-[#0173b6] hover:text-white transition-all shadow-sm text-[9px] uppercase tracking-widest"
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ),
          )}
      </main>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
        body {
          font-family: "Plus Jakarta Sans", sans-serif !important;
          letter-spacing: -0.01em;
          color: #1e293b;
          background-color: #fcfcfd;
          height: 100vh;
          overflow: hidden;
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
