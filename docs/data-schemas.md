# Data Schemas

Complete field-level reference for every JSON file in `src/data/`. These files are the **only files that change** when deploying the framework for a new client.

All numeric values are raw numbers — never pre-formatted strings. Formatting (decimal separators, compact notation, currency symbols) is handled at render time by `src/utils/formatters.ts` based on the active locale.

---

## Table of Contents

1. [config.json](#1-configjson)
2. [about.json](#2-aboutjson)
3. [messages.json](#3-messagesjson)
4. [kpi.json](#4-kpijson)
5. [financial.json](#5-financialjson)
6. [operational.json](#6-operationaljson)
7. [governance.json](#7-governancejson)
8. [esg.json](#8-esgjson)
9. [hr.json](#9-hrjson)
10. [downloads.json](#10-downloadsjson)

---

## 1. `config.json`

Master client configuration. Changing fields here affects the entire site — brand colors, company name, navigation, SEO.

```jsonc
{
  "company": {
    "name": "Acme Corporation",      // string — English company name (used in <title>, OG tags)
    "nameTR": "Acme Kurumsal A.Ş.", // string — Turkish company name
    "reportYear": 2024,              // integer — the year this report covers
    "tagline": "Building Together.", // string — English one-line tagline (hero subtitle)
    "taglineTR": "Birlikte İnşa.",  // string — Turkish tagline
    "logo": "/assets/logo.svg",      // string — path relative to /public
    "primaryColor": "#1B3A6B",       // string — hex color; sets --brand-primary CSS var
    "accentColor": "#E8A020",        // string — hex color; sets --brand-accent CSS var
    "surfaceColor": "#F8F9FC",       // string — hex color; sets --brand-surface CSS var
    "websiteUrl": "https://...",     // string — used in schema.org JSON-LD
    "investorRelationsUrl": "...",   // string — linked in footer
    "address": "...",                // string — registered address (footer)
    "phone": "+90 212 000 00 00",    // string — contact phone (footer)
    "email": "investor@acme.com"     // string — contact email (footer)
  },

  "nav": {
    // Ordered list of section IDs. Must match the `id` prop on each SectionWrapper.
    "links": ["about", "message", "kpi", "financial", "operational",
               "governance", "sustainability", "people", "downloads"]
  },

  "features": {
    "languageSwitcher": true,  // bool — show TR/EN switcher in header
    "darkMode": false,         // bool — reserved; dark mode not implemented
    "singlePageScroll": true,  // bool — reserved; framework is always single-page
    "scrollProgressBar": true  // bool — show reading-progress bar below header
  },

  "seo": {
    "titleSuffix": "| Acme 2024 Annual Report",    // string — appended to <title>
    "titleSuffixTR": "| Acme 2024 Faaliyet Raporu",// string — Turkish title suffix
    "description": "English meta description...",   // string — EN <meta description> & OG
    "descriptionTR": "Turkish meta description...", // string — TR <meta description> & OG
    "ogImage": "/assets/og-image.jpg"               // string — 1200×630px image for social sharing
  },

  "social": {
    "linkedin": "https://linkedin.com/company/...", // string — empty string to hide
    "twitter": "https://twitter.com/...",           // string — empty string to hide
    "instagram": ""                                  // string — empty string to hide
  }
}
```

**Brand color guidance:** `primaryColor` is the dominant brand color used for headings, buttons, chart fills, and nav highlights. `accentColor` is the secondary color used for badges, progress bar fills, pull-quote borders, and hover accents. `surfaceColor` should be a near-white tint used for alternating section backgrounds.

---

## 2. `about.json`

Powers the About section: company story, mission, vision, core values, and business areas.

```jsonc
{
  "foundingYear": 2005,              // integer — displayed in story context

  "storyTR": "...",                  // string — 2–3 sentence company origin story (Turkish)
  "storyEN": "...",                  // string — same in English

  "missionTR": "...",                // string — mission statement (Turkish, 1–2 sentences)
  "missionEN": "...",                // string — same in English

  "visionTR": "...",                 // string — vision statement (Turkish, 1–2 sentences)
  "visionEN": "...",                 // string — same in English

  "values": [
    {
      "icon": "heart",               // string — icon name; see icon set below
      "labelTR": "Aile Odaklılık",  // string — value name (Turkish)
      "labelEN": "Family First",     // string — value name (English)
      "descTR": "...",               // string — 1–2 sentence description (Turkish)
      "descEN": "..."                // string — same in English
    }
    // Recommended: exactly 4 values (renders as a 4-column grid)
  ],

  "businessAreas": [
    {
      "icon": "store",               // string — icon name; see icon set below
      "labelTR": "Mağaza Ağı",      // string — area name (Turkish)
      "labelEN": "Retail Network",   // string — area name (English)
      "descTR": "...",               // string — 1–2 sentence description (Turkish)
      "descEN": "..."                // string — same in English
    }
    // Recommended: exactly 4 areas (renders as a 4-column grid)
  ]
}
```

**Available icon names:** `heart`, `shield`, `lightbulb`, `leaf`, `store`, `shopping-cart`, `truck`, `tag`. The component maps these to inline SVG paths. To add more, extend the `VALUE_ICONS` map in `AboutSection.astro`.

---

## 3. `messages.json`

Executive messages rendered in the Message section via `ExecutiveCard`.

```jsonc
{
  "messages": [
    {
      "id": "chairman",                          // string — unique identifier (not displayed)
      "nameTR": "Ahmet Yılmaz",                 // string — full name (Turkish)
      "nameEN": "Ahmet Yılmaz",                 // string — full name (English)
      "titleTR": "Yönetim Kurulu Başkanı",      // string — job title (Turkish)
      "titleEN": "Chairman of the Board",        // string — job title (English)
      "photo": "/assets/photos/exec-chair.jpg",  // string — path relative to /public
      "pullQuoteTR": "...",                      // string — featured pull-quote (Turkish, 1–2 sentences)
      "pullQuoteEN": "...",                      // string — same in English
      "messageTR": "Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.", // string — full message (Turkish)
      "messageEN": "Paragraph 1.\n\nParagraph 2.\n\nParagraph 3."  // string — same in English
    }
    // Typically 2 entries: Chairman + CEO. Each renders as a separate card.
    // Layout alternates left/right per entry (index % 2).
  ]
}
```

**Message formatting:** Paragraphs are separated by `\n\n` (double newline). The component splits on this delimiter and wraps each paragraph in a `<p>` tag. Do not use HTML in the message strings.

**Photos:** Should be portrait-oriented, ideally `320×400px` or similar. The component renders them at `160×176px` (cropped top). If the file is missing, the component falls back to an inline SVG silhouette — no 404 loop.

---

## 4. `kpi.json`

Key performance indicators displayed in the KPI section and the hero section (first 4 featured items).

```jsonc
{
  "categories": [
    {
      "id": "financial",           // string — category identifier
      "labelTR": "Finansal",       // string — category heading (Turkish)
      "labelEN": "Financial"       // string — category heading (English)
    }
    // Categories group items with a labelled divider in the KPI section.
    // Recommended: 3 categories (financial, operational, people)
  ],

  "items": [
    {
      "id": "revenue",             // string — unique identifier; first 4 items appear in hero
      "category": "financial",     // string — must match a category id above
      "labelTR": "Net Satışlar",  // string — KPI name (Turkish)
      "labelEN": "Net Revenue",    // string — KPI name (English)
      "value": 12450000000,        // number — current year raw value
      "previousValue": 9870000000, // number — prior year value (used for YoY % badge)
      "currency": "TRY",           // string | null — ISO 4217 code; null if not a monetary value
      "unit": null,                // string | null — display unit, e.g. "%", "mağaza"; null if currency used
      "icon": "trending-up"        // string — icon name for the card accent
    }
    // Recommended: 8–12 items total across all categories
  ]
}
```

**Hero KPIs:** The hero section picks items by ID: `"revenue"`, `"ebitda-margin"`, `"stores"`, `"customers"`. If your data uses different IDs, update the `heroKpis` array in `HeroSection.astro`.

**YoY badge:** The badge color is determined by `(value - previousValue) / previousValue`. Positive = green, negative = red.

**Formatting rules:**
- If `currency` is set → `formatCurrency(value, currency, lang)` → compact notation with symbol
- If `unit` is set → `formatNumber(value, lang)` + unit suffix
- Otherwise → `formatNumber(value, lang)`

---

## 5. `financial.json`

Revenue trend, EBITDA trend, cost breakdown donut, and the condensed income statement table.

```jsonc
{
  "currency": "TRY",           // string — base currency for all values in this file

  "revenueChart": {
    "labelTR": "...",           // string — chart title (Turkish)
    "labelEN": "...",           // string — chart title (English)
    "type": "bar",              // string — informational; always "bar"
    "years": [2020, 2021, 2022, 2023, 2024],  // number[] — x-axis labels
    "values": [3.2, 4.8, 6.1, 9.87, 12.45]   // number[] — revenue in billions TRY; must match years length
  },

  "ebitdaChart": {
    "labelTR": "...",
    "labelEN": "...",
    "type": "bar",
    "years": [2020, 2021, 2022, 2023, 2024],
    "ebitdaValues": [0.48, 0.79, 1.04, 1.82, 2.34],  // number[] — EBITDA in billions
    "marginValues": [15.0, 16.5, 17.1, 18.4, 18.8]   // number[] — EBITDA margin % (currently unused in chart, available for future use)
  },

  "costBreakdown": {
    "labelTR": "...",
    "labelEN": "...",
    "type": "doughnut",
    "items": [
      {
        "labelTR": "Satış Maliyeti",  // string — segment name (Turkish)
        "labelEN": "Cost of Goods",    // string — segment name (English)
        "value": 58.2                  // number — percentage share (all items should sum to 100)
      }
      // Recommended: 4–6 segments
    ]
  },

  "incomeStatement": {
    "titleTR": "...",          // string — table title (Turkish)
    "titleEN": "...",          // string — table title (English)
    "footnote": "...",         // string — displayed below table with a * prefix
    "rows": [
      {
        "labelTR": "Net Satışlar",  // string — row label (Turkish)
        "labelEN": "Net Revenue",    // string — row label (English)
        "2023": 9870,                // number | string — prior year value (numbers for numeric rows, strings like "40.0%" for ratio rows)
        "2024": 12450,               // number | string — current year value
        "highlight": false           // bool — true renders the row bold in brand-primary color
      }
      // Any number of rows. Year keys must be strings matching the column headers rendered in FinancialSection.
    ]
  }
}
```

---

## 6. `operational.json`

Store network distribution, e-commerce growth trends, category sales mix, and highlight stats.

```jsonc
{
  "storeNetwork": {
    "labelTR": "...",
    "labelEN": "...",
    "type": "bar",
    "regions": [
      {
        "labelTR": "İstanbul",   // string — region name (Turkish)
        "labelEN": "Istanbul",    // string — region name (English)
        "count": 142              // integer — number of stores in this region
      }
      // Any number of regions
    ],
    "totalStores": 487,          // integer — displayed as a callout above the chart
    "newOpenings": 64,           // integer — displayed as "+N new openings" callout
    "closures": 0                // integer — currently not displayed; available for future use
  },

  "ecommerceGrowth": {
    "labelTR": "...",
    "labelEN": "...",
    "type": "line",
    "years": [2020, 2021, 2022, 2023, 2024],        // number[] — x-axis labels
    "gmvBillionTRY": [0.8, 1.4, 2.3, 3.9, 6.2],    // number[] — GMV in billions TRY
    "onlineOrdersMillions": [1.8, 2.9, 4.1, 5.9, 8.2], // number[] — order count in millions
    "onlineRevenueShare": [12, 18, 24, 32, 41]      // number[] — % share (available for future use)
  },

  "categoryMix": {
    "labelTR": "...",
    "labelEN": "...",
    "type": "doughnut",
    "items": [
      {
        "labelTR": "Bebek & Çocuk",  // string — category name (Turkish)
        "labelEN": "Baby & Kids",     // string — category name (English)
        "value": 38                   // number — percentage share (all items should sum to 100)
      }
    ]
  },

  "highlights": [
    {
      "labelTR": "Online Satış Payı",  // string — stat label (Turkish)
      "labelEN": "Online Revenue Share",// string — stat label (English)
      "value": 41,                      // number — the headline figure
      "unit": "%",                      // string | null — appended to value for display; null for currency values
      "currency": null,                 // string | null — ISO 4217 code; if set, unit should be null
      "yoyChange": 9,                   // number — YoY change displayed in a badge (positive = green)
      "captionTR": "...",               // string — explanatory text (Turkish)
      "captionEN": "..."                // string — explanatory text (English)
    }
    // Recommended: 2–3 highlights
  ]
}
```

---

## 7. `governance.json`

Board of directors and committee structure.

```jsonc
{
  "board": [
    {
      "id": "chair",                             // string — unique identifier
      "nameTR": "Ahmet Yılmaz",                 // string — full name (Turkish)
      "nameEN": "Ahmet Yılmaz",                 // string — full name (English)
      "titleTR": "Yönetim Kurulu Başkanı",      // string — title (Turkish)
      "titleEN": "Chairman of the Board",        // string — title (English)
      "photo": "/assets/photos/board-chair.jpg", // string — path relative to /public
      "appointmentYear": 2018,                   // integer — year first appointed
      "independent": false,                      // bool — true shows "Independent Member" badge
      "committees": ["audit", "corporate-governance"], // string[] — committee IDs (must exist in committees array)
      "bioTR": "...",                            // string — biography (Turkish, 3–5 sentences)
      "bioEN": "..."                             // string — biography (English)
    }
    // Recommended: 4–8 board members (renders as a 4-column responsive grid)
  ],

  "committees": [
    {
      "id": "audit",                    // string — unique identifier; referenced in board[].committees
      "labelTR": "Denetim Komitesi",   // string — committee name (Turkish)
      "labelEN": "Audit Committee"      // string — committee name (English)
    }
    // Any number of committees
  ]
}
```

**Committee structure panel:** The governance section automatically builds a committee roster by cross-referencing `board[].committees` with each committee's `id`. No manual maintenance needed.

---

## 8. `esg.json`

Environmental metrics with targets, social impact statistics, and social responsibility project cards.

```jsonc
{
  "environmental": [
    {
      "id": "carbon",                          // string — unique identifier
      "labelTR": "Karbon Salınımı",            // string — metric name (Turkish)
      "labelEN": "Carbon Emissions",           // string — metric name (English)
      "value": 28400,                          // number — current year actual value
      "unit": "tCO₂e",                        // string — unit of measurement (displayed after value)
      "target": 25000,                         // number — target value (same unit)
      "targetYear": 2025,                      // integer — year the target should be reached
      "yoyChange": -8,                         // number — % change vs prior year (negative = improvement for emissions/water)
      "icon": "leaf"                           // string — icon name; see available icons below
    }
    // Recommended: 3–5 environmental metrics
    // Progress bar fill = (value / target) × 100, capped at 100%
    // If value >= target → fill color switches to accent (goal reached)
  ],

  "social": [
    {
      "id": "community",
      "labelTR": "Toplumsal Yatırım",         // string — stat label (Turkish)
      "labelEN": "Community Investment",       // string — stat label (English)
      "value": 24500000,                       // number — raw value
      "currency": "TRY",                       // string | null — ISO 4217 code; if set, value is a monetary amount
      "unit": null,                            // string | null — display unit if not currency
      "captionTR": "...",                      // string — explanatory caption (Turkish)
      "captionEN": "..."                       // string — explanatory caption (English)
    }
    // Recommended: 2–4 social stats (renders as a 2-column grid of inverted cards)
  ],

  "projects": [
    {
      "id": "nursery",
      "titleTR": "Kreş Destek Programı",      // string — project title (Turkish)
      "titleEN": "Nursery Support Programme",  // string — project title (English)
      "descriptionTR": "...",                  // string — 1–2 sentence description (Turkish)
      "descriptionEN": "...",                  // string — same in English
      "photo": "/assets/photos/esg-nursery.jpg" // string — currently not rendered; reserved for future image use
    }
    // Any number of projects
  ]
}
```

**Environmental icon names:** `leaf`, `sun`, `droplet`, `recycle`. To add more, extend `ENV_ICONS` in `SustainabilitySection.astro`.

**YoY badge logic:** For emissions and water metrics, a negative `yoyChange` is good (less is better) — the badge renders green. For renewable energy and recycled packaging, a positive change is good. The badge color is always: `yoyChange < 0` → green, `yoyChange > 0` → amber. Adjust this in `SustainabilitySection.astro` if your client's metrics have different polarity.

---

## 9. `hr.json`

Headcount, demographic breakdown, learning & development programmes, and employee wellbeing scores.

```jsonc
{
  "headcount": {
    "total": 12840,         // integer — total headcount at year-end
    "fullTime": 10920,      // integer — full-time employees
    "partTime": 1920,       // integer — part-time employees
    "yoyChange": 14.6       // number — % change vs prior year
  },

  "demographics": {
    "genderRatio": {
      "female": 64,         // number — percentage female (0–100)
      "male": 36            // number — percentage male (0–100); female + male should = 100
    },
    "ageGroups": [
      {
        "labelTR": "18–25", // string — age range label (Turkish)
        "labelEN": "18–25", // string — age range label (English)
        "percent": 22       // number — percentage in this age group (all groups should sum to 100)
      }
      // Recommended: 4 age groups
    ],
    "averageAge": 31.4,             // number — average employee age
    "averageTenureYears": 4.2       // number — average years of service
  },

  "learning": {
    "totalTrainingHours": 486000,        // integer — total training hours delivered in the year
    "averageHoursPerEmployee": 37.8,     // number — total / headcount
    "digitalLearningPercent": 68,        // number — % of training delivered digitally (reserved for future use)
    "programs": [
      {
        "labelTR": "Liderlik Akademisi",  // string — programme name (Turkish)
        "labelEN": "Leadership Academy",  // string — programme name (English)
        "participants": 340               // integer — number of participants
      }
      // Any number of programmes
    ]
  },

  "wellbeing": {
    "satisfactionScore": 78,     // number — satisfaction score (raw, e.g. 78 out of 100)
    "satisfactionOutOf": 100,    // number — maximum score (denominator for progress bar)
    "engagementScore": 81,       // number — engagement score
    "engagementOutOf": 100,      // number — maximum engagement score
    "voluntaryTurnoverPercent": 12.3  // number — voluntary attrition rate %
  }
}
```

---

## 10. `downloads.json`

Documents available for download in the Downloads section.

```jsonc
{
  "documents": [
    {
      "id": "annual-report-2024",                    // string — unique identifier
      "titleTR": "2024 Faaliyet Raporu",             // string — document title (Turkish)
      "titleEN": "2024 Annual Report",               // string — document title (English)
      "descriptionTR": "...",                        // string — short description (Turkish)
      "descriptionEN": "...",                        // string — same in English
      "file": "/assets/annual-report-2024.pdf",      // string — path relative to /public
      "fileSizeMB": 4.2,                             // number — file size in megabytes (displayed as "4.2 MB")
      "format": "PDF",                               // string — file format badge text
      "featured": true                               // bool — exactly one document should be featured
    }
    // Any number of documents.
    // The featured document renders full-width with an inverted (brand-primary background) style.
    // Non-featured documents render in a 3-column card grid.
  ]
}
```

**Featured document:** Set `"featured": true` on exactly one document — this is typically the main annual report PDF. It renders prominently above the grid. If multiple documents have `featured: true`, all will render in the featured style. If none are featured, only the grid renders.

**File paths:** PDFs should be placed in `public/assets/` and referenced with an absolute path from the domain root (`/assets/report.pdf`). The browser's native download dialog handles the actual download.
