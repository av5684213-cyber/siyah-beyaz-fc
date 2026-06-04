import { Player } from './types';

export function syncPlayerStats(player: Player): Player {
  // Ensure stats don't exceed potential or bounds
  const potential = player.potential || 99;
  const cap = (val: number | undefined) =>
    val !== undefined ? Math.min(99, Math.max(1, val)) : val;
  return {
    ...player,
    rating:      Math.min(potential, Math.max(1, player.rating)),
    shooting:    cap(player.shooting),
    passing:     cap(player.passing),
    defending:   cap(player.defending),   // DUZELTILDI: 'defense' degil 'defending'
    speed:       cap(player.speed),
    power:       cap(player.power),
    goalkeeping: cap(player.goalkeeping),
    vision:      cap(player.vision),
    control:     cap(player.control),
    heading:     cap(player.heading),
  };
}
