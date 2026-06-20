import tr from '@/i18n/tr.json';
import en from '@/i18n/en.json';

export type Locale = 'tr' | 'en';

const translations = { tr, en } as const;

/**
 * Returns a t() function scoped to the given locale.
 * Supports dot-notation key paths: t('nav.about'), t('hero.exploreReport')
 */
export function useTranslations(locale: Locale) {
  const dict: Record<string, unknown> = translations[locale];

  return function t(key: string): string {
    const parts = key.split('.');
    let node: unknown = dict;
    for (const part of parts) {
      node = (node as Record<string, unknown>)?.[part];
    }
    return typeof node === 'string' ? node : key;
  };
}

/** Resolve the same page in the opposite locale. */
export function alternateLangUrl(currentLang: Locale): string {
  return currentLang === 'tr' ? '/en' : '/tr';
}
