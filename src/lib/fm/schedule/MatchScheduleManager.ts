/**
 * MatchScheduleManager — Merkezi Maç Takvimi Yöneticisi
 *
 * Tüm maç zamanlama kurallarını tek bir yerden yönetir.
 * Cron job'lar ve fixture üreticileri bu servisi kullanır.
 *
 * TAKVİM KURALLARI:
 * ─────────────────
 * Pazartesi - Perşembe:  12:00 Lig maçı, 18:00 Lig maçı
 * Cuma:                 Lig maçı YOK (lig ara verisi başlar)
 * Cumartesi:            Sadece Kupa maçları
 * Pazar:                Sadece Kupa maçları
 *
 * Tüm saatler İstanbul (UTC+3) saat dilimindedir.
 * Cron schedule'lar UTC olarak ifade edilir:
 *   12:00 İstanbul = 09:00 UTC
 *   18:00 İstanbul = 15:00 UTC
 */

// ═══════════════════════════════════════════════════
// TÜRLER VE ARAYÜZLER
// ═══════════════════════════════════════════════════

/** Haftanın günleri (0=Pazar, 1=Pazartesi, ..., 6=Cumartesi) */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Maç tipi: lig, kupa veya hazırlık */
export type MatchCompetitionType = 'league' | 'cup' | 'friendly';

/** Bir maç slotunun tam tanımı */
export interface MatchSlot {
  /** Gün adı (Türkçe) */
  dayName: string;
  /** Haftanın günü (0-6, JS Date.getDay() uyumlu) */
  dayOfWeek: DayOfWeek;
  /** İstanbul saati (SS:DD formatı) */
  timeIstanbul: string;
  /** UTC saati (SS:DD formatı, cron schedule için) */
  timeUTC: string;
  /** Bu slotta oynanacak maç tipi */
  competitionType: MatchCompetitionType;
  /** Bu slot aktif mi? (ör: Cuma 18:00 lig kapalı) */
  isActive: boolean;
}

/** Günlük maç programı */
export interface DaySchedule {
  dayName: string;
  dayOfWeek: DayOfWeek;
  slots: MatchSlot[];
  /** Bu gün lig maçı var mı? */
  hasLeague: boolean;
  /** Bu gün kupa maçı var mı? */
  hasCup: boolean;
}

/** Haftalık tam maç programı */
export interface WeekSchedule {
  days: DaySchedule[];
  /** Haftada toplam lig maçı slot sayısı */
  totalLeagueSlots: number;
  /** Haftada toplam kupa maçı slot sayısı */
  totalCupSlots: number;
}

/** Cron schedule tanımı */
export interface CronScheduleConfig {
  /** Cron endpoint yolu (ör: /api/cron/match-scheduler) */
  path: string;
  /** Cron expression (UTC) */
  schedule: string;
  /** Açıklama */
  description: string;
  /** Vercel function maxDuration */
  maxDuration: number;
}

// ═══════════════════════════════════════════════════
// SABİTLER
// ═══════════════════════════════════════════════════

/** İstanbul saat dilimi ofseti (saat cinsinden) */
const ISTANBUL_OFFSET_HOURS = 3;

/** Lig maç saatleri (İstanbul) */
const LEAGUE_TIMES_IST = ['12:00', '18:00'] as const;

/** Kupa maç saatleri (İstanbul) */
const CUP_TIMES_IST = ['18:00'] as const;

/** Türkçe gün adları */
const DAY_NAMES_TR: Record<number, string> = {
  0: 'Pazar',
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
};

/**
 * Hangi gün hangi maç tipi oynanır?
 * Pzt(1)-Per(4): Lig | Cum(5): Yok | Cmt(6)-Paz(0): Kupa
 */
const DAY_COMPETITION_MAP: Record<number, MatchCompetitionType | null> = {
  0: 'cup',    // Pazar → Kupa
  1: 'league', // Pazartesi → Lig
  2: 'league', // Salı → Lig
  3: 'league', // Çarşamba → Lig
  4: 'league', // Perşembe → Lig
  5: 'playoff', // Cuma → Playoff maçı (20:00 İstanbul)
  6: 'cup',    // Cumartesi → Kupa
};

// ═══════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════

/**
 * İstanbul saatini UTC'ye çevirir.
 * @param istTime İstanbul saati (SS:DD formatı)
 * @returns UTC saati (SS:DD formatı)
 */
export function istanbulToUTC(istTime: string): string {
  const [hours, minutes] = istTime.split(':').map(Number);
  const utcHours = (hours - ISTANBUL_OFFSET_HOURS + 24) % 24;
  return `${String(utcHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * UTC saatini İstanbul saatine çevirir.
 * @param utcTime UTC saati (SS:DD formatı)
 * @returns İstanbul saati (SS:DD formatı)
 */
export function utcToIstanbul(utcTime: string): string {
  const [hours, minutes] = utcTime.split(':').map(Number);
  const istHours = (hours + ISTANBUL_OFFSET_HOURS) % 24;
  return `${String(istHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Bir Date objesinden İstanbul saat diliminde gün ve saat bilgisi çıkarır.
 */
export function getIstanbulDateTime(date: Date): {
  dayOfWeek: DayOfWeek;
  hour: number;
  minute: number;
  timeStr: string;
  dateStr: string;
  date: Date; // İstanbul saatinde Date objesi (karşılaştırma için)
} {
  // İstanbul saat diliminde tarih/saat hesapla
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
  const dayOfWeek = istDate.getDay() as DayOfWeek;
  const hour = istDate.getHours();
  const minute = istDate.getMinutes();
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const dateStr = istDate.toISOString().split('T')[0];

  return { dayOfWeek, hour, minute, timeStr, dateStr, date: istDate };
}

// ═══════════════════════════════════════════════════
// ANA SİNKRONİZASYON SORGULARI
// ═══════════════════════════════════════════════════

/**
 * Verilen günde lig maçı oynanmalı mı?
 *
 * KURAL: Sadece Pazartesi-Perşembe arası lig maçı oynanır.
 * Cuma, Cumartesi ve Pazar lig maçı yoktur.
 */
export function shouldPlayLeague(dayOfWeek: number): boolean {
  // Pazartesi(1) - Perşembe(4) arası lig maçı
  return dayOfWeek >= 1 && dayOfWeek <= 4;
}

/**
 * Verilen günde kupa maçı oynanmalı mı?
 *
 * KURAL: Sadece Cumartesi ve Pazar kupa maçı oynanır.
 */
export function shouldPlayCup(dayOfWeek: number): boolean {
  return dayOfWeek === 0 || dayOfWeek === 6; // Pazar veya Cumartesi
}

/**
 * Verilen günde playoff maçı oynanmalı mı?
 *
 * KURAL: Sadece Cuma playoff maçı oynanır.
 */
export function shouldPlayPlayoff(dayOfWeek: number): boolean {
  return dayOfWeek === 5; // Cuma
}

/**
 * Verilen tarih/saatte lig maçı saati mi?
 *
 * Lig saatleri: 12:00 ve 18:00 İstanbul
 * Lig günleri: Pazartesi-Perşembe
 */
export function isLeagueMatchTime(date: Date): boolean {
  const { dayOfWeek, hour } = getIstanbulDateTime(date);
  if (!shouldPlayLeague(dayOfWeek)) return false;
  return hour === 12 || hour === 18;
}

/**
 * Verilen tarih/saatte kupa maçı saati mi?
 *
 * Kupa saatleri: 18:00 İstanbul
 * Kupa günleri: Cumartesi ve Pazar
 */
export function isCupMatchTime(date: Date): boolean {
  const { dayOfWeek, hour } = getIstanbulDateTime(date);
  if (!shouldPlayCup(dayOfWeek)) return false;
  return hour === 18;
}

/**
 * Şu an lig ara verisi içinde miyiz?
 *
 * Lig ara verisi: Cuma 18:00'den Pazartesi 12:00'e kadar
 */
export function isLeagueBreak(date: Date): boolean {
  const { dayOfWeek, hour } = getIstanbulDateTime(date);

  // Cuma 18:00 sonrası
  if (dayOfWeek === 5 && hour >= 18) return true;
  // Cumartesi tüm gün
  if (dayOfWeek === 6) return true;
  // Pazar tüm gün
  if (dayOfWeek === 0) return true;
  // Pazartesi 12:00 öncesi
  if (dayOfWeek === 1 && hour < 12) return true;

  return false;
}

/**
 * Verilen bir tarih için oynanacak maç tipini döndürür.
 */
export function getMatchTypeForDate(date: Date): MatchCompetitionType | null {
  const { dayOfWeek } = getIstanbulDateTime(date);

  if (shouldPlayLeague(dayOfWeek)) return 'league';
  if (shouldPlayCup(dayOfWeek)) return 'cup';

  return null; // Cuma → maç yok
}

/**
 * Verilen gün için maç saatlerini döndürür (İstanbul saati).
 */
export function getMatchTimesForDay(dayOfWeek: number, competitionType: MatchCompetitionType): string[] {
  if (competitionType === 'league' && shouldPlayLeague(dayOfWeek)) {
    return [...LEAGUE_TIMES_IST];
  }
  if (competitionType === 'cup' && shouldPlayCup(dayOfWeek)) {
    return [...CUP_TIMES_IST];
  }
  return [];
}

// ═══════════════════════════════════════════════════
// HAFTALIK PROGRAM OLUŞTURUCU
// ═══════════════════════════════════════════════════

/**
 * Tam haftalık maç programını oluşturur.
 *
 * Her gün için hangi saatlerde hangi tür maçlar oynanacağını
 * detaylı olarak döndürür. Fikstür üreticileri ve UI bu
 * fonksiyonu kullanabilir.
 */
export function generateWeekSchedule(): WeekSchedule {
  const days: DaySchedule[] = [];
  let totalLeagueSlots = 0;
  let totalCupSlots = 0;

  // Pazartesi(1) - Pazar(0) sıralamasıyla oluştur
  const dayOrder: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

  for (const dow of dayOrder) {
    const compType = DAY_COMPETITION_MAP[dow];
    const dayName = DAY_NAMES_TR[dow];
    const slots: MatchSlot[] = [];

    if (compType === 'league') {
      // Lig maçları: 12:00 ve 18:00 İstanbul
      for (const time of LEAGUE_TIMES_IST) {
        const slot: MatchSlot = {
          dayName,
          dayOfWeek: dow,
          timeIstanbul: time,
          timeUTC: istanbulToUTC(time),
          competitionType: 'league',
          isActive: true,
        };
        slots.push(slot);
        totalLeagueSlots++;
      }
    } else if (compType === 'cup') {
      // Kupa maçları: 18:00 İstanbul
      for (const time of CUP_TIMES_IST) {
        const slot: MatchSlot = {
          dayName,
          dayOfWeek: dow,
          timeIstanbul: time,
          timeUTC: istanbulToUTC(time),
          competitionType: 'cup',
          isActive: true,
        };
        slots.push(slot);
        totalCupSlots++;
      }
    } else if (compType === 'playoff') {
      // Playoff maçları: 20:00 İstanbul (Cuma)
      const playoffTime = '20:00';
      const slot: MatchSlot = {
        dayName,
        dayOfWeek: dow,
        timeIstanbul: playoffTime,
        timeUTC: istanbulToUTC(playoffTime),
        competitionType: 'cup', // uses cup type for scheduling purposes
        isActive: true,
      };
      slots.push(slot);
      totalCupSlots++;
    }

    days.push({
      dayName,
      dayOfWeek: dow,
      slots,
      hasLeague: compType === 'league',
      hasCup: compType === 'cup' || compType === 'playoff',
    });
  }

  return { days, totalLeagueSlots, totalCupSlots };
}

// ═══════════════════════════════════════════════════
// CRON SCHEDULE YAPILANDIRMASI
// ═══════════════════════════════════════════════════

/**
 * Yeni maç takvimine uygun cron schedule yapılandırmasını döndürür.
 *
 * Vercel Cron formatında (UTC):
 * - match-scheduler: Pzt-Per 09:00,15:00 UTC (12:00,18:00 İstanbul) + Cmt-Paz 15:00 UTC (18:00 İstanbul kupa)
 * - match-simulator: Aynı saatlerde bot maçları için
 * - match-tick: Pzt-Paz 07:00-20:00 arası 2 dk'da bir (canlı maç varsa ilerletir)
 * - match-reminder: Maçlardan 10 dk önce
 */
export function generateCronSchedules(): CronScheduleConfig[] {
  return [
    {
      path: '/api/cron/match-scheduler',
      schedule: '0 9,15 * * 1-4',    // Pzt-Per 12:00 ve 18:00 İstanbul (lig)
      description: 'Lig maçlarını canlıya al (Pzt-Per 12:00/18:00 İstanbul)',
      maxDuration: 60,
    },
    {
      path: '/api/cron/match-scheduler-cup',
      schedule: '0 15 * * 0,6',       // Cmt-Paz 18:00 İstanbul (kupa)
      description: 'Kupa maçlarını canlıya al (Cmt-Paz 18:00 İstanbul)',
      maxDuration: 60,
    },
    {
      path: '/api/cron/match-scheduler-playoff',
      schedule: '0 20 * * 5',         // Cuma 20:00 UTC (23:00 İstanbul — playoff yarı final)
      description: 'Playoff maçlarını canlıya al (Cuma 23:00 İstanbul)',
      maxDuration: 60,
    },
    {
      path: '/api/cron/match-simulator',
      schedule: '0 9,15 * * 1-4',    // Pzt-Per 12:00 ve 18:00 İstanbul (lig bot maçları)
      description: 'Bot lig maçlarını kuyruğa ekle (Pzt-Per 12:00/18:00 İstanbul)',
      maxDuration: 60,
    },
    {
      path: '/api/cron/match-tick',
      schedule: '*/2 7-20 * * 0-6',   // Her gün (lig + kupa maçları için)
      description: 'Canlı maçları ilerlet (2 dk aralıkla)',
      maxDuration: 60,
    },
    {
      path: '/api/cron/process-match-queue',
      schedule: '*/5 8-18 * * 1-4',   // Pzt-Per bot maç kuyruğu
      description: 'Bot maç kuyruğunu işle (Pzt-Per)',
      maxDuration: 60,
    },
    {
      path: '/api/cron/match-reminder',
      schedule: '50 8,14 * * 1-4',    // Pzt-Per 11:50 ve 17:50 İstanbul (10 dk önce)
      description: 'Lig maç hatırlatma (10 dk önce, Pzt-Per)',
      maxDuration: 60,
    },
    {
      path: '/api/cron/match-reminder-cup',
      schedule: '50 14 * * 0,6',      // Cmt-Paz 17:50 İstanbul (10 dk önce)
      description: 'Kupa maç hatırlatma (10 dk önce, Cmt-Paz)',
      maxDuration: 60,
    },
    {
      path: '/api/cron/weekly-income',
      schedule: '0 6 * * 1',          // Pazartesi 09:00 İstanbul
      description: 'Haftalık gelir dağıtımı',
      maxDuration: 60,
    },
    {
      path: '/api/cron/bot-actions',
      schedule: '0 7 * * 1-4',        // Pzt-Per 10:00 İstanbul
      description: 'Bot AI eylemleri (Pzt-Per)',
      maxDuration: 60,
    },
    {
      path: '/api/cron/update-player-values',
      schedule: '0 2 * * 1',          // Pazartesi 05:00 İstanbul
      description: 'Oyuncu değer güncelleme',
      maxDuration: 60,
    },
    {
      path: '/api/cron/update-form-ratings',
      schedule: '0 3 * * *',          // Her gün 06:00 İstanbul
      description: 'Form rating güncelleme',
      maxDuration: 60,
    },
    {
      path: '/api/cron/youth-training',
      schedule: '0 4 * * 1',          // Pazartesi 07:00 İstanbul
      description: 'Gençlik antrenmanı',
      maxDuration: 60,
    },
    {
      path: '/api/cron/check-academy-upgrades',
      schedule: '0 * * * *',          // Her saat
      description: 'Akademi yükseltme kontrolü',
      maxDuration: 60,
    },
    {
      path: '/api/cron/season-end',
      schedule: '0 21 * * 2',         // Salı 00:00 İstanbul (sezon sonu)
      description: 'Sezon sonu işlemleri',
      maxDuration: 60,
    },
    {
      path: '/api/cron/apply-training',
      schedule: '5 12,18 * * 1-5',    // Pzt-Cum 15:05 ve 21:05 İstanbul
      description: 'Antrenman uygulama (Pzt-Cum 12:05/18:05 UTC)',
      maxDuration: 60,
    },
    {
      path: '/api/cron/weekly-evolution',
      schedule: '55 23 * * 0',        // Pazar 02:55 İstanbul
      description: 'Haftalık evrim',
      maxDuration: 60,
    },
    {
      path: '/api/cron/auction-cleanup',
      schedule: '*/30 * * * *',       // Her 30 dk
      description: 'Açık artırma temizleme',
      maxDuration: 60,
    },
    {
      path: '/api/cron/weekly-fans',
      schedule: '0 7 * * 1',          // Pazartesi 10:00 İstanbul
      description: 'Haftalık fan güncelleme',
      maxDuration: 60,
    },
  ];
}

// ═══════════════════════════════════════════════════
// FİKSTÜR TARİH HESAPLAMA
// ═══════════════════════════════════════════════════

/**
 * Verilen tur ve maç indeksine göre fikstür tarih/saat hesaplar.
 *
 * Lig maçları:
 *   Her tur 2 gune yayılır (Pzt 12:00 + 18:00, Salı 12:00 + 18:00, vb.)
 *   18 takım x 9 maç/tur = her turda 9 maç
 *   9 maç / 2 slot/gün = ~5 gün/tur
 *
 * Kupa maçları:
 *   Cumartesi veya Pazar 18:00
 *
 * @param tur Hafta/tur numarası (1-34)
 * @param matchIndex Maç sırası (0-based, turdaki maç sırası)
 * @param competitionType Maç tipi
 * @param seasonStartDate Sezon başlangıç tarihi
 * @returns Fikstür için tarih ve saat bilgisi
 */
export function computeFixtureDateTime(
  tur: number,
  matchIndex: number,
  competitionType: MatchCompetitionType,
  seasonStartDate: Date
): { matchDate: string; matchTime: string; dayOfWeek: number } {
  if (competitionType === 'league') {
    // Lig: Pzt-Per, günde 2 slot (12:00 ve 18:00)
    // Her turda 9 maç (18 takım / 2), 2 slot/gün = 5 güne yayılır
    const SLOTS_PER_DAY = 2;
    const dayOffset = Math.floor(matchIndex / SLOTS_PER_DAY);
    const slotInDay = matchIndex % SLOTS_PER_DAY;

    // Tur başlangıç gününü hesapla (her tur ~5 iş günü)
    const WORK_DAYS_PER_TUR = 5;
    const turStartDay = (tur - 1) * WORK_DAYS_PER_TUR;

    // Haftanın hangi gününe denk gelir? (1=Pzt, 4=Per)
    const absoluteDay = turStartDay + dayOffset;
    const weekDay = (absoluteDay % 4); // 0-3 → Pzt-Per
    const jsDay = weekDay + 1; // JS: 1=Pzt, 4=Per

    // Fikstür tarihini hesapla
    const fixtureDate = new Date(seasonStartDate);
    // İlk Pazartesi'yi bul
    const startDay = seasonStartDate.getDay();
    const daysToMonday = startDay === 1 ? 0 : (8 - startDay) % 7;
    fixtureDate.setDate(fixtureDate.getDate() + daysToMonday + absoluteDay);

    const matchTime = slotInDay === 0 ? '12:00' : '18:00';

    return {
      matchDate: fixtureDate.toISOString().split('T')[0],
      matchTime,
      dayOfWeek: jsDay as DayOfWeek,
    };
  }

  if (competitionType === 'cup') {
    // Kupa: Cmt veya Pazar 18:00
    const fixtureDate = new Date(seasonStartDate);
    // İlk Cumartesi'yi bul
    const startDay = seasonStartDate.getDay();
    const daysToSaturday = startDay === 6 ? 0 : (6 - startDay + 7) % 7;
    // Her kupa turü 1 hafta ara ile
    fixtureDate.setDate(fixtureDate.getDate() + daysToSaturday + (tur - 1) * 7);

    // Çift turlar: Cmt, tek turlar: Pazar
    const cupDay = tur % 2 === 0 ? 6 : 0;
    if (fixtureDate.getDay() !== cupDay) {
      const diff = (cupDay - fixtureDate.getDay() + 7) % 7;
      fixtureDate.setDate(fixtureDate.getDate() + diff);
    }

    return {
      matchDate: fixtureDate.toISOString().split('T')[0],
      matchTime: '18:00',
      dayOfWeek: cupDay as DayOfWeek,
    };
  }

  // Hazırlık maçları: hafta içi 15:00
  const fixtureDate = new Date(seasonStartDate);
  return {
    matchDate: fixtureDate.toISOString().split('T')[0],
    matchTime: '15:00',
    dayOfWeek: fixtureDate.getDay() as DayOfWeek,
  };
}

/**
 * Bir fikstür tarihinin maç takvim kurallarına uygun olup olmadığını kontrol eder.
 * Uygun değilse, en yakın uygun tarihi önerir.
 */
export function validateFixtureDate(
  matchDate: string,
  matchTime: string,
  competitionType: MatchCompetitionType
): { valid: boolean; reason?: string; suggestedDate?: string; suggestedTime?: string } {
  const date = new Date(matchDate + 'T00:00:00');
  const dayOfWeek = date.getDay();

  if (competitionType === 'league') {
    // Lig maçı Pazartesi-Perşembe arasında olmalı
    if (dayOfWeek < 1 || dayOfWeek > 4) {
      // En yakın Pazartesi'yi bul
      const daysToMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
      const suggested = new Date(date);
      suggested.setDate(suggested.getDate() + (daysToMonday || 7));
      return {
        valid: false,
        reason: `Lig maçı ${DAY_NAMES_TR[dayOfWeek]} günü oynanamaz. Pzt-Per arası olmalı.`,
        suggestedDate: suggested.toISOString().split('T')[0],
        suggestedTime: matchTime || '12:00',
      };
    }

    // Lig saati 12:00 veya 18:00 olmalı
    if (matchTime !== '12:00' && matchTime !== '18:00') {
      return {
        valid: false,
        reason: `Lig maçı saati ${matchTime} geçerli değil. 12:00 veya 18:00 olmalı.`,
        suggestedDate: matchDate,
        suggestedTime: '12:00',
      };
    }

    return { valid: true };
  }

  if (competitionType === 'cup') {
    // Kupa maçı Cumartesi veya Pazar olmalı
    if (dayOfWeek !== 6 && dayOfWeek !== 0) {
      // En yakın Cumartesi'yi bul
      const daysToSaturday = (6 - dayOfWeek + 7) % 7;
      const suggested = new Date(date);
      suggested.setDate(suggested.getDate() + (daysToSaturday || 7));
      return {
        valid: false,
        reason: `Kupa maçı ${DAY_NAMES_TR[dayOfWeek]} günü oynanamaz. Cmt veya Pazar olmalı.`,
        suggestedDate: suggested.toISOString().split('T')[0],
        suggestedTime: '18:00',
      };
    }

    // Kupa saati 18:00 olmalı
    if (matchTime !== '18:00') {
      return {
        valid: false,
        reason: `Kupa maçı saati ${matchTime} geçerli değil. 18:00 olmalı.`,
        suggestedDate: matchDate,
        suggestedTime: '18:00',
      };
    }

    return { valid: true };
  }

  return { valid: true };
}

// ═══════════════════════════════════════════════════
// DEBUG & LOGGING
// ═══════════════════════════════════════════════════

/**
 * Haftalık programı okunabilir formatta döndürür (debugging için).
 */
export function printWeekSchedule(): string {
  const schedule = generateWeekSchedule();
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════');
  lines.push('  HAFTALIK MAÇ TAKVİMİ (İstanbul Saati)');
  lines.push('═══════════════════════════════════════');

  for (const day of schedule.days) {
    const slotStr = day.slots.length > 0
      ? day.slots.map(s => `${s.timeIstanbul} ${s.competitionType === 'league' ? '⚽ Lig' : '🏆 Kupa'}`).join(' | ')
      : '🚫 Maç Yok';
    lines.push(`  ${day.dayName.padEnd(12)} ${slotStr}`);
  }

  lines.push('───────────────────────────────────────');
  lines.push(`  Toplam lig slot: ${schedule.totalLeagueSlots} | Kupa slot: ${schedule.totalCupSlots}`);
  lines.push('═══════════════════════════════════════');

  return lines.join('\n');
}
