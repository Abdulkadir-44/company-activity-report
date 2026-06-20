# Architecture

This document is the single source of truth for how the Annual Report Microsite Framework is structured. It covers every significant technical decision — stack rationale, routing, color system, component hydration, animation, navigation, deployment, and CI pipeline.

**Keep this document in sync with the codebase.** Any architectural change must be reflected here before the PR is merged.

---

## Table of Contents

1. [Project Model](#1-project-model)
2. [Tech Stack Rationale](#2-tech-stack-rationale)
3. [i18n Routing](#3-i18n-routing)
4. [CSS Variable Bridge (Brand Color System)](#4-css-variable-bridge-brand-color-system)
5. [Island Architecture](#5-island-architecture)
6. [Navigation System](#6-navigation-system)
7. [Animation System](#7-animation-system)
8. [Content Model](#8-content-model)
9. [Utility Layer](#9-utility-layer)
10. [Build Pipeline & Data Validation](#10-build-pipeline--data-validation)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Performance Targets](#12-performance-targets)

---

## 1. Project Model

This is a **single-tenant, independently deployed static site generator**. The business model:

- Maintain one shared codebase (this repo)
- Per-client setup: edit JSON data files only — no component code changes
- Build produces a fully static `/dist` directory with no runtime server dependency
- Each client gets their own repository clone and independent deployment

There is no server, database, CMS, or shared backend. Every annual report cycle means updating the JSON files, running `npm run validate-data && npm run build`, and redeploying `/dist`.

---

## 2. Tech Stack Rationale

### Astro 6 (SSG)
Chosen over Next.js or Gatsby for three reasons:
1. **Zero JS by default** — `.astro` components compile to static HTML; JavaScript is shipped only for explicitly marked islands
2. **Built-in i18n routing** — locale-prefixed URLs with no external library
3. **`output: 'static'`** — produces a plain HTML/CSS/JS directory; no Node.js runtime required at the host

### React 19 (Islands only)
Used exclusively for components that require browser APIs at runtime:
- `KpiCard.tsx` — `requestAnimationFrame` counter animation
- `BarChart.tsx`, `LineChart.tsx`, `DonutChart.tsx` — Chart.js canvas wrappers (`getContext('2d')` requires the DOM)

All layout, section structure, cards, tables, and navigation are pure Astro — zero JavaScript shipped for them.

### Tailwind CSS v4
Tailwind v4 moves configuration from `tailwind.config.js` to an `@theme` block in `src/styles/global.css`. This enables the CSS Variable Bridge (see Section 4) — brand tokens are dynamic CSS custom properties rather than static config values.

There is **no `tailwind.config.js`** in this project.

### Chart.js 4
Each chart component individually registers only the Chart.js modules it needs (tree-shaking at the component level). Bundling unused chart types is avoided by design. See [`docs/components.md`](components.md) for per-component registration details.

### Zod 4
Used only in `scripts/validate-data.ts`. Schemas validate all 10 data files before the build runs. Zod is never imported into any page or component — validation is a build-time gate, not a runtime guard.

---

## 3. i18n Routing

Astro's built-in i18n is configured in `astro.config.mjs`:

```js
i18n: {
  defaultLocale: 'tr',
  locales: ['tr', 'en'],
  routing: { prefixDefaultLocale: true },
}
```

`prefixDefaultLocale: true` means **both** locales get a URL prefix:

| URL | Page |
|---|---|
| `/` | `src/pages/index.astro` — meta-refresh to `/tr` + HTTP 301 via platform config |
| `/tr/` | Turkish (default locale) — `src/pages/tr/index.astro` |
| `/en/` | English — `src/pages/en/index.astro` |
| `/404.html` | Branded bilingual error page — `src/pages/404.astro` |

The two page files (`/tr/index.astro`, `/en/index.astro`) are structurally identical — they import the same section components and pass a `lang` prop. The language determines which data fields and i18n strings are rendered at build time.

### Translation lookup

Static UI strings (nav labels, button text, footer copy) live in `src/i18n/tr.json` and `src/i18n/en.json`. `useTranslations(lang)` returns a `t(key)` function:

```ts
const t = useTranslations('tr');
t('nav.financial')  // → "Finansal Performans"
```

Data values that need bilingual labels store both inline as `labelTR` / `labelEN` pairs. Components select the correct field from the `lang` prop at build time.

### Language switcher

`alternateLangUrl(currentLang)` returns `/en` or `/tr`. The header renders this as a plain `<a>` — switching locale is a full page navigation between two pre-rendered static pages, not client-side routing.

---

## 4. CSS Variable Bridge (Brand Color System)

The most important architectural pattern. One hex change in `config.json` re-themes the entire site — including runtime Chart.js charts.

### Pipeline

**Step 1 — `src/data/config.json`** stores colors as hex strings:
```json
{ "company": { "primaryColor": "#1B3A6B", "accentColor": "#E8A020", "surfaceColor": "#F8F9FC" } }
```

**Step 2 — `src/layouts/BaseLayout.astro`** reads these at build time and inlines them as CSS custom properties on `<html>`:
```astro
const brandStyle = `--brand-primary:${company.primaryColor};--brand-accent:${company.accentColor};--brand-surface:${company.surfaceColor}`;
// Output: <html lang="tr" style="--brand-primary:#1B3A6B;--brand-accent:#E8A020;--brand-surface:#F8F9FC">
```

This cascades to every element on the page via the `:root`.

**Step 3 — `src/styles/global.css`** maps CSS vars to Tailwind design tokens:
```css
@theme {
  --color-primary: var(--brand-primary);
  --color-accent:  var(--brand-accent);
  --color-surface: var(--brand-surface);
}
```

Tailwind utilities like `bg-primary`, `text-accent`, `border-surface` now resolve to the brand colors.

**Step 4 — Chart.js components** read the vars at mount time:
```ts
function cssVar(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
```

Because the inline style is in the static HTML, `getComputedStyle` resolves the correct value before React even hydrates.

### What one config change updates

- All Tailwind `text-primary` / `bg-primary` / `border-accent` usages
- Header nav active underlines and dropdown hover states
- Section headings, KPI card accent bars, badge chips
- All Chart.js chart bar/line/arc fill colors
- ESG progress bar fills and scroll-progress indicator
- Footer brand block background

---

## 5. Island Architecture

`.astro` components compile to static HTML at build time — zero JavaScript shipped. React `.tsx` components are islands: pre-rendered to HTML by Astro during the build, then selectively hydrated on the client.

All islands use `client:visible`:

```astro
<KpiCard client:visible ... />
<BarChart client:visible ... />
```

`client:visible` defers JavaScript loading and hydration until the element enters the viewport (browser `IntersectionObserver`). A user who only reads the hero section never downloads Chart.js.

| Component | Reason for being an island |
|---|---|
| `KpiCard.tsx` | `requestAnimationFrame` counter animation loop |
| `BarChart.tsx` | Chart.js canvas — requires `getContext('2d')` |
| `LineChart.tsx` | Same + canvas gradient requires DOM measurements |
| `DonutChart.tsx` | Same |

### Layout grid contract

Every page section — including the hero — uses a consistent two-level container structure to align content with the sticky header:

```html
<!-- Full-width section (background colour spans viewport) -->
<section ...>
  <!-- Content constrained + padded to match header width -->
  <div class="mx-auto max-w-screen-xl px-6">
    <!-- section content -->
  </div>
</section>
```

The header uses the identical inner structure:
```html
<header class="w-full ...">
  <div class="mx-auto max-w-screen-xl px-6">...</div>
</header>
```

**Rule:** `px-6` (24 px) lives on the **inner** `max-w-screen-xl` div, not on the outer element. This ensures content edges align pixel-perfectly with the header at all viewport widths. The outer element carries only vertical padding and background colour.

`SectionWrapper.astro` enforces this contract automatically. The `HeroSection.astro` also applies `px-6` on its inner `max-w-screen-xl` div manually (since it has a custom full-viewport layout).

---

## 6. Navigation System

The header uses a **grouped dropdown navigation** system. Ten page sections are consolidated into four logical groups, replacing the previous flat list that caused crowding and line-wrapping at typical viewport widths.

### Group structure

| Group ID | Label TR | Label EN | Sections |
|---|---|---|---|
| `group-about` | Hakkımızda | About Us | about, message, governance |
| `group-performance` | Performans | Performance | kpi, financial, operational |
| `group-responsibility` | Sorumluluk | Responsibility | sustainability, people |
| `group-media` | Medya | Media | downloads |

Groups are defined as a static constant (`NAV_GROUPS`) in `src/components/layout/Header.astro`. Each item carries `descTR` / `descEN` subtitle text shown in the dropdown for scanability.

**Single-item groups** (currently `group-media` with only `downloads`) render as a direct anchor link — no dropdown is shown for a single item.

### Desktop behavior

- Each group trigger is a `<button>` with `aria-haspopup="true"` and `aria-expanded`
- Dropdown panel animates in with `opacity 0→1` and `translateY(-6px)→0` via CSS `transition: opacity 180ms ease, transform 180ms ease`
- `mouseenter` on the `<li>` opens the panel; `mouseleave` closes it after a 120 ms delay (allows the pointer to travel from the trigger into the panel without the panel closing)
- Keyboard: `ArrowDown` on the trigger opens the panel and focuses the first item; `ArrowUp`/`ArrowDown` cycle through items; `Escape` or `Tab` closes the panel and returns focus to the trigger
- Clicking outside any open panel closes all panels

### Mobile behavior

- Full-screen overlay (same opacity/transform toggle as before)
- Each group renders as an accordion `<button>` that toggles a `max-height` animation on the nested `<ul>` (`scrollHeight` → `0`, `transition: max-height 250ms ease`)
- Only one group can be open at a time; opening a new group closes any currently open one
- Clicking any navigation link closes the full overlay

### Active state

An `IntersectionObserver` (`rootMargin: '-25% 0px -65% 0px'`) watches all section elements. When a section enters the active zone, the observer looks up its parent group via the `sectionToGroup` map (passed to the client script via Astro's `define:vars`) and adds `.is-active` to that group's `<li>`. The `.is-active` class colours the trigger text and scales up the accent underline indicator — both via pure CSS selectors.

The `sectionToGroup` map is computed at build time in the Astro frontmatter, eliminating any client-side DOM traversal to determine group membership.

---

## 7. Animation System

Four tiers with strictly separated concerns. All CSS-based tiers (Tier 0, 1, 3) are automatically collapsed to `0.01ms` duration when `prefers-reduced-motion: reduce` is active, via the single global rule in `global.css`. The counter (Tier 2) has an additional explicit code-level guard in `KpiCard.tsx`.

### Tier 0 — Hero Page-Load Entrance

**Scope:** Hero section only — report badge, company name (h1), tagline, CTA buttons, KPI card grid, scroll indicator.

A `@keyframes hero-enter` animation is defined in a `<style>` block inside `HeroSection.astro`:

```css
@keyframes hero-enter {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-enter {
  animation: hero-enter 0.75s var(--ease-out-expo) both;
}
```

Each element carries `class="hero-enter"` plus an individual `animation-delay` via inline `style`:

| Element | Delay |
|---|---|
| Year/report badge | 80 ms |
| Company name h1 | 200 ms |
| KPI grid (right column) | 260 ms |
| Tagline | 340 ms |
| CTA buttons | 480 ms |
| Scroll indicator | 700 ms |

`animation-fill-mode: both` holds elements in their initial hidden state before the delay fires — no flash of unstyled content. This is a **one-time page-load animation** with zero JavaScript and zero additional dependencies.

### Tier 1 — Scroll Reveal

**Scope:** section containers, card grids, headings.

`src/utils/ScrollObserver.ts` exports `init()`, called once from `BaseLayout.astro` via an inline `<script>` tag after DOMContentLoaded. It uses `IntersectionObserver` (threshold 0.15, rootMargin `0px 0px -60px 0px`) to watch all `[data-reveal]` elements. On intersection, `.is-visible` is added and the element is immediately **unobserved** (one-shot — never re-fires on scroll-up).

`SectionWrapper.astro`'s `reveal` prop controls which CSS class is applied:
- `"fade"` → `.reveal` — single element fades up
- `"stagger"` → `.reveal-stagger` — children animate in sequence via `nth-child` `transition-delay` offsets

### Tier 2 — Counter Animation

**Scope:** KPI number values only (`KpiCard.tsx`).

`requestAnimationFrame` loop, 1200 ms, `easeOutCubic` easing. If `prefers-reduced-motion` is detected, jumps to the final value immediately with no animation.

### Tier 3 — Micro Interactions

**Scope:** hover states, card lifts, dropdown chevron rotation.

Pure CSS `transition` properties. No JavaScript, no observers. Always-on regardless of scroll position.

### Reduced Motion

A global `global.css` media query sets `animation-duration: 0.01ms` and `transition-duration: 0.01ms` on all elements when `prefers-reduced-motion: reduce` is set. Tier 0 hero animations inherit this rule automatically — no per-element override is needed. KpiCard also has an explicit code-level check as a belt-and-suspenders guard.

---

## 8. Content Model

| Layer | Location | Format | Purpose |
|---|---|---|---|
| Client config | `src/data/config.json` | JSON | Company name, year, colors, logo, nav links, SEO, social |
| Structured data | `src/data/*.json` | JSON | KPIs, charts, tables, board members, ESG metrics, HR |
| UI labels | `src/i18n/tr.json` + `en.json` | JSON | All static text: nav group labels, button copy, footer |
| Narrative prose | *(future: `src/content/**/*.mdx`)* | MDX | Rich executive messages; MDX integration is installed but unused |

### Key conventions

**Raw numbers only.** `12450000000`, not `"₺12.45B"`. `formatters.ts` handles locale-aware display.

**ISO 4217 currency codes.** `"currency": "TRY"` — never a pre-formatted string. Components apply the symbol and compact notation.

**Bilingual fields inline.** `labelTR` / `labelEN` pairs live side-by-side in every JSON file — no separate per-locale data files. Components select the correct field from the `lang` prop at build time.

---

## 9. Utility Layer

### `src/utils/i18n.ts`
- `useTranslations(locale)` — dot-notation key lookup in `tr.json` / `en.json`
- `alternateLangUrl(currentLang)` — returns `/en` or `/tr`
- `Locale` type — `'tr' | 'en'`

### `src/utils/formatters.ts`
All formatting uses `Intl.NumberFormat` with the active locale.

| Function | TR output | EN output |
|---|---|---|
| `formatNumber(12840, locale)` | `12.840` | `12,840` |
| `formatCurrency(12.45e9, 'TRY', locale)` | `12,45 Myr ₺` | `₺12.45B` |
| `formatPercent(18.8, locale)` | `%18,8` | `18.8%` |
| `formatYoY(26.3, locale)` | `+%26,3` | `+26.3%` |
| `formatCompact(12.45e9, locale)` | `12,45 Myr` | `12.45B` |
| `formatKpiValue(item, locale)` | Auto-compact for values ≥ 1 M | — |

### `src/utils/ScrollObserver.ts`
`init()` — sets up `IntersectionObserver` for all `[data-reveal]` elements. Called once from `BaseLayout.astro`.

---

## 10. Build Pipeline & Data Validation

### Full pipeline

```
src/data/*.json
    │
    ├─→ npm run validate-data          ← GATE: must pass before build
    │       scripts/validate-data.ts
    │       Zod schemas for all 10 files
    │       Exits with code 1 on failure
    │
    └─→ npm run build (astro build)
            │
            ├─→ BaseLayout.astro reads config.json
            │     → inlines CSS vars on <html style="...">
            ├─→ Section components import src/data/*.json at build time
            ├─→ React islands SSR'd to HTML + bundled as client JS chunks
            ├─→ Tailwind v4 scans .astro + .tsx → generates scoped CSS
            ├─→ @astrojs/sitemap generates sitemap-index.xml
            └─→ /dist/
                  ├── tr/index.html
                  ├── en/index.html
                  ├── index.html          (meta-refresh + platform redirects)
                  ├── 404.html
                  ├── sitemap-index.xml
                  ├── robots.txt
                  ├── _redirects          (Netlify)
                  └── assets/             (logo, photos, PDFs, JS/CSS chunks)
```

### Validated files and key cross-file checks

| File | Notable validation rules |
|---|---|
| `config.json` | Hex color format, URL format, email format |
| `about.json` | `values` and `businessAreas` arrays min 1 item each |
| `messages.json` | `pullQuote` min 10 chars, `message` min 50 chars |
| `kpi.json` | Every item's `category` must exist in `categories` array |
| `financial.json` | `years` and `values` arrays must have equal length |
| `operational.json` | `years` and `gmvBillionTRY` must have equal length |
| `governance.json` | Every committee ID in `board[].committees` must exist in `committees` array |
| `hr.json` | `fullTime + partTime === total`; `female + male === 100` |
| `esg.json` | `targetYear` between 2020–2050 |
| `downloads.json` | File paths must start with `/` |

### CI integration

`.github/workflows/ci.yml` runs `validate-data → build` on every push to `main` and every pull request. The `SITE_URL` secret is read from GitHub repository secrets so canonical URLs are correct in CI builds.

---

## 11. Deployment Architecture

### Guiding principle

The build output (`/dist`) is a **fully static directory**: plain HTML, CSS, JavaScript, and binary assets. It carries **zero runtime server dependencies** and is deployable to any environment capable of serving static files. No Vercel edge functions, no Netlify serverless functions, no Node.js process is required or used.

### Site URL configuration

`astro.config.mjs` reads the canonical site URL from an environment variable:

```js
site: process.env.SITE_URL ?? 'https://example.com',
```

Set `SITE_URL` in your host's environment variable settings. This populates canonical `<link>` tags, OG `og:url`, schema.org URLs, and the sitemap. The `robots.txt` in `public/robots.txt` also references the sitemap URL — update the domain there after setting `SITE_URL`.

### Platform-specific configurations

All platform configs live alongside the static output and add zero runtime overhead.

#### Vercel (`vercel.json` — project root)

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "redirects": [{ "source": "/", "destination": "/tr", "permanent": true }],
  "headers": [
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/(.*).html",   "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }] }
  ]
}
```

Set `SITE_URL` in **Vercel → Project → Settings → Environment Variables**.

#### Netlify (`public/_redirects` → `dist/_redirects`)

```
/    /tr    301
/*   /404   404
```

Netlify processes `_redirects` before serving files, so the `/` → `/tr` redirect fires correctly even though `dist/index.html` also exists. Set `SITE_URL` in **Netlify → Site → Environment Variables**.

#### Nginx VPS (`deploy/nginx.conf.example`)

Key directives:
```nginx
location = / { return 301 /tr/; }
error_page 404 /404.html;
location ~* \.(js|css|woff2|…)$ { expires 1y; add_header Cache-Control "public, immutable"; }
location ~* \.html$ { expires -1; add_header Cache-Control "no-cache, must-revalidate"; }
```

Copy the reference file from `deploy/nginx.conf.example`, replace `YOUR_DOMAIN`, and obtain a TLS certificate with `certbot --nginx`. Set `SITE_URL` as an environment variable before running the build.

#### Apache VPS (`deploy/apache.conf.example`)

Key directives:
```apache
RedirectMatch permanent ^/$ /tr/
ErrorDocument 404 /404.html
```

See `deploy/apache.conf.example` for the full configuration including TLS, gzip, and cache headers.

### Root redirect strategy

The `/` → `/tr` redirect is handled at **two levels**:

1. **HTML level** (`src/pages/index.astro`): a `<meta http-equiv="refresh">` tag provides a universal baseline that works on any static host with no configuration, including S3, GitHub Pages, and simple Apache installs.
2. **Platform level** (`_redirects`, `vercel.json`, nginx/apache configs): a proper HTTP 301 redirect is served for the main deployment targets. This takes precedence over the HTML redirect on platforms that support it, giving correct behavior for SEO crawlers and link previewers.

### Deployment checklist

```
[ ] Set SITE_URL environment variable on the host
[ ] Update domain in public/robots.txt sitemap line
[ ] Confirm /tr and /en pages render
[ ] Confirm / redirects to /tr (HTTP 301, not just meta-refresh)
[ ] Confirm /nonexistent path serves branded 404 page
[ ] Verify Cache-Control headers: assets long-lived, HTML no-cache
[ ] Run Lighthouse audit (target ≥ 90 all categories)
```

---

## 12. Performance Targets

| Metric | Target |
|---|---|
| Lighthouse score | ≥ 90 (Performance, Accessibility, Best Practices, SEO) |
| First Contentful Paint | < 1.5 s (mid-range mobile, simulated 4G) |
| Time to Interactive | < 2 s (mid-range mobile, simulated 4G) |
| Total JS above the fold | 0 KB (hero section is pure Astro, no islands) |

Targets are achievable because:
- Hero section is static HTML with zero JavaScript
- All React islands use `client:visible` — Chart.js is never downloaded by users who don't scroll to a chart
- Fonts are self-hosted via `@fontsource` — no cross-origin DNS lookup
- No analytics, cookie consent banners, or third-party tags in the skeleton
- Long-lived `Cache-Control` headers on assets and fonts (set by platform config)
