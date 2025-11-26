// File: src/app/karir/[slug]/apply/step3/page.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  GraduationCap, Plus, Trash2, ArrowRight, ArrowLeft,
  School, BookOpen, Calendar, FileText, AlertCircle
} from "lucide-react";
import { useApply } from "../ApplyContext";

// --- COMPONENT: INPUT FIELD (Reusable) ---
const InputField = ({
  label, value, onChange, icon: Icon, placeholder, type = "text", required = false
}: {
  label: string, value: string, onChange: (e: any) => void, icon?: any, placeholder: string, type?: string, required?: boolean
}) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 group-focus-within:text-primary transition-colors">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors duration-300" size={18} />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-sm font-medium text-slate-800 placeholder:text-slate-400"
      />
    </div>
  </div>
);

export default function Step3Page() {
  const router = useRouter();
  const {
    state,
    addEducationFormal, updateEducationFormal, removeEducationFormal,
    addEducationNonFormal, updateEducationNonFormal, removeEducationNonFormal
  } = useApply();

  const params = useParams();
  const slug = params?.slug as string;

  // State lokal untuk konfirmasi hapus
  const [deleteFormalId, setDeleteFormalId] = React.useState<string | null>(null);
  const [deleteNonFormalId, setDeleteNonFormalId] = React.useState<string | null>(null);

  // Refs untuk auto-scroll
  const formalListRef = useRef<HTMLDivElement>(null);
  const nonFormalListRef = useRef<HTMLDivElement>(null);
  const prevFormalCount = useRef(state.educationFormal.length);
  const prevNonFormalCount = useRef(state.educationNonFormal.length);

  // Efek Auto-Scroll Formal
  useEffect(() => {
    if (state.educationFormal.length > prevFormalCount.current) {
      setTimeout(() => {
        if (formalListRef.current?.lastElementChild) {
          formalListRef.current.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
    prevFormalCount.current = state.educationFormal.length;
  }, [state.educationFormal.length]);

  // Efek Auto-Scroll Non-Formal
  useEffect(() => {
    if (state.educationNonFormal.length > prevNonFormalCount.current) {
      setTimeout(() => {
        if (nonFormalListRef.current?.lastElementChild) {
          nonFormalListRef.current.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
    prevNonFormalCount.current = state.educationNonFormal.length;
  }, [state.educationNonFormal.length]);

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 relative">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <GraduationCap className="text-primary" size={28} /> Riwayat Pendidikan
        </h2>
        <p className="text-slate-500 text-sm mt-2">Tambahkan riwayat pendidikan formal (sekolah/kuliah) dan non-formal (kursus/pelatihan).</p>
      </div>

      <div className="space-y-12">

        {/* --- SECTION 1: PENDIDIKAN FORMAL --- */}
        <section>
          {/* STICKY HEADER DESIGN BARU: 
               - Rounded-2xl agar tidak kotak kaku
               - Shadow-sm dan border tipis agar terlihat mengambang
               - Backdrop-blur agar transparan tapi tetap terbaca
               - Top offset disesuaikan agar tidak tertutup header utama
            */}
          <div className="flex justify-between items-center mb-6 sticky top-[110px] md:top-[140px] z-20 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm transition-all">
            <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                <School size={16} />
              </div>
              Pendidikan Formal
            </h3>
            <button
              onClick={addEducationFormal}
              className="text-xs font-bold bg-slate-800 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 shadow-lg shadow-slate-800/20 active:scale-95 group"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" /> <span className="hidden sm:inline">Tambah Sekolah</span><span className="sm:hidden">Tambah</span>
            </button>
          </div>

          <div className="space-y-5 px-1" ref={formalListRef}>
            {state.educationFormal.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={addEducationFormal}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <School className="h-8 w-8 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Belum ada data pendidikan formal.</p>
                <p className="text-xs text-slate-400 mt-1">Klik tombol "Tambah" di atas untuk mengisi.</p>
              </div>
            ) : (
              state.educationFormal.map((edu, index) => (
                <div key={edu.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all relative group animate-in slide-in-from-bottom-2 duration-300">

                  {/* Tombol Hapus (Mobile Friendly) */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => setDeleteFormalId(edu.id)}
                      className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shadow-sm"
                      title="Hapus Data"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-400 uppercase mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">{index + 1}</span>
                    Pendidikan Formal
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                    {/* Nama Sekolah - 6 Kolom */}
                    <div className="lg:col-span-6">
                      <InputField
                        label="Nama Sekolah / Universitas"
                        value={edu.school}
                        onChange={(e) => updateEducationFormal(edu.id, { school: e.target.value })}
                        placeholder="Contoh: Universitas Indonesia"
                        icon={School}
                      />
                    </div>

                    {/* Tahun Masuk - 3 Kolom */}
                    <div className="lg:col-span-3">
                      <InputField
                        label="Thn Masuk"
                        value={edu.yearFrom}
                        onChange={(e) => updateEducationFormal(edu.id, { yearFrom: e.target.value })}
                        placeholder="2015"
                        type="number"
                      />
                    </div>

                    {/* Tahun Keluar - 3 Kolom */}
                    <div className="lg:col-span-3">
                      <InputField
                        label="Thn Lulus"
                        value={edu.yearTo}
                        onChange={(e) => updateEducationFormal(edu.id, { yearTo: e.target.value })}
                        placeholder="2019"
                        type="number"
                      />
                    </div>

                    {/* No Ijazah - Full Width */}
                    <div className="lg:col-span-12 border-t border-slate-50 pt-2 mt-1">
                      <InputField
                        label="Nomor Ijazah"
                        value={edu.certificateNo}
                        onChange={(e) => updateEducationFormal(edu.id, { certificateNo: e.target.value })}
                        placeholder="Nomor Seri Ijazah"
                        icon={FileText}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* --- SECTION 2: PENDIDIKAN NON-FORMAL --- */}
        <section>
          {/* STICKY HEADER DESAIN BARU */}
          <div className="flex justify-between items-center mb-6 sticky top-[110px] md:top-[140px] z-20 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm transition-all">
            <h3 className="text-sm font-bold text-green-700 uppercase tracking-wider flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
                <BookOpen size={16} />
              </div>
              Non-Formal / Kursus
            </h3>
            <button
              onClick={addEducationNonFormal}
              className="text-xs font-bold bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm active:scale-95 group"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform text-green-600" /> <span className="hidden sm:inline">Tambah Kursus</span><span className="sm:hidden">Tambah</span>
            </button>
          </div>

          <div className="space-y-5 px-1" ref={nonFormalListRef}>
            {state.educationNonFormal.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                <p className="text-slate-400 text-xs">Tidak ada data pendidikan non-formal (Opsional).</p>
              </div>
            ) : (
              state.educationNonFormal.map((edu, index) => (
                <div key={edu.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-green-200 transition-all relative group animate-in slide-in-from-bottom-2 duration-300">

                  {/* Tombol Hapus (Mobile Friendly) */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => setDeleteNonFormalId(edu.id)}
                      className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shadow-sm"
                      title="Hapus Data"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-400 uppercase mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">{index + 1}</span>
                    Kursus / Pelatihan
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-6">
                      <InputField
                        label="Nama Lembaga / Kursus"
                        value={edu.school}
                        onChange={(e) => updateEducationNonFormal(edu.id, { school: e.target.value })}
                        placeholder="Contoh: English First"
                        icon={BookOpen}
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <InputField
                        label="Tahun Mulai"
                        value={edu.yearFrom}
                        onChange={(e) => updateEducationNonFormal(edu.id, { yearFrom: e.target.value })}
                        placeholder="Thn"
                        type="number"
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <InputField
                        label="Tahun Selesai"
                        value={edu.yearTo}
                        onChange={(e) => updateEducationNonFormal(edu.id, { yearTo: e.target.value })}
                        placeholder="Thn"
                        type="number"
                      />
                    </div>
                    <div className="lg:col-span-12 border-t border-slate-50 pt-2 mt-1">
                      <InputField
                        label="No. Sertifikat (Jika Ada)"
                        value={edu.certificateNo}
                        onChange={(e) => updateEducationNonFormal(edu.id, { certificateNo: e.target.value })}
                        placeholder="Nomor Sertifikat"
                        icon={FileText}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* --- MODAL KONFIRMASI HAPUS FORMAL --- */}
        {deleteFormalId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Data?</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Yakin ingin menghapus data pendidikan formal ini?
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setDeleteFormalId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Batal</button>
                  <button
                    onClick={() => { removeEducationFormal(deleteFormalId); setDeleteFormalId(null); }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-600/20"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL KONFIRMASI HAPUS NON-FORMAL --- */}
        {deleteNonFormalId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Data?</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Yakin ingin menghapus data kursus/pelatihan ini?
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setDeleteNonFormalId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Batal</button>
                  <button
                    onClick={() => { removeEducationNonFormal(deleteNonFormalId); setDeleteNonFormalId(null); }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-600/20"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER NAVIGATION */}
        <div className="flex justify-between pt-8 border-t border-slate-100 mt-12">
          <button
            onClick={() => router.push(`/karir/${slug}/apply/step2`)}
            className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-2 group text-sm"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali
          </button>
          <button
            onClick={() => router.push(`/karir/${slug}/apply/step4`)}
            className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center gap-2 group text-sm"
          >
            Lanjut ke Pengalaman <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}