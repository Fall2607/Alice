"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import React from "react";

const steps = [
  { id: 1, label: "Identitas", href: "" },
  { id: 2, label: "Data Keluarga", href: "step2" },
  { id: 3, label: "Pendidikan", href: "step3" },
  { id: 4, label: "Pengalaman Kerja", href: "step4" },
  { id: 5, label: "Dokumen", href: "step5" },
  { id: 6, label: "Review & Submit", href: "step6" },
];

export default function SidebarSteps() {
  const pathname = usePathname() || "";
  const params = useParams();
  const base = `/karir/${params.slug}/apply`;
  // current step detection
  const cur = pathname.includes("/step6")
    ? 6
    : pathname.includes("/step5")
    ? 5
    : pathname.includes("/step4")
    ? 4
    : pathname.includes("/step3")
    ? 3
    : pathname.includes("/step2")
    ? 2
    : 1;

  return (
    <div className="sticky top-6">
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Langkah</h4>
        <div className="space-y-2">
          {steps.map((s) => {
            const active = s.id === cur;
            const done = s.id < cur;
            return (
              <Link key={s.id} href={s.href ? `${base}/${s.href}` : base} className="block">
                <div
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    active ? "bg-primary/10 border border-primary" : "hover:bg-slate-100"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      done ? "bg-primary text-white" : active ? "bg-primary/20 text-primary" : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {s.id}
                  </div>
                  <div className={`${active ? "text-slate-800 font-medium" : "text-slate-600"}`}>{s.label}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
