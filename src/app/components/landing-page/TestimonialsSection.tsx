// File: app/components/landing-page/TestimonialsSection.tsx
import Image from "next/image";

// Data Testimoni
const testimonials = [
  {
    quote:
      "Pelayanan di RS Avisena sangat memuaskan. Dokter dan perawatnya ramah dan sangat profesional.",
    name: "Ahmad Subagja",
    role: "Pasien",
    avatar: "https://placehold.co/100x100/a7f3d0/14532d?text=AS",
  },
  {
    quote:
      "Proses pendaftaran hingga konsultasi berjalan lancar dan cepat. Terima kasih RS Avisena!",
    name: "Siti Nurhaliza",
    role: "Pasien",
    avatar: "https://placehold.co/100x100/fecaca/7f1d1d?text=SN",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="tentang" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800">
            Apa Kata Mereka Tentang Kami
          </h2>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
            Kepuasan pasien adalah bukti nyata dari kualitas pelayanan kami.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
              <p className="text-text-muted italic mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center">
                <Image
                  src={testimonial.avatar}
                  alt={`Avatar of ${testimonial.name}`}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full mr-4 object-cover"
                  unoptimized={true}
                />
                <div>
                  <h4 className="font-bold text-slate-800">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
