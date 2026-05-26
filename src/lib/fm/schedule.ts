
export type ScheduleType = 'MATCH' | 'TRAINING';
export type CompetitionType = 'league' | 'cup' | 'friendly';

export interface ScheduleEvent {
  dayOfWeek: number; // 0 for Sunday, 1 for Monday, ..., 5 for Friday, 6 for Saturday
  hour: number;
  type: ScheduleType;
  competitionType?: CompetitionType;
}

export const getDayFromDate = (date: Date): number => {
  // Date.getDay() returns 0 for Sunday, 1 for Monday etc.
  // The user wants TRT time.
  // Assuming the environment is UTC, TRT is UTC+3.
  const trtDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
  return trtDate.getUTCDay();
};

export const getHourFromDate = (date: Date): number => {
  const trtDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
  return trtDate.getUTCHours();
};

/**
 * Lig maç günü mü? (Pazartesi-Cuma)
 */
export const isMatchDay = (date: Date, competitionType: CompetitionType = 'league'): boolean => {
  const day = getDayFromDate(date);
  if (competitionType === 'league') return day >= 1 && day <= 5; // Mon-Fri
  if (competitionType === 'cup') return day === 0 || day === 6; // Pazar veya Cumartesi
  return day >= 1 && day <= 5; // friendly = weekday
};

/**
 * Maç saati mi?
 * Lig maçları: 12:00 ve 18:00
 * Kupa maçları: 20:00 (Çarşamba akşamı)
 * Hazırlık maçları: 15:00
 */
export const isMatchTime = (date: Date, competitionType: CompetitionType = 'league'): boolean => {
  if (!isMatchDay(date, competitionType)) return false;
  const hour = getHourFromDate(date);
  if (competitionType === 'league') return hour === 12 || hour === 18;
  if (competitionType === 'cup') return hour === 15 || hour === 20; // 15:00 veya 20:00
  if (competitionType === 'friendly') return hour === 15;
  return false;
};

export const isTrainingTime = (date: Date): boolean => {
  const day = getDayFromDate(date);
  if (day === 0 || day === 6) return false; // weekend off
  const hour = getHourFromDate(date);
  return hour === 15 || hour === 21;
};

/**
 * Bir fikstür için competition_type ikonunu döndürür.
 * Kupa maçları için 🏆, lig için ⚽, hazırlık için 🤝
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
 * Competition type etiketini döndürür.
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
 * Bir tarihe en yakın kupa maç gününü (Cumartesi) bulur.
 */
export function nextCupMatchDate(from?: Date): Date {
  const d = from ? new Date(from) : new Date();
  const day = d.getDay();
  // Find next Saturday (6)
  const diff = day === 6 ? 7 : ((6 - day + 7) % 7);
  d.setDate(d.getDate() + diff);
  d.setHours(15 + Math.floor(Math.random() * 2) * 5, 0, 0, 0); // 15:00 veya 20:00
  return d;
}

/**
 * current_day (oyun günü) → maç tarihi (YYYY-MM-DD) dönüşümü.
 * Sezon 1 Ağustos'ta başlar; her oyun günü 4 gerçek gün ileri atlar.
 * Bu sayede getWeatherForDate ile fikstür sayfasıyla tutarlı hava durumu elde edilir.
 */
export function computeMatchDateFromDay(currentDay: number): string {
  const seasonStart = new Date(2025, 7, 1); // 1 Ağustos 2025
  const date = new Date(seasonStart);
  date.setDate(date.getDate() + (currentDay - 1) * 4); // 4 günlük aralıklar
  return date.toISOString().split('T')[0];
}
