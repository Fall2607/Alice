// File: app/components/PageBanner.tsx
"use client";

interface PageBannerProps {
  title: string;
  description: string;
  imageUrl: string;
}

export default function PageBanner({
  title,
  description,
  imageUrl,
}: PageBannerProps) {
  return (
    <section
      className="relative bg-cover bg-center py-20 text-white"
      style={{ backgroundImage: `url('${imageUrl}')` }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>{" "}
      {/* Overlay gelap untuk keterbacaan teks */}
      <div className="container relative z-10 mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-slate-200 max-w-3xl mx-auto">
          {description}
        </p>
      </div>
    </section>
  );
}
