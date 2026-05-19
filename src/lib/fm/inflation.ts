/**
 * inflation.ts — Sezon Bazlı Enflasyon Sistemi
 *
 * Oyun ekonomisi enflasyon değerleri:
 * - Her sezon %8 enflasyon (bütünleşik)
 * - Sezon 1: 1.00x (baz)
 * - Sezon 2: 1.08x
 * - Sezon 3: 1.17x
 * - Sezon 5: 1.36x
 * - Sezon 10: 1.85x
 *
 * Kullanım:
 *   const factor = getInflationFactor(currentDay);
 *   const adjustedValue = baseValue * factor;
 */

/** Sezon başına enflasyon oranı (%8) */
export const INFLATION_RATE_PER_SEASON = 0.08;

/** Bir sezondaki toplam gün sayısı (42 hafta × 7 gün) */
export const DAYS_PER_SEASON = 294;

/**
 * Mevcut gün sayısından sezon numarasını hesaplar.
 * @param currentDay — Profil'in current_day değeri (1-indexed)
 * @returns Sezon numarası (1-indexed)
 */
export function getCurrentSeason(currentDay: number): number {
  if (currentDay < 1) return 1;
  return Math.floor((currentDay - 1) / DAYS_PER_SEASON) + 1;
}

/**
 * Mevcut sezondaki gün sayısını döndürür (1-294 arası).
 * @param currentDay — Profil'in current_day değeri
 */
export function getDayInSeason(currentDay: number): number {
  if (currentDay < 1) return 1;
  return ((currentDay - 1) % DAYS_PER_SEASON) + 1;
}

/**
 * Enflasyon çarpanını hesaplar.
 *
 * Formül: (1 + INFLATION_RATE) ^ (season - 1)
 * Sezon geçişlerinde yumuşak geçiş için mevsim içi ilerleme de dahil edilir.
 *
 * @param currentDay — Profil'in current_day değeri
 * @returns Enflasyon çarpanı (ör: 1.00, 1.04, 1.08, 1.17...)
 */
export function getInflationFactor(currentDay: number): number {
  const season = getCurrentSeason(currentDay);
  const dayInSeason = getDayInSeason(currentDay);

  // Tam sezonlar için üstel enflasyon
  const fullSeasonFactor = Math.pow(1 + INFLATION_RATE_PER_SEASON, season - 1);

  // Mevsim içi oransal ilerleme (yumuşak geçiş)
  const seasonProgress = (dayInSeason - 1) / DAYS_PER_SEASON;
  const intraSeasonFactor = 1 + (INFLATION_RATE_PER_SEASON * seasonProgress);

  return fullSeasonFactor * intraSeasonFactor;
}

/**
 * Kiralama ücreti hesaplama (Euro cinsinden).
 *
 * Oyuncunun piyasa değerinin belirli bir yüzdesi, enflasyon çarpanı ile çarpılır.
 * Bu meblağ alıcıdan (kiralayan) satıcıya (oyuncu sahibi) transfer edilir.
 *
 * @param marketValue — Oyuncunun piyasa değeri (Euro)
 * @param currentDay — Mevcut oyun günü (enflasyon hesabı için)
 * @param loanPercentage — Piyasa değerinin yüzdesi (varsayılan: %15)
 * @returns Euro cinsinden kiralama ücreti
 */
export function calculateLoanFeeEuro(
  marketValue: number,
  currentDay: number,
  loanPercentage: number = 0.15
): number {
  const inflationFactor = getInflationFactor(currentDay);
  const rawFee = marketValue * loanPercentage * inflationFactor;

  // Minimum kiralama ücreti: 50.000 €
  // Maksimum kiralama ücreti: piyasa değerinin %40'ı (enflasyon dahil)
  const minFee = 50_000;
  const maxFee = marketValue * 0.40 * inflationFactor;

  return Math.max(minFee, Math.min(maxFee, Math.round(rawFee)));
}

/**
 * Enflasyon değerlerini açıklayan özet metin (UI için).
 */
export function getInflationSummary(currentDay: number): {
  season: number;
  dayInSeason: number;
  inflationFactor: number;
  inflationPercent: string;
} {
  const season = getCurrentSeason(currentDay);
  const dayInSeason = getDayInSeason(currentDay);
  const factor = getInflationFactor(currentDay);

  return {
    season,
    dayInSeason,
    inflationFactor: parseFloat(factor.toFixed(4)),
    inflationPercent: `${((factor - 1) * 100).toFixed(1)}%`,
  };
}
