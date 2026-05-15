import { Player } from './types';

export function syncPlayerStats(player: Player): Player {
  // Ensure stats don't exceed potential or bounds
  const potential = player.potential || 99;
  return {
    ...player,
    rating: Math.min(potential, Math.max(1, player.rating)),
    shooting: player.shooting ? Math.min(99, player.shooting) : undefined,
    passing: player.passing ? Math.min(99, player.passing) : undefined,
    defense: player.defense ? Math.min(99, player.defense) : undefined,
  };
}

