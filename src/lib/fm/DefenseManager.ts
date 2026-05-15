import { Profile } from './types';

export class DefenseManager {
  /**
   * Calculates the final success chance of an attack given the defender's defense powers.
   * @param baseSuccessRate The base success rate of the operation
   * @param category The category of the operation (media, scouting, physical, legal, veto)
   * @param defenderProfile The profile of the team being attacked
   */
  static calculateSuccessChance(baseSuccessRate: number, category: string, defenderProfile: Profile): number {
    const defensePowers = defenderProfile.defense_powers || {};
    const defensePower = defensePowers[category] || 0;
    
    // Logic: Success = Base * (1 - DefensePower)
    // defensePower is expected to be between 0 and 1 (e.g. 0.2 for 20% reduction)
    let finalChance = baseSuccessRate * (1 - defensePower);
    
    // Ensure final chance doesn't drop below a minimum threshold for gameplay reasons
    return Math.max(finalChance, 0.05);
  }

  /**
   * Calculates if an attack rebounds back to the attacker as a scandal risk multiplier.
   * "Ava giderken avlanma" logic.
   */
  static getScandalReboundMultiplier(defenderProfile: Profile, category: string): number {
    const defensePowers = defenderProfile.defense_powers || {};
    const defensePower = defensePowers[category] || 0;
    
    // If defense is high, scandal risk for attacker doubles
    if (defensePower > 0.5) {
      return 2.0;
    }
    
    return 1.0;
  }
}
