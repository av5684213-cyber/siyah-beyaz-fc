
export type ScheduleType = 'MATCH' | 'TRAINING';

export interface ScheduleEvent {
  dayOfWeek: number; // 0 for Sunday, 1 for Monday, ..., 5 for Friday, 6 for Saturday
  hour: number;
  type: ScheduleType;
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

export const isMatchDay = (date: Date): boolean => {
    const day = getDayFromDate(date);
    return day >= 1 && day <= 5; // Mon-Fri
};

// Match times: 12:00 and 18:00
export const isMatchTime = (date: Date): boolean => {
    if (!isMatchDay(date)) return false;
    const hour = getHourFromDate(date);
    return hour === 12 || hour === 18;
};

// Training times: 15:00 and 21:00
export const isTrainingTime = (date: Date): boolean => {
    const day = getDayFromDate(date);
    if (day === 0 || day === 6) return false; // weekend off
    const hour = getHourFromDate(date);
    return hour === 15 || hour === 21;
};
