// File: app/karir/[slug]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { jobOpenings } from "@/app/data/careers"; // Path diubah kembali menjadi alias absolut
import Link from "next/link";
import { ArrowLeft, Briefcase, MapPin, Clock, CheckCircle } from "lucide-react";

export default function CareerDetailPage() {
  const params = useParams<{ slug: string }>();

  // Mencari pekerjaan yang sesuai berdasarkan slug dari URL
  const job = jobOpenings.find((job) => job.link === `/karir/${params.slug}`);

  // Tampilan jika pekerjaan tidak ditemukan
  if (!job) {
    return (
      <div className="container mx-auto px-6 py-40 text-center">
        <h1 className="text-3xl font-bold text-primary-dark">
          Lowongan Tidak Ditemukan
        </h1>
        <p className="text-slate-600 mt-4">
          Maaf, lowongan pekerjaan yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/karir"
          className="mt-8 inline-block bg-primary text-white px-6 py-3 rounded-full hover:bg-secondary transition-colors font-semibold"
        >
          Kembali ke Halaman Karir
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Tombol Kembali */}
          <Link
            href="/karir"
            className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors mb-8 font-semibold"
          >
            <ArrowLeft size={18} />
            Kembali ke Semua Lowongan
          </Link>

          {/* Header Detail Pekerjaan */}
          <div className="border-b pb-6 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-dark">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 mt-4">
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

          {/* Deskripsi Pekerjaan */}
          <div className="prose max-w-none text-slate-600">
            <h3 className="text-xl font-semibold text-slate-800">
              Deskripsi Pekerjaan
            </h3>
            <p>
              Kami mencari seorang {job.title} yang berdedikasi dan profesional
              untuk bergabung dengan tim kami di departemen {job.department}.
              Anda akan bertanggung jawab untuk memberikan pelayanan terbaik
              sesuai dengan standar RSU Avisena.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6">
              Kualifikasi
            </h3>
            <ul className="space-y-2">
              <li>Pendidikan minimal D3/S1 di bidang terkait.</li>
              <li>
                Memiliki Surat Tanda Registrasi (STR) yang masih berlaku (jika
                diperlukan).
              </li>
              <li>Berpengalaman di bidangnya minimal 1-2 tahun.</li>
              <li>
                Mampu bekerja dalam tim, komunikatif, dan berorientasi pada
                pasien.
              </li>
              <li>Bersedia bekerja dalam sistem shift.</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6">
              Tanggung Jawab
            </h3>
            <ul className="space-y-2">
              <li>
                Melakukan tugas sesuai dengan standar operasional prosedur
                (SOP).
              </li>
              <li>
                Memberikan pelayanan yang ramah dan informatif kepada pasien.
              </li>
              <li>
                Berkolaborasi dengan tim medis lain untuk penanganan pasien yang
                optimal.
              </li>
              <li>Menjaga kerahasiaan dan keamanan data medis pasien.</li>
            </ul>
          </div>

          {/* Tombol Lamar */}
          <div className="mt-10 pt-6 border-t">
            <a
              href="#"
              className="w-full md:w-auto text-center bg-primary text-white px-8 py-3 rounded-full hover:bg-secondary transition-colors font-bold text-lg"
            >
              Lamar Sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
