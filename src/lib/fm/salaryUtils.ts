/**
 * MAAŞ HESAPLAMA — TEK KAYNAK (Single Source of Truth)
 *
 * Oyuncu maaşı hesaplamasında tutarlılık sağlar.
 * Hem playerGenerator.ts (üretim) hem ContractOfferModal.tsx (talep)
 * bu modülü kullanır.
 *
 * Formül:
 *   Normal oyuncular:  rating × SALARY_MULTIPLIER_NORMAL (950)
 *   Serbest oyuncular: rating × SALARY_MULTIPLIER_FREE_AGENT (3500)
 *
 * Serbest oyuncular piyasa değerine yakın maaş ister çünkü
 * kulüpsüzlük riski ve kısa sözleşme tercih edilir.
 */

// ── Sabitler ──────────────────────────────────────────────────────

/** Normal kadro oyuncusu: rating × 950 (rating 80 → 76.000 €/hafta) */
export const SALARY_MULTIPLIER_NORMAL = 950;

/** Serbest oyuncu: rating × 900 (rating 80 → 72.000 €/hafta) — piyasa değerine uygun */
export const SALARY_MULTIPLIER_FREE_AGENT = 900;

// ── Ana Fonksiyon ────────────────────────────────────────────────

/**
 * Oyuncunun haftalık maaşını hesaplar.
 *
 * @param rating        Oyuncunun genel rating'i (0-99)
 * @param isFreeAgent   Serbest oyuncu mu? (daha yüksek maaş talep eder)
 * @returns Haftalık maaş (Euro)
 */
export function calculatePlayerSalary(rating: number, isFreeAgent?: boolean): number {
  const multiplier = isFreeAgent ? SALARY_MULTIPLIER_FREE_AGENT : SALARY_MULTIPLIER_NORMAL;
  return Math.floor(rating * multiplier);
}

// ── Sözleşme Teklif Aralığı ──────────────────────────────────────

export interface SalaryRange {
  minWeeklySalary: number;
  maxWeeklySalary: number;
}

/**
 * Sözleşme teklifi için maaş aralığını hesaplar.
 * Serbest oyuncular için min = calculatePlayerSalary(rating, true) baz alınır.
 * Normal transferler için min = calculatePlayerSalary(rating, false) baz alınır.
 *
 * @param rating        Oyuncunun genel rating'i
 * @param isFreeAgent   Serbest oyuncu mu?
 * @returns Maaş aralığı (haftalık Euro)
 */
export function calculateSalaryRange(rating: number, isFreeAgent?: boolean): SalaryRange {
  const baseSalary = calculatePlayerSalary(rating, isFreeAgent);
  // Max maaş = base × 1.8 (pazarlık payı)
  const maxWeeklySalary = Math.floor(baseSalary * 1.8);
  return {
    minWeeklySalary: baseSalary,
    maxWeeklySalary,
  };
}

// ── İmza Ücreti Hesaplama ────────────────────────────────────────

// ── Serbest Oyuncu Maaş Hesaplama (Piyasa Değeri Bazlı) ──────────

/**
 * Serbest oyuncunun haftalık maaşını piyasa değerine göre hesaplar.
 * Piyasa değerinin haftalık %2.5'i (yıllık yaklaşık 1.3 katı).
 * Eğer marketValue güvenilir değilse rating × 900 fallback kullanılır.
 *
 * @param marketValue  Oyuncunun piyasa değeri (EUR)
 * @param rating       Oyuncunun genel rating'i (fallback için)
 * @returns Haftalık maaş (Euro)
 */
export function calculateFreeAgentSalary(marketValue: number, rating?: number): number {
  if (marketValue > 0) {
    // Piyasa değerinin haftalık ~%2.5'ü (yıllık 1.3 kat spread)
    return Math.max(1000, Math.round(marketValue * 0.025 / 52));
  }
  // Fallback: rating bazlı
  return Math.floor((rating || 60) * SALARY_MULTIPLIER_FREE_AGENT);
}

export interface SigningFeeRange {
  minSigningFee: number;
  maxSigningFee: number;
}

/**
 * Sözleşme imza ücreti aralığını hesaplar (Kredi).
 * Rating'e göre kademeli artar.
 *
 * @param rating Oyuncunun genel rating'i
 * @returns İmza ücreti aralığı (Kredi)
 */
export function calculateSigningFeeRange(rating: number): SigningFeeRange {
  // Kademeli hesaplama — yüksek rating'li oyuncular daha çok ister
  const baseFee = Math.floor(rating * rating * 0.004); // rating 80 → 25 kredi
  const maxFee = Math.floor(baseFee * 2.0);
  return {
    minSigningFee: Math.max(1, baseFee),
    maxSigningFee: Math.max(2, maxFee),
  };
}

// ── Toplam Kadro Maaşı (Cron için) ──────────────────────────────

/**
 * Supabase'den çekilmiş oyuncu listesinin toplam maaşını hesaplar.
 * Cron job'da squad yüklendiğinde kullanılır.
 *
 * @param players Oyuncu dizisi (her birinde `salary` alanı olmalı)
 * @returns Toplam haftalık maaş (Euro)
 */
export function calculateTotalWages(players: { salary: number }[]): number {
  return players.reduce((sum, p) => sum + (p.salary || 0), 0);
}
