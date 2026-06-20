import { useState, useEffect, useRef } from 'react';
import { formatKpiValue, formatPercent, isPositiveChange } from '@/utils/formatters';
import type { Locale } from '@/utils/i18n';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICONS: Record<string, JSX.Element> = {
  'trending-up': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  'bar-chart': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/>
    </svg>
  ),
  'circle-dollar': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v2m0 8v2M9 9.5A2.5 2.5 0 0 1 12 7a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 3-2.5"/>
    </svg>
  ),
  'percent': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="5" x2="5" y2="19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  ),
  'store': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  'shopping-cart': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  'users': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  'heart': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
};

// ─── Easing ───────────────────────────────────────────────────────────────────

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  labelTR: string;
  labelEN: string;
  value: number;
  previousValue: number;
  currency: string | null;
  unit: string | null;
  icon: string;
  lang: Locale;
}

export default function KpiCard({
  labelTR,
  labelEN,
  value,
  previousValue,
  currency,
  unit,
  icon,
  lang,
}: Props) {
  const label    = lang === 'tr' ? labelTR : labelEN;
  const positive = isPositiveChange(value, previousValue);

  // Counter animation state
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip animation for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed  = now - startTime;
      const t        = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(t);
      // Preserve decimal precision of original value
      const decimals = value % 1 !== 0 ? String(value).split('.')[1]?.length ?? 1 : 0;
      const factor   = Math.pow(10, decimals);
      setDisplayValue(Math.round(eased * value * factor) / factor);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  const pctChange = Math.abs(((value - previousValue) / Math.abs(previousValue)) * 100);
  const changeStr = (positive ? '+' : '−') + formatPercent(pctChange, lang);

  return (
    <article
      aria-label={`${label}: ${formatKpiValue(value, currency, unit, lang)}`}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-shadow duration-300 hover:shadow-md"
    >
      {/* Accent top bar */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: 'var(--brand-accent)' }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className="mb-4 inline-flex rounded-xl p-2.5"
        style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}
        aria-hidden="true"
      >
        {ICONS[icon] ?? ICONS['bar-chart']}
      </div>

      {/* Animated value */}
      <p
        className="font-heading text-3xl font-semibold leading-none tracking-tight"
        style={{ color: 'var(--brand-primary)' }}
        aria-hidden="true"
      >
        {formatKpiValue(displayValue, currency, unit, lang)}
      </p>

      {/* Label */}
      <p className="mt-2 text-sm font-medium text-gray-500">{label}</p>

      {/* YoY badge */}
      <div className="mt-4 flex items-center gap-1.5">
        <span
          className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
            positive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          }`}
          aria-label={`${changeStr} ${lang === 'tr' ? 'geçen yıla göre' : 'vs last year'}`}
        >
          {/* Arrow */}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="currentColor"
            aria-hidden="true"
            className={positive ? '' : 'rotate-180'}
          >
            <path d="M5 1 L9 7 L1 7 Z"/>
          </svg>
          {changeStr}
        </span>
        <span className="text-xs text-gray-400">
          {lang === 'tr' ? 'geçen yıla göre' : 'vs last year'}
        </span>
      </div>
    </article>
  );
}
