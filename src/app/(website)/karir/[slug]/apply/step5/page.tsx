// File: src/app/karir/[slug]/apply/step5/page.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  FileText, Upload, Trash2, ArrowRight, ArrowLeft, 
  CheckCircle, AlertCircle, File, Image as ImageIcon, FileBadge, 
  Briefcase, Plus, Paperclip
} from "lucide-react";
import { useApply } from "../ApplyContext";

// Helper format file size... (Sama seperti sebelumnya)
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default function Step5Page() {
  const router = useRouter();
  const { state, setDocumentFile, addOtherDocument, updateOtherDocument, removeOtherDocument } = useApply();
  const params = useParams();
  const slug = params?.slug as string;

  // Refs untuk auto-scroll dokumen tambahan
  const otherDocsRef = useRef<HTMLDivElement>(null);
  
  // FIX: Gunakan optional chaining dan default value
  const otherDocs = state.otherDocuments || []; 
  const prevDocsCount = useRef(otherDocs.length);

  useEffect(() => {
    if (otherDocs.length > prevDocsCount.current) {
        setTimeout(() => otherDocsRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
    prevDocsCount.current = otherDocs.length;
  }, [otherDocs.length]);

  const fields: { 
    key: keyof typeof state.documents; 
    label: string; 
    desc: string;
    icon: any;
    required?: boolean;
  }[] = [
    { key: "cv", label: "Curriculum Vitae (CV)", desc: "Format PDF, Maks 2MB", icon: FileText, required: true },
    { key: "photo", label: "Pas Foto Terbaru", desc: "Format JPG/PNG, Ratio 3:4", icon: ImageIcon, required: true },
    { key: "ktp", label: "Scan KTP", desc: "KTP Asli, jelas terbaca", icon: FileBadge, required: true },
    { key: "ijazah", label: "Ijazah Terakhir", desc: "Scan asli / legalisir", icon: FileText, required: true },
    { key: "transkrip", label: "Transkrip Nilai", desc: "Scan asli / legalisir", icon: FileText, required: true },
    { key: "paklaring", label: "Paklaring (Surat Pengalaman)", desc: "Jika ada pengalaman kerja", icon: Briefcase }, 
    { key: "kk", label: "Kartu Keluarga", desc: "Scan KK terbaru", icon: FileText },
    { key: "str", label: "STR (Tenaga Medis)", desc: "Jika ada / Wajib bagi Medis", icon: FileBadge },
  ];

  const handleFileChange = (k: keyof typeof state.documents, f?: FileList | null) => {
    const file = f && f[0] ? f[0] : null;
    if (file && file.size > 2 * 1024 * 1024) return alert(`Ukuran file ${file.name} terlalu besar (Maks 2MB)`);
    setDocumentFile(k, file);
  };

  const handleOtherFileChange = (id: string, f?: FileList | null) => {
    const file = f && f[0] ? f[0] : null;
    if (file && file.size > 2 * 1024 * 1024) return alert(`Ukuran file terlalu besar`);
    updateOtherDocument(id, { file });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Upload className="text-primary" size={28}/> Upload Dokumen</h2>
        <p className="text-slate-500 text-sm mt-2">Unggah dokumen pendukung lamaran Anda.</p>
      </div>

      <div className="space-y-10">
        
        {/* --- DOKUMEN UTAMA --- */}
        <section>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">Dokumen Wajib & Pendukung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((f) => {
                    const file = state.documents[f.key];
                    const hasExisting = state.existingDocs?.[f.key];
                    const isUploaded = !!file || hasExisting;
                    
                    return (
                        <div key={f.key} className={`relative rounded-2xl border-2 transition-all duration-300 p-4 flex items-center gap-4 group ${isUploaded ? "bg-green-50/50 border-green-200" : "bg-white border-slate-200"}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isUploaded ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                                {isUploaded ? <CheckCircle size={24} /> : <f.icon size={24} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-bold text-sm truncate ${isUploaded ? "text-green-800" : "text-slate-700"}`}>{f.label} {f.required && <span className="text-red-500">*</span>}</p>
                                {file ? (
                                    <div><p className="text-xs text-green-600 truncate font-medium">{file.name}</p><p className="text-[10px] text-green-500/80">{formatFileSize(file.size)}</p></div>
                                ) : hasExisting ? (
                                    <div><p className="text-xs text-green-600 truncate font-medium">File Lama Tersimpan</p><p className="text-[10px] text-green-500/80">Tidak perlu upload ulang jika sama</p></div>
                                ) : <p className="text-xs text-slate-400">{f.desc}</p>}
                            </div>
                            <div className="shrink-0">
                                {file ? (
                                    <button onClick={() => setDocumentFile(f.key, null)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button>
                                ) : (
                                    <label className="cursor-pointer bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-primary transition-colors flex items-center gap-1">
                                        {hasExisting ? "Ganti File" : "Upload"} <input type="file" className="hidden" accept={f.key === 'photo' ? "image/*" : ".pdf,image/*"} onChange={(e) => handleFileChange(f.key, e.target.files)} />
                                    </label>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>

        {/* --- DOKUMEN TAMBAHAN (DINAMIS) --- */}
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                    <Paperclip size={16}/> Dokumen Tambahan
                </h3>
                <button onClick={addOtherDocument} className="text-xs font-bold bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                    <Plus size={14}/> Tambah File
                </button>
            </div>
            
            <div className="space-y-3" ref={otherDocsRef}>
                {otherDocs.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">Tambahkan sertifikat, portofolio, atau dokumen pendukung lainnya jika ada.</p>}
                
                {otherDocs.map((doc, idx) => (
                    <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm animate-in slide-in-from-bottom-2">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</div>
                        
                        {/* Input Nama Dokumen */}
                        <div className="flex-1 w-full">
                            <input 
                                type="text" 
                                value={doc.name} 
                                onChange={(e) => updateOtherDocument(doc.id, { name: e.target.value })} 
                                placeholder="Nama Dokumen (Contoh: Sertifikat BLS)" 
                                className="w-full text-sm border-b border-slate-200 focus:border-primary focus:outline-none py-1 bg-transparent"
                            />
                        </div>

                        {/* File Upload Control */}
                        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
                            {doc.file ? (
                                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 max-w-[200px]">
                                    <CheckCircle size={14} className="text-green-600 shrink-0"/>
                                    <span className="text-xs text-green-700 truncate">{doc.file.name}</span>
                                </div>
                            ) : (
                                <label className="cursor-pointer text-xs text-primary font-bold hover:underline flex items-center gap-1">
                                    <Upload size={14}/> Pilih File
                                    <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleOtherFileChange(doc.id, e.target.files)} />
                                </label>
                            )}
                            <button onClick={() => removeOtherDocument(doc.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </section>

      </div>

      <div className="flex justify-between pt-8 border-t border-slate-100 mt-12">
        <button onClick={() => router.push(`/karir/${slug}/apply/step4`)} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-2 group text-sm"><ArrowLeft size={18}/> Kembali</button>
        <button onClick={() => router.push(`/karir/${slug}/apply/step6`)} className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center gap-2 group text-sm">Lanjut ke Assessment <ArrowRight size={18}/></button>
      </div>
    </div>
  );
}