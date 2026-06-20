# Annual Report Microsite Framework

A SaaS-like, reusable static-site framework for corporate annual reports. Each client gets an independent deployment customised entirely through JSON data files — no component changes required.

---

## What's Included

- Bilingual (TR / EN) single-page scroll layout with anchor navigation
- 10 fully-wired content sections: Hero, About, Executive Messages, KPIs, Financial, Operational, Governance, Sustainability, People & Culture, Downloads
- Chart.js data visualisations (bar, line, doughnut) with brand colour theming
- Animated KPI counters, scroll-reveal animations, progress bars
- Sticky header with scroll-progress indicator and active-section highlighting
- Pre-build Zod schema validation for all data files
- Accessibility: skip-to-content, ARIA labels, keyboard nav, `prefers-reduced-motion` support
- SEO: OG tags, Twitter Card, schema.org JSON-LD, hreflang alternates, sitemap

---

## Tech Stack

| Tool | Version | Role |
|---|---|---|
| [Astro](https://astro.build) | 6 | SSG, i18n routing, page orchestration |
| [React](https://react.dev) | 19 | Interactive islands (charts, counters) |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility styling via `@theme` in CSS |
| [Chart.js](https://www.chartjs.org) | 4 | Bar, line, doughnut charts |
| [Zod](https://zod.dev) | 4 | Pre-build JSON validation |
| Fraunces + DM Sans | — | Self-hosted fonts via `@fontsource` |

---

## Quick Start

```bash
npm install
npm run dev          # http://localhost:4321/tr
```

```bash
npm run validate-data   # check all src/data/ JSON files against Zod schemas
npm run build           # static output → /dist
npm run preview         # preview the production build locally
```

> Always run `validate-data` before `build` to catch schema errors early.

---

## Directory Structure

```
e-bebek/
├── public/
│   └── assets/
│       ├── logo.svg              # Client logo
│       ├── og-image.jpg          # Social share image (1200×630)
│       ├── photos/               # Executive & board member photos
│       └── *.pdf                 # Downloadable report files
│
├── src/
│   ├── data/                     # ← Primary customisation target
│   │   ├── config.json           # Company name, colors, logo, nav, SEO
│   │   ├── about.json            # Story, mission, vision, values, business areas
│   │   ├── messages.json         # Executive messages (Chairman, CEO)
│   │   ├── kpi.json              # Key performance indicators
│   │   ├── financial.json        # Revenue charts, income statement
│   │   ├── operational.json      # Store network, e-commerce, category mix
│   │   ├── governance.json       # Board members, committees
│   │   ├── esg.json              # Environmental metrics, social projects
│   │   ├── hr.json               # Headcount, demographics, L&D, wellbeing
│   │   └── downloads.json        # Downloadable documents
│   │
│   ├── i18n/
│   │   ├── tr.json               # Turkish UI label strings
│   │   └── en.json               # English UI label strings
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro      # Master HTML shell, SEO head, brand CSS vars
│   │
│   ├── components/
│   │   ├── layout/               # Header, Footer
│   │   ├── ui/                   # SectionWrapper, SectionHeading, KpiCard,
│   │   │                         #   DataTable, ProgressBar, DownloadItem
│   │   ├── charts/               # BarChart, LineChart, DonutChart (React)
│   │   ├── content/              # ExecutiveCard, GovernanceCard
│   │   └── sections/             # 10 full-page section components
│   │
│   ├── pages/
│   │   ├── index.astro           # Meta-refresh → /tr
│   │   ├── tr/index.astro        # Turkish page (all sections)
│   │   └── en/index.astro        # English page (all sections)
│   │
│   ├── styles/
│   │   └── global.css            # Tailwind entry, @theme tokens, animations
│   │
│   └── utils/
│       ├── i18n.ts               # useTranslations(), alternateLangUrl()
│       ├── formatters.ts         # formatNumber, formatCurrency, formatPercent…
│       └── ScrollObserver.ts     # Intersection Observer for reveal animations
│
├── scripts/
│   └── validate-data.ts          # Zod schema validation (run before build)
│
├── CLAUDE.md                     # Claude Code guidance
├── ANNUAL_REPORT_WEBSITE_BLUEPRINT.md  # Original product specification
└── docs/
    ├── architecture.md           # Stack, routing, CSS bridge, animation system
    ├── data-schemas.md           # Field-level reference for every JSON file
    ├── components.md             # Component prop API reference
    └── new-client-guide.md       # Step-by-step onboarding checklist
```

---

## Customisation at a Glance

**To reskin for a new client, edit only these files:**

1. `src/data/config.json` — company name, year, `primaryColor`, `accentColor`, `surfaceColor`, logo, social links
2. `src/data/*.json` — all financial, operational, ESG, HR, and governance data
3. `src/i18n/tr.json` + `en.json` — UI labels (section headings, button text, footer copy)
4. `public/assets/` — logo, photos, PDFs, OG image

No component code changes are needed. See [`docs/new-client-guide.md`](docs/new-client-guide.md) for the full onboarding checklist.

---

## Documentation

| Document | What it covers |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | Stack decisions, i18n routing, CSS variable bridge, island hydration, animation tiers, build pipeline |
| [`docs/data-schemas.md`](docs/data-schemas.md) | Every field in every JSON data file — type, constraints, examples |
| [`docs/components.md`](docs/components.md) | Every component — purpose, props, usage examples |
| [`docs/new-client-guide.md`](docs/new-client-guide.md) | 1–2 day onboarding checklist for a new client deployment |

---

## Deployment

The build output is a fully static directory (`/dist`). Deploy it anywhere that serves static files:

- **Netlify / Vercel** — drop the repo, set build command `npm run build`, publish directory `dist`
- **AWS S3 + CloudFront** — upload `/dist`, set index document to `index.html`
- **Azure Static Web Apps / GitHub Pages** — standard static deployment

Each client is an independent repository and deployment — there is no shared backend or database.
