/**
 * Transfer Penceresi Kontrolü
 *
 * DÜZELTME: Transfer penceresi her zaman açık.
 * Kullanıcı isteğiyle transfer her zaman açık olacak.
 * Orijinal hafta bazlı kısıtlama kaldırıldı.
 */

export function isTransferWindowOpen(_currentDay?: number | null): boolean {
  return true; // Transfer her zaman açık
}

export function transferWindowStatus(_currentDay?: number | null): {
  isOpen: boolean;
  label: string;
  nextOpenWeek?: number;
} {
  return { isOpen: true, label: 'Transfer penceresi açık' };
}
