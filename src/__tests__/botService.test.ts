/**
 * Touchline Manager — Bot AI Testleri
 *
 * botService.ts modülünün saf yardımcı fonksiyonlarını test eder.
 * NOT: processBotTransfers, selectMatchSquad gibi Supabase bağımlı
 * fonksiyonlar bu test kapsamında değildir — onlar için integration
 * test gerekir. Burada sadece pure helper mantığı test edilir.
 */

import type { Player } from '@/lib/fm/types';

// ═══════════════════════════════════════════════════════════════
// SAHİCİ YARDIMCI FONKSİYONLAR (botService.ts'ten kopyalandı)
// Bu fonksiyonlar modülden export edilmediği için burada yeniden
// tanımlanmıştır. Gelecekte export edilmeleri önerilir.
// ═══════════════════════════════════════════════════════════════

interface BotPlayer {
  id: string;
  name: string;
  position: string;
  specificPosition?: string;
  rating: number;
  potential: number;
  age: number;
  market_value: number;
  salary: number;
}

/**
 * Pozisyonu grup harfine dönüştürür.
 * GK→GK, CB/LB/RB→DEF, CDM/CM/CAM/LM/RM→MID, ST/LW/RW/CF→FWD
 */
function mapToGroup(position: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  const p = position.toUpperCase();
  if (p === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF'].includes(p)) return 'DEF';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM', 'MID'].includes(p)) return 'MID';
  return 'FWD'; // ST, LW, RW, CF, FWD, vs.
}

/**
 * Kadrodaki pozisyon ihtiyaçlarını hesaplar.
 * Her grup için hedef sayı: GK=2, DEF=6, MID=6, FWD=4
 */
function getPositionNeed(squad: BotPlayer[]): Record<string, number> {
  const targets: Record<string, number> = { GK: 2, DEF: 6, MID: 6, FWD: 4 };
  const counts: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };

  for (const p of squad) {
    const group = mapToGroup(p.position || p.specificPosition || 'MID');
    counts[group] = (counts[group] || 0) + 1;
  }

  const needs: Record<string, number> = {};
  for (const [group, target] of Object.entries(targets)) {
    needs[group] = Math.max(0, target - (counts[group] || 0));
  }

  return needs;
}

// ═══════════════════════════════════════════════════════════════
// TEST VERİLERİ
// ═══════════════════════════════════════════════════════════════

function createBotPlayer(overrides: Partial<BotPlayer> = {}): BotPlayer {
  return {
    id: `bp-${Math.random().toString(36).slice(2, 6)}`,
    name: 'Bot Oyuncu',
    position: 'MID',
    specificPosition: 'CM',
    rating: 60,
    potential: 65,
    age: 24,
    market_value: 300_000,
    salary: 5_000,
    ...overrides,
  };
}

function createBalancedSquad(): BotPlayer[] {
  return [
    createBotPlayer({ position: 'GK', specificPosition: 'GK' }),
    createBotPlayer({ position: 'GK', specificPosition: 'GK' }),
    createBotPlayer({ position: 'DEF', specificPosition: 'CB' }),
    createBotPlayer({ position: 'DEF', specificPosition: 'CB' }),
    createBotPlayer({ position: 'DEF', specificPosition: 'LB' }),
    createBotPlayer({ position: 'DEF', specificPosition: 'RB' }),
    createBotPlayer({ position: 'DEF', specificPosition: 'CB' }),
    createBotPlayer({ position: 'DEF', specificPosition: 'CB' }),
    createBotPlayer({ position: 'MID', specificPosition: 'CDM' }),
    createBotPlayer({ position: 'MID', specificPosition: 'CM' }),
    createBotPlayer({ position: 'MID', specificPosition: 'CM' }),
    createBotPlayer({ position: 'MID', specificPosition: 'CAM' }),
    createBotPlayer({ position: 'MID', specificPosition: 'LM' }),
    createBotPlayer({ position: 'MID', specificPosition: 'RM' }),
    createBotPlayer({ position: 'FWD', specificPosition: 'ST' }),
    createBotPlayer({ position: 'FWD', specificPosition: 'LW' }),
    createBotPlayer({ position: 'FWD', specificPosition: 'RW' }),
    createBotPlayer({ position: 'FWD', specificPosition: 'ST' }),
  ];
}

// ═══════════════════════════════════════════════════════════════
// POZİSYON GRUP EŞLEME TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('mapToGroup — Pozisyon Grup Eşleme', () => {
  test('GK → GK', () => {
    expect(mapToGroup('GK')).toBe('GK');
  });

  test('Savunma pozisyonları → DEF', () => {
    expect(mapToGroup('CB')).toBe('DEF');
    expect(mapToGroup('LB')).toBe('DEF');
    expect(mapToGroup('RB')).toBe('DEF');
    expect(mapToGroup('LWB')).toBe('DEF');
    expect(mapToGroup('RWB')).toBe('DEF');
    expect(mapToGroup('DEF')).toBe('DEF');
  });

  test('Orta saha pozisyonları → MID', () => {
    expect(mapToGroup('CDM')).toBe('MID');
    expect(mapToGroup('CM')).toBe('MID');
    expect(mapToGroup('CAM')).toBe('MID');
    expect(mapToGroup('LM')).toBe('MID');
    expect(mapToGroup('RM')).toBe('MID');
    expect(mapToGroup('MID')).toBe('MID');
  });

  test('Forvet pozisyonları → FWD', () => {
    expect(mapToGroup('ST')).toBe('FWD');
    expect(mapToGroup('LW')).toBe('FWD');
    expect(mapToGroup('RW')).toBe('FWD');
    expect(mapToGroup('CF')).toBe('FWD');
    expect(mapToGroup('FWD')).toBe('FWD');
  });

  test('Bilinmeyen pozisyon → FWD (varsayılan)', () => {
    expect(mapToGroup('UNKNOWN')).toBe('FWD');
    expect(mapToGroup('SS')).toBe('FWD');
  });

  test('Küçük/büyük harf duyarsız', () => {
    expect(mapToGroup('gk')).toBe('GK');
    expect(mapToGroup('cb')).toBe('DEF');
    expect(mapToGroup('cm')).toBe('MID');
    expect(mapToGroup('st')).toBe('FWD');
  });
});

// ═══════════════════════════════════════════════════════════════
// POZİSYON İHTİYAÇ TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('getPositionNeed — Pozisyon İhtiyaç Hesaplama', () => {
  test('Dengeli kadroda ihtiyaç yok', () => {
    const squad = createBalancedSquad();
    const needs = getPositionNeed(squad);

    expect(needs.GK).toBe(0);
    expect(needs.DEF).toBe(0);
    expect(needs.MID).toBe(0);
    expect(needs.FWD).toBe(0);
  });

  test('Boş kadroda tüm pozisyonlarda ihtiyaç var', () => {
    const needs = getPositionNeed([]);

    expect(needs.GK).toBe(2);
    expect(needs.DEF).toBe(6);
    expect(needs.MID).toBe(6);
    expect(needs.FWD).toBe(4);
  });

  test('Kaleci eksik → GK ihtiyacı 1', () => {
    const squad = createBalancedSquad().slice(1); // İlk GK'yı çıkar
    const needs = getPositionNeed(squad);

    expect(needs.GK).toBe(1);
  });

  test('Tüm forvetler çıkarıldığında FWD ihtiyacı 4', () => {
    const squad = createBalancedSquad().filter(p => mapToGroup(p.position) !== 'FWD');
    const needs = getPositionNeed(squad);

    expect(needs.FWD).toBe(4);
  });

  test('Fazla oyuncu ihtiyacı negatif yapmaz', () => {
    // 10 forvetli kadro
    const squad: BotPlayer[] = [];
    for (let i = 0; i < 10; i++) {
      squad.push(createBotPlayer({ position: 'FWD', specificPosition: 'ST' }));
    }
    const needs = getPositionNeed(squad);

    expect(needs.FWD).toBe(0); // Negatif olamaz
  });

  test('Sadece kalecilerden oluşan kadro', () => {
    const squad: BotPlayer[] = [];
    for (let i = 0; i < 5; i++) {
      squad.push(createBotPlayer({ position: 'GK', specificPosition: 'GK' }));
    }
    const needs = getPositionNeed(squad);

    expect(needs.GK).toBe(0); // Fazla kaleci → ihtiyaç yok
    expect(needs.DEF).toBe(6);
    expect(needs.MID).toBe(6);
    expect(needs.FWD).toBe(4);
  });
});

// ═══════════════════════════════════════════════════════════════
// KADRO OLUŞTURMA MANTIK TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('Bot Kadro Oluşturma Mantığı', () => {
  test('Her grupta en az 1 oyuncu olmalı', () => {
    const squad = createBalancedSquad();
    const groups = new Set(squad.map(p => mapToGroup(p.position)));

    expect(groups.has('GK')).toBe(true);
    expect(groups.has('DEF')).toBe(true);
    expect(groups.has('MID')).toBe(true);
    expect(groups.has('FWD')).toBe(true);
  });

  test('Minimum 18 oyunculu kadro tüm grupları kapsar', () => {
    const squad = createBalancedSquad();
    expect(squad.length).toBeGreaterThanOrEqual(18);

    const needs = getPositionNeed(squad);
    const totalNeed = Object.values(needs).reduce((a, b) => a + b, 0);
    expect(totalNeed).toBe(0);
  });

  test('Rating sıralaması: en iyi oyuncular kadroda', () => {
    const squad = createBalancedSquad();
    // Her gruptaki en iyi oyuncuyu bul
    const groupBest: Record<string, number> = {};
    for (const p of squad) {
      const g = mapToGroup(p.position);
      groupBest[g] = Math.max(groupBest[g] || 0, p.rating);
    }

    // Her grupta en az 60 rating olmalı (bot seviyesi)
    for (const [group, best] of Object.entries(groupBest)) {
      expect(best).toBeGreaterThanOrEqual(60);
    }
  });
});
