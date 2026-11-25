import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Image Proxy Route: /api/proxy-image?url=...
 * 
 * Mengatasi masalah Mixed Content (HTTPS di Vercel -> HTTP di Storage Server)
 * serta mengizinkan browser memuat gambar secara aman lewat same-origin HTTPS.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ message: "Parameter url wajib disertakan." }, { status: 400 });
    }

    // Hanya izinkan proxy untuk Storage Server yang sah
    const allowedHosts = ["182.253.37.110:4000", "182.253.37.110", "192.168.100.10:4000", "localhost:4000"];
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json({ message: "Format URL tidak valid." }, { status: 400 });
    }

    if (!allowedHosts.includes(parsedUrl.host)) {
      return NextResponse.json({ message: "Host tidak diizinkan." }, { status: 403 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Alice-Image-Proxy/1.0",
      },
      cache: "force-cache",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Gagal mengambil gambar dari storage server." },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("Proxy Image Error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada proxy gambar." },
      { status: 500 }
    );
  }
}
