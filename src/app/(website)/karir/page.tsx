// File: app/karir/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Briefcase, MapPin, Clock, Loader2, AlertCircle, ArrowRight, Calendar, Sparkles, Search } from "lucide-react";
import Link from "next/link";
import PageBanner from "@/app/components/PageBanner";
import CareerFilter from "@/app/components/CareerFilter";

// Interface sesuai struktur data dari API
interface JobOpening {
  id: number;
  title: string;
  category: string;
  status: string;
  posted_date: string;
  closing_date?: string;
  location?: string;
  type?: string;
  department?: string;
}

export default function CareerPage() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    category: "Semua",
    positions: [] as string[],
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  // 1. Fetch data dari API
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `${baseUrl}/job-openings?status=Published`;
        const res = await fetch(url);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Gagal memuat data (Status: ${res.status})`);
        }

        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Gagal memuat lowongan. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [baseUrl]);

  // 2. Filter data di sisi client
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Logika: Jika kategori "Semua", ambil semuanya. Jika tidak, cocokkan stringnya.
      const categoryMatch = filters.category === "Semua" || job.category === filters.category;

      const positionMatch =
        filters.positions.length === 0 ||
        (job.title && filters.positions.some(p => job.title.toLowerCase().includes(p.toLowerCase())));

      return categoryMatch && positionMatch;
    });
  }, [jobs, filters]);

  // Helper untuk cek apakah lowongan baru (<= 7 hari)
  const isNewJob = (dateString: string) => {
    if (!dateString) return false;
    const postDate = new Date(dateString);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return postDate >= sevenDaysAgo;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageBanner
        title="Kembangkan Karir Anda"
        description="Bergabunglah dengan tim profesional kami dan wujudkan potensi terbaik Anda di lingkungan kesehatan yang modern dan suportif."
        imageUrl="/img/banner/banner-karir.jpg"
      />

      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="lg:grid lg:grid-cols-4 lg:gap-10 items-start">

            {/* Kolom Filter (Sidebar) */}
            <div className="lg:col-span-1 mb-10 lg:mb-0 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-28">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Search size={18} className="text-primary" /> Filter Pencarian
                </h3>

                {/* UPDATE: Menambahkan prop 'jobs' agar filter bisa 
                   membuat list checkbox secara dinamis 
                */}
                <CareerFilter
                  currentFilters={filters}
                  onFilterChange={setFilters}
                  jobs={jobs}
                />

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                    <p className="font-semibold mb-1">Tips Karir</p>
                    <p className="opacity-80">Pastikan profil LinkedIn Anda diperbarui sebelum melamar.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Daftar Lowongan */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  {filteredJobs.length} Posisi Tersedia
                </h2>
                <div className="text-sm text-slate-500 hidden md:block">
                  Menampilkan peluang terbaru untuk Anda
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl h-48 animate-pulse border border-slate-200 shadow-sm">
                      <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 rounded-2xl p-8 text-center border border-red-200 shadow-sm">
                  <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                  <p className="text-red-700 font-medium">{error}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 text-sm text-primary hover:underline font-semibold">Coba Muat Ulang</button>
                </div>
              ) : filteredJobs.length > 0 ? (
                <div
                  className={`grid gap-6 ${filteredJobs.length === 1
                      ? 'grid-cols-1 max-w-2xl mx-auto'
                      : 'grid-cols-1 md:grid-cols-2'
                    }`}
                >
                  {filteredJobs.map((job) => (
                    <Link href={`/karir/${job.id}`} key={job.id} className="group block h-full">
                      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative h-full flex flex-col hover:-translate-y-1">

                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-primary/10 transition-colors border border-slate-100">
                            <Briefcase className="text-slate-400 group-hover:text-primary transition-colors" size={24} />
                          </div>
                          {isNewJob(job.posted_date) && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                              <Sparkles size={12} /> BARU
                            </span>
                          )}
                        </div>

                        <div className="mb-6 flex-grow">
                          <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {job.title}
                          </h3>
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <MapPin size={15} className="text-secondary shrink-0" />
                              <span>Bandung, Jawa Barat</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock size={15} className="text-secondary shrink-0" />
                              <span>Penuh Waktu</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Calendar size={15} className="text-secondary shrink-0" />
                              <span>
                                {job.posted_date
                                  ? new Date(job.posted_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
                                  : 'Baru saja'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                            {job.category || "Umum"}
                          </span>
                          <span className="text-sm font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                            Lihat Detail <ArrowRight size={16} />
                          </span>
                        </div>

                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                  <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Tidak Ditemukan</h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Maaf, tidak ada lowongan yang cocok dengan filter pencarian Anda saat ini.
                  </p>
                  <button
                    onClick={() => {
                      setFilters({ category: "Semua", positions: [] });
                    }}
                    className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors"
                  >
                    Reset Pencarian
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}