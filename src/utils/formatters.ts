export type Locale = 'tr' | 'en';

const LOCALE_MAP: Record<Locale, string> = {
  tr: 'tr-TR',
  en: 'en-US',
};

/** Format a raw number with locale-appropriate thousands separators. */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_MAP[locale]).format(value);
}

/**
 * Format a raw number as currency.
 * @param value    Raw numeric value (e.g. 1234567)
 * @param currency ISO 4217 code (e.g. 'TRY', 'USD')
 * @param locale   Active locale
 */
export function formatCurrency(value: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_MAP[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a percentage value (e.g. 18.8 → "18,8%" in TR or "18.8%" in EN). */
export function formatPercent(value: number, locale: Locale, decimals = 1): string {
  return (
    new Intl.NumberFormat(LOCALE_MAP[locale], {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value) + '%'
  );
}

/**
 * Calculate and format YoY change as a signed percentage string.
 * Returns e.g. "+26,2%" or "−3,1%"
 */
export function formatYoY(current: number, previous: number, locale: Locale): string {
  const pct  = ((current - previous) / Math.abs(previous)) * 100;
  const sign = pct >= 0 ? '+' : '';
  return sign + formatPercent(Math.abs(pct), locale);
}

/** Whether current > previous (used for YoY arrow direction). */
export function isPositiveChange(current: number, previous: number): boolean {
  return current >= previous;
}

/**
 * Format large numbers in compact notation for KPI cards.
 * TR: 12,45 Myr  (Milyar = billion)  |  6,2 Myn  (Milyon = million)
 * EN: 12.45B                          |  6.2M
 */
export function formatCompact(value: number, locale: Locale): string {
  const loc = LOCALE_MAP[locale];
  const fmt = (n: number, decimals = 2) =>
    new Intl.NumberFormat(loc, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(n);

  if (value >= 1e9) {
    const suffix = locale === 'tr' ? ' Myr' : 'B';
    return fmt(value / 1e9) + suffix;
  }
  if (value >= 1e6) {
    const suffix = locale === 'tr' ? ' Myn' : 'M';
    return fmt(value / 1e6) + suffix;
  }
  return fmt(value, 0);
}

/**
 * Format a KPI value for display on a card.
 * Automatically compacts large numbers, appends currency symbol or unit.
 */
export function formatKpiValue(
  value: number,
  currency: string | null,
  unit: string | null,
  locale: Locale,
): string {
  if (unit === '%') return formatPercent(value, locale);

  const compact = value >= 1e6;

  if (currency) {
    const symbol = new Intl.NumberFormat(LOCALE_MAP[locale], {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    })
      .formatToParts(0)
      .find(p => p.type === 'currency')?.value ?? currency;

    const num = compact ? formatCompact(value, locale) : formatNumber(value, locale);
    return locale === 'tr' ? `${num} ${symbol}` : `${symbol}${num}`;
  }

  return compact ? formatCompact(value, locale) : formatNumber(value, locale);
}

/**
 * Returns the animated display value during counter animation.
 * Preserves decimal places of the original value.
 */
export function animatedDisplay(
  animatedRaw: number,
  currency: string | null,
  unit: string | null,
  locale: Locale,
): string {
  return formatKpiValue(animatedRaw, currency, unit, locale);
}
