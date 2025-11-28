// File: src/app/karir/[slug]/apply/step4/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Briefcase, Plus, Trash2, ArrowRight, ArrowLeft, 
  Building2, MapPin, Clock, Calendar, FileText, HelpCircle, AlertCircle
} from "lucide-react";
import { useApply } from "../ApplyContext";

// --- COMPONENT: INPUT FIELD ---
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

// --- COMPONENT: TEXTAREA FIELD ---
const TextAreaField = ({ 
    label, value, onChange, icon: Icon, placeholder, required = false 
}: { 
    label: string, value: string, onChange: (e: any) => void, icon?: any, placeholder: string, required?: boolean 
}) => (
    <div className="group">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 group-focus-within:text-primary transition-colors">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && <Icon className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary transition-colors duration-300" size={18} />}
            <textarea 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                rows={3}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-sm font-medium text-slate-800 placeholder:text-slate-400 resize-none"
            />
        </div>
    </div>
);

export default function Step4Page() {
  const router = useRouter();
  const { state, addExperience, updateExperience, removeExperience } = useApply();
  const params = useParams();
  const slug = params?.slug as string;

  // State untuk konfirmasi hapus
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Refs untuk Auto Scroll
  const experiencesListRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(state.experiences.length);

  // Efek Auto Scroll saat tambah data
  useEffect(() => {
    if (state.experiences.length > prevCount.current) {
      setTimeout(() => {
        if (experiencesListRef.current?.lastElementChild) {
          experiencesListRef.current.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
    prevCount.current = state.experiences.length;
  }, [state.experiences.length]);

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 relative">
      
      {/* Header */}
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="text-primary" size={28}/> Pengalaman Kerja
        </h2>
        <p className="text-slate-500 text-sm mt-2">
            Ceritakan riwayat pekerjaan Anda. Jika <em>Fresh Graduate</em>, boleh dikosongkan atau isi dengan pengalaman magang.
        </p>
      </div>

      <div className="space-y-8">
        
        <section>
            {/* STICKY HEADER: Posisi Aman dari Header Utama (top-[180px]) */}
            <div className="flex justify-between items-center mb-6 sticky top-[150px] md:top-[140px] z-20 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm transition-all">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                        <Building2 size={16}/> 
                    </div>
                    Riwayat Pekerjaan
                </h3>
                <button 
                    onClick={addExperience} 
                    className="text-xs font-bold bg-slate-800 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 shadow-lg shadow-slate-800/20 active:scale-95 group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform"/> <span className="hidden sm:inline">Tambah Pengalaman</span><span className="sm:hidden">Tambah</span>
                </button>
            </div>

            {/* List Experience */}
            <div className="space-y-5 px-1" ref={experiencesListRef}>
                {state.experiences.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={addExperience}>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <Briefcase className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Belum ada pengalaman kerja ditambahkan.</p>
                        <p className="text-xs text-slate-400 mt-1">Tekan tombol "Tambah" di atas.</p>
                    </div>
                ) : (
                    state.experiences.map((exp, index) => (
                        <div key={exp.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all relative group animate-in slide-in-from-bottom-2 duration-300">
                            
                            {/* Tombol Hapus (Mobile Friendly) */}
                            <div className="absolute top-4 right-4 z-10">
                                <button 
                                    onClick={() => setDeleteId(exp.id)} 
                                    className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shadow-sm"
                                    title="Hapus Data"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <h4 className="text-xs font-extrabold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px]">{index + 1}</span> 
                                Pekerjaan {index + 1}
                            </h4>
                            
                            {/* Grid Input */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                                {/* Nama Instansi - 6 Kolom */}
                                <div className="lg:col-span-6">
                                    <InputField 
                                        label="Nama Instansi / Perusahaan" 
                                        value={exp.company} 
                                        onChange={(e)=> updateExperience(exp.id, { company: e.target.value })} 
                                        placeholder="Contoh: RS Sehat Sentosa"
                                        icon={Building2}
                                    />
                                </div>
                                
                                {/* Jabatan - 6 Kolom */}
                                <div className="lg:col-span-6">
                                    <InputField 
                                        label="Jabatan Terakhir" 
                                        value={exp.position} 
                                        onChange={(e)=> updateExperience(exp.id, { position: e.target.value })} 
                                        placeholder="Contoh: Perawat Pelaksana"
                                        icon={Briefcase}
                                    />
                                </div>

                                {/* Lokasi - 4 Kolom */}
                                <div className="lg:col-span-4">
                                    <InputField 
                                        label="Lokasi (Kota)" 
                                        value={exp.place} 
                                        onChange={(e)=> updateExperience(exp.id, { place: e.target.value })} 
                                        placeholder="Jakarta Selatan"
                                        icon={MapPin}
                                    />
                                </div>

                                {/* Lama Kerja - 4 Kolom */}
                                <div className="lg:col-span-4">
                                    <InputField 
                                        label="Lama Kerja" 
                                        value={exp.duration} 
                                        onChange={(e)=> updateExperience(exp.id, { duration: e.target.value })} 
                                        placeholder="Contoh: 2 Tahun 3 Bulan"
                                        icon={Clock}
                                    />
                                </div>

                                {/* Tahun - 2 Kolom x 2 */}
                                <div className="lg:col-span-2">
                                    <InputField 
                                        label="Dari Thn" 
                                        value={exp.fromYear} 
                                        onChange={(e)=> updateExperience(exp.id, { fromYear: e.target.value })} 
                                        placeholder="2018"
                                        type="number"
                                    />
                                </div>
                                <div className="lg:col-span-2">
                                    <InputField 
                                        label="Sampai Thn" 
                                        value={exp.toYear} 
                                        onChange={(e)=> updateExperience(exp.id, { toYear: e.target.value })} 
                                        placeholder="2021"
                                        type="number"
                                    />
                                </div>

                                {/* Alasan Resign - Full Width */}
                                <div className="lg:col-span-12 border-t border-slate-50 pt-2 mt-1">
                                    <TextAreaField 
                                        label="Alasan Berhenti" 
                                        value={exp.reasonLeave} 
                                        onChange={(e)=> updateExperience(exp.id, { reasonLeave: e.target.value })} 
                                        placeholder="Jelaskan alasan Anda berhenti bekerja..."
                                        icon={HelpCircle}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>

        {/* --- MODAL KONFIRMASI HAPUS --- */}
        {deleteId && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="text-red-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Data?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Yakin ingin menghapus data pengalaman kerja ini?
                        </p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Batal</button>
                            <button 
                                onClick={() => { removeExperience(deleteId); setDeleteId(null); }}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-600/20"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Footer Navigation */}
        <div className="flex justify-between pt-8 border-t border-slate-100 mt-12">
            <button 
                onClick={() => router.push(`/karir/${slug}/apply/step3`)} 
                className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-2 group text-sm"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Kembali
            </button>
            <button 
                onClick={() => router.push(`/karir/${slug}/apply/step5`)} 
                className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center gap-2 group text-sm"
            >
                Lanjut ke Dokumen <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
            </button>
        </div>

      </div>
    </div>
  );
}