/**
 * MAÇ TAKVİMİ — Merkezi Zamanlama Modülü
 *
 * Bu dosya, MatchScheduleManager'dan re-export yapar.
 * Tüm takvim kuralları tek bir kaynakta tanımlıdır:
 * → src/lib/fm/schedule/MatchScheduleManager.ts
 *
 * Mevcut import'ları bozmamak için burada re-export sağlanır.
 * Yeni kod doğrudan MatchScheduleManager'dan import etmelidir.
 *
 * TAKVİM KURALLARI:
 * ─────────────────
 * Pazartesi - Perşembe:  12:00 Lig maçı, 18:00 Lig maçı
 * Cuma:                  Lig maçı YOK (dinlenme günü)
 * Cumartesi:             Sadece Kupa maçları (18:00)
 * Pazar:                 Sadece Kupa maçları (18:00)
 *
 * Tüm saatler İstanbul (UTC+3) saat dilimindedir.
 */

// ═══════════════════════════════════════════════════
// TEK KAYNAK: MatchScheduleManager
// ═══════════════════════════════════════════════════
export {
  // Türler
  type DayOfWeek,
  type MatchCompetitionType,
  type MatchSlot,
  type DaySchedule,
  type WeekSchedule,
  type CronScheduleConfig,

  // Zaman yardımcıları
  istanbulToUTC,
  utcToIstanbul,
  getIstanbulDateTime,

  // Gün kontrolleri
  shouldPlayLeague,
  shouldPlayCup,
  isLeagueMatchTime,
  isCupMatchTime,
  isLeagueBreak,

  // Maç tipi ve saat
  getMatchTypeForDate,
  getMatchTimesForDay,

  // Haftalık program
  generateWeekSchedule,

  // Cron yapılandırması
  generateCronSchedules,

  // Fikstür hesaplama
  computeFixtureDateTime,
  validateFixtureDate,

  // Debug
  printWeekSchedule,
} from './schedule/MatchScheduleManager';

// ═══════════════════════════════════════════════════
// GERİYE DÖNÜK UYUMLULUK: Eski API arayüzü
// ═══════════════════════════════════════════════════

import {
  getIstanbulDateTime,
  shouldPlayLeague,
  shouldPlayCup,
} from './schedule/MatchScheduleManager';

/** Eski API uyumluluğu: ScheduleType */
export type ScheduleType = 'MATCH' | 'TRAINING';

/** Eski API uyumluluğu: CompetitionType */
export type CompetitionType = 'league' | 'cup' | 'friendly';

/** Eski API uyumluluğu: ScheduleEvent */
export interface ScheduleEvent {
  dayOfWeek: number;
  hour: number;
  type: ScheduleType;
  competitionType?: CompetitionType;
}

/**
 * Eski API uyumluluğu: Verilen Date'den İstanbul gün bilgisini çıkarır.
 */
export const getDayFromDate = (date: Date): number => {
  return getIstanbulDateTime(date).dayOfWeek;
};

/**
 * Eski API uyumluluğu: Verilen Date'den İstanbul saat bilgisini çıkarır.
 */
export const getHourFromDate = (date: Date): number => {
  return getIstanbulDateTime(date).hour;
};

/**
 * Eski API uyumluluğu: Verilen Date'den İstanbul dakika bilgisini çıkarır.
 */
export const getMinuteFromDate = (date: Date): number => {
  return getIstanbulDateTime(date).minute;
};

/**
 * Eski API uyumluluğu: Lig maç günü mü?
 */
export const isMatchDay = (date: Date, competitionType: CompetitionType = 'league'): boolean => {
  const { dayOfWeek } = getIstanbulDateTime(date);
  if (competitionType === 'league') return shouldPlayLeague(dayOfWeek);
  if (competitionType === 'cup') return shouldPlayCup(dayOfWeek);
  return shouldPlayLeague(dayOfWeek);
};

/**
 * Eski API uyumluluğu: Maç saati mi?
 */
export const isMatchTime = (date: Date, competitionType: CompetitionType = 'league'): boolean => {
  if (!isMatchDay(date, competitionType)) return false;
  const { hour } = getIstanbulDateTime(date);
  if (competitionType === 'league') return hour === 12 || hour === 18;
  if (competitionType === 'cup') return hour === 18;
  if (competitionType === 'friendly') return hour === 15;
  return false;
};

/**
 * Eski API uyumluluğu: Antrenman saati mi?
 */
export const isTrainingTime = (date: Date): boolean => {
  const { dayOfWeek, hour } = getIstanbulDateTime(date);
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  return hour === 15 || hour === 21;
};

/**
 * Eski API uyumluluğu: Competition ikonu
 */
export function getCompetitionIcon(competitionType?: CompetitionType): string {
  switch (competitionType) {
    case 'cup': return '🏆';
    case 'friendly': return '🤝';
    case 'league':
    default: return '⚽';
  }
}

/**
 * Eski API uyumluluğu: Competition etiketi
 */
export function getCompetitionLabel(competitionType?: CompetitionType): string {
  switch (competitionType) {
    case 'cup': return 'Kupa Maçı';
    case 'friendly': return 'Hazırlık Maçı';
    case 'league':
    default: return 'Lig Maçı';
  }
}

/**
 * Eski API uyumluluğu: En yakın kupa maç günü
 */
export function nextCupMatchDate(from?: Date): Date {
  const d = from ? new Date(from) : new Date();
  const day = d.getDay();
  const diff = day === 6 ? 7 : ((6 - day + 7) % 7);
  d.setDate(d.getDate() + diff);
  d.setHours(18, 0, 0, 0);
  return d;
}

/**
 * Eski API uyumluluğu: En yakın lig maç günü
 */
export function nextLeagueMatchDate(from?: Date): Date {
  const d = from ? new Date(from) : new Date();
  const { dayOfWeek, hour } = getIstanbulDateTime(d);

  if (shouldPlayLeague(dayOfWeek) && hour < 12) {
    d.setHours(12, 0, 0, 0);
    return d;
  }

  const daysToMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
  d.setDate(d.getDate() + (daysToMonday || 7));
  d.setHours(12, 0, 0, 0);
  return d;
}

/**
 * Eski API uyumluluğu: current_day → maç tarihi dönüşümü
 */
export function computeMatchDateFromDay(currentDay: number): string {
  const seasonStart = new Date(2025, 7, 1);
  const date = new Date(seasonStart);
  date.setDate(date.getDate() + (currentDay - 1) * 4);
  return date.toISOString().split('T')[0];
}
