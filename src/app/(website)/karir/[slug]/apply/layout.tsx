"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SidebarSteps from "@/app/components/career/SidebarSteps";
import { ApplyProvider } from "./ApplyContext";

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params?.slug ?? "";
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/job-openings/${slug}`);
        if (!res.ok) throw new Error("Job not found");
        const data = await res.json();
        setJob(data);
      } catch (e) {
        console.error("Failed to load job", e);
        // optional: redirect back
        // router.push("/karir");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [slug, router]);

  return (
    <ApplyProvider>
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
            <div>
              <div className="text-sm text-slate-500">Melamar</div>
              <div className="text-lg font-bold">{job?.title || (loading ? "Memuat..." : "Lowongan")}</div>
              {job?.company && <div className="text-sm text-slate-400">{job.company}</div>}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1 hidden md:block">
              <SidebarSteps />
            </div>

            <div className="col-span-1 md:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-6">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </ApplyProvider>
  );
}
