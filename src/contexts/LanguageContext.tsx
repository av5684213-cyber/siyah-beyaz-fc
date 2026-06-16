'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type Locale, getCurrentLocale, setCurrentLocale, SUPPORTED_LOCALES } from '@/lib/fm/i18n';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('tr');

  useEffect(() => {
    // Load saved locale on mount
    const saved = getCurrentLocale();
    setLocaleState(saved);
    setCurrentLocale(saved);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setCurrentLocale(newLocale);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, supportedLocales: SUPPORTED_LOCALES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
