// File: src/app/api/upload/route.ts
import { NextResponse, NextRequest } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string; // cv, photo, ktp, dll

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        // 1. Konversi File ke Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 2. Tentukan Folder Penyimpanan (Di dalam folder 'public/uploads')
        // process.cwd() mengarah ke root project next.js Anda
        const uploadDir = path.join(process.cwd(), "public/uploads");

        // Cek apakah folder 'uploads' ada, jika tidak buat dulu
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // 3. Buat Nama File Unik (Mencegah nama file kembar saling menimpa)
        // Format: tipe-timestamp-namaasli (dibersihkan dari spasi)
        const sanitizedFileName = file.name.replace(/\s+/g, "_");
        const uniqueFileName = `${type}-${Date.now()}-${sanitizedFileName}`;

        // 4. Tentukan Full Path di Server
        const filePath = path.join(uploadDir, uniqueFileName);

        // 5. Tulis File ke Disk
        await writeFile(filePath, buffer);

        // 6. Return Public URL
        // Karena kita simpan di folder 'public', file bisa diakses via browser
        // Contoh: http://domain.com/uploads/foto-123.jpg
        const publicUrl = `/uploads/${uniqueFileName}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            name: file.name
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ message: "Gagal mengupload file ke server" }, { status: 500 });
    }
}