import { MatchSchedule } from './types';

export class MatchScheduler {
  private static instance: MatchScheduler;

  private constructor() {}

  public static getInstance(): MatchScheduler {
    if (!MatchScheduler.instance) {
      MatchScheduler.instance = new MatchScheduler();
    }
    return MatchScheduler.instance;
  }

  // UTC+3 Calculation
  public getTurkeyTime(): Date {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 3));
  }

  public getScheduleStatus(): MatchSchedule {
    const turkeyNow = this.getTurkeyTime();
    const day = turkeyNow.getDay(); // 0 is Sun, 6 is Sat
    const hour = turkeyNow.getHours();
    const minutes = turkeyNow.getMinutes();

    const isWeekday = day >= 1 && day <= 5;
    const isMatchWindow = (hour === 12 || hour === 18) && minutes < 30;

    let nextMatchTime = '';
    // Simplify next match calculation for now
    if (isWeekday) {
      if (hour < 12) nextMatchTime = 'Bugün 12:00';
      else if (hour < 18) nextMatchTime = 'Bugün 18:00';
      else nextMatchTime = 'Yarın 12:00';
    } else {
      nextMatchTime = 'Pazartesi 12:00';
    }

    return {
      nextMatchTime,
      isMatchActive: isWeekday && isMatchWindow,
      isTestMode: false
    };
  }

  public getMatchSpeedMultiplier(isTestMode: boolean): number {
    return isTestMode ? 10.0 : 1.0;
  }
}
