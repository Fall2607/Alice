// Konfigurasi Geofence (Pembatasan Area) Absensi
// Titik pusat: Rumah Sakit Umum Avisena (sumber: Google Maps place pin)
// https://www.google.com/maps/place/Rumah+Sakit+Umum+Avisena/@-6.9217871,107.5532443,17z
// File ini aman diimpor dari client maupun server (tanpa dependensi server).

export const ABSENSI_GEOFENCE = {
  name: "RSU Avisena",
  latitude: -6.9217924,
  longitude: 107.5558192,
  radiusMeters: 2000, // 2 km
};

// Jarak antara dua koordinat (meter) menggunakan rumus Haversine
export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // radius bumi (meter)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getDistanceFromGeofence(latitude: number, longitude: number): number {
  return haversineDistanceMeters(latitude, longitude, ABSENSI_GEOFENCE.latitude, ABSENSI_GEOFENCE.longitude);
}

export function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${Math.round(meters)} m`;
}

export type GeoLocationResult = { latitude: number; longitude: number; accuracy: number };

// Helper client-side: ambil lokasi GPS perangkat
export function getCurrentLocation(): Promise<GeoLocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Perangkat/browser tidak mendukung layanan lokasi (GPS)."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        let msg = "Gagal mendapatkan lokasi perangkat.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Akses lokasi ditolak. Izinkan akses lokasi (GPS) di browser untuk melakukan absensi.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Lokasi tidak tersedia. Pastikan GPS perangkat aktif.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Waktu pengambilan lokasi habis. Silakan coba lagi.";
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  });
}

