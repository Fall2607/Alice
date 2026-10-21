"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Brain,
  Layers,
  Info,
  Sparkles,
  BookOpen,
  X,
  Grid
} from "lucide-react";
import {
  cfitSubtest1Questions,
  cfitSubtest2Questions,
  cfitSubtest3Questions,
  cfitSubtest3Examples,
  CFITQuestion,
  CFITOptionLetter,
  CFIT_SUBTEST_2_INSTRUCTION,
  CFIT_SUBTEST_3_INSTRUCTION,
} from "@/app/data/tests/cfitData";

interface CFITProps {
  initialSubtest?: number;
  answers: Record<string, any>;
  setAnswers: (val: Record<string, any>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function CFITTestContent({
  initialSubtest = 1,
  answers,
  setAnswers,
  onNext,
  onBack,
}: CFITProps) {
  const [activeSubtest, setActiveSubtest] = useState<1 | 2 | 3>(
    initialSubtest === 3 ? 3 : initialSubtest === 2 ? 2 : 1
  );
  const [activeIdx, setActiveIdx] = useState(0);

  // Mode Subtes 2: "tutorial" (panduan & contoh soal sebelum mulai) atau "test" (soal resmi 1-14)
  const [subtest2Mode, setSubtest2Mode] = useState<"tutorial" | "test">("tutorial");
  const [understoodSubtest2, setUnderstoodSubtest2] = useState(false);
  const [demoSubtest2Example, setDemoSubtest2Example] = useState<1 | 2>(1);
  const [demoSubtest2Answers, setDemoSubtest2Answers] = useState<Record<number, CFITOptionLetter[]>>({
    1: [],
    2: [],
  });

  // Mode Subtes 3: "tutorial" (panduan & contoh soal sebelum mulai) atau "test" (soal resmi 1-13)
  const [subtest3Mode, setSubtest3Mode] = useState<"tutorial" | "test">("tutorial");
  const [understoodSubtest3, setUnderstoodSubtest3] = useState(false);
  const [demoSubtest3Example, setDemoSubtest3Example] = useState<1 | 2 | 3>(1);
  const [demoSubtest3Answers, setDemoSubtest3Answers] = useState<Record<number, CFITOptionLetter | null>>({
    1: null,
    2: null,
    3: null,
  });

  // Modal konfirmasi saat seluruh soal bagian selesai terisi
  const [showSubtest1CompletedModal, setShowSubtest1CompletedModal] = useState(false);
  const [showSubtest2CompletedModal, setShowSubtest2CompletedModal] = useState(false);
  const hasPromptedSubtest1Ref = useRef(false);
  const hasPromptedSubtest2Ref = useRef(false);

  // Pop up modal instruksi pengerjaan jika peserta lupa
  const [showInstructionModal, setShowInstructionModal] = useState(false);

  // Reference elemen jangkar soal untuk auto-scroll
  const questionAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSubtest === 3) {
      setActiveSubtest(3);
      setActiveIdx(0);
    } else if (initialSubtest === 2) {
      setActiveSubtest(2);
      setActiveIdx(0);
    }
  }, [initialSubtest]);

  // Fungsi scroll otomatis langsung fokus ke jangkar kartu soal
  const scrollToQuestion = () => {
    if (typeof window === "undefined") return;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = questionAnchorRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
          const targetY = Math.max(0, rect.top + scrollTop - 85);
          window.scrollTo({
            top: targetY,
            behavior: "smooth",
          });
        }
      }, 40);
    });
  };

  // Setiap kali nomor soal berganti, otomatis scroll ke kartu soal
  useEffect(() => {
    if (
      activeSubtest === 1 ||
      (activeSubtest === 2 && subtest2Mode === "test") ||
      (activeSubtest === 3 && subtest3Mode === "test")
    ) {
      scrollToQuestion();
    }
  }, [activeIdx, activeSubtest, subtest2Mode, subtest3Mode]);

  const currentQuestions: CFITQuestion[] =
    activeSubtest === 1
      ? cfitSubtest1Questions
      : activeSubtest === 2
      ? cfitSubtest2Questions
      : cfitSubtest3Questions;
  const currentQuestion = currentQuestions[activeIdx] || currentQuestions[0];

  // Hitung jumlah soal terjawab per subtest
  const subtest1AnsweredCount = cfitSubtest1Questions.filter(
    (q) => typeof answers[q.id] === "string" && answers[q.id].length > 0
  ).length;

  const subtest2AnsweredCount = cfitSubtest2Questions.filter(
    (q) => Array.isArray(answers[q.id]) && answers[q.id].length === 2
  ).length;

  const subtest3AnsweredCount = cfitSubtest3Questions.filter(
    (q) => typeof answers[q.id] === "string" && answers[q.id].length > 0
  ).length;

  const isSubtest1AllDone = subtest1AnsweredCount === cfitSubtest1Questions.length;
  const isSubtest2AllDone = subtest2AnsweredCount === cfitSubtest2Questions.length;
  const isSubtest3AllDone = subtest3AnsweredCount === cfitSubtest3Questions.length;

  // Jika seluruh soal bagian 1 selesai, otomatis munculkan modal konfirmasi
  useEffect(() => {
    if (activeSubtest === 1 && isSubtest1AllDone && !hasPromptedSubtest1Ref.current) {
      hasPromptedSubtest1Ref.current = true;
      setShowSubtest1CompletedModal(true);
    }
  }, [activeSubtest, isSubtest1AllDone]);

  // Jika seluruh soal bagian 2 selesai, otomatis munculkan modal konfirmasi
  useEffect(() => {
    if (
      activeSubtest === 2 &&
      subtest2Mode === "test" &&
      isSubtest2AllDone &&
      !hasPromptedSubtest2Ref.current
    ) {
      hasPromptedSubtest2Ref.current = true;
      setShowSubtest2CompletedModal(true);
    }
  }, [activeSubtest, subtest2Mode, isSubtest2AllDone]);

  // Subtest 1 & Subtest 3: single answer (string)
  const selectedOptionSingle: CFITOptionLetter | null =
    typeof answers[currentQuestion.id] === "string"
      ? (answers[currentQuestion.id] as CFITOptionLetter)
      : null;

  // Subtest 2: multi answers (array 2 huruf)
  const selectedOptionsSubtest2: CFITOptionLetter[] = Array.isArray(
    answers[currentQuestion.id]
  )
    ? (answers[currentQuestion.id] as CFITOptionLetter[])
    : [];

  const handleSelectOptionSingle = (label: CFITOptionLetter) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: label,
    });
  };

  const handleToggleOptionSubtest2 = (label: CFITOptionLetter) => {
    const currentList = selectedOptionsSubtest2;
    let updated: CFITOptionLetter[];

    if (currentList.includes(label)) {
      updated = currentList.filter((l) => l !== label);
    } else {
      if (currentList.length >= 2) {
        // Ganti pilihan paling lama
        updated = [currentList[1], label];
      } else {
        updated = [...currentList, label];
      }
    }

    setAnswers({
      ...answers,
      [currentQuestion.id]: updated,
    });
  };

  const handleResetCurrent = () => {
    const updated = { ...answers };
    delete updated[currentQuestion.id];
    setAnswers(updated);
  };

  const handleGoToQuestion = (idx: number) => {
    setActiveIdx(idx);
    scrollToQuestion();
  };

  // Navigasi masuk ke Panduan & Contoh Soal Bagian 2
  const handleProceedToSubtest2Tutorial = () => {
    setShowSubtest1CompletedModal(false);
    setActiveSubtest(2);
    setSubtest2Mode("tutorial");
    setActiveIdx(0);
    if (typeof window !== "undefined") {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }, 50);
    }
  };

  // Navigasi masuk ke Panduan & Contoh Soal Bagian 3
  const handleProceedToSubtest3Tutorial = () => {
    setShowSubtest2CompletedModal(false);
    setActiveSubtest(3);
    setSubtest3Mode("tutorial");
    setActiveIdx(0);
    if (typeof window !== "undefined") {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }, 50);
    }
  };

  // Handler toggle latihan demo Subtes 2
  const handleToggleDemoSubtest2 = (exampleNum: 1 | 2, letter: CFITOptionLetter) => {
    setDemoSubtest2Answers((prev) => {
      const currentList = prev[exampleNum] || [];
      if (currentList.includes(letter)) {
        return {
          ...prev,
          [exampleNum]: currentList.filter((l) => l !== letter),
        };
      } else {
        if (currentList.length >= 2) {
          return {
            ...prev,
            [exampleNum]: [currentList[1], letter],
          };
        } else {
          return {
            ...prev,
            [exampleNum]: [...currentList, letter],
          };
        }
      }
    });
  };

  // Handler pilih opsi latihan demo Subtes 3
  const handleSelectDemoSubtest3 = (exampleNum: 1 | 2 | 3, letter: CFITOptionLetter) => {
    setDemoSubtest3Answers((prev) => ({
      ...prev,
      [exampleNum]: letter,
    }));
  };

  const isSubtest1 = activeSubtest === 1;
  const isSubtest2 = activeSubtest === 2;
  const isSubtest3 = activeSubtest === 3;

  const isQuestionAnswered = isSubtest2
    ? selectedOptionsSubtest2.length === 2
    : !!selectedOptionSingle;

  const isLastQuestionInSubtest = activeIdx === currentQuestions.length - 1;

  const handleNextStep = () => {
    if (isSubtest1 && (isLastQuestionInSubtest || isSubtest1AllDone)) {
      handleProceedToSubtest2Tutorial();
      return;
    }

    if (isSubtest2 && (isLastQuestionInSubtest || isSubtest2AllDone)) {
      handleProceedToSubtest3Tutorial();
      return;
    }

    if (!isLastQuestionInSubtest) {
      handleGoToQuestion(activeIdx + 1);
    } else {
      if (isSubtest1) {
        handleProceedToSubtest2Tutorial();
      } else if (isSubtest2) {
        handleProceedToSubtest3Tutorial();
      } else {
        // CFIT selesai
        if (onNext) onNext();
      }
    }
  };

  const handlePrevStep = () => {
    if (activeIdx > 0) {
      handleGoToQuestion(activeIdx - 1);
    } else {
      if (isSubtest3) {
        setActiveSubtest(2);
        setSubtest2Mode("test");
        setActiveIdx(cfitSubtest2Questions.length - 1);
        scrollToQuestion();
      } else if (isSubtest2) {
        setActiveSubtest(1);
        setActiveIdx(cfitSubtest1Questions.length - 1);
        scrollToQuestion();
      } else {
        if (onBack) onBack();
      }
    }
  };

  // Cek kebenaran latihan contoh soal Subtes 2
  const currentDemo2Selections = demoSubtest2Answers[demoSubtest2Example] || [];
  const isDemo2_1Correct =
    currentDemo2Selections.length === 2 &&
    currentDemo2Selections.includes("B") &&
    currentDemo2Selections.includes("D");
  const isDemo2_2Correct =
    currentDemo2Selections.length === 2 &&
    currentDemo2Selections.includes("C") &&
    currentDemo2Selections.includes("E");

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-4xl mx-auto pb-24 px-4 md:px-0 font-sans">
      {/* BANNER NOTIFIKASI: JIKA SELURUH SOAL BAGIAN 1 SELESAI */}
      {isSubtest1 && isSubtest1AllDone && (
        <div className="mb-6 p-4 md:p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500 border border-purple-500/30">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <CheckCircle2 size={24} className="text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Bagian Pertama Selesai
                </span>
                <span className="text-xs font-mono font-bold text-purple-200">
                  13 / 13 Soal Terisi
                </span>
              </div>
              <h4 className="text-sm md:text-base font-black uppercase tracking-tight">
                Seluruh Soal Bagian Pertama Telah Lengkap!
              </h4>
              <p className="text-xs text-purple-100 font-medium">
                Klik tombol di samping untuk membuka panduan &amp; contoh soal bagian berikutnya.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProceedToSubtest2Tutorial}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-purple-900 hover:bg-purple-50 active:scale-95 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Lanjut</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* BANNER NOTIFIKASI: JIKA SELURUH SOAL BAGIAN 2 SELESAI */}
      {isSubtest2 && subtest2Mode === "test" && isSubtest2AllDone && (
        <div className="mb-6 p-4 md:p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500 border border-purple-500/30">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <CheckCircle2 size={24} className="text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Bagian Kedua Selesai
                </span>
                <span className="text-xs font-mono font-bold text-purple-200">
                  14 / 14 Soal Terisi
                </span>
              </div>
              <h4 className="text-sm md:text-base font-black uppercase tracking-tight">
                Seluruh Soal Bagian Kedua Telah Lengkap!
              </h4>
              <p className="text-xs text-purple-100 font-medium">
                Klik tombol di samping untuk membuka panduan &amp; contoh soal bagian berikutnya.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProceedToSubtest3Tutorial}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-purple-900 hover:bg-purple-50 active:scale-95 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Lanjut</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* BANNER NOTIFIKASI: JIKA SELURUH SOAL BAGIAN 3 SELESAI */}
      {isSubtest3 && subtest3Mode === "test" && isSubtest3AllDone && (
        <div className="mb-6 p-4 md:p-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500 border border-emerald-500/30">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <CheckCircle2 size={24} className="text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-white/20 text-emerald-100 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/30">
                  CFIT Lengkap
                </span>
                <span className="text-xs font-mono font-bold text-emerald-100">
                  13 / 13 Soal Terisi
                </span>
              </div>
              <h4 className="text-sm md:text-base font-black uppercase tracking-tight">
                Seluruh Soal CFIT Telah Lengkap!
              </h4>
              <p className="text-xs text-emerald-100 font-medium">
                Klik tombol di samping untuk menyimpan seluruh jawaban dan menyelesaikan tes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onNext) onNext();
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Selesai</span>
            <Check size={16} />
          </button>
        </div>
      )}

      {/* MODAL TRANSISI: SELESAI BAGIAN 1 MENUJU CONTOH BAGIAN BERIKUTNYA */}
      {showSubtest1CompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} className="text-purple-600" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 inline-block mb-2">
                13 dari 13 Soal Terisi
              </span>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                Bagian Pertama Selesai!
              </h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                Seluruh butir soal pada bagian ini telah berhasil Anda isi. Selanjutnya, Anda akan mempelajari petunjuk dan contoh simulasi latihan untuk bagian berikutnya.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowSubtest1CompletedModal(false)}
                className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Periksa Kembali Jawaban
              </button>
              <button
                type="button"
                onClick={handleProceedToSubtest2Tutorial}
                className="w-full sm:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TRANSISI: SELESAI BAGIAN 2 MENUJU CONTOH BAGIAN BERIKUTNYA */}
      {showSubtest2CompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} className="text-purple-600" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 inline-block mb-2">
                14 dari 14 Soal Terisi
              </span>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                Bagian Kedua Selesai!
              </h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                Seluruh butir soal pada bagian ini telah berhasil Anda isi. Selanjutnya, Anda akan mempelajari petunjuk dan contoh simulasi latihan untuk bagian berikutnya.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowSubtest2CompletedModal(false)}
                className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Periksa Kembali Jawaban
              </button>
              <button
                type="button"
                onClick={handleProceedToSubtest3Tutorial}
                className="w-full sm:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAMPILAN KHUSUS: PANDUAN & CONTOH SOAL SEBELUM MULAI BAGIAN 3   */}
      {/* ============================================================== */}
      {activeSubtest === 3 && subtest3Mode === "tutorial" ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header Ucapan Sukses Selesai Bagian 2 */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={28} className="text-emerald-200" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Bagian Kedua Selesai
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                  Bagian Kedua Selesai!
                </h2>
                <p className="text-xs md:text-sm text-emerald-100 font-medium">
                  Selanjutnya Anda akan mengerjakan bagian <strong>Matriks Pola Gambar</strong>. Pelajari petunjuk dan contoh soal di bawah ini terlebih dahulu sebelum mulai.
                </p>
              </div>
            </div>
          </div>

          {/* Kotak Instruksi Resmi Subtes 3 */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                <Sparkles size={14} className="text-amber-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
                  Instruksi Resmi: Matriks Pola Gambar
                </span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">
                Petunjuk Matriks Pola Gambar (Kotak 4 Bagian)
              </h3>
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-sm md:text-base leading-relaxed text-slate-100 font-medium whitespace-pre-line">
                  {CFIT_SUBTEST_3_INSTRUCTION}
                </p>
              </div>
            </div>
          </div>

          {/* Area Simulasi Latihan Contoh Soal 1, 2, & 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-purple-200">
                    Latihan Contoh Soal
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    (Coba pilih 1 gambar pelengkap)
                  </span>
                </div>
                <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">
                  Simulasi Latihan Contoh Soal (Pilih 1 Gambar: A - F)
                </h4>
              </div>

              {/* Tab Antar Contoh 1, 2, dan 3 */}
              <div className="flex items-center gap-2">
                {([1, 2, 3] as const).map((exNum) => (
                  <button
                    key={exNum}
                    type="button"
                    onClick={() => setDemoSubtest3Example(exNum)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      demoSubtest3Example === exNum
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    Contoh {exNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Kotak Info Gambar Matriks Contoh Soal */}
            <div className="p-4 md:p-6 bg-slate-50/70 rounded-xl border border-dashed border-slate-300 mb-6 flex flex-col items-center">
              <div className="relative max-w-full overflow-hidden rounded-lg bg-white p-3 md:p-5 shadow-sm border border-slate-200 mb-2">
                <img
                  src={`/img/cfit/subtest_3/contoh_${demoSubtest3Example}/Contoh-Soal.png`}
                  alt={`Contoh Soal ${demoSubtest3Example}`}
                  className="max-h-40 md:max-h-52 w-auto object-contain select-none pointer-events-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-semibold text-center">
                Perhatikan matriks 4 bagian di atas. Tiga bagian sudah terisi, carilah gambar yang logis untuk bagian kanan bawah.
              </p>
            </div>

            {/* Opsi Pilihan A - F */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Pilih Salah Satu Opsi (A - F):
                </span>
                <span className="text-xs text-purple-700 font-bold">
                  {demoSubtest3Answers[demoSubtest3Example]
                    ? `Terpilih: Opsi ${demoSubtest3Answers[demoSubtest3Example]}`
                    : "Belum memilih"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                {(["A", "B", "C", "D", "E", "F"] as const).map((letter) => {
                  const isSelected = demoSubtest3Answers[demoSubtest3Example] === letter;

                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleSelectDemoSubtest3(demoSubtest3Example, letter)}
                      className={`relative flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all active:scale-95 group text-center cursor-pointer ${
                        isSelected
                          ? "border-purple-600 bg-purple-50/70 shadow-md ring-2 ring-purple-600/20 scale-[1.02]"
                          : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs mb-2 transition-all ${
                          isSelected
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-700"
                        }`}
                      >
                        {letter}
                      </div>

                      <div className="w-full aspect-square flex items-center justify-center bg-white rounded-lg border border-slate-100 p-2 shadow-inner mb-2">
                        <img
                          src={`/img/cfit/subtest_3/contoh_${demoSubtest3Example}/${letter}.png`}
                          alt={`Contoh ${demoSubtest3Example} Opsi ${letter}`}
                          className="max-h-16 md:max-h-20 w-auto object-contain select-none"
                        />
                      </div>

                      <div className="h-5 flex items-center justify-center w-full">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-purple-700 uppercase">
                            <Check size={13} strokeWidth={3} /> Terpilih
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600">
                            Pilih {letter}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Hasil Contoh Subtes 3 */}
            {demoSubtest3Answers[demoSubtest3Example] && (
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 text-xs md:text-sm font-medium animate-in fade-in ${
                  (demoSubtest3Example === 1 && demoSubtest3Answers[1] === "B") ||
                  (demoSubtest3Example === 2 && demoSubtest3Answers[2] === "C") ||
                  (demoSubtest3Example === 3 && demoSubtest3Answers[3] === "F")
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-purple-50 border-purple-200 text-purple-900"
                }`}
              >
                <CheckCircle2
                  size={20}
                  className={
                    (demoSubtest3Example === 1 && demoSubtest3Answers[1] === "B") ||
                    (demoSubtest3Example === 2 && demoSubtest3Answers[2] === "C") ||
                    (demoSubtest3Example === 3 && demoSubtest3Answers[3] === "F")
                      ? "text-emerald-600 shrink-0"
                      : "text-purple-600 shrink-0"
                  }
                />
                <div className="flex-1">
                  {demoSubtest3Example === 1 ? (
                    demoSubtest3Answers[1] === "B" ? (
                      <span>
                        <strong>Hebat! Opsi B adalah jawaban yang benar!</strong> Pola menunjukkan hubungan bentuk baris atas dan baris bawah. Gambar B adalah gambar yang paling sesuai untuk melengkapi bagian kanan bawah yang kosong.
                      </span>
                    ) : (
                      <span>
                        Anda memilih <strong>Opsi {demoSubtest3Answers[1]}</strong>. Kunci jawaban resmi untuk Contoh 1 adalah <strong>Opsi B</strong>. Pola baris atas dan bawah saling berkorelasi.
                      </span>
                    )
                  ) : demoSubtest3Example === 2 ? (
                    demoSubtest3Answers[2] === "C" ? (
                      <span>
                        <strong>Hebat! Opsi C adalah jawaban yang benar!</strong> Berdasarkan pola hubungan antara gambar di bagian atas dan bawah, pilihan C adalah gambar yang tepat untuk melengkapi bagian kanan bawah yang kosong.
                      </span>
                    ) : (
                      <span>
                        Anda memilih <strong>Opsi {demoSubtest3Answers[2]}</strong>. Kunci jawaban resmi untuk Contoh 2 adalah <strong>Opsi C</strong>.
                      </span>
                    )
                  ) : demoSubtest3Answers[3] === "F" ? (
                    <span>
                      <strong>Hebat! Opsi F adalah jawaban yang benar!</strong> Memperhatikan pola dan hubungan bentuk pada gambar yang tersedia, pilihan F adalah pilihan yang paling logis untuk mengisi bagian yang kosong.
                    </span>
                  ) : (
                    <span>
                      Anda memilih <strong>Opsi {demoSubtest3Answers[3]}</strong>. Kunci jawaban resmi untuk Contoh 3 adalah <strong>Opsi F</strong>.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tombol CTA Mulai Soal Resmi dengan Checkbox Pemahaman */}
          <div className="bg-white rounded-2xl border-2 border-purple-200 p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <label className="flex items-center gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={understoodSubtest3}
                onChange={(e) => setUnderstoodSubtest3(e.target.checked)}
                className="w-5 h-5 rounded text-purple-600 focus:ring-purple-600 border-slate-300 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-bold text-slate-700">
                Saya telah membaca dan memahami seluruh instruksi pengerjaan di atas.
              </span>
            </label>

            <button
              type="button"
              disabled={!understoodSubtest3}
              onClick={() => {
                setSubtest3Mode("test");
                setActiveIdx(0);
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                  document.documentElement.scrollTop = 0;
                  document.body.scrollTop = 0;
                }
              }}
              className={`w-full md:w-auto px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 shadow-xl ${
                understoodSubtest3
                  ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/30 active:scale-95 cursor-pointer"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              }`}
            >
              <span>Mulai</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : activeSubtest === 2 && subtest2Mode === "tutorial" ? (
        /* ============================================================== */
        /* TAMPILAN KHUSUS: PANDUAN & CONTOH SOAL SEBELUM MULAI BAGIAN 2   */
        /* ============================================================== */
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header Ucapan Sukses Selesai Bagian 1 */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={28} className="text-emerald-200" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Bagian Pertama Selesai
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                  Bagian Pertama Selesai!
                </h2>
                <p className="text-xs md:text-sm text-emerald-100 font-medium">
                  Selanjutnya Anda akan mengerjakan bagian <strong>Klasifikasi Gambar</strong>. Pelajari petunjuk dan contoh soal di bawah ini terlebih dahulu sebelum mulai.
                </p>
              </div>
            </div>
          </div>

          {/* Kotak Instruksi Resmi Subtes 2 */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                <Sparkles size={14} className="text-amber-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
                  Instruksi Resmi: Klasifikasi Gambar
                </span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">
                Petunjuk Klasifikasi Gambar (5 Kotak Berdampingan)
              </h3>
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-sm md:text-base leading-relaxed text-slate-100 font-medium whitespace-pre-line">
                  {CFIT_SUBTEST_2_INSTRUCTION}
                </p>
              </div>
            </div>
          </div>

          {/* Area Simulasi Latihan Contoh Soal 1 & 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-purple-200">
                    Latihan Contoh Soal
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    (Coba pilih 2 kotak serupa)
                  </span>
                </div>
                <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">
                  Simulasi Latihan Contoh Soal (Pilih 2 Kotak: A - E)
                </h4>
              </div>

              {/* Tab Antar Contoh 1 dan 2 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDemoSubtest2Example(1)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    demoSubtest2Example === 1
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Contoh 1
                </button>
                <button
                  type="button"
                  onClick={() => setDemoSubtest2Example(2)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    demoSubtest2Example === 2
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Contoh 2
                </button>
              </div>
            </div>

            {/* Kotak Info Pemilihan */}
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 flex items-center justify-between text-xs text-purple-900 font-medium mb-4">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-purple-600 shrink-0" />
                <span>
                  {demoSubtest2Example === 1
                    ? "Contoh 1: Temukan 2 kotak gambar yang memiliki pola atau bentuk serupa."
                    : "Contoh 2: Amati 5 kotak dan pilih 2 kotak yang memiliki kesamaan sifat."}
                </span>
              </div>
              <span className="font-mono font-bold text-[11px] bg-purple-100 px-2.5 py-0.5 rounded-full text-purple-800">
                Terpilih: {currentDemo2Selections.length} / 2 Kotak
              </span>
            </div>

            {/* 5 KOTAK GAMBAR BERDAMPINGAN UNTUK CONTOH SOAL */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-4">
              {(["A", "B", "C", "D", "E"] as const).map((letter) => {
                const isSelected = currentDemo2Selections.includes(letter);
                const orderIdx = currentDemo2Selections.indexOf(letter);

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleToggleDemoSubtest2(demoSubtest2Example, letter)}
                    className={`relative p-3 rounded-2xl border-2 flex flex-col items-center justify-between transition-all active:scale-95 text-center bg-white cursor-pointer ${
                      isSelected
                        ? "border-purple-600 bg-purple-50/70 shadow-lg ring-2 ring-purple-600/30 scale-[1.02]"
                        : "border-slate-200 hover:border-purple-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          isSelected
                            ? "bg-purple-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {letter}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white">
                          Pilihan {orderIdx + 1}
                        </span>
                      )}
                    </div>

                    <div className="w-full aspect-square flex items-center justify-center p-2 bg-slate-50/60 rounded-xl border border-slate-100 mb-2">
                      <img
                        src={`/img/cfit/subtest_2/contoh_${demoSubtest2Example}/${letter}.png`}
                        alt={`Contoh ${demoSubtest2Example} Opsi ${letter}`}
                        className="max-h-20 w-auto object-contain select-none"
                      />
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase ${
                        isSelected ? "text-purple-700" : "text-slate-400"
                      }`}
                    >
                      {isSelected ? "✓ Terpilih" : `Kotak ${letter}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Hasil Contoh Subtes 2 */}
            {currentDemo2Selections.length === 2 && (
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 text-xs md:text-sm font-medium animate-in fade-in ${
                  (demoSubtest2Example === 1 && isDemo2_1Correct) ||
                  (demoSubtest2Example === 2 && isDemo2_2Correct)
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-purple-50 border-purple-200 text-purple-900"
                }`}
              >
                <CheckCircle2
                  size={20}
                  className={
                    (demoSubtest2Example === 1 && isDemo2_1Correct) ||
                    (demoSubtest2Example === 2 && isDemo2_2Correct)
                      ? "text-emerald-600 shrink-0"
                      : "text-purple-600 shrink-0"
                  }
                />
                <div className="flex-1">
                  {demoSubtest2Example === 1 ? (
                    isDemo2_1Correct ? (
                      <span>
                        <strong>Hebat! Kotak B dan D adalah jawaban yang benar!</strong> Kotak B dan D memiliki bentuk atau pola dasar serupa yang membedakannya dari ketiga kotak lainnya.
                      </span>
                    ) : (
                      <span>
                        Anda memilih <strong>Kotak {currentDemo2Selections.join(" & ")}</strong>. Kunci jawaban resmi untuk Contoh 1 adalah <strong>Kotak B & D</strong> yang memiliki pola dasar serupa.
                      </span>
                    )
                  ) : isDemo2_2Correct ? (
                    <span>
                      <strong>Hebat! Kotak C dan E adalah jawaban yang benar!</strong> Kotak C dan E memiliki kesesuaian karakteristik serupa yang membedakannya dari kotak A, B, dan D.
                    </span>
                  ) : (
                    <span>
                      Anda memilih <strong>Kotak {currentDemo2Selections.join(" & ")}</strong>. Kunci jawaban resmi untuk Contoh 2 adalah <strong>Kotak C & E</strong> yang memiliki pola serupa.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tombol CTA Mulai Soal Resmi dengan Checkbox Pemahaman */}
          <div className="bg-white rounded-2xl border-2 border-purple-200 p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <label className="flex items-center gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={understoodSubtest2}
                onChange={(e) => setUnderstoodSubtest2(e.target.checked)}
                className="w-5 h-5 rounded text-purple-600 focus:ring-purple-600 border-slate-300 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-bold text-slate-700">
                Saya telah membaca dan memahami seluruh instruksi pengerjaan di atas.
              </span>
            </label>

            <button
              type="button"
              disabled={!understoodSubtest2}
              onClick={() => {
                setSubtest2Mode("test");
                setActiveIdx(0);
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                  document.documentElement.scrollTop = 0;
                  document.body.scrollTop = 0;
                }
              }}
              className={`w-full md:w-auto px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 shadow-xl ${
                understoodSubtest2
                  ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/30 active:scale-95 cursor-pointer"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              }`}
            >
              <span>Mulai</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* TAMPILAN SOAL RESMI                                           */
        /* ============================================================== */
        <>
          {/* Jangkar Scroll ke Bagian Soal */}
          <div ref={questionAnchorRef} id="cfit-question-anchor" className="scroll-mt-24" />

          {/* Top Header & Stepper */}
          <div className="mb-6 px-1 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1.5">
                  <Brain size={12} /> CFIT
                </span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Soal {activeIdx + 1} dari {currentQuestions.length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {isSubtest2 ? "Pilih 2 Jawaban (A - E)" : "Pilih 1 Jawaban (A - F)"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowInstructionModal(true)}
                  className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Lihat Petunjuk Pengerjaan"
                >
                  <HelpCircle size={12} /> Petunjuk Soal
                </button>
                {isSubtest2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubtest2Mode("tutorial");
                      if (typeof window !== "undefined") {
                        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                        document.documentElement.scrollTop = 0;
                        document.body.scrollTop = 0;
                      }
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-purple-700 bg-white hover:bg-purple-50 px-2.5 py-0.5 rounded-full border border-slate-200 hover:border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen size={11} /> Panduan & Contoh Soal
                  </button>
                )}
                {isSubtest3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubtest3Mode("tutorial");
                      if (typeof window !== "undefined") {
                        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                        document.documentElement.scrollTop = 0;
                        document.body.scrollTop = 0;
                      }
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-purple-700 bg-white hover:bg-purple-50 px-2.5 py-0.5 rounded-full border border-slate-200 hover:border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen size={11} /> Panduan & Contoh Soal
                  </button>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
                {currentQuestion.title}
              </h2>
            </div>

            {/* Stepper Soal */}
            <div className="flex items-center gap-1.5 flex-wrap bg-slate-50 p-2 rounded-xl border border-slate-200">
              {currentQuestions.map((q, idx) => {
                const hasAnswer = isSubtest2
                  ? Array.isArray(answers[q.id]) && answers[q.id].length === 2
                  : typeof answers[q.id] === "string" && answers[q.id].length > 0;
                const isActive = activeIdx === idx;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleGoToQuestion(idx)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-black transition-all flex items-center justify-center relative cursor-pointer ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md ring-2 ring-purple-600/30 scale-105"
                        : hasAnswer
                        ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 font-bold"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                    title={`Pindah ke Soal ${idx + 1}${
                      hasAnswer
                        ? isSubtest2
                          ? ` (Terjawab: ${answers[q.id].join(" & ")})`
                          : ` (Terjawab: ${answers[q.id]})`
                        : ""
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {hasAnswer && !isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </button>
                );
              })}

              {/* Tombol Reset Jawaban Soal Ini */}
              {((isSubtest2 && selectedOptionsSubtest2.length > 0) ||
                (!isSubtest2 && selectedOptionSingle)) && (
                <button
                  onClick={handleResetCurrent}
                  className="ml-auto flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-bold transition-colors px-2 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer"
                  title="Reset Pilihan Soal Ini"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* KARTU SOAL UTAMA */}
          <div
            id="cfit-question-card"
            style={{ scrollMarginTop: "90px" }}
            className="scroll-mt-28 transition-all duration-300"
          >
            {/* TAMPILAN KONTEN SUBTES 1: POLA SERI GAMBAR */}
            {isSubtest1 && (
              <>
                {/* Gambar Soal Utama (Series Kotak 1 -> 2 -> 3 -> [?]) */}
                <div className="bg-white rounded-2xl border-2 border-slate-200/80 p-5 md:p-8 shadow-sm mb-8 overflow-hidden">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-purple-600" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                        Deretan Gambar Pola:
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Kotak 1 ➔ Kotak 2 ➔ Kotak 3 ➔ [ ? ]
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-slate-50/70 rounded-xl border border-dashed border-slate-300">
                    <div className="relative max-w-full overflow-hidden rounded-lg bg-white p-3 md:p-5 shadow-sm border border-slate-200">
                      <img
                        src={currentQuestion.questionImage}
                        alt={`CFIT ${currentQuestion.title}`}
                        className="max-h-36 md:max-h-48 w-auto object-contain mx-auto select-none pointer-events-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold mt-3 text-center">
                      Amati perubahan pola secara runtut dari kotak 1 ke kotak 3 untuk menentukan gambar pelengkap pada kotak ke-4.
                    </p>
                  </div>
                </div>

                {/* Opsi Pilihan Jawaban A - F */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-8 shadow-sm mb-8">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-800">
                      Pilih Salah Satu Jawaban (A - F):
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {selectedOptionSingle ? (
                        <span className="text-purple-700 font-black">
                          Pilihan: Opsi {selectedOptionSingle}
                        </span>
                      ) : (
                        "Belum memilih"
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = selectedOptionSingle === opt.label;

                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleSelectOptionSingle(opt.label)}
                          className={`relative flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all active:scale-95 group text-center cursor-pointer ${
                            isSelected
                              ? "border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-600/20"
                              : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/50 shadow-sm"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-3 transition-all ${
                              isSelected
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-700"
                            }`}
                          >
                            {opt.label}
                          </div>

                          <div className="w-full aspect-square flex items-center justify-center bg-white rounded-lg border border-slate-100 p-2 shadow-inner mb-2">
                            <img
                              src={opt.image}
                              alt={`Pilihan ${opt.label}`}
                              className="max-h-16 md:max-h-20 w-auto object-contain select-none"
                            />
                          </div>

                          <div className="h-6 flex items-center justify-center w-full">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-black text-purple-700 uppercase">
                                <Check size={13} strokeWidth={3} /> Terpilih
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600">
                                Pilih {opt.label}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* TAMPILAN KONTEN SUBTES 2: KLASIFIKASI 5 KOTAK GAMBAR BERDAMPINGAN */}
            {isSubtest2 && (
              <div className="bg-white rounded-2xl border-2 border-slate-200/80 p-5 md:p-8 shadow-sm mb-8 overflow-hidden">
                {/* Header Status Pemilihan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-200">
                        5 Kotak Gambar Berdampingan
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        (Wajib Pilih Tepat 2 Kotak Serupa)
                      </span>
                    </div>
                    <h3 className="text-sm md:text-base font-black text-slate-800 uppercase tracking-tight">
                      Temukan 2 Kotak yang Memiliki Bentuk/Pola Serupa
                    </h3>
                  </div>

                  {/* Status Counter Badge */}
                  <div
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto ${
                      selectedOptionsSubtest2.length === 2
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : selectedOptionsSubtest2.length === 1
                        ? "bg-amber-50 border-amber-300 text-amber-800"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {selectedOptionsSubtest2.length === 2 ? (
                      <>
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>
                          ✓ 2 Kotak Terpilih: <strong>Kotak {selectedOptionsSubtest2.join(" & ")}</strong>
                        </span>
                      </>
                    ) : selectedOptionsSubtest2.length === 1 ? (
                      <>
                        <Info size={16} className="text-amber-600 shrink-0" />
                        <span>
                          1 Kotak Terpilih (<strong>{selectedOptionsSubtest2[0]}</strong>). Pilih 1 kotak lagi!
                        </span>
                      </>
                    ) : (
                      <>
                        <Info size={16} className="text-slate-400 shrink-0" />
                        <span>Pilih 2 kotak gambar (0/2 terpilih)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 5 KOTAK GAMBAR TERSUSUN BERDAMPINGAN SECARA HORIZONTAL */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-4">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedOptionsSubtest2.includes(opt.label);
                    const orderIdx = selectedOptionsSubtest2.indexOf(opt.label);

                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleToggleOptionSubtest2(opt.label)}
                        className={`relative flex flex-col items-center justify-between p-3.5 md:p-4 rounded-2xl border-2 transition-all active:scale-95 group text-center cursor-pointer ${
                          isSelected
                            ? "border-purple-600 bg-purple-50/70 shadow-lg ring-2 ring-purple-600/30 scale-[1.02]"
                            : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/70 shadow-sm"
                        }`}
                      >
                        {/* Header Huruf Kotak & Urutan Pemilihan */}
                        <div className="w-full flex items-center justify-between mb-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                              isSelected
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-700"
                            }`}
                          >
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white">
                              Pilihan {orderIdx + 1}
                            </span>
                          )}
                        </div>

                        {/* Gambar Kotak */}
                        <div className="w-full aspect-square flex items-center justify-center bg-white rounded-xl border border-slate-100 p-2 shadow-inner mb-3 overflow-hidden">
                          <img
                            src={opt.image}
                            alt={`Kotak ${opt.label}`}
                            className="max-h-24 md:max-h-28 w-auto object-contain select-none transition-transform group-hover:scale-105"
                          />
                        </div>

                        {/* Label Bawah Kotak */}
                        <div className="h-6 flex items-center justify-center w-full">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-purple-700 uppercase">
                              <Check size={14} strokeWidth={3} /> Terpilih
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-700">
                              Pilih Kotak {opt.label}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-400 font-semibold text-center mt-3">
                  Perhatikan baik-baik ciri bentuk atau sudut gambar. Kotak lainnya terlihat mirip namun sebenarnya memiliki pola berbeda.
                </p>
              </div>
            )}

            {/* TAMPILAN KONTEN SUBTES 3: MATRIKS POLA GAMBAR (KOTAK 4 BAGIAN) */}
            {isSubtest3 && (
              <>
                {/* Gambar Soal Matriks Utama */}
                <div className="bg-white rounded-2xl border-2 border-slate-200/80 p-5 md:p-8 shadow-sm mb-8 overflow-hidden">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Grid size={16} className="text-purple-600" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                        Matriks Gambar Pola (4 Bagian):
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      3 Bagian Terisi ➔ [ Kanan Bawah Kosong ]
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-slate-50/70 rounded-xl border border-dashed border-slate-300">
                    <div className="relative max-w-full overflow-hidden rounded-lg bg-white p-3 md:p-5 shadow-sm border border-slate-200">
                      <img
                        src={currentQuestion.questionImage}
                        alt={`CFIT ${currentQuestion.title}`}
                        className="max-h-40 md:max-h-56 w-auto object-contain mx-auto select-none pointer-events-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold mt-3 text-center">
                      Temukan pola hubungan dari gambar-gambar yang sudah ada, lalu pilih satu gambar untuk mengisi bagian kanan bawah yang kosong.
                    </p>
                  </div>
                </div>

                {/* Opsi Pilihan Jawaban A - F */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-8 shadow-sm mb-8">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-800">
                      Pilih Salah Satu Jawaban (A - F):
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {selectedOptionSingle ? (
                        <span className="text-purple-700 font-black">
                          Pilihan: Opsi {selectedOptionSingle}
                        </span>
                      ) : (
                        "Belum memilih"
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = selectedOptionSingle === opt.label;

                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleSelectOptionSingle(opt.label)}
                          className={`relative flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all active:scale-95 group text-center cursor-pointer ${
                            isSelected
                              ? "border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-600/20"
                              : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/50 shadow-sm"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-3 transition-all ${
                              isSelected
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-700"
                            }`}
                          >
                            {opt.label}
                          </div>

                          <div className="w-full aspect-square flex items-center justify-center bg-white rounded-lg border border-slate-100 p-2 shadow-inner mb-2">
                            <img
                              src={opt.image}
                              alt={`Pilihan ${opt.label}`}
                              className="max-h-16 md:max-h-20 w-auto object-contain select-none"
                            />
                          </div>

                          <div className="h-6 flex items-center justify-center w-full">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-black text-purple-700 uppercase">
                                <Check size={13} strokeWidth={3} /> Terpilih
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600">
                                Pilih {opt.label}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FOOTER ACTION BUTTONS */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={handlePrevStep}
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ChevronLeft size={16} />
              {activeIdx > 0
                ? "Soal Sebelumnya"
                : !isSubtest1
                ? "Kembali ke Bagian Sebelumnya"
                : "Kembali ke Dashboard"}
            </button>

            <button
              onClick={handleNextStep}
              disabled={!isQuestionAnswered}
              className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                isQuestionAnswered
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20 cursor-pointer"
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              }`}
            >
              {isSubtest1 ? (
                isSubtest1AllDone || isLastQuestionInSubtest ? (
                  <>
                    Lanjut <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Soal Selanjutnya <ArrowRight size={16} />
                  </>
                )
              ) : isSubtest2 ? (
                isSubtest2AllDone || isLastQuestionInSubtest ? (
                  <>
                    Lanjut <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Soal Selanjutnya <ArrowRight size={16} />
                  </>
                )
              ) : isLastQuestionInSubtest ? (
                <>
                  Selesai <Check size={16} />
                </>
              ) : (
                <>
                  Soal Selanjutnya <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* POP UP INFORMASI INSTRUKSI PENGERJAAN */}
      {showInstructionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowInstructionModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                    Petunjuk Pengerjaan
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {isSubtest2 ? "Pilih 2 Jawaban (A - E)" : "Pilih 1 Jawaban (A - F)"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructionModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup Petunjuk"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 max-h-[60vh] overflow-y-auto">
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                {currentQuestion.instruction}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInstructionModal(false)}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
