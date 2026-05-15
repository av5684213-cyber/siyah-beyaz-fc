import { Player, TrainingState, TrainingSessionResult } from './types';
import { TRAINING_PROGRAMS } from './constants';

export const runTrainingSession = (squad: Player[], state: TrainingState, multiplier: number = 1.0) => {
  const results: Record<string, TrainingSessionResult> = {};
  
  const updatedSquad = squad.map(player => {
    const assignment = state.assignments.find(a => a.playerId === player.id);
    if (!assignment) return player;

    const program = TRAINING_PROGRAMS.find(p => p.id === assignment.programId);
    if (!program) return player;

    // Calculate gains
    const statsGained: Record<string, number> = {};
    const intensityFactor = program.intensity / 100;
    const coachFactor = state.coachQuality;
    const ageFactor = player.age <= 21 ? 1.5 : 1.0;
    
    // Injury check
    if (player.injury && player.injury.remaining_days > 0) {
      results[player.id] = {
        playerId: player.id,
        statGains: {},
        fitnessChange: 5,
        ratingChange: 0,
        message: 'Sakat olduğu için antrenman yapamadı.'
      };
      return player;
    }

    // Personality Trait Impact
    let personalityFactor = 1.0;
    if (player.personalityTraits) {
      if (player.personalityTraits.includes('Profesyonel')) personalityFactor *= 1.25;
      if (player.personalityTraits.includes('Antrenman yıldızı')) personalityFactor *= 1.5;
      if (player.personalityTraits.includes('Tembel')) personalityFactor *= 0.75;
      if (player.personalityTraits.includes('Çalışkan')) personalityFactor *= 1.2;
      if (player.personalityTraits.includes('Disiplinsiz')) personalityFactor *= 0.9;
    }
    
    // REST LOGIC: If resting, no stat gains, high fitness recovery
    if (player.isResting) {
      results[player.id] = {
        statsGained: {},
        traitsGained: [],
        injuryRisk: false,
        staminaLost: -20
      };

      return {
        ...player,
        cond: Math.min(100, (player.cond || 100) + 20),
        isResting: false // Reset for next session
      };
    }

    const allUniqueStats = Array.from(new Set([...program.targetStats, assignment.focusedStat].filter(Boolean) as string[]));
    
    allUniqueStats.forEach(stat => {
      let gain = (Math.random() * 0.15) * intensityFactor * coachFactor * ageFactor * personalityFactor * multiplier;
      
      const currentVal = (player as any)[stat] || 50;
      const potential = player.potential || 75;
      
      // If focused, gain is 10% of the gap between current and potential
      if (assignment.focusedStat === stat) {
        const gap = Math.max(0, potential - currentVal);
        gain = gap * 0.1;
      } else {
        // Harder to gain as stats get higher for non-focused stats
        const statCeilingFactor = Math.max(0.1, (100 - currentVal) / 100);
        gain *= statCeilingFactor;
      }

      statsGained[stat] = gain;
    });

    const injuryRisk = Math.random() < 0.02 && (player.cond || 100) < 30;

    results[player.id] = {
      statsGained,
      traitsGained: [],
      injuryRisk,
      staminaLost: -10 // Training gives +10 condition recovery as requested
    };

    // Update player
    const updatedPlayer = { ...player };
    Object.entries(statsGained).forEach(([stat, gain]) => {
      const currentVal = (updatedPlayer as any)[stat] || 50;
      (updatedPlayer as any)[stat] = Math.min(99, currentVal + gain);
    });
    
    // Update overall rating slightly
    const totalGain = Object.values(statsGained).reduce((a, b) => a + b, 0);
    updatedPlayer.rating = Math.min(player.potential, updatedPlayer.rating + (totalGain / 10));
    updatedPlayer.cond = Math.min(100, (player.cond || 100) + 10);
    updatedPlayer.isResting = false;
    
    return updatedPlayer;
  });

  return { updatedSquad, results };
};

export const tryMatchTraitGrowth = (player: Player, performance: number) => {
  return { ...player };
};
