# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A SaaS-like, reusable annual report microsite framework. Each client gets their own independent static deployment. The skeleton is customised by editing JSON files in `src/data/` — no other code changes are needed for a new client. Full specification: `ANNUAL_REPORT_WEBSITE_BLUEPRINT.md`.

## Commands

```bash
npm run dev            # Dev server at localhost:4321
npm run build          # Static output to /dist
npm run preview        # Preview production build
npm run validate-data  # Zod schema check on all src/data/ JSON files (run before build)
```

## Stack (actual installed versions)

- **Astro 6** — SSG, static output, built-in i18n routing
- **React 19** — island framework for interactive components only (`client:visible`)
- **Tailwind CSS v4** — configured via `@theme` block in `src/styles/global.css` (no `tailwind.config.js`)
- **Chart.js 4** — bar, line, doughnut chart wrappers
- **Zod 4** — pre-build JSON validation in `scripts/validate-data.ts`
- **Fraunces** (headings) + **DM Sans** (body) — self-hosted via `@fontsource`

## Architecture

### i18n Routing

Astro's built-in i18n with `defaultLocale: 'tr'` and `prefixDefaultLocale: true`:
- `/tr/` — Turkish (default)
- `/en/` — English
- `/` — meta-refresh redirect to `/tr`

Pages live in `src/pages/tr/` and `src/pages/en/`. UI labels come from `src/i18n/tr.json` and `src/i18n/en.json`. Data values come from shared `src/data/*.json` files; bilingual label fields are named `labelTR` / `labelEN` inline.

### CSS Variable Bridge (brand color system)

Brand colors defined in `src/data/config.json` (`primaryColor`, `accentColor`, `surfaceColor` as hex strings) are written to `:root` CSS custom properties by `BaseLayout.astro` at build time. Tailwind's `@theme` block references those vars:

```css
/* src/styles/global.css */
@theme {
  --color-primary: var(--brand-primary);   /* set by BaseLayout from config.json */
  --color-accent:  var(--brand-accent);
}
```

Changing one hex in `config.json` reskins the entire site including Chart.js charts (which read the same CSS vars at runtime).

### Content Model

| Type | Location | Purpose |
|---|---|---|
| Client config + feature flags | `src/data/config.json` | Company name, year, colors, logo, social links |
| Structured data | `src/data/*.json` | KPIs, financial charts, operational, governance, ESG, HR, downloads |
| Narrative prose | `src/content/**/*.mdx` | Executive messages, company story, sustainability text |
| UI labels | `src/i18n/tr.json` & `en.json` | All translatable strings — nav, buttons, section headings |

### Key Utilities

- `src/utils/ScrollObserver.ts` — Intersection Observer wrapper; call `init()` once client-side. Adds `.is-visible` to `[data-reveal]` elements, triggering `.reveal` / `.reveal-stagger` CSS animations from `global.css`.
- `src/utils/formatters.ts` — `formatNumber`, `formatCurrency`, `formatPercent`, `formatYoY`. Always pass the active locale string (`'tr'` or `'en'`); uses `Intl.NumberFormat` internally.

### Animation Tiers

| Tier | Mechanism | Scope |
|---|---|---|
| Reveal | `.reveal` CSS class + `ScrollObserver` | Sections, cards, headings |
| Counter | React island (`client:visible`) | KPI number animations |
| Micro | CSS `transition` only | Hovers, underlines, card lifts |

All tiers are disabled when `prefers-reduced-motion: reduce` is set (enforced globally in `global.css`).

## Conventions

- Raw numeric values in JSON (e.g. `12450000000`); currency as ISO 4217 code (`"TRY"`). Components call `formatters.ts` — never pre-format in JSON.
- All chart/KPI data sourced from `src/data/` only — never inline values in components.
- Chart islands: always include `aria-label` and a visually-hidden `<table>` fallback.
- Interactive components use `client:visible` (load JS only on scroll into view).
- Performance targets: Lighthouse ≥ 90, FCP < 1.5 s, TTI < 2 s on mid-range mobile.

## New Client Onboarding (1–2 day checklist)

1. Edit `src/data/config.json` — company name, year, `primaryColor`, `accentColor`, logo path
2. Populate `src/data/kpi.json`, `financial.json`, `operational.json`, `esg.json`, `hr.json`, `downloads.json`
3. Add executive message MDX files to `src/content/messages/`
4. Drop photos into `public/assets/photos/` and PDF files into `public/assets/`
5. Run `npm run validate-data` — fix any schema errors
6. Run `npm run build` → deploy `/dist` to client's CDN
