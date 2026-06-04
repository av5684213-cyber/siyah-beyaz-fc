import { Player, FITNESS_THRESHOLDS } from './types';

export class FitnessManager {
  static updateAfterMatch(players: Player[], tacticIntensity: 'low' | 'normal' | 'high'): Player[] {
    const intensityMult = tacticIntensity === 'high' ? 1.3 : (tacticIntensity === 'low' ? 0.8 : 1.0);
    
    return players.map(player => {
      const staminaFactor = (player.stamina || 50) / 100;
      // Dengeleme: temel kayıp 5-12 arası (eski 10-25'ten düşürüldü)
      // Stamina çarpanı 0.4-1.0 arası (eski 0.2-0.9 daraltıldı)
      const staminaMod = 0.4 + staminaFactor * 0.6;
      const loss = Math.floor((5 + Math.random() * 7) * intensityMult * staminaMod);
      return {
        ...player,
        cond: Math.max(0, (player.cond ?? 100) - loss)
      };
    });
  }

  static restoreFitness(players: Player[], rehabLevel: number, trainingIntensity: 'low' | 'normal' | 'high'): Player[] {
    // İyileşme: 15:00 ve 21:00'de uygulanır
    // Kazanç: Temel + (Rehab × Çarpan) - Yoğunluk_Cezası
    
    const intensityPenalty = trainingIntensity === 'high' ? 0.3 : trainingIntensity === 'normal' ? 0.1 : 0;
    
    return players.map(player => {
      if ((player.cond ?? 100) >= 100) return player;
      
      // Restore hızı artırıldı (decay ile uyumlu olmak için)
      const gain = Math.floor((8 + rehabLevel * 6) * (1 - intensityPenalty));
      return {
        ...player,
        cond: Math.min(100, (player.cond ?? 100) + gain)
      };
    });
  }
}
