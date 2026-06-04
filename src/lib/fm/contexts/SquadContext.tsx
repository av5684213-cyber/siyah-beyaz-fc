/**
 * Kadro Bağlamı — Kadro + Transfer İşlemleri
 *
 * Kadro, izleme listesi ve lig oyuncuları durumunu yönetir.
 * Sınır ötesi fonksiyonlar (scoutPlayer, negotiatePurchase, toggleWatchlist)
 * FMProviderInner'da tanımlanır çünkü profil ve taktik durumunu okumaları gerekir.
 *
 * BUG-7: useMemo ile hesaplanan değerler eklendi — tüketiciler
 * sıralama/filtreleme işlemlerini yeniden hesaplamak zorunda kalmaz.
 */
'use client';
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Player } from '../types';

// ── Kadro bağlamı değer arayüzü ─────────────────────────────────
interface SquadContextValue {
  /** Kadro oyuncuları */
  squad: Player[];
  /** Kadro güncelleyici */
  setSquad: React.Dispatch<React.SetStateAction<Player[]>>;
  /** İzleme listesi (oyuncu ID'leri) */
  watchlist: string[];
  /** İzleme listesi güncelleyici */
  setWatchlist: React.Dispatch<React.SetStateAction<string[]>>;
  /** Lig sıralaması oyuncuları */
  league: Player[];
  /** Lig güncelleyici */
  setLeague: React.Dispatch<React.SetStateAction<Player[]>>;
  /** BUG-7: Mevki grubuna göre sıralanmış kadro */
  squadByPosition: { GK: Player[]; DEF: Player[]; MID: Player[]; FWD: Player[] };
  /** BUG-7: Toplam kadro maaş maliyeti (günlük) */
  totalDailyWages: number;
  /** BUG-7: İzleme listesindeki oyuncu sayısı */
  watchlistCount: number;
}

const SquadContext = createContext<SquadContextValue | null>(null);

// ── Kadro Sağlayıcısı ───────────────────────────────────────────
export const SquadProvider = ({ children }: { children: React.ReactNode }) => {
  const [squad, setSquad] = useState<Player[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [league, setLeague] = useState<Player[]>([]);

  // ── BUG-7: Hesaplanan değerler — tüketiciler yeniden hesaplama yapmaz ──
  const squadByPosition = useMemo(() => {
    const groups: { GK: Player[]; DEF: Player[]; MID: Player[]; FWD: Player[] } = { GK: [], DEF: [], MID: [], FWD: [] };
    const posGroupMap: Record<string, 'GK' | 'DEF' | 'MID' | 'FWD'> = {
      GK: 'GK',
      CB: 'DEF', LB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF', DEF: 'DEF',
      CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID', LW: 'MID', RW: 'MID', MID: 'MID',
      ST: 'FWD', CF: 'FWD', FWD: 'FWD'
    };
    for (const p of squad) {
      const group = posGroupMap[p.specificPosition || p.position] || 'MID';
      groups[group].push(p);
    }
    return groups;
  }, [squad]);

  const totalDailyWages = useMemo(() => {
    return squad.reduce((acc, p) => acc + (p.salary || 0) / 30, 0);
  }, [squad]);

  const watchlistCount = watchlist.length;

  // ── Bağlam değerini memoize et ───────────────────────────────
  const value = useMemo<SquadContextValue>(() => ({
    squad, setSquad,
    watchlist, setWatchlist,
    league, setLeague,
    squadByPosition, totalDailyWages, watchlistCount,
  }), [squad, watchlist, league, squadByPosition, totalDailyWages, watchlistCount]);

  return (
    <SquadContext.Provider value={value}>
      {children}
    </SquadContext.Provider>
  );
};

// ── Kadro bağlamı kanca (hook) ──────────────────────────────────
export const useSquadContext = () => {
  const context = useContext(SquadContext);
  if (!context) throw new Error('useSquadContext bir SquadProvider içinde kullanılmalıdır');
  return context;
};
