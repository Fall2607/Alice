import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "Tidak ada file yang diunggah." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Parse as JSON array
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
        return NextResponse.json({ message: "File kosong atau tidak memiliki data." }, { status: 400 });
    }

    // Prepare arrays for bulk operations
    let successCount = 0;
    let failedRows = [];

    // Optimize DB queries by pre-fetching all Karyawan & Shifts
    const karRes = await pool.query("SELECT id, nip FROM karyawan WHERE nip IS NOT NULL");
    const shiftRes = await pool.query("SELECT id, nama_shift FROM shift");

    const karyawanMap = new Map();
    karRes.rows.forEach(k => karyawanMap.set(k.nip, k.id));

    const shiftMap = new Map();
    shiftRes.rows.forEach(s => shiftMap.set(s.nama_shift.toLowerCase().trim(), s.id));

    // Process rows
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        // Extract fields exactly as they are in the template
        const nip = row["NIP"];
        const tanggalStr = row["Tanggal"]; // Expected format "YYYY-MM-DD" or similar
        const namaShift = row["Nama Shift"];

        if (!nip || !tanggalStr || !namaShift) {
            failedRows.push(`Baris ${i + 2}: Data tidak lengkap (Pastikan NIP, Tanggal, dan Nama Shift terisi)`);
            continue;
        }

        const karId = karyawanMap.get(nip.toString());
        if (!karId) {
            failedRows.push(`Baris ${i + 2}: Karyawan dengan NIP ${nip} tidak ditemukan.`);
            continue;
        }

        const shiftId = shiftMap.get(namaShift.toString().toLowerCase().trim());
        if (!shiftId) {
            failedRows.push(`Baris ${i + 2}: Shift dengan nama '${namaShift}' tidak valid.`);
            continue;
        }

        // Handle Excel Date format conversion if needed (XLSX sometimes parses dates as numbers)
        let parsedDate = tanggalStr;
        if (typeof tanggalStr === 'number') {
             // Convert Excel serial date to YYYY-MM-DD
             const jsDate = new Date(Math.round((tanggalStr - 25569) * 86400 * 1000));
             parsedDate = jsDate.toISOString().split('T')[0];
        } else if (typeof tanggalStr === 'string' && tanggalStr.includes('/')) {
             // If format is MM/DD/YYYY or DD/MM/YYYY, attempt standard parsing
             // Assuming DD/MM/YYYY for ID locale if slashes are used
             const parts = tanggalStr.split('/');
             if (parts.length === 3) {
                 if (parts[2].length === 4) {
                      // DD/MM/YYYY
                      parsedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                 }
             }
        }

        try {
            // Delete existing shift for that day if any to prevent duplicate constraint violation
            await pool.query(
                `DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2`,
                [karId, parsedDate]
            );

            // Insert new shift
            await pool.query(
                `INSERT INTO karyawan_shift (karyawan_id, tanggal, shift_id) VALUES ($1, $2, $3)`,
                [karId, parsedDate, shiftId]
            );
            successCount++;
        } catch (dbErr) {
            failedRows.push(`Baris ${i + 2}: Gagal menyimpan ke database - ${(dbErr as Error).message}`);
        }
    }

    return NextResponse.json({
        success: true,
        message: `Selesai! ${successCount} data berhasil diimport. ${failedRows.length} data gagal.`,
        successCount,
        failedCount: failedRows.length,
        failedRows
    });

  } catch (error: any) {
    console.error("Error Import Shift:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses file import.", error: error.message },
      { status: 500 }
    );
  }
}
