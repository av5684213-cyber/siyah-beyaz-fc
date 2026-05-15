import { MatchResult, Player } from './types';
import { runFinalScoreSimulation } from './matchEngine';

export interface SimulatedMatch {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  result: any;
  day: number;
}

export async function simulateHistory(userId: string, teamName: string, players: Player[]) {
  const matches: SimulatedMatch[] = [];
  const now = new Date();
  
  // Find most recent Monday
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1); 
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - diffToMonday);
  lastMonday.setHours(9, 0, 0, 0); // Start the day in the morning

  const aiTeamPool = [
    'Kartal Gücü', 'Aslan United', 'Kanarya City', 'Fırtına FC', 'Boğaz Spor', 
    'Yıldızlar Birliği', 'Anadolu Kartalı', 'Sahil Belediye', 'İç Anadolu FC'
  ];

  let matchCounter = 0;
  const matchHours = [12, 18]; // Two matches per weekday
  
  const simulationDate = new Date(lastMonday);
  
  while (simulationDate < now) {
    const d = simulationDate.getDay();
    // Simulate only Weekdays (Mon-Fri)
    if (d >= 1 && d <= 5) {
      for (const hour of matchHours) {
        const matchTime = new Date(simulationDate);
        matchTime.setHours(hour, 0, 0, 0);
        
        if (matchTime < now) {
          matchCounter++;
          const opp = aiTeamPool[Math.floor(Math.random() * aiTeamPool.length)];
          const isHome = Math.random() > 0.5;
          
          const homeTeam = isHome ? teamName : opp;
          const awayTeam = isHome ? opp : teamName;
          
          // Realistic simulation
          const homeScore = Math.floor(Math.random() * 4);
          const awayScore = Math.floor(Math.random() * 3);
          
          matches.push({
            id: `hist_${matchCounter}`,
            date: matchTime.toISOString(),
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
            result: { 
              score: { home: homeScore, away: awayScore }, 
              events: [
                { minute: 90, type: 'FULLTIME', text: 'Maç sona erdi.' }
              ] 
            },
            day: matchCounter // Treat each slot as a "day" or "tur" in the progression
          });
        }
      }
    }
    
    simulationDate.setDate(simulationDate.getDate() + 1);
  }

  return matches;
}
