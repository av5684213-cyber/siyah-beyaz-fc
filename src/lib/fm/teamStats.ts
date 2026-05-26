import { Player } from './types';

export function calculateAverageRating(squad: Player[]): number {
  if (!squad.length) return 0;
  return squad.reduce((acc, p) => acc + p.rating, 0) / squad.length;
}

export const INITIAL_TEAM_STATS = {
  attack: 50,
  defense: 50,
  stamina: 50,
  chemistry: 50
};

export const INITIAL_SLOTS = ['general_433'];
