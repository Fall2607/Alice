import React from "react";

import {
  Stethoscope,
  HeartPulse,
  FlaskConical,
  BedDouble,
  Baby,
  Eye,
  Scissors,
  Bone,
  Brain,
  Ear,
  HeartHandshake,
  BrainCircuit,
  Droplets,
  Accessibility,
} from "lucide-react";

const ToothIcon = (props: React.SVGProps<SVGSVGElement>) =>
  React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...props,
    },
    React.createElement("path", {
      d: "M12 2c-2.5 0-5 1-6.5 3S4 9 4 12c0 3.5 1.5 6 3 8 .5.7 1.2 1 2 1 .8 0 1.5-.4 2-1 .7-.8 1-2 1-3s.3-2.2 1-3c.7.8 1 2 1 3s.3 2.2 1 3c.5.6 1.2 1 2 1 .8 0 1.5-.3 2-1 1.5-2 3-4.5 3-8 0-3-.5-5.5-1.5-7S14.5 2 12 2z",
    })
  );
// Data Layanan Lengkap
export const allServices = [
  {
    icon: Baby,
    title: "Poli Anak",
    description: "Layanan kesehatan terpadu untuk buah hati Anda.",
  },
  {
    icon: ToothIcon,
    title: "Poli Gigi & Mulut",
    description: "Solusi lengkap untuk kesehatan gigi, gusi, dan mulut.",
  },
  {
    icon: Scissors,
    title: "Poli Bedah",
    description: "Tindakan bedah umum dan spesialis oleh tim ahli.",
  },
  {
    icon: HeartPulse,
    title: "Poli Jantung",
    description: "Penanganan komprehensif untuk kesehatan jantung.",
  },
  {
    icon: Eye,
    title: "Poli Mata",
    description: "Pemeriksaan dan penanganan berbagai penyakit mata.",
  },
  {
    icon: HeartHandshake,
    title: "Poli Obgyn",
    description: "Kesehatan ibu dan anak selama kehamilan dan persalinan.",
  },
  {
    icon: Bone,
    title: "Poli Orthopedi",
    description: "Penanganan cedera dan kelainan pada tulang dan sendi.",
  },
  {
    icon: BrainCircuit,
    title: "Poli Psikiatri",
    description: "Layanan kesehatan jiwa untuk semua kalangan.",
  },
  {
    icon: Brain,
    title: "Poli Saraf",
    description: "Diagnosis dan perawatan gangguan sistem saraf.",
  },
  {
    icon: Droplets,
    title: "Poli Urologi",
    description: "Penanganan masalah pada saluran kemih dan reproduksi.",
  },
  {
    icon: Ear,
    title: "Poli THT",
    description: "Layanan untuk keluhan telinga, hidung, dan tenggorokan.",
  },
  {
    icon: Stethoscope,
    title: "Poli Penyakit Dalam",
    description: "Penanganan berbagai penyakit organ dalam.",
  },
  {
    icon: Droplets,
    title: "Unit Hemodialisa",
    description: "Fasilitas cuci darah dengan teknologi modern.",
  },
  {
    icon: Accessibility,
    title: "Rehabilitasi Medik",
    description: "Program pemulihan fungsi tubuh pasca cedera/sakit.",
  },
  {
    icon: FlaskConical,
    title: "Patologi Klinik (SPPK)",
    description: "Layanan laboratorium untuk diagnosis akurat.",
  },
  {
    icon: BedDouble,
    title: "Layanan Unggulan Lainnya",
    description: "Jelajahi semua layanan unggulan kami selengkapnya.",
  },
];
