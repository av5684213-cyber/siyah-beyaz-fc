import { Player } from './types';

export function shouldPlayerRetire(player: Player): boolean {
  return (player.age || 0) >= 38;
}

export function processSeasonEndRetirements(squad: Player[], teamId: string) {
  return {
    updatedSquad: squad.filter(p => !shouldPlayerRetire(p)),
    retiredPlayers: squad.filter(p => shouldPlayerRetire(p)),
    newTalents: []
  };
}
