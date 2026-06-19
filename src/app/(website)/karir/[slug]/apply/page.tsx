// File: src/app/karir/[slug]/apply/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  User, Mail, Phone, MapPin, Calendar, CreditCard, 
  Heart, Users, ChevronRight, Search, ChevronDown, Map, ArrowRight, Baby, Loader2, KeyRound
} from "lucide-react";
import { useApply } from "./ApplyContext";

// --- COMPONENT: SEARCHABLE SELECT (Select2 Style) ---
const SearchableSelect = ({ 
  options, value, onChange, placeholder, icon: Icon 
}: { 
  options: {value:string, label:string}[], value: string, onChange: (val: string) => void, placeholder: string, icon?: any 
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
        className={`w-full pl-11 pr-10 py-3.5 rounded-xl border cursor-pointer flex items-center bg-slate-50 hover:bg-white transition-all duration-200 ${isOpen ? 'border-primary ring-4 ring-primary/10 bg-white' : 'border-slate-200 hover:border-slate-300'}`}
      >
        {Icon && <Icon className={`absolute left-4 transition-colors ${isOpen ? 'text-primary' : 'text-slate-400'}`} size={18} />}
        <span className={`text-sm font-medium ${selectedLabel ? 'text-slate-800' : 'text-slate-400'}`}>
          {selectedLabel || `Pilih ${placeholder}`}
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

// --- COMPONENT: ICON INPUT ---
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

export default function Step1Page() {
  const router = useRouter();
  const params = useParams();
  const { state, setIdentityField, bulkSetData } = useApply();
  const slug = params?.slug as string;

  // --- OTP States ---
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  const handleSendOtp = async () => {
    if (!loginEmail) {
      setOtpError("Masukkan email Anda terlebih dahulu.");
      return;
    }
    setIsOtpLoading(true);
    setOtpError("");
    setOtpSuccess("");
    try {
      const res = await fetch("/api/candidate-auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpSent(true);
      setOtpSuccess(data.message);
    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setOtpError("Masukkan kode OTP.");
      return;
    }
    setIsOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/candidate-auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, otp: otpCode })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message);
      
      // Auto fill data
      const d = resData.data;
      const updates: any = {};

      if (d.identity) updates.identity = { ...state.identity, ...d.identity };
      if (d.siblings) updates.siblings = d.siblings;
      if (d.education?.formal) updates.educationFormal = d.education.formal;
      if (d.education?.nonFormal) updates.educationNonFormal = d.education.nonFormal;
      if (d.experience) updates.experiences = d.experience;
      if (d.existingDocs) updates.existingDocs = d.existingDocs;
      
      bulkSetData(updates);
      
      setOtpSuccess("Data berhasil dimuat! Silakan periksa kembali.");
      setTimeout(() => setShowOtpSection(false), 3000);
    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Options Data
  const religionOptions = [
    {value:"Islam",label:"Islam"},
    {value:"Protestan",label:"Kristen Protestan"},
    {value:"Katolik",label:"Kristen Katolik"},
    {value:"Hindu",label:"Hindu"},
    {value:"Buddha",label:"Buddha"},
    {value:"Khonghucu",label:"Khonghucu"},
    {value:"Lainnya",label:"Lainnya"}
  ];
  
  const maritalOptions = [
    {value:"Belum Kawin",label:"Belum Kawin"},
    {value:"Kawin",label:"Kawin"},
    {value:"Janda",label:"Janda"},
    {value:"Duda",label:"Duda"}
  ];

  const handleNext = () => {
    if (!state.identity.fullName) return alert("Nama lengkap wajib diisi");
    router.push(`/karir/${slug}/apply/step2`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      
      {/* OTP Banner */}
      {!showOtpSection && !otpSuccess && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h4 className="text-blue-800 font-bold text-sm">Pernah Melamar Sebelumnya?</h4>
                <p className="text-blue-600 text-xs mt-1">Masukkan email untuk memuat data riwayat Anda secara otomatis.</p>
            </div>
            <button 
                onClick={() => setShowOtpSection(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
            >
                Gunakan Data Lama
            </button>
        </div>
      )}

      {showOtpSection && (
        <div className="mb-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><KeyRound size={18} className="text-primary"/> Tarik Data Pelamar</h3>
                    <p className="text-xs text-slate-500 mt-1">Verifikasi email Anda untuk mengisi form ini secara otomatis.</p>
                </div>
                <button onClick={() => setShowOtpSection(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Tutup</button>
            </div>

            {otpError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">{otpError}</div>}
            {otpSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">{otpSuccess}</div>}

            {!otpSent ? (
                <div className="flex flex-col md:flex-row gap-3">
                    <input 
                        type="email" 
                        value={loginEmail} 
                        onChange={e => setLoginEmail(e.target.value)} 
                        placeholder="Masukkan alamat email Anda" 
                        className="flex-1 p-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <button 
                        onClick={handleSendOtp} 
                        disabled={isOtpLoading}
                        className="bg-primary text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 flex justify-center items-center gap-2 min-w-[120px]"
                    >
                        {isOtpLoading ? <Loader2 size={16} className="animate-spin" /> : "Kirim OTP"}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                        <input 
                            type="text" 
                            maxLength={4}
                            value={otpCode} 
                            onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                            placeholder="Masukkan 4 Digit Kode OTP" 
                            className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold tracking-widest text-center md:text-left"
                        />
                        <p className="text-[10px] text-slate-400 mt-1.5">Kode dikirim ke {loginEmail}</p>
                    </div>
                    <button 
                        onClick={handleVerifyOtp} 
                        disabled={isOtpLoading || otpCode.length < 4}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 h-fit md:h-auto min-w-[120px]"
                    >
                        {isOtpLoading ? <Loader2 size={16} className="animate-spin" /> : "Verifikasi"}
                    </button>
                </div>
            )}
        </div>
      )}

      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <User className="text-primary" size={28}/> Identitas Diri
        </h2>
        <p className="text-slate-500 text-sm mt-2">Lengkapi data diri Anda dengan benar sesuai KTP.</p>
      </div>

      <div className="space-y-8">
        {/* SECTION 1: BASIC INFO */}
        <section>
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2 bg-primary/5 w-fit px-3 py-1 rounded-lg">
                <CreditCard size={14}/> Informasi Dasar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <InputField label="Nama Lengkap & Gelar" value={state.identity.fullName} onChange={(e) => setIdentityField("fullName", e.target.value)} icon={User} placeholder="Contoh: Ahmad, S.Kom" required />
                </div>
                <InputField label="Tempat Lahir" value={state.identity.birthPlace} onChange={(e) => setIdentityField("birthPlace", e.target.value)} icon={MapPin} placeholder="Kota Kelahiran" />
                <InputField label="Tanggal Lahir" type="date" value={state.identity.birthDate} onChange={(e) => setIdentityField("birthDate", e.target.value)} icon={Calendar} placeholder="" />
                <InputField label="No. KTP (NIK)" type="number" value={state.identity.ktp} onChange={(e) => setIdentityField("ktp", e.target.value)} icon={CreditCard} placeholder="16 Digit NIK" />
                <InputField label="Suku Bangsa" value={state.identity.ethnicity} onChange={(e) => setIdentityField("ethnicity", e.target.value)} icon={Users} placeholder="Contoh: Sunda, Jawa" />
                
                {/* AGAMA */}
                <SearchableSelect 
                    placeholder="Agama" 
                    options={religionOptions} 
                    value={state.identity.religion} 
                    onChange={(v) => setIdentityField("religion", v)} 
                    icon={Heart} 
                />
                
                {/* STATUS PERNIKAHAN */}
                <SearchableSelect 
                    placeholder="Status Pernikahan" 
                    options={maritalOptions} 
                    value={state.identity.maritalStatus} 
                    onChange={(v) => setIdentityField("maritalStatus", v)} 
                    icon={Users} 
                />
            </div>
        </section>

        {/* --- CONDITIONAL SECTION: DATA PASANGAN --- */}
        {/* Hanya muncul jika status === "Kawin" */}
        {state.identity.maritalStatus === "Kawin" && (
            <section className="bg-blue-50/60 p-6 rounded-2xl border border-blue-100 animate-in slide-in-from-top-4 fade-in duration-300">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Heart size={14}/> Data Pasangan & Anak
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <InputField 
                            label="Nama Suami / Istri" 
                            value={state.identity.spouseName} 
                            onChange={(e) => setIdentityField("spouseName", e.target.value)} 
                            icon={User} 
                            placeholder="Nama Lengkap Pasangan" 
                            required 
                        />
                    </div>
                    <InputField 
                        label="Tempat Lahir Pasangan" 
                        value={state.identity.spouseBirthPlace} 
                        onChange={(e) => setIdentityField("spouseBirthPlace", e.target.value)} 
                        icon={MapPin} 
                        placeholder="Kota Kelahiran" 
                    />
                    <InputField 
                        label="Tanggal Lahir Pasangan" 
                        type="date" 
                        value={state.identity.spouseBirthDate} 
                        onChange={(e) => setIdentityField("spouseBirthDate", e.target.value)} 
                        icon={Calendar} 
                        placeholder="" 
                    />
                    <InputField 
                        label="Jumlah Anak" 
                        type="number" 
                        value={state.identity.childrenCount} 
                        onChange={(e) => setIdentityField("childrenCount", e.target.value)} 
                        icon={Baby} 
                        placeholder="0" 
                    />
                    <InputField 
                        label="No. HP Pasangan" 
                        type="tel" 
                        value={state.identity.spousePhone} 
                        onChange={(e) => setIdentityField("spousePhone", e.target.value)} 
                        icon={Phone} 
                        placeholder="08xxxxxxxxxx" 
                    />
                </div>
            </section>
        )}

        {/* SECTION 2: CONTACT INFO */}
        <section>
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2 bg-primary/5 w-fit px-3 py-1 rounded-lg">
                <Phone size={14}/> Kontak & Alamat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Email" type="email" value={state.identity.email} onChange={(e) => setIdentityField("email", e.target.value)} icon={Mail} placeholder="email@anda.com" required />
                <InputField label="No. WhatsApp" type="tel" value={state.identity.whatsapp} onChange={(e) => setIdentityField("whatsapp", e.target.value)} icon={Phone} placeholder="08xxxxxxxxxx" required />
                <div className="md:col-span-2 group">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 group-focus-within:text-primary transition-colors">Alamat Domisili</label>
                    <div className="relative">
                        <Map className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors duration-300" size={18} />
                        <textarea 
                            value={state.identity.address} 
                            onChange={(e) => setIdentityField("address", e.target.value)} 
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-sm font-medium text-slate-800 placeholder:text-slate-400 min-h-[100px] resize-none"
                            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* FOOTER NAVIGATION */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 mt-8">
          <button 
            onClick={() => router.push(`/karir/${slug}`)} 
            className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors text-sm"
          >
            Batal
          </button>
          <button 
            onClick={handleNext} 
            className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center gap-2 group"
          >
            Lanjut <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
          </button>
        </div>
      </div>
    </div>
  );
}