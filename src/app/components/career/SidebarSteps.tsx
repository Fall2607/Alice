"use client";

import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Definisi tipe data untuk props yang diterima
interface Step {
  id: number;
  label: string;
  path: string;
}

interface SidebarStepsProps {
  currentStep: number;
  steps: Step[];
}

export default function SidebarSteps({ currentStep, steps }: SidebarStepsProps) {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <nav aria-label="Progress" className="px-4 py-6">
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.label} className={`relative ${stepIdx !== steps.length - 1 ? "pb-10" : ""}`}>
              {/* Garis Penghubung (Vertical Line) */}
              {stepIdx !== steps.length - 1 ? (
                <div
                  className={`absolute top-4 left-4 -ml-px h-full w-0.5 transition-colors duration-300 ${isComplete ? "bg-primary" : "bg-slate-200"
                    }`}
                  aria-hidden="true"
                />
              ) : null}

              <Link
                href={`/karir/${slug}/apply${step.path}`}
                className="group relative flex items-start"
              // Mencegah klik jika langkah tersebut belum tercapai (opsional, hapus pointer-events-none jika ingin bebas klik)
              // className={`group relative flex items-start ${!isComplete && !isCurrent ? 'pointer-events-none' : ''}`} 
              >
                <span className="flex h-9 items-center">
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${isComplete
                      ? "bg-primary group-hover:bg-primary-dark"
                      : isCurrent
                        ? "border-2 border-primary bg-white shadow-[0_0_0_4px_rgba(var(--primary),0.1)]"
                        : "border-2 border-slate-200 bg-white group-hover:border-slate-300"
                      }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : isCurrent ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-200 group-hover:bg-slate-300" />
                    )}
                  </span>
                </span>
                <span className="ml-4 flex min-w-0 flex-col pt-1.5">
                  <span
                    className={`text-sm font-bold tracking-wide transition-colors duration-200 ${isCurrent ? 'text-primary' : isComplete ? 'text-slate-700' : 'text-slate-400'
                      }`}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-slate-500 font-medium animate-in fade-in">Sedang diisi...</span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}