/**
 * Helper untuk memformat URL gambar agar aman dimuat di browser HTTPS (Vercel)
 * maupun lokal tanpa terblokir Mixed Content.
 */
export function getSafeImageUrl(rawUrl?: string | null, fallbackImg = "/img/potrait/man.jpg"): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return fallbackImg;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return fallbackImg;
  }

  // Jika URL berupa static file dari folder public (diawali '/')
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Jika URL menggunakan HTTP (misal IP Proxmox storage: http://182.253.37.110:4000/...)
  // Lewatkan ke proxy internal Next.js agar diakses via HTTPS aman di Vercel
  if (trimmed.startsWith("http://182.253.37.110:4000") || trimmed.startsWith("http://192.168.100.10:4000") || trimmed.startsWith("http://localhost:4000")) {
    return `/api/proxy-image?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}
