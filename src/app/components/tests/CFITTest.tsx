"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  Check,
  HelpCircle,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Brain,
  Layers
} from "lucide-react";
import { cfitQuestions, CFITOptionLetter } from "@/app/data/tests/cfitData";

interface CFITProps {
  questionIdx?: number;
  answers: Record<string, CFITOptionLetter>;
  setAnswers: (val: Record<string, CFITOptionLetter>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function CFITTestContent({
  questionIdx = 0,
  answers,
  setAnswers,
  onNext,
  onBack,
}: CFITProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const currentQuestion = cfitQuestions[questionIdx] || cfitQuestions[0];
  const selectedOption = answers[currentQuestion.id] || null;

  const handleSelectOption = (label: CFITOptionLetter) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: label,
    });
  };

  const handleReset = () => {
    const updated = { ...answers };
    delete updated[currentQuestion.id];
    setAnswers(updated);
    setShowExplanation(false);
  };

  const isCorrect = selectedOption === currentQuestion.correctAnswer;

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-4xl mx-auto pb-24 px-4 md:px-0 font-sans">
      {/* Top Navigation & Info Header */}
      <div className="mb-8 px-1 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1.5">
              <Brain size={12} /> CFIT Subtes 1
            </span>
            {currentQuestion.isExample && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-amber-200">
                Latihan / Contoh Soal
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
            {currentQuestion.title} — Pola Seri Gambar
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">
            {currentQuestion.subtestTitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedOption && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 font-bold transition-colors px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
            >
              <RotateCcw size={13} /> Reset Pilihan
            </button>
          )}
        </div>
      </div>

      {/* Petunjuk Pengerjaan */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white border border-purple-100 rounded-2xl p-4 md:p-5 mb-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <HelpCircle size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 mb-1">
              Petunjuk Soal
            </h3>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
              {currentQuestion.instruction}
            </p>
          </div>
        </div>
      </div>

      {/* KARTU GAMBAR SOAL UTAMA */}
      <div className="bg-white rounded-2xl border-2 border-slate-200/80 p-5 md:p-8 shadow-sm mb-8 overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-purple-600" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-700">
              Deretan Gambar Soal:
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Kotak 1 ➔ Kotak 2 ➔ Kotak 3 ➔ [ ? ]
          </span>
        </div>

        {/* Gambar Soal */}
        <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-slate-50/70 rounded-xl border border-dashed border-slate-300">
          <div className="relative max-w-full overflow-hidden rounded-lg bg-white p-3 md:p-5 shadow-sm border border-slate-200">
            <img
              src={currentQuestion.questionImage}
              alt="CFIT Soal Deret Pola"
              className="max-h-36 md:max-h-48 w-auto object-contain mx-auto select-none pointer-events-none"
            />
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-3 text-center">
            Amati perubahan orientasi atau bentuk dari kotak 1 ke kotak 3 untuk menentukan kotak ke-4.
          </p>
        </div>
      </div>

      {/* KARTU PILIHAN JAWABAN (A - F) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-8 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <span className="text-xs font-black uppercase tracking-widest text-slate-800">
            Pilih Salah Satu Jawaban (A - F):
          </span>
          <span className="text-[11px] font-bold text-slate-400">
            {selectedOption ? `Pilihan: Opsi ${selectedOption}` : "Belum memilih"}
          </span>
        </div>

        {/* GRID PILIHAN A-F */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt.label;

            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleSelectOption(opt.label)}
                className={`relative flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all active:scale-95 group text-center cursor-pointer ${
                  isSelected
                    ? "border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-600/20"
                    : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/50 shadow-sm"
                }`}
              >
                {/* Badge Huruf Opsi */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-3 transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-700"
                  }`}
                >
                  {opt.label}
                </div>

                {/* Gambar Opsi */}
                <div className="w-full aspect-square flex items-center justify-center bg-white rounded-lg border border-slate-100 p-2 shadow-inner mb-2">
                  <img
                    src={opt.image}
                    alt={`Pilihan ${opt.label}`}
                    className="max-h-16 md:max-h-20 w-auto object-contain select-none"
                  />
                </div>

                {/* Indikator Terpilih */}
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

      {/* FEEDBACK & PENJELASAN (KHUSUS CONTOH SOAL / LATIHAN) */}
      {selectedOption && currentQuestion.isExample && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm mb-8 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                  <Lightbulb size={24} />
                </div>
              )}
              <div>
                <h4 className="text-sm font-black uppercase text-slate-800">
                  {isCorrect
                    ? `Pilihan Anda (Opsi ${selectedOption}) Benar!`
                    : `Anda memilih Opsi ${selectedOption}`}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {isCorrect
                    ? "Jawaban Anda cocok dengan kunci jawaban resmi CFIT Subtes 1 Contoh 1."
                    : `Kunci jawaban yang tepat untuk soal ini adalah Opsi ${currentQuestion.correctAnswer}.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs font-black text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5 self-end sm:self-auto"
            >
              <Sparkles size={14} />
              {showExplanation ? "Sembunyikan Pembahasan" : "Lihat Pembahasan Lengkap"}
            </button>
          </div>

          {showExplanation && (
            <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100 text-xs md:text-sm text-slate-700 leading-relaxed font-medium animate-in fade-in">
              <strong className="block text-purple-900 font-bold mb-1">
                Pembahasan Logika Pola:
              </strong>
              {currentQuestion.explanation}
            </div>
          )}
        </div>
      )}

      {/* FOOTER ACTION BUTTONS */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
        >
          <ChevronLeft size={16} /> Kembali ke Dashboard
        </button>

        <button
          onClick={onNext}
          disabled={!selectedOption}
          className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
            selectedOption
              ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`}
        >
          Selesai Latihan <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
