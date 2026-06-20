# Annual Report Website — General Skeleton Blueprint

> **Purpose:** This document defines the architecture, technology stack, page structure,
> content model, and development workflow for a **reusable, company-agnostic** annual
> report microsite. Any company can adopt this skeleton by supplying their own content,
> brand assets, and data. The original scope was derived from a real client brief and
> has been generalised so that it works as a repeatable product.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Target Audience & Goals](#2-target-audience--goals)
3. [Technology Stack](#3-technology-stack)
4. [Site Architecture & Pages](#4-site-architecture--pages)
5. [Content Model](#5-content-model)
6. [Design System](#6-design-system)
7. [Animation & Interaction](#7-animation--interaction)
8. [Performance & SEO](#8-performance--seo)
9. [Internationalisation (i18n)](#9-internationalisation-i18n)
10. [Development Phases](#10-development-phases)
11. [Assumptions & Out-of-Scope Items](#11-assumptions--out-of-scope-items)
12. [Deliverables](#12-deliverables)

---

## 1. Project Overview

Companies publish annual activity reports (200+ pages) to communicate financial
performance, operational highlights, ESG metrics, and governance information to
stakeholders. Printing or sharing a PDF alone is no longer sufficient — a modern
digital microsite raises engagement, improves accessibility, and strengthens brand
perception.

This skeleton project provides a **pre-built, content-driven website** that:

- Summarises the full annual report (target: 80–100 equivalent pages of content)
- Presents data through interactive charts and animated KPI counters
- Is fully responsive (mobile-first)
- Is statically generated — no database or application server required at runtime
- Can be re-branded and re-filled with new data each reporting year in hours, not weeks

---

## 2. Target Audience & Goals

| Audience | Primary Goal |
|---|---|
| Investors / Shareholders | Access key financial figures quickly |
| Regulators & Analysts | Verify governance and compliance data |
| Employees | Understand company direction and achievements |
| Press / Media | Download assets and find quotable highlights |
| General Public / Customers | Learn about ESG commitments and company story |

**Success criteria**

- Lighthouse Performance score ≥ 90
- Time-to-Interactive < 2 s on a mid-range mobile device
- All KPI figures, charts, and texts are driven by a single content/data source
- Zero server dependencies at runtime — deploy anywhere (CDN, static host)

---

## 3. Technology Stack

### 3.1 Core Framework — Astro

Annual reports are published **once a year**; the content is static by nature. Astro
is chosen because:

| Reason | Detail |
|---|---|
| Zero-JS by default | HTML is shipped to the browser immediately; no hydration wait |
| Island Architecture | Only interactive components (charts, counters) load JavaScript |
| Pre-rendering (SSG) | All pages are built at deploy time → maximum performance |
| Framework-agnostic | Islands can use React, Svelte, Vue or vanilla JS |
| Easy content integration | Built-in support for Markdown, MDX, and JSON data files |

### 3.2 Styling — Tailwind CSS

- Utility-first CSS, consistent design tokens across all components
- `tailwind.config.js` holds the company's brand colour palette, typography scale,
  and spacing tokens — the **only file that changes per client**
- `@layer components` for reusable card, grid, and section patterns

### 3.3 Charts & Data Visualisation — Chart.js (primary) / D3.js (advanced)

| Library | Used for |
|---|---|
| **Chart.js** | Bar, line, doughnut charts — fast to configure via JSON data |
| **D3.js** | Custom SVG infographics, interactive maps, timeline visualisations |

All chart data is loaded from `/src/data/` JSON files. Swapping data for a new
reporting year requires only updating those JSON files.

### 3.4 Animation — Custom (Intersection Observer API)

- No heavy animation library dependency
- `ScrollObserver` utility triggers CSS class additions when elements enter the viewport
- KPI counters use a lightweight vanilla counter animation
- Respects `prefers-reduced-motion` media query for accessibility

### 3.5 Hosting & Infrastructure

- **Build output:** pure HTML / CSS / JS static files
- **Recommended hosts:** Cloudflare Pages, Vercel, Netlify, AWS S3 + CloudFront, or
  any standard web server / enterprise CDN
- No database, no application server, no runtime dependency
- SSL and DNS managed by the client

---

## 4. Site Architecture & Pages

```
/
├── index                    ← Hero / Landing
├── /about                   ← Company Profile
├── /message                 ← Executive Messages
├── /kpi                     ← KPI Dashboard (Highlights at a Glance)
├── /financial               ← Financial Performance
├── /operational             ← Operational Performance
├── /governance              ← Corporate Governance
├── /sustainability          ← Sustainability / ESG
├── /people                  ← Human Resources & Culture
├── /downloads               ← PDF Report & Additional Documents
└── /[lang]/...              ← Optional: mirrored structure under /en, /tr etc.
```

> All sections can alternatively be presented as a **single long-scroll page** with
> anchor navigation instead of separate routes. The choice is a configuration flag in
> `astro.config.mjs`.

---

### 4.1 Page Descriptions

#### Hero / Landing (`/`)

- Full-viewport hero area: company name, report year, tagline, and brand visual
  (image or CSS/SVG animation)
- 4–6 animated KPI highlight cards (counter animation on scroll)
- "Explore Report" CTA button scrolling to or linking to the first section
- PDF download button — always accessible from this screen and the footer
- Progress bar just below the sticky header (scroll indicator)

#### Sticky Navigation & Mega Menu

- Fixed (sticky) top header with: company logo, report year label, main nav links
- Mega menu expands to show all sections and sub-sections hierarchically
- Mobile: collapses to a hamburger menu with full-screen overlay
- Active section highlighting via `IntersectionObserver`
- Optional: language switcher (TR / EN) — see Section 9

#### Executive Messages (`/message`)

- One card per executive (Chairman, CEO, CFO, etc.)
- Components: portrait photo, name, title, signature image
- Full message text with rich typography; key quotes styled as large pull-quotes
- Multiple messages supported; displayed as tabs or sequentially stacked sections

#### Company Profile (`/about`)

- Founding story, mission, vision, core values
- Main business areas as visual cards (e.g. Retail, E-commerce, Product Categories)
- Optional interactive timeline for company milestones (D3.js SVG or CSS-only)
- Value creation model as an SVG infographic (interactive on hover)

#### KPI Dashboard (`/kpi`)

- Animated scroll-triggered counter cards grouped by category:
  - **Financial:** Revenue, EBITDA, Net Profit, etc.
  - **Operational:** Store count, Online orders, Customer count, etc.
  - **People:** Total employees, % female employees, etc.
- Each card shows: current value, unit, YoY change (% and direction arrow)
- Responsive grid: 2 → 3 → 4 columns depending on viewport

#### Financial Performance (`/financial`)

- Summary income statement, balance sheet highlights, cash flow overview
- Chart types: Bar (revenue/expense), Line (multi-year trend), Doughnut (cost breakdown)
- Hover tooltips with detailed values
- Responsive comparison tables (horizontal scroll on mobile)
- Source notes and footnotes below each table
- All data from `/src/data/financial.json` — replace per year or per client

#### Operational Performance (`/operational`)

- Store network: regional map or bar-chart breakdown by region
- E-commerce growth: line chart (YoY)
- Product/category sales mix: doughnut or stacked bar chart
- Each data point accompanied by a short explanatory caption
- Data from `/src/data/operational.json`

#### Corporate Governance (`/governance`)

- Board of Directors grid: photo, name, title, appointment date
- On hover / click: short biography, education, career highlights (modal or expand)
- Committee memberships listed in a sub-section
- Independent director badge support

#### Sustainability / ESG (`/sustainability`)

- Environmental metrics: carbon footprint, energy consumption, water usage
  (icon + number cards, progress bars against targets)
- Social responsibility projects: image-text cards
- ESG target vs. actual progress bars
- Optional link to standalone sustainability PDF

#### Human Resources & Culture (`/people`)

- Infographic cards: headcount, gender ratio, average age, average tenure
- Training hours, L&D programs — text + supporting chart
- Employee satisfaction score highlight (if available)
- Diversity & inclusion highlights

#### Downloads (`/downloads`)

- Full PDF annual report — filename, file size, format shown
- Supplementary documents (auditor's report, corporate governance compliance, etc.)
- One-click download; PDF download button also repeated in Footer and Hero

#### Footer

- Company logo, corporate website link, investor relations link
- Contact: address, phone
- Legal disclaimer text
- Social media links (optional)
- PDF download button repeat
- Responsive: collapses to single column on mobile

---

## 5. Content Model

All content lives in `/src/data/` and `/src/content/` — no CMS required.

```
/src
├── content/
│   ├── messages/          ← MDX files, one per executive
│   ├── about.mdx          ← Company profile text
│   ├── sustainability.mdx ← ESG narrative text
│   └── people.mdx         ← HR narrative text
└── data/
    ├── config.json        ← Company name, year, logo path, brand colours
    ├── kpi.json           ← KPI cards: label, value, unit, previous, category
    ├── financial.json     ← Tables and chart series data
    ├── operational.json   ← Operational chart data
    ├── governance.json    ← Board members array
    ├── esg.json           ← ESG metrics and targets
    ├── hr.json            ← HR statistics
    └── downloads.json     ← Document list with URLs and metadata
```

### config.json (client customisation entry point)

```json
{
  "company": {
    "name": "Acme Corporation",
    "logo": "/assets/logo.svg",
    "reportYear": 2024,
    "tagline": "Building Tomorrow, Together.",
    "primaryColor": "#003087",
    "accentColor": "#E8A020",
    "websiteUrl": "https://www.acme.com",
    "investorRelationsUrl": "https://ir.acme.com"
  },
  "nav": {
    "links": ["about", "message", "kpi", "financial", "operational",
              "governance", "sustainability", "people", "downloads"]
  },
  "features": {
    "languageSwitcher": false,
    "darkMode": false,
    "singlePageScroll": true
  }
}
```

---

## 6. Design System

### 6.1 Tokens (in `tailwind.config.js`)

| Token | Purpose |
|---|---|
| `color.primary` | Main brand colour (headers, CTAs, highlights) |
| `color.accent` | Secondary / highlight colour |
| `color.surface` | Card / section background |
| `color.text` | Body text |
| `font.heading` | Display font (Google Fonts — pulled at build time) |
| `font.body` | Body font |

### 6.2 Component Library

| Component | Description |
|---|---|
| `<KpiCard>` | Animated counter, icon, label, YoY indicator |
| `<BarChart>` | Configurable Chart.js bar wrapper |
| `<LineChart>` | Configurable Chart.js line wrapper |
| `<DonutChart>` | Configurable Chart.js doughnut wrapper |
| `<DataTable>` | Responsive table with footnotes |
| `<ExecutiveCard>` | Photo, signature, pull-quote, full message |
| `<GovernanceCard>` | Photo, bio expand/modal |
| `<ProgressBar>` | ESG target vs. actual |
| `<DownloadItem>` | Document row with icon, size, download button |
| `<Timeline>` | Interactive milestone timeline (D3 or CSS) |
| `<SectionWrapper>` | Scroll-reveal wrapper with fade-in animation |

---

## 7. Animation & Interaction

### 7.1 Scroll Animations

Handled by a single `ScrollObserver.ts` utility (< 60 lines, no library):

- Sections fade-in + slide-up on first viewport entry
- KPI cards appear with staggered delay (`animation-delay`)
- Charts draw/animate when they enter the viewport
- KPI counters increment from 0 to the target value over ~1.5 s

### 7.2 Accessibility

- All animations disabled when `prefers-reduced-motion: reduce` is set
- Charts have `aria-label` and a hidden data table fallback
- Keyboard-navigable mega menu and modals
- WCAG AA colour contrast enforced via Tailwind token choices

---

## 8. Performance & SEO

### 8.1 Performance

| Target | Measure |
|---|---|
| Lighthouse Performance | ≥ 90 |
| First Contentful Paint | < 1.5 s |
| Total Blocking Time | < 200 ms |
| Images | WebP format, `loading="lazy"`, `srcset` for responsive sizes |
| Fonts | Self-hosted or `font-display: swap` to avoid FOIT |
| JS | Code-split per island; only chart JS loads when chart is visible |

### 8.2 SEO

- Unique `<title>` and `<meta name="description">` per page/section
- Open Graph and Twitter Card meta tags
- `schema.org` structured data (Organization, WebPage)
- `sitemap.xml` generated by `@astrojs/sitemap`
- `robots.txt` configured on deployment

---

## 9. Internationalisation (i18n)

- **Default language:** Turkish (or any single language chosen by the client)
- **Optional multilingual:** English as a second language
- URL structure: `/tr/...` and `/en/...` prefixes
- All UI labels, nav items, button text stored in `/src/i18n/[lang].json`
- Content files in `/src/content/[lang]/` sub-directories
- Language switcher in header (hidden when `features.languageSwitcher = false`)
- English content is provided by the client; translation is **not** in scope unless
  agreed separately

---

## 10. Development Phases

| Phase | Title | Description | Typical Duration |
|---|---|---|---|
| **1 — UX** | Research & Information Architecture | Structure report content for digital consumption; user flows; site map; low-fidelity wireframes. Content delivery from client runs in parallel. | 1 week |
| **2 — UI** | Visual Design & Design System | High-fidelity mockups aligned to brand identity; data visualisation design; animation principles; typography system. First section designs go to dev immediately after first approval. | 1–2 weeks |
| **3 — DEV** | Frontend Development | Astro project scaffold; component library; animation infrastructure; chart integration; responsive implementation. Starts in parallel once first UI sections are approved. | 2–3 weeks |
| **4 — QA** | Testing, Optimisation & Content Entry | Cross-browser (Chrome, Safari, Firefox, Edge); mobile device testing; performance optimisation; SEO & accessibility audit; final content entry; client review. | 1 week |

> UI approval gates: no section goes live until approved by the client.
> Additional parallel developer resources can be engaged in Phase 3 if the timeline is compressed.

---

## 11. Assumptions & Out-of-Scope Items

### Client Responsibilities

| Item | Notes |
|---|---|
| Text content | All section texts, financial narratives, executive messages |
| Financial & KPI data | Formatted and approved before handoff |
| Photography | Board, management team, editorial images — production-ready resolution |
| Brand assets | Logo (SVG), colour codes, typography, printed report as reference |
| PDF report file | Full report PDF(s) for the download section |
| Client feedback turnaround | Assumed ≤ 3 business days for design/content reviews |
| Hosting infrastructure | Client provides CDN or web server; CDN-compatible |
| DNS & SSL | Client manages; access credentials provided before go-live |

### Out of Scope (unless agreed as add-on)

- Multilingual content translation
- CMS integration (e.g. Contentful, Sanity)
- Backend APIs or database
- Third-party pixel / analytics / CRM integrations (client provides snippet only)
- Content writing or editorial work
- E-mail campaigns or social media assets
- Maintenance beyond the report year unless contracted

---

## 12. Deliverables

At project close the following are handed over to the client:

| Deliverable | Format |
|---|---|
| Full source code | Git repository (or ZIP) |
| Built static site | `/dist` folder ready to deploy |
| Design system documentation | Storybook or Markdown |
| Content update guide | Markdown — explains how to update JSON data files |
| Technical documentation | README + inline code comments |
| Sitemap & robots.txt | Included in build output |

---

## Appendix A — Folder Structure

```
project-root/
├── public/
│   ├── assets/            ← Logos, images, PDFs
│   └── fonts/             ← Self-hosted web fonts
├── src/
│   ├── components/        ← Astro / framework-specific components
│   │   ├── charts/
│   │   ├── layout/
│   │   └── ui/
│   ├── content/           ← MDX content files per language
│   ├── data/              ← JSON data files (KPIs, charts, governance…)
│   ├── i18n/              ← Language JSON files
│   ├── layouts/           ← Base page layouts
│   ├── pages/             ← Astro page routes
│   ├── styles/            ← Global CSS / Tailwind base layers
│   └── utils/             ← ScrollObserver, counter animation, helpers
├── astro.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Appendix B — Quick-Start Checklist for a New Client

- [ ] Fill in `/src/data/config.json` (company name, year, colours, logo path)
- [ ] Replace logo in `/public/assets/logo.svg`
- [ ] Update brand colours in `tailwind.config.js` (`primary`, `accent`)
- [ ] Populate `/src/data/kpi.json` with current KPI values
- [ ] Populate `/src/data/financial.json`, `operational.json`, `esg.json`, `hr.json`
- [ ] Write or paste executive messages into `/src/content/messages/`
- [ ] Fill in about/sustainability/people MDX files
- [ ] Add PDF file(s) to `/public/assets/` and update `downloads.json`
- [ ] Place photography in `/public/assets/photos/`
- [ ] Set `features.languageSwitcher` to `true` and populate `/src/i18n/en.json`
      if multilingual support is needed
- [ ] Run `npm run build` → deploy `/dist` to hosting

---

*Blueprint version 1.0 — June 2026*
*Generalised from initial client project scope. Intended as a repeatable product skeleton.*
