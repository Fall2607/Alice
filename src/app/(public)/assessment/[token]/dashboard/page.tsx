/** Path: src/app/(public)/assessment/[token]/dashboard/page.tsx
 * Deskripsi: Aplikasi Assessment Terpadu Alice (Versi Clean & Mobile-Friendly).
 * Modul: MBTI, PAPI Kostik, Vision Test.
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Clock,
  Image as ImageIcon,
  LayoutGrid,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  Info,
  ShieldCheck,
  ChevronLeft,
  Timer as TimerIcon,
  Send,
  HelpCircle,
  X,
  Circle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// --- INTERNAL SHIM UNTUK CANVAS ---
// const useParams = () => {
//   if (typeof window !== "undefined") {
//     const pathParts = window.location.pathname.split('/');
//     const assessmentIndex = pathParts.indexOf('assessment');
//     return { token: pathParts[assessmentIndex + 1] || "ALICE-PREVIEW-MODE" };
//   }
//   return { token: "LOADING" };
// };

// const useRouter = () => ({
//   push: (href: string) => { console.log("Navigating to:", href); }
// });

// --- MAIN APP COMPONENT ---
export default function App() {
  const params = useParams();
  const token = params.token;

  // State Navigasi: 'dashboard' | 'mbti' | 'papi' | 'vision'
  const [view, setView] = useState<string>("dashboard");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(0);
  const [itemTimeLeft, setItemTimeLeft] = useState(10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Logika Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (view !== "dashboard" && globalTimeLeft > 0) {
      timer = setInterval(() => {
        setGlobalTimeLeft((prev) => prev - 1);

        if (view === "vision" && itemTimeLeft > 0) {
          setItemTimeLeft((v) => v - 1);
        } else if (view === "vision" && itemTimeLeft === 0) {
          handleNext();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (currentQuestion < 9) {
      setCurrentQuestion((prev) => prev + 1);
      setItemTimeLeft(10);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setView("dashboard");
    }
  };

  if (!mounted) return null;

  const renderDashboard = () => (
    <div className="max-w-3xl mx-auto py-2 md:py-4 px-4 animate-in fade-in duration-700">
      {/* Profil Singkat */}
      <div className="mb-10 p-6 bg-white rounded-md border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 bg-slate-50 rounded-md flex items-center justify-center text-[#0173b6] border border-slate-100">
          <User size={32} />
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Kandidat Peserta
          </h2>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Akses ID:
            </span>
            <code className="text-[10px] bg-blue-50 px-2 py-0.5 rounded text-[#0173b6] font-mono font-bold">
              {token}
            </code>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">
          <CheckCircle2 size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">
            Terverifikasi
          </span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
          Daftar Modul
        </h3>
        <p className="text-slate-400 text-xs mt-2 italic font-medium">
          Selesaikan modul di bawah ini secara bertahap.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          {
            id: "mbti",
            title: "Kepribadian (MBTI)",
            dur: 15,
            icon: <LayoutGrid />,
            desc: "Analisis tipe psikologis dan preferensi gaya kerja.",
          },
          {
            id: "papi",
            title: "PAPI Kostik",
            dur: 20,
            icon: <ClipboardList />,
            desc: "Menilai kecenderungan perilaku dalam lingkungan profesional.",
          },
          {
            id: "vision",
            title: "Persepsi Gambar",
            dur: 5,
            icon: <ImageIcon />,
            desc: "Tes ketelitian visual dengan batasan waktu per item.",
          },
        ].map((t) => (
          <div
            key={t.id}
            className="bg-white p-5 md:p-6 rounded-md border border-slate-200 hover:border-[#0173b6] transition-all flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm group"
          >
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="h-14 w-14 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#0173b6] group-hover:bg-blue-50 transition-colors shrink-0">
                {React.cloneElement(t.icon as React.ReactElement, { size: 28 })}
              </div>
              <div>
                <h4 className="font-black uppercase text-sm text-slate-800 leading-tight">
                  {t.title}
                </h4>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed line-clamp-1">
                  {t.desc}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 w-fit px-2 py-0.5 rounded">
                  <Clock size={10} /> {t.dur} Menit
                </div>
              </div>
            </div>
            <button
              onClick={() => handleStart(t.id, t.dur)}
              className="w-full md:w-auto px-8 py-3 bg-white text-[#0173b6] border border-slate-200 rounded font-black uppercase text-[10px] tracking-widest hover:bg-[#0173b6] hover:text-white hover:border-[#0173b6] transition-all flex items-center justify-center gap-2"
            >
              Mulai <PlayCircle size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExamLayout = (content: React.ReactNode) => (
    <div className="max-w-5xl mx-auto py-6 md:py-8 px-4 animate-in fade-in duration-500">
      {/* Exam Header Mini */}
      <div className="bg-white p-4 md:p-5 rounded-md border border-slate-200 shadow-sm flex items-center justify-between sticky top-20 z-40 mb-6 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("dashboard")}
            className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-400 hover:text-red-500 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="hidden sm:block">
            <p className="text-[8px] font-black text-[#0173b6] uppercase tracking-[0.2em] mb-0.5">
              Sesi Berjalan
            </p>
            <h2 className="text-sm font-black text-slate-800 uppercase truncate max-w-[150px]">
              {view === "mbti"
                ? "Kepribadian MBTI"
                : view === "papi"
                  ? "PAPI Kostik"
                  : "Tes Visual"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {view === "vision" && (
            <div className="flex flex-col items-end pr-3 border-r border-slate-100">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                Item Timer
              </span>
              <div
                className={`text-lg font-black font-mono leading-none ${itemTimeLeft <= 3 ? "text-red-500" : "text-amber-500"}`}
              >
                0:{itemTimeLeft < 10 ? `0${itemTimeLeft}` : itemTimeLeft}
              </div>
            </div>
          )}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded border ${globalTimeLeft < 60 ? "bg-red-50 border-red-100 text-red-600 animate-pulse" : "bg-blue-50 border-blue-100 text-[#0173b6]"}`}
          >
            <TimerIcon size={16} />
            <span className="font-mono text-base font-black leading-none">
              {formatTime(globalTimeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">{content}</div>

        {/* Sidebar Nav (Pindah ke Grid Bawah di Mobile) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#05445e] p-6 rounded-md text-white shadow-lg relative overflow-hidden">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-200 mb-5 flex items-center gap-2">
              <ClipboardList size={12} /> Peta Pertanyaan
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <button
                  key={i}
                  disabled={i > currentQuestion}
                  onClick={() => setCurrentQuestion(i)}
                  className={`aspect-square rounded flex items-center justify-center text-[10px] font-black border transition-all ${
                    i === currentQuestion
                      ? "bg-white text-primary-dark border-white"
                      : i < currentQuestion
                        ? "bg-emerald-500/30 text-emerald-400 border-emerald-500/20"
                        : "bg-white/5 text-white/20 border-white/5"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[8px] font-bold text-blue-200 uppercase tracking-widest">
                Progress
              </span>
              <span className="text-sm font-black">
                {(((currentQuestion + 1) / 10) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-md border border-slate-200 flex items-start gap-4 shadow-sm">
            <div className="p-1.5 bg-blue-50 rounded text-blue-500 shrink-0">
              <Info size={16} />
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
              "Bekerjalah dengan tenang dan fokus. Pastikan jawaban terisi semua
              sebelum modul berakhir."
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMBTI = () => (
    <div className="bg-white p-6 md:p-10 rounded-md border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
      <div className="mb-8 md:mb-10 pb-6 border-b border-slate-50">
        <span className="text-[9px] font-black text-[#0173b6] uppercase tracking-[0.3em]">
          Soal {currentQuestion + 1} / 10
        </span>
        <h3 className="text-lg md:text-2xl font-black text-slate-800 leading-tight uppercase mt-3">
          {currentQuestion % 2 === 0
            ? "Saya merasa lebih berenergi saat mendiskusikan ide baru dengan kelompok besar."
            : "Saya cenderung membuat keputusan berdasarkan fakta objektif daripada perasaan personal."}
        </h3>
      </div>

      <div className="space-y-2.5 flex-1">
        {[
          { l: "Sangat Tidak Setuju", v: 1 },
          { l: "Tidak Setuju", v: 2 },
          { l: "Ragu-ragu / Netral", v: 3 },
          { l: "Setuju", v: 4 },
          { l: "Sangat Setuju", v: 5 },
        ].map((opt) => (
          <label
            key={opt.v}
            className="flex items-center gap-4 p-4 md:p-5 bg-slate-50 border border-slate-100 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group active:bg-blue-100"
          >
            <div className="relative flex items-center justify-center">
              <input type="radio" name="mbti" className="peer sr-only" />
              <div className="h-5 w-5 border-2 border-slate-300 rounded-full peer-checked:border-[#0173b6] peer-checked:bg-[#0173b6] transition-all"></div>
              <Circle
                className="absolute h-2 w-2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="white"
              />
            </div>
            <span className="text-xs font-bold text-slate-600 group-hover:text-[#0173b6] uppercase tracking-wide">
              {opt.l}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-slate-50 flex justify-between gap-4">
        <button
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion((c) => c - 1)}
          className="flex-1 md:flex-none px-6 py-3 bg-slate-100 text-slate-400 font-black rounded text-[10px] uppercase tracking-widest disabled:opacity-30 flex items-center justify-center gap-2"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <button
          onClick={handleNext}
          className="flex-[2] md:flex-none px-10 py-3 bg-[#0173b6] text-white font-black rounded text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {currentQuestion === 9 ? "Finish" : "Next Question"}{" "}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );

  const renderPAPI = () => (
    <div className="bg-white p-6 md:p-10 rounded-md border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
      <div className="mb-8 text-center">
        <span className="text-[9px] font-black text-[#0173b6] uppercase tracking-[0.3em]">
          Modul PAPI Kostik — Item {currentQuestion + 1}
        </span>
        <h3 className="text-base font-bold text-slate-400 uppercase mt-2">
          Pilih pernyataan yang paling menggambarkan diri Anda:
        </h3>
      </div>

      <div className="space-y-4 flex-1">
        <button
          onClick={handleNext}
          className="w-full p-6 md:p-8 bg-slate-50 border border-slate-200 rounded hover:border-[#0173b6] hover:bg-blue-50 transition-all group text-left relative overflow-hidden active:scale-[0.98]"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-[#0173b6] transition-colors"></div>
          <div className="flex gap-6 items-center">
            <span className="text-3xl font-black text-slate-200 group-hover:text-[#0173b6]/20 transition-colors shrink-0">
              A
            </span>
            <p className="text-sm md:text-lg font-black text-slate-700 uppercase tracking-tight leading-snug">
              Saya adalah orang yang selalu berusaha keras untuk mencapai hasil
              yang sempurna.
            </p>
          </div>
        </button>

        <button
          onClick={handleNext}
          className="w-full p-6 md:p-8 bg-slate-50 border border-slate-200 rounded hover:border-[#0173b6] hover:bg-blue-50 transition-all group text-left relative overflow-hidden active:scale-[0.98]"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-[#0173b6] transition-colors"></div>
          <div className="flex gap-6 items-center">
            <span className="text-3xl font-black text-slate-200 group-hover:text-[#0173b6]/20 transition-colors shrink-0">
              B
            </span>
            <p className="text-sm md:text-lg font-black text-slate-700 uppercase tracking-tight leading-snug">
              Saya lebih menyukai bekerja dengan arahan yang jelas dari pimpinan
              saya.
            </p>
          </div>
        </button>
      </div>

      <div className="mt-10 flex items-center justify-center gap-3 text-[#b45309] bg-amber-50 p-4 rounded border border-amber-100">
        <HelpCircle size={18} />
        <p className="text-[9px] font-black uppercase tracking-widest leading-none">
          Pilih salah satu (A atau B) untuk melanjutkan
        </p>
      </div>
    </div>
  );

  const renderVision = () => (
    <div className="bg-white p-6 md:p-10 rounded-md border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center">
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between items-end mb-2">
          <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em]">
            Visual Item {currentQuestion + 1}
          </p>
          <p className="text-amber-600 font-mono text-[10px] font-bold">
            {itemTimeLeft}s
          </p>
        </div>
        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-1000 linear"
            style={{ width: `${(itemTimeLeft / 10) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="w-full max-w-lg aspect-video bg-slate-50 rounded border-2 border-dashed border-slate-200 mb-10 flex items-center justify-center relative overflow-hidden shadow-inner group">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <ImageIcon
            size={64}
            strokeWidth={1.5}
            className="group-hover:scale-110 transition-transform duration-500"
          />
          <p className="text-[9px] font-black uppercase tracking-[0.4em]">
            Visual Data Asset
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500/20 animate-pulse"></div>
      </div>

      <p className="text-slate-800 font-black mb-8 text-xs uppercase tracking-[0.2em]">
        Sebutkan pola yang identik:
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        {["Pola A", "Pola B", "Pola C", "Pola D"].map((opt) => (
          <button
            key={opt}
            onClick={handleNext}
            className="py-5 bg-white border border-slate-200 rounded font-black text-slate-400 hover:bg-[#0173b6] hover:text-white hover:border-[#0173b6] transition-all active:scale-95 shadow-sm text-[10px] uppercase tracking-widest"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans selection:bg-blue-100 selection:text-[#0173b6]">
      <main className="container mx-auto">
        {view === "dashboard" && renderDashboard()}
        {view === "mbti" && renderExamLayout(renderMBTI())}
        {view === "papi" && renderExamLayout(renderPAPI())}
        {view === "vision" && renderExamLayout(renderVision())}
      </main>

      {/* Footer minimalis */}
      {/* <footer className="py-12 mt-8 text-center opacity-30 pointer-events-none">
        <p className="text-[9px] font-black text-slate-800 uppercase tracking-[1.5em]">
          Alice Core • Assessment Unit
        </p>
      </footer> */}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

        body {
          font-family: "Plus Jakarta Sans", sans-serif !important;
          letter-spacing: -0.01em;
          color: #1e293b;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        .linear {
          transition-timing-function: linear;
        }
      `}</style>
    </div>
  );
}
