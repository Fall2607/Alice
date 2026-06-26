import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import ExcelJS from "exceljs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "Tidak ada file yang diunggah." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    // Asumsi template ada di sheet pertama
    const worksheet = workbook.worksheets[0];

    const data: any[] = [];
    
    // Ambil header di baris pertama
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.text.trim();
    });

    // Loop dari baris kedua ke bawah
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            const rowData: any = {};
            row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                const header = headers[colNumber];
                if (header) {
                    // Karena NIP pakai formula, ambil hasil formulanya (result) jika ada
                    rowData[header] = cell.value && typeof cell.value === 'object' && 'result' in cell.value 
                                        ? cell.value.result 
                                        : cell.text || cell.value;
                }
            });
            if (Object.keys(rowData).length > 0) {
                data.push(rowData);
            }
        }
    });

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
        // Karena template sekarang punya NIP (Otomatis), kita cek field itu atau field NIP biasa
        const nip = row["NIP (Otomatis)"] || row["NIP"];
        const tanggalStr = row["Tanggal"]; 
        const namaShift = row["Nama Shift"];

        if (!nip || !tanggalStr || !namaShift) {
            failedRows.push(`Baris ${i + 2}: Data tidak lengkap (Pastikan Nama Karyawan, Tanggal, dan Shift terisi)`);
            continue;
        }

        // Convert string nip/namaShift safely
        const nipVal = String(nip).trim();
        const namaShiftVal = String(namaShift).trim();

        const karId = karyawanMap.get(nipVal);
        if (!karId) {
            failedRows.push(`Baris ${i + 2}: Karyawan dengan NIP '${nipVal}' tidak ditemukan.`);
            continue;
        }

        const shiftId = shiftMap.get(namaShiftVal.toLowerCase());
        if (!shiftId) {
            failedRows.push(`Baris ${i + 2}: Shift dengan nama '${namaShiftVal}' tidak valid.`);
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
