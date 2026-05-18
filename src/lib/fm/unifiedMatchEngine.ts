// =============================================================================
// Managerium — Unified Match Engine Bridge
// =============================================================================
// Bridges the enhanced match engine (detailed simulation with weather,
// tackles, interceptions, saves, corners, etc.) to the format MatchDay.tsx
// expects. Keeps ALL existing behavior intact while adding rich features.
// =============================================================================

import type { Player, ActiveTactic, MatchResult, GameTactics } from './types';
import { simulateEnhancedMatch, type EnhancedMatchResult, type MatchStats as EnhancedMatchStats } from './enhancedMatchEngine';

// ─── Legacy-compatible MatchStats (what MatchDay expects) ──────────────────
interface LegacyMatchStats {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  passing: number;
  // NEW: Extended stats from enhanced engine
  tackles?: number;
  corners?: number;
  fouls?: number;
  saves?: number;
  yellowCards?: number;
  redCards?: number;
  offsides?: number;
  interceptions?: number;
}

// ─── Legacy-compatible Event (what MatchDay expects) ─────────────────────────
interface LegacyMatchEvent {
  minute: number;
  type: string;        // GOAL, COMMENTARY, HALFTIME, FULLTIME, OFFSIDE, SUB, TACTIC, YELLOW, RED, SAVE, CHANCE, BATTLE, POST, PENALTY, INJURY, CROWD, ACADEMY
  team: 'HOME' | 'AWAY' | 'NEUTRAL';
  player?: string;
  text: string;
  displayMinute?: number | string;
  assistant?: string;
}

// ─── Unified Options ───────────────────────────────────────────────────────────
export interface UnifiedMatchOptions {
  homeTactics?: GameTactics;
  activeTactic: ActiveTactic;
  homeOperations?: string[];
  startMinute?: number;
  currentScore?: { home: number; away: number };
  homeTeamName?: string;
  awayTeamName?: string;
  gameDay?: number;
  isDerby?: boolean;
  isBigMatch?: boolean;
  labSettings?: any;
  stadiumUpgrades?: Record<string, number>;
  isLabSimulation?: boolean;
  // Referee system
  refereeName?: string;
  refereePersonality?: 'katil' | 'dengeci' | 'hoşgörülü' | 'ev_sahibi' | 'değişken' | 'var_sever';
  refereeStrictness?: number;  // 1-99
  refereeFavor?: number;       // Operations modifier (0.0 = no favor, >0 = favorable to home)
}

// ─── Event Type Mapping ─────────────────────────────────────────────────────
function mapEnhancedTypeToLegacy(type: string): string {
  switch (type) {
    case 'goal': return 'GOAL';
    case 'shot_saved': return 'SAVE';
    case 'shot_wide': return 'COMMENTARY';
    case 'shot_post': return 'POST';
    case 'foul': return 'BATTLE';
    case 'yellow_card': return 'YELLOW';
    case 'red_card': return 'RED';
    case 'corner': return 'COMMENTARY';
    case 'free_kick': return 'COMMENTARY';
    case 'penalty': return 'PENALTY';
    case 'offside': return 'OFFSIDE';
    case 'substitution': return 'SUB';
    case 'injury': return 'INJURY';
    case 'save': return 'SAVE';
    case 'tackle': return 'BATTLE';
    case 'interception': return 'COMMENTARY';
    case 'chance': return 'CHANCE';
    case 'var_review': return 'COMMENTARY';
    case 'goal_overturned': return 'COMMENTARY';
    default: return 'COMMENTARY';
  }
}

// ─── Convert EnhancedMatchStats to LegacyMatchStats ──────────────────────────
function convertStats(enhanced: EnhancedMatchStats): LegacyMatchStats {
  return {
    possession: enhanced.possession,
    shots: enhanced.shots,
    shotsOnTarget: enhanced.shotsOnTarget,
    passing: enhanced.passAccuracy,
    tackles: enhanced.tackles,
    corners: enhanced.corners,
    fouls: enhanced.fouls,
    saves: enhanced.saves,
    yellowCards: enhanced.yellowCards,
    redCards: enhanced.redCards,
    offsides: enhanced.offsides,
    interceptions: enhanced.interceptions,
  };
}

// ─── Convert EnhancedMatchResult to MatchResult (MatchDay format) ──────────
function convertEnhancedToLegacy(
  enhanced: EnhancedMatchResult,
  homePlayers: Player[],
  options: UnifiedMatchOptions
): MatchResult {
  // Convert events
  const legacyEvents: LegacyMatchEvent[] = enhanced.events.map(e => {
    const mappedType = mapEnhancedTypeToLegacy(e.type);
    const team = e.team.toUpperCase() as 'HOME' | 'AWAY';

    return {
      minute: e.minute,
      type: mappedType,
      team,
      player: e.playerName,
      text: e.description,
      assistant: e.assistPlayerName,
    };
  });

  // Add HALFTIME and FULLTIME markers if missing
  const hasHalftime = legacyEvents.some(e => e.type === 'HALFTIME');
  const hasFulltime = legacyEvents.some(e => e.type === 'FULLTIME');

  if (!hasHalftime) {
    legacyEvents.push({
      minute: 45,
      type: 'HALFTIME',
      team: 'NEUTRAL',
      text: 'İlk yarı sona erdi.',
    });
  }

  if (!hasFulltime) {
    legacyEvents.push({
      minute: 90,
      type: 'FULLTIME',
      team: 'NEUTRAL',
      text: 'Maç sona erdi.',
    });
  }

  // Sort events by minute
  legacyEvents.sort((a, b) => a.minute - b.minute);

  // Build playerRatings from home player ratings
  const playerRatings: Record<string, number> = {};
  enhanced.homePlayerRatings.forEach(pr => {
    playerRatings[pr.playerId] = pr.rating;
  });

  // Build staminaLoss
  const staminaLoss: Record<string, number> = {};
  homePlayers.forEach(p => {
    staminaLoss[p.id] = 5 + Math.random() * 12;
  });

  // Build playerStats from home player ratings
  const playerStats: Record<string, any> = {};
  enhanced.homePlayerRatings.forEach(pr => {
    playerStats[pr.playerId] = {
      goals: pr.goals,
      assists: pr.assists,
      yellowCards: 0,
      redCards: 0,
      fouls: 0,
      goalDetails: {},
      saveDetails: {},
    };
  });

  // Track cards/fouls from events
  enhanced.events.forEach(e => {
    if (e.team === 'home' && playerStats[e.playerId]) {
      if (e.type === 'yellow_card') playerStats[e.playerId].yellowCards++;
      if (e.type === 'red_card') playerStats[e.playerId].redCards++;
      if (e.type === 'foul') playerStats[e.playerId].fouls++;
    }
  });

  // Find MOTM player name
  const motmPlayer = enhanced.homePlayerRatings.find(pr => pr.playerId === enhanced.manOfTheMatch);
  const motm = motmPlayer?.playerName || 'Belirlenemedi';

  // Convert stats
  const homeLegacyStats = convertStats(enhanced.homeStats);
  const awayLegacyStats = convertStats(enhanced.awayStats);

  return {
    score: { home: enhanced.homeScore, away: enhanced.awayScore },
    events: legacyEvents,
    playerRatings,
    staminaLoss,
    playerStats,
    stats: {
      home: homeLegacyStats,
      away: awayLegacyStats,
    },
    motm,
    // Pass through extended stats for MatchDay UI
    extendedStats: {
      home: enhanced.homeStats,
      away: enhanced.awayStats,
    },
    weather: enhanced.weather,
    // Referee info for UI display
    refereeName: enhanced.refereeName,
    refereePersonality: enhanced.refereePersonality,
    refereeStrictness: enhanced.refereeStrictness,
    varReviews: enhanced.varReviews,
    goalsOverturned: enhanced.goalsOverturned,
  } as any;
}

// =============================================================================
// Main Simulation Function
// =============================================================================

export async function runUnifiedMatch(
  homeSquad: Player[],
  awaySquad: Player[],
  options: UnifiedMatchOptions
): Promise<MatchResult> {
  if (!homeSquad || homeSquad.length === 0 || !awaySquad || awaySquad.length === 0) {
    throw new Error("Match Engine Error: Home or Away squad is empty.");
  }

  const homeTactic = options.activeTactic;
  const awayTactic: ActiveTactic = {
    ...getDefaultTactic(),
    formation: '4-4-2',
    mentality: 3,
    pressing: false,
    intensity: 'normal',
    aggression: 50,
    width: 50,
    passingIntensity: 50,
    lineHeight: 50,
  };

  // Build referee options for enhanced engine
  const refereeOptions: any = {
    homeTeamName: options.homeTeamName,
    awayTeamName: options.awayTeamName,
  };

  // Pass referee data if available
  if (options.refereeName) refereeOptions.refereeName = options.refereeName;
  if (options.refereePersonality) refereeOptions.refereePersonality = options.refereePersonality;
  if (options.refereeStrictness) refereeOptions.refereeStrictness = options.refereeStrictness;

  // Run the enhanced simulation
  const enhancedResult = simulateEnhancedMatch(
    homeSquad,
    awaySquad,
    homeTactic,
    awayTactic,
    refereeOptions
  );

  // Convert to MatchDay format
  return convertEnhancedToLegacy(enhancedResult, homeSquad, options);
}

// ─── Default ActiveTactic (fallback) ──────────────────────────────────────────
function getDefaultTactic(): ActiveTactic {
  return {
    id: 'default',
    userId: 'system',
    formation: '4-4-2',
    tactic_type: '4-4-2',
    mentality: 3,
    pressing: false,
    intensity: 'normal',
    aggression: 50,
    width: 50,
    passingIntensity: 50,
    lineHeight: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── Export singleton for compatibility ─────────────────────────────────────────
export const unifiedMatchEngine = {
  async runScheduledMatch(
    homeSquad: Player[],
    awaySquad: Player[],
    options: UnifiedMatchOptions
  ): Promise<MatchResult> {
    return runUnifiedMatch(homeSquad, awaySquad, options);
  },
};
