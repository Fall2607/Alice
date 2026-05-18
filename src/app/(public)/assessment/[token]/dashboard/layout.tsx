"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardGuardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams() as any;
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const urlToken = params?.token as string;
    const verifiedToken = sessionStorage.getItem("verified_token");

    if (!verifiedToken || verifiedToken !== urlToken) {
      sessionStorage.removeItem("verified_token");
      router.replace(`/assessment/${urlToken}`);
    } else {
      setIsAuthorized(true);
    }
  }, [params, router]);
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#fcfcfd]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0173b6] mb-4" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Memverifikasi Akses...
        </p>
      </div>
    );
  }
  return <>{children}</>;
}