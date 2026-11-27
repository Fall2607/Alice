import pool from "@/app/lib/db";

export interface AbsensiRekapOptions {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  unit?: string | null;
  superiorId?: string | null;
}

export interface KaryawanRekapHarianItem {
  status: "hadir" | "telat" | "alpha" | "libur" | "cuti" | "izin" | "belum";
  jam_masuk?: string | null;
  jam_keluar?: string | null;
  is_late?: boolean;
  menit_terlambat?: number;
  is_pulang_cepat?: boolean;
  menit_pulang_cepat?: number;
  shift?: {
    nama_shift?: string;
    jam_masuk?: string | null;
    jam_keluar?: string | null;
  } | null;
}

export interface KaryawanRekapItem {
  id: string;
  nama: string;
  jabatan: string;
  rekap: {
    hadir: number;
    telat: number;
    alpha: number;
    libur: number;
    cuti: number;
    izin: number;
  };
  rates: {
    kehadiranFisik: number;
    cutiRate: number;
    izinRate: number;
  };
  harian: Record<string, KaryawanRekapHarianItem>;
}

export interface AbsensiRekapSummary {
  totalKaryawan: number;
  totalHadir: number;
  totalTelat: number;
  totalAlpha: number;
  totalLibur: number;
  totalCuti: number;
  totalIzin: number;
  totalDinasAktif: number;
  totalJadwalTerencana: number;
  kehadiranRate: number;
  cutiRate: number;
  izinRate: number;
}

export interface AbsensiRekapResult {
  data: KaryawanRekapItem[];
  dates: string[];
  summary: AbsensiRekapSummary;
}

export const getCutOffPeriodDates = (refDate = new Date()): { startDateStr: string; endDateStr: string } => {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const day = refDate.getDate();

  const pad2 = (n: number) => String(n).padStart(2, "0");

  let start: Date;
  let end: Date;

  if (day >= 26) {
    start = new Date(year, month, 26);
    end = new Date(year, month + 1, 25);
  } else {
    start = new Date(year, month - 1, 26);
    end = new Date(year, month, 25);
  }

  const startDateStr = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`;
  const endDateStr = `${end.getFullYear()}-${pad2(end.getMonth() + 1)}-${pad2(endCutOffDate(end))}`;

  return { startDateStr, endDateStr };
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const endCutOffDate = (d: Date) => d.getDate();

export async function calculateAbsensiRekap(options: AbsensiRekapOptions): Promise<AbsensiRekapResult> {
  const { startDate: startDateParam, endDate: endDateParam, unit: unitParam, superiorId } = options;

  const startDate = new Date(startDateParam);
  const endDate = new Date(endDateParam);

  // 1. Ambil Karyawan Aktif
  let karQuery = `
    SELECT k.id, k.nama_lengkap as nama, k.jadwal_kerja_id, jk.tipe as tipe_jadwal, lj.nama_level as jabatan, k.tanggal_keluar, k.is_active
    FROM karyawan k
    LEFT JOIN jadwal_kerja jk ON k.jadwal_kerja_id = jk.id
    LEFT JOIN jabatan j ON k.jabatan_id = j.id
    LEFT JOIN level_jabatan lj ON j.level_jabatan_id = lj.id
    WHERE k.is_active = true AND k.tanggal_keluar IS NULL
  `;
  const queryParams: any[] = [];

  if (unitParam && unitParam !== "all" && unitParam !== "Semua Unit") {
    karQuery += ` AND j.departemen_id = $${queryParams.length + 1}`;
    queryParams.push(unitParam);
  }

  if (superiorId) {
    const paramIdx = queryParams.length + 1;
    const recursiveCte = `
      WITH RECURSIVE subordinates AS (
        SELECT id FROM karyawan WHERE atasan_id = $${paramIdx}
        UNION
        SELECT k.id FROM karyawan k
        INNER JOIN subordinates s ON s.id = k.atasan_id
      )
    `;
    queryParams.push(superiorId);
    karQuery = `${recursiveCte} ${karQuery} AND k.id IN (SELECT id FROM subordinates)`;
  }

  karQuery += ` ORDER BY k.nama_lengkap ASC`;

  const karyawanRes = await pool.query(karQuery, queryParams);
  const karyawanList = karyawanRes.rows;

  if (karyawanList.length === 0) {
    return {
      data: [],
      dates: [],
      summary: {
        totalKaryawan: 0,
        totalHadir: 0,
        totalTelat: 0,
        totalAlpha: 0,
        totalLibur: 0,
        totalCuti: 0,
        totalIzin: 0,
        totalDinasAktif: 0,
        totalJadwalTerencana: 0,
        kehadiranRate: 100,
        cutiRate: 0,
        izinRate: 0,
      },
    };
  }

  const karyawanIds = karyawanList.map((k) => k.id);

  // 2. Ambil Data Absensi Date Range
  const absensiQuery = `
    SELECT karyawan_id, tanggal, jam_masuk, jam_keluar, is_late, menit_terlambat, is_pulang_cepat, menit_pulang_cepat
    FROM absensi
    WHERE tanggal >= $1 AND tanggal <= $2 AND karyawan_id = ANY($3::uuid[])
  `;
  const absensiRes = await pool.query(absensiQuery, [startDateParam, endDateParam, karyawanIds]);

  const absensiMap: Record<string, Record<string, any>> = {};
  for (const row of absensiRes.rows) {
    if (!absensiMap[row.karyawan_id]) {
      absensiMap[row.karyawan_id] = {};
    }
    const d = new Date(row.tanggal);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const dateStr = d.toISOString().split("T")[0];

    const formatTime = (timeVal: any) => {
      if (!timeVal) return null;
      const t = new Date(timeVal);
      return `${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
    };

    row.jam_masuk = formatTime(row.jam_masuk);
    row.jam_keluar = formatTime(row.jam_keluar);

    absensiMap[row.karyawan_id][dateStr] = row;
  }

  // 3. Ambil Data Shift Date Range (diperluas +6 hari untuk pengecekan piket Sabtu)
  const extendedEndDate = new Date(endDate);
  extendedEndDate.setDate(extendedEndDate.getDate() + 6);
  const extendedEndDateStr = extendedEndDate.toISOString().split("T")[0];

  const shiftQuery = `
    SELECT ks.id, ks.karyawan_id, ks.tanggal, s.nama_shift, s.jam_masuk, s.jam_keluar
    FROM karyawan_shift ks
    JOIN shift s ON ks.shift_id = s.id
    WHERE ks.tanggal >= $1 AND ks.tanggal <= $2 AND ks.karyawan_id = ANY($3::uuid[])
    ORDER BY ks.id ASC
  `;
  const shiftRes = await pool.query(shiftQuery, [startDateParam, extendedEndDateStr, karyawanIds]);

  const shiftMap: Record<string, Record<string, any>> = {};
  for (const row of shiftRes.rows) {
    if (!shiftMap[row.karyawan_id]) {
      shiftMap[row.karyawan_id] = {};
    }
    const d = new Date(row.tanggal);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const dateStr = d.toISOString().split("T")[0];

    shiftMap[row.karyawan_id][dateStr] = {
      nama_shift: row.nama_shift,
      jam_masuk: row.jam_masuk,
      jam_keluar: row.jam_keluar,
    };
  }

  // 4. Ambil Default Shift dari jadwal_kerja_detail
  const jadwalKerjaIds = Array.from(new Set(karyawanList.map((k) => k.jadwal_kerja_id).filter((id) => id)));
  const defaultShiftMap: Record<number, Record<number, any>> = {};

  if (jadwalKerjaIds.length > 0) {
    const defaultShiftQuery = `
      SELECT jkd.jadwal_kerja_id, jkd.hari, s.nama_shift, s.jam_masuk, s.jam_keluar
      FROM jadwal_kerja_detail jkd
      JOIN shift s ON jkd.shift_id = s.id
      WHERE jkd.jadwal_kerja_id = ANY($1::int[])
    `;
    const dsRes = await pool.query(defaultShiftQuery, [jadwalKerjaIds]);
    for (const row of dsRes.rows) {
      if (!defaultShiftMap[row.jadwal_kerja_id]) {
        defaultShiftMap[row.jadwal_kerja_id] = {};
      }
      defaultShiftMap[row.jadwal_kerja_id][row.hari] = {
        nama_shift: row.nama_shift,
        jam_masuk: row.jam_masuk,
        jam_keluar: row.jam_keluar,
      };
    }
  }

  // 5. Shift 8-4 untuk override piket Sabtu
  const shift84Query = `SELECT id, nama_shift, jam_masuk, jam_keluar FROM shift WHERE nama_shift LIKE '%8-4 (Senin-Jumat)%' LIMIT 1`;
  const shift84Res = await pool.query(shift84Query);
  let shift84Data: any = null;
  if (shift84Res.rows.length > 0) {
    shift84Data = {
      nama_shift: shift84Res.rows[0].nama_shift,
      jam_masuk: String(shift84Res.rows[0].jam_masuk).substring(0, 5),
      jam_keluar: String(shift84Res.rows[0].jam_keluar).substring(0, 5),
    };
  }

  // Generate rentang dates
  const dates: string[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split("T")[0]);
  }

  const todayDate = new Date();
  todayDate.setMinutes(todayDate.getMinutes() - todayDate.getTimezoneOffset());
  const todayStr = todayDate.toISOString().split("T")[0];

  const isCutiShift = (shift?: { nama_shift?: string | null } | null): boolean => {
    if (!shift?.nama_shift) return false;
    const name = shift.nama_shift.toLowerCase();
    return name.includes("cuti");
  };

  const isIzinOrSakitShift = (shift?: { nama_shift?: string | null } | null): boolean => {
    if (!shift?.nama_shift) return false;
    const name = shift.nama_shift.toLowerCase();
    return name.includes("izin") || name.includes("sakit");
  };

  const isCutiOrIzinShift = (shift?: { nama_shift?: string | null } | null): boolean => {
    return isCutiShift(shift) || isIzinOrSakitShift(shift);
  };

  const isLiburOrOffShift = (shift?: { nama_shift?: string | null; jam_masuk?: string | null } | null): boolean => {
    if (!shift) return false;
    if (isCutiOrIzinShift(shift)) return false;
    const name = (shift.nama_shift || "").toLowerCase();
    if (name.includes("libur") || name.includes("off") || name.includes("lepas")) {
      return true;
    }
    if (!shift.jam_masuk) {
      return true;
    }
    return false;
  };

  let groupHadir = 0;
  let groupTelat = 0;
  let groupAlpha = 0;
  let groupLibur = 0;
  let groupCuti = 0;
  let groupIzin = 0;

  // 6. Susun data tiap karyawan
  const data: KaryawanRekapItem[] = karyawanList.map((kar) => {
    const harian: Record<string, KaryawanRekapHarianItem> = {};
    let totalHadir = 0;
    let totalTelat = 0;
    let totalAlpha = 0;
    let totalLibur = 0;
    let totalCuti = 0;
    let totalIzin = 0;

    const hasDefaultSchedule = Boolean(
      kar.jadwal_kerja_id &&
        defaultShiftMap[kar.jadwal_kerja_id] &&
        Object.keys(defaultShiftMap[kar.jadwal_kerja_id]).length > 0
    );
    const isFixedScheduleWithDefault = kar.tipe_jadwal !== "SHIFT" && hasDefaultSchedule;

    for (const dateStr of dates) {
      const currentDate = new Date(dateStr);
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      const dbDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const absenHariIni = absensiMap[kar.id]?.[dateStr];
      let adaShift = shiftMap[kar.id]?.[dateStr];

      if (!adaShift && kar.jadwal_kerja_id) {
        adaShift = defaultShiftMap[kar.jadwal_kerja_id]?.[dbDayOfWeek] ?? defaultShiftMap[kar.jadwal_kerja_id]?.[dayOfWeek];
      }

      // Piket Sabtu override (8-5 -> 8-4)
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && adaShift && adaShift.nama_shift && adaShift.nama_shift.includes("8-5") && shift84Data) {
        const daysToSaturday = 6 - dayOfWeek;
        const satDate = new Date(currentDate);
        satDate.setDate(currentDate.getDate() + daysToSaturday);
        const satDateStr = satDate.toISOString().split("T")[0];

        const adaPiketSabtu = shiftMap[kar.id]?.[satDateStr];
        if (adaPiketSabtu && !isLiburOrOffShift(adaPiketSabtu) && !isCutiOrIzinShift(adaPiketSabtu)) {
          adaShift = shift84Data;
        }
      }

      const isCuti = isCutiShift(adaShift);
      const isIzin = isIzinOrSakitShift(adaShift);
      const isLiburPlotted = isLiburOrOffShift(adaShift);
      // Libur akhir pekan otomatis hanya berlaku bagi pegawai dengan jadwal tetap (Non-Shift) yang memiliki detail jadwal default.
      // Pegawai yang tidak terplotting shiftnya sama sekali (!adaShift) tidak dianggap libur.
      const isNormalWeekendOff = isFixedScheduleWithDefault && isWeekend && !adaShift;

      if (isCuti) {
        totalCuti++;
        harian[dateStr] = { status: "cuti", shift: adaShift };
      } else if (isIzin) {
        totalIzin++;
        harian[dateStr] = { status: "izin", shift: adaShift };
      } else if (absenHariIni) {
        totalHadir++;
        if (absenHariIni.is_late) {
          totalTelat++;
          harian[dateStr] = { status: "telat", shift: adaShift, ...absenHariIni };
        } else {
          harian[dateStr] = { status: "hadir", shift: adaShift, ...absenHariIni };
        }
      } else if (isLiburPlotted || isNormalWeekendOff) {
        totalLibur++;
        harian[dateStr] = {
          status: "libur",
          shift: adaShift || { nama_shift: "Libur", jam_masuk: null, jam_keluar: null },
        };
      } else {
        if (dateStr > todayStr) {
          harian[dateStr] = { status: "belum", shift: adaShift || null };
        } else {
          // Baik karyawan sudah terplotting shift maupun TIDAK terplotting shiftnya (!adaShift),
          // jika tanggal <= hari ini dan tidak hadir/cuti/izin/libur, wajib dihitung sebagai ALPHA
          totalAlpha++;
          harian[dateStr] = {
            status: "alpha",
            shift: adaShift || { nama_shift: "Belum Diplot (Alpha)", jam_masuk: null, jam_keluar: null },
          };
        }
      }
    }

    // Hitung persentase individual
    // Rumus Baku: ((Tepat Waktu + Terlambat + Cuti + Izin) * 100) / (Total Hari Evaluasi - Libur/Day Off)
    // Di mana:
    // - Tepat Waktu + Terlambat = totalHadir
    // - Total Hari Evaluasi (s/d hari ini) - Libur = totalHadir + totalCuti + totalIzin + totalAlpha
    const hadirPlusCutiIzin = totalHadir + totalCuti + totalIzin;
    const totalHariWajibNonLibur = hadirPlusCutiIzin + totalAlpha;
    const kehadiranFisik =
      totalHariWajibNonLibur > 0
        ? Math.min(Number(((hadirPlusCutiIzin * 100) / totalHariWajibNonLibur).toFixed(1)), 100)
        : totalLibur > 0
        ? 100
        : 0;

    // 2. Persentase Cuti & Izin terhadap total hari kerja wajib (Total Hari Evaluasi - Libur)
    const cutiRate =
      totalHariWajibNonLibur > 0 ? Number(((totalCuti * 100) / totalHariWajibNonLibur).toFixed(1)) : 0;
    const izinRate =
      totalHariWajibNonLibur > 0 ? Number(((totalIzin * 100) / totalHariWajibNonLibur).toFixed(1)) : 0;

    // Akumulasi summary
    groupHadir += totalHadir;
    groupTelat += totalTelat;
    groupAlpha += totalAlpha;
    groupLibur += totalLibur;
    groupCuti += totalCuti;
    groupIzin += totalIzin;

    return {
      id: kar.id,
      nama: kar.nama,
      jabatan: kar.jabatan || "Staff",
      rekap: {
        hadir: totalHadir,
        telat: totalTelat,
        alpha: totalAlpha,
        libur: totalLibur,
        cuti: totalCuti,
        izin: totalIzin,
      },
      rates: {
        kehadiranFisik,
        cutiRate,
        izinRate,
      },
      harian,
    };
  });

  const groupHadirPlusCutiIzin = groupHadir + groupCuti + groupIzin;
  const totalJadwalTerencana = groupHadirPlusCutiIzin + groupAlpha; // (Total Hari Evaluasi Semua Karyawan - Total Libur)
  const totalDinasAktif = totalJadwalTerencana;
  const kehadiranRate =
    totalJadwalTerencana > 0
      ? Math.min(Number(((groupHadirPlusCutiIzin * 100) / totalJadwalTerencana).toFixed(1)), 100)
      : groupLibur > 0
      ? 100
      : 0;
  const cutiRate =
    totalJadwalTerencana > 0 ? Number(((groupCuti * 100) / totalJadwalTerencana).toFixed(1)) : 0;
  const izinRate =
    totalJadwalTerencana > 0 ? Number(((groupIzin * 100) / totalJadwalTerencana).toFixed(1)) : 0;

  return {
    data,
    dates,
    summary: {
      totalKaryawan: karyawanList.length,
      totalHadir: groupHadir,
      totalTelat: groupTelat,
      totalAlpha: groupAlpha,
      totalLibur: groupLibur,
      totalCuti: groupCuti,
      totalIzin: groupIzin,
      totalDinasAktif,
      totalJadwalTerencana,
      kehadiranRate,
      cutiRate,
      izinRate,
    },
  };
}
