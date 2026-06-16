/**
 * Siyah Beyaz FC — Internationalization (i18n) Module
 *
 * Supports: tr, en, de, es, fr, ar
 * Usage: import { t, useLocale } from '@/lib/fm/i18n'
 */

import tr from './translations/tr';
import en from './translations/en';
import de from './translations/de';
import es from './translations/es';
import fr from './translations/fr';
import ar from './translations/ar';

// ─── Types ───

export type Locale = 'tr' | 'en' | 'de' | 'es' | 'fr' | 'ar';

export type TranslationKeys = keyof typeof tr;

export const SUPPORTED_LOCALES: { code: Locale; label: string; nativeLabel: string; active: true }[] = [
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', active: true },
  { code: 'en', label: 'English', nativeLabel: 'English', active: true },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', active: true },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', active: true },
  { code: 'fr', label: 'French', nativeLabel: 'Français', active: true },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', active: true },
];

// ─── Translation dictionaries ───

const dictionaries: Record<Locale, Record<string, string>> = {
  tr,
  en,
  de,
  es,
  fr,
  ar,
};

// ─── Current locale (module-level, synced with localStorage) ───

let currentLocale: Locale = 'tr';

export function getCurrentLocale(): Locale {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sb-fc-locale');
      if (stored && stored in dictionaries) {
        currentLocale = stored as Locale;
      }
    } catch {}
  }
  return currentLocale;
}

export function setCurrentLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('sb-fc-locale', locale);
      // Set document direction for RTL languages
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    } catch {}
  }
}

/**
 * Translate a key to the current locale.
 * Falls back to Turkish, then to the key itself.
 */
export function t(key: TranslationKeys, params?: Record<string, string | number>): string {
  const locale = currentLocale;
  let text = dictionaries[locale]?.[key]
    || dictionaries.tr?.[key]
    || dictionaries.en?.[key]
    || key;

  // Replace template parameters like {cost}, {credits}, {action}
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }

  return text;
}

/**
 * Get browser locale if it matches a supported one, otherwise return 'tr'.
 */
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'tr';
  const browserLang = navigator.language.split('-')[0] as Locale;
  if (browserLang in dictionaries) return browserLang;
  return 'tr';
}

// ─── Position localization helpers ───

const POSITION_KEYS: Record<string, TranslationKeys> = {
  GK: 'pos_gk',
  DEF: 'pos_def',
  MID: 'pos_mid',
  FWD: 'pos_fwd',
  CB: 'pos_cb',
  LB: 'pos_lb',
  RB: 'pos_rb',
  LWB: 'pos_lwb',
  RWB: 'pos_rwb',
  CDM: 'pos_cdm',
  CM: 'pos_cm',
  CAM: 'pos_cam',
  LM: 'pos_lm',
  RM: 'pos_rm',
  ST: 'pos_st',
  LW: 'pos_lw',
  RW: 'pos_rw',
  CF: 'pos_cf',
};

export function localizePos(pos: string): string {
  return t(POSITION_KEYS[pos] || ('pos_' + pos.toLowerCase()) as TranslationKeys);
}

export function localizePosFull(pos: string): string {
  return localizePos(pos);
}

// ─── Month localization ───

const MONTH_KEYS: TranslationKeys[] = [
  'month_jan', 'month_feb', 'month_mar', 'month_apr',
  'month_may', 'month_jun', 'month_jul', 'month_aug',
  'month_sep', 'month_oct', 'month_nov', 'month_dec',
];

export function localizeMonth(monthIndex: number): string {
  // monthIndex: 0-11 (January = 0)
  if (monthIndex < 0 || monthIndex > 11) return '';
  return t(MONTH_KEYS[monthIndex]);
}
