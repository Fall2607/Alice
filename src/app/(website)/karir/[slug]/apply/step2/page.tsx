// File: src/app/karir/[slug]/apply/step2/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Users, Phone, Briefcase, User, Plus, Trash2,
  Heart, Link as LinkIcon, Search, ChevronDown, AlertCircle, ArrowRight, CalendarDays, ArrowLeft
} from "lucide-react";
import { useApply } from "../ApplyContext";

// --- COMPONENT: SEARCHABLE SELECT (Select2 Style) ---
const SearchableSelect = ({
  options, value, onChange, placeholder, icon: Icon
}: {
  options: { value: string, label: string }[], value: string, onChange: (val: string) => void, placeholder: string, icon?: any
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() =>
    options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]);

  const selectedLabel = options.find(opt => opt.value === value)?.label;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="group relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 group-focus-within:text-primary transition-colors">
        {placeholder}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-11 pr-10 py-3.5 rounded-xl border cursor-pointer flex items-center bg-white transition-all duration-200 ${isOpen ? 'border-primary ring-4 ring-primary/10' : 'border-slate-200 hover:border-slate-300'}`}
      >
        {Icon && <Icon className={`absolute left-4 transition-colors ${isOpen ? 'text-primary' : 'text-slate-400'}`} size={18} />}
        <span className={`text-sm font-medium ${selectedLabel ? 'text-slate-800' : 'text-slate-400'}`}>
          {selectedLabel || `${placeholder}`}
        </span>
        <ChevronDown className={`absolute right-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-slate-50 sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 text-slate-700 placeholder:text-slate-400 transition-all outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(""); }}
                  className={`px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${value === opt.value ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {opt.label}
                </div>
              ))
            ) : <div className="px-4 py-3 text-sm text-slate-400 text-center">Tidak ditemukan</div>}
          </div>
        </div>
      )}
    </div>
  );
};

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

export default function Step2Page() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { state, addSibling, updateSibling, removeSibling, setIdentityField } = useApply();

  // State untuk menyimpan ID item yang akan dihapus
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Ref untuk scroll otomatis ke item baru
  const siblingsListRef = useRef<HTMLDivElement>(null);
  const prevSiblingsCount = useRef(state.siblings.length);

  // Efek untuk scroll saat item bertambah
  useEffect(() => {
    if (state.siblings.length > prevSiblingsCount.current) {
      setTimeout(() => {
        if (siblingsListRef.current?.lastElementChild) {
          siblingsListRef.current.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
    prevSiblingsCount.current = state.siblings.length;
  }, [state.siblings.length]);

  const genderOptions = [
    { value: "Laki-laki", label: "Laki-laki" },
    { value: "Perempuan", label: "Perempuan" }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 relative">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="text-primary" size={28} /> Data Keluarga
        </h2>
        <p className="text-slate-500 text-sm mt-2">Lengkapi informasi mengenai orang tua dan saudara kandung Anda.</p>
      </div>

      <div className="space-y-10">

        {/* SECTION 1: ORANG TUA */}
        <section>
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-5 flex items-center gap-2 bg-primary/5 w-fit px-3 py-1 rounded-lg">
            <Heart size={14} /> Data Orang Tua
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ayah */}
            <div className="space-y-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all">
              <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shadow-sm">AYAH</span>
                Ayah Kandung
              </h4>
              <InputField label="Nama Lengkap" value={state.identity.fatherName} onChange={(e) => setIdentityField("fatherName", e.target.value)} icon={User} placeholder="Nama Ayah" />
              <InputField label="Pekerjaan" value={state.identity.fatherJob} onChange={(e) => setIdentityField("fatherJob", e.target.value)} icon={Briefcase} placeholder="Pekerjaan Saat Ini" />
              <InputField label="No. HP / Telepon" value={state.identity.fatherPhone} onChange={(e) => setIdentityField("fatherPhone", e.target.value)} icon={Phone} placeholder="08xxxxxxxxxx" type="tel" />
            </div>

            {/* Ibu */}
            <div className="space-y-4 bg-pink-50/50 p-6 rounded-2xl border border-pink-100 hover:border-pink-200 transition-all">
              <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold shadow-sm">IBU</span>
                Ibu Kandung
              </h4>
              <InputField label="Nama Lengkap" value={state.identity.motherName} onChange={(e) => setIdentityField("motherName", e.target.value)} icon={User} placeholder="Nama Ibu" />
              <InputField label="Pekerjaan" value={state.identity.motherJob} onChange={(e) => setIdentityField("motherJob", e.target.value)} icon={Briefcase} placeholder="Pekerjaan Saat Ini" />
              <InputField label="No. HP / Telepon" value={state.identity.motherPhone} onChange={(e) => setIdentityField("motherPhone", e.target.value)} icon={Phone} placeholder="08xxxxxxxxxx" type="tel" />
            </div>
          </div>
        </section>

        {/* SECTION 2: SAUDARA KANDUNG */}
        <section>
          {/* FIXED STICKY HEADER: Desain Glass Pill & Posisi Aman dari Header Utama */}
          <div className="flex justify-between items-center mb-6 sticky top-[150px] md:top-[140px] z-20 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm transition-all">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                <Users size={16} />
              </div>
              Saudara Kandung
            </h3>
            <button
              onClick={addSibling}
              className="text-xs font-bold bg-slate-800 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 shadow-lg shadow-slate-800/20 active:scale-95 group"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" /> <span className="hidden sm:inline">Tambah Data</span><span className="sm:hidden">Tambah</span>
            </button>
          </div>

          <div className="space-y-4 px-1" ref={siblingsListRef}>
            {state.siblings.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={addSibling}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Belum ada data saudara ditambahkan.</p>
                <p className="text-xs text-slate-400 mt-1">Klik tombol "Tambah" di atas untuk mengisi.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {state.siblings.map((s, index) => (
                  <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all relative group animate-in slide-in-from-bottom-2 duration-300">

                    {/* TOMBOL HAPUS (Mobile Friendly) */}
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => setDeleteId(s.id)}
                        className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shadow-sm"
                        title="Hapus Data"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-400 uppercase mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">{index + 1}</span>
                      Saudara
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-3">
                        <InputField label="Nama Lengkap" value={s.name} onChange={(e) => updateSibling(s.id, { name: e.target.value })} placeholder="Nama Saudara" icon={User} />
                      </div>
                      <div className="md:col-span-2">
                        <SearchableSelect placeholder="Gender" value={s.gender} onChange={(val) => updateSibling(s.id, { gender: val })} options={genderOptions} icon={Users} />
                      </div>
                      <div className="md:col-span-2">
                        <InputField label="Umur" value={s.age} onChange={(e) => updateSibling(s.id, { age: e.target.value })} placeholder="Thn" type="number" icon={CalendarDays} />
                      </div>
                      <div className="md:col-span-2">
                        <InputField label="Hubungan" value={s.relation} onChange={(e) => updateSibling(s.id, { relation: e.target.value })} placeholder="Kakak/Adik" icon={LinkIcon} />
                      </div>
                      <div className="md:col-span-3">
                        <InputField label="Pekerjaan" value={s.job} onChange={(e) => updateSibling(s.id, { job: e.target.value })} placeholder="Pekerjaan" icon={Briefcase} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* MODAL KONFIRMASI HAPUS */}
        {deleteId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Data?</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Yakin ingin menghapus data saudara ini?
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => { if (deleteId) { removeSibling(deleteId); setDeleteId(null); } }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
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
            onClick={() => router.push(`/karir/${slug}/apply`)}
            className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-2 group text-sm"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali
          </button>
          <button
            onClick={() => router.push(`/karir/${slug}/apply/step3`)}
            className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center gap-2 group text-sm"
          >
            Lanjut ke Pendidikan <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}