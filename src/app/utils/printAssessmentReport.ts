/**
 * Path: src/app/utils/printAssessmentReport.ts
 * Deskripsi: Generator dokumen cetak A4 (Print / Save as PDF) untuk Laporan Psikometri & Evaluasi Essay Kandidat RSU Avisena.
 * Format: Formal Rumah Sakit (Kop RSU Avisena, Identitas, MBTI, DISC, CFIT, Tabel 20 Dimensi PAPI Kostick, Essay Lengkap, dan Kolom Pengesahan).
 */

import {
  PAPI_CATEGORIES,
  getPAPIData,
  getPAPIScoreLevel,
} from "@/app/data/tests/papiInterpretations";
import { getDISCProfileDetail } from "@/app/utils/discUtils";
import { getMBTIProfileDetail } from "@/app/utils/mbtiUtils";
import type { EssayResultRecord } from "@/app/components/admin/EssayReviewPanel";

export interface PrintableJobInfo {
  id: string;
  title: string;
  category?: string;
  nama_job?: string;
  unit_name?: string | null;
  requester_name?: string | null;
}

export interface PrintableCandidateDetail {
  id?: string;
  nama: string;
  email?: string;
  no_whatsapp?: string;
  tanggal_lahir?: string;
  status_pernikahan?: string;
  agama?: string;
  assessment_results?: {
    session?: {
      token?: string;
      status?: string;
      completed_at?: string;
      scheduled_date?: string;
    };
    mbti?: {
      final_result?: string;
      score_e?: number | string;
      score_i?: number | string;
      score_s?: number | string;
      score_n?: number | string;
      score_t?: number | string;
      score_f?: number | string;
      score_j?: number | string;
      score_p?: number | string;
    } | null;
    disc?: {
      most_d?: number | string;
      most_i?: number | string;
      most_s?: number | string;
      most_c?: number | string;
      least_d?: number | string;
      least_i?: number | string;
      least_s?: number | string;
      least_c?: number | string;
      diff_d?: number | string;
      diff_i?: number | string;
      diff_s?: number | string;
      diff_c?: number | string;
    } | null;
    papi?: Record<string, number | string> | null;
    cfit?: {
      subtest_1_score?: number | string;
      subtest_2_score?: number | string;
      subtest_3_score?: number | string;
      subtest_4_score?: number | string;
      total_score?: number | string;
      iq_score?: number | string;
      category?: string;
    } | null;
    essay?: EssayResultRecord | null;
    essay_required?: boolean;
    essay_bundle_name?: string | null;
  };
}

function escapeHtml(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  return String(raw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateWIB(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

function formatDateTimeWIB(dateInput?: Date | string | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return "-";
  return (
    d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }) +
    " pukul " +
    d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }) +
    " WIB"
  );
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} menit ${secs} detik`;
}

function getCFITCapacityDescription(iqScore: number): string {
  if (iqScore >= 140) {
    return "Daya tangkap sangat cepat, kemampuan penalaran logis serta pemecahan masalah non-verbal tingkat sangat superior.";
  }
  if (iqScore >= 120) {
    return "Kemampuan berpikir analitis dan pemahaman hubungan pola berada di atas rata-rata populasi umum.";
  }
  if (iqScore >= 110) {
    return "Daya nalar baik (High Average), adaptif dalam memahami alur kerja terstruktur dan instruksi operasional baru.";
  }
  if (iqScore >= 90) {
    return "Kapasitas intelektual rata-rata (Normal) dengan kemampuan nalar fungsional yang stabil dalam aktivitas operasional.";
  }
  if (iqScore >= 80) {
    return "Kapasitas intelektual Low Average; memerlukan panduan terstruktur saat memproses materi kompleks atau abstraksi tinggi.";
  }
  return "Memerlukan pendampingan intensif serta instruksi teknis yang konkret dan berulang.";
}

export function printAssessmentReport(options: {
  candidate: PrintableCandidateDetail;
  job: PrintableJobInfo;
  printedBy?: string;
}): void {
  const { candidate, job, printedBy } = options;
  const results = candidate.assessment_results;
  if (!results) return;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoUrl = `${origin}/brand-avisena.png`;

  // 1. Hitung usia jika ada tanggal lahir
  let ageText = "-";
  if (candidate.tanggal_lahir) {
    const birthYear = new Date(candidate.tanggal_lahir).getFullYear();
    if (!isNaN(birthYear)) {
      ageText = `${new Date().getFullYear() - birthYear} Tahun`;
    }
  }

  // 2. Olah Data MBTI
  const mbti = results.mbti;
  let mbtiHtml = `<div class="empty-box">Kandidat belum menyelesaikan modul ujian MBTI.</div>`;
  let mbtiSummaryBadge = "-";

  if (mbti && mbti.final_result) {
    const scoreE = Number(mbti.score_e || 0);
    const scoreI = Number(mbti.score_i || 0);
    const scoreS = Number(mbti.score_s || 0);
    const scoreN = Number(mbti.score_n || 0);
    const scoreT = Number(mbti.score_t || 0);
    const scoreF = Number(mbti.score_f || 0);
    const scoreJ = Number(mbti.score_j || 0);
    const scoreP = Number(mbti.score_p || 0);

    const ePct = Math.round((scoreE / (scoreE + scoreI || 1)) * 100);
    const iPct = 100 - ePct;
    const sPct = Math.round((scoreS / (scoreS + scoreN || 1)) * 100);
    const nPct = 100 - sPct;
    const tPct = Math.round((scoreT / (scoreT + scoreF || 1)) * 100);
    const fPct = 100 - tPct;
    const jPct = Math.round((scoreJ / (scoreJ + scoreP || 1)) * 100);
    const pPct = 100 - jPct;

    const profile = getMBTIProfileDetail(mbti.final_result);
    mbtiSummaryBadge = profile?.julukan
      ? `${mbti.final_result} (${profile.julukan})`
      : mbti.final_result;

    mbtiHtml = `
      <div class="card-block">
        <div class="highlight-banner">
          <div>
            <span class="label-tiny">Tipe Kepribadian MBTI</span>
            <div class="big-code">${escapeHtml(mbti.final_result)}</div>
          </div>
          <div style="text-align: right;">
            <span class="label-tiny">Klasifikasi / Julukan</span>
            <div class="sub-highlight">${escapeHtml(profile?.julukan || "Profil Standar")}</div>
          </div>
        </div>

        <table class="data-table" style="margin-top: 8px;">
          <thead>
            <tr>
              <th style="width: 28%;">Kutub Kiri</th>
              <th style="width: 44%; text-align: center;">Proporsi Kecenderungan</th>
              <th style="width: 28%; text-align: right;">Kutub Kanan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong class="${scoreE >= scoreI ? "text-primary" : ""}">Extraversion (E)</strong> — <span class="mono">${ePct}%</span></td>
              <td>
                <div class="dual-bar">
                  <div class="bar-left" style="width: ${ePct}%;"></div>
                </div>
              </td>
              <td style="text-align: right;"><span class="mono">${iPct}%</span> — <strong class="${scoreI > scoreE ? "text-primary" : ""}">Introversion (I)</strong></td>
            </tr>
            <tr>
              <td><strong class="${scoreS >= scoreN ? "text-primary" : ""}">Sensing (S)</strong> — <span class="mono">${sPct}%</span></td>
              <td>
                <div class="dual-bar">
                  <div class="bar-left" style="width: ${sPct}%;"></div>
                </div>
              </td>
              <td style="text-align: right;"><span class="mono">${nPct}%</span> — <strong class="${scoreN > scoreS ? "text-primary" : ""}">Intuition (N)</strong></td>
            </tr>
            <tr>
              <td><strong class="${scoreT >= scoreF ? "text-primary" : ""}">Thinking (T)</strong> — <span class="mono">${tPct}%</span></td>
              <td>
                <div class="dual-bar">
                  <div class="bar-left" style="width: ${tPct}%;"></div>
                </div>
              </td>
              <td style="text-align: right;"><span class="mono">${fPct}%</span> — <strong class="${scoreF > scoreT ? "text-primary" : ""}">Feeling (F)</strong></td>
            </tr>
            <tr>
              <td><strong class="${scoreJ >= scoreP ? "text-primary" : ""}">Judging (J)</strong> — <span class="mono">${jPct}%</span></td>
              <td>
                <div class="dual-bar">
                  <div class="bar-left" style="width: ${jPct}%;"></div>
                </div>
              </td>
              <td style="text-align: right;"><span class="mono">${pPct}%</span> — <strong class="${scoreP > scoreJ ? "text-primary" : ""}">Perceiving (P)</strong></td>
            </tr>
          </tbody>
        </table>

        ${
          profile
            ? `
          <div class="grid-3" style="margin-top: 8px;">
            <div class="info-cell">
              <div class="cell-title">Ciri-Ciri Umum</div>
              <p>${escapeHtml(profile.ciri_ciri_umum)}</p>
            </div>
            <div class="info-cell">
              <div class="cell-title">Kontribusi pada Organisasi</div>
              <p>${escapeHtml(profile.kontribusi_pada_organisasi)}</p>
            </div>
            <div class="info-cell">
              <div class="cell-title">Area Pengembangan / Kelemahan</div>
              <p>${escapeHtml(profile.kelemahan)}</p>
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  // 3. Olah Data DISC
  const disc = results.disc;
  let discHtml = `<div class="empty-box">Kandidat belum menyelesaikan modul ujian DISC.</div>`;
  let discSummaryBadge = "-";

  if (disc) {
    const diffD = Number(disc.diff_d || 0);
    const diffI = Number(disc.diff_i || 0);
    const diffS = Number(disc.diff_s || 0);
    const diffC = Number(disc.diff_c || 0);

    const diffMap: Record<string, number> = { D: diffD, I: diffI, S: diffS, C: diffC };
    const dims: Array<"D" | "I" | "S" | "C"> = ["D", "I", "S", "C"];
    const positive = dims
      .filter((d) => diffMap[d] >= 0)
      .sort((a, b) => diffMap[b] - diffMap[a])
      .join("");
    const negative = dims
      .filter((d) => diffMap[d] < 0)
      .sort((a, b) => diffMap[b] - diffMap[a])
      .join("");
    const pattern = `${positive}/${negative}`;
    const profile = getDISCProfileDetail({ positive, negative, pattern });

    discSummaryBadge = profile?.karakter_utama
      ? `${pattern} (${profile.karakter_utama})`
      : pattern;

    discHtml = `
      <div class="card-block">
        <div class="highlight-banner">
          <div>
            <span class="label-tiny">Pola Profil DISC (Midline 0)</span>
            <div class="big-code">${escapeHtml(pattern)}</div>
          </div>
          <div>
            <span class="label-tiny">Klasifikasi &amp; Karakter Utama</span>
            <div class="sub-highlight">${escapeHtml(profile?.tipe || "-")} — ${escapeHtml(profile?.karakter_utama || "-")}</div>
          </div>
          <div style="text-align: right;">
            <span class="label-tiny">Distribusi Kutub</span>
            <div class="mono" style="font-size: 11px; font-weight: 700; color: #0f172a;">
              Positif (&ge;0): ${escapeHtml(positive || "-")} | Negatif (&lt;0): ${escapeHtml(negative || "-")}
            </div>
          </div>
        </div>

        <table class="data-table" style="margin-top: 8px; text-align: center;">
          <thead>
            <tr>
              <th style="text-align: left;">Dimensi Perilaku DISC</th>
              <th>Skor Most (Mask/Publik)</th>
              <th>Skor Least (Core/Pribadi)</th>
              <th>Selisih / Diff (Change)</th>
              <th>Status Midline</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: left;"><strong>D — Dominance</strong> (Kendali, Tegas, Hasil)</td>
              <td class="mono">${escapeHtml(disc.most_d ?? 0)}</td>
              <td class="mono">${escapeHtml(disc.least_d ?? 0)}</td>
              <td class="mono"><strong>${diffD > 0 ? `+${diffD}` : diffD}</strong></td>
              <td><span class="pill ${diffD >= 0 ? "pill-high" : "pill-low"}">${diffD >= 0 ? "Dominan (>=0)" : "Rendah (<0)"}</span></td>
            </tr>
            <tr>
              <td style="text-align: left;"><strong>I — Influence</strong> (Komunikasi, Sosial, Persuasi)</td>
              <td class="mono">${escapeHtml(disc.most_i ?? 0)}</td>
              <td class="mono">${escapeHtml(disc.least_i ?? 0)}</td>
              <td class="mono"><strong>${diffI > 0 ? `+${diffI}` : diffI}</strong></td>
              <td><span class="pill ${diffI >= 0 ? "pill-high" : "pill-low"}">${diffI >= 0 ? "Dominan (>=0)" : "Rendah (<0)"}</span></td>
            </tr>
            <tr>
              <td style="text-align: left;"><strong>S — Steadiness</strong> (Kestabilan, Sabar, Harmoni)</td>
              <td class="mono">${escapeHtml(disc.most_s ?? 0)}</td>
              <td class="mono">${escapeHtml(disc.least_s ?? 0)}</td>
              <td class="mono"><strong>${diffS > 0 ? `+${diffS}` : diffS}</strong></td>
              <td><span class="pill ${diffS >= 0 ? "pill-high" : "pill-low"}">${diffS >= 0 ? "Dominan (>=0)" : "Rendah (<0)"}</span></td>
            </tr>
            <tr>
              <td style="text-align: left;"><strong>C — Compliance</strong> (Kepatuhan SOP, Akurasi, Analitis)</td>
              <td class="mono">${escapeHtml(disc.most_c ?? 0)}</td>
              <td class="mono">${escapeHtml(disc.least_c ?? 0)}</td>
              <td class="mono"><strong>${diffC > 0 ? `+${diffC}` : diffC}</strong></td>
              <td><span class="pill ${diffC >= 0 ? "pill-high" : "pill-low"}">${diffC >= 0 ? "Dominan (>=0)" : "Rendah (<0)"}</span></td>
            </tr>
          </tbody>
        </table>

        ${
          profile
            ? `
          <div class="info-cell" style="margin-top: 8px;">
            <div class="cell-title">Deskripsi Umum Kepribadian DISC</div>
            <p>${escapeHtml(profile.deskripsi)}</p>
          </div>
          <div class="grid-3" style="margin-top: 6px;">
            <div class="info-cell">
              <div class="cell-title">Kelebihan &amp; Potensi</div>
              <p>${escapeHtml(profile.kelebihan)}</p>
            </div>
            <div class="info-cell">
              <div class="cell-title">Area Pengembangan / Kekurangan</div>
              <p>${escapeHtml(profile.kekurangan)}</p>
            </div>
            <div class="info-cell">
              <div class="cell-title">Rekomendasi Bidang / Posisi</div>
              <p>${escapeHtml(profile.posisi_yang_sesuai)}</p>
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  // 4. Olah Data CFIT
  const cfit = results.cfit;
  let cfitHtml = `<div class="empty-box">Kandidat belum menyelesaikan modul ujian CFIT Skala 3.</div>`;
  let cfitSummaryBadge = "-";

  if (cfit) {
    const s1 = Number(cfit.subtest_1_score || 0);
    const s2 = Number(cfit.subtest_2_score || 0);
    const s3 = Number(cfit.subtest_3_score || 0);
    const s4 = Number(cfit.subtest_4_score || 0);
    const total = Number(cfit.total_score || s1 + s2 + s3 + s4);
    const iq = Number(cfit.iq_score || 0);
    const cat = cfit.category || "Average (Rata-rata)";
    const desc = getCFITCapacityDescription(iq);

    cfitSummaryBadge = `IQ ${iq} (${cat})`;

    cfitHtml = `
      <div class="card-block">
        <div class="highlight-banner">
          <div>
            <span class="label-tiny">Skor Estimasi IQ (CFIT Skala 3)</span>
            <div class="big-code mono">${iq}</div>
          </div>
          <div>
            <span class="label-tiny">Klasifikasi Inteligensi</span>
            <div class="sub-highlight">${escapeHtml(cat)}</div>
          </div>
          <div style="text-align: right;">
            <span class="label-tiny">Total Jawaban Benar</span>
            <div class="mono" style="font-size: 14px; font-weight: 800; color: #05445e;">${total} / 50 Soal (${Math.round((total / 50) * 100)}%)</div>
          </div>
        </div>

        <table class="data-table" style="margin-top: 8px; text-align: center;">
          <thead>
            <tr>
              <th style="text-align: left;">Subtes CFIT Skala 3 Form A</th>
              <th>Aspek Kognitif yang Diukur</th>
              <th>Skor Benar</th>
              <th>Persentase Akurasi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: left;"><strong>Subtes 1 — Series</strong></td>
              <td style="text-align: left;">Penalaran sekuensial &amp; kelanjutan pola progresif</td>
              <td class="mono"><strong>${s1}</strong> / 13</td>
              <td class="mono">${Math.round((s1 / 13) * 100)}%</td>
            </tr>
            <tr>
              <td style="text-align: left;"><strong>Subtes 2 — Classification</strong></td>
              <td style="text-align: left;">Identifikasi perbedaan konsep &amp; kategorisasi abstrak</td>
              <td class="mono"><strong>${s2}</strong> / 14</td>
              <td class="mono">${Math.round((s2 / 14) * 100)}%</td>
            </tr>
            <tr>
              <td style="text-align: left;"><strong>Subtes 3 — Matrices</strong></td>
              <td style="text-align: left;">Analogi matriks spasial &amp; sintesis hubungan logis</td>
              <td class="mono"><strong>${s3}</strong> / 13</td>
              <td class="mono">${Math.round((s3 / 13) * 100)}%</td>
            </tr>
            <tr>
              <td style="text-align: left;"><strong>Subtes 4 — Conditions (Topology)</strong></td>
              <td style="text-align: left;">Pemahaman struktur ruang &amp; relasi topologi</td>
              <td class="mono"><strong>${s4}</strong> / 10</td>
              <td class="mono">${Math.round((s4 / 10) * 100)}%</td>
            </tr>
          </tbody>
        </table>

        <div class="info-cell" style="margin-top: 8px;">
          <div class="cell-title">Interpretasi Kapasitas Intelektual</div>
          <p>${escapeHtml(desc)}</p>
        </div>
      </div>
    `;
  }

  // 5. Olah Data PAPI Kostick (20 Dimensi Lengkap)
  const papi = results.papi;
  let papiHtml = `<div class="empty-box">Kandidat belum menyelesaikan modul ujian PAPI Kostick.</div>`;

  if (papi && Object.keys(papi).length > 0) {
    const normalizedScores: Record<string, number> = {};
    Object.keys(papi).forEach((k) => {
      normalizedScores[k] = Number(papi[k] || 0);
    });

    let rowsHtml = "";
    PAPI_CATEGORIES.forEach((cat) => {
      cat.traits.forEach((trait, idx) => {
        const val = Number(
          normalizedScores[trait.key] ??
            normalizedScores[trait.code] ??
            normalizedScores[trait.code.toLowerCase()] ??
            0
        );
        const levelInfo = getPAPIScoreLevel(val);
        const interpretation = getPAPIData(trait.code, val).text;
        const pillClass =
          levelInfo.level === "high"
            ? "pill-high"
            : levelInfo.level === "medium"
            ? "pill-med"
            : "pill-low";

        rowsHtml += `
          <tr>
            ${
              idx === 0
                ? `<td rowspan="${cat.traits.length}" style="font-weight: 700; color: #05445e; background: #f8fafc; vertical-align: top;">${escapeHtml(cat.title)}</td>`
                : ""
            }
            <td style="text-align: center; font-weight: 800;" class="mono">${escapeHtml(trait.code)}</td>
            <td><strong>${escapeHtml(trait.label)}</strong></td>
            <td style="text-align: center; font-weight: 800;" class="mono">${val} / 9</td>
            <td style="text-align: center;"><span class="pill ${pillClass}">${escapeHtml(levelInfo.label)}</span></td>
            <td style="font-size: 10.5px; line-height: 1.4;">${escapeHtml(interpretation)}</td>
          </tr>
        `;
      });
    });

    papiHtml = `
      <div class="card-block">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 17%;">Domain Aspek</th>
              <th style="width: 6%; text-align: center;">Kode</th>
              <th style="width: 21%;">Dimensi Peran / Kebutuhan</th>
              <th style="width: 8%; text-align: center;">Skor</th>
              <th style="width: 9%; text-align: center;">Kategori</th>
              <th style="width: 39%;">Interpretasi Psikologis Perilaku Kerja</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // 6. Olah Data Evaluasi Essay Kompetensi
  const essay = results.essay;
  const essayRequired = Boolean(results.essay_required || essay);
  let essaySummaryBadge = "Tidak Diwajibkan";
  let essaySectionHtml = "";

  if (essayRequired) {
    if (!essay) {
      essaySummaryBadge = "Menunggu Jawaban";
      essaySectionHtml = `
        <div class="section-block">
          <div class="section-header">
            <span class="section-num">VI</span>
            <h2>EVALUASI TES ESSAY KOMPETENSI (${escapeHtml(results.essay_bundle_name || "Bundel Essay")})</h2>
          </div>
          <div class="empty-box">Kandidat belum mengumpulkan jawaban tes essay kompetensi.</div>
        </div>
      `;
    } else {
      const decisionLabel =
        essay.review_decision === "LOLOS"
          ? "LOLOS EVALUASI ESSAY"
          : essay.review_decision === "TIDAK_LOLOS"
          ? "TIDAK LOLOS EVALUASI ESSAY"
          : "MENUNGGU PENILAIAN EVALUATOR";

      essaySummaryBadge =
        essay.review_decision === "LOLOS"
          ? "LOLOS"
          : essay.review_decision === "TIDAK_LOLOS"
          ? "TIDAK LOLOS"
          : "Perlu Review";

      const decisionPillClass =
        essay.review_decision === "LOLOS"
          ? "pill-high"
          : essay.review_decision === "TIDAK_LOLOS"
          ? "pill-danger"
          : "pill-med";

      const qNotes = essay.question_notes || {};
      const answersHtml = (essay.answers || [])
        .map((ans, idx) => {
          const noteForQ = qNotes[ans.question_id]?.trim();
          return `
            <div class="essay-item">
              <div class="essay-q-header">
                <span class="essay-q-num">Soal #${ans.urutan || idx + 1}</span>
                <span class="essay-q-text">${escapeHtml(ans.pertanyaan)}</span>
              </div>
              ${
                ans.panduan_penilaian
                  ? `<div class="essay-rubric"><strong>Panduan / Kunci Penilaian:</strong> ${escapeHtml(ans.panduan_penilaian)}</div>`
                  : ""
              }
              <div class="essay-answer-box">
                <div class="cell-title">Jawaban Kandidat:</div>
                <div class="essay-answer-content">${escapeHtml(ans.answer || "(Tidak dijawab)")}</div>
              </div>
              ${
                noteForQ
                  ? `<div class="essay-reviewer-note"><strong>Catatan Penilai:</strong> ${escapeHtml(noteForQ)}</div>`
                  : ""
              }
            </div>
          `;
        })
        .join("");

      essaySectionHtml = `
        <div class="section-block">
          <div class="section-header">
            <span class="section-num">VI</span>
            <h2>EVALUASI TES ESSAY KOMPETENSI — ${escapeHtml(results.essay_bundle_name || "Bundel Essay Teknis")}</h2>
          </div>

          <div class="card-block">
            <table class="meta-table" style="margin-bottom: 10px;">
              <tbody>
                <tr>
                  <td class="meta-label">Keputusan Evaluasi</td>
                  <td><span class="pill ${decisionPillClass}" style="font-size: 11px;">${escapeHtml(decisionLabel)}</span></td>
                  <td class="meta-label">Waktu Pengerjaan</td>
                  <td class="mono">${escapeHtml(formatDuration(essay.time_spent_seconds))}</td>
                </tr>
                <tr>
                  <td class="meta-label">Dinilai Oleh</td>
                  <td><strong>${escapeHtml(essay.reviewed_by_name || "-")}</strong></td>
                  <td class="meta-label">Tanggal Penilaian</td>
                  <td class="mono">${escapeHtml(formatDateWIB(essay.reviewed_at || essay.submitted_at))}</td>
                </tr>
                ${
                  essay.review_notes
                    ? `
                  <tr>
                    <td class="meta-label">Kesimpulan Penilai</td>
                    <td colspan="3" style="background: #f8fafc; font-weight: 600; color: #0f172a;">
                      ${escapeHtml(essay.review_notes)}
                    </td>
                  </tr>
                `
                    : ""
                }
              </tbody>
            </table>

            <div style="margin-top: 8px;">
              ${answersHtml}
            </div>
          </div>
        </div>
      `;
    }
  }

  // 7. Susun HTML Lengkap A4
  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Laporan Psikometri - ${escapeHtml(candidate.nama)} - RSU Avisena</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.45;
    }
    .mono {
      font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
      font-variant-numeric: tabular-nums;
    }
    .text-primary {
      color: #0173b6;
    }

    /* Toolbar Layar (Hilang saat diprint) */
    .screen-toolbar {
      background: #05445e;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
    }
    .screen-toolbar button {
      background: #0173b6;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }
    .screen-toolbar button.btn-close {
      background: rgba(255,255,255,0.15);
      margin-left: 8px;
    }
    .page-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 16px 20px;
    }
    @media print {
      .screen-toolbar {
        display: none !important;
      }
      .page-container {
        max-width: 100%;
        padding: 0;
        margin: 0;
      }
    }

    /* Kop Surat RSU Avisena */
    .letterhead {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px double #05445e;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .lh-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .lh-logo {
      width: 58px;
      height: 58px;
      object-fit: contain;
    }
    .lh-title h1 {
      margin: 0;
      font-size: 17px;
      font-weight: 900;
      color: #05445e;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .lh-title p {
      margin: 2px 0 0 0;
      font-size: 10.5px;
      color: #475569;
      font-weight: 600;
    }
    .lh-right {
      text-align: right;
      font-size: 10px;
      color: #475569;
    }
    .lh-badge {
      display: inline-block;
      background: #05445e;
      color: #ffffff;
      font-weight: 800;
      font-size: 9.5px;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 4px;
    }

    /* Judul Dokumen */
    .doc-title-bar {
      text-align: center;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 14px;
    }
    .doc-title-bar h2 {
      margin: 0;
      font-size: 13.5px;
      font-weight: 800;
      color: #05445e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-title-bar p {
      margin: 2px 0 0 0;
      font-size: 10px;
      color: #475569;
    }

    /* Section Block */
    .section-block {
      margin-bottom: 14px;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #05445e;
      color: #ffffff;
      padding: 5px 10px;
      border-radius: 5px;
      margin-bottom: 8px;
      page-break-after: avoid;
      break-after: avoid;
    }
    .section-num {
      background: #0173b6;
      color: #ffffff;
      font-weight: 800;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 3px;
    }
    .section-header h2 {
      margin: 0;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* Tables */
    .meta-table, .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
    }
    .meta-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
    }
    .meta-label {
      background: #f8fafc;
      font-weight: 700;
      color: #334155;
      width: 18%;
    }
    .meta-val {
      width: 32%;
      color: #0f172a;
    }

    .data-table th {
      background: #f1f5f9;
      color: #05445e;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9.5px;
      letter-spacing: 0.4px;
      border: 1px solid #cbd5e1;
      padding: 5px 7px;
    }
    .data-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 7px;
      vertical-align: middle;
    }
    .data-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Highlight Banner inside Section */
    .highlight-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #0173b6;
      border-radius: 5px;
      padding: 8px 12px;
    }
    .label-tiny {
      display: block;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.4px;
    }
    .big-code {
      font-size: 18px;
      font-weight: 900;
      color: #05445e;
      line-height: 1.2;
    }
    .sub-highlight {
      font-size: 12px;
      font-weight: 800;
      color: #0173b6;
    }

    /* Progress Bar */
    .dual-bar {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 99px;
      overflow: hidden;
    }
    .bar-left {
      height: 100%;
      background: #0173b6;
    }

    /* Info Grid */
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }
    .info-cell {
      border: 1px solid #cbd5e1;
      background: #fcfcfd;
      border-radius: 5px;
      padding: 6px 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .cell-title {
      font-size: 9.5px;
      font-weight: 800;
      color: #05445e;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .info-cell p {
      margin: 0;
      font-size: 10px;
      color: #334155;
      line-height: 1.4;
    }

    /* Pills */
    .pill {
      display: inline-block;
      padding: 1.5px 7px;
      border-radius: 99px;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .pill-high {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .pill-med {
      background: #e0f2fe;
      color: #075985;
      border: 1px solid #bae6fd;
    }
    .pill-low {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    .pill-danger {
      background: #ffe4e6;
      color: #9f1239;
      border: 1px solid #fecdd3;
    }

    /* Essay Items */
    .essay-item {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 8px 10px;
      margin-bottom: 8px;
      background: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .essay-q-header {
      display: flex;
      gap: 8px;
      align-items: baseline;
      margin-bottom: 5px;
    }
    .essay-q-num {
      background: #05445e;
      color: #ffffff;
      font-weight: 800;
      font-size: 9.5px;
      padding: 1.5px 6px;
      border-radius: 3px;
      white-space: nowrap;
    }
    .essay-q-text {
      font-weight: 700;
      color: #0f172a;
      font-size: 11px;
    }
    .essay-rubric {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      margin-bottom: 5px;
    }
    .essay-answer-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 6px 8px;
      border-radius: 4px;
    }
    .essay-answer-content {
      white-space: pre-wrap;
      font-size: 10.5px;
      color: #1e293b;
    }
    .essay-reviewer-note {
      margin-top: 5px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      color: #0369a1;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
    }

    .empty-box {
      border: 1px dashed #cbd5e1;
      background: #f8fafc;
      padding: 10px;
      text-align: center;
      color: #64748b;
      font-style: italic;
      border-radius: 5px;
    }

    /* Signature Section */
    .signature-block {
      margin-top: 18px;
      border-top: 1px solid #cbd5e1;
      padding-top: 12px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 8px;
      text-align: center;
    }
    .sig-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      background: #fcfcfd;
    }
    .sig-role {
      font-size: 10px;
      font-weight: 800;
      color: #05445e;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .sig-space {
      height: 54px;
    }
    .sig-name {
      font-weight: 800;
      font-size: 11px;
      color: #0f172a;
      border-top: 1px solid #94a3b8;
      display: inline-block;
      min-width: 180px;
      padding-top: 3px;
    }
    .sig-sub {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 1px;
    }
    .doc-footer {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <div class="screen-toolbar">
    <div>
      <strong>Pratinjau Cetak Laporan Psikometri &amp; Essay</strong> — ${escapeHtml(candidate.nama)}
    </div>
    <div>
      <button onclick="window.print()">Cetak / Simpan PDF</button>
      <button class="btn-close" onclick="window.close()">Tutup</button>
    </div>
  </div>

  <div class="page-container">
    <!-- KOP SURAT RSU AVISENA -->
    <div class="letterhead">
      <div class="lh-left">
        <img src="${logoUrl}" alt="Logo RSU Avisena" class="lh-logo" onerror="this.style.display='none'" />
        <div class="lh-title">
          <h1>Rumah Sakit Umum Avisena</h1>
          <p>Divisi Human Capital, Rekrutmen &amp; Pengembangan SDM</p>
          <p>Jl. Melong Raya No. 170, Cimahi Selatan, Kota Cimahi — Jawa Barat</p>
        </div>
      </div>
      <div class="lh-right">
        <span class="lh-badge">Dokumen Rahasia SDM</span>
        <div class="mono">Token: <strong>${escapeHtml(results.session?.token || "-")}</strong></div>
        <div class="mono">Dicetak: ${escapeHtml(formatDateTimeWIB(new Date()))}</div>
      </div>
    </div>

    <!-- JUDUL LAPORAN -->
    <div class="doc-title-bar">
      <h2>Laporan Hasil Evaluasi Psikometri &amp; Uji Kompetensi Kandidat</h2>
      <p>Rekapitulasi Pemeriksaan MBTI, DISC, PAPI Kostick, CFIT Skala 3, dan Evaluasi Essay Teknis</p>
    </div>

    <!-- I. IDENTITAS KANDIDAT & RINGKASAN EKSEKUTIF -->
    <div class="section-block">
      <div class="section-header">
        <span class="section-num">I</span>
        <h2>Identitas Kandidat &amp; Ringkasan Hasil Evaluasi</h2>
      </div>
      <table class="meta-table">
        <tbody>
          <tr>
            <td class="meta-label">Nama Kandidat</td>
            <td class="meta-val"><strong>${escapeHtml(candidate.nama)}</strong></td>
            <td class="meta-label">Posisi Dilamar</td>
            <td class="meta-val"><strong>${escapeHtml(job.title)}</strong> (${escapeHtml(job.category || "Umum")})</td>
          </tr>
          <tr>
            <td class="meta-label">Email &amp; No. WA</td>
            <td class="meta-val mono">${escapeHtml(candidate.email || "-")} / ${escapeHtml(candidate.no_whatsapp || "-")}</td>
            <td class="meta-label">Unit / Pemohon</td>
            <td class="meta-val">${escapeHtml(job.unit_name || "-")} ${job.requester_name ? `(${escapeHtml(job.requester_name)})` : ""}</td>
          </tr>
          <tr>
            <td class="meta-label">Usia / Status</td>
            <td class="meta-val">${escapeHtml(ageText)} / ${escapeHtml(candidate.status_pernikahan || "-")} (${escapeHtml(candidate.agama || "-")})</td>
            <td class="meta-label">Status Sesi Tes</td>
            <td class="meta-val"><span class="pill ${results.session?.status === "COMPLETED" ? "pill-high" : "pill-med"}">${escapeHtml(results.session?.status || "COMPLETED")}</span></td>
          </tr>
          <tr>
            <td class="meta-label">Ringkasan MBTI</td>
            <td class="meta-val"><strong>${escapeHtml(mbtiSummaryBadge)}</strong></td>
            <td class="meta-label">Ringkasan DISC</td>
            <td class="meta-val"><strong>${escapeHtml(discSummaryBadge)}</strong></td>
          </tr>
          <tr>
            <td class="meta-label">Skor IQ (CFIT)</td>
            <td class="meta-val"><strong>${escapeHtml(cfitSummaryBadge)}</strong></td>
            <td class="meta-label">Evaluasi Essay</td>
            <td class="meta-val"><strong>${escapeHtml(essaySummaryBadge)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- II. MBTI -->
    <div class="section-block">
      <div class="section-header">
        <span class="section-num">II</span>
        <h2>Profil Kepribadian MBTI (Myers-Briggs Type Indicator)</h2>
      </div>
      ${mbtiHtml}
    </div>

    <!-- III. DISC -->
    <div class="section-block">
      <div class="section-header">
        <span class="section-num">III</span>
        <h2>Profil Perilaku Kerja DISC (Dominance, Influence, Steadiness, Compliance)</h2>
      </div>
      ${discHtml}
    </div>

    <!-- IV. CFIT -->
    <div class="section-block">
      <div class="section-header">
        <span class="section-num">IV</span>
        <h2>Kapasitas Intelektual CFIT (Culture Fair Intelligence Test — Skala 3 Form A)</h2>
      </div>
      ${cfitHtml}
    </div>

    <!-- V. PAPI KOSTICK -->
    <div class="section-block">
      <div class="section-header">
        <span class="section-num">V</span>
        <h2>Profil Peran &amp; Kebutuhan Kerja PAPI Kostick (20 Dimensi)</h2>
      </div>
      ${papiHtml}
    </div>

    <!-- VI. ESSAY KOMPETENSI (Jika ada) -->
    ${essaySectionHtml}

    <!-- VII. LEMBAR PENGESAHAN & TANDA TANGAN -->
    <div class="signature-block">
      <div style="font-size: 10px; color: #334155; margin-bottom: 6px;">
        Demikian berita acara dan laporan evaluasi psikometri serta uji kompetensi ini dibuat secara objektif melalui sistem <strong>Alice HRIS RSU Avisena</strong> untuk digunakan sebagai dasar pertimbangan seleksi penerimaan pegawai.
      </div>
      <div class="sig-grid">
        <div class="sig-box">
          <div class="sig-role">Diperiksa &amp; Dievaluasi Oleh,</div>
          <div class="sig-sub">Human Capital &amp; Recruitment RSU Avisena</div>
          <div class="sig-space"></div>
          <div class="sig-name">${escapeHtml(essay?.reviewed_by_name || printedBy || "................................................")}</div>
          <div class="sig-sub">Tim Rekrutmen &amp; Seleksi SDM</div>
        </div>
        <div class="sig-box">
          <div class="sig-role">Mengetahui &amp; Menyetujui,</div>
          <div class="sig-sub">Kepala Unit / User Pemohon (${escapeHtml(job.unit_name || "Unit Terkait")})</div>
          <div class="sig-space"></div>
          <div class="sig-name">${escapeHtml(job.requester_name || "................................................")}</div>
          <div class="sig-sub">Penanggung Jawab Unit Kerja</div>
        </div>
      </div>

      <div class="doc-footer">
        <span>Alice HRIS — Sistem Informasi Manajemen Sumber Daya Manusia RSU Avisena</span>
        <span class="mono">ID Kandidat: ${escapeHtml(candidate.id || "-")} | Token: ${escapeHtml(results.session?.token || "-")}</span>
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`;

  const printWin = window.open("", "_blank", "width=1024,height=850");
  if (!printWin) {
    alert(
      "Pop-up diblokir oleh browser. Mohon izinkan pop-up untuk mencetak laporan psikometri."
    );
    return;
  }
  printWin.document.open();
  printWin.document.write(fullHtml);
  printWin.document.close();
}
