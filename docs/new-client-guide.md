# New Client Onboarding Guide

This guide walks through setting up the framework for a new client from a clean clone to a production-ready static site. The process takes 1–2 days depending on how quickly the client supplies their content and assets.

---

## Overview

You will never modify any component files. All customisation happens in:
- `src/data/` — structured data (JSON)
- `src/i18n/` — UI label strings (JSON)
- `public/assets/` — logo, photos, PDFs, OG image

---

## Before You Start — Collect from the Client

Gather these materials before touching any files:

**Brand**
- [ ] Primary hex color (dominant brand color)
- [ ] Accent hex color (secondary/highlight color)
- [ ] Surface hex color (light background tint, usually near-white)
- [ ] Logo file (SVG preferred; PNG acceptable)
- [ ] Open Graph image (1200 × 630 px JPG for social sharing)

**Content**
- [ ] Report year
- [ ] Company name (TR + EN)
- [ ] Tagline / strapline (TR + EN)
- [ ] Company story, mission, vision (TR + EN)
- [ ] Core values (4 recommended) with descriptions (TR + EN)
- [ ] Business areas (4 recommended) with descriptions (TR + EN)
- [ ] Executive messages (Chairman + CEO): full text + pull-quote (TR + EN)
- [ ] Executive photos (portrait, ~320 × 400 px)

**Data**
- [ ] KPI values with prior-year comparatives
- [ ] Revenue trend (5 years recommended)
- [ ] EBITDA trend (5 years recommended)
- [ ] Cost breakdown percentages (sum to 100)
- [ ] Income statement (2 years)
- [ ] Store network by region
- [ ] E-commerce growth data (years + GMV + orders)
- [ ] Category sales mix percentages
- [ ] Board member list: name, title, photo, appointment year, committees, bio (TR + EN)
- [ ] ESG metrics: actual, target, target year, YoY change
- [ ] Social projects (title + description, TR + EN)
- [ ] HR data: headcount, demographics, training hours, programmes, wellbeing scores

**Documents**
- [ ] Annual report PDF (featured)
- [ ] Any additional documents (sustainability report, financial tables, etc.)

---

## Step 1 — Clone and install

```bash
git clone <framework-repo-url> <client-slug>
cd <client-slug>
npm install
```

Run the dev server to confirm the skeleton loads:
```bash
npm run dev
# Open http://localhost:4321/tr
```

You should see the Acme Corporation seed site. Everything below replaces the seed data.

---

## Step 2 — Drop assets into `public/assets/`

```
public/
└── assets/
    ├── logo.svg                    ← client logo
    ├── og-image.jpg                ← 1200×630 social image
    ├── photos/
    │   ├── exec-chair.jpg          ← Chairman photo
    │   ├── exec-ceo.jpg            ← CEO photo
    │   ├── board-*.jpg             ← Board member photos (one per member)
    │   └── esg-*.jpg               ← ESG project photos (optional)
    └── *.pdf                       ← Report PDFs
```

**Photo sizing:** Executive and board photos render at approximately 160 × 200 px. Any resolution above 320 × 400 px is unnecessarily large for this use case. Optimise before uploading.

**If a photo is missing:** Both `ExecutiveCard` and `GovernanceCard` include an `onerror` fallback that renders a gray silhouette SVG inline — no file needed, no 404 in the server log.

---

## Step 3 — Edit `src/data/config.json`

This is the most impactful file — it re-themes the entire site.

```jsonc
{
  "company": {
    "name": "Client Name Ltd",        // ← English company name
    "nameTR": "Client Name A.Ş.",    // ← Turkish company name
    "reportYear": 2024,               // ← Report year
    "tagline": "Your tagline here.",
    "taglineTR": "Türkçe slogan.",
    "logo": "/assets/logo.svg",       // ← Already placed in Step 2
    "primaryColor": "#003087",        // ← Client primary hex
    "accentColor": "#F7A600",         // ← Client accent hex
    "surfaceColor": "#F5F7FA",        // ← Light background tint
    "websiteUrl": "https://client.com",
    "investorRelationsUrl": "https://ir.client.com",
    "address": "Client registered address",
    "phone": "+90 212 ...",
    "email": "investor@client.com"
  },
  "seo": {
    "titleSuffix": "| Client 2024 Annual Report",
    "titleSuffixTR": "| Client 2024 Faaliyet Raporu",
    "description": "Client Name 2024 Annual Report — ...",
    "descriptionTR": "Client Name 2024 Faaliyet Raporu — ...",
    "ogImage": "/assets/og-image.jpg"
  },
  "social": {
    "linkedin": "https://linkedin.com/company/client",
    "twitter": "https://twitter.com/client",
    "instagram": ""    // ← Empty string hides the icon
  }
}
```

After saving, the dev server will hot-reload. Check that the nav, hero, and header now show the client's name and colors.

---

## Step 4 — Populate `src/data/about.json`

Replace Acme Corporation's story with the client's:

```jsonc
{
  "foundingYear": 1998,
  "storyTR": "Client'in hikayesi...",
  "storyEN": "Client's story...",
  "missionTR": "Misyon metni...",
  "missionEN": "Mission statement...",
  "visionTR": "Vizyon metni...",
  "visionEN": "Vision statement...",
  "values": [
    { "icon": "heart", "labelTR": "...", "labelEN": "...", "descTR": "...", "descEN": "..." },
    { "icon": "shield", "labelTR": "...", "labelEN": "...", "descTR": "...", "descEN": "..." },
    { "icon": "lightbulb", "labelTR": "...", "labelEN": "...", "descTR": "...", "descEN": "..." },
    { "icon": "leaf", "labelTR": "...", "labelEN": "...", "descTR": "...", "descEN": "..." }
  ],
  "businessAreas": [
    { "icon": "store", "labelTR": "...", "labelEN": "...", "descTR": "...", "descEN": "..." },
    { "icon": "shopping-cart", "labelTR": "...", "labelEN": "...", "descTR": "...", "descEN": "..." },
    { "icon": "truck", "labelTR": "...", "labelEN": "...", "descTR": "...", "descEN": "..." },
    { "icon": "tag", "labelTR": "...", "labelEN": "...", "descTR": "...", "descEN": "..." }
  ]
}
```

Available icons: `heart`, `shield`, `lightbulb`, `leaf`, `store`, `shopping-cart`, `truck`, `tag`. See [`docs/data-schemas.md`](data-schemas.md#2-aboutjson) for full details.

---

## Step 5 — Populate `src/data/messages.json`

```jsonc
{
  "messages": [
    {
      "id": "chairman",
      "nameTR": "Ad Soyad",
      "nameEN": "Full Name",
      "titleTR": "Yönetim Kurulu Başkanı",
      "titleEN": "Chairman of the Board",
      "photo": "/assets/photos/exec-chair.jpg",
      "pullQuoteTR": "Kısa ve güçlü alıntı...",
      "pullQuoteEN": "Short and impactful pull-quote...",
      "messageTR": "Birinci paragraf.\n\nİkinci paragraf.\n\nÜçüncü paragraf.",
      "messageEN": "First paragraph.\n\nSecond paragraph.\n\nThird paragraph."
    },
    {
      "id": "ceo",
      "nameTR": "Ad Soyad",
      "nameEN": "Full Name",
      "titleTR": "Genel Müdür",
      "titleEN": "Chief Executive Officer",
      "photo": "/assets/photos/exec-ceo.jpg",
      "pullQuoteTR": "...",
      "pullQuoteEN": "...",
      "messageTR": "...",
      "messageEN": "..."
    }
  ]
}
```

**Paragraphs:** Separate paragraphs with `\n\n` (two backslash-n characters in the JSON string). The component splits on this delimiter.

---

## Step 6 — Populate `src/data/kpi.json`

Replace all Acme values with the client's. Keep the same `id` values for the items that appear in the hero section (`"revenue"`, `"ebitda-margin"`, `"stores"`, `"customers"`), or update `HeroSection.astro` to reference the actual IDs you use.

See [`docs/data-schemas.md`](data-schemas.md#4-kpijson) for full field descriptions.

---

## Step 7 — Populate remaining data files

Work through these in order — they correspond to sections from top to bottom on the page:

| File | Section |
|---|---|
| `src/data/financial.json` | Financial Performance |
| `src/data/operational.json` | Operational Performance |
| `src/data/governance.json` | Corporate Governance |
| `src/data/esg.json` | Sustainability |
| `src/data/hr.json` | People & Culture |
| `src/data/downloads.json` | Downloads |

See [`docs/data-schemas.md`](data-schemas.md) for field-level documentation on each file.

---

## Step 8 — Update UI labels in `src/i18n/`

The `tr.json` and `en.json` files contain all static UI strings — navigation labels, button text, section headings, footer copy, and legal disclaimers.

Open both files and search for any Acme-specific text (e.g., company name in the footer disclaimer, investor relations copy). Update these strings to match the client.

The files are keyed by section:
```
nav.*, hero.*, kpi.*, financial.*, operational.*, governance.*,
sustainability.*, people.*, downloads.*, footer.*, common.*
```

You do not need to change keys — only values.

---

## Step 9 — Validate data and build

```bash
npm run validate-data
```

This runs Zod schema checks on **all 10 data files** in `src/data/`. The validator also performs cross-file consistency checks: committee IDs referenced by board members must exist in the committees list; `financial.json` and `operational.json` series arrays must have matching lengths; `hr.json` headcount totals must balance. Fix any reported errors before proceeding.

```bash
npm run build
```

Astro builds all pages and outputs to `/dist`. Review the terminal output — zero warnings is the target.

```bash
npm run preview
```

Serve the production build locally. Test both `/tr/` and `/en/` and walk through every section:

- [ ] Hero: correct company name, tagline, 4 KPI cards with real data
- [ ] About: story, mission/vision, values, business areas
- [ ] Messages: both executives with photos (or fallback silhouettes)
- [ ] KPIs: all items grouped correctly, YoY badges make sense
- [ ] Financial: charts render, table data correct, income statement highlights correct
- [ ] Operational: store counts match, e-commerce chart correct
- [ ] Governance: all board members listed, committees correct
- [ ] Sustainability: progress bars show meaningful progress toward targets
- [ ] People: all stats match HR data
- [ ] Downloads: PDF links resolve (or 404 gracefully if files not yet uploaded)
- [ ] Header nav: all anchor links scroll to correct sections
- [ ] Language switcher: `/tr/` and `/en/` both render correctly
- [ ] Mobile: test at 375 px width — menu opens/closes, all sections readable

---

## Step 10 — Deploy `/dist`

The `/dist` directory is a fully self-contained static site — plain HTML, CSS, JS, and assets. No Node.js runtime, no serverless functions, no build tools are needed on the host.

### Set `SITE_URL` before building

`SITE_URL` drives canonical `<link>` tags, `og:url`, and the sitemap. Set it **before** running `npm run build` on the deployment host:

```bash
SITE_URL=https://annual.client.com npm run build
```

Also update the sitemap line in `public/robots.txt` to the client's domain before building.

---

### Vercel (recommended for initial testing)

1. Push the repo to GitHub
2. Import the project in the Vercel dashboard
3. Set environment variable: **Settings → Environment Variables → `SITE_URL`**
4. Deploy — Vercel detects the `vercel.json` in the project root automatically

The `vercel.json` adds:
- `cleanUrls: true` (removes `.html` extensions from URLs)
- HTTP 301 redirect: `/` → `/tr`
- Long-lived `Cache-Control` headers on `/assets/`

---

### Netlify

1. Push the repo to GitHub
2. Connect in the Netlify dashboard: **Build command:** `npm run build`, **Publish directory:** `dist`
3. Set environment variable: **Site → Environment Variables → `SITE_URL`**
4. Deploy — Netlify reads `dist/_redirects` automatically (it was in `public/_redirects`, Astro copies it to `dist/`)

The `_redirects` file provides:
- HTTP 301 redirect: `/` → `/tr`
- Custom 404 route to the branded 404 page

---

### Nginx VPS

1. Build locally or in CI: `SITE_URL=https://annual.client.com npm run build`
2. Upload `dist/` contents to `/var/www/annual-report/` on the server
3. Copy `deploy/nginx.conf.example` to `/etc/nginx/sites-available/annual-report`, replace `YOUR_DOMAIN`
4. Enable: `sudo ln -s /etc/nginx/sites-available/annual-report /etc/nginx/sites-enabled/`
5. Obtain TLS certificate: `sudo certbot --nginx -d annual.client.com`
6. Reload: `sudo nginx -s reload`

The example config provides: HTTPS redirect, `/` → `/tr/` redirect, long-lived caching for assets, `no-cache` for HTML, gzip, security headers, and a custom 404.

---

### Apache VPS

1. Build locally or in CI: `SITE_URL=https://annual.client.com npm run build`
2. Upload `dist/` contents to `/var/www/annual-report/`
3. Enable required Apache modules: `sudo a2enmod rewrite deflate headers ssl`
4. Copy `deploy/apache.conf.example` to `/etc/apache2/sites-available/annual-report.conf`, replace `YOUR_DOMAIN`
5. Enable: `sudo a2ensite annual-report && sudo systemctl reload apache2`
6. Obtain TLS certificate: `sudo certbot --apache -d annual.client.com`

---

### Post-deploy checklist

```
[ ] / redirects to /tr with HTTP 301 (not just meta-refresh)
[ ] /tr and /en load correctly
[ ] /nonexistent path shows the branded 404 page
[ ] Browser DevTools → Network: assets have long Cache-Control
[ ] Browser DevTools → Network: HTML pages have no-cache / must-revalidate
[ ] Run Lighthouse audit — target ≥ 90 all categories
[ ] Test at 375 px width (mobile) — hamburger menu works
[ ] Language switcher: /tr ↔ /en round-trip works
```

---

## Checklist Summary

```
[ ] Clone repo, npm install, dev server running
[ ] Assets uploaded: logo, og-image, exec photos, board photos, PDFs
[ ] config.json: name, year, colors, logo, SEO, social
[ ] about.json: story, mission, vision, values, business areas
[ ] messages.json: Chairman + CEO (TR + EN)
[ ] kpi.json: all items with prior-year comparatives
[ ] financial.json: charts + income statement
[ ] operational.json: stores, e-commerce, category mix, highlights
[ ] governance.json: board members + committees
[ ] esg.json: environmental metrics + social stats + projects
[ ] hr.json: headcount, demographics, learning, wellbeing
[ ] downloads.json: all PDFs with correct paths + sizes
[ ] tr.json + en.json: updated footer disclaimer, investor copy
[ ] npm run validate-data → no errors
[ ] npm run build → no warnings
[ ] npm run preview → walked through all 10 sections in TR and EN
[ ] Mobile tested at 375 px
[ ] Deployed to client CDN
[ ] Client signs off
```

---

## Troubleshooting

**`validate-data` fails with "Required" / "Invalid input" error**
A required field is missing or has the wrong type in one of the 10 validated data files. The error output includes the file name and the full field path (e.g., `[highlights.0.currency]`). Common causes: a field is `null` when it should be `undefined` (use `nullish()` fields — omit the key entirely rather than setting it to `null`), or parallel arrays in `financial.json` / `operational.json` have different lengths. See [`docs/data-schemas.md`](data-schemas.md) for exact type constraints per field.

**Chart shows no data / blank canvas**
Chart.js components read `--brand-primary` from `getComputedStyle`. If `BaseLayout.astro` is not wrapping the page (e.g., during isolated component testing), the CSS var will be empty and Chart.js will use the `#1B3A6B` fallback. This is expected.

**Build succeeds but photos show silhouettes**
The photo path in the JSON doesn't match the actual file in `public/assets/photos/`. Check for case sensitivity (`Exec-Chair.jpg` vs `exec-chair.jpg`) — file systems on Linux hosts are case-sensitive.

**Nav links don't scroll to sections**
The `id` in `config.nav.links` must exactly match the `id` prop on the corresponding `SectionWrapper` in the page file. Both are currently in sync — don't modify one without the other.

**Language switcher returns 404**
If deploying to a host that doesn't support clean URLs, ensure the host is configured to serve `index.html` at `/tr/` and `/en/` directory paths. This is standard behaviour for Netlify and Vercel but may require configuration on S3.
