"use client";

import React, { useState } from "react";
import {
  LayoutGrid,
  Zap,
  ClipboardList,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Info,
  Check,
  RotateCcw,
  ShieldAlert
} from "lucide-react";

export type TestType = "mbti" | "disc" | "papi";

interface TestIntroductionViewProps {
  testType: TestType;
  onStart: () => void;
  onBack: () => void;
}

export default function TestIntroductionView({
  testType,
  onStart,
  onBack,
}: TestIntroductionViewProps) {
  // Checkbox konfirmasi pemahaman instruksi
  const [understood, setUnderstood] = useState(false);

  // State untuk simulasi interaktif masing-masing tes
  const [mbtiDemoAnswer, setMbtiDemoAnswer] = useState<"A" | "B" | null>(null);
  const [discDemoAnswer, setDiscDemoAnswer] = useState<{
    most: string | null;
    least: string | null;
  }>({ most: null, least: null });
  const [papiDemoAnswer, setPapiDemoAnswer] = useState<"A" | "B" | null>(null);

  // Konfigurasi data setiap tes
  const testConfigs = {
    mbti: {
      title: "Kepribadian (MBTI)",
      subtitle: "Myers-Briggs Type Indicator",
      badgeColor: "bg-blue-50 text-[#0173b6] border-blue-200",
      themeColor: "#0173b6",
      accentBg: "bg-blue-600",
      accentHover: "hover:bg-blue-700",
      icon: LayoutGrid,
      duration: "15 Menit",
      questionCount: "28 Nomor (4 Tahap, masing-masing 7 nomor)",
      format: "Pilihan Ganda Berpasangan (Opsi A atau B)",
      instruction:
        "Pada setiap nomor, anda akan dihadapkan 2 pilihan pernyataan. Tugas anda yaitu memilih salah satu pertanyaan yang paling menggambarkan diri anda. Apabila kedua pernyataan tersebut dirasa menggambarkan diri anda, anda tetap harus memilih satu pernyataan yang paling menggambarkan diri anda. Begitu juga sebaliknya, apabila kedua pernyataan tidak menggambarkan diri anda, anda tetap harus memilih 1 pilihan pernyataan yang paling mendekati gambaran diri anda. Silahkan mengisi sesuai dengan kondisi Anda karena pada test ini tidak ada jawaban Benar ataupun Salah.. Apabila sudah selesai silahkan klik submit.",
      tips: [
        "Tidak ada jawaban Benar ataupun Salah dalam tes ini.",
        "Pilihlah jawaban secara jujur dan spontan yang paling mencerminkan diri Anda yang sebenarnya, bukan apa yang Anda anggap ideal.",
        "Pastikan seluruh nomor pada setiap tahap terisi sebelum melanjutkan ke tahap berikutnya.",
        "Waktu pengerjaan dialokasikan sekitar 15 menit, kerjakan secara fokus tanpa terdistraksi."
      ]
    },
    disc: {
      title: "Profil Perilaku (DISC)",
      subtitle: "Dominance, Influence, Steadiness, Conscientiousness",
      badgeColor: "bg-orange-50 text-orange-600 border-orange-200",
      themeColor: "#f97316",
      accentBg: "bg-orange-500",
      accentHover: "hover:bg-orange-600",
      icon: Zap,
      duration: "20 Menit",
      questionCount: "24 Set Pertanyaan (Masing-masing 4 pernyataan)",
      format: "Pemilihan Kolom M (Most) dan Kolom L (Least)",
      instruction:
        "Pada test ini anda akan dihadapkan 4 pilihan pernyataan singkat pada setiap nomor. Tugas anda silahkan memilih 2 pernyataan singkat pada setiap nomor (pilih 1 pernyataan singkat yang paling menggambarkan diri anda kemudian klik di kolom M dan 1 pernyataan singkat yang paling TIDAK menggambarkan diri anda kemudian klik di kolom L. Silahkan mengisi sesuai dengan kondisi Anda karena pada test ini tidak ada jawaban Benar ataupun Salah. Apabila sudah selesai silahkan disubmit",
      tips: [
        "Pada setiap nomor, Anda WAJIB memilih tepat 1 pilihan M (Most / Paling Menggambarkan) dan 1 pilihan L (Least / Paling Tidak Menggambarkan).",
        "Anda TIDAK DAPAT memilih kolom M dan L pada satu baris pernyataan yang sama.",
        "Kerjakan berdasarkan kecenderungan gaya kerja dan respon alami Anda saat berada di lingkungan profesional.",
        "Waktu pengerjaan sekitar 20 menit untuk 24 set soal."
      ]
    },
    papi: {
      title: "Gaya Kerja (PAPI Kostick)",
      subtitle: "Personality and Preference Inventory",
      badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
      themeColor: "#059669",
      accentBg: "bg-emerald-600",
      accentHover: "hover:bg-emerald-700",
      icon: ClipboardList,
      duration: "30 Menit",
      questionCount: "90 Pasang Pernyataan",
      format: "Pilihan Pasangan Biner (Opsi A atau Opsi B)",
      instruction:
        "Pada setiap nomor, anda akan dihadapkan 2 pilihan pernyataan. Tugas anda yaitu memilih salah satu pertanyaan yang paling menggambarkan diri anda. Apabila kedua pernyataan tersebut dirasa menggambarkan diri anda, anda tetap harus memilih satu pernyataan yang paling menggambarkan diri anda. Begitu juga sebaliknya, apabila kedua pernyataan tidak menggambarkan diri anda, anda tetap harus memilih 1 pilihan pernyataan yang paling mendekati gambaran diri anda. Silahkan mengisi sesuai dengan kondisi Anda karena pada test ini tidak ada jawaban Benar ataupun Salah..",
      tips: [
        "Pilih dengan cepat dan instingtif tanpa perlu menganalisis terlalu lama.",
        "Sistem dilengkapi navigasi responsif, cukup klik salah satu kartu pernyataan (A atau B) untuk memilih.",
        "Jika kedua pernyataan terasa sama-sama mewakili Anda (atau keduanya tidak mewakili), pilihlah yang persentasenya paling mendekati diri Anda.",
        "Total 90 nomor dengan alokasi waktu 30 menit."
      ]
    }
  };

  const current = testConfigs[testType];
  const IconComponent = current.icon;

  // Handler toggle DISC demo
  const handleDiscDemoToggle = (id: string, type: "most" | "least") => {
    setDiscDemoAnswer((prev) => {
      const updated = { ...prev };
      if (type === "most") {
        updated.most = updated.most === id ? null : id;
        if (updated.least === id) updated.least = null;
      } else {
        updated.least = updated.least === id ? null : id;
        if (updated.most === id) updated.most = null;
      }
      return updated;
    });
  };

  // Contoh data simulasi
  const discDemoOptions = [
    { id: "1", text: "Mudah bergaul, ramah, dan optimis" },
    { id: "2", text: "Dapat dipercaya dan setia kawan" },
    { id: "3", text: "Berani mengambil risiko dan berorientasi hasil" },
    { id: "4", text: "Teliti, cermat, dan patuh pada standar kualitas" },
  ];

  const isDiscDemoComplete = discDemoAnswer.most !== null && discDemoAnswer.least !== null;

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-4xl mx-auto pb-24 px-4 md:px-0 font-sans">
      {/* Tombol Navigasi Kembali */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-bold transition-all shadow-sm hover:bg-slate-50 active:scale-95"
        >
          <ChevronLeft size={16} /> Kembali ke Dashboard
        </button>
      </div>

      {/* Header Kartu Informasi Ujian */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden mb-6">
        <div
          className="absolute top-0 left-0 h-1.5 w-full"
          style={{ backgroundColor: current.themeColor }}
        ></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm shrink-0`}
              style={{
                backgroundColor: `${current.themeColor}12`,
                borderColor: `${current.themeColor}30`,
                color: current.themeColor,
              }}
            >
              <IconComponent size={32} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${current.badgeColor}`}
                >
                  Panduan Pengerjaan Ujian
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {current.subtitle}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">
                {current.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700">
              <Clock size={15} className="text-slate-400" />
              <span>Durasi: <strong className="text-slate-900">{current.duration}</strong></span>
            </div>
          </div>
        </div>

        {/* Ringkasan Meta Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
              Alokasi Waktu
            </span>
            <p className="text-sm font-black text-slate-800">{current.duration}</p>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
              Jumlah Soal
            </span>
            <p className="text-sm font-black text-slate-800">{current.questionCount}</p>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
              Format Penilaian
            </span>
            <p className="text-sm font-black text-slate-800">{current.format}</p>
          </div>
        </div>
      </div>

      {/* Kotak Instruksi Resmi */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <IconComponent size={140} />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
            <Sparkles size={14} className="text-amber-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
              Instruksi Resmi Pengerjaan
            </span>
          </div>

          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-white">
            Petunjuk & Tata Cara Mengisi Soal
          </h2>

          <div className="p-5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
            <p className="text-sm md:text-base leading-relaxed text-slate-100 font-medium whitespace-pre-line">
              {current.instruction}
            </p>
          </div>
        </div>
      </div>

      {/* Bagian Simulasi & Contoh Interaktif */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm mb-6">
        <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-200">
                Simulasi Latihan
              </span>
              <span className="text-xs text-slate-400 font-medium">
                (Coba sebelum memulai tes asli)
              </span>
            </div>
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
              Contoh Cara Pengisian Soal Interaktif
            </h3>
          </div>

          {(mbtiDemoAnswer || isDiscDemoComplete || papiDemoAnswer) && (
            <button
              onClick={() => {
                setMbtiDemoAnswer(null);
                setDiscDemoAnswer({ most: null, least: null });
                setPapiDemoAnswer(null);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 font-bold transition-colors"
            >
              <RotateCcw size={14} /> Reset Latihan
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-6 font-medium">
          Klik pada opsi di bawah ini untuk mencoba mekanisme pemilihan jawaban. Latihan ini tidak mempengaruhi penilaian ujian Anda.
        </p>

        {/* SIMULASI MBTI */}
        {testType === "mbti" && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                Simulasi Soal Contoh:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setMbtiDemoAnswer("A")}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                    mbtiDemoAnswer === "A"
                      ? "border-[#0173b6] bg-blue-50/50 shadow-md text-slate-900"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        mbtiDemoAnswer === "A"
                          ? "border-[#0173b6] bg-[#0173b6] text-white font-bold text-xs"
                          : "border-slate-300 bg-slate-50"
                      }`}
                    >
                      {mbtiDemoAnswer === "A" ? <Check size={12} strokeWidth={3} /> : "A"}
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider block text-slate-400 mb-0.5">
                        Pilihan A
                      </span>
                      <span className="text-sm font-semibold">
                        Senang berinteraksi dan beraktivitas dalam kelompok
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setMbtiDemoAnswer("B")}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                    mbtiDemoAnswer === "B"
                      ? "border-[#0173b6] bg-blue-50/50 shadow-md text-slate-900"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        mbtiDemoAnswer === "B"
                          ? "border-[#0173b6] bg-[#0173b6] text-white font-bold text-xs"
                          : "border-slate-300 bg-slate-50"
                      }`}
                    >
                      {mbtiDemoAnswer === "B" ? <Check size={12} strokeWidth={3} /> : "B"}
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider block text-slate-400 mb-0.5">
                        Pilihan B
                      </span>
                      <span className="text-sm font-semibold">
                        Lebih nyaman bekerja sendiri dalam suasana hening
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {mbtiDemoAnswer && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-xs text-blue-900 font-medium animate-in fade-in">
                <CheckCircle2 size={18} className="text-[#0173b6] shrink-0" />
                <span>
                  <strong>Opsi {mbtiDemoAnswer} Terpilih!</strong> Pada tes sebenarnya, sistem akan merekam pilihan Anda dan setelah seluruh 7 butir per tahap selesai, Anda dapat menekan tombol <em>Tahap Berikutnya</em>.
                </span>
              </div>
            )}
          </div>
        )}

        {/* SIMULASI DISC */}
        {testType === "disc" && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                Simulasi 1 Set Soal DISC (Pilih 1 M di Kiri & 1 L di Kanan):
              </span>

              {/* 4 OPSI BARIS */}
              <div className="space-y-2.5">
                {discDemoOptions.map((opt) => {
                  const isMost = discDemoAnswer.most === opt.id;
                  const isLeast = discDemoAnswer.least === opt.id;

                  return (
                    <div
                      key={opt.id}
                      className={`p-2.5 sm:p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 sm:gap-4 ${
                        isMost
                          ? "border-blue-500 bg-blue-50/50 shadow-sm"
                          : isLeast
                          ? "border-red-500 bg-red-50/50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      {/* TOMBOL M (KIRI) */}
                      <button
                        type="button"
                        onClick={() => handleDiscDemoToggle(opt.id, "most")}
                        className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all active:scale-90 select-none ${
                          isMost
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30 font-black text-sm sm:text-base"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 font-bold text-sm"
                        }`}
                      >
                        M
                      </button>

                      {/* TEKS PERNYATAAN (TENGAH) */}
                      <div className="flex-1 min-w-0 text-left px-1">
                        <p
                          className={`text-xs sm:text-sm leading-snug transition-colors ${
                            isMost
                              ? "text-blue-900 font-bold"
                              : isLeast
                              ? "text-red-900 font-bold"
                              : "text-slate-700 font-medium"
                          }`}
                        >
                          {opt.text}
                        </p>
                      </div>

                      {/* TOMBOL L (KANAN) */}
                      <button
                        type="button"
                        onClick={() => handleDiscDemoToggle(opt.id, "least")}
                        className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all active:scale-90 select-none ${
                          isLeast
                            ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-500/30 font-black text-sm sm:text-base"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:border-red-400 hover:text-red-600 font-bold text-sm"
                        }`}
                      >
                        L
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isDiscDemoComplete ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900 font-medium animate-in fade-in">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>
                    <strong>Kombinasi Sempurna!</strong> Anda telah memilih 1 M dan 1 L. Tombol <em>Selanjutnya</em> akan aktif saat kedua tombol terisi.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-900 font-medium">
                  <Info size={18} className="text-amber-600 shrink-0" />
                  <span>
                    Silakan coba klik 1 tombol <strong>M</strong> dan 1 tombol <strong>L</strong> pada dua baris yang berbeda.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SIMULASI PAPI KOSTICK */}
        {testType === "papi" && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                Simulasi Soal Pasangan PAPI Kostick:
              </span>

              <div className="space-y-3">
                <button
                  onClick={() => setPapiDemoAnswer("A")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${
                    papiDemoAnswer === "A"
                      ? "border-emerald-600 bg-emerald-50/60 shadow-md text-emerald-950 font-bold"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-black text-sm shrink-0 transition-all ${
                        papiDemoAnswer === "A"
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-slate-100 border-slate-300 text-slate-500"
                      }`}
                    >
                      A
                    </div>
                    <span className="text-sm md:text-base">
                      Saya seorang pekerja keras dan tekun menyelesaikan target
                    </span>
                  </div>
                  {papiDemoAnswer === "A" && (
                    <div className="absolute top-3 right-3">
                      <Check className="text-emerald-600" size={20} strokeWidth={3} />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setPapiDemoAnswer("B")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${
                    papiDemoAnswer === "B"
                      ? "border-emerald-600 bg-emerald-50/60 shadow-md text-emerald-950 font-bold"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-black text-sm shrink-0 transition-all ${
                        papiDemoAnswer === "B"
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-slate-100 border-slate-300 text-slate-500"
                      }`}
                    >
                      B
                    </div>
                    <span className="text-sm md:text-base">
                      Saya bukan seorang pemurung dan selalu membawa keceriaan
                    </span>
                  </div>
                  {papiDemoAnswer === "B" && (
                    <div className="absolute top-3 right-3">
                      <Check className="text-emerald-600" size={20} strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {papiDemoAnswer && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900 font-medium animate-in fade-in">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>Opsi {papiDemoAnswer} Terpilih!</strong> Pada tes sebenarnya, sistem akan secara otomatis menyimpan pilihan Anda dan melanjutkan ke nomor berikutnya.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ketentuan & Tips Pengerjaan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm mb-6">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <HelpCircle size={18} className="text-slate-400" />
          Poin-Poin Penting Sebelum Memulai
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {current.tips.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 font-medium"
            >
              <CheckCircle2
                size={16}
                className="text-emerald-600 shrink-0 mt-0.5"
              />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Area Konfirmasi & Tombol Mulai Tes */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <label className="flex items-center gap-3.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="w-5 h-5 rounded text-[#0173b6] focus:ring-[#0173b6] border-slate-300 cursor-pointer"
          />
          <span className="text-xs md:text-sm font-bold text-slate-700">
            Saya telah membaca dan memahami seluruh instruksi pengerjaan di atas.
          </span>
        </label>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="w-1/2 md:w-auto px-6 py-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-black text-xs uppercase tracking-wider transition-all"
          >
            Batal
          </button>
          <button
            onClick={onStart}
            disabled={!understood}
            className={`w-1/2 md:w-auto px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 shadow-xl ${
              understood
                ? `${current.accentBg} ${current.accentHover} shadow-blue-900/20 active:scale-95 cursor-pointer`
                : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
            }`}
          >
            <span>Mulai Tes Sekarang</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
