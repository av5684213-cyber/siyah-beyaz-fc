// ── Player Demands (Single Source of Truth) ──────────────────────────
// Bu dosya hem client hem server tarafında kullanılır.
// ContractOfferModal.tsx ve api/contract-offer/route.ts buradan import eder.
//
// Maaş hesaplama artık salaryUtils.ts üzerinden yapılır.
// Bu dosya geriye dönük uyumluluk için korunur.

import { calculateSalaryRange, calculateSigningFeeRange } from './salaryUtils';
import type { SalaryRange, SigningFeeRange } from './salaryUtils';

export type { SalaryRange as PlayerDemandsSalaryRange, SigningFeeRange as PlayerDemandsSigningFeeRange };

export interface PlayerDemands {
  minWeeklySalary: number;
  maxWeeklySalary: number;
  minSigningFee: number;
  maxSigningFee: number;
}

/**
 * Oyuncunun sözleşme taleplerini hesaplar.
 * Maaş aralığı salaryUtils.ts'ten, imza ücreti de oradan gelir.
 *
 * @param rating      Oyuncunun genel rating'i
 * @param isFreeAgent Serbest oyuncu mu? (daha yüksek talep)
 */
export function generatePlayerDemands(rating: number, isFreeAgent?: boolean): PlayerDemands {
  const salary = calculateSalaryRange(rating, isFreeAgent);
  const fee = calculateSigningFeeRange(rating);

  return {
    minWeeklySalary: salary.minWeeklySalary,
    maxWeeklySalary: salary.maxWeeklySalary,
    minSigningFee: fee.minSigningFee,
    maxSigningFee: fee.maxSigningFee,
  };
}
