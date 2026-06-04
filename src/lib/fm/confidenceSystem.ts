/**
 * Player Confidence System
 * Affects match performance based on recent results
 * - High confidence: shot/pass bonus
 * - Low confidence: error probability increase
 * - Normal: no effect
 */

export type ConfidenceLevel = 'low' | 'normal' | 'high';

export interface ConfidenceEffect {
  shotBonus: number;     // Multiplier for shot accuracy (1.0 = no change)
  passBonus: number;     // Multiplier for pass accuracy
  errorChance: number;   // Additional error probability (0.0 - 0.15)
  moraleModifier: number; // Modifier to morale in match engine
}

export function calculateConfidenceLevel(
  consecutiveGood: number,
  consecutiveBad: number
): ConfidenceLevel {
  if (consecutiveGood >= 3) return 'high';
  if (consecutiveBad >= 3) return 'low';
  return 'normal';
}

export function getConfidenceEffects(level: ConfidenceLevel): ConfidenceEffect {
  switch (level) {
    case 'high':
      return {
        shotBonus: 1.08,    // +8% shot accuracy
        passBonus: 1.05,    // +5% pass accuracy
        errorChance: 0,
        moraleModifier: 3,  // +3 morale
      };
    case 'low':
      return {
        shotBonus: 0.92,    // -8% shot accuracy
        passBonus: 0.95,    // -5% pass accuracy
        errorChance: 0.08,  // +8% error chance
        moraleModifier: -3, // -3 morale
      };
    case 'normal':
    default:
      return {
        shotBonus: 1.0,
        passBonus: 1.0,
        errorChance: 0,
        moraleModifier: 0,
      };
  }
}

/**
 * Update confidence after a match
 * Good match = rating >= 7.0
 * Bad match = rating < 5.5
 */
export function updateConfidenceAfterMatch(
  currentConsecutiveGood: number,
  currentConsecutiveBad: number,
  matchRating: number
): { consecutiveGood: number; consecutiveBad: number; level: ConfidenceLevel } {
  let good = currentConsecutiveGood;
  let bad = currentConsecutiveBad;

  if (matchRating >= 7.0) {
    good++;
    bad = 0;
  } else if (matchRating < 5.5) {
    bad++;
    good = 0;
  } else {
    // Average match resets both
    good = 0;
    bad = 0;
  }

  return {
    consecutiveGood: good,
    consecutiveBad: bad,
    level: calculateConfidenceLevel(good, bad),
  };
}

/**
 * Get confidence display info for UI
 */
export function getConfidenceDisplay(level: ConfidenceLevel): { icon: string; label: string; color: string; description: string } {
  switch (level) {
    case 'high':
      return { icon: '🔥', label: 'Yüksek', color: 'text-green-400', description: 'Üst üste iyi maçlar — şut/pas bonusu aktif' };
    case 'low':
      return { icon: '😰', label: 'Düşük', color: 'text-red-400', description: 'Üst üste kötü maçlar — hata yapma riski artmış' };
    case 'normal':
    default:
      return { icon: '😐', label: 'Normal', color: 'text-white/50', description: 'Standart performans seviyesi' };
  }
}
