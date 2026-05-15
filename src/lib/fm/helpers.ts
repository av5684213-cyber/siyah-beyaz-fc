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

export function localizePos(pos: string): string {
  if (!pos) return '---';
  const mapping: Record<string, string> = {
    'GK': 'KL',
    'DEF': 'DF',
    'MID': 'OS',
    'FWD': 'FV',
    'CB': 'STP',
    'LB': 'SB',
    'RB': 'SB',
    'LWB': 'KNT',
    'RWB': 'KNT',
    'CDM': 'DOS',
    'CM': 'MC',
    'CAM': 'OOS',
    'LM': 'SLK',
    'RM': 'SAK',
    'ST': 'SNT',
    'LW': 'SLK',
    'RW': 'SAK',
    'CF': 'FV'
  };
  return mapping[pos] || pos;
}

export function getPosColor(pos: string): string {
    if (!pos) return 'text-white/40';
    const p = pos.toUpperCase();
    if (p === 'GK') return 'text-emerald-400';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p)) return 'text-blue-400';
    if (['MID', 'CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p)) return 'text-amber-400';
    if (['FWD', 'ST', 'LW', 'RW', 'CF', 'LF', 'RF'].includes(p)) return 'text-red-400';
    return 'text-white/60';
}
