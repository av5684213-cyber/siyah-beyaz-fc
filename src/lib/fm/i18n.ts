/**
 * i18n — Re-export from new module
 *
 * The i18n system has been moved to ./i18n/index.ts
 * This file re-exports for backward compatibility.
 */

export { t, getCurrentLocale, setCurrentLocale, getBrowserLocale, localizePos, localizePosFull, localizeMonth, SUPPORTED_LOCALES, type Locale, type TranslationKeys } from './i18n/index';
