import { Player } from './types';

export function formatCurrency(val: number): string {
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)}M €`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(0)}K €`;
  }
  return `${val} €`;
}

export function calculateMarketValue(player: Player): number {
  // FM-style valuation logic
  // Base value increases exponentially with rating
  const baseValue = 50000;
  const ratingFactor = Math.pow(1.11, player.rating - 40); // Exponential growth after 40 rating
  
  let value = baseValue * ratingFactor;
  
  // Age Impact: High value for youth (17-23), peak Value (24-27), rapid decline after 30
  if (player.age < 21) value *= 1.8;
  else if (player.age < 24) value *= 1.4;
  else if (player.age < 28) value *= 1.1;
  else if (player.age > 33) value *= 0.3;
  else if (player.age > 30) value *= 0.6;
  
  // Potential Impact: Young players with high potential are worth much more
  if (player.potential > player.rating && player.age < 23) {
    const potentialGap = player.potential - player.rating;
    value *= (1 + (potentialGap * 0.08));
  }
  
  // Trait level premiums (MOR / ALTIN / LACIVERT / BEYAZ)
  if (player.traitLevels) {
    Object.values(player.traitLevels).forEach(lvl => {
      if (lvl === 'MOR') value *= 1.40;
      else if (lvl === 'ALTIN') value *= 1.25;
      else if (lvl === 'LACIVERT') value *= 1.10;
      else if (lvl === 'BEYAZ') value *= 1.02;
    });
  }

  // Positive traits count bonus (each trait +3%, max +15%)
  const positiveTraitCount = player.traits?.length || 0;
  if (positiveTraitCount > 0) {
    value *= (1 + Math.min(0.15, positiveTraitCount * 0.03));
  }

  // Negative traits penalty (each trait -5%, max -25%)
  const negTraitCount = player.negTraits?.length || 0;
  if (negTraitCount > 0) {
    value *= Math.max(0.75, 1 - (negTraitCount * 0.05));
  }

  // Archetype bonus
  if (player.archetype) {
    const highValueArchetypes = [
      'Playmaker', 'Ball Winner', 'Target Man', 'Complete Forward',
      'Sweeper Keeper', 'Regista', 'Mezzala', 'Inverted Wing Back',
      'False 9', 'Complete Midfielder', 'Box to Box',
    ];
    if (highValueArchetypes.some(a => player.archetype!.includes(a))) {
      value *= 1.08;
    } else {
      value *= 1.05;
    }
  }

  // Secondary positions versatility bonus (each +2%, max +6%)
  const secPosCount = player.secondaryPositions?.length || 0;
  if (secPosCount > 0) {
    value *= (1 + Math.min(0.06, secPosCount * 0.02));
  }

  // Form impact
  const form = player.form || 50;
  if (form > 75) value *= 1.05;
  else if (form < 40) value *= 0.95;

  // Exceptional stats bonus
  const statKeys = [
    'speed', 'passing', 'shooting', 'finishing', 'dribbling',
    'defending', 'tackling', 'heading', 'crossing', 'longShots',
    'technique', 'firstTouch', 'vision', 'anticipation', 'composure',
    'workRate', 'strength', 'stamina', 'agility',
  ];
  let exceptional90Count = 0;
  let exceptional95Count = 0;
  for (const key of statKeys) {
    const val = (player as any)[key];
    if (typeof val === 'number') {
      if (val >= 95) exceptional95Count++;
      else if (val >= 90) exceptional90Count++;
    }
  }
  if (exceptional90Count > 0) value *= (1 + Math.min(0.10, exceptional90Count * 0.02));
  if (exceptional95Count > 0) value *= (1 + Math.min(0.15, exceptional95Count * 0.03));

  // Ensure minimum value (150K) and round
  return Math.round(Math.max(150000, value));
}

export function getTransferCorridor(value: number): { min: number, max: number } {
  // Wider corridor for more expensive players
  const minMult = value > 5_000_000 ? 0.75 : 0.80;
  const maxMult = value > 5_000_000 ? 1.6 : 1.5;
  return {
    min: Math.round(value * minMult),
    max: Math.round(value * maxMult),
  };
}
