import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Create Sheets
    const templateSheet = workbook.addWorksheet('Template Plotting');
    const masterSheet = workbook.addWorksheet('Master Data');

    // Fetch Master Data
    const karRes = await pool.query("SELECT nip, nama_lengkap FROM karyawan WHERE nip IS NOT NULL AND status_kepegawaian = 'Aktif' ORDER BY nama_lengkap ASC");
    const shiftRes = await pool.query("SELECT nama_shift FROM shift ORDER BY nama_shift ASC");

    const namaKaryawans = karRes.rows.map(k => k.nama_lengkap);
    const nipKaryawans = karRes.rows.map(k => k.nip);
    const namaShifts = shiftRes.rows.map(s => s.nama_shift);

    // --- SETUP MASTER SHEET ---
    // Col A: Nama Karyawan, Col B: NIP
    masterSheet.getColumn('A').values = ['Nama Karyawan', ...namaKaryawans];
    masterSheet.getColumn('B').values = ['NIP', ...nipKaryawans];
    // Col D: Nama Shift
    masterSheet.getColumn('D').values = ['Nama Shift', ...namaShifts];
    
    // Hide master sheet so it doesn't distract the user
    masterSheet.state = 'hidden';

    // --- SETUP TEMPLATE SHEET ---
    templateSheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Karyawan', key: 'nama_karyawan', width: 35 },
      { header: 'NIP (Otomatis)', key: 'nip', width: 20 },
      { header: 'Tanggal', key: 'tanggal', width: 20 },
      { header: 'Nama Shift', key: 'nama_shift', width: 25 }
    ];

    // Style the headers
    templateSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    templateSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Slate 800
    };
    templateSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    const maxRows = 500; // Provide enough rows for the template

    for (let i = 2; i <= maxRows; i++) {
        // Add row number
        templateSheet.getCell(`A${i}`).value = i - 1;
        templateSheet.getCell(`A${i}`).alignment = { horizontal: 'center' };

        // Data Validation for Nama Karyawan (Dropdown)
        if (namaKaryawans.length > 0) {
            templateSheet.getCell(`B${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`'Master Data'!$A$2:$A$${namaKaryawans.length + 1}`],
                showErrorMessage: true,
                errorTitle: 'Nama Tidak Valid',
                error: 'Pilih nama karyawan dari daftar dropdown.'
            };
        }

        // VLOOKUP for NIP
        // Formula: =IF(B2="","",VLOOKUP(B2,'Master Data'!A:B,2,FALSE))
        templateSheet.getCell(`C${i}`).value = {
            formula: `IF(B${i}="","",VLOOKUP(B${i},'Master Data'!A:B,2,FALSE))`,
            date1904: false
        };
        // Lock the cell (optional, if we protect the sheet)
        templateSheet.getCell(`C${i}`).font = { color: { argb: 'FF64748B' }, italic: true };
        templateSheet.getCell(`C${i}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

        // Date formatting instructions
        templateSheet.getCell(`D${i}`).numFmt = 'yyyy-mm-dd';

        // Data Validation for Nama Shift (Dropdown)
        if (namaShifts.length > 0) {
            templateSheet.getCell(`E${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`'Master Data'!$D$2:$D$${namaShifts.length + 1}`],
                showErrorMessage: true,
                errorTitle: 'Shift Tidak Valid',
                error: 'Pilih shift dari daftar dropdown.'
            };
        }
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Template_Plotting_Cerdas.xlsx"'
      }
    });

  } catch (error: any) {
    console.error("Error Generating Excel Template:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat meng-generate template." },
      { status: 500 }
    );
  }
}
