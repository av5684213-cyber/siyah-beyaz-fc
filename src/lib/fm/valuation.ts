/**
 * valuation.ts - Oyuncu Piyasa Değeri Hesaplama (ADIM 1C güncellendi)
 *
 * FM-tarzı değerleme mantığı:
 * - Temel değer: rating'e göre üstel büyüme
 * - Yaş faktörleri: gençler potansiyel bonusu, yaşlılar düşüş
 * - Form rating: son 5 maç performansı (±%25)
 * - Sakatlık geçmişi: son 30 günde 2+ sakatlık → %20 düşüş
 * - Trait, arketip, istisnai istatistik bonusları
 */

import { Player, InjuryRecord } from './types';
import { countRecentInjuries } from './formRatingService';
import { VALUATION_STAT_KEYS } from './sharedUtils';

export function formatCurrency(val: number): string {
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)}M Kredi`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(0)}K Kredi`;
  }
  return `${Math.round(val)} Kredi`;
}

/**
 * Oyuncunun piyasa değerini hesaplar.
 *
 * @param player - Oyuncu verisi (form_rating, injury_history, age dahil)
 * @returns Piyasa değeri (TL cinsinden, minimum 150.000)
 *
 * @example
 * const value = calculateMarketValue(player);
 * // player.form_rating = 85 → +%17.5 bonus
 * // player.age = 19 → +30% potansiyel bonusu
 * // player.injury_history son 30 günde 3 sakatlık → -20% düşüş
 */
export function calculateMarketValue(player: Player): number {
  // ═══════════════════════════════════════════════════════════
  // TEMEL DEĞER: Rating'e göre üstel büyüme
  // ═══════════════════════════════════════════════════════════
  const baseValue = 50000;
  const ratingFactor = Math.pow(1.11, player.rating - 40);
  let value = baseValue * ratingFactor;

  // ═══════════════════════════════════════════════════════════
  // YAŞ FAKTÖRÜ (ADIM 1C - Güncellendi)
  // Gençler (<22): +%30 potansiyel bonusu
  // Yaşlılar (>32): -%20 düşüş
  // ═══════════════════════════════════════════════════════════
  if (player.age < 22) {
    // Genç oyuncular: potansiyel bonusu +%30
    value *= 1.30;
  } else if (player.age < 24) {
    value *= 1.4;
  } else if (player.age < 28) {
    value *= 1.1;
  } else if (player.age > 32) {
    // Yaşlı oyuncular: -%20 düşüş
    value *= 0.80;
  } else if (player.age > 30) {
    value *= 0.6;
  }

  // Potansiyel etki: Genç oyuncularda potential > rating ise ek bonus
  if (player.potential > player.rating && player.age < 23) {
    const potentialGap = player.potential - player.rating;
    value *= (1 + (potentialGap * 0.08));
  }

  // ═══════════════════════════════════════════════════════════
  // FORM RATING FAKTÖRÜ (ADIM 1C - YENİ)
  // Son 5 maç performansı: ±%25 etki
  // form_rating 50 = nötr, >50 = artış, <50 = düşüş
  // ═══════════════════════════════════════════════════════════
  const formRating = player.form_rating ?? player.form ?? 50;
  if (formRating !== 50) {
    // 50'den her 1 puan sapma = %0.5 etki (max ±%25)
    // formRating=100 → +25%, formRating=0 → -25%, formRating=50 → 0%
    const formMultiplier = 1 + ((formRating - 50) / 100);
    // ±%25 sınırla
    const clampedMultiplier = Math.max(0.75, Math.min(1.25, formMultiplier));
    value *= clampedMultiplier;
  }

  // ═══════════════════════════════════════════════════════════
  // SAKATLIK GEÇMİŞİ FAKTÖRÜ (ADIM 1C - YENİ)
  // Son 30 günde 2+ sakatlık → -%20 düşüş
  // ═══════════════════════════════════════════════════════════
  const recentInjuryCount = countRecentInjuries(player.injury_history, 30);
  if (recentInjuryCount >= 2) {
    value *= 0.80; // %20 düşüş
  } else if (recentInjuryCount === 1) {
    value *= 0.92; // Tek sakatlık: %8 düşüş
  }

  // Aktif sakatlık varsa ek düşüş
  if (player.injury) {
    value *= 0.85; // Aktif sakatlık: %15 düşüş
  }

  // ═══════════════════════════════════════════════════════════
  // TRAIT LEVEL ÖDÜLLERİ
  // ═══════════════════════════════════════════════════════════
  if (player.traitLevels) {
    Object.values(player.traitLevels).forEach(lvl => {
      if (lvl === 'MOR') value *= 1.40;
      else if (lvl === 'ALTIN') value *= 1.25;
      else if (lvl === 'LACIVERT') value *= 1.10;
      else if (lvl === 'BEYAZ') value *= 1.02;
    });
  }

  // Pozitif trait bonusu (her biri +%3, max +%15)
  const positiveTraitCount = player.traits?.length || 0;
  if (positiveTraitCount > 0) {
    value *= (1 + Math.min(0.15, positiveTraitCount * 0.03));
  }

  // Negatif trait cezası (her biri -%5, max -%25)
  const negTraitCount = player.negTraits?.length || 0;
  if (negTraitCount > 0) {
    value *= Math.max(0.75, 1 - (negTraitCount * 0.05));
  }

  // ═══════════════════════════════════════════════════════════
  // ARKETİP BONUSU
  // ═══════════════════════════════════════════════════════════
  if (player.archetype) {
    const highValueArchetypes = [
      'Playmaker', 'Ball Winner', 'Target Man', 'Complete Forward',
      'Sweeper Keeper', 'Regista', 'Mezzala', 'Inverted Wing Back',
      'False 9', 'Complete Midfielder', 'Box to Box',
    ];
    if (highValueArchetypes.some(a => player.archetype!.includes(a))) {
      value *= 1.08;
    } else {
      value *= 1.05;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // YAN MEVKİ ÇOKYÖNLÜLÜK BONUSU
  // ═══════════════════════════════════════════════════════════
  const secPosCount = player.secondaryPositions?.length || 0;
  if (secPosCount > 0) {
    value *= (1 + Math.min(0.06, secPosCount * 0.02));
  }

  // ═══════════════════════════════════════════════════════════
  // ESKİ FORM ETKİSİ (backward compat - artık form_rating kullanılıyor)
  // ═══════════════════════════════════════════════════════════
  // form_rating yoksa eski form alanını hafif etki olarak kullan
  if (!player.form_rating && player.form) {
    if (player.form > 75) value *= 1.03;
    else if (player.form < 40) value *= 0.97;
  }

  // ═══════════════════════════════════════════════════════════
  // İSTİSNAİ İSTATİSTİK BONUSU
  // ═══════════════════════════════════════════════════════════
  const statKeys = VALUATION_STAT_KEYS;
  let exceptional90Count = 0;
  let exceptional95Count = 0;
  for (const key of statKeys) {
    const val = (player as any)[key];
    if (typeof val === 'number') {
      if (val >= 95) exceptional95Count++;
      else if (val >= 90) exceptional90Count++;
    }
  }
  if (exceptional90Count > 0) value *= (1 + Math.min(0.10, exceptional90Count * 0.02));
  if (exceptional95Count > 0) value *= (1 + Math.min(0.15, exceptional95Count * 0.03));

  // Minimum değer (150K) ve yuvarlama
  return Math.round(Math.max(150000, value));
}

/**
 * Transfer koridoru: bir oyuncunun makul transfer fiyat aralığını döndürür.
 *
 * @param value - Piyasa değeri
 * @returns Minimum ve maksimum makul fiyat
 */
export function getTransferCorridor(value: number): { min: number, max: number } {
  // Pahalı oyuncular için daha geniş koridor
  const minMult = value > 5_000_000 ? 0.75 : 0.80;
  const maxMult = value > 5_000_000 ? 1.6 : 1.5;
  return {
    min: Math.round(value * minMult),
    max: Math.round(value * maxMult),
  };
}
