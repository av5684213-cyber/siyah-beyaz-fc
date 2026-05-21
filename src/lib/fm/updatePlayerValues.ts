// =============================================================================
// Siyah Beyaz FC — Player Value Update Module
// =============================================================================
// TypeScript migration of python/update_player_values.py v2
// Weekly price update formula for all players.
//
// Formula:
//   total = base_price * form_modifier * injury_modifier * age_modifier * rarity_modifier + performance_bonus
//
// Where:
//   1. base_price = overall * 1000
//   2. form_modifier = 1.0 + ((form_rating - 50) / 2) / 100
//   3. injury_modifier = current injury penalty + history penalty (every 5 days = -5%, max -30%)
//   4. age_modifier = bracket-based: <18: 1.25, 18-21: 1.20, 22-27: 1.10, 28-31: 1.00, 32-35: 0.85, 36+: 0.70
//   5. rarity_modifier = Common: 1.0, Rare: 1.5, Epic: 2.0, Legendary: 3.0
//   6. performance_bonus = goals * 500 + assists * 300
//   7. Min: 100, Max: 10,000,000
// =============================================================================

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const MIN_PRICE = 100;
export const MAX_PRICE = 10_000_000;
export const BASE_MULTIPLIER = 1000; // overall * 1000

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

// ═══════════════════════════════════════════════════════════════════════════════
// PLAYER RECORD INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlayerValuationRecord {
  id: string;
  name?: string;
  rating?: number;
  potential?: number;
  form_rating?: number;
  age?: number;
  is_injured?: boolean;
  injury_end_date?: string | null;
  injury_history?: unknown;
  goals?: number;
  assists?: number;
  market_value?: number;
  current_price?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RARITY DETERMINATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Determine a player's rarity tier based on their rating and potential.
 * Matches the Python v2 logic exactly.
 */
export function determineRarity(rating: number, potential: number): Rarity {
  if (rating >= 85 || potential >= 90) return 'Legendary';
  if (rating >= 75 || potential >= 80) return 'Epic';
  if (rating >= 65 || potential >= 70) return 'Rare';
  return 'Common';
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORM MODIFIER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the form effect on player value.
 *
 * Formula: (form_rating - 50) / 2 → percentage change
 * Then: modifier = 1.0 + (percentage / 100)
 *
 * Examples:
 *   form_rating = 80 → (80-50)/2 = 15% → modifier = 1.15
 *   form_rating = 20 → (20-50)/2 = -15% → modifier = 0.85
 *   form_rating = 50 → modifier = 1.00 (neutral)
 *
 * @param formRating - Player's form rating (0-100, default 50)
 * @returns Form modifier (typically 0.75 - 1.25)
 */
export function calculateFormModifier(formRating: number): number {
  const formPct = (formRating - 50) / 2.0; // Range: -25 to +25
  return 1.0 + (formPct / 100.0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INJURY MODIFIER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the injury effect on player value (v2 detailed formula).
 *
 * Current injury:
 *   - If injured with end_date > 7 days away: -15%
 *   - If injured with end_date < 7 days away: -5%
 *   - If injured without end_date: -5%
 *
 * Injury history (last 3 months):
 *   - Every 5 injury days → -5%
 *   - Maximum total penalty: -30%
 *
 * Total modifier is clamped to [0.70, 1.0] (max -30%)
 *
 * @param player - Player record with injury data
 * @returns Injury modifier (0.70 - 1.0)
 */
export function calculateInjuryModifier(player: PlayerValuationRecord): number {
  let modifier = 1.0;

  // ── Current injury effect ──
  const isInjured = Boolean(player.is_injured);
  const injuryEndDate = player.injury_end_date;

  if (isInjured) {
    if (injuryEndDate) {
      try {
        const end = new Date(injuryEndDate);
        const now = new Date();
        const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining >= 7) {
          modifier *= 0.85; // Long-term injury: -15%
        } else {
          modifier *= 0.95; // Short-term injury: -5%
        }
      } catch {
        modifier *= 0.95; // Parse error: default -5%
      }
    } else {
      modifier *= 0.95; // No end date: -5%
    }
  }

  // ── Injury history effect (last 3 months) ──
  let history: Array<{ date?: string; duration_days?: number }> = [];
  if (player.injury_history) {
    try {
      history = typeof player.injury_history === 'string'
        ? JSON.parse(player.injury_history)
        : (Array.isArray(player.injury_history) ? player.injury_history as Array<{ date?: string; duration_days?: number }> : []);
    } catch {
      history = [];
    }
  }

  if (history.length > 0) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentInjuries = history.filter(h => {
      if (!h.date) return false;
      try {
        return new Date(h.date) >= threeMonthsAgo;
      } catch {
        return false;
      }
    });

    // Calculate total injury days in last 3 months
    let totalInjuryDays = 0;
    for (const inj of recentInjuries) {
      const duration = inj.duration_days || 0;
      if (typeof duration === 'number') {
        totalInjuryDays += Math.floor(duration);
      }
    }

    // Every 5 days = -5%, max -30%
    if (totalInjuryDays > 0) {
      const penaltyPct = Math.min(30, Math.floor(totalInjuryDays / 5) * 5);
      modifier *= (1 - penaltyPct / 100);
    }
  }

  // Clamp to minimum 0.70 (max -30% total)
  return Math.max(0.70, modifier);
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGE MODIFIER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the age effect on player value (v2 detailed brackets).
 *
 * Brackets:
 *   < 18: +25% (very young potential)
 *   18-21: +20% (youth potential bonus)
 *   22-27: +10% (prime years)
 *   28-31: 0% (stable)
 *   32-35: -15% (decline)
 *   36+: -30% (sharp decline)
 *
 * @param age - Player's age
 * @returns Age modifier
 */
export function calculateAgeModifier(age: number): number {
  if (age < 18) return 1.25;  // +25% very young potential
  if (age <= 21) return 1.20; // +20% youth potential bonus
  if (age <= 27) return 1.10; // +10% prime
  if (age <= 31) return 1.00; // Stable
  if (age <= 35) return 0.85; // -15% decline
  return 0.70;                // -30% sharp decline
}

// ═══════════════════════════════════════════════════════════════════════════════
// RARITY MODIFIER
// ═══════════════════════════════════════════════════════════════════════════════

const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  Common: 1.0,
  Rare: 1.5,
  Epic: 2.0,
  Legendary: 3.0,
};

/**
 * Get the rarity multiplier for a given rarity tier.
 * @param rarity - The rarity tier
 * @returns Multiplier value
 */
export function getRarityModifier(rarity: Rarity): number {
  return RARITY_MULTIPLIERS[rarity];
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PRICE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate a player's market value using the v2 detailed formula.
 *
 * This is the primary function that mirrors python/update_player_values.py
 * exactly, with the same formula and same age/injury/form brackets.
 *
 * Formula:
 *   total = base_price * form_modifier * injury_modifier * age_modifier * rarity_modifier + performance_bonus
 *
 * @param player - Player record from Supabase
 * @returns Calculated price (clamped to [100, 10,000,000])
 */
export function calculatePlayerPrice(player: PlayerValuationRecord): number {
  const overall = player.rating || 50;
  const formRating = player.form_rating || 50;
  const age = player.age || 25;
  const potential = player.potential || overall;
  const goals = player.goals || 0;
  const assists = player.assists || 0;

  // 1. Base price: overall * 1000
  const basePrice = overall * BASE_MULTIPLIER;

  // 2. Form effect: (form_rating - 50) / 2 percentage
  const formModifier = calculateFormModifier(formRating);

  // 3. Injury effect: history penalty + current injury penalty
  const injuryModifier = calculateInjuryModifier(player);

  // 4. Age effect: bracket-based
  const ageModifier = calculateAgeModifier(age);

  // 5. Performance bonus: goals * 500 + assists * 300
  const performanceBonus = goals * 500 + assists * 300;

  // 6. Rarity bonus: Common x1, Rare x1.5, Epic x2, Legendary x3
  const rarity = determineRarity(overall, potential);
  const rarityModifier = getRarityModifier(rarity);

  // Total calculation
  const totalPrice = Math.round(
    basePrice * formModifier * injuryModifier * ageModifier * rarityModifier + performanceBonus
  );

  // 7. Clamp to [100, 10,000,000]
  return Math.max(MIN_PRICE, Math.min(MAX_PRICE, totalPrice));
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALUATION BREAKDOWN (for debugging/display)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ValuationBreakdown {
  basePrice: number;
  formModifier: number;
  injuryModifier: number;
  ageModifier: number;
  rarityModifier: number;
  rarity: Rarity;
  performanceBonus: number;
  finalPrice: number;
}

/**
 * Get a detailed breakdown of a player's valuation.
 * Useful for debugging and UI display.
 */
export function getValuationBreakdown(player: PlayerValuationRecord): ValuationBreakdown {
  const overall = player.rating || 50;
  const formRating = player.form_rating || 50;
  const age = player.age || 25;
  const potential = player.potential || overall;
  const goals = player.goals || 0;
  const assists = player.assists || 0;

  const basePrice = overall * BASE_MULTIPLIER;
  const formModifier = calculateFormModifier(formRating);
  const injuryModifier = calculateInjuryModifier(player);
  const ageModifier = calculateAgeModifier(age);
  const rarity = determineRarity(overall, potential);
  const rarityModifier = getRarityModifier(rarity);
  const performanceBonus = goals * 500 + assists * 300;
  const finalPrice = calculatePlayerPrice(player);

  return {
    basePrice,
    formModifier,
    injuryModifier,
    ageModifier,
    rarityModifier,
    rarity,
    performanceBonus,
    finalPrice,
  };
}
