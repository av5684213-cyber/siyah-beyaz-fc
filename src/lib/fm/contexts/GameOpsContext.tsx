/**
 * Oyun İşlemleri Bağlamı — Antrenman + Maç İşlemleri
 *
 * Aktif taktik, antrenman durumu ve keşif işlemlerini yönetir.
 * processScouting yalnızca trainingState'e yazar → yerel fonksiyon.
 * Sınır ötesi fonksiyonlar (initTeam, playFriendlyMatch) FMProviderInner'da tanımlanır.
 */
'use client';
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ActiveTactic, TrainingState, Player, getDefaultGameTactics, getDefaultTrainingState } from '../types';
import { generateLocalizedPlayer } from '../region-generator';

// ── Oyun İşlemleri bağlamı değer arayüzü ────────────────────────
interface GameOpsContextValue {
  /** Aktif taktik */
  activeTactic: ActiveTactic;
  /** Taktik güncelleyici */
  setActiveTactic: React.Dispatch<React.SetStateAction<ActiveTactic>>;
  /** Antrenman durumu */
  trainingState: TrainingState;
  /** Antrenman durumu güncelleyici */
  setTrainingState: React.Dispatch<React.SetStateAction<TrainingState>>;
  /** Keşif işlemlerini işle (yerel — sadece trainingState'e yazar) */
  processScouting: (day: number) => void;
}

const GameOpsContext = createContext<GameOpsContextValue | null>(null);

// ── Oyun İşlemleri Sağlayıcısı ──────────────────────────────────
export const GameOpsProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTactic, setActiveTactic] = useState<ActiveTactic>(getDefaultGameTactics());
  const [trainingState, setTrainingState] = useState<TrainingState>(getDefaultTrainingState());

  // ── Keşif işlemlerini işle ───────────────────────────────────
  // Yalnızca trainingState'e yazar — sınır ötesi bağımlılık yok
  const processScouting = useCallback((day: number) => {
    setTrainingState((prev: TrainingState) => {
      if (!prev || !prev.scouting) return prev;

      const currentScouting = prev.scouting;
      const updatedScouts = currentScouting.scouts.map((s: any) => {
        if (s.status === 'SCOUTING') {
          const nextDays = Math.max(0, s.remainingDays - 1);
          return { ...s, remainingDays: nextDays };
        }
        return s;
      });

      const finishingScouts = updatedScouts.filter((s: any) => s.status === 'SCOUTING' && s.remainingDays === 0);
      let newPlayers: Player[] = [];

      finishingScouts.forEach((s: any) => {
        // Kıta süresini minStars/bölge ile eşleştir veya
        // scout başına 1-3 oyuncu üret
        const playersToFind = 1 + Math.floor(Math.random() * 2); // 1-2 oyuncu
        for (let i = 0; i < playersToFind; i++) {
          // Scout konumundan bölge belirle
          let region: any = 'TR'; // Varsayılan
          if (s.location === 'AVRUPA') region = 'EN';
          else if (s.location === 'GÜNEY AMERİKA') region = 'BR';
          else if (s.location === 'AFRİKA') region = 'NG' as any;
          else if (s.location === 'ASYA') region = 'CN' as any;
          else if (s.location === 'KUZEY AMERİKA') region = 'US' as any;

          // Scout yıldızına göre kalite
          // s.stars 1: ~60 rating, 5: ~85 rating
          const minRating = 40 + (s.stars * 8);
          const p = generateLocalizedPlayer(region, 'Serbest', 1);
          newPlayers.push({
            ...p,
            rating: Math.max(minRating, p.rating),
            scouted: true,
            scouting_stars: s.stars
          });
        }
        s.status = 'IDLE';
        s.location = undefined;
      });

      return {
        ...prev,
        scouting: {
          ...currentScouting,
          scouts: updatedScouts,
          foundPlayersPool: [...(currentScouting.foundPlayersPool || []), ...newPlayers]
        }
      };
    });
  }, [setTrainingState]);

  // ── Bağlam değerini memoize et ───────────────────────────────
  const value = useMemo<GameOpsContextValue>(() => ({
    activeTactic, setActiveTactic,
    trainingState, setTrainingState,
    processScouting,
  }), [activeTactic, trainingState, processScouting]);

  return (
    <GameOpsContext.Provider value={value}>
      {children}
    </GameOpsContext.Provider>
  );
};

// ── Oyun İşlemleri bağlamı kanca (hook) ─────────────────────────
export const useGameOpsContext = () => {
  const context = useContext(GameOpsContext);
  if (!context) throw new Error('useGameOpsContext bir GameOpsProvider içinde kullanılmalıdır');
  return context;
};
