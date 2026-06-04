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
    return `${(val / 1_000_000).toFixed(1)}M €`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(0)}K €`;
  }
  return `${Math.round(val)} €`;
}

/**
 * Oyuncunun piyasa değerini hesaplar.
 *
 * @param player - Oyuncu verisi (form_rating, injury_history, age dahil)
 * @returns Piyasa değeri (€ cinsinden, minimum 150.000)
 *
 * @example
 * const value = calculateMarketValue(player);
 * // player.form_rating = 85 → +%17.5 bonus
 * // player.age = 19 → +30% potansiyel bonusu
 * // player.injury_history son 30 günde 3 sakatlık → -20% düşüş
 */
export function calculateMarketValue(player: Player, currentDay?: number): number {
  // ═══════════════════════════════════════════════════════════
  // TEMEL DEĞER: Rating'e göre üstel büyüme
  // ═══════════════════════════════════════════════════════════
  const baseValue = 50000;
  const ratingFactor = Math.pow(1.11, player.rating - 40);
  let value = baseValue * ratingFactor;

  // ═══════════════════════════════════════════════════════════
  // YAŞ FAKTÖRÜ (düzeltme: if-else sıralaması küçükten büyüğe)
  // Eski sürümde 31 yaş 0.60x, 33 yaş 0.80x oluyordu — yaşlı daha değerli!
  // ═══════════════════════════════════════════════════════════
  if (player.age < 22) {
    value *= 1.30;  // Genç oyuncular: potansiyel bonusu +%30
  } else if (player.age < 24) {
    value *= 1.20;  // 22-23 yaş: +%20 (eski 1.4 çok yüksekti)
  } else if (player.age < 28) {
    value *= 1.10;  // 24-27 yaş: prime öncesi +%10
  } else if (player.age < 31) {
    value *= 1.00;  // 28-30 yaş: prime, çarpan yok
  } else if (player.age < 33) {
    value *= 0.85;  // 31-32 yaş: hafif düşüş -%15
  } else if (player.age < 35) {
    value *= 0.70;  // 33-34 yaş: belirgin düşüş -%30
  } else {
    value *= 0.55;  // 35+ yaş: sert düşüş -%45
  }

  // Potansiyel etki: Genç oyuncularda potential > rating ise ek bonus
  if (player.potential > player.rating && player.age < 23) {
    const potentialGap = player.potential - player.rating;
    value *= (1 + (potentialGap * 0.03));  // 0.08'den 0.03'e düşürüldü
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
  // Trait level ödülleri (toplama yöntemi — birikimli çarpım yerine)
  // Eski sürümde 3 MOR trait = 1.40^3 = 2.74x → çok aşırıydı
  if (player.traitLevels) {
    let traitBonus = 0;
    Object.values(player.traitLevels).forEach(lvl => {
      if (lvl === 'MOR') traitBonus += 0.15;      // Her MOR +%15 (toplamda birikir)
      else if (lvl === 'ALTIN') traitBonus += 0.10; // Her ALTIN +%10
      else if (lvl === 'LACIVERT') traitBonus += 0.05; // Her LACİVERT +%5
      else if (lvl === 'BEYAZ') traitBonus += 0.01;    // Her BEYAZ +%1
    });
    // Maksimum +%40 trait bonus sınırı
    value *= (1 + Math.min(0.40, traitBonus));
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

  // ═══════════════════════════════════════════════════════════
  // ENFLASYON FAKTÖRÜ (cron ile tutarlılık için)
  // currentDay verilirse enflasyon çarpanı uygulanır
  // ═══════════════════════════════════════════════════════════
  if (currentDay && currentDay > 1) {
    const { getInflationFactor } = require('./inflation');
    value *= getInflationFactor(currentDay);
  }

  // Minimum değer (150K) ve yuvarlama
  return Math.max(150000, Math.round(value));
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
