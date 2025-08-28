// File: app/tentang/page.tsx
"use client";

import PageBanner from "@/app/components/PageBanner"; // Path diubah menjadi alias absolut
import Image from "next/image";
import { Users, ShieldCheck, ClipboardCheck, TrendingUp } from "lucide-react";

// Data untuk nilai-nilai perusahaan diperbarui
const values = [
  {
    icon: ShieldCheck,
    title: "Berintegritas",
    description:
      "Pikiran, perkataan dan perbuatan sinergis baik di tempat 'Terang' maupun di tempat 'Gelap'.",
  },
  {
    icon: ClipboardCheck,
    title: "Bertanggung Jawab",
    description:
      "Bekerja mengutamakan hasil yang tuntas dan berkualitas dengan mengikuti arah dan proses kerja yang benar.",
  },
  {
    icon: Users,
    title: "Berkolaboratif",
    description:
      "Memiliki mental menghargai orang lain, berkomunikasi secara jelas dan menunjukan secara nyata tindakan kerjasama positif.",
  },
  {
    icon: TrendingUp,
    title: "Bertumbuh",
    description:
      "Aktif meningkatkan kemampuan diri dengan terus belajar, terbuka terhadap masukan, serta berani mengakui dan memperbaiki kesalahan.",
  },
];

export default function TentangPage() {
  return (
    <div className="bg-background">
      <PageBanner
        title="Tentang RSU Avisena"
        description="Mengenal lebih dekat komitmen kami dalam memberikan pelayanan kesehatan yang unggul dan terpercaya bagi masyarakat."
        imageUrl="/img/banner/banner-kami.jpg"
      />

      {/* Section Sejarah - DIPERBARUI */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative w-full h-80 md:h-full min-h-[400px] rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/img/banner/banner-kami.jpg"
                alt="Gedung RSU Avisena"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary-dark mb-4">
                Sejarah Kami
              </h2>
              <div className="text-slate-600 space-y-4">
                <p>
                  Ide RSU AVISENA telah dirintis sejak tahun 2007, di mana kami
                  melihat masih ada peluang untuk meningkatan pelayanan
                  kesehatan bagi masyarakat di Melong dan sekitarnya.
                </p>
                <p>
                  Bermula pada tahun 2010 dari sebuah Rumah Bersalin, Kebidanan,
                  Praktek Dokter Umum dan Spesialis Kebidanan. Lalu pada 2012,
                  pihak pengelola sepakat untuk meningkatkan status Rumah
                  Bersalin dan praktik dokter bersama AVISENA menjadi rumah
                  sakit dan mendapatkan ijin operasional sementara dari Walikota
                  Cimahi.
                </p>
                <p>
                  Terhitung tahun 2014, Rumah Sakit Umum Avisena mendapat ijin
                  operasional tetap dan ditetapkan oleh Kementrian Kesehatan
                  Republik Indonesia sebagai Rumah Sakit Swasta Tipe D. Pada
                  bulan Agustus 2014, kami bekerjasama dengan BPJS Kesehatan.
                </p>
                <p>
                  Peningkatan status ini menjadi titik awal bagi kami untuk
                  melayani segala lapisan masyarakat. Seiring dengan
                  perkembangan yang kami tingkatkan terus menerus, pada tahun
                  2020 RSU Avisena telah mendapatkan pengakuan sebagai Rumah
                  Sakit Umum tipe C, dan di tahun 2023, kami berhasil lulus
                  akreditasi dengan peringkat bintang lima atau "Paripurna".
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Visi & Misi */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary-dark mb-4">
            Visi & Misi
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-primary mb-3">Visi</h3>
              <p className="text-slate-600">
                Menjadi Rumah Sakit Swasta Pilihan Utama Masyarakat Cimahi dan
                Jawa Barat dalam Pelayanan dan Informasi Kesehatan.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold text-primary mb-3">Misi</h3>
              <ul className="text-slate-600 space-y-2 text-left list-decimal list-outside pl-5">
                <li>Melayani pasien dengan sepenuh hati secara profesional.</li>
                <li>
                  Terus bertumbuh dalam mental, prilaku, pengetahuan, dan
                  keterampilan yang berfokus kepada kebermanfaatan bagi orang
                  lain.
                </li>
                <li>
                  Berperan aktif pada program kesehatan Republik Indonesia dalam
                  meningkatkan derajat kesehatan masyarakat.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section Nilai-Nilai Kami */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-dark">
              Nilai-Nilai Kami
            </h2>
            <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
              Empat pilar utama yang menjadi landasan kami dalam melayani Anda.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background-soft text-primary-dark mb-4">
                  <value.icon className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-slate-500">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
