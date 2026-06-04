/**
 * Siyah Beyaz FC — Sakatlık Dönüşü Form Düşüşü Testleri (BUG-9)
 *
 * recoverFromInjury ve updateReturnToForm fonksiyonlarının testleri:
 * - recoverFromInjury: Sakatlık süresine göre sharpness/confidence düşüşü
 * - updateReturnToForm: Maç başına kademeli toparlanma
 * - Return period'un sonlandırılması
 */

import type { Player } from '@/lib/fm/types';
import {
  recoverFromInjury,
  updateReturnToForm,
} from '@/lib/fm/injuryManager';

// ═══════════════════════════════════════════════════════════════
// Test Yardımcıları
// ═══════════════════════════════════════════════════════════════

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Test Player',
    position: 'MID',
    specificPosition: 'CM',
    rating: 75,
    age: 25,
    potential: 80,
    market_value: 1000000,
    salary: 50000,
    nation: 'TR',
    defending: 60,
    passing: 70,
    shooting: 65,
    speed: 75,
    power: 70,
    hidden_potential: 80,
    cond: 90,
    form: 75,
    morale: 70,
    confidence: 60,
    traits: [],
    match_sharpness: 100,
    is_injured: true,
    injury: {
      type: 'light',
      remaining_days: 5,
      severity: 1,
    },
    injury_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    injury_severity: 'light',
    isInjuryReturnPeriod: false,
    returnFromInjuryDate: null,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════
// recoverFromInjury TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('recoverFromInjury', () => {
  describe('Kısa sakatlık (1-7 gün)', () => {
    test('1 günlük sakatlık → sharpness -10', () => {
      const player = makePlayer({ injury: { type: 'light', remaining_days: 1, severity: 1 } });
      const result = recoverFromInjury(player);
      expect(result.match_sharpness).toBe(90);
    });

    test('5 günlük sakatlık → sharpness -10', () => {
      const player = makePlayer({ injury: { type: 'light', remaining_days: 5, severity: 1 } });
      const result = recoverFromInjury(player);
      expect(result.match_sharpness).toBe(90);
    });

    test('7 günlük sakatlık → sharpness -10', () => {
      const player = makePlayer({ injury: { type: 'light', remaining_days: 7, severity: 1 } });
      const result = recoverFromInjury(player);
      expect(result.match_sharpness).toBe(90);
    });

    test('Kısa sakatlık → confidence -5', () => {
      const player = makePlayer({
        confidence: 60,
        injury: { type: 'light', remaining_days: 3, severity: 1 },
      });
      const result = recoverFromInjury(player);
      expect(result.confidence).toBe(55);
    });
  });

  describe('Orta sakatlık (8-28 gün)', () => {
    test('8 günlük sakatlık → sharpness -25', () => {
      const player = makePlayer({ injury: { type: 'chronic', remaining_days: 8, severity: 2 } });
      const result = recoverFromInjury(player);
      expect(result.match_sharpness).toBe(75);
    });

    test('14 günlük sakatlık → sharpness -25', () => {
      const player = makePlayer({ injury: { type: 'chronic', remaining_days: 14, severity: 2 } });
      const result = recoverFromInjury(player);
      expect(result.match_sharpness).toBe(75);
    });

    test('28 günlük sakatlık → sharpness -25', () => {
      const player = makePlayer({ injury: { type: 'chronic', remaining_days: 28, severity: 2 } });
      const result = recoverFromInjury(player);
      expect(result.match_sharpness).toBe(75);
    });

    test('Orta sakatlık → confidence -10', () => {
      const player = makePlayer({
        confidence: 60,
        injury: { type: 'chronic', remaining_days: 15, severity: 2 },
      });
      const result = recoverFromInjury(player);
      expect(result.confidence).toBe(50);
    });
  });

  describe('Uzun sakatlık (29+ gün)', () => {
    test('29 günlük sakatlık → sharpness -40', () => {
      const player = makePlayer({ injury: { type: 'risky', remaining_days: 29, severity: 3 } });
      const result = recoverFromInjury(player);
      expect(result.match_sharpness).toBe(60);
    });

    test('60 günlük sakatlık → sharpness -40', () => {
      const player = makePlayer({ injury: { type: 'risky', remaining_days: 60, severity: 3 } });
      const result = recoverFromInjury(player);
      expect(result.match_sharpness).toBe(60);
    });

    test('Uzun sakatlık → confidence -15', () => {
      const player = makePlayer({
        confidence: 60,
        injury: { type: 'risky', remaining_days: 45, severity: 3 },
      });
      const result = recoverFromInjury(player);
      expect(result.confidence).toBe(45);
    });
  });

  describe('Sakatlık verisi temizleme', () => {
    test('is_injured false olur', () => {
      const player = makePlayer({ is_injured: true });
      const result = recoverFromInjury(player);
      expect(result.is_injured).toBe(false);
    });

    test('injury null olur', () => {
      const player = makePlayer({ injury: { type: 'light', remaining_days: 5, severity: 1 } });
      const result = recoverFromInjury(player);
      expect(result.injury).toBeNull();
    });

    test('injury_end_date null olur', () => {
      const player = makePlayer({ injury_end_date: '2026-06-01T00:00:00.000Z' });
      const result = recoverFromInjury(player);
      expect(result.injury_end_date).toBeNull();
    });

    test('injury_severity null olur', () => {
      const player = makePlayer({ injury_severity: 'medium' });
      const result = recoverFromInjury(player);
      expect(result.injury_severity).toBeNull();
    });
  });

  describe('Return period flag\'leri', () => {
    test('isInjuryReturnPeriod true olur', () => {
      const player = makePlayer({ isInjuryReturnPeriod: false });
      const result = recoverFromInjury(player);
      expect(result.isInjuryReturnPeriod).toBe(true);
    });

    test('returnFromInjuryDate ISO string olarak set edilir', () => {
      const player = makePlayer({ returnFromInjuryDate: null });
      const result = recoverFromInjury(player);
      expect(result.returnFromInjuryDate).not.toBeNull();
      // Geçerli bir ISO string olmalı
      expect(new Date(result.returnFromInjuryDate!).toISOString()).toBe(result.returnFromInjuryDate);
    });
  });

  describe('Edge cases', () => {
    test('injury undefined ise 0 gün olarak kabul edilir (kısa sakatlık)', () => {
      const player = makePlayer({ injury: undefined });
      const result = recoverFromInjury(player);
      // 0 gün ≤ 7 → kısa sakatlık: -10 sharpness
      expect(result.match_sharpness).toBe(90);
    });

    test('match_sharpness 0\'ın altına düşemez', () => {
      const player = makePlayer({
        match_sharpness: 5,
        injury: { type: 'risky', remaining_days: 60, severity: 3 },
      });
      const result = recoverFromInjury(player);
      expect(result.match_sharpness).toBe(0);
    });

    test('confidence 0\'ın altına düşemez', () => {
      const player = makePlayer({
        confidence: 3,
        injury: { type: 'risky', remaining_days: 60, severity: 3 },
      });
      const result = recoverFromInjury(player);
      expect(result.confidence).toBe(0);
    });

    test('match_sharpness undefined ise 100 olarak kabul edilir', () => {
      const player = makePlayer({
        match_sharpness: undefined,
        injury: { type: 'light', remaining_days: 5, severity: 1 },
      });
      const result = recoverFromInjury(player);
      expect(result.match_sharpness).toBe(90);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// updateReturnToForm TESTLERİ
// ═══════════════════════════════════════════════════════════════

describe('updateReturnToForm', () => {
  describe('Return period aktif değilse', () => {
    test('isInjuryReturnPeriod false ise oyuncu değişmez', () => {
      const player = makePlayer({
        isInjuryReturnPeriod: false,
        match_sharpness: 60,
        confidence: 50,
      });
      const result = updateReturnToForm(player);
      expect(result.match_sharpness).toBe(60);
      expect(result.confidence).toBe(50);
      expect(result.isInjuryReturnPeriod).toBe(false);
    });
  });

  describe('Maç başına kademeli toparlanma', () => {
    test('Her maçta match_sharpness +5 artar', () => {
      const player = makePlayer({
        isInjuryReturnPeriod: true,
        match_sharpness: 60,
        form: 80,
      });
      const result = updateReturnToForm(player);
      expect(result.match_sharpness).toBe(65);
    });

    test('Her maçta confidence +3 artar', () => {
      const player = makePlayer({
        isInjuryReturnPeriod: true,
        match_sharpness: 50,
        confidence: 40,
        form: 80,
      });
      const result = updateReturnToForm(player);
      expect(result.confidence).toBe(43);
    });

    test('Birden fazla maç simülasyonu — kademeli artış', () => {
      let player = makePlayer({
        isInjuryReturnPeriod: true,
        match_sharpness: 55,
        confidence: 30,
        form: 80,
      });

      // Maç 1
      player = updateReturnToForm(player);
      expect(player.match_sharpness).toBe(60);
      expect(player.confidence).toBe(33);

      // Maç 2
      player = updateReturnToForm(player);
      expect(player.match_sharpness).toBe(65);
      expect(player.confidence).toBe(36);

      // Maç 3
      player = updateReturnToForm(player);
      expect(player.match_sharpness).toBe(70);
      expect(player.confidence).toBe(39);
    });
  });

  describe('Return period sonlandırma', () => {
    test('match_sharpness form değerine ulaştığında return period biter', () => {
      const player = makePlayer({
        isInjuryReturnPeriod: true,
        match_sharpness: 73,
        confidence: 55,
        form: 75,
      });
      const result = updateReturnToForm(player);
      // 73 + 5 = 78 >= 75 (form) → period biter
      expect(result.match_sharpness).toBe(78);
      expect(result.isInjuryReturnPeriod).toBe(false);
      expect(result.returnFromInjuryDate).toBeNull();
    });

    test('match_sharpness 70\'e ulaştığında (form < 70 olsa bile) return period biter', () => {
      const player = makePlayer({
        isInjuryReturnPeriod: true,
        match_sharpness: 67,
        confidence: 55,
        form: 50, // form 50 ama minimum 70
      });
      const result = updateReturnToForm(player);
      // 67 + 5 = 72 >= 70 → period biter
      expect(result.match_sharpness).toBe(72);
      expect(result.isInjuryReturnPeriod).toBe(false);
    });

    test('Sharpness hedefin altındaysa return period devam eder', () => {
      const player = makePlayer({
        isInjuryReturnPeriod: true,
        match_sharpness: 55,
        confidence: 40,
        form: 80,
      });
      const result = updateReturnToForm(player);
      // 55 + 5 = 60 < 80 → period devam
      expect(result.match_sharpness).toBe(60);
      expect(result.isInjuryReturnPeriod).toBe(true);
    });
  });

  describe('Tam toparlanma simülasyonu (uzun sakatlık)', () => {
    test('Uzun sakatlıktan sonra kademeli toparlanma tam döngü', () => {
      // 60 günlük sakatlık → sharpness 60, confidence 45
      let player = makePlayer({
        isInjuryReturnPeriod: true,
        match_sharpness: 60,
        confidence: 45,
        form: 75,
      });

      const matchCount: number[] = [];

      while (player.isInjuryReturnPeriod && matchCount.length < 20) {
        player = updateReturnToForm(player);
        matchCount.push(player.match_sharpness!);
      }

      // Toparlama: 60 → 65 → 70 → 75 (3 maçta biter, 75 >= target)
      expect(matchCount).toEqual([65, 70, 75]);
      expect(player.isInjuryReturnPeriod).toBe(false);
      expect(player.match_sharpness).toBe(75);
    });
  });

  describe('Edge cases', () => {
    test('match_sharpness 100\'ü aşamaz', () => {
      const player = makePlayer({
        isInjuryReturnPeriod: true,
        match_sharpness: 98,
        confidence: 95,
        form: 70,
      });
      const result = updateReturnToForm(player);
      expect(result.match_sharpness).toBe(100);
    });

    test('confidence 100\'ü aşamaz', () => {
      const player = makePlayer({
        isInjuryReturnPeriod: true,
        match_sharpness: 60,
        confidence: 99,
        form: 80,
      });
      const result = updateReturnToForm(player);
      expect(result.confidence).toBe(100);
    });

    test('match_sharpness undefined ise 0 olarak kabul edilir', () => {
      const player = makePlayer({
        isInjuryReturnPeriod: true,
        match_sharpness: undefined,
        confidence: 50,
        form: 75,
      });
      const result = updateReturnToForm(player);
      expect(result.match_sharpness).toBe(5);
    });
  });
});
