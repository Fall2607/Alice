// File: src/app/karir/[slug]/apply/step6/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  User, Phone, Briefcase, GraduationCap, Users, FileText,
  CheckCircle, Edit2, Heart, School, BookOpen, ChevronDown,
  ChevronUp, ArrowLeft, Send, AlertCircle, Clock, MapPin
} from "lucide-react";
import { useApply } from "../ApplyContext";

// Helper untuk format tanggal
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

// Komponen Section Wrapper (ACCORDION)
const ReviewSection = ({
  title, icon: Icon, onEdit, children
}: {
  title: string; icon: any; onEdit?: () => void; children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
      <div
        className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm md:text-base">
          <Icon size={18} className="text-primary" /> {title}
        </h3>
        <div className="flex items-center gap-3">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-xs font-medium text-slate-500 hover:text-primary flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary bg-white transition-all shadow-sm active:scale-95"
            >
              <Edit2 size={12} /> Ubah
            </button>
          )}
          {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-6 animate-in slide-in-from-top-2 fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

// Komponen Baris Data
const DataRow = ({ label, value }: { label: string, value: string | undefined }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-2 border-b border-slate-50 last:border-0">
    <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide pt-0.5">{label}</dt>
    <dd className="text-sm font-medium text-slate-700 sm:col-span-2">{value || "-"}</dd>
  </div>
);

export default function Step6Page() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { state } = useApply();

  // State untuk Checkbox Persetujuan
  const [isAgreed, setIsAgreed] = useState(false);

  const handleSubmit = async () => {
    if (!state.identity.fullName) {
      alert("Data identitas belum lengkap!");
      return;
    }

    const payload = {
      jobSlug: slug,
      applicant: {
        ...state.identity,
        siblings: state.siblings,
        education: { formal: state.educationFormal, nonFormal: state.educationNonFormal },
        experience: state.experiences,
      },
      documents: Object.keys(state.documents).map(k => ({
        type: k,
        fileName: state.documents[k as keyof typeof state.documents]?.name
      }))
    };

    console.log("--- SUBMIT PAYLOAD ---");
    console.log(JSON.stringify(payload, null, 2));

    alert("Lamaran berhasil dikirim! Terima kasih.");
    // router.push("/karir/sukses");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-10">

      {/* Header Review */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Konfirmasi Data</h2>
        <p className="text-slate-500 text-sm mt-1">
          Pastikan seluruh data di bawah ini sudah benar. Klik bagian untuk melihat detail.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">

        {/* 1. IDENTITAS DIRI */}
        <ReviewSection
          title="Identitas Diri"
          icon={User}
          onEdit={() => router.push(`/karir/${slug}/apply`)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            <div className="space-y-1">
              <DataRow label="Nama Lengkap" value={state.identity.fullName} />
              <DataRow label="Email" value={state.identity.email} />
              <DataRow label="No. WhatsApp" value={state.identity.whatsapp} />
              <DataRow label="Tempat, Tgl Lahir" value={`${state.identity.birthPlace || '-'}, ${formatDate(state.identity.birthDate)}`} />
              <DataRow label="Suku Bangsa" value={state.identity.ethnicity} />
            </div>
            <div className="space-y-1">
              <DataRow label="Agama" value={state.identity.religion} />
              <DataRow label="Status Pernikahan" value={state.identity.maritalStatus} />
              <DataRow label="No. KTP (NIK)" value={state.identity.ktp} />
              <DataRow label="Alamat Domisili" value={state.identity.address} />
            </div>
          </div>
        </ReviewSection>

        {/* 2. DATA KELUARGA */}
        <ReviewSection
          title="Data Keluarga"
          icon={Users}
          onEdit={() => router.push(`/karir/${slug}/apply/step2`)}
        >
          {/* Pasangan */}
          {state.identity.maritalStatus === "Kawin" && (
            <div className="mb-6 pb-6 border-b border-slate-100">
              <h4 className="text-xs font-bold text-blue-600 uppercase mb-3 flex items-center gap-2 bg-blue-50 w-fit px-2 py-1 rounded">
                <Heart size={12} /> Pasangan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                <DataRow label="Nama Pasangan" value={state.identity.spouseName} />
                <DataRow label="No. HP Pasangan" value={state.identity.spousePhone} />
                <DataRow label="Jumlah Anak" value={state.identity.childrenCount} />
              </div>
            </div>
          )}

          {/* Orang Tua */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Ayah Kandung</h4>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">{state.identity.fatherName || "-"}</p>
                <p className="text-xs text-slate-500">{state.identity.fatherJob || "-"}</p>
                <p className="text-xs text-slate-500">{state.identity.fatherPhone || "-"}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Ibu Kandung</h4>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">{state.identity.motherName || "-"}</p>
                <p className="text-xs text-slate-500">{state.identity.motherJob || "-"}</p>
                <p className="text-xs text-slate-500">{state.identity.motherPhone || "-"}</p>
              </div>
            </div>
          </div>

          {/* Saudara */}
          {state.siblings.length > 0 ? (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Saudara Kandung</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {state.siblings.map((s, idx) => (
                  <div key={s.id} className="border border-slate-100 p-3 rounded-lg flex justify-between items-center bg-slate-50/50">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.relation} • {s.gender}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-600">{s.job}</p>
                      <p className="text-xs text-slate-400">{s.age} Thn</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <AlertCircle size={14} /> Tidak ada data saudara kandung.
            </div>
          )}
        </ReviewSection>

        {/* 3. PENDIDIKAN */}
        <ReviewSection
          title="Riwayat Pendidikan"
          icon={GraduationCap}
          onEdit={() => router.push(`/karir/${slug}/apply/step3`)}
        >
          <div className="space-y-6">
            {/* Formal */}
            <div>
              <h4 className="text-xs font-bold text-blue-600 uppercase mb-3 flex items-center gap-2">
                <School size={14} /> Formal
              </h4>
              {state.educationFormal.length > 0 ? (
                <div className="space-y-3">
                  {state.educationFormal.map((edu) => (
                    <div key={edu.id} className="relative pl-4 border-l-2 border-blue-100">
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-200"></div>
                      <p className="font-bold text-slate-800 text-sm">{edu.school}</p>
                      <p className="text-xs text-slate-500 mb-1">{edu.yearFrom} - {edu.yearTo}</p>
                      <p className="text-xs text-slate-400 bg-slate-50 inline-block px-2 py-0.5 rounded">No. Ijazah: {edu.certificateNo}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-slate-400 italic">Tidak ada data.</p>}
            </div>

            {/* Non Formal */}
            {state.educationNonFormal.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-green-600 uppercase mb-3 flex items-center gap-2">
                  <BookOpen size={14} /> Non-Formal
                </h4>
                <div className="space-y-3">
                  {state.educationNonFormal.map((edu) => (
                    <div key={edu.id} className="relative pl-4 border-l-2 border-green-100">
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-green-200"></div>
                      <p className="font-bold text-slate-800 text-sm">{edu.school}</p>
                      <p className="text-xs text-slate-500 mb-1">{edu.yearFrom} - {edu.yearTo}</p>
                      {edu.certificateNo && <p className="text-xs text-slate-400 bg-slate-50 inline-block px-2 py-0.5 rounded">Sertifikat: {edu.certificateNo}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ReviewSection>

        {/* 4. PENGALAMAN KERJA */}
        <ReviewSection
          title="Pengalaman Kerja"
          icon={Briefcase}
          onEdit={() => router.push(`/karir/${slug}/apply/step4`)}
        >
          {state.experiences.length > 0 ? (
            <div className="space-y-4">
              {state.experiences.map((exp) => (
                <div key={exp.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{exp.position}</h4>
                      <p className="text-xs font-medium text-primary">{exp.company}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-1 rounded border border-slate-200 shadow-sm">{exp.fromYear} - {exp.toYear}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {exp.place}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {exp.duration}</span>
                  </div>
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-lg italic border border-slate-100">
                    " {exp.reasonLeave} "
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500">Tidak memiliki pengalaman kerja (Fresh Graduate).</p>
            </div>
          )}
        </ReviewSection>

        {/* 5. DOKUMEN */}
        <ReviewSection
          title="Dokumen Pendukung"
          icon={FileText}
          onEdit={() => router.push(`/karir/${slug}/apply/step5`)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(state.documents).map(([key, file]) => (
              <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border ${file ? 'border-green-200 bg-green-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${file ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                  {file ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 uppercase">{key}</p>
                  <p className="text-[10px] text-slate-500 truncate">{file ? file.name : "Belum diupload"}</p>
                </div>
              </div>
            ))}
          </div>
        </ReviewSection>

      </div>

      {/* FINAL ACTION (Non-Sticky, Inline Bottom) */}
      <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-lg max-w-4xl mx-auto">

        {/* Checkbox Konfirmasi */}
        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${isAgreed ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white group-hover:border-primary'}`}>
            {isAgreed && <CheckCircle size={14} />}
          </div>
          <input
            type="checkbox"
            className="hidden"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <div className="text-sm text-slate-600">
            Saya menyatakan bahwa data yang saya berikan adalah benar, lengkap, dan dapat dipertanggungjawabkan keasliannya.
          </div>
        </label>

        <div className="flex gap-4 mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => router.push(`/karir/${slug}/apply/step5`)}
            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={18} /> Kembali
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isAgreed}
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${isAgreed ? 'bg-primary text-white hover:bg-primary-dark shadow-primary/25 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Send size={18} /> Kirim Lamaran
          </button>
        </div>
      </div>

    </div>
  );
}