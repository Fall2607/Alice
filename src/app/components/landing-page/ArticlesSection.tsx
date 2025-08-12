// File: app/components/landing-page/ArticlesSection.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Data Artikel Mockup diperbarui dengan tanggal
const articles = [
  {
    category: "Gaya Hidup Sehat",
    date: "12 Agu 2025",
    title: "5 Tips Menjaga Kesehatan Jantung di Usia Muda",
    excerpt:
      "Kesehatan jantung bukan hanya untuk lansia. Mulailah kebiasaan baik sejak dini untuk investasi masa depan yang lebih sehat.",
    image: "https://placehold.co/600x400/84c1ba/05445e?text=Artikel+1",
    link: "/artikel/menjaga-kesehatan-jantung",
  },
  {
    category: "Kesehatan Anak",
    date: "10 Agu 2025",
    title: "Pentingnya Imunisasi Lengkap untuk Si Kecil",
    excerpt:
      "Ketahui jadwal imunisasi dan manfaatnya untuk melindungi anak Anda dari berbagai penyakit berbahaya.",
    image: "https://placehold.co/600x400/b0e7e1/05445e?text=Artikel+2",
    link: "/artikel/pentingnya-imunisasi",
  },
  {
    category: "Info Medis",
    date: "08 Agu 2025",
    title: "Mengenal Gejala Awal Diabetes dan Cara Pencegahannya",
    excerpt:
      "Diabetes seringkali datang tanpa disadari. Kenali tanda-tandanya dan langkah pencegahan yang bisa Anda lakukan.",
    image: "https://placehold.co/600x400/c5d8c9/05445e?text=Artikel+3",
    link: "/artikel/gejala-diabetes",
  },
];

export default function ArticlesSection() {
  return (
    <section id="articles" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-slate-800">
              Artikel Kesehatan Terbaru
            </h2>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Dapatkan informasi dan tips kesehatan terpercaya dari para ahli
              kami.
            </p>
          </div>
          <Link
            href="/artikel"
            className="hidden md:flex items-center text-primary font-semibold hover:text-secondary transition-colors"
          >
            Lihat Semua Artikel <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Link
              href={article.link}
              key={index}
              className="block bg-white rounded-lg shadow-lg overflow-hidden group"
            >
              <div className="relative h-56">
                <Image
                  src={article.image}
                  alt={`Gambar untuk artikel ${article.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                  unoptimized={true}
                />
              </div>
              <div className="p-6 flex flex-col">
                <div className="flex items-center text-sm mb-2">
                  <p className="text-primary font-semibold">
                    {article.category}
                  </p>
                  <span className="mx-2 text-gray-400">&bull;</span>
                  <p className="text-gray-500">{article.date}</p>
                </div>
                <h3 className="text-xl font-bold text-primary-dark mb-3 group-hover:text-secondary transition-colors">
                  {article.title}
                </h3>
                <p className="text-text-muted text-sm flex-grow">
                  {article.excerpt}
                </p>
                <div className="mt-4 text-sm font-semibold text-primary group-hover:text-secondary transition-colors flex items-center">
                  Baca Selengkapnya
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12 md:hidden">
          <Link
            href="/artikel"
            className="text-primary font-semibold hover:text-secondary transition-colors inline-flex items-center"
          >
            Lihat Semua Artikel <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
