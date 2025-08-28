// File: app/karir/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Briefcase, MapPin, Clock } from "lucide-react";
import { jobOpenings } from "@/app/data/careers"; // Path diubah menjadi relatif
import Link from "next/link";
import PageBanner from "@/app/components/PageBanner"; // Path diubah menjadi relatif
import CareerFilter from "@/app/components/CareerFilter"; // Path diubah menjadi relatif

export default function CareerPage() {
  const [filters, setFilters] = useState({
    category: "Medis",
    positions: [] as string[],
  });

  const filteredJobs = useMemo(() => {
    return jobOpenings.filter((job) => {
      const categoryMatch = job.category === filters.category;
      const positionMatch =
        filters.positions.length === 0 ||
        filters.positions.includes(job.position);
      return categoryMatch && positionMatch;
    });
  }, [filters]);

  return (
    <div className="bg-background">
      <PageBanner
        title="Kembangkan Karir Anda Bersama Kami"
        description="Jadilah bagian dari tim profesional yang berdedikasi untuk memberikan pelayanan kesehatan terbaik. Temukan posisi yang tepat untuk Anda di RS Avisena."
        imageUrl="/img/banner/banner-karir.jpg"
      />

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Kolom Filter */}
            <div className="lg:col-span-1 mb-8 lg:mb-0">
              <CareerFilter onFilterChange={setFilters} />
            </div>

            {/* Kolom Daftar Lowongan */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  {filteredJobs.length} Lowongan Tersedia
                </h2>
                <div className="space-y-6">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => (
                      <div
                        key={index}
                        className="md:flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow duration-300"
                      >
                        <div>
                          <h3 className="text-xl font-bold text-primary">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mt-2">
                            <div className="flex items-center gap-2">
                              <Briefcase size={16} />
                              <span>{job.department}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={16} />
                              <span>{job.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={16} />
                              <span>{job.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <Link
                            href={job.link}
                            className="inline-block bg-primary text-white px-6 py-2 rounded-full hover:bg-secondary transition-colors font-semibold text-sm"
                          >
                            Lihat Detail
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500">
                        Tidak ada lowongan yang sesuai dengan filter Anda.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
