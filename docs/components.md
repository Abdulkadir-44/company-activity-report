# Component Reference

Every component in the framework, its purpose, props, and usage notes. Components are grouped by directory.

All Astro components (`.astro`) render to static HTML at build time — they ship no JavaScript. React components (`.tsx`) are hydrated on the client only when they enter the viewport (`client:visible`).

---

## Table of Contents

1. [Layouts](#1-layouts)
2. [Layout Components](#2-layout-components)
3. [UI Components](#3-ui-components)
4. [Chart Components](#4-chart-components)
5. [Content Components](#5-content-components)
6. [Section Components](#6-section-components)

---

## 1. Layouts

### `src/layouts/BaseLayout.astro`

The master HTML shell. Every page wraps its content in this layout.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `lang` | `'tr' \| 'en'` | Yes | Active locale — sets `<html lang>`, drives hreflang, passed to Header/Footer |
| `title` | `string` | Yes | Page `<title>` content |
| `description` | `string` | Yes | Meta description and OG description |
| `canonicalUrl` | `string` | Yes | Canonical URL for this page |

**What it does:**
- Reads `config.json` and writes brand colors as inline CSS vars on `<html>` (`--brand-primary`, `--brand-accent`, `--brand-surface`)
- Includes global CSS, self-hosted fonts
- Outputs complete SEO head: canonical, OG, Twitter Card, schema.org JSON-LD, hreflang alternates
- Renders `<Header>` and `<Footer>` around the default `<slot />`
- Runs `ScrollObserver.init()` via an inline `<script>` tag after DOMContentLoaded

**Usage:**
```astro
<BaseLayout lang="tr" title="Acme 2024 Faaliyet Raporu" description="..." canonicalUrl="https://...">
  <!-- page content -->
</BaseLayout>
```

---

## 2. Layout Components

### `src/components/layout/Header.astro`

Sticky top header with logo, desktop navigation, language switcher, and mobile overlay menu.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `lang` | `'tr' \| 'en'` | Yes | Drives link labels via `useTranslations` |

**Features:**
- Scroll-progress bar (`#scroll-progress`) — width updates via `scroll` event listener; color is `--brand-accent`
- Desktop nav — renders anchor links from `config.nav.links`; active section highlighted via IntersectionObserver (`rootMargin: '-30% 0px -60% 0px'`)
- Language switcher — renders `alternateLangUrl(lang)` link; hidden if `config.features.languageSwitcher` is false
- Mobile menu — opacity/pointer-events toggle (CSS transitions work); Escape key handler; body scroll lock on open

---

### `src/components/layout/Footer.astro`

Bottom footer with brand block, PDF download CTA, social links, nav links, and disclaimer.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `lang` | `'tr' \| 'en'` | Yes | Drives all footer label strings |

---

## 3. UI Components

### `src/components/ui/SectionWrapper.astro`

Wraps every content section. Handles padding, reveal animation setup, and alternating background.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | Yes | — | Section anchor ID — used by nav links and `config.nav.links` |
| `reveal` | `'fade' \| 'stagger' \| false` | No | `false` | `'fade'` adds `.reveal` to the section; `'stagger'` adds `.reveal-stagger` for child sequencing |
| `alt` | `boolean` | No | `false` | If true, sets `background-color: var(--brand-surface)` for zebra-stripe alternation |
| `class` | `string` | No | — | Additional CSS classes passed through to the outer element |

**Usage:**
```astro
<SectionWrapper id="financial" reveal="fade">
  <FinancialSection lang={lang} />
</SectionWrapper>

<SectionWrapper id="kpi" reveal="stagger" alt>
  <KpiSection lang={lang} />
</SectionWrapper>
```

---

### `src/components/ui/SectionHeading.astro`

Standard section heading block used at the top of every section component.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `eyebrow` | `string` | No | — | Small uppercase label above the title (renders in `--brand-accent`) |
| `title` | `string` | Yes | — | Main section heading (Fraunces, `--brand-primary`, 3xl–4xl) |
| `subtitle` | `string` | No | — | Optional paragraph below the title (gray, max-width 2xl) |
| `centered` | `boolean` | No | `false` | If true, centers all text and constrains subtitle width with `mx-auto` |

**Usage:**
```astro
<SectionHeading
  eyebrow="Finansal Performans"
  title="Güçlü Finansal Sonuçlar"
  subtitle="Net satışlarımız..."
/>
```

---

### `src/components/ui/KpiCard.tsx`

Animated KPI card. Runs a counter animation from 0 to `value` on mount. React island — hydrated with `client:visible`.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `labelTR` | `string` | Yes | KPI name in Turkish |
| `labelEN` | `string` | Yes | KPI name in English |
| `value` | `number` | Yes | Current year value (raw number) |
| `previousValue` | `number` | No | Prior year value — used to compute and display YoY % badge |
| `currency` | `string \| null` | No | ISO 4217 currency code — if set, value is formatted as currency |
| `unit` | `string \| null` | No | Display unit suffix (e.g., `"%"`, `"mağaza"`) — used if no currency |
| `icon` | `string` | No | Icon identifier for the card accent area |
| `lang` | `'tr' \| 'en'` | Yes | Active locale for number formatting |

**Behaviour:**
- Counter: 1200 ms duration, easeOutCubic easing, RAF loop
- `prefers-reduced-motion`: skips animation, renders final value immediately
- YoY badge: green (positive change), red (negative change), hidden if no `previousValue`
- Accent bar: 0.5px top border in `--brand-accent`

**Usage:**
```astro
<KpiCard
  client:visible
  labelTR="Net Satışlar"
  labelEN="Net Revenue"
  value={12450000000}
  previousValue={9870000000}
  currency="TRY"
  lang={lang}
/>
```

---

### `src/components/ui/DataTable.astro`

Responsive financial data table. Horizontal-scrolls on mobile. First column renders as `<th scope="row">` for accessibility.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | No | Optional heading above the table |
| `columns` | `Column[]` | Yes | Array of `{ key: string, label: string, align?: 'left' \| 'right' \| 'center' }` |
| `rows` | `Row[]` | Yes | Array of objects where keys match column `key` values, plus optional `highlight: boolean` |
| `footnote` | `string` | No | Displayed below the table with a `*` prefix |
| `caption` | `string` | No | Visually hidden `<caption>` for screen readers |

**Highlight rows:** Set `highlight: true` on a row to render it bold in `--brand-primary` color (used for subtotal/total rows).

---

### `src/components/ui/ProgressBar.astro`

Animated progress bar for ESG targets, age groups, and wellbeing scores. Animates from 0% to `actual/target × 100%` when scrolled into view.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | `string` | Yes | — | Displayed left-aligned above the track |
| `actual` | `number` | Yes | — | Current value (numerator) |
| `target` | `number` | Yes | — | Target value (denominator) |
| `unit` | `string` | No | `''` | Appended to both actual and target in the right-side label |
| `targetYear` | `number` | No | — | If provided, shown in parentheses next to target |
| `lang` | `'tr' \| 'en'` | No | `'tr'` | Locale for number formatting |

**Animation:** The fill div has `data-reveal` and CSS class `progress-fill`. `ScrollObserver` adds `.is-visible`, triggering a CSS `transition: width 1s` from `0` to `--pct`. This requires no JavaScript beyond the existing ScrollObserver.

---

### `src/components/ui/DownloadItem.astro`

A single downloadable document row with title, description, format badge, file size, and download button.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | `string` | Yes | — | Document title |
| `description` | `string` | Yes | — | Short description |
| `file` | `string` | Yes | — | File path (e.g., `/assets/report.pdf`) |
| `fileSizeMB` | `number` | Yes | — | Displayed as `N MB` |
| `format` | `string` | Yes | — | Badge text (e.g., `"PDF"`, `"XLSX"`) |
| `featured` | `boolean` | No | `false` | If true, renders with inverted (brand-primary background) style |
| `lang` | `'tr' \| 'en'` | No | `'tr'` | Localises the "Download" / "İndir" button label |

---

## 4. Chart Components

All chart components are React islands. They must be used with `client:visible`. Each component:
- Registers only the Chart.js modules it needs (tree-shaking)
- Reads `--brand-primary` and `--brand-accent` CSS vars from `document.documentElement` on mount
- Renders an accessible hidden `<table>` with `class="sr-only"` as a data fallback
- Provides an `aria-label` on the canvas

### `src/components/charts/BarChart.tsx`

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | Yes | — | Unique ID for the hidden accessible table |
| `title` | `string` | Yes | — | Used as `aria-label` on the canvas |
| `labels` | `string[]` | Yes | — | X-axis category labels |
| `datasets` | `BarDataset[]` | Yes | — | Array of `{ label: string, data: number[], color?: string }` |
| `lang` | `'tr' \| 'en'` | Yes | — | Passed to tooltip formatters |
| `yAxisLabel` | `string` | No | — | Optional Y-axis label |
| `stacked` | `boolean` | No | `false` | Enables stacked bar mode |

**Visual style:** `borderRadius: 6`, `borderSkipped: false` (all four corners rounded). Dark tooltip (`#1a1a2e` background, `cornerRadius: 8`).

**Usage:**
```astro
<BarChart
  client:visible
  id="revenue-trend"
  title="Net Revenue by Year"
  labels={["2020", "2021", "2022", "2023", "2024"]}
  datasets={[{ label: "Revenue (Bn TRY)", data: [3.2, 4.8, 6.1, 9.87, 12.45] }]}
  lang={lang}
  yAxisLabel="Bn TRY"
/>
```

---

### `src/components/charts/LineChart.tsx`

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | Yes | — | Unique ID for the accessible table |
| `title` | `string` | Yes | — | `aria-label` on canvas |
| `labels` | `string[]` | Yes | — | X-axis labels |
| `datasets` | `LineDataset[]` | Yes | — | Array of `{ label: string, data: number[], color?: string, fill?: boolean }` |
| `lang` | `'tr' \| 'en'` | Yes | — | Tooltip locale |
| `yAxisLabel` | `string` | No | — | Optional Y-axis label |

**Visual style:** Smooth curves (`tension: 0.4`), no visible data points at rest (`pointRadius: 0`), hover reveals points (`pointHoverRadius: 6`). Canvas gradient fill from `color+'33'` (top) to `color+'00'` (bottom). `fill: false` on a dataset disables the gradient for that series.

---

### `src/components/charts/DonutChart.tsx`

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | Yes | — | Unique ID for the accessible table |
| `title` | `string` | Yes | — | `aria-label` on canvas |
| `segments` | `DonutSegment[]` | Yes | — | Array of `{ label: string, value: number }` |
| `lang` | `'tr' \| 'en'` | Yes | — | Tooltip locale |
| `unit` | `string` | No | `'%'` | Appended to values in tooltips and legend |

**Visual style:** `cutout: '65%'` (ring style). Legend positioned to the right of the chart. Palette: `--brand-primary`, `--brand-accent`, then fixed neutrals (`#64748b`, `#94a3b8`, `#cbd5e1`, `#e2e8f0`).

---

## 5. Content Components

### `src/components/content/ExecutiveCard.astro`

Executive message card with photo, pull-quote, and full message body.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `string` | Yes | — | Executive's full name |
| `title` | `string` | Yes | — | Job title |
| `photo` | `string` | Yes | — | Photo path (e.g., `/assets/photos/exec-ceo.jpg`) |
| `pullQuote` | `string` | Yes | — | Highlighted quote, rendered in Fraunces italic with an accent border |
| `index` | `number` | No | `0` | Even index = photo left; odd index = photo right (alternating layout) |
| `(slot)` | HTML | Yes | — | Full message body — pass `<p>` elements via the default slot |

**Photo fallback:** `onerror` sets the image to an inline SVG avatar silhouette. `onerror=null` is set first to prevent retry loops.

---

### `src/components/content/GovernanceCard.astro`

Board member card with expandable biography. Uses `<details>/<summary>` for zero-JavaScript accordion.

**Props:**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `string` | Yes | — | Board member name |
| `title` | `string` | Yes | — | Board role/title |
| `photo` | `string` | Yes | — | Photo path |
| `appointmentYear` | `number` | Yes | — | Displayed as "YYYY since" / "YYYY den beri" |
| `independent` | `boolean` | Yes | — | If true, shows "Independent Member" badge on photo |
| `committees` | `string[]` | Yes | — | Array of committee IDs — renders as badge chips |
| `bio` | `string` | Yes | — | Biography text inside the expandable `<details>` |
| `committeeLabels` | `Record<string, string>` | Yes | — | Map of `committeeId → translatedLabel` |
| `lang` | `'tr' \| 'en'` | No | `'tr'` | Localises "Read Biography" / "Hide Biography" labels |

---

## 6. Section Components

Section components live in `src/components/sections/`. They each accept a single `lang` prop and handle all data loading internally (via static imports of `src/data/*.json`). They do not include their own `SectionWrapper` — that is applied by the page files.

All section components follow this pattern:
```astro
---
import type { Locale } from '@/utils/i18n';
// ... other imports

interface Props { lang: Locale; }
const { lang } = Astro.props;
---
<div>
  <SectionHeading eyebrow={...} title={...} subtitle={...} />
  <!-- section content -->
</div>
```

| Component | Data sources | Key sub-components |
|---|---|---|
| `HeroSection.astro` | `config.json`, `kpi.json`, `downloads.json` | 4× `KpiCard` |
| `AboutSection.astro` | `about.json` | Inline value cards, business area cards |
| `MessageSection.astro` | `messages.json` | `ExecutiveCard` |
| `KpiSection.astro` | `kpi.json` | `KpiCard` (all items, grouped by category) |
| `FinancialSection.astro` | `financial.json` | `BarChart`, `DonutChart`, `DataTable` |
| `OperationalSection.astro` | `operational.json` | `BarChart`, `LineChart`, `DonutChart` |
| `GovernanceSection.astro` | `governance.json` | `GovernanceCard`, committee panel |
| `SustainabilitySection.astro` | `esg.json` | `ProgressBar`, social stat cards, project cards |
| `PeopleSection.astro` | `hr.json` | `ProgressBar`, stat cards, programme list |
| `DownloadsSection.astro` | `downloads.json` | `DownloadItem` |

### `HeroSection.astro`

Full-viewport opening section. Does not use `SectionWrapper` — it manages its own background and layout.

Featured KPI cards are picked by ID: `"revenue"`, `"ebitda-margin"`, `"stores"`, `"customers"`. If your client's `kpi.json` uses different IDs, update the `heroKpis` array inside this component.

### `KpiSection.astro`

Groups KPI items by `category` using the `categories` array in `kpi.json`. Each category renders with a labelled horizontal rule as a section divider.

### `FinancialSection.astro`

Three-panel layout:
1. Revenue `BarChart` (full width)
2. EBITDA `BarChart` + cost breakdown `DonutChart` (two columns)
3. Income statement `DataTable` (full width)

The DataTable columns are hardcoded to `2023` / `2024`. To change the comparison years, update the `tableColumns` definition in this component.

### `GovernanceSection.astro`

Builds the committee membership panel by filtering `governance.board` entries by committee ID — this is automatic and requires no manual maintenance.

### `SustainabilitySection.astro`

The YoY badge on environmental metrics uses `yoyChange < 0 → green`. This is correct for emissions and water (where reduction is improvement). For metrics where increase is the goal (renewable energy, recycled packaging), the badge still follows the same rule — a positive change is amber. This is intentional: the progress bar already shows target progress; the badge shows trend direction.

### `PeopleSection.astro`

Age group progress bars use `target: 100` so the bar fill equals the percentage directly (`actual / 100 × 100% = actual%`).

Wellbeing score progress bars use `satisfactionOutOf` and `engagementOutOf` as the target, allowing non-100 maximum scores if needed.
