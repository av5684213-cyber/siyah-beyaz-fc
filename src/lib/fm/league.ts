import { isMatchDay } from './schedule';

export const generateSeasonFixtures = (league: any, userTeamId: string, seasonId: string, startDate: Date) => {
  const fixtures = [];
  let week = 1;
  let currentDate = new Date(startDate);
  
  // Simple round-robin logic for now, just to generate 34 weeks
  // Let's just create 34 weeks, and assign dates to them if they are weekdays
  
  // Generate 34 weeks, two matches every weekday
  while (week <= 34) {
    if (isMatchDay(currentDate)) {
      // Match at 12:00
      const matchDate1 = new Date(currentDate.getTime());
      matchDate1.setHours(12, 0, 0, 0);
      fixtures.push({
        id: `fix-${fixtures.length + 1}`,
        week,
        homeTeam: 'Beşiktaş',
        awayTeam: 'Rakip ' + (fixtures.length + 1),
        isFinished: false,
        isUserMatch: true,
        importance: 'medium',
        stadium: 'Vodafone Park',
        date: matchDate1
      });

      // Match at 18:00
      const matchDate2 = new Date(currentDate.getTime());
      matchDate2.setHours(18, 0, 0, 0);
      fixtures.push({
        id: `fix-${fixtures.length + 1}`,
        week,
        homeTeam: 'Beşiktaş',
        awayTeam: 'Rakip ' + (fixtures.length + 1),
        isFinished: false,
        isUserMatch: true,
        importance: 'medium',
        stadium: 'Vodafone Park',
        date: matchDate2
      });
      week++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return fixtures;
};
