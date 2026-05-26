/**
 * Match Helpers — Geri sayım hesaplama ve event stil yardımcıları
 */

import { CountdownResult, MatchEventRow } from './matchTypes';

export function calculateCountdown(targetDate: string, targetTime: string): CountdownResult {
  try {
    const dateStr = targetTime ? `${targetDate}T${targetTime}:00` : `${targetDate}T18:00:00`;
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      isPast: false,
    };
  } catch {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
}

export function getEventStyle(eventType: string): { icon: string; colorClass: string; label: string } {
  switch (eventType) {
    case 'goal':
    case 'GOAL':
      return { icon: '⚽', colorClass: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-200', label: 'GOL' };
    case 'penalty_goal':
      return { icon: '⚽', colorClass: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-200', label: 'PENALTI GOLU' };
    case 'own_goal':
      return { icon: '⚽', colorClass: 'bg-red-500/15 border-red-500/30 text-red-200', label: 'KENDİ KALESİNE' };
    case 'yellow_card':
    case 'YELLOW':
      return { icon: '🟨', colorClass: 'bg-yellow-600/10 border-yellow-600/20 text-yellow-300', label: 'SARI KART' };
    case 'red_card':
    case 'RED':
      return { icon: '🟥', colorClass: 'bg-red-600/15 border-red-600/30 text-red-200', label: 'KIRMIZI KART' };
    case 'second_yellow':
      return { icon: '🟥', colorClass: 'bg-orange-500/15 border-orange-500/30 text-orange-200', label: '2. SARI → KIRMIZI' };
    case 'injury':
      return { icon: '🏥', colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-200', label: 'SAKATLIK' };
    case 'substitution':
    case 'SUB':
      return { icon: '🔄', colorClass: 'bg-green-500/10 border-green-500/20 text-green-200', label: 'DEĞİŞİKLİK' };
    case 'penalty_miss':
      return { icon: '❌', colorClass: 'bg-red-500/10 border-red-500/20 text-red-200', label: 'KAÇAN PENALTI' };
    case 'whistle':
    case 'HALF_TIME':
      return { icon: '📯', colorClass: 'bg-white/5 border-white/10 text-white/50', label: 'DEVRE ARASI' };
    case 'FULL_TIME':
      return { icon: '🏁', colorClass: 'bg-white/5 border-white/10 text-white/50', label: 'MAÇ SONU' };
    case 'kickoff':
      return { icon: '🏟️', colorClass: 'bg-white/5 border-white/10 text-white/50', label: 'MAÇ BAŞLADI' };
    default:
      return { icon: '📌', colorClass: 'bg-white/5 border-white/10 text-white/40', label: eventType };
  }
}
