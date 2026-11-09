import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

interface GenerateTemplateOptions {
  karyawan_ids?: string[];
  month?: string; // YYYY-MM
  mode?: "schedule" | "blank";
  include_existing?: boolean;
  superior_id?: string | null;
}

const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function getShiftCategory(nama_shift: string): string {
  const name = nama_shift.toLowerCase();
  if (name.includes("cuti") || name.includes("izin")) return "Cuti";
  if (name.includes("libur") || name.includes("lepas") || name.includes("off")) return "Libur";
  if (name.includes("malam")) return "Malam";
  if (name.includes("siang")) return "Siang";
  if (name.includes("middle")) return "Middle";
  return "Pagi";
}

async function generatePlottingWorkbook(options: GenerateTemplateOptions) {
  const {
    karyawan_ids,
    month = new Date().toISOString().slice(0, 7),
    mode = "schedule",
    include_existing = true,
    superior_id,
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Alice HRIS System";
  workbook.lastModifiedBy = "Alice HRIS System";
  workbook.created = new Date();
  workbook.modified = new Date();

  // 1. Fetch Master Shift (diurutkan berdasarkan nama agar rapi dan mudah dicari saat dropdown dibuka)
  const shiftRes = await pool.query(
    "SELECT id, nama_shift, jam_masuk, jam_keluar FROM shift ORDER BY nama_shift ASC"
  );
  const shifts = shiftRes.rows;

  // 2. Fetch Master Karyawan
  let karQuery = `
    SELECT 
      k.id, 
      k.nip, 
      k.nama_lengkap, 
      COALESCE(d.nama_departemen, 'Umum') AS nama_departemen,
      COALESCE(lj.nama_level, '-') AS nama_jabatan
    FROM karyawan k
    LEFT JOIN jabatan j ON k.jabatan_id = j.id
    LEFT JOIN departemen d ON j.departemen_id = d.id
    LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
    WHERE k.is_active = true
  `;
  const karParams: any[] = [];

  if (superior_id) {
    karQuery = `
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
      ${karQuery}
      AND k.id IN (SELECT id FROM subordinates UNION SELECT id FROM delegated_karyawan)
    `;
    karParams.push(superior_id);
  }

  karQuery += ` ORDER BY d.nama_departemen ASC, k.nama_lengkap ASC`;
  const allKarRes = await pool.query(karQuery, karParams);
  const allKaryawans = allKarRes.rows;

  // Filter karyawan jika ada karyawan_ids yang dipilih
  const selectedKaryawans =
    karyawan_ids && karyawan_ids.length > 0
      ? allKaryawans.filter((k) => karyawan_ids.includes(k.id))
      : allKaryawans;

  // 3. Buat Sheet Master Shift
  const masterShiftSheet = workbook.addWorksheet("Master Shift");
  masterShiftSheet.columns = [
    { header: "ID Shift", key: "id", width: 12 },
    { header: "Nama Shift", key: "nama_shift", width: 28 },
    { header: "Jam Masuk", key: "jam_masuk", width: 14 },
    { header: "Jam Keluar", key: "jam_keluar", width: 14 },
    { header: "Kategori", key: "kategori", width: 16 },
  ];

  const shiftHeader = masterShiftSheet.getRow(1);
  shiftHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  shiftHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF334155" }, // Slate 700
  };
  shiftHeader.alignment = { vertical: "middle", horizontal: "center" };
  shiftHeader.height = 24;

  shifts.forEach((s) => {
    masterShiftSheet.addRow({
      id: s.id,
      nama_shift: s.nama_shift,
      jam_masuk: s.jam_masuk ? s.jam_masuk.slice(0, 5) : "-",
      jam_keluar: s.jam_keluar ? s.jam_keluar.slice(0, 5) : "-",
      kategori: getShiftCategory(s.nama_shift),
    });
  });

  // 4. Buat Sheet Master Karyawan
  const masterKarSheet = workbook.addWorksheet("Master Karyawan");
  masterKarSheet.columns = [
    { header: "ID Karyawan", key: "id", width: 38 },
    { header: "NIP", key: "nip", width: 18 },
    { header: "Nama Karyawan", key: "nama_lengkap", width: 32 },
    { header: "Unit / Departemen", key: "nama_departemen", width: 24 },
    { header: "Jabatan", key: "nama_jabatan", width: 24 },
  ];

  const karHeader = masterKarSheet.getRow(1);
  karHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  karHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF334155" },
  };
  karHeader.alignment = { vertical: "middle", horizontal: "center" };
  karHeader.height = 24;

  allKaryawans.forEach((k) => {
    masterKarSheet.addRow({
      id: k.id,
      nip: k.nip || "",
      nama_lengkap: k.nama_lengkap,
      nama_departemen: k.nama_departemen,
      nama_jabatan: k.nama_jabatan,
    });
  });

  // 5. Buat Sheet Utama: Plotting Shift
  const templateSheet = workbook.addWorksheet("Plotting Shift");

  if (mode === "schedule") {
    // Mode Jadwal Harian: Baris otomatis digenerate per Karyawan x per Tanggal di bulan tersebut
    templateSheet.columns = [
      { header: "No", key: "no", width: 6 },
      { header: "ID Karyawan", key: "id_karyawan", width: 38 },
      { header: "NIP", key: "nip", width: 18 },
      { header: "Nama Karyawan", key: "nama_karyawan", width: 32 },
      { header: "Departemen", key: "departemen", width: 22 },
      { header: "Tanggal", key: "tanggal", width: 15 },
      { header: "Hari", key: "hari", width: 12 },
      { header: "Nama Shift", key: "nama_shift", width: 28 },
      { header: "Keterangan", key: "keterangan", width: 22 },
    ];

    // Hitung periode cut-off: tanggal 26 bulan sebelumnya s/d tanggal 25 bulan terpilih
    // Contoh: jika memilih November 2026 (2026-11), maka tanggal: 26 Oktober 2026 s/d 25 November 2026
    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10); // 1-12

    const pad2 = (n: number) => String(n).padStart(2, "0");
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

    // startDate = 26 bulan sebelumnya (monthNum - 2 pada indeks bulan 0-indexed)
    // endDate = 25 bulan terpilih (monthNum - 1 pada indeks bulan 0-indexed)
    const startDate = new Date(year, monthNum - 2, 26);
    const endDate = new Date(year, monthNum - 1, 25);
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    // Ambil data plotting yang sudah ada di database jika include_existing = true
    const existingShiftMap = new Map<string, string>();
    if (include_existing && selectedKaryawans.length > 0) {
      try {
        const targetKarIds = selectedKaryawans.map((k) => k.id);
        const existingRes = await pool.query(
          `
          SELECT ks.karyawan_id, ks.tanggal, s.nama_shift
          FROM karyawan_shift ks
          JOIN shift s ON ks.shift_id = s.id
          WHERE ks.karyawan_id = ANY($1::uuid[]) 
            AND ks.tanggal::text >= $2 AND ks.tanggal::text <= $3
        `,
          [targetKarIds, startDateStr, endDateStr]
        );
        existingRes.rows.forEach((r) => {
          const tglStr =
            r.tanggal instanceof Date
              ? formatDate(r.tanggal)
              : String(r.tanggal).slice(0, 10);
          existingShiftMap.set(`${r.karyawan_id}_${tglStr}`, r.nama_shift);
        });
      } catch (err) {
        console.error("Gagal mengambil existing shift:", err);
      }
    }

    // Susun daftar tanggal berurutan dalam periode cut-off
    const periodDates: {
      dateStr: string;
      dayName: string;
      isSunday: boolean;
      isSaturday: boolean;
    }[] = [];

    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
      const dateStr = formatDate(curDate);
      const dayOfWeek = curDate.getDay();
      periodDates.push({
        dateStr,
        dayName: NAMA_HARI[dayOfWeek],
        isSunday: dayOfWeek === 0,
        isSaturday: dayOfWeek === 6,
      });
      curDate.setDate(curDate.getDate() + 1);
    }

    let rowIndex = 2;

    for (const kar of selectedKaryawans) {
      for (const item of periodDates) {
        const { dateStr, dayName, isSunday, isSaturday } = item;
        const currentShift = existingShiftMap.get(`${kar.id}_${dateStr}`) || "";

        const row = templateSheet.getRow(rowIndex);
        row.getCell(1).value = rowIndex - 1;
        row.getCell(2).value = kar.id;
        row.getCell(3).value = kar.nip || "";
        row.getCell(4).value = kar.nama_lengkap;
        row.getCell(5).value = kar.nama_departemen;
        row.getCell(6).value = dateStr;
        row.getCell(6).numFmt = "yyyy-mm-dd";
        row.getCell(7).value = dayName;
        row.getCell(8).value = currentShift;
        row.getCell(9).value = currentShift ? "Jadwal Eksisting" : "";

        // Format warna jika akhir pekan (Minggu/Sabtu)
        if (isSunday) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFE4E6" }, // Rose 100
          };
          row.getCell(7).font = { color: { argb: "FFE11D48" }, bold: true };
        } else if (isSaturday) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF1F5F9" }, // Slate 100
          };
          row.getCell(7).font = { color: { argb: "FF475569" }, bold: true };
        }

        // Dropdown Shift dari sheet Master Shift
        // showErrorMessage: false agar user bisa memilih dari dropdown ATAU mengetik langsung nama/kode shift tanpa dicekal Excel Stop Alert
        if (shifts.length > 0) {
          row.getCell(8).dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`'Master Shift'!$B$2:$B$${shifts.length + 1}`],
            showErrorMessage: false,
            errorStyle: "information",
          };
        }

        // Alignments
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).font = { color: { argb: "FF64748B" }, size: 9 }; // ID sedikit redup agar tidak mendominasi visual
        row.getCell(3).alignment = { horizontal: "center" };
        row.getCell(6).alignment = { horizontal: "center" };
        row.getCell(7).alignment = { horizontal: "center" };

        rowIndex++;
      }
    }
  } else {
    // Mode Kosong (Bebas): 300 baris kosong dengan Dropdown & formula lookup
    templateSheet.columns = [
      { header: "No", key: "no", width: 6 },
      { header: "ID Karyawan (Otomatis)", key: "id_karyawan", width: 38 },
      { header: "NIP (Otomatis)", key: "nip", width: 18 },
      { header: "Nama Karyawan", key: "nama_karyawan", width: 32 },
      { header: "Tanggal", key: "tanggal", width: 16 },
      { header: "Nama Shift", key: "nama_shift", width: 28 },
      { header: "Catatan", key: "catatan", width: 24 },
    ];

    const maxRows = 300;
    for (let i = 2; i <= maxRows; i++) {
      const row = templateSheet.getRow(i);
      row.getCell(1).value = i - 1;
      row.getCell(1).alignment = { horizontal: "center" };

      // Dropdown Nama Karyawan
      if (allKaryawans.length > 0) {
        row.getCell(4).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`'Master Karyawan'!$C$2:$C$${allKaryawans.length + 1}`],
          showErrorMessage: false,
          errorStyle: "information",
        };
      }

      // Formula INDEX-MATCH untuk ID Karyawan dan NIP
      row.getCell(2).value = {
        formula: `IF(D${i}="","",INDEX('Master Karyawan'!$A:$A,MATCH(D${i},'Master Karyawan'!$C:$C,0)))`,
      };
      row.getCell(2).font = { color: { argb: "FF64748B" }, italic: true, size: 9 };

      row.getCell(3).value = {
        formula: `IF(D${i}="","",INDEX('Master Karyawan'!$B:$B,MATCH(D${i},'Master Karyawan'!$C:$C,0)))`,
      };
      row.getCell(3).alignment = { horizontal: "center" };

      row.getCell(5).numFmt = "yyyy-mm-dd";
      row.getCell(5).alignment = { horizontal: "center" };

      // Dropdown Shift
      if (shifts.length > 0) {
        row.getCell(6).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`'Master Shift'!$B$2:$B$${shifts.length + 1}`],
          showErrorMessage: false,
          errorStyle: "information",
        };
      }
    }
  }

  // Styling Header Template
  const templateHeader = templateSheet.getRow(1);
  templateHeader.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  templateHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" }, // Slate 900
  };
  templateHeader.alignment = { vertical: "middle", horizontal: "center" };
  templateHeader.height = 28;

  // Catatan petunjuk di header kolom Nama Shift
  const shiftHeaderCell = mode === "schedule" ? templateSheet.getCell("H1") : templateSheet.getCell("F1");
  shiftHeaderCell.note = "Pilih dari dropdown atau ketik langsung nama shift (contoh: Pagi1.1, Siang1.6, Libur / Off, Cuti, dll).";

  // Freeze header row
  templateSheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  return workbook;
}

// GET Handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const mode = (searchParams.get("mode") as "schedule" | "blank") || "schedule";
    const karyawanIdsParam = searchParams.get("karyawan_ids");
    const karyawan_ids = karyawanIdsParam ? karyawanIdsParam.split(",").filter(Boolean) : undefined;
    const superior_id = searchParams.get("superior_id");
    const include_existing = searchParams.get("include_existing") !== "false";

    const workbook = await generatePlottingWorkbook({
      karyawan_ids,
      month,
      mode,
      include_existing,
      superior_id,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `Template_Plotting_Shift_${month}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error Generating Excel Template (GET):", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat meng-generate template.", error: error.message },
      { status: 500 }
    );
  }
}

// POST Handler (menerima payload filter yang lebih lengkap)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      karyawan_ids,
      month = new Date().toISOString().slice(0, 7),
      mode = "schedule",
      include_existing = true,
      superior_id,
    } = body;

    const workbook = await generatePlottingWorkbook({
      karyawan_ids,
      month,
      mode,
      include_existing,
      superior_id,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `Template_Plotting_Shift_${month}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error Generating Excel Template (POST):", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat meng-generate template.", error: error.message },
      { status: 500 }
    );
  }
}
