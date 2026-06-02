"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { Camera, CheckCircle2, AlertCircle, ScanFace, Loader2, UserPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";

function FaceEnrollmentContent() {
  const [nip, setNip] = useState("");
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [status, setStatus] = useState<"standby" | "scanning" | "success" | "error">("standby");
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const searchParams = useSearchParams();
  const faceapiRef = useRef<any>(null);

  useEffect(() => {
     const nipParam = searchParams.get("nip");
     if (nipParam) {
        setNip(nipParam);
     }
  }, [searchParams]);

  // 1. Muat Model AI saat halaman dibuka
  useEffect(() => {
    const loadModels = async () => {
      try {
        const fa = await import("@vladmandic/face-api");
        faceapiRef.current = fa;
        const MODEL_URL = "/models"; // Lokasi folder public/models
        await Promise.all([
          fa.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          fa.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          fa.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelsLoaded(true);
      } catch (err) {
        console.error("Gagal memuat model face-api:", err);
      }
    };
    loadModels();
  }, []);

  // 2. Buka Kamera
  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Akses kamera ditolak:", err);
        setMessage("Kamera tidak diizinkan atau tidak tersedia.");
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // 3. Proses Pendaftaran (Ekstrak Wajah lalu Kirim ke API)
  const handleEnrollFace = async () => {
    if (!nip) {
      setStatus("error");
      setMessage("NIP Karyawan wajib diisi!");
      return;
    }
    
    if (!videoRef.current || !isModelsLoaded) return;
    
    setStatus("scanning");
    setMessage("Sedang memindai wajah... Harap diam.");

    try {
      const faceapi = faceapiRef.current;
      if (!faceapi) return;

      // Deteksi wajah menggunakan TinyFaceDetector
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("error");
        setMessage("Wajah tidak terdeteksi. Pastikan pencahayaan cukup dan wajah terlihat jelas.");
        return;
      }

      // array Float32Array 128 dimensi
      const faceDescriptor = Array.from(detection.descriptor);

      // Simpan ke database
      const response = await fetch("/api/pegawai/enroll-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip, face_descriptor: faceDescriptor })
      });

      const resData = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(resData.message || "Gagal menyimpan data wajah.");
      } else {
        setStatus("success");
        setMessage(`Wajah untuk NIP ${nip} (${resData.data.nama_lengkap}) berhasil didaftarkan!`);
        setNip("");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Terjadi kesalahan teknis saat memindai.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-3 border-b pb-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <UserPlus size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Pendaftaran Wajah Karyawan</h1>
          <p className="text-sm font-medium text-slate-500">Daftarkan biometrik wajah karyawan ke sistem untuk akses Kiosk.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Kolom Kiri: Input Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">NIP Karyawan</label>
            <input 
              type="text" 
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Masukkan NIP (Contoh: 1208573)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
            
            <div className="mt-8">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Status Sistem AI</h3>
               <div className="flex items-center gap-3 mb-2">
                 {isModelsLoaded ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Loader2 size={16} className="text-orange-500 animate-spin" />}
                 <span className="text-sm font-medium">{isModelsLoaded ? 'Model AI Wajah Siap' : 'Memuat Model AI...'}</span>
               </div>
               <div className="flex items-center gap-3">
                 {stream ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Loader2 size={16} className="text-orange-500 animate-spin" />}
                 <span className="text-sm font-medium">{stream ? 'Kamera Terhubung' : 'Membuka Kamera...'}</span>
               </div>
            </div>

            {/* Alert Message */}
            {status !== "standby" && (
               <div className={`mt-8 p-4 rounded-xl border flex gap-3 items-start
                 ${status === 'scanning' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                   status === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                   'bg-rose-50 border-rose-200 text-rose-700'}`}
               >
                 {status === 'scanning' ? <Loader2 className="animate-spin mt-0.5 shrink-0" size={18} /> : 
                  status === 'success' ? <CheckCircle2 className="mt-0.5 shrink-0" size={18} /> : 
                  <AlertCircle className="mt-0.5 shrink-0" size={18} />}
                 <p className="text-sm font-bold">{message}</p>
               </div>
            )}
          </div>

          <button 
            onClick={handleEnrollFace}
            disabled={!isModelsLoaded || !stream || status === "scanning"}
            className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black rounded-xl uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            {status === "scanning" ? "Mengekstrak..." : "Simpan Data Wajah"}
          </button>
        </div>

        {/* Kolom Kanan: Camera Feed */}
        <div className="bg-black/5 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center relative min-h-[400px]">
           <video 
             ref={videoRef}
             autoPlay 
             playsInline 
             muted 
             className="w-full h-full object-cover transform scale-x-[-1]" 
           />
           {/* Face Guide UI */}
           <div className="absolute inset-0 pointer-events-none p-10 flex flex-col items-center justify-center">
             <div className="w-full h-full border-2 border-white/40 rounded-full border-dashed"></div>
             <p className="absolute bottom-4 bg-black/50 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
               Pastikan wajah di dalam oval
             </p>
           </div>
        </div>

      </div>
    </div>
  );
}

export default function FaceEnrollmentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>}>
      <FaceEnrollmentContent />
    </Suspense>
  );
}
