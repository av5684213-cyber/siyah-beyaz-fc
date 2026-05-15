import { Player, FITNESS_THRESHOLDS } from './types';

export class FitnessManager {
  static updateAfterMatch(players: Player[], tacticIntensity: 'low' | 'normal' | 'high'): Player[] {
    const intensityMult = tacticIntensity === 'high' ? 1.5 : (tacticIntensity === 'low' ? 0.8 : 1.0);
    
    return players.map(player => {
      const staminaFactor = (player.stamina || 50) / 100;
      const loss = Math.floor((10 + Math.random() * 15) * intensityMult * (1.2 - staminaFactor));
      return {
        ...player,
        fitness: Math.max(0, player.fitness - loss)
      };
    });
  }

  static restoreFitness(players: Player[], rehabLevel: number, trainingIntensity: 'low' | 'normal' | 'high'): Player[] {
    // Recovery at 15:00 and 21:00
    // Gain: Base + (Rehab * Multiplier) - Intensity_Penalty
    
    const intensityPenalty = trainingIntensity === 'high' ? 0.5 : 0;
    
    return players.map(player => {
      if (player.fitness >= 100) return player;
      
      const gain = Math.floor((10 + rehabLevel * 5) * (1 - intensityPenalty));
      return {
        ...player,
        fitness: Math.min(100, player.fitness + gain)
      };
    });
  }
}
