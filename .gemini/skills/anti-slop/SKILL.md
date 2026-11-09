---
name: anti-slop
description: Guardrails to eliminate AI tropes, filler buzzwords, robotic code comments, and generic templates, adapted from miqdadbadjuber/anti-slop and hardikpandya/stop-slop.
---

# Anti-Slop & Human Copywriting Skill
Adapted from:
- `miqdadbadjuber/anti-slop` (Hard gates, purpose-gated design, layout locks)
- `hardikpandya/stop-slop` (Purging AI writing clichés, rhythmic prose, density, directness)

---

## When to Use This Skill
Activate this skill when:
1. Writing or reviewing UI copy: toast notifications, modal dialogues, validation messages, and empty states.
2. Reviewing code comments to remove obvious AI boilerplate and fluff.
3. Checking layouts against AI slop patterns (arbitrary gradients, non-functional cards, unstyled bento grids).
4. Verifying mobile viewport boundaries (no horizontal overflow, comfortable touch targets).

---

## The 4 Gates of Anti-Slop

### Gate 1: Hard Gates (Absolute Prohibitions)
- **NO Purple/Indigo AI Gradients**: Do not use generic `bg-gradient-to-r from-purple-600 to-indigo-600` hero tropes. Stick strictly to Alice HRIS brand color `#0173b6` (corporate blue) and neutral slates.
- **NO Robotic Code Comments**: Delete obvious comments that state what code literally does:
  - ❌ `// Import React and hooks`
  - ❌ `// Return the JSX component`
  - ❌ `// Function to fetch data`
  - ❌ `// Handle button click`
  - ✅ Keep only non-obvious business logic comments (e.g., `// Cut-off kehadiran: 26 bulan lalu s/d 25 bulan ini`).
- **NO Fluff Copy & Fake Enthusiasm**:
  - ❌ "Pengalaman absensi yang mulus dan tanpa hambatan!"
  - ❌ "Nikmati kemudahan mengelola jadwal dengan satu klik ajaib."
  - ✅ "Absensi berhasil dicatat pada 07:45 WIB."
  - ✅ "Jadwal shift periode 26 Okt - 25 Nov berhasil disimpan."

### Gate 2: Banned Words & AI Tell-Tales
Purge these words from UI strings, error alerts, and documentation:

| Banned AI Buzzwords | What to Use Instead |
| :--- | :--- |
| *seamless / mulus tanpa hambatan* | *langsung / cepat / (hapus saja)* |
| *elevate / meningkatkan secara revolusioner* | *perbaiki / optimalkan* |
| *leverage / memanfaatkan kekuatan* | *gunakan / terapkan* |
| *delve into / menyelami* | *lihat / telusuri / periksa* |
| *robust / tangguh tak tertandingi* | *stabil / aman / teruji* |
| *game-changer / solusi mutakhir* | Jelaskan fiturnya secara spesifik |
| *streamline / merampingkan segalanya* | *sederhanakan / persingkat* |
| *testament to / bukti nyata dari* | Nyatakan faktanya langsung |

### Gate 3: Structural Prose Cleanliness
- **No Throat-Clearing Openings**:
  - ❌ "Dalam dunia kerja modern yang serba dinamis saat ini, efisiensi kehadiran merupakan hal yang sangat krusial..."
  - ✅ "Data kehadiran karyawan periode aktif:"
- **No False Binary Contrasts**:
  - ❌ "Ini bukan sekadar tabel shift biasa, melainkan revolusi manajemen karyawan..."
  - ✅ "Plotting jadwal shift bulanan unit IGD."
- **No Em-Dash Addiction**: Do not pepper every sentence with em dashes (`—`). Use periods or simple commas.

### Gate 4: Delivery Gate & Mobile Locks
Before confirming any feature:
1. **Touch Target Size**: All mobile buttons, icons, and interactive elements must have a clickable area of at least 44×44px (`min-h-[44px]` or `p-2.5` around icons).
2. **Zero Horizontal Overflow**: Mobile screens must never trigger unintended horizontal scrolling (`w-full max-w-full overflow-x-hidden`).
3. **Honest Error Messages**: Tell the user what failed, why, and what to do next:
   - ❌ "Oops! Terjadi kesalahan tak terduga dalam sistem kami yang hebat."
   - ✅ "Gagal menyimpan jadwal: Lokasi GPS berada di luar radius 2 km dari RSU Avisena."

