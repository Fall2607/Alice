"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header Minimalis */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#0173b6] rounded-md flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-100">
            A
          </div>
          <span className="font-black text-slate-800 tracking-tighter uppercase text-sm">
            Alice Assessment
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Secure Exam Environment
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">{children}</main>
    </div>
  );
}
