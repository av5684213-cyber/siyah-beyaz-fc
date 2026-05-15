import { Player } from './types';

export function getPerformanceStats(player: Player, isMatch: boolean, teamStats: Record<string, number>) {
  // Simplified performance multipliers
  return {
    rating: 1.0,
    passing: 1.0,
    shooting: 1.0,
    defending: 1.0,
    speed: 1.0,
    power: 1.0
  };
}
