// File: src/app/karir/[slug]/apply/step6/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  User, Phone, Briefcase, GraduationCap, Users, FileText, 
  CheckCircle, Edit2, Heart, School, BookOpen, ChevronDown, 
  ChevronUp, ArrowLeft, Send, AlertCircle, Clock, MapPin, Loader2, Paperclip
} from "lucide-react";
import { useApply } from "../ApplyContext";
import { showSuccessToast, showErrorToast } from "@/app/components/admin/Alert"; // Pastikan path benar

// Helper untuk format tanggal
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch (e) { return dateStr; }
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
          {isOpen ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
        </div>
      </div>
      {isOpen && <div className="p-6 animate-in slide-in-from-top-2 fade-in duration-200">{children}</div>}
    </div>
  );
};

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
  const { state, resetAll } = useApply();
  
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleSubmit = async () => {
    // 1. Validasi Dasar
    if (!state.identity.fullName) {
      showErrorToast("Data identitas belum lengkap. Silakan cek kembali.");
      return;
    }

    if (!isAgreed) {
      showErrorToast("Anda harus menyetujui pernyataan kebenaran data.");
      return;
    }

    setIsSubmitting(true);

    try {
        // --- 2. UPLOAD DOKUMEN UTAMA ---
        const uploadedDocs = [];
        const docKeys = Object.keys(state.documents) as Array<keyof typeof state.documents>;
        let hasError = false;

        for (const key of docKeys) {
            const file = state.documents[key];
            if (file) {
                setLoadingText(`Mengupload ${key.toUpperCase()}...`);
                
                const formData = new FormData();
                formData.append("file", file);
                formData.append("type", key);

                const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });

                if (!uploadRes.ok) {
                    console.error(`Gagal upload ${key}`);
                    hasError = true;
                } else {
                    const uploadData = await uploadRes.json();
                    if (uploadData.success) {
                        uploadedDocs.push({ type: key, url: uploadData.url });
                    }
                }
            }
        }

        // --- 3. UPLOAD DOKUMEN TAMBAHAN ---
        const uploadedOtherDocs = [];
        if (state.otherDocuments.length > 0) {
            for (const doc of state.otherDocuments) {
                if (doc.file) {
                    setLoadingText(`Mengupload ${doc.name}...`);
                    const formData = new FormData();
                    formData.append("file", doc.file);
                    formData.append("type", "other");

                    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
                    
                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        if (uploadData.success) {
                            uploadedOtherDocs.push({ name: doc.name, url: uploadData.url });
                        }
                    }
                }
            }
        }

        if (hasError) {
            console.warn("Beberapa dokumen gagal diupload.");
        }

        // --- 4. KIRIM DATA KE DATABASE ---
        setLoadingText("Menyimpan data lamaran...");

        const payload = {
            jobSlug: slug, // ID Lowongan
            applicant: {
                ...state.identity,
                siblings: state.siblings,
                education: { 
                    formal: state.educationFormal, 
                    nonFormal: state.educationNonFormal 
                },
                experience: state.experiences,
            },
            documents: uploadedDocs, // Array URL dokumen utama
            otherDocuments: uploadedOtherDocs, // Array URL dokumen tambahan
            assessmentAnswers: state.assessmentAnswers // Objek jawaban assessment dari form
        };

        const applyRes = await fetch("/api/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const applyData = await applyRes.json();

        if (!applyRes.ok) {
            throw new Error(applyData.message || "Gagal menyimpan data lamaran.");
        }

        // 5. Sukses
        showSuccessToast("Lamaran Anda berhasil dikirim!");
        resetAll(); // Reset form context
        router.push("/karir"); // Redirect ke halaman utama karir

    } catch (error) {
        console.error("Submit Error:", error);
        showErrorToast(error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim lamaran.");
    } finally {
        setIsSubmitting(false);
        setLoadingText("");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-10">
      
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Konfirmasi Data</h2>
        <p className="text-slate-500 text-sm mt-1">Pastikan seluruh data sudah benar sebelum dikirim.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* IDENTITAS */}
        <ReviewSection title="Identitas Diri" icon={User} onEdit={() => router.push(`/karir/${slug}/apply`)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                <div className="space-y-1">
                    <DataRow label="Nama Lengkap" value={state.identity.fullName} />
                    <DataRow label="Email" value={state.identity.email} />
                    <DataRow label="No. WhatsApp" value={state.identity.whatsapp} />
                    <DataRow label="Tempat, Tgl Lahir" value={`${state.identity.birthPlace || '-'}, ${formatDate(state.identity.birthDate)}`} />
                </div>
                <div className="space-y-1">
                    <DataRow label="Agama" value={state.identity.religion} />
                    <DataRow label="Status" value={state.identity.maritalStatus} />
                    <DataRow label="No. KTP" value={state.identity.ktp} />
                    <DataRow label="Alamat" value={state.identity.address} />
                </div>
            </div>
        </ReviewSection>

        {/* KELUARGA */}
        <ReviewSection title="Data Keluarga" icon={Users} onEdit={() => router.push(`/karir/${slug}/apply/step2`)}>
            {state.identity.maritalStatus === "Kawin" && (
                <div className="mb-4 pb-4 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-blue-600 mb-2">PASANGAN</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                        <DataRow label="Nama" value={state.identity.spouseName} />
                        <DataRow label="No. HP" value={state.identity.spousePhone} />
                        <DataRow label="Jumlah Anak" value={state.identity.childrenCount} />
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <h4 className="text-xs font-bold text-slate-500 mb-2">AYAH</h4>
                    <p className="text-sm font-bold">{state.identity.fatherName || "-"}</p>
                    <p className="text-xs text-slate-500">{state.identity.fatherJob}</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-500 mb-2">IBU</h4>
                    <p className="text-sm font-bold">{state.identity.motherName || "-"}</p>
                    <p className="text-xs text-slate-500">{state.identity.motherJob}</p>
                </div>
            </div>
            {state.siblings.length > 0 ? (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 mb-2">SAUDARA ({state.siblings.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {state.siblings.map(s => (
                            <div key={s.id} className="text-xs bg-slate-50 p-2 rounded border border-slate-100">
                                <span className="font-bold">{s.name}</span> ({s.relation})
                            </div>
                        ))}
                    </div>
                </div>
            ) : <p className="text-xs text-slate-400 italic">Tidak ada saudara.</p>}
        </ReviewSection>

        {/* PENDIDIKAN */}
        <ReviewSection title="Pendidikan" icon={GraduationCap} onEdit={() => router.push(`/karir/${slug}/apply/step3`)}>
            {state.educationFormal.length > 0 ? (
                <div className="space-y-3">
                    {state.educationFormal.map(edu => (
                        <div key={edu.id} className="relative pl-4 border-l-2 border-blue-200">
                            <p className="text-sm font-bold">{edu.school}</p>
                            <p className="text-xs text-slate-500">{edu.yearFrom} - {edu.yearTo} {edu.ipk ? `• IPK: ${edu.ipk}` : ''}</p>
                        </div>
                    ))}
                </div>
            ) : <p className="text-xs text-slate-400">Tidak ada data pendidikan formal.</p>}
        </ReviewSection>

        {/* PENGALAMAN */}
        <ReviewSection title="Pengalaman Kerja" icon={Briefcase} onEdit={() => router.push(`/karir/${slug}/apply/step4`)}>
            {state.experiences.length > 0 ? (
                <div className="space-y-3">
                    {state.experiences.map(exp => (
                        <div key={exp.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex justify-between">
                                <p className="text-sm font-bold">{exp.position}</p>
                                <span className="text-xs bg-white px-2 rounded border">{exp.fromYear}-{exp.toYear}</span>
                            </div>
                            <p className="text-xs text-primary">{exp.company}</p>
                        </div>
                    ))}
                </div>
            ) : <p className="text-xs text-slate-400">Fresh Graduate / Belum ada pengalaman.</p>}
        </ReviewSection>

        {/* DOKUMEN */}
        <ReviewSection title="Dokumen" icon={FileText} onEdit={() => router.push(`/karir/${slug}/apply/step5`)}>
            {/* Dokumen Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {Object.entries(state.documents).map(([key, file]) => (
                    <div key={key} className={`flex items-center gap-2 p-2 rounded border ${file ? 'border-green-200 bg-green-50' : 'border-slate-100'}`}>
                        {file ? <CheckCircle size={16} className="text-green-600"/> : <AlertCircle size={16} className="text-slate-300"/>}
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase text-slate-600">{key}</p>
                            <p className="text-[10px] text-slate-400 truncate">{file ? file.name : "Kosong"}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dokumen Tambahan */}
            {state.otherDocuments.length > 0 && (
                <div className="border-t pt-3 mt-3">
                    <h4 className="text-xs font-bold text-slate-500 mb-2">DOKUMEN TAMBAHAN</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {state.otherDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-2 p-2 rounded border border-blue-100 bg-blue-50">
                                <Paperclip size={16} className="text-blue-600"/>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-700">{doc.name || "Tanpa Nama"}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{doc.file ? doc.file.name : "File belum dipilih"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </ReviewSection>

      </div>

      {/* FINAL ACTION */}
      <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-lg max-w-4xl mx-auto">
        <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${isAgreed ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white group-hover:border-primary'}`}>
                {isAgreed && <CheckCircle size={14} />}
            </div>
            <input type="checkbox" className="hidden" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
            <div className="text-sm text-slate-600">Saya menyatakan data yang saya berikan adalah benar, lengkap, dan dapat dipertanggungjawabkan.</div>
        </label>

        {/* Progress Bar */}
        {isSubmitting && (
            <div className="mt-4 animate-in fade-in">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Sedang memproses...</span>
                    <span>{loadingText}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse w-full"></div>
                </div>
            </div>
        )}

        <div className="flex gap-4 mt-6 pt-6 border-t border-slate-100">
            <button onClick={() => router.push(`/karir/${slug}/apply/step6`)} disabled={isSubmitting} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm disabled:opacity-50">
                <ArrowLeft size={18} /> Kembali
            </button>
            <button 
                onClick={handleSubmit} 
                disabled={!isAgreed || isSubmitting}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${isAgreed && !isSubmitting ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
                {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} />} 
                {isSubmitting ? "Mengirim..." : "Kirim Lamaran"}
            </button>
        </div>
      </div>

    </div>
  );
}