import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

function parseExcelDate(val: any): string | null {
  if (!val) return null;

  // 1. JS Date object
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, "0");
    const day = String(val.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // 2. Numeric Excel serial date (e.g. 45600)
  if (typeof val === "number") {
    // Excel base date: 1899-12-30
    const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (isNaN(jsDate.getTime())) return null;
    const year = jsDate.getUTCFullYear();
    const month = String(jsDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(jsDate.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // 3. String date formats
  const str = String(val).trim();
  if (!str) return null;

  // Format YYYY-MM-DD atau YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Format DD/MM/YYYY atau DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return null;
}

function extractCellValue(cell: ExcelJS.Cell): any {
  if (!cell || cell.value === null || cell.value === undefined) return null;
  const val = cell.value;

  if (val instanceof Date) return val;

  if (typeof val === "object") {
    // Jika formula cell dengan hasil evaluasi (result)
    if ("result" in val && val.result !== undefined && val.result !== null) {
      return val.result;
    }
    // Jika richText
    if ("richText" in val && Array.isArray((val as any).richText)) {
      return (val as any).richText.map((t: any) => t.text).join("").trim();
    }
    // Jika ada properti text
    if (cell.text) {
      return cell.text.trim();
    }
  }

  if (typeof val === "string") return val.trim();
  return val;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const superiorId = (formData.get("superior_id") as string) || null;

    if (!file) {
      return NextResponse.json(
        { message: "Tidak ada file yang diunggah." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    // Cari sheet utama
    const worksheet =
      workbook.getWorksheet("Plotting Shift") ||
      workbook.getWorksheet("Template Plotting") ||
      workbook.worksheets[0];

    if (!worksheet) {
      return NextResponse.json(
        { message: "Sheet data plotting tidak ditemukan di dalam file Excel." },
        { status: 400 }
      );
    }

    // 1. Deteksi Kolom Header dari baris 1
    const headerRow = worksheet.getRow(1);
    let idCol: number | null = null;
    let nipCol: number | null = null;
    let namaCol: number | null = null;
    let tanggalCol: number | null = null;
    let shiftCol: number | null = null;

    headerRow.eachCell((cell, colNumber) => {
      const headerText = String(cell.text || cell.value || "").toLowerCase().trim();
      
      // Deteksi ID Karyawan (hindari kolom ID Shift)
      if (
        (headerText.includes("id karyawan") || headerText === "id" || headerText.includes("karyawan_id")) &&
        !headerText.includes("shift")
      ) {
        idCol = colNumber;
      }
      // Deteksi NIP
      if (headerText.includes("nip")) {
        nipCol = colNumber;
      }
      // Deteksi Nama Karyawan (hindari kolom Nama Shift)
      if (
        (headerText.includes("nama karyawan") || headerText.includes("nama pegawai") || headerText === "nama") &&
        !headerText.includes("shift")
      ) {
        namaCol = colNumber;
      }
      // Deteksi Tanggal
      if (headerText.includes("tanggal") || headerText.includes("date")) {
        tanggalCol = colNumber;
      }
      // Deteksi Shift
      if (headerText.includes("shift")) {
        shiftCol = colNumber;
      }
    });

    if (!tanggalCol || !shiftCol || (!idCol && !nipCol && !namaCol)) {
      return NextResponse.json(
        {
          message:
            "Format kolom tidak sesuai. Pastikan file memiliki kolom Tanggal, Nama Shift, dan minimal salah satu dari (ID Karyawan, NIP, atau Nama Karyawan).",
        },
        { status: 400 }
      );
    }

    // 2. Pre-fetch Data Master Karyawan
    const karRes = await pool.query(`
      SELECT id, nip, nama_lengkap, LOWER(TRIM(nama_lengkap)) as nama_clean 
      FROM karyawan
    `);

    const mapById = new Map<string, { id: string; nama_lengkap: string; nip: string }>();
    const mapByNip = new Map<string, { id: string; nama_lengkap: string; nip: string }>();
    const mapByName = new Map<string, { id: string; nama_lengkap: string; nip: string }>();

    karRes.rows.forEach((k) => {
      const info = { id: k.id, nama_lengkap: k.nama_lengkap, nip: k.nip || "" };
      mapById.set(k.id, info);
      if (k.nip) mapByNip.set(String(k.nip).trim(), info);
      if (k.nama_clean) mapByName.set(k.nama_clean, info);
    });

    // 3. Pre-fetch Data Master Shift
    const shiftRes = await pool.query(
      "SELECT id, nama_shift, jam_masuk, jam_keluar FROM shift"
    );
    const mapShiftByName = new Map<string, number>();
    const mapShiftById = new Map<number, number>();

    shiftRes.rows.forEach((s) => {
      mapShiftById.set(s.id, s.id);
      const cleanName = s.nama_shift.toLowerCase().trim();
      mapShiftByName.set(cleanName, s.id);

      // Dukung varian tanpa prefix "shift " (contoh: "pagi" -> Shift Pagi)
      if (cleanName.startsWith("shift ")) {
        mapShiftByName.set(cleanName.replace("shift ", "").trim(), s.id);
      }

      // Dukung jika ada jam di nama (contoh: "shift pagi (07:00 - 14:00)")
      if (s.jam_masuk && s.jam_keluar) {
        const withHours = `${cleanName} (${s.jam_masuk.slice(0, 5)} - ${s.jam_keluar.slice(0, 5)})`;
        mapShiftByName.set(withHours, s.id);
      }
    });

    // 4. Cek otorisasi bawahan jika superior_id terisi (SPV / Koordinator)
    let allowedEmployeeIds: Set<string> | null = null;
    if (superiorId) {
      const subRes = await pool.query(
        `
        WITH RECURSIVE subordinates AS (
            SELECT id FROM karyawan WHERE atasan_id = $1
            UNION
            SELECT k.id FROM karyawan k
            INNER JOIN subordinates s ON s.id = k.atasan_id
        ),
        delegated_karyawan AS (
            SELECT k.id FROM karyawan k
            INNER JOIN jabatan j ON k.jabatan_id = j.id
            INNER JOIN schedule_delegations sd ON j.departemen_id = sd.departemen_id
            WHERE sd.karyawan_id = $1
        )
        SELECT id FROM subordinates UNION SELECT id FROM delegated_karyawan
      `,
        [superiorId]
      );
      allowedEmployeeIds = new Set(subRes.rows.map((r) => r.id));
    }

    // 5. Iterasi dan Validasi Setiap Baris Data
    interface ParsedItem {
      rowNum: number;
      karyawan_id: string;
      karyawan_nama: string;
      tanggal: string;
      action: "SET" | "DELETE";
      shift_id?: number;
    }

    const itemsToProcess: ParsedItem[] = [];
    const failedRows: string[] = [];

    const totalRows = worksheet.rowCount;
    for (let r = 2; r <= totalRows; r++) {
      const row = worksheet.getRow(r);

      const valId = idCol ? extractCellValue(row.getCell(idCol)) : null;
      const valNip = nipCol ? extractCellValue(row.getCell(nipCol)) : null;
      const valNama = namaCol ? extractCellValue(row.getCell(namaCol)) : null;
      const valTanggal = tanggalCol ? extractCellValue(row.getCell(tanggalCol)) : null;
      const valShift = shiftCol ? extractCellValue(row.getCell(shiftCol)) : null;

      // Lewati jika seluruh baris kosong
      if (!valId && !valNip && !valNama && !valTanggal && !valShift) {
        continue;
      }

      // Validasi Tanggal
      const parsedDate = parseExcelDate(valTanggal);
      if (!parsedDate) {
        failedRows.push(
          `Baris ${r}: Tanggal '${valTanggal || "Kosong"}' tidak valid (format yang didukung: YYYY-MM-DD atau DD/MM/YYYY).`
        );
        continue;
      }

      // Validasi Karyawan
      let resolvedKar: { id: string; nama_lengkap: string; nip: string } | null = null;

      // 1) Cek berdasarkan ID Karyawan (UUID)
      if (valId && mapById.has(String(valId).trim())) {
        resolvedKar = mapById.get(String(valId).trim())!;
      }
      // 2) Cek berdasarkan NIP
      else if (valNip && mapByNip.has(String(valNip).trim())) {
        resolvedKar = mapByNip.get(String(valNip).trim())!;
      }
      // 3) Cek berdasarkan Nama Karyawan
      else if (valNama && mapByName.has(String(valNama).toLowerCase().trim())) {
        resolvedKar = mapByName.get(String(valNama).toLowerCase().trim())!;
      }

      if (!resolvedKar) {
        const identifier = valNama || valNip || valId || "tanpa identitas";
        failedRows.push(
          `Baris ${r}: Karyawan '${identifier}' tidak ditemukan dalam database.`
        );
        continue;
      }

      // Cek izin atasan
      if (allowedEmployeeIds && !allowedEmployeeIds.has(resolvedKar.id)) {
        failedRows.push(
          `Baris ${r}: Anda tidak memiliki akses untuk mengatur jadwal karyawan ${resolvedKar.nama_lengkap}.`
        );
        continue;
      }

      // Validasi Shift
      const cleanShiftStr = valShift ? String(valShift).trim() : "";
      const lowerShift = cleanShiftStr.toLowerCase();

      // Jika shift dikosongkan atau diisi '-' / 'hapus' / 'delete' / 'kosong' -> Hapus jadwal di tanggal tersebut
      if (!cleanShiftStr || ["-", "kosong", "hapus", "delete", "none", "clear"].includes(lowerShift)) {
        itemsToProcess.push({
          rowNum: r,
          karyawan_id: resolvedKar.id,
          karyawan_nama: resolvedKar.nama_lengkap,
          tanggal: parsedDate,
          action: "DELETE",
        });
        continue;
      }

      // Cari shift_id yang cocok
      let resolvedShiftId: number | undefined = mapShiftByName.get(lowerShift);

      // Coba potong keterangan dalam kurung jika ada (misal: "Shift Pagi (07:00-14:00)")
      if (!resolvedShiftId && lowerShift.includes("(")) {
        const beforeParen = lowerShift.split("(")[0].trim();
        resolvedShiftId = mapShiftByName.get(beforeParen);
      }

      // Coba jika yang dimasukkan adalah ID angka shift
      if (!resolvedShiftId && !isNaN(Number(cleanShiftStr))) {
        resolvedShiftId = mapShiftById.get(Number(cleanShiftStr));
      }

      if (!resolvedShiftId) {
        failedRows.push(
          `Baris ${r} (${resolvedKar.nama_lengkap}, ${parsedDate}): Shift '${cleanShiftStr}' tidak terdaftar di master data shift.`
        );
        continue;
      }

      itemsToProcess.push({
        rowNum: r,
        karyawan_id: resolvedKar.id,
        karyawan_nama: resolvedKar.nama_lengkap,
        tanggal: parsedDate,
        action: "SET",
        shift_id: resolvedShiftId,
      });
    }

    if (itemsToProcess.length === 0 && failedRows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada data yang dapat diproses karena semua baris mengalami error.",
          failedCount: failedRows.length,
          failedRows,
        },
        { status: 400 }
      );
    }

    if (itemsToProcess.length === 0) {
      return NextResponse.json(
        {
          message: "File kosong atau tidak memiliki baris data jadwal yang dapat diimport.",
        },
        { status: 400 }
      );
    }

    // 6. Eksekusi ke Database dalam Transaksi
    const client = await pool.connect();
    let successCount = 0;
    let deletedCount = 0;

    try {
      await client.query("BEGIN");

      for (const item of itemsToProcess) {
        // Hapus entri lama di tanggal tersebut untuk karyawan ini (mencegah duplikasi / update shift)
        await client.query(
          "DELETE FROM karyawan_shift WHERE karyawan_id = $1 AND tanggal = $2",
          [item.karyawan_id, item.tanggal]
        );

        if (item.action === "SET" && item.shift_id) {
          await client.query(
            "INSERT INTO karyawan_shift (karyawan_id, tanggal, shift_id) VALUES ($1, $2, $3)",
            [item.karyawan_id, item.tanggal, item.shift_id]
          );
          successCount++;
        } else if (item.action === "DELETE") {
          deletedCount++;
        }
      }

      await client.query("COMMIT");
    } catch (dbErr: any) {
      await client.query("ROLLBACK");
      console.error("Database transaction error during shift import:", dbErr);
      return NextResponse.json(
        {
          message: `Gagal menyimpan data ke database: ${dbErr.message}`,
          error: dbErr.message,
        },
        { status: 500 }
      );
    } finally {
      client.release();
    }

    let summaryMsg = `Selesai! ${successCount} jadwal berhasil disimpan/diperbarui.`;
    if (deletedCount > 0) {
      summaryMsg += ` ${deletedCount} jadwal dikosongkan.`;
    }
    if (failedRows.length > 0) {
      summaryMsg += ` ${failedRows.length} baris dilewati karena tidak valid.`;
    }

    return NextResponse.json({
      success: true,
      message: summaryMsg,
      successCount,
      deletedCount,
      failedCount: failedRows.length,
      failedRows,
    });
  } catch (error: any) {
    console.error("Error Import Shift:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat memproses file import Excel.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
