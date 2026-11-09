---
name: ui-ux-pro-max
description: Professional UI/UX design intelligence and data-dense enterprise layout standards adapted from nextlevelbuilder/ui-ux-pro-max-skill. Enforces structured design systems, WCAG AA accessibility, data grid ergonomics, and high-craft UI architecture.
---

# UI/UX Pro Max Skill
Adapted from: `nextlevelbuilder/ui-ux-pro-max-skill` (Next Level Builder)

---

## 1. When to Use This Skill
Activate this skill when:
1. Designing, building, or refactoring web dashboards, data tables, and enterprise personalia workflows.
2. Reviewing layout density, container margins, and responsive full-width data grids.
3. Ensuring WCAG AA accessibility contrast, touch target ergonomics (min 44px), and keyboard focus rings.
4. Harmonizing table architecture across different modules so that margins and component styles are 100% unified.

---

## 2. Core Principles & Design Intelligence

### 1. Viewport & Container Discipline (No Artificial Squeezing)
- **Data Tables Require Full-Width Canvas**: Never choke administrative data tables with arbitrary narrow bounds (`max-w-7xl mx-auto` or `max-w-5xl`) unless the page is a reading article or single-column form.
- Use uniform dashboard padding (`p-6` or `p-8`) across all sibling pages (e.g. `admin/pegawai`, `admin/personalia/kontrak`, `admin/jadwal-kerja`).
- Prevent horizontal scroll traps by wrapping table elements in `<div className="overflow-x-auto">`.

### 2. Semantic Table Architecture & Data Density
- **Semantic Structure**: Always use standard HTML elements (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`).
- **Header Contrast & Hierarchy**: Dark executive table headers (`bg-primary-dark` / `#05445e` with `text-white text-xs font-semibold uppercase tracking-wider`).
- **Generous Cell Padding**: Table cells should have comfortable vertical and horizontal breathing room (`px-6 py-4`).
- **Row Separation & States**:
  - Border separator: `border-b border-slate-200 last:border-b-0`.
  - Hover feedback: `hover:bg-slate-50/80 transition-colors`.
  - Conditional alert rows: e.g. `bg-red-50/70 hover:bg-red-100/70` for critical/expiring contracts (&le; 30 days) and `bg-amber-50/40 hover:bg-amber-100/40` for pending items.

### 3. Accessible Form Controls & Search Grid
- **Structured 5-Column Filter Grid**: Standardize filter toolbars with `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6`.
- **Search Input**: Full width in its column, left search icon with adequate contrast (`text-slate-400`), clear placeholder, and focus border.
- **Searchable Dropdowns**: Use library-based dropdowns (`SearchableSelect` / `react-select`) with high contrast options and explicit active/selected states.

### 4. Typography, Tabular Figures & Badges
- **Tabular Figures**: Every numeric figure (NIP, NIK, countdown days, currency, dates, percentages) must use `font-mono tabular-nums`.
- **Status Badges**:
  - High-contrast, rounded-full pills (`px-2.5 py-1 text-xs font-semibold rounded-full`).
  - Semantic colors:
    - Success/Safe: `bg-emerald-100 text-emerald-800`
    - Warning/Pending: `bg-amber-100 text-amber-800`
    - Critical/Danger: `bg-red-100 text-red-800` (or `bg-rose-100 text-rose-800`)
    - Neutral/Inactive: `bg-slate-100 text-slate-700`

### 5. Interactive Affordance & Micro-Interactions
- Action buttons must give tangible physical feedback (`active:scale-95 transition-all`).
- Tooltips or `title` attributes on all icon-only action buttons.
- Instant visual feedback on clipboard copy actions (`copiedToken` checkmark toggle).
- Integrated pagination matching sibling pages (`<Pagination currentPage={...} totalPages={...} onPageChange={...} />`).

