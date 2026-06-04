/**
 * Atmosphere Score Calculation
 * Based on: stadium occupancy, ticket price, league position, fan satisfaction
 * Affects: home team advantage (higher = more bonus), away team morale (lower = more penalty)
 */

export interface AtmosphereInput {
  stadiumCapacity: number;
  attendance: number;
  ticketPrice: number;
  leaguePosition: number;
  totalTeams: number;
  fans: number;
  reputation: number;
  isRivalry: boolean;
}

export function calculateAtmosphereScore(input: AtmosphereInput): number {
  const occupancyRate = input.stadiumCapacity > 0 ? input.attendance / input.stadiumCapacity : 0.5;
  
  // Occupancy factor (0-30 points)
  const occupancyPoints = Math.min(30, occupancyRate * 30);
  
  // League position factor (0-25 points) — higher position = more excitement
  const positionNormalized = input.totalTeams > 0 ? 1 - (input.leaguePosition - 1) / input.totalTeams : 0.5;
  const positionPoints = positionNormalized * 25;
  
  // Fan factor (0-20 points)
  const fanPoints = Math.min(20, (input.fans / 10000) * 5);
  
  // Reputation factor (0-15 points)
  const reputationPoints = Math.min(15, (input.reputation || 50) / 100 * 15);
  
  // Rivalry bonus (0-10 points)
  const rivalryPoints = input.isRivalry ? 10 : 0;
  
  // Ticket price penalty (overpriced reduces atmosphere)
  const pricePenalty = input.ticketPrice > 80 ? Math.min(10, (input.ticketPrice - 80) / 10) : 0;
  
  const rawScore = occupancyPoints + positionPoints + fanPoints + reputationPoints + rivalryPoints - pricePenalty;
  
  // Normalize to 0-100
  return Math.round(Math.max(0, Math.min(100, rawScore)));
}

export function getAtmosphereModifiers(atmosphereScore: number): { homeAdvantage: number; awayMoralePenalty: number } {
  // Scale: 50 = neutral, >50 = home advantage, <50 = home disadvantage
  const homeAdvantage = 1.0 + ((atmosphereScore - 50) / 500); // Range: 0.90 - 1.10
  const awayMoralePenalty = atmosphereScore > 60 ? (atmosphereScore - 60) / 200 : 0; // Small morale hit for away team
  
  return {
    homeAdvantage: Math.max(0.90, Math.min(1.10, homeAdvantage)),
    awayMoralePenalty: Math.max(0, Math.min(0.15, awayMoralePenalty)),
  };
}
