/**
 * Injury Manager — Sakatlık Sistemi
 *
 * Sakatlık riski, sakatlık üretimi ve fizyoterapist iyileştirme hesaplamaları.
 * Maç motoru veya cron tarafından çağrılır; bu modül sadece hesaplama yapar.
 */

// ═══════════════════════════════════════════════════════════════
// Sakatlık Riski Hesaplama
// ═══════════════════════════════════════════════════════════════

/**
 * Dayanıklılık (stamina) değerine göre sakatlık riski olasılığını hesaplar.
 *
 * @param stamina - Oyuncunun dayanıklılık değeri (0-100)
 * @returns Sakatlık olasılığı (0-1 arası)
 *
 * - stamina >= 60 → %0 risk (sakatlık yok)
 * - stamina 50-59 → %10 risk
 * - stamina 40-49 → %30 risk
 * - stamina < 40 → %60 risk
 */
export function calculateInjuryRisk(stamina: number): number {
  try {
    const s = Math.max(0, Math.min(100, stamina));

    if (s >= 60) return 0;
    if (s >= 50) return 0.10;  // 10%
    if (s >= 40) return 0.30;  // 30%
    return 0.60;               // 60%
  } catch {
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════
// Sakatlık Üretimi
// ═══════════════════════════════════════════════════════════════

export type InjurySeverity = 'light' | 'medium' | 'heavy';

export interface InjuryResult {
  severity: InjurySeverity;
  days: number;
}

/** Ağırlıklar: %50 hafif, %35 orta, %15 ağır */
const SEVERITY_WEIGHTS: { severity: InjurySeverity; weight: number; minDays: number; maxDays: number }[] = [
  { severity: 'light',  weight: 0.50, minDays: 1,  maxDays: 3 },
  { severity: 'medium', weight: 0.35, minDays: 4,  maxDays: 10 },
  { severity: 'heavy',  weight: 0.15, minDays: 11, maxDays: 30 },
];

/**
 * Rastgele bir sakatlık üretir.
 *
 * @returns { severity, days } — Sakatlık şiddeti ve süre (gün)
 *
 * Dağılım:
 * - Hafif (%50): 1-3 gün
 * - Orta (%35): 4-10 gün
 * - Ağır (%15): 11-30 gün
 */
export function generateInjury(): InjuryResult {
  try {
    const roll = Math.random();

    let cumulative = 0;
    for (const entry of SEVERITY_WEIGHTS) {
      cumulative += entry.weight;
      if (roll < cumulative) {
        const days = Math.floor(Math.random() * (entry.maxDays - entry.minDays + 1)) + entry.minDays;
        return { severity: entry.severity, days };
      }
    }

    // Fallback — hafif sakatlık
    return { severity: 'light', days: Math.floor(Math.random() * 3) + 1 };
  } catch {
    return { severity: 'light', days: 2 };
  }
}

// ═══════════════════════════════════════════════════════════════
// Fizyoterapist İyileştirme Hesaplama
// ═══════════════════════════════════════════════════════════════

/**
 * Yıldız seviyesine göre gün kısaltma tablosu
 */
const STAR_HEALING_MAP: Record<number, number> = {
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
};

/**
 * Fizyoterapist kadrosunun toplam iyileştirme gücünü hesaplar.
 *
 * Her fizyoterapistin yıldız seviyesi sakatlık süresinden düşülecek gün sayısını belirler:
 * - 1 yıldız = 2 gün kısaltma
 * - 2 yıldız = 4 gün kısaltma
 * - 3 yıldız = 8 gün kısaltma
 * - 4 yıldız = 12 gün kısaltma
 * - 5 yıldız = 16 gün kısaltma
 *
 * @param physioStars - Fizyoterapistlerin yıldız seviyeleri dizisi (ör: [2, 3, 5])
 * @returns Toplam iyileştirme gücü (düşülecek gün sayısı)
 */
export function calculatePhysioHealing(physioStars: number[]): number {
  try {
    if (!physioStars || physioStars.length === 0) return 0;

    let totalHealing = 0;
    for (const stars of physioStars) {
      const clampedStars = Math.max(1, Math.min(5, Math.round(stars)));
      totalHealing += STAR_HEALING_MAP[clampedStars] || 0;
    }

    return totalHealing;
  } catch {
    return 0;
  }
}

/**
 * Sakatlık bitiş tarihinden iyileştirme gün sayısını düşer ve yeni tarihi hesaplar.
 *
 * @param injuryEndDate - Sakatlık bitiş tarihi (ISO string)
 * @param healingDays - Düşülecek gün sayısı
 * @returns Yeni sakatlık bitiş tarihi (ISO string) veya null (sakatlık bittiyse)
 */
export function applyHealingToDate(injuryEndDate: string, healingDays: number): string | null {
  try {
    const endDate = new Date(injuryEndDate);
    const newEndMs = endDate.getTime() - healingDays * 24 * 60 * 60 * 1000;
    const now = new Date();

    // Yeni bitiş tarihi geçmişse sakatlık sona erdi
    if (newEndMs <= now.getTime()) {
      return null;
    }

    return new Date(newEndMs).toISOString();
  } catch {
    return injuryEndDate;
  }
}
