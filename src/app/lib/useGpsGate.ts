"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ABSENSI_GEOFENCE, getDistanceFromGeofence, type GeoLocationResult } from "./geofence";

// Status GPS untuk "gerbang" halaman absensi
// - checking    : sedang meminta izin / mencari sinyal GPS
// - ready       : lokasi berhasil didapat (GPS aktif)
// - denied      : user menolak izin lokasi di browser
// - unavailable : GPS / layanan lokasi perangkat dimatikan
// - timeout     : sinyal GPS tidak didapat dalam batas waktu
// - unsupported : browser tidak mendukung geolocation
// - insecure    : halaman tidak dibuka lewat HTTPS (geolocation diblokir browser)
export type GpsStatus = "checking" | "ready" | "denied" | "unavailable" | "timeout" | "unsupported" | "insecure";

export type GpsGateState = {
  status: GpsStatus;
  position: GeoLocationResult | null;
  errorMessage: string;
  distance: number | null; // jarak ke titik RSU (meter)
  inArea: boolean;
  isReady: boolean; // GPS aktif & lokasi sudah didapat
  retry: () => void;
  getLatestPosition: () => GeoLocationResult | null;
};

/**
 * Memaksa GPS aktif selama halaman absensi dibuka.
 * Lokasi dipantau terus (watchPosition) sehingga bila GPS dimatikan di tengah jalan,
 * status langsung berubah dan halaman absen kembali terkunci.
 */
export function useGpsGate(enabled: boolean = true): GpsGateState {
  const [status, setStatus] = useState<GpsStatus>("checking");
  const [position, setPosition] = useState<GeoLocationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const positionRef = useRef<GeoLocationResult | null>(null);

  // retry manual (tampilkan status "checking") atau silent (tanpa kedip UI)
  const retry = useCallback(() => {
    setStatus("checking");
    setErrorMessage("");
    setAttempt((a) => a + 1);
  }, []);
  const silentRetry = useCallback(() => setAttempt((a) => a + 1), []);

  // Pantau lokasi secara terus-menerus
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled) {
      // Reset agar saat dibuka kembali lokasi lama tidak dipakai
      positionRef.current = null;
      setPosition(null);
      setStatus("checking");
      setErrorMessage("");
      return;
    }

    if (!window.isSecureContext) {
      setStatus("insecure");
      setErrorMessage("Halaman absensi harus dibuka melalui koneksi aman (HTTPS) agar GPS dapat digunakan.");
      return;
    }
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      setErrorMessage("Browser/perangkat ini tidak mendukung layanan lokasi (GPS). Gunakan browser lain seperti Chrome.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        positionRef.current = loc;
        setPosition(loc);
        setStatus("ready");
        setErrorMessage("");
      },
      (err) => {
        // Timeout sesaat saat sudah punya lokasi tidak perlu mengunci halaman
        if (err.code === err.TIMEOUT && positionRef.current) return;

        positionRef.current = null;
        setPosition(null);
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMessage("Izin lokasi ditolak. Izinkan akses lokasi untuk situs ini agar dapat melakukan absensi.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus("unavailable");
          setErrorMessage("GPS / layanan lokasi perangkat Anda belum aktif. Nyalakan GPS (Lokasi) terlebih dahulu.");
        } else {
          setStatus("timeout");
          setErrorMessage("Sinyal GPS belum didapat. Pastikan GPS aktif dan coba di area terbuka / dekat jendela.");
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled, attempt]);

  // Jika izin lokasi diubah user (mis. dari "Blokir" ke "Izinkan"), otomatis coba lagi
  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.permissions?.query) return;
    let permStatus: PermissionStatus | null = null;
    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((p) => {
        if (cancelled) return;
        permStatus = p;
        p.onchange = () => {
          if (p.state !== "denied") retry();
        };
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (permStatus) permStatus.onchange = null;
    };
  }, [enabled, retry]);

  // Saat user kembali ke tab (mis. setelah menyalakan GPS di pengaturan HP), coba lagi
  useEffect(() => {
    if (!enabled) return;
    const onVisible = () => {
      if (document.visibilityState === "visible" && !positionRef.current) silentRetry();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [enabled, silentRetry]);

  // GPS mati / timeout: cek ulang otomatis tiap 5 detik sampai GPS dinyalakan
  useEffect(() => {
    if (!enabled || (status !== "unavailable" && status !== "timeout")) return;
    const t = setInterval(silentRetry, 5000);
    return () => clearInterval(t);
  }, [enabled, status, silentRetry]);

  const getLatestPosition = useCallback(() => positionRef.current, []);

  const distance = position ? getDistanceFromGeofence(position.latitude, position.longitude) : null;
  const inArea = distance !== null && distance <= ABSENSI_GEOFENCE.radiusMeters;

  return {
    status,
    position,
    errorMessage,
    distance,
    inArea,
    isReady: status === "ready" && !!position,
    retry,
    getLatestPosition,
  };
}
