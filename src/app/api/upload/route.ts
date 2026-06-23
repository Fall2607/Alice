// File: src/app/api/upload/route.ts
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Ambil FormData dari request frontend
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        // URL Storage Server di Proxmox (LXC Ubuntu)
        // Kita menggunakan IP Static Server: 182.253.37.110 dengan Port 4000
        const storageUrl = process.env.STORAGE_SERVER_URL || "http://182.253.37.110:4000/api/upload";
        const apiKey = process.env.STORAGE_API_KEY || "alice-super-secret-key-123";

        // Forward FormData langsung ke Storage Server
        const response = await fetch(storageUrl, {
            method: "POST",
            headers: {
                // Menambahkan API Key rahasia agar aman
                "x-api-key": apiKey,
                // Catatan: Fetch di lingkungan Node/Next.js secara otomatis 
                // mengatur header 'Content-Type': 'multipart/form-data; boundary=...' 
                // jika kita passing object FormData di body.
            },
            body: formData,
        });

        // Cek response dari Storage Server
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error("Storage Server Error:", err);
            return NextResponse.json(
                { message: "Gagal meneruskan file ke Storage Server" }, 
                { status: response.status }
            );
        }

        // Parsing hasil URL yang di-return oleh Storage Server
        const data = await response.json();

        return NextResponse.json({
            success: true,
            url: data.url, // URL permanen ke file di Proxmox (misal: http://182.253.37.110:4000/uploads/file.pdf)
            name: data.name
        });

    } catch (error) {
        console.error("Upload Route Error:", error);
        return NextResponse.json({ message: "Terjadi kesalahan sistem saat memproses upload" }, { status: 500 });
    }
}