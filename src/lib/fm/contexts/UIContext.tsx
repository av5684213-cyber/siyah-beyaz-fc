/**
 * UI Bağlamı — Arayüz Durumu
 *
 * Aktif sekme, yerel ayar, yükleme durumu, seçili takım profili
 * ve doğrudan mesaj alıcısı gibi arayüz durumunu yönetir.
 * Sınır ötesi bağımlılığı yoktur — tamamen yereldir.
 */
'use client';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Locale, getBrowserLocale } from '../i18n';

// ── UI bağlamı değer arayüzü ────────────────────────────────────
interface UIContextValue {
  /** Aktif sekme */
  activeTab: string;
  /** Sekme güncelleyici */
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  /** Yerel ayar */
  locale: Locale;
  /** Yerel ayar güncelleyici */
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
  /** Yükleme durumu */
  loading: boolean;
  /** Yükleme durumu güncelleyici */
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  /** Seçili takım profili ID'si */
  selectedTeamProfile: string | null;
  /** Seçili takım profili güncelleyici */
  setSelectedTeamProfile: React.Dispatch<React.SetStateAction<string | null>>;
  /** Doğrudan mesaj alıcısı */
  directMessageRecipient: any | null;
  /** Doğrudan mesaj alıcısı güncelleyici */
  setDirectMessageRecipient: React.Dispatch<React.SetStateAction<any | null>>;
}

const UIContext = createContext<UIContextValue | null>(null);

// ── UI Sağlayıcısı ──────────────────────────────────────────────
export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [locale, setLocale] = useState<Locale>(getBrowserLocale());
  const [loading, setLoading] = useState(true);
  const [selectedTeamProfile, setSelectedTeamProfile] = useState<string | null>(null);
  const [directMessageRecipient, setDirectMessageRecipient] = useState<any | null>(null);

  // ── Güvenlik zamanlayıcısı: yükleme 8 saniyeden fazla sürerse zorla false yap ──
  // Uygulamanın sonsuz yükleme döngüsünde kalmasını önler
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn('[UIContext] Yükleme zaman aşımı — loading=false zorlanıyor');
          return false;
        }
        return prev;
      });
    }, 8000);
    return () => clearTimeout(timeout);
  }, []);

  // ── Bağlam değerini memoize et ───────────────────────────────
  const value = useMemo<UIContextValue>(() => ({
    activeTab, setActiveTab,
    locale, setLocale,
    loading, setLoading,
    selectedTeamProfile, setSelectedTeamProfile,
    directMessageRecipient, setDirectMessageRecipient,
  }), [activeTab, locale, loading, selectedTeamProfile, directMessageRecipient]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

// ── UI bağlamı kanca (hook) ─────────────────────────────────────
export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUIContext bir UIProvider içinde kullanılmalıdır');
  return context;
};
