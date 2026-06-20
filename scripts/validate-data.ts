/**
 * Pre-build data validation script.
 * Run: npm run validate-data
 *
 * Validates all JSON files in src/data/ against Zod schemas.
 * Exits with code 1 on failure so CI and `npm run build` can be gated on it.
 */

import { z } from 'zod';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir   = resolve(__dirname, '../src/data');

function load(file: string): unknown {
  return JSON.parse(readFileSync(resolve(dataDir, file), 'utf-8'));
}

// ─── Reusable primitives ──────────────────────────────────────────────────────

const HexColor   = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a 6-digit hex color (#rrggbb)');
const AbsPath    = z.string().startsWith('/', 'Must be an absolute path starting with /');
const BilingualStr = { labelTR: z.string().min(1), labelEN: z.string().min(1) };

// ─── config.json ─────────────────────────────────────────────────────────────

const ConfigSchema = z.object({
  company: z.object({
    name:                 z.string().min(1),
    nameTR:               z.string().min(1),
    reportYear:           z.number().int().min(2000).max(2100),
    tagline:              z.string().min(1),
    taglineTR:            z.string().min(1),
    logo:                 AbsPath,
    primaryColor:         HexColor,
    accentColor:          HexColor,
    surfaceColor:         HexColor,
    websiteUrl:           z.string().url(),
    investorRelationsUrl: z.string().url(),
    address:              z.string().min(1),
    phone:                z.string().min(1),
    email:                z.string().email(),
  }),
  nav: z.object({
    links: z.array(z.string()).min(1),
  }),
  features: z.object({
    languageSwitcher:  z.boolean(),
    darkMode:          z.boolean(),
    singlePageScroll:  z.boolean(),
    scrollProgressBar: z.boolean(),
  }),
  seo: z.object({
    titleSuffix:   z.string(),
    titleSuffixTR: z.string(),
    description:   z.string().min(1),
    descriptionTR: z.string().min(1),
    ogImage:       AbsPath,
  }),
  social: z.object({
    linkedin:  z.string(),
    twitter:   z.string(),
    instagram: z.string(),
  }),
});

// ─── about.json ──────────────────────────────────────────────────────────────

const AboutSchema = z.object({
  foundingYear: z.number().int().min(1800).max(2100),
  storyTR:      z.string().min(10),
  storyEN:      z.string().min(10),
  missionTR:    z.string().min(5),
  missionEN:    z.string().min(5),
  visionTR:     z.string().min(5),
  visionEN:     z.string().min(5),
  values: z.array(z.object({
    icon:    z.string().min(1),
    labelTR: z.string().min(1),
    labelEN: z.string().min(1),
    descTR:  z.string().min(5),
    descEN:  z.string().min(5),
  })).min(1).max(8),
  businessAreas: z.array(z.object({
    icon:    z.string().min(1),
    labelTR: z.string().min(1),
    labelEN: z.string().min(1),
    descTR:  z.string().min(5),
    descEN:  z.string().min(5),
  })).min(1).max(8),
});

// ─── messages.json ────────────────────────────────────────────────────────────

const MessagesSchema = z.object({
  messages: z.array(z.object({
    id:           z.string().min(1),
    nameTR:       z.string().min(1),
    nameEN:       z.string().min(1),
    titleTR:      z.string().min(1),
    titleEN:      z.string().min(1),
    photo:        AbsPath,
    pullQuoteTR:  z.string().min(10),
    pullQuoteEN:  z.string().min(10),
    messageTR:    z.string().min(50),
    messageEN:    z.string().min(50),
  })).min(1),
});

// ─── kpi.json ────────────────────────────────────────────────────────────────

const KpiSchema = z.object({
  categories: z.array(z.object({
    id:      z.string().min(1),
    ...BilingualStr,
  })).min(1),
  items: z.array(z.object({
    id:            z.string().min(1),
    category:      z.string().min(1),
    ...BilingualStr,
    value:         z.number(),
    previousValue: z.number(),
    currency:      z.string().nullable(),
    unit:          z.string().nullable(),
    icon:          z.string(),
  })).min(1),
});

// ─── financial.json ───────────────────────────────────────────────────────────

const YearSeriesSchema = (minLen = 2) =>
  z.array(z.number()).min(minLen, `Need at least ${minLen} data points`);

const FinancialSchema = z.object({
  currency: z.string().length(3, 'Must be a 3-letter ISO 4217 code'),
  revenueChart: z.object({
    labelTR: z.string().min(1),
    labelEN: z.string().min(1),
    type:    z.literal('bar'),
    years:   z.array(z.number().int()).min(2),
    values:  YearSeriesSchema(2),
  }).refine(d => d.years.length === d.values.length, 'years and values must have equal length'),
  ebitdaChart: z.object({
    labelTR:      z.string().min(1),
    labelEN:      z.string().min(1),
    type:         z.literal('bar'),
    years:        z.array(z.number().int()).min(2),
    ebitdaValues: YearSeriesSchema(2),
    marginValues: YearSeriesSchema(2),
  }).refine(d => d.years.length === d.ebitdaValues.length, 'years and ebitdaValues must have equal length'),
  costBreakdown: z.object({
    labelTR: z.string().min(1),
    labelEN: z.string().min(1),
    type:    z.literal('doughnut'),
    items:   z.array(z.object({
      labelTR: z.string().min(1),
      labelEN: z.string().min(1),
      value:   z.number().positive(),
    })).min(2),
  }),
  incomeStatement: z.object({
    titleTR:  z.string().min(1),
    titleEN:  z.string().min(1),
    footnote: z.string(),
    rows:     z.array(z.object({
      labelTR:   z.string().min(1),
      labelEN:   z.string().min(1),
      highlight: z.boolean(),
    }).passthrough()).min(1),
  }),
});

// ─── operational.json ─────────────────────────────────────────────────────────

const OperationalSchema = z.object({
  storeNetwork: z.object({
    labelTR:     z.string().min(1),
    labelEN:     z.string().min(1),
    type:        z.literal('bar'),
    regions:     z.array(z.object({
      labelTR: z.string().min(1),
      labelEN: z.string().min(1),
      count:   z.number().int().nonnegative(),
    })).min(1),
    totalStores: z.number().int().positive(),
    newOpenings: z.number().int().nonnegative(),
    closures:    z.number().int().nonnegative(),
  }),
  ecommerceGrowth: z.object({
    labelTR:              z.string().min(1),
    labelEN:              z.string().min(1),
    type:                 z.literal('line'),
    years:                z.array(z.number().int()).min(2),
    gmvBillionTRY:        YearSeriesSchema(2),
    onlineOrdersMillions: YearSeriesSchema(2),
    onlineRevenueShare:   YearSeriesSchema(2),
  }).refine(d => d.years.length === d.gmvBillionTRY.length, 'years and gmvBillionTRY must have equal length'),
  categoryMix: z.object({
    labelTR: z.string().min(1),
    labelEN: z.string().min(1),
    type:    z.literal('doughnut'),
    items:   z.array(z.object({
      labelTR: z.string().min(1),
      labelEN: z.string().min(1),
      value:   z.number().positive(),
    })).min(2),
  }),
  highlights: z.array(z.object({
    labelTR:   z.string().min(1),
    labelEN:   z.string().min(1),
    value:     z.number(),
    unit:      z.string().nullish(),
    currency:  z.string().nullish(),
    yoyChange: z.number(),
    captionTR: z.string().min(1),
    captionEN: z.string().min(1),
  })).min(1),
});

// ─── governance.json ──────────────────────────────────────────────────────────

const GovernanceSchema = z.object({
  board: z.array(z.object({
    id:              z.string().min(1),
    nameTR:          z.string().min(1),
    nameEN:          z.string().min(1),
    titleTR:         z.string().min(1),
    titleEN:         z.string().min(1),
    photo:           AbsPath,
    appointmentYear: z.number().int().min(1900).max(2100),
    independent:     z.boolean(),
    committees:      z.array(z.string()),
    bioTR:           z.string().min(10),
    bioEN:           z.string().min(10),
  })).min(1),
  committees: z.array(z.object({
    id:      z.string().min(1),
    labelTR: z.string().min(1),
    labelEN: z.string().min(1),
  })).min(1),
}).superRefine((data, ctx) => {
  const committeeIds = new Set(data.committees.map(c => c.id));
  data.board.forEach((member, i) => {
    member.committees.forEach(cid => {
      if (!committeeIds.has(cid)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['board', i, 'committees'],
          message: `Committee id "${cid}" on board member "${member.id}" does not exist in committees array`,
        });
      }
    });
  });
});

// ─── esg.json ────────────────────────────────────────────────────────────────

const EsgSchema = z.object({
  environmental: z.array(z.object({
    id:        z.string().min(1),
    labelTR:   z.string().min(1),
    labelEN:   z.string().min(1),
    value:     z.number(),
    unit:      z.string().min(1),
    target:    z.number().positive(),
    targetYear:z.number().int().min(2020).max(2050),
    yoyChange: z.number(),
    icon:      z.string().min(1),
  })).min(1),
  social: z.array(z.object({
    id:        z.string().min(1),
    labelTR:   z.string().min(1),
    labelEN:   z.string().min(1),
    value:     z.number(),
    currency:  z.string().nullish(),
    unit:      z.string().nullish(),
    captionTR: z.string().min(1),
    captionEN: z.string().min(1),
  })).min(1),
  projects: z.array(z.object({
    id:            z.string().min(1),
    titleTR:       z.string().min(1),
    titleEN:       z.string().min(1),
    descriptionTR: z.string().min(5),
    descriptionEN: z.string().min(5),
    photo:         z.string(),
  })).min(1),
});

// ─── hr.json ─────────────────────────────────────────────────────────────────

const HrSchema = z.object({
  headcount: z.object({
    total:     z.number().int().positive(),
    fullTime:  z.number().int().nonnegative(),
    partTime:  z.number().int().nonnegative(),
    yoyChange: z.number(),
  }).refine(d => d.fullTime + d.partTime === d.total, 'fullTime + partTime must equal total'),
  demographics: z.object({
    genderRatio: z.object({
      female: z.number().min(0).max(100),
      male:   z.number().min(0).max(100),
    }).refine(d => d.female + d.male === 100, 'female + male must equal 100'),
    ageGroups: z.array(z.object({
      labelTR: z.string().min(1),
      labelEN: z.string().min(1),
      percent: z.number().min(0).max(100),
    })).min(2),
    averageAge:          z.number().min(16).max(80),
    averageTenureYears:  z.number().min(0),
  }),
  learning: z.object({
    totalTrainingHours:       z.number().nonnegative(),
    averageHoursPerEmployee:  z.number().nonnegative(),
    digitalLearningPercent:   z.number().min(0).max(100),
    programs: z.array(z.object({
      labelTR:      z.string().min(1),
      labelEN:      z.string().min(1),
      participants: z.number().int().nonnegative(),
    })).min(1),
  }),
  wellbeing: z.object({
    satisfactionScore:       z.number().min(0),
    satisfactionOutOf:       z.number().positive(),
    engagementScore:         z.number().min(0),
    engagementOutOf:         z.number().positive(),
    voluntaryTurnoverPercent:z.number().min(0).max(100),
  }),
});

// ─── downloads.json ───────────────────────────────────────────────────────────

const DownloadsSchema = z.object({
  documents: z.array(z.object({
    id:            z.string().min(1),
    titleTR:       z.string().min(1),
    titleEN:       z.string().min(1),
    descriptionTR: z.string().min(1),
    descriptionEN: z.string().min(1),
    file:          AbsPath,
    fileSizeMB:    z.number().positive(),
    format:        z.string().min(1),
    featured:      z.boolean(),
  })).min(1),
});

// ─── Runner ───────────────────────────────────────────────────────────────────

const checks: Array<{ file: string; schema: z.ZodTypeAny }> = [
  { file: 'config.json',      schema: ConfigSchema      },
  { file: 'about.json',       schema: AboutSchema       },
  { file: 'messages.json',    schema: MessagesSchema    },
  { file: 'kpi.json',         schema: KpiSchema         },
  { file: 'financial.json',   schema: FinancialSchema   },
  { file: 'operational.json', schema: OperationalSchema },
  { file: 'governance.json',  schema: GovernanceSchema  },
  { file: 'esg.json',         schema: EsgSchema         },
  { file: 'hr.json',          schema: HrSchema          },
  { file: 'downloads.json',   schema: DownloadsSchema   },
];

let hasErrors = false;

for (const { file, schema } of checks) {
  const result = schema.safeParse(load(file));
  if (result.success) {
    console.log(`  ✓  ${file}`);
  } else {
    console.error(`  ✗  ${file}`);
    result.error.issues.forEach(issue => {
      console.error(`     [${issue.path.join('.')}] ${issue.message}`);
    });
    hasErrors = true;
  }
}

console.log('');

if (hasErrors) {
  console.error('Validation failed — fix the errors above before building.\n');
  process.exit(1);
} else {
  console.log('All 10 data files valid ✓\n');
}
