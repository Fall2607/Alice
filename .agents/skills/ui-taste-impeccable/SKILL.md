---
name: ui-taste-impeccable
description: Enforces high-fidelity UI design taste, visual hierarchy, spatial polish, and bespoke craftsmanship adapted from leonxlnx/taste-skill and pbakaus/impeccable.
---

# UI Design Taste & Impeccable Craft Skill
Adapted from:
- `leonxlnx/taste-skill` (Art direction, visual hierarchy, avoiding generic AI layouts)
- `pbakaus/impeccable` (Design vocabulary, spatial discipline, typographic polish, micro-interactions)

---

## When to Use This Skill
Activate this skill when:
1. Designing or refactoring UI components, pages, dashboard widgets, or forms.
2. Reviewing screens to eliminate "AI-generated look" (flat, monotonous, repetitive card soup).
3. Elevating typography, spatial rhythm, borders, shadows, and interactive feedback.
4. Ensuring that components feel bespoke, premium, and human-crafted for Alice HRIS.

---

## Core Philosophy: Craft Over Template

AI tools default to safe, generic layouts: cards inside cards with 16px padding, gray-on-gray borders, default system fonts without contrast, and arbitrary decorative badges. This skill breaks those habits.

### 1. Visual Hierarchy & Art Direction
- **Every screen has one clear protagonist**: A focal point that draws the eye (a primary metric, a clean action table, or a focal status). Never present 6 equally weighted cards competing for attention.
- **Intentional Contrast**: Use high contrast where hierarchy matters. Secondary data should be subdued (`text-slate-500`), headers crisp and legible (`text-slate-900 font-semibold`).
- **Surface Elevation with Restraint**: Don't layer heavy dropped shadows. Use subtle borders (`border border-slate-200/80 dark:border-slate-800`), faint backdrop blurs (`backdrop-blur-sm`), or soft ambient shadows (`shadow-sm`).
- **Brand Palette Consistency**: Anchor elements to Alice HRIS palette (`#0173b6` primary blue, slate neutrals, emerald success, amber warning, rose danger). Never introduce random neon purple/violet gradients.

### 2. Typographic Polish
- **Scale with Purpose**: Limit font sizes on any single view to 3-4 distinct levels (e.g. `text-xs`, `text-sm`, `text-base`, `text-xl`).
- **Weight Pairing**: Pair bold/semibold section headings with normal weight data. Never use bold on body text indiscriminately.
- **Tabular Figures for Numbers**: Use `tabular-nums` for timestamps, clock-in times, coordinates, and statistics to prevent layout jitter:
  ```tsx
  <span className="font-mono text-xs tabular-nums text-slate-600">07:58:12 WIB</span>
  ```

### 3. Spatial Discipline & Layout Rhythm
- **Rhythm over Random Spacing**: Standardize gaps using consistent Tailwind spacing multiples (`gap-2`, `gap-4`, `gap-6`, `p-4`, `p-6`).
- **Break Free from Card-Soup**: Not everything needs to be wrapped in an individual rounded card with border. Group related actions with clean dividers (`divide-y divide-slate-100`) or whitespace grouping instead.
- **Table Craft**:
  - Headers should be compact, uppercase tracking-wider (`text-xs font-semibold text-slate-500 uppercase tracking-wider`).
  - Row hover states should be gentle (`hover:bg-slate-50/70 transition-colors`).
  - Action buttons must be vertically aligned with data rows.

### 4. Micro-Interactions & Feedback
- **Interactive Affordance**: Every clickable element must visually react:
  - Buttons: `transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500/40`
  - Table rows: subtle background shift on hover.
  - Inputs: crisp ring on focus (`focus:ring-2 focus:ring-[#0173b6]/20 focus:border-[#0173b6]`).
- **Loading & Empty States**:
  - Empty states should provide guidance or action, not just a sad blank space.
  - Skeletons or spinners (`Loader2` spin) must match the exact dimensions of the content they replace.

---

## Pre-Ship UI Review Checklist

Before finishing any UI change, verify:
- [ ] **No Card-Soup**: Are cards nested needlessly? Can we use whitespace or subtle dividers instead?
- [ ] **No Purple Slop**: Are the colors strictly aligned to Alice HRIS palette (`#0173b6` / slate / semantic colors)?
- [ ] **Data Alignment**: Are monetary, time, and numeric columns right-aligned or tabular (`tabular-nums`)?
- [ ] **Focus & Keyboard Navigation**: Does `focus-visible` show clearly without ugly default browser outlines?
- [ ] **Responsive Integrity**: Does the layout flex cleanly on mobile (`< 640px`) without horizontal clipping or overlapping buttons?

