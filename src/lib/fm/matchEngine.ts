import { Player, MatchResult, GameTactics, ActiveTactic, MatchEvent } from './types';

// ═══════════════════════════════════════════════════
//  SAĞLIK MERKEZİ ÇARPANI
//  stadiumMatrix.ts → getInjuryRecoverySpeed() ile uyumlu
//  Sağlık merkezi seviyesi, sakatlık iyileşme süresini kısaltır.
//  Varsayılan: seviye 0 = 1.0x (normal hız), seviye 10 = 2.0x (2 kat hızlı)
// ═══════════════════════════════════════════════════
export const INJURY_RECOVERY_SPEED_BASE = 1.0;
export const INJURY_RECOVERY_SPEED_PER_LEVEL = 0.1;

/**
 * Sağlık merkezi seviyesine göre sakatlık iyileşme hızı çarpanı hesaplar.
 * @param medicalLevel - Sağlık merkezi seviyesi (0-10)
 * @returns Çarpan (ör: level 4 → 1.4, level 10 → 2.0)
 */
export function getInjuryRecoveryMultiplier(medicalLevel: number): number {
  return INJURY_RECOVERY_SPEED_BASE + medicalLevel * INJURY_RECOVERY_SPEED_PER_LEVEL;
}

/**
 * Sakatlık süresini, sağlık merkezi seviyesine göre kısaltır.
 * @param baseDays - Temel sakatlık gün sayısı
 * @param medicalLevel - Sağlık merkezi seviyesi (0-10)
 * @returns Kısaltılmış sakatlık gün sayısı (en az 1)
 */
export function applyInjuryRecovery(baseDays: number, medicalLevel: number): number {
  try {
    const multiplier = getInjuryRecoveryMultiplier(medicalLevel);
    const reducedDays = Math.ceil(baseDays / multiplier);
    return Math.max(1, reducedDays);
  } catch {
    return baseDays;
  }
}

export function simulateMatch(
  homeSquad: Player[],
  awaySquad: Player[],
  options: {
    homeTactics: GameTactics;
    activeTactic: ActiveTactic;
    homeOperations?: string[];
    awayOperations?: string[];
    startMinute?: number;
    currentScore?: { home: number; away: number };
  }
): MatchResult {
  let homeScore = options.currentScore?.home || 0;
  let awayScore = options.currentScore?.away || 0;
  const events: MatchEvent[] = [];
  const playerRatings: Record<string, number> = {};
  const staminaLoss: Record<string, number> = {};
  const playerStats: Record<string, { goals: number; assists: number }> = {};

  const startMin = options.startMinute || 1;

  // Initialize
  homeSquad.forEach(p => {
    playerRatings[p.id] = 6.0 + Math.random() * 2;
    staminaLoss[p.id] = 5 + Math.random() * 5;
    playerStats[p.id] = { goals: 0, assists: 0 };
  });

  // Simple simulation
  for (let min = startMin; min <= 90; min++) {
    // Scoring logic with trait bonuses
    const calculateGoalChance = (squad: Player[], isHome: boolean) => {
      let baseChance = isHome ? 0.022 : 0.018;
      
      const tactics = isHome ? options.homeTactics : ({} as any);
      const intensity = tactics.intensity || 'normal';
      const mentality = tactics.mentality || 3;
      
      // Basic Mental & Intensity Multipliers
      if (mentality > 3) baseChance *= (1 + (mentality - 3) * 0.15);
      if (mentality < 3) baseChance *= (1 - (3 - mentality) * 0.10);
      if (intensity === 'yuksek' || intensity === 'high') baseChance *= 1.15;
      if (intensity === 'dusuk' || intensity === 'low') baseChance *= 0.85;

      // Operation bonuses
      if (isHome && options.homeOperations?.includes('referee_pressure')) baseChance *= 1.25;
      
      // Quality bonus
      const avgRating = squad.reduce((acc, p) => acc + (p.rating || 65), 0) / squad.length;
      baseChance *= (avgRating / 70);

      return baseChance;
    };

    if (Math.random() < calculateGoalChance(homeSquad, true)) {
      const scorer = homeSquad[Math.floor(Math.random() * homeSquad.length)];
      
      // Check playstyle bonuses for commentary and impact
      let goalText = `Dk ${min}: GOL! ${scorer.name} ağları havalandırıyor!`;
      if (scorer.playStyle === 'Plaseci') goalText = `Dk ${min}: ŞIK GOL! ${scorer.name} plaseyle köşeyi buldu!`;
      if (scorer.playStyle === 'Power shot') goalText = `Dk ${min}: MÜTHİŞ GOL! ${scorer.name} ceza sahası dışından mermi gibi vurdu!`;
      if (scorer.playStyle === 'Kafacı (forvet)') goalText = `Dk ${min}: KAFA GOLÜ! ${scorer.name} havada asılı kaldı!`;

      homeScore++;
      playerStats[scorer.id].goals++;
      events.push({
        minute: min,
        type: 'GOAL',
        team: 'HOME',
        player: scorer.name,
        text: goalText
      });
    }

    if (Math.random() < calculateGoalChance(awaySquad, false)) {
      const scorer = awaySquad[Math.floor(Math.random() * awaySquad.length)];
      awayScore++;
      events.push({
        minute: min,
        type: 'GOAL',
        team: 'AWAY',
        player: scorer.name,
        text: `Dk ${min}: GOL! Rakip ${scorer.name} ile golü buldu.`
      });
    }
  }

  events.push({ minute: 45, type: 'HALFTIME', team: 'NEUTRAL', text: 'İlk yarı sona erdi.' });
  events.push({ minute: 90, type: 'FULLTIME', team: 'NEUTRAL', text: 'Maç sona erdi.' });

  return {
    homeScore,
    awayScore,
    events,
    playerRatings,
    staminaLoss,
    playerStats,
    stats: {
      home: { possession: 55, shots: 12, shotsOnTarget: 6, passing: 85 },
      away: { possession: 45, shots: 8, shotsOnTarget: 3, passing: 78 }
    }
  };
}
