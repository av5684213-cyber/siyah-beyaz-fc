import { addHours, subHours, isWithinInterval, startOfToday, setHours, setMinutes, format } from 'date-fns';

export type GamePhase = 'PRE_MATCH' | 'LIVE_MATCH' | 'POST_MATCH' | 'TRAINING_WINDOW' | 'IDLE';

interface CycleStatus {
  phase: GamePhase;
  nextEventTime: string;
  countDownMinutes: number;
  activeMatchId?: string; // For 12:00 or 18:00
}

export interface CycleStatus {
  phase: GamePhase;
  nextEventTime: string;
  countDownMinutes: number;
  activeMatchId?: string;
  isTrainingWindow: boolean;
}

export class GameCycleManager {
  private static trainingLogs: string[] = [];

  public static getStatus(): CycleStatus {
    const now = new Date();
    // Using TR time (UTC+3)
    const trDate = addHours(now, 3);
    const dayOfWeek = trDate.getDay(); // 0 (Sun) to 6 (Sat)
    const currentHour = trDate.getHours();
    const currentMinute = trDate.getMinutes();

    // Monday 00:00 is first training
    const isMondayTraining = dayOfWeek === 1 && currentHour === 0 && currentMinute < 30;
    
    // Weekday matches: Mon (1) to Fri (5)
    const isMatchDay = dayOfWeek >= 1 && dayOfWeek <= 5;
    const matches = [12, 18];

    if (isMatchDay) {
      for (const mHour of matches) {
        const mStart = setMinutes(setHours(startOfToday(), mHour), 0);
        const mEnd = setMinutes(setHours(startOfToday(), mHour), 30);
        if (isWithinInterval(trDate, { start: mStart, end: mEnd })) {
          return {
            phase: 'LIVE_MATCH',
            nextEventTime: format(mEnd, 'HH:mm'),
            countDownMinutes: 30 - currentMinute,
            activeMatchId: `match-${format(mStart, 'yyyyMMdd')}-${mHour}`,
            isTrainingWindow: false // Match period
          };
        }
      }
    }

    const status = this.calculateBasicStatus(trDate, dayOfWeek, currentHour, currentMinute);
    return { ...status, isTrainingWindow: isMondayTraining };
  }

  private static calculateBasicStatus(trDate: Date, dayOfWeek: number, currentHour: number, currentMinute: number) {
    const isMatchDay = dayOfWeek >= 1 && dayOfWeek <= 5;
    const matches = [12, 18];

    if (isMatchDay) {
      for (const mHour of matches) {
          const mStart = setMinutes(setHours(startOfToday(), mHour), 0);
          const preStart = subHours(mStart, 2);
          if (isWithinInterval(trDate, { start: preStart, end: mStart })) {
              return {
                  phase: 'PRE_MATCH' as GamePhase,
                  nextEventTime: format(mStart, 'HH:mm'),
                  countDownMinutes: (mHour * 60) - (currentHour * 60 + currentMinute)
              };
          }
      }
    }

    // Determine next significant event
    let nextEventTime = "00:00";
    let phase: GamePhase = 'IDLE';

    if (isMatchDay) {
      const nextMatchHour = matches.find(h => h > currentHour);
      if (nextMatchHour) {
        nextEventTime = `${nextMatchHour.toString().padStart(2, '0')}:00`;
      } else if (dayOfWeek < 5) {
        nextEventTime = "Yarın 12:00";
      } else {
        nextEventTime = "Pazartesi 00:00";
      }
    } else if (dayOfWeek === 0) { // Sunday
      nextEventTime = "Pazartesi 00:00";
    } else { // Sat
      nextEventTime = "Pazartesi 00:00";
    }

    return {
        phase: phase,
        nextEventTime: nextEventTime,
        countDownMinutes: 0 // Not accurately calculated for multi-day waits here for simplicity
    };
  }

  public static generateMorningNews(teamName: string = 'Kulüp'): string[] {
    return [
      `${teamName}'de antrenman fırtına gibi geçti! Yeni taktik 12:00 maçında denenecek.`,
      `Operasyon Odası'ndan sızan bilgiler: ${teamName} lobisi 18:00 maçı için düğmeye bastı!`,
      "Gazeteler haklı çıktı: Maç öncesi 'Yorgun' denen yıldızların kondisyonu %10 düştü."
    ];
  }
}
