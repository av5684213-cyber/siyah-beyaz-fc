// =============================================================================
// Managerium — Match Simulator Module
// =============================================================================
// Standalone TypeScript match simulator porting the Python match_simulator.py
// logic with Poisson-binomial goal distribution, tactical modifiers, realistic
// minute generation, position-based event weights, and comprehensive event output.
// Pure function — no side effects, no DB calls.
// =============================================================================

import type { Player, SpecificPosition } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

/** Tactical style used by a team during the match */
export type TacticalStyle = 'hücum' | 'defans' | 'kontra' | 'pres' | 'normal';

/** A single match event generated during simulation */
export interface SimulatorMatchEvent {
  minute: number;
  type: 'GOAL' | 'ASSIST' | 'YELLOW' | 'RED' | 'INJURY' | 'SUB' | 'HALFTIME' | 'FULLTIME';
  team: 'HOME' | 'AWAY';
  playerId: string;
  playerName: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  text: string;
  /** For INJURY events — type of injury */
  injuryType?: string;
  /** For INJURY events — duration in days */
  injuryDuration?: number;
  /** For SUB events — player coming on */
  subInPlayerId?: string;
  subInPlayerName?: string;
  /** For RED events — was it a second yellow? */
  isSecondYellow?: boolean;
}

/** Tactical advantage breakdown returned from the simulation */
export interface TacticalAdvantage {
  /** Which team has overall tactical advantage: 'HOME' | 'AWAY' | 'NEUTRAL' */
  advantage: 'HOME' | 'AWAY' | 'NEUTRAL';
  /** Home team area strengths */
  homeDefence: number;
  homeMidfield: number;
  homeAttack: number;
  /** Away team area strengths */
  awayDefence: number;
  awayMidfield: number;
  awayAttack: number;
  /** Formation matchup bonus (positive = home favoured) */
  formationBonus: number;
  /** Positional matchup description */
  matchupSummary: string;
}

/** Configuration passed to the simulateMatch function */
export interface MatchSimulatorConfig {
  /** Home team starting XI (11 players) */
  homeSquad: Player[];
  /** Away team starting XI (11 players) */
  awaySquad: Player[];
  /** Home team substitutes (up to 7) */
  homeSubs?: Player[];
  /** Away team substitutes (up to 7) */
  awaySubs?: Player[];
  /** Home team tactical style */
  homeTactic: TacticalStyle;
  /** Away team tactical style */
  awayTactic: TacticalStyle;
  /** Home team formation string (e.g. '4-4-2', '4-3-3', '3-5-2') */
  homeFormation: string;
  /** Away team formation string */
  awayFormation: string;
  /** Home advantage modifier (default 1.05 = 5%) */
  homeAdvantage?: number;
}

/** Result returned from the simulateMatch function */
export interface MatchSimulatorResult {
  homeScore: number;
  awayScore: number;
  events: SimulatorMatchEvent[];
  tacticalAdvantage: TacticalAdvantage;
  /** Player ID of Man of the Match (home team candidate) */
  motmHome: string;
  /** Player ID of Man of the Match (away team candidate) */
  motmAway: string;
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Position-based goal weight — probability multiplier for a player at that
 * position to be selected as the goal scorer.  Higher = more likely.
 */
const GOAL_WEIGHT: Record<string, number> = {
  ST: 0.35,
  CF: 0.30,
  LW: 0.18,
  RW: 0.18,
  CAM: 0.12,
  LM: 0.08,
  RM: 0.08,
  CM: 0.08,
  CDM: 0.04,
  CB: 0.03,
  LB: 0.03,
  RB: 0.03,
  LWB: 0.04,
  RWB: 0.04,
  GK: 0.00,
};

/**
 * Position-based assist weight — probability multiplier for a player at that
 * position to be selected as the assist provider.
 */
const ASSIST_WEIGHT: Record<string, number> = {
  CAM: 0.25,
  LW: 0.18,
  RW: 0.18,
  CM: 0.15,
  LM: 0.12,
  RM: 0.12,
  CF: 0.10,
  ST: 0.06,
  CDM: 0.06,
  LB: 0.06,
  RB: 0.06,
  LWB: 0.08,
  RWB: 0.08,
  CB: 0.03,
  GK: 0.01,
};

/**
 * Injury type → [minDays, maxDays] duration range.
 * Matches the existing matchConsequencesService.ts mapping.
 */
const INJURY_DURATION_MAP: Record<string, [number, number]> = {
  hamstring: [7, 21],
  ankle: [5, 14],
  knee: [10, 21],
  shoulder: [7, 14],
  back: [5, 14],
  groin: [7, 18],
  calf: [5, 12],
  thigh: [7, 14],
  wrist: [3, 7],
  rib: [3, 10],
  concussion: [7, 14],
  muscle_strain: [5, 14],
  ligament: [10, 21],
  tendinitis: [7, 14],
};

const INJURY_TYPES = Object.keys(INJURY_DURATION_MAP);

/**
 * Tactical style modifiers.
 * Each entry describes how the tactic affects goal probability for and against.
 *
 * Home/away differentiation:
 *   - goalForModHome: own goal probability multiplier when playing at HOME
 *   - goalForModAway: own goal probability multiplier when playing AWAY
 *   - goalForMod: fallback multiplier (used when home/away not differentiated)
 *
 * Spec alignment:
 *   - Hücum (Attack): +12% home goals, +8% away goals
 *   - Defans (Defense): -15% goals conceded, -5% goals scored
 *   - Kontra (Counter): +10% fast attack (counter bonus)
 *   - Pres (Press): +8% ball recovery, +20% condition loss
 *   - Normal: no modifier
 */
interface TacticalModifierDef {
  /** Multiplier applied to own goal probability when playing at HOME */
  goalForModHome: number;
  /** Multiplier applied to own goal probability when playing AWAY */
  goalForModAway: number;
  /** Legacy fallback — multiplier applied to own goal probability (defaults to home) */
  goalForMod: number;
  /** Multiplier applied to opponent goal probability (conceded) */
  goalAgainstMod: number;
  /** Extra condition loss per minute (%) */
  conditionLossMod: number;
  /** Counter-attack bonus (added to expected goals) */
  counterBonus: number;
  /** Ball-winning probability bonus */
  ballWinBonus: number;
  /** Human-readable description */
  description: string;
}

const TACTICAL_MODIFIERS: Record<TacticalStyle, TacticalModifierDef> = {
  hücum: {
    goalForModHome: 1.12,   // +12% goal chance at home
    goalForModAway: 1.08,   // +8% goal chance away
    goalForMod: 1.12,       // fallback = home
    goalAgainstMod: 1.08,   // Concede 8% more (high risk)
    conditionLossMod: 5,
    counterBonus: 0,
    ballWinBonus: 0,
    description: 'Hücum: +12% home / +8% away goals, +8% conceded',
  },
  defans: {
    goalForModHome: 0.95,   // -5% goals scored (home)
    goalForModAway: 0.95,   // -5% goals scored (away)
    goalForMod: 0.95,
    goalAgainstMod: 0.85,   // -15% goals conceded
    conditionLossMod: -5,
    counterBonus: 0,
    ballWinBonus: 0,
    description: 'Defans: -15% conceded, -5% scored',
  },
  kontra: {
    goalForModHome: 1.05,   // +5% goals at home
    goalForModAway: 1.05,   // +5% goals away
    goalForMod: 1.05,
    goalAgainstMod: 0.95,   // -5% conceded
    conditionLossMod: 0,
    counterBonus: 0.10,     // +10% fast attack bonus
    ballWinBonus: 0,
    description: 'Kontra: +10% counter-attack, +5% scored, -5% conceded',
  },
  pres: {
    goalForModHome: 1.05,   // +5% goals at home
    goalForModAway: 1.05,   // +5% goals away
    goalForMod: 1.05,
    goalAgainstMod: 1.0,    // No change in conceded
    conditionLossMod: 20,   // +20% condition loss
    counterBonus: 0,
    ballWinBonus: 0.08,     // +8% ball recovery
    description: 'Pres: +8% ball winning, +20% condition loss, +5% scored',
  },
  normal: {
    goalForModHome: 1.0,
    goalForModAway: 1.0,
    goalForMod: 1.0,
    goalAgainstMod: 1.0,
    conditionLossMod: 0,
    counterBonus: 0,
    ballWinBonus: 0,
    description: 'Normal: No modifier',
  },
};

/**
 * Get the appropriate goal-for modifier for a team based on their tactic
 * and whether they are playing at home or away.
 *
 * @param tactic - The tactical style being used
 * @param isHome - Whether the team is playing at home
 * @returns The goal probability multiplier
 */
export function getGoalForMod(tactic: TacticalStyle, isHome: boolean): number {
  const mod = TACTICAL_MODIFIERS[tactic];
  return isHome ? mod.goalForModHome : mod.goalForModAway;
}

/**
 * Weighted minute distribution for goals.
 * Fewer goals in early minutes, more in 75-90'.
 * Each entry is [minuteRangeStart, minuteRangeEnd, weight].
 */
const MINUTE_WEIGHTS: [number, number, number][] = [
  [1, 15, 0.10],
  [16, 30, 0.18],
  [31, 45, 0.22],
  [46, 60, 0.20],
  [61, 75, 0.22],
  [76, 90, 0.30],
];

/**
 * Rock-paper-scissors formation advantage table.
 * Positive value = first formation has advantage over second.
 * Key format: "A vs B" where A and B are formation strings.
 */
const FORMATION_ADVANTAGE: Record<string, number> = {
  '4-4-2 vs 4-3-3': 0.05,
  '4-3-3 vs 3-5-2': 0.05,
  '3-5-2 vs 4-4-2': 0.05,
  '4-3-3 vs 4-4-2': -0.05,
  '3-5-2 vs 4-3-3': -0.05,
  '4-4-2 vs 3-5-2': -0.05,
};

/** Probability per player per match of receiving a yellow card */
const YELLOW_CARD_PROB = 0.22;
/** Probability per player per match of receiving a red card */
const RED_CARD_PROB = 0.02;
/** Among red cards, probability that it's a second yellow */
const SECOND_YELLOW_PROB = 0.08;
/** Probability per player per match of getting injured */
const INJURY_PROB = 0.05;
/** Probability per goal of having an assist */
const ASSIST_PROB = 0.70;
/** Probability per team of making a substitution */
const SUB_PROB = 0.60;
/** Number of binomial iterations for Poisson-like goal distribution */
const BINOMIAL_ITERATIONS = 6;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Clamp a number between min and max */
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Random integer in [min, max] inclusive */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Get the specific position string, falling back to position group */
function getSpecificPos(p: Player): string {
  return p.specificPosition ?? p.position;
}

/** Get goal weight for a player based on their position */
function getGoalWeight(p: Player): number {
  const pos = getSpecificPos(p);
  return GOAL_WEIGHT[pos] ?? GOAL_WEIGHT[p.position] ?? 0.05;
}

/** Get assist weight for a player based on their position */
function getAssistWeight(p: Player): number {
  const pos = getSpecificPos(p);
  return ASSIST_WEIGHT[pos] ?? ASSIST_WEIGHT[p.position] ?? 0.05;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM STRENGTH CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the overall team strength from a squad of players.
 *
 * Formula: teamStrength = OVR average + morale bonus + condition bonus + tactical modifier
 *
 * Morale bonus: (avgMorale - 50) / 500 → range -0.10 to +0.10 relative to OVR
 * Condition bonus: (avgCond - 50) / 500 → range -0.10 to +0.10 relative to OVR
 *
 * This mirrors the Python form_rating bonus: (form_rating - 50) / 500
 *
 * @param squad - Array of players in the starting XI
 * @param tactic - The tactical style being used
 * @returns An object with overall, attack, midfield, and defence strength values
 */
export function calculateTeamStrength(
  squad: Player[],
  tactic: TacticalStyle
): { overall: number; attack: number; midfield: number; defence: number } {
  if (squad.length === 0) {
    return { overall: 0, attack: 0, midfield: 0, defence: 0 };
  }

  const avgOVR = squad.reduce((s, p) => s + p.rating, 0) / squad.length;
  const avgMorale = squad.reduce((s, p) => s + (p.morale || 50), 0) / squad.length;
  const avgCond = squad.reduce((s, p) => s + (p.cond || 100), 0) / squad.length;

  // Area-specific averages (use specificPosition for better accuracy)
  const forwards = squad.filter(p => ['ST', 'CF', 'LW', 'RW', 'LM', 'RM'].includes(getSpecificPos(p)) || p.position === 'FWD');
  const midfielders = squad.filter(p => ['CAM', 'CM', 'CDM'].includes(getSpecificPos(p)) || p.position === 'MID');
  const defenders = squad.filter(p => ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(getSpecificPos(p)) || p.position === 'DEF');

  const areaAvg = (group: Player[]): number => {
    if (group.length === 0) return avgOVR;
    return group.reduce((s, p) => s + p.rating, 0) / group.length;
  };

  const attack = areaAvg(forwards);
  const midfield = areaAvg(midfielders);
  const defence = areaAvg(defenders);

  // Morale effect: (avgMorale - 50) / 500 → same as Python's (form_rating - 50) / 500
  // Range: morale 0 → -10% effect, morale 100 → +10% effect
  const moraleEffect = (avgMorale - 50) / 500;

  // Condition effect: (avgCond - 50) / 500
  // Range: cond 0 → -10% effect, cond 100 → +10% effect
  const condEffect = (avgCond - 50) / 500;

  // Base strength = OVR * (1 + morale + condition effects)
  const baseStrength = avgOVR * (1 + moraleEffect + condEffect);

  // Tactical modifier — convert goalForMod to a strength bonus
  const tacticMod = TACTICAL_MODIFIERS[tactic];
  const tacticModifier = (tacticMod.goalForMod - 1.0) * 20; // Convert to ~0-5 range bonus

  const overall = baseStrength + tacticModifier;

  return {
    overall,
    attack: attack + tacticModifier * 0.5,
    midfield,
    defence: defence - tacticModifier * 0.3,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TACTICAL ADVANTAGE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the tactical advantage between two teams, considering area strength,
 * positional matchups (winger vs fullback), and formation rock-paper-scissors.
 *
 * @param homeStrength - Home team strength breakdown
 * @param awayStrength - Away team strength breakdown
 * @param homeFormation - Home team formation string (e.g. '4-4-2')
 * @param awayFormation - Away team formation string
 * @param homeSquad - Home team players (for positional analysis)
 * @param awaySquad - Away team players
 * @returns TacticalAdvantage object with detailed breakdown
 */
export function calculateTacticalAdvantage(
  homeStrength: ReturnType<typeof calculateTeamStrength>,
  awayStrength: ReturnType<typeof calculateTeamStrength>,
  homeFormation: string,
  awayFormation: string,
  homeSquad: Player[],
  awaySquad: Player[]
): TacticalAdvantage {
  // 1. Area strength comparison
  const homeAttackVsAwayDef = homeStrength.attack - awayStrength.defence;
  const awayAttackVsHomeDef = awayStrength.attack - homeStrength.defence;
  const midDiff = homeStrength.midfield - awayStrength.midfield;

  // 2. Positional matchups: winger quality vs fullback quality
  const homeWingers = homeSquad.filter(p => ['LW', 'RW', 'LM', 'RM'].includes(getSpecificPos(p)));
  const awayFullbacks = awaySquad.filter(p => ['LB', 'RB', 'LWB', 'RWB'].includes(getSpecificPos(p)));
  const awayWingers = awaySquad.filter(p => ['LW', 'RW', 'LM', 'RM'].includes(getSpecificPos(p)));
  const homeFullbacks = homeSquad.filter(p => ['LB', 'RB', 'LWB', 'RWB'].includes(getSpecificPos(p)));

  const avgRating = (players: Player[]) =>
    players.length > 0 ? players.reduce((s, p) => s + p.rating, 0) / players.length : 50;

  const homeWingerAdv = avgRating(homeWingers) - avgRating(awayFullbacks);
  const awayWingerAdv = avgRating(awayWingers) - avgRating(homeFullbacks);

  // 3. Formation advantage (rock-paper-scissors)
  const formationKey = `${homeFormation} vs ${awayFormation}`;
  const formationBonus = FORMATION_ADVANTAGE[formationKey] ?? 0;

  // 4. Total advantage score (positive = home favoured)
  const totalAdvantage =
    (homeAttackVsAwayDef - awayAttackVsHomeDef) * 0.3 +
    midDiff * 0.2 +
    (homeWingerAdv - awayWingerAdv) * 0.1 +
    formationBonus * 100;

  let advantage: 'HOME' | 'AWAY' | 'NEUTRAL';
  if (totalAdvantage > 3) advantage = 'HOME';
  else if (totalAdvantage < -3) advantage = 'AWAY';
  else advantage = 'NEUTRAL';

  // Build matchup summary
  const lines: string[] = [];
  if (homeAttackVsAwayDef > 5) lines.push('Home attack > Away defence');
  else if (homeAttackVsAwayDef < -5) lines.push('Away defence > Home attack');
  if (awayAttackVsHomeDef > 5) lines.push('Away attack > Home defence');
  else if (awayAttackVsHomeDef < -5) lines.push('Home defence > Away attack');
  if (Math.abs(formationBonus) > 0.01) {
    const favoured = formationBonus > 0 ? 'Home' : 'Away';
    lines.push(`${favoured} formation advantage (${homeFormation} vs ${awayFormation})`);
  }

  return {
    advantage,
    homeDefence: Math.round(homeStrength.defence * 10) / 10,
    homeMidfield: Math.round(homeStrength.midfield * 10) / 10,
    homeAttack: Math.round(homeStrength.attack * 10) / 10,
    awayDefence: Math.round(awayStrength.defence * 10) / 10,
    awayMidfield: Math.round(awayStrength.midfield * 10) / 10,
    awayAttack: Math.round(awayStrength.attack * 10) / 10,
    formationBonus: Math.round(formationBonus * 1000) / 1000,
    matchupSummary: lines.length > 0 ? lines.join('; ') : 'Evenly matched',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOAL DISTRIBUTION (Poisson-like via Binomial)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a Poisson-like goal count using a binomial approach.
 *
 * The Python implementation used 6 iterations with p = expectedGoals/6.
 * This approximates a Poisson distribution with lambda = expectedGoals.
 *
 * @param expectedGoals - The expected number of goals (lambda)
 * @returns A non-negative integer goal count
 */
export function binomialGoals(expectedGoals: number): number {
  const p = clamp(expectedGoals / BINOMIAL_ITERATIONS, 0, 1);
  let goals = 0;
  for (let i = 0; i < BINOMIAL_ITERATIONS; i++) {
    if (Math.random() < p) {
      goals++;
    }
  }
  return goals;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REALISTIC MINUTE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a weighted random minute for a goal event.
 *
 * Distribution: fewer goals in early minutes (1-15), more in 75-90'.
 * First half goals are generated in [1, 45], second half in [46, 90].
 *
 * @param isSecondHalf - If true, generate minute in [46,90]; otherwise [1,45]
 * @returns A minute integer in the appropriate half
 */
export function generateGoalMinute(isSecondHalf: boolean): number {
  const totalWeight = MINUTE_WEIGHTS.reduce((s, w) => s + w[2], 0);
  let r = Math.random() * totalWeight;

  for (const [start, end, weight] of MINUTE_WEIGHTS) {
    r -= weight;
    if (r <= 0) {
      // Filter to correct half
      if (isSecondHalf) {
        const s = Math.max(start, 46);
        const e = Math.max(end, 46);
        if (s > e) continue;
        return randInt(s, e);
      } else {
        const s = Math.min(start, 45);
        const e = Math.min(end, 45);
        if (s > e) continue;
        return randInt(s, e);
      }
    }
  }

  // Fallback
  return isSecondHalf ? randInt(46, 90) : randInt(1, 45);
}

/**
 * Generate a random minute for a non-goal event (card, injury, etc.)
 * Roughly uniform over the 90 minutes, slight bias toward second half.
 *
 * @returns A minute integer in [1, 90]
 */
export function generateEventMinute(): number {
  // Slight second-half bias
  const half = Math.random() < 0.45 ? 'first' : 'second';
  if (half === 'first') return randInt(1, 45);
  return randInt(46, 90);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCORER / ASSISTER SELECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Select a goal scorer from a squad based on position weights.
 *
 * Uses weighted random selection — forwards are much more likely to be
 * selected than defenders or goalkeepers.
 *
 * @param squad - Array of players to choose from
 * @param excludedId - Optional player ID to exclude (e.g. can't assist own goal)
 * @returns The selected player
 */
export function selectScorer(squad: Player[], excludedId?: string): Player {
  const candidates = excludedId ? squad.filter(p => p.id !== excludedId) : squad;
  if (candidates.length === 0) return squad[0];

  const weights = candidates.map(p => getGoalWeight(p));
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  let r = Math.random() * totalWeight;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/**
 * Select an assist provider from a squad based on position weights.
 *
 * @param squad - Array of players to choose from
 * @param scorerId - The goal scorer's ID (excluded from selection)
 * @returns The selected player, or undefined if no assist
 */
export function selectAssister(squad: Player[], scorerId: string): Player | undefined {
  const candidates = squad.filter(p => p.id !== scorerId);
  if (candidates.length === 0) return undefined;

  const weights = candidates.map(p => getAssistWeight(p));
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  let r = Math.random() * totalWeight;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

// ═══════════════════════════════════════════════════════════════════════════════
// INJURY GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a random injury with type and duration.
 *
 * @returns An object with injuryType and durationDays
 */
export function generateInjury(): { injuryType: string; durationDays: number } {
  const injuryType = pick(INJURY_TYPES);
  const [minDays, maxDays] = INJURY_DURATION_MAP[injuryType];
  const durationDays = randInt(minDays, maxDays);
  return { injuryType, durationDays };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOTM CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the Man of the Match for a single team.
 *
 * Points system:
 * - Goal: +3 pts
 * - Assist: +2 pts
 * - Yellow card: -1 pt
 * - Red card: -3 pts
 * - Rating factor: rating / 100 * 2 (bonus for higher rated players)
 *
 * @param squad - The team's players
 * @param events - Match events (to count goals, assists, cards)
 * @param team - 'HOME' or 'AWAY'
 * @returns The player ID of the MOTM
 */
export function calculateMOTM(
  squad: Player[],
  events: SimulatorMatchEvent[],
  team: 'HOME' | 'AWAY'
): string {
  const teamEvents = events.filter(e => e.team === team);
  const points = new Map<string, number>();

  // Initialize all players with rating-based bonus
  for (const p of squad) {
    points.set(p.id, (p.rating / 100) * 2);
  }

  // Accumulate event-based points
  for (const e of teamEvents) {
    const current = points.get(e.playerId) ?? 0;
    switch (e.type) {
      case 'GOAL':
        points.set(e.playerId, current + 3);
        break;
      case 'ASSIST':
        points.set(e.playerId, current + 2);
        break;
      case 'YELLOW':
        points.set(e.playerId, current - 1);
        break;
      case 'RED':
        points.set(e.playerId, current - 3);
        break;
    }

    // Also credit assist points via GOAL events that carry assistPlayerId
    if (e.type === 'GOAL' && e.assistPlayerId) {
      const assistCurrent = points.get(e.assistPlayerId) ?? 0;
      points.set(e.assistPlayerId, assistCurrent + 2);
    }
  }

  // Find the player with the highest points
  let bestId = squad[0]?.id ?? '';
  let bestPoints = -Infinity;
  const allIds = Array.from(points.keys());
  for (let i = 0; i < allIds.length; i++) {
    const id = allIds[i];
    const pts = points.get(id)!;
    if (pts > bestPoints) {
      bestPoints = pts;
      bestId = id;
    }
  }

  return bestId;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPECTED GOALS CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate expected goals for a team based on team strength, tactical
 * modifiers, home advantage, and opponent defensive strength.
 *
 * @param ownStrength - This team's overall strength
 * @param opponentDefence - Opponent's defensive strength
 * @param tactic - This team's tactical style
 * @param opponentTactic - Opponent's tactical style
 * @param isHome - Whether this team is playing at home
 * @param homeAdvantage - Home advantage multiplier (default 1.05)
 * @returns Expected goals (floating point, typically 0.5 - 3.5)
 */
export function calculateExpectedGoals(
  ownStrength: number,
  opponentDefence: number,
  tactic: TacticalStyle,
  opponentTactic: TacticalStyle,
  isHome: boolean,
  homeAdvantage: number = 1.05
): number {
  // Base expected goals: ratio of own attack to total (scaled)
  const strengthRatio = ownStrength / (ownStrength + opponentDefence);
  let xG = 0.5 + strengthRatio * 2.5; // Range roughly 0.5 - 3.0

  // Home advantage (5% base, adjustable via parameter)
  if (isHome) {
    xG *= homeAdvantage;
  }

  // Own tactic modifier — use home/away differentiated values
  // Spec: Hücum gives +12% at home, +8% away
  xG *= getGoalForMod(tactic, isHome);

  // Opponent tactic modifier (their goalAgainstMod affects our xG inversely)
  // If opponent plays defans, their goalAgainstMod = 0.85, meaning we score less
  xG *= TACTICAL_MODIFIERS[opponentTactic].goalAgainstMod;

  // Counter bonus (flat addition to xG — represents quick transition chances)
  if (TACTICAL_MODIFIERS[tactic].counterBonus > 0) {
    xG += TACTICAL_MODIFIERS[tactic].counterBonus;
  }

  // Press ball-winning bonus (slightly increases xG through possession dominance)
  if (TACTICAL_MODIFIERS[tactic].ballWinBonus > 0) {
    xG += TACTICAL_MODIFIERS[tactic].ballWinBonus * 0.5;
  }

  // Clamp to reasonable range
  return clamp(xG, 0.2, 5.0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SIMULATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simulate a complete football match between two teams.
 *
 * This is a pure function — no side effects, no DB calls. All randomness
 * comes from Math.random(). The caller (typically a cron route) is
 * responsible for persisting results.
 *
 * @param config - Match configuration including squads, tactics, and formations
 * @returns MatchSimulatorResult with score, events, stats, and MOTM
 */
export function simulateMatch(config: MatchSimulatorConfig): MatchSimulatorResult {
  const {
    homeSquad,
    awaySquad,
    homeSubs = [],
    awaySubs = [],
    homeTactic,
    awayTactic,
    homeFormation,
    awayFormation,
    homeAdvantage = 1.05,
  } = config;

  const events: SimulatorMatchEvent[] = [];

  // ── Step 1: Calculate team strengths ──────────────────────────────────────
  const homeStrength = calculateTeamStrength(homeSquad, homeTactic);
  const awayStrength = calculateTeamStrength(awaySquad, awayTactic);

  // ── Step 2: Calculate tactical advantage ──────────────────────────────────
  const tacticalAdvantage = calculateTacticalAdvantage(
    homeStrength,
    awayStrength,
    homeFormation,
    awayFormation,
    homeSquad,
    awaySquad
  );

  // Apply formation bonus to strengths for xG calculation
  const adjustedHomeStrength = homeStrength.overall + tacticalAdvantage.formationBonus * 50;
  const adjustedAwayStrength = awayStrength.overall - tacticalAdvantage.formationBonus * 50;

  // ── Step 3: Calculate expected goals ──────────────────────────────────────
  const homeXG = calculateExpectedGoals(
    adjustedHomeStrength,
    awayStrength.defence,
    homeTactic,
    awayTactic,
    true,
    homeAdvantage
  );
  const awayXG = calculateExpectedGoals(
    adjustedAwayStrength,
    homeStrength.defence,
    awayTactic,
    homeTactic,
    false,
    homeAdvantage
  );

  // ── Step 4: Generate goal counts (Poisson-like via binomial) ──────────────
  const homeGoalCount = binomialGoals(homeXG);
  const awayGoalCount = binomialGoals(awayXG);

  // ── Step 5: Generate goal minutes ─────────────────────────────────────────
  const homeGoalMinutes: number[] = [];
  const awayGoalMinutes: number[] = [];

  for (let i = 0; i < homeGoalCount; i++) {
    const isSecondHalf = i >= Math.ceil(homeGoalCount / 2);
    homeGoalMinutes.push(generateGoalMinute(isSecondHalf));
  }
  for (let i = 0; i < awayGoalCount; i++) {
    const isSecondHalf = i >= Math.ceil(awayGoalCount / 2);
    awayGoalMinutes.push(generateGoalMinute(isSecondHalf));
  }

  // Sort goals by minute
  homeGoalMinutes.sort((a, b) => a - b);
  awayGoalMinutes.sort((a, b) => a - b);

  // ── Step 6: Generate goal + assist events ─────────────────────────────────
  for (const min of homeGoalMinutes) {
    const scorer = selectScorer(homeSquad);
    const hasAssist = Math.random() < ASSIST_PROB;
    const assister = hasAssist ? selectAssister(homeSquad, scorer.id) : undefined;

    // Goal event
    events.push({
      minute: min,
      type: 'GOAL',
      team: 'HOME',
      playerId: scorer.id,
      playerName: scorer.name,
      assistPlayerId: assister?.id,
      assistPlayerName: assister?.name,
      text: assister
        ? `Dk ${min}: GOL! ${scorer.name} (${assister.name} asistiyle) ağları havalandırıyor!`
        : `Dk ${min}: GOL! ${scorer.name} harika bir bireysel çabayla skoru değiştiriyor!`,
    });

    // Separate ASSIST event (for easier stat tracking)
    if (assister) {
      events.push({
        minute: min,
        type: 'ASSIST',
        team: 'HOME',
        playerId: assister.id,
        playerName: assister.name,
        assistPlayerId: scorer.id,
        assistPlayerName: scorer.name,
        text: `Dk ${min}: Asist: ${assister.name} → ${scorer.name}`,
      });
    }
  }

  for (const min of awayGoalMinutes) {
    const scorer = selectScorer(awaySquad);
    const hasAssist = Math.random() < ASSIST_PROB;
    const assister = hasAssist ? selectAssister(awaySquad, scorer.id) : undefined;

    events.push({
      minute: min,
      type: 'GOAL',
      team: 'AWAY',
      playerId: scorer.id,
      playerName: scorer.name,
      assistPlayerId: assister?.id,
      assistPlayerName: assister?.name,
      text: assister
        ? `Dk ${min}: GOL! ${scorer.name} (${assister.name} asistiyle) rakibi üzdü!`
        : `Dk ${min}: GOL! Rakip ${scorer.name} gole denk geldi!`,
    });

    if (assister) {
      events.push({
        minute: min,
        type: 'ASSIST',
        team: 'AWAY',
        playerId: assister.id,
        playerName: assister.name,
        assistPlayerId: scorer.id,
        assistPlayerName: scorer.name,
        text: `Dk ${min}: Asist: ${assister.name} → ${scorer.name}`,
      });
    }
  }

  // ── Step 7: Generate card events ──────────────────────────────────────────
  const generateCards = (squad: Player[], team: 'HOME' | 'AWAY') => {
    for (const p of squad) {
      // Yellow card
      if (Math.random() < YELLOW_CARD_PROB) {
        const isSecondYellow = Math.random() < SECOND_YELLOW_PROB;
        events.push({
          minute: generateEventMinute(),
          type: 'YELLOW',
          team,
          playerId: p.id,
          playerName: p.name,
          text: `Dk: ${p.name} sarı kart gördü!`,
          isSecondYellow: false,
        });

        // Second yellow → red
        if (isSecondYellow) {
          events.push({
            minute: generateEventMinute(),
            type: 'RED',
            team,
            playerId: p.id,
            playerName: p.name,
            text: `Dk: ${p.name} ikinci sarıdan kırmızı kart gördü!`,
            isSecondYellow: true,
          });
        }
      }

      // Direct red card
      if (Math.random() < RED_CARD_PROB) {
        events.push({
          minute: generateEventMinute(),
          type: 'RED',
          team,
          playerId: p.id,
          playerName: p.name,
          text: `Dk: ${p.name} doğrudan kırmızı kart gördü!`,
          isSecondYellow: false,
        });
      }
    }
  };

  generateCards(homeSquad, 'HOME');
  generateCards(awaySquad, 'AWAY');

  // ── Step 8: Generate injury events ────────────────────────────────────────
  const generateInjuries = (squad: Player[], team: 'HOME' | 'AWAY') => {
    for (const p of squad) {
      if (Math.random() < INJURY_PROB) {
        const { injuryType, durationDays } = generateInjury();
        events.push({
          minute: generateEventMinute(),
          type: 'INJURY',
          team,
          playerId: p.id,
          playerName: p.name,
          text: `Dk: ${p.name} sakatlandı! (${injuryType}, ${durationDays} gün)`,
          injuryType,
          injuryDuration: durationDays,
        });
      }
    }
  };

  generateInjuries(homeSquad, 'HOME');
  generateInjuries(awaySquad, 'AWAY');

  // ── Step 9: Generate substitution events ──────────────────────────────────
  const generateSubstitutions = (
    squad: Player[],
    subs: Player[],
    team: 'HOME' | 'AWAY'
  ) => {
    if (subs.length === 0) return;
    if (Math.random() < SUB_PROB) {
      // Determine number of subs (1-3, limited by available subs)
      const maxSubs = Math.min(3, subs.length);
      const numSubs = randInt(1, maxSubs);

      for (let i = 0; i < numSubs; i++) {
        const outPlayer = squad[Math.floor(Math.random() * squad.length)];
        const inPlayer = subs[i];
        if (!inPlayer) break;

        const subMinute = randInt(46, 85); // Subs typically happen 46-85'
        events.push({
          minute: subMinute,
          type: 'SUB',
          team,
          playerId: outPlayer.id,
          playerName: outPlayer.name,
          subInPlayerId: inPlayer.id,
          subInPlayerName: inPlayer.name,
          text: `Dk ${subMinute}: Değişiklik! ${outPlayer.name} çıkıyor, ${inPlayer.name} giriyor.`,
        });
      }
    }
  };

  generateSubstitutions(homeSquad, homeSubs, 'HOME');
  generateSubstitutions(awaySquad, awaySubs, 'AWAY');

  // ── Step 10: Add halftime and fulltime events ─────────────────────────────
  events.push({
    minute: 45,
    type: 'HALFTIME',
    team: 'HOME',
    playerId: '',
    playerName: '',
    text: 'İlk yarı sona erdi.',
  });

  events.push({
    minute: 90,
    type: 'FULLTIME',
    team: 'HOME',
    playerId: '',
    playerName: '',
    text: 'Maç sona erdi!',
  });

  // ── Step 11: Sort all events by minute ────────────────────────────────────
  events.sort((a, b) => a.minute - b.minute);

  // ── Step 12: Calculate possession ─────────────────────────────────────────
  // Possession based on strength ratio
  const totalStrength = homeStrength.overall + awayStrength.overall;
  const homePossession = Math.round((homeStrength.overall / totalStrength) * 100);
  const awayPossession = 100 - homePossession;

  // ── Step 13: Calculate shots ──────────────────────────────────────────────
  // Shots are proportional to xG with some randomness
  const homeShots = Math.max(homeGoalCount + 2, Math.round(homeXG * 3 + randInt(0, 4)));
  const awayShots = Math.max(awayGoalCount + 2, Math.round(awayXG * 3 + randInt(0, 4)));
  const homeShotsOnTarget = homeGoalCount + randInt(0, Math.max(1, homeShots - homeGoalCount - 1));
  const awayShotsOnTarget = awayGoalCount + randInt(0, Math.max(1, awayShots - awayGoalCount - 1));

  // ── Step 14: Calculate MOTM ───────────────────────────────────────────────
  const motmHome = calculateMOTM(homeSquad, events, 'HOME');
  const motmAway = calculateMOTM(awaySquad, events, 'AWAY');

  // ── Return final result ───────────────────────────────────────────────────
  return {
    homeScore: homeGoalCount,
    awayScore: awayGoalCount,
    events,
    tacticalAdvantage,
    motmHome,
    motmAway,
    homePossession,
    awayPossession,
    homeShots,
    awayShots,
    homeShotsOnTarget: Math.min(homeShotsOnTarget, homeShots),
    awayShotsOnTarget: Math.min(awayShotsOnTarget, awayShots),
  };
}
