// ════════════════════════════════════════════════════════════════
//  CUP / TOURNAMENT SYSTEM  –  Managerium FM Engine
//  Kupa turnuva yönetimi, kura çekimi, simülasyon, braket
// ════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────
//  1. TYPES
// ──────────────────────────────────────────────────────────────

export type CupType = 'domestic_cup' | 'super_cup' | 'continental' | 'youth_cup';

export type RoundType =
  | 'round_of_64'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'final';

export type LegType = 'single' | 'two';

export type MatchStatus = 'scheduled' | 'played' | 'extra_time' | 'penalties';

export type VenueType = 'neutral' | 'home' | 'away';

// ──────────────────────────────────────────────────────────────
//  2. INTERFACES
// ──────────────────────────────────────────────────────────────

export interface CupMatch {
  id: string;
  round: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  homeExtraTime: number | null;
  awayExtraTime: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
  date: string;
  status: MatchStatus;
  venue: VenueType;
  hasReplay: boolean;
}

export interface CupRound {
  roundNumber: number;
  name: string;
  roundType: RoundType;
  legs: LegType;
  matches: CupMatch[];
  isCompleted: boolean;
  startDate: string;
  endDate: string;
}

export interface CupParticipant {
  name: string;
  eliminated: boolean;
  eliminatedRound: number;
}

export interface CupSeason {
  id: string;
  cupId: string;
  year: number;
  name: string;
  type: CupType;
  rounds: CupRound[];
  currentRound: number;
  participants: CupParticipant[];
  winner: string | null;
  runnerUp: string | null;
  topScorer: { name: string; goals: number } | null;
  isCompleted: boolean;
  prizeMoney: number;
  championReward: number;
}

export interface CupRoundDefinition {
  name: string;
  teams: number;
  twoLegged: boolean;
}

export interface CupDefinition {
  id: string;
  name: string;
  nameEn: string;
  type: CupType;
  tier: number;
  teamsPerSeason: number;
  rounds: CupRoundDefinition[];
  prizeMoney: number;
  championReward: number;
  isNeutralVenue: boolean;
}

export interface TeamSeedInfo {
  name: string;
  tier: number;
  leaguePosition: number;
}

export interface SimPlayer {
  name: string;
  rating: number;
}

export interface CupNews {
  id: string;
  headline: string;
  body: string;
  date: string;
  type: 'result' | 'upset' | 'draw' | 'penalty_drama' | 'advance' | 'winner' | 'upcoming';
  importance: 'low' | 'medium' | 'high' | 'critical';
  teams: string[];
}

export interface BracketMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  homeExtraTime: number | null;
  awayExtraTime: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
  winner: string | null;
}

export interface BracketRound {
  name: string;
  roundNumber: number;
  matches: BracketMatch[];
}

export interface CupBracket {
  cupId: string;
  cupName: string;
  year: number;
  rounds: BracketRound[];
}

export interface CupScheduleEntry {
  match: CupMatch;
  roundName: string;
  roundNumber: number;
  daysUntilMatch: number;
}

export interface CupStandingEntry {
  name: string;
  roundReached: number;
  roundName: string;
  status: 'active' | 'eliminated';
}

export interface CupRevenue {
  teamName: string;
  cupName: string;
  roundPrizes: { round: number; roundName: string; amount: number }[];
  gateReceipts: number;
  total: number;
}

// ──────────────────────────────────────────────────────────────
//  3. HELPERS
// ──────────────────────────────────────────────────────────────

let _idCounter = 0;

function uid(prefix = 'cup'): string {
  _idCounter += 1;
  return `${prefix}_${_idCounter}_${Date.now().toString(36)}`;
}

/** Fisher-Yates shuffle (pure) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Clamp a number to [min, max] */
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Format a Date as YYYY-MM-DD */
function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Find next Saturday from a given date (or today) */
function nextSaturday(from?: Date): Date {
  const d = from ? new Date(from) : new Date();
  const day = d.getDay();
  const diff = day === 6 ? 7 : ((6 - day + 7) % 7);
  d.setDate(d.getDate() + diff);
  d.setHours(20, 0, 0, 0);
  return d;
}

/** Find next Wednesday from a given date */
function nextWednesday(from?: Date): Date {
  const d = from ? new Date(from) : new Date();
  const day = d.getDay();
  const diff = day === 3 ? 7 : ((3 - day + 7) % 7);
  d.setDate(d.getDate() + diff);
  d.setHours(20, 0, 0, 0);
  return d;
}

/** Poisson-distributed random integer */
function poissonRandom(lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k += 1;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

/** Derive a seed rank (1 = strongest) from tier & league position */
function deriveSeed(tier: number, leaguePosition: number): number {
  return (tier - 1) * 20 + leaguePosition;
}

/** Calculate seed bucket (1-4) from seed rank */
function seedBucket(seed: number): number {
  if (seed <= 8) return 1;
  if (seed <= 24) return 2;
  if (seed <= 48) return 3;
  return 4;
}

/** Turkish ordinal suffix for round names */
function turkishRoundOrdinal(n: number): string {
  const suffixes: Record<number, string> = {
    1: 'Birinci', 2: 'İkinci', 3: 'Üçüncü', 4: 'Dördüncü',
    5: 'Beşinci', 6: 'Altıncı', 7: 'Yedinci', 8: 'Sekizinci',
  };
  return suffixes[n] || `${n}.`;
}

/** Check whether two teams are from the same league tier */
function sameTier(
  a: string, b: string,
  seedMap: Map<string, TeamSeedInfo>,
): boolean {
  const sa = seedMap.get(a);
  const sb = seedMap.get(b);
  if (!sa || !sb) return false;
  return sa.tier === sb.tier;
}

// ──────────────────────────────────────────────────────────────
//  4. CUP DEFINITIONS
// ──────────────────────────────────────────────────────────────

/**
 * Round layout explanation for Türkiye Kupası (staggered entry):
 *   1. Tur       – 32 lower-tier teams play          → 16 winners
 *   2. Tur       – 16 winners + 16 tier-3 teams      → 16 winners
 *   3. Tur       – 16 winners + 16 tier-2 teams      → 16 winners
 *   Son 16       – 16 winners from 3. Tur            → 8 winners
 *   Çeyrek Final – 8 teams                           → 4 winners
 *   Yarı Final   – 4 teams                           → 2 winners
 *   Final        – 2 teams                           → 1 champion
 *
 *   Total unique teams = 32 + 16 + 16 = 64
 */
export const CUP_DEFINITIONS: CupDefinition[] = [
  // ── Türkiye Kupası ──────────────────────────────────────────
  {
    id: 'turkiye_kupasi',
    name: 'Türkiye Kupası',
    nameEn: 'Turkish Cup',
    type: 'domestic_cup',
    tier: 4,
    teamsPerSeason: 64,
    rounds: [
      { name: '1. Tur',       teams: 32, twoLegged: false },
      { name: '2. Tur',       teams: 32, twoLegged: false },
      { name: '3. Tur',       teams: 32, twoLegged: false },
      { name: 'Son 16',       teams: 16, twoLegged: false },
      { name: 'Çeyrek Final', teams: 8,  twoLegged: false },
      { name: 'Yarı Final',   teams: 4,  twoLegged: false },
      { name: 'Final',        teams: 2,  twoLegged: false },
    ],
    prizeMoney: 1_000_000,
    championReward: 10_000_000,
    isNeutralVenue: true,
  },

  // ── Süper Kupa ──────────────────────────────────────────────
  {
    id: 'super_kupa',
    name: 'Süper Kupa',
    nameEn: 'Super Cup',
    type: 'super_cup',
    tier: 1,
    teamsPerSeason: 2,
    rounds: [
      { name: 'Süper Kupa', teams: 2, twoLegged: false },
    ],
    prizeMoney: 0,
    championReward: 2_000_000,
    isNeutralVenue: true,
  },

  // ── Gençlik Kupası ──────────────────────────────────────────
  {
    id: 'genclik_kupasi',
    name: 'Gençlik Kupası',
    nameEn: 'Youth Cup',
    type: 'youth_cup',
    tier: 1,
    teamsPerSeason: 16,
    rounds: [
      { name: 'Son 16',       teams: 16, twoLegged: false },
      { name: 'Çeyrek Final', teams: 8,  twoLegged: false },
      { name: 'Yarı Final',   teams: 4,  twoLegged: false },
      { name: 'Final',        teams: 2,  twoLegged: false },
    ],
    prizeMoney: 100_000,
    championReward: 500_000,
    isNeutralVenue: false,
  },
];

// ──────────────────────────────────────────────────────────────
//  5. MAP round definition names → RoundType
// ──────────────────────────────────────────────────────────────

function roundTypeFromName(name: string, roundNumber: number, totalRounds: number): RoundType {
  const lower = name.toLowerCase().replace(/\s/g, '');
  if (lower.includes('final') && roundNumber === totalRounds) return 'final';
  if (lower.includes('yarı') || lower.includes('yari') || lower === 'semifinal') return 'semi_final';
  if (lower.includes('çeyrek') || lower.includes('ceyrek') || lower === 'quarterfinal') return 'quarter_final';
  if (lower.includes('son16') || lower.includes('16')) return 'round_of_16';
  if (lower.includes('son32') || lower.includes('32')) return 'round_of_32';
  if (lower.includes('son64') || lower.includes('64')) return 'round_of_64';
  // Fallback: infer from round position
  const remaining = totalRounds - roundNumber + 1;
  if (remaining === 1) return 'final';
  if (remaining === 2) return 'semi_final';
  if (remaining === 3) return 'quarter_final';
  if (remaining === 4) return 'round_of_16';
  if (remaining === 5) return 'round_of_32';
  return 'round_of_64';
}

// ──────────────────────────────────────────────────────────────
//  6. GENERATE CUP DRAW
// ──────────────────────────────────────────────────────────────

/**
 * Generate a full cup draw from a list of team names.
 *
 * Staggered entry: lower-tier teams enter in earlier rounds,
 * higher-tier teams receive byes to later rounds.
 *
 * Seeding: teams are sorted by (tier, leaguePosition).  Pairs from
 * different tiers are preferred until the quarter-final round.
 */
export function generateCupDraw(
  teams: string[],
  cupDefinition: CupDefinition,
  teamSeeds?: TeamSeedInfo[],
  seasonYear?: number,
  baseDate?: string,
): CupSeason {
  const year = seasonYear ?? new Date().getFullYear();
  const totalRounds = cupDefinition.rounds.length;

  // Build seed map (default: all tier 4, random position)
  const seedMap = new Map<string, TeamSeedInfo>();
  if (teamSeeds) {
    for (const ts of teamSeeds) seedMap.set(ts.name, ts);
  } else {
    const shuffled = shuffle(teams.map((_, i) => i));
    for (let i = 0; i < teams.length; i++) {
      seedMap.set(teams[i], { name: teams[i], tier: 4, leaguePosition: shuffled[i] + 1 });
    }
  }

  // Sort teams by seed rank (strongest = tier-1 pos-1 first)
  const sorted = [...teams].sort((a, b) => {
    const sa = seedMap.get(a) ?? { tier: 4, leaguePosition: 99 };
    const sb = seedMap.get(b) ?? { tier: 4, leaguePosition: 99 };
    const ra = deriveSeed(sa.tier, sa.leaguePosition);
    const rb = deriveSeed(sb.tier, sb.leaguePosition);
    return ra - rb;
  });

  // ── Staggered entry allocation ──
  // Determine how many NEW teams enter at each round.
  // Round 0 is the first defined round.
  // Total new teams across all rounds must equal `teams.length`.
  const entryAlloc = computeEntryAllocation(cupDefinition, teams.length);

  const rounds: CupRound[] = [];
  let carryOver: string[] = [];
  let assigned = new Set<string>();
  let nextEntryIdx = 0; // index into `sorted`

  const base = baseDate ? new Date(baseDate) : new Date(year, 7, 1); // August 1

  for (let ri = 0; ri < totalRounds; ri++) {
    const rd = cupDefinition.rounds[ri];
    const newEntryCount = entryAlloc[ri] ?? 0;

    // Collect new entrants for this round
    const newEntrants: string[] = [];
    for (let i = 0; i < newEntryCount && nextEntryIdx < sorted.length; i++) {
      newEntrants.push(sorted[nextEntryIdx]);
      assigned.add(sorted[nextEntryIdx]);
      nextEntryIdx += 1;
    }

    const pool = [...carryOver, ...newEntrants];
    const isQuarterFinalOrLater =
      rd.teams <= 8 ||
      rd.name.toLowerCase().includes('çeyrek') ||
      rd.name.toLowerCase().includes('ceyrek') ||
      rd.name.toLowerCase().includes('yarı') ||
      rd.name.toLowerCase().includes('yari') ||
      rd.name.toLowerCase().includes('final');

    // Pair up teams
    const shuffledPool = isQuarterFinalOrLater ? shuffle(pool) : seededShuffle(pool, seedMap, isQuarterFinalOrLater);

    const matches: CupMatch[] = [];
    const roundDate = findRoundDate(base, ri, cupDefinition.type);

    for (let mi = 0; mi < shuffledPool.length; mi += 2) {
      const home = shuffledPool[mi];
      const away = shuffledPool[mi + 1];
      if (!away) continue; // odd team (bye) – advance directly

      matches.push({
        id: uid('match'),
        round: ri + 1,
        homeTeam: home,
        awayTeam: away,
        homeScore: null,
        awayScore: null,
        homeExtraTime: null,
        awayExtraTime: null,
        homePenalties: null,
        awayPenalties: null,
        date: fmtDate(roundDate),
        status: 'scheduled',
        venue: cupDefinition.isNeutralVenue ? 'neutral' : 'home',
        hasReplay: false,
      });
    }

    // If odd number → one team gets a bye
    let byeTeam: string | null = null;
    if (shuffledPool.length % 2 === 1) {
      byeTeam = shuffledPool[shuffledPool.length - 1];
    }

    const roundEndDate = new Date(roundDate);
    roundEndDate.setDate(roundEndDate.getDate() + (rd.twoLegged ? 7 : 0));

    rounds.push({
      roundNumber: ri + 1,
      name: rd.name,
      roundType: roundTypeFromName(rd.name, ri + 1, totalRounds),
      legs: rd.twoLegged ? 'two' : 'single',
      matches,
      isCompleted: false,
      startDate: fmtDate(roundDate),
      endDate: fmtDate(roundEndDate),
    });

    // Carry-over for next round: bye team (if any) + placeholders for winners
    carryOver = byeTeam ? [byeTeam] : [];
  }

  // ── Build participants ──
  const participants: CupParticipant[] = teams.map(t => ({
    name: t,
    eliminated: false,
    eliminatedRound: 0,
  }));

  return {
    id: uid('season'),
    cupId: cupDefinition.id,
    year,
    name: cupDefinition.name,
    type: cupDefinition.type,
    rounds,
    currentRound: 1,
    participants,
    winner: null,
    runnerUp: null,
    topScorer: null,
    isCompleted: false,
    prizeMoney: cupDefinition.prizeMoney,
    championReward: cupDefinition.championReward,
  };
}

/** Compute how many new teams enter at each round */
function computeEntryAllocation(def: CupDefinition, totalTeams: number): number[] {
  const n = def.rounds.length;
  const alloc: number[] = new Array(n).fill(0);

  if (totalTeams <= def.rounds[0].teams) {
    // All teams enter in round 1
    alloc[0] = totalTeams;
    return alloc;
  }

  // For staggered entry: fill from last round backwards
  // The last round takes exactly `teams` from previous winners
  // We need to ensure the number of teams entering per round makes
  // the elimination math work (each round halves its participants).
  //
  // Simplified: distribute proportionally so early rounds get more
  // lower-tier teams and later rounds get higher-tier teams.

  const lastRoundTeams = def.rounds[n - 1].teams;
  // Work backwards to figure out required winners cascade
  let requiredFromPrevious = lastRoundTeams;

  for (let i = n - 2; i >= 0; i--) {
    const roundTeams = def.rounds[i].teams;
    const winnersFromThisRound = roundTeams / 2;
    // The next round needs `def.rounds[i+1].teams` teams
    const nextNeeds = def.rounds[i + 1].teams;
    // new entrants at round i+1 = nextNeeds - winnersFromThisRound
    const newAtNext = nextNeeds - winnersFromThisRound;
    alloc[i + 1] = Math.max(0, newAtNext);
    requiredFromPrevious = roundTeams;
  }

  // Round 0 gets the remainder
  const allocated = alloc.reduce((s, v) => s + v, 0);
  alloc[0] = totalTeams - allocated;

  // Safety: ensure all numbers are non-negative
  for (let i = 0; i < n; i++) alloc[i] = Math.max(0, alloc[i]);

  // If there's still unallocated due to rounding, dump into round 0
  const sum = alloc.reduce((s, v) => s + v, 0);
  if (sum < totalTeams) alloc[0] += totalTeams - sum;

  return alloc;
}

/** Shuffle pool trying to avoid same-tier matchups before quarter-finals */
function seededShuffle(
  pool: string[],
  seedMap: Map<string, TeamSeedInfo>,
  allowSameTier: boolean,
): string[] {
  if (allowSameTier || pool.length <= 2) return shuffle(pool);

  // Sort by seed bucket so different tiers are interleaved
  const buckets = new Map<number, string[]>();
  for (const t of pool) {
    const info = seedMap.get(t) ?? { tier: 4, leaguePosition: 99 };
    const bucket = seedBucket(deriveSeed(info.tier, info.leaguePosition));
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket)!.push(t);
  }

  // Shuffle within each bucket
  buckets.forEach((arr) => {
    const s = shuffle(arr);
    arr.length = 0;
    arr.push(...s);
  });

  // Interleave: pick from buckets in round-robin
  const result: string[] = [];
  const bucketKeys = Array.from(buckets.keys()).sort((a, b) => a - b);
  let idx = 0;
  while (result.length < pool.length) {
    const key = bucketKeys[idx % bucketKeys.length];
    const arr = buckets.get(key)!;
    if (arr.length > 0) {
      result.push(arr.shift()!);
    }
    idx += 1;
    // Remove empty buckets
    if (arr.length === 0) {
      buckets.delete(key);
      const bi = bucketKeys.indexOf(key);
      if (bi !== -1) bucketKeys.splice(bi, 1);
    }
  }

  // Post-process: swap any adjacent same-tier pairs if possible
  for (let i = 0; i < result.length - 1; i += 2) {
    const a = result[i];
    const b = result[i + 1];
    if (sameTier(a, b, seedMap)) {
      // Try to swap b with next available different-tier team
      for (let j = i + 2; j < result.length; j++) {
        if (!sameTier(a, result[j], seedMap)) {
          [result[i + 1], result[j]] = [result[j], result[i + 1]];
          break;
        }
      }
    }
  }

  return result;
}

/** Find an appropriate date for a cup round */
function findRoundDate(base: Date, roundIndex: number, cupType: CupType): Date {
  // Weekend for domestic/youth cups, can be midweek for later rounds
  const weekOffset = roundIndex * 2; // 2 weeks between rounds
  const d = new Date(base);
  d.setDate(d.getDate() + weekOffset * 7);

  if (cupType === 'super_cup') {
    // Super Cup is typically early August (next Saturday)
    return nextSaturday(d);
  }

  // Alternate: even rounds on Saturday, odd rounds on Wednesday
  if (roundIndex % 2 === 0) {
    return nextSaturday(d);
  } else {
    return nextWednesday(d);
  }
}

// ──────────────────────────────────────────────────────────────
//  7. SIMULATE CUP MATCH
// ──────────────────────────────────────────────────────────────

/**
 * Simulate a single cup match.
 *
 * `isNeutral` controls home advantage — when true both teams get a
 * slight downgrade (no home boost).  Set to false when the venue
 * is a team's home ground.
 *
 * Extra time (2 × 15 min simulated as 30 min block) if draw.
 * Penalties (best-of-5 + sudden death) if still draw.
 */
export function simulateCupMatch(
  homeTeam: string,
  awayTeam: string,
  homePlayers: SimPlayer[],
  awayPlayers: SimPlayer[],
  options?: {
    date?: string;
    venue?: VenueType;
    round?: number;
    isNeutral?: boolean;
  },
): CupMatch {
  const {
    date = fmtDate(new Date()),
    venue = 'neutral',
    round = 1,
    isNeutral = true,
  } = options ?? {};

  // Team strength: average player rating
  const homeStrength = avgRating(homePlayers);
  const awayStrength = avgRating(awayPlayers);

  // Venue modifier: neutral → no home advantage, home → small boost
  let homeAdv = 0;
  if (!isNeutral && venue === 'home') homeAdv = 2;
  if (!isNeutral && venue === 'away') homeAdv = -2;

  // ── Regular time (90 minutes) ──
  const homeExpected = Math.max(0.3, (homeStrength + homeAdv) / 32);
  const awayExpected = Math.max(0.3, awayStrength / 32);

  const homeScore = poissonRandom(homeExpected);
  const awayScore = poissonRandom(awayExpected);

  // ── Check if draw → extra time ──
  if (homeScore === awayScore) {
    // Extra time: slightly lower expected goals (fatigue)
    const homeET = poissonRandom(homeExpected * 0.6);
    const awayET = poissonRandom(awayExpected * 0.6);

    const homeTotal = homeScore + homeET;
    const awayTotal = awayScore + awayET;

    if (homeTotal !== awayTotal) {
      return {
        id: uid('match'),
        round,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        homeExtraTime: homeET,
        awayExtraTime: awayET,
        homePenalties: null,
        awayPenalties: null,
        date,
        status: 'extra_time',
        venue,
        hasReplay: false,
      };
    }

    // Still draw → penalties
    const pens = simulatePenalties();

    return {
      id: uid('match'),
      round,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      homeExtraTime: homeET,
      awayExtraTime: awayET,
      homePenalties: pens.home,
      awayPenalties: pens.away,
      date,
      status: 'penalties',
      venue,
      hasReplay: false,
    };
  }

  // ── Normal result ──
  return {
    id: uid('match'),
    round,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    homeExtraTime: null,
    awayExtraTime: null,
    homePenalties: null,
    awayPenalties: null,
    date,
    status: 'played',
    venue,
    hasReplay: false,
  };
}

function avgRating(players: SimPlayer[]): number {
  if (players.length === 0) return 50;
  return players.reduce((s, p) => s + (p.rating || 50), 0) / players.length;
}

function simulatePenalties(): { home: number; away: number } {
  let home = 0;
  let away = 0;

  // Best of 5
  for (let i = 0; i < 5; i++) {
    if (Math.random() < 0.75) home += 1;
    if (Math.random() < 0.75) away += 1;
  }

  // Sudden death
  while (home === away) {
    const hScore = Math.random() < 0.75 ? 1 : 0;
    const aScore = Math.random() < 0.75 ? 1 : 0;
    home += hScore;
    away += aScore;
  }

  return { home, away };
}

/** Determine the winner of a completed CupMatch */
export function getMatchWinner(match: CupMatch): string | null {
  if (match.status === 'scheduled') return null;

  if (match.status === 'penalties') {
    return (match.homePenalties ?? 0) > (match.awayPenalties ?? 0)
      ? match.homeTeam
      : match.awayTeam;
  }

  // 'played' or 'extra_time'
  const h = match.homeScore ?? 0;
  const a = match.awayScore ?? 0;

  if (match.status === 'extra_time') {
    const ht = (match.homeExtraTime ?? 0);
    const at = (match.awayExtraTime ?? 0);
    return (h + ht) > (a + at) ? match.homeTeam : match.awayTeam;
  }

  return h > a ? match.homeTeam : h < a ? match.awayTeam : null;
}

// ──────────────────────────────────────────────────────────────
//  8. ADVANCE CUP ROUND
// ──────────────────────────────────────────────────────────────

/**
 * After all matches in the current round have been played,
 * generate the next round's draw with winners.
 *
 * Updates participant elimination tracking and returns the
 * modified CupSeason.
 */
export function advanceCupRound(
  cupSeason: CupSeason,
  cupDefinition: CupDefinition,
): CupSeason {
  const updated = structuredClone(cupSeason);
  const curIdx = updated.currentRound - 1;
  const currentRound = updated.rounds[curIdx];

  if (!currentRound || !currentRound.isCompleted) {
    // If not yet completed, mark it completed
    if (currentRound) {
      currentRound.isCompleted = true;
    }
  }

  // Collect winners from the current round
  const winners: string[] = [];
  if (currentRound) {
    for (const m of currentRound.matches) {
      const w = getMatchWinner(m);
      if (w) winners.push(w);
      else winners.push(m.homeTeam); // fallback
    }
  }

  // Also include bye teams (they carry over automatically — handled in generateCupDraw)

  // Mark eliminated teams
  for (const p of updated.participants) {
    if (!winners.includes(p.name) && !p.eliminated) {
      // Check if they played in this round
      const played = currentRound?.matches.some(
        m => m.homeTeam === p.name || m.awayTeam === p.name,
      );
      if (played) {
        p.eliminated = true;
        p.eliminatedRound = updated.currentRound;
      }
    }
  }

  // Check if this was the final round
  const isLastRound = updated.currentRound >= updated.rounds.length;
  if (isLastRound || winners.length <= 1) {
    updated.isCompleted = true;
    if (winners.length >= 1) updated.winner = winners[0];
    if (winners.length >= 2) updated.runnerUp = winners[1];
    if (currentRound?.matches.length === 1) {
      const fm = currentRound.matches[0];
      updated.winner = getMatchWinner(fm) ?? fm.homeTeam;
      updated.runnerUp =
        updated.winner === fm.homeTeam ? fm.awayTeam : fm.homeTeam;
    }
    return updated;
  }

  // ── Generate next round ──
  const nextRoundDef = cupDefinition.rounds[updated.currentRound];
  if (!nextRoundDef) {
    updated.isCompleted = true;
    return updated;
  }

  const nextDate = findRoundDate(
    new Date(currentRound?.startDate ?? new Date()),
    updated.currentRound,
    cupDefinition.type,
  );

  const nextMatches: CupMatch[] = [];
  const shuffledWinners = shuffle(winners);
  const isQForLater =
    nextRoundDef.teams <= 8 ||
    nextRoundDef.name.toLowerCase().includes('çeyrek') ||
    nextRoundDef.name.toLowerCase().includes('ceyrek') ||
    nextRoundDef.name.toLowerCase().includes('yarı') ||
    nextRoundDef.name.toLowerCase().includes('yari') ||
    nextRoundDef.name.toLowerCase().includes('final');

  for (let i = 0; i < shuffledWinners.length; i += 2) {
    const home = shuffledWinners[i];
    const away = shuffledWinners[i + 1];
    if (!away) continue;

    nextMatches.push({
      id: uid('match'),
      round: updated.currentRound + 1,
      homeTeam: home,
      awayTeam: away,
      homeScore: null,
      awayScore: null,
      homeExtraTime: null,
      awayExtraTime: null,
      homePenalties: null,
      awayPenalties: null,
      date: fmtDate(nextDate),
      status: 'scheduled',
      venue: cupDefinition.isNeutralVenue ? 'neutral' : 'home',
      hasReplay: false,
    });
  }

  const nextRound: CupRound = {
    roundNumber: updated.currentRound + 1,
    name: nextRoundDef.name,
    roundType: roundTypeFromName(nextRoundDef.name, updated.currentRound + 1, cupDefinition.rounds.length),
    legs: nextRoundDef.twoLegged ? 'two' : 'single',
    matches: nextMatches,
    isCompleted: false,
    startDate: fmtDate(nextDate),
    endDate: fmtDate(new Date(nextDate.getTime() + 7 * 86400000)),
  };

  updated.rounds.push(nextRound);
  updated.currentRound += 1;

  return updated;
}

// ──────────────────────────────────────────────────────────────
//  9. GET CUP SCHEDULE
// ──────────────────────────────────────────────────────────────

/**
 * Returns all upcoming (unplayed) matches ordered by date,
 * with round metadata.
 */
export function getCupSchedule(
  cupSeason: CupSeason,
  fromDate?: string,
): CupScheduleEntry[] {
  const now = fromDate ? new Date(fromDate) : new Date();
  const entries: CupScheduleEntry[] = [];

  for (const round of cupSeason.rounds) {
    for (const match of round.matches) {
      if (match.status === 'scheduled') {
        const matchDate = new Date(match.date);
        const diffMs = matchDate.getTime() - now.getTime();
        const daysUntil = Math.ceil(diffMs / 86400000);

        entries.push({
          match,
          roundName: round.name,
          roundNumber: round.roundNumber,
          daysUntilMatch: daysUntil,
        });
      }
    }
  }

  entries.sort((a, b) => a.match.date.localeCompare(b.match.date));
  return entries;
}

// ──────────────────────────────────────────────────────────────
//  10. GET CUP STANDINGS
// ──────────────────────────────────────────────────────────────

/**
 * Returns remaining (active) teams first, then eliminated teams,
 * both sorted by the round they reached (deeper = better).
 */
export function getCupStandings(
  cupSeason: CupSeason,
): CupStandingEntry[] {
  const result: CupStandingEntry[] = [];

  for (const p of cupSeason.participants) {
    // Find the latest round this team played in
    let latestRound = 0;
    let latestRoundName = '';
    for (const round of cupSeason.rounds) {
      const played = round.matches.some(
        m => m.homeTeam === p.name || m.awayTeam === p.name,
      );
      if (played && round.roundNumber > latestRound) {
        latestRound = round.roundNumber;
        latestRoundName = round.name;
      }
    }

    result.push({
      name: p.name,
      roundReached: latestRound,
      roundName: latestRoundName,
      status: p.eliminated ? 'eliminated' : 'active',
    });
  }

  // Sort: active first, then by roundReached desc
  result.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
    return b.roundReached - a.roundReached;
  });

  return result;
}

// ──────────────────────────────────────────────────────────────
//  11. CALCULATE CUP REVENUE
// ──────────────────────────────────────────────────────────────

/**
 * Calculate total cup earnings for a specific team:
 *   - Prize money for each round reached
 *   - Gate receipts from home matches (approx 30K per home match
 *     at neutral venues, 50K at home venues)
 *
 * Prize money: `prizeMoney` per round win + `championReward` for
 * winning the whole competition.
 */
export function calculateCupRevenue(
  cupSeason: CupSeason,
  teamName: string,
): CupRevenue {
  const roundPrizes: CupRevenue['roundPrizes'] = [];
  let gateReceipts = 0;

  for (const round of cupSeason.rounds) {
    const played = round.matches.some(
      m => m.homeTeam === teamName || m.awayTeam === teamName,
    );
    if (!played) continue;

    // Check if the team WON this round (advanced)
    const teamMatch = round.matches.find(
      m => m.homeTeam === teamName || m.awayTeam === teamName,
    );
    if (!teamMatch) continue;

    const isWinner = getMatchWinner(teamMatch) === teamName;
    const isRunnerUp =
      !cupSeason.isCompleted ? false : cupSeason.runnerUp === teamName;
    const isChampion = cupSeason.winner === teamName;

    if (isWinner) {
      roundPrizes.push({
        round: round.roundNumber,
        roundName: round.name,
        amount: cupSeason.prizeMoney,
      });
    }

    // Gate receipts for home matches
    if (teamMatch.homeTeam === teamName) {
      const baseGate = teamMatch.venue === 'home' ? 50_000 : 30_000;
      gateReceipts += baseGate;
    }
  }

  // Champion / runner-up bonus
  if (cupSeason.winner === teamName) {
    roundPrizes.push({
      round: cupSeason.rounds.length + 1,
      roundName: 'Şampiyon',
      amount: cupSeason.championReward,
    });
  }

  const total = roundPrizes.reduce((s, r) => s + r.amount, 0) + gateReceipts;

  return {
    teamName,
    cupName: cupSeason.name,
    roundPrizes,
    gateReceipts,
    total,
  };
}

// ──────────────────────────────────────────────────────────────
//  12. GENERATE CUP NEWS
// ──────────────────────────────────────────────────────────────

/**
 * Generate Turkish-language news headlines for cup events.
 */
export function generateCupNews(
  cupSeason: CupSeason,
  latestMatch?: CupMatch,
): CupNews[] {
  const news: CupNews[] = [];

  // ── If a specific match was just played ──
  if (latestMatch && latestMatch.status !== 'scheduled') {
    news.push(...newsForMatch(cupSeason, latestMatch));
  }

  // ── General cup updates ──
  if (cupSeason.isCompleted && cupSeason.winner) {
    news.push({
      id: uid('news'),
      headline: `${cupSeason.name} Şampiyonu: ${cupSeason.winner}!`,
      body: `${cupSeason.name} finalinde büyük zafer! ${cupSeason.winner}, ${cupSeason.runnerUp ?? 'rakibini'} mağlup ederek kupayı kaldırdı. Taraftarlar sokaklara döküldü!`,
      date: fmtDate(new Date()),
      type: 'winner',
      importance: 'critical',
      teams: [cupSeason.winner, cupSeason.runnerUp ?? ''].filter(Boolean),
    });
  }

  // ── Upcoming round预告 ──
  const upcoming = getCupSchedule(cupSeason);
  if (upcoming.length > 0 && !cupSeason.isCompleted) {
    const nextMatch = upcoming[0];
    news.push({
      id: uid('news'),
      headline: `${cupSeason.name} ${nextMatch.roundName} maçları yaklaşıyor`,
      body: `${nextMatch.roundName} turunda ${nextMatch.match.homeTeam} vs ${nextMatch.match.awayTeam} maçı heyecanla bekleniyor. Kura sonuçları açıklandı!`,
      date: fmtDate(new Date()),
      type: 'upcoming',
      importance: 'low',
      teams: [nextMatch.match.homeTeam, nextMatch.match.awayTeam],
    });
  }

  return news;
}

function newsForMatch(cupSeason: CupSeason, match: CupMatch): CupNews[] {
  const items: CupNews[] = [];
  const roundName = cupSeason.rounds.find(r => r.roundNumber === match.round)?.name ?? '';
  const isFinal = match.status !== 'scheduled' &&
    cupSeason.rounds.find(r => r.roundNumber === match.round)?.roundType === 'final';

  const h = match.homeScore ?? 0;
  const a = match.awayScore ?? 0;

  if (match.status === 'penalties') {
    const winner = getMatchWinner(match);
    items.push({
      id: uid('news'),
      headline: `Penaltı atışları nefes kesti! ${winner} ${roundName}'a yükseldi`,
      body: `${match.homeTeam} ${h}-${a} ${match.awayTeam} sonucu uzatma dakikalarında eşitliği bozamadı. Penaltı atışlarında skor ${match.homePenalties}-${match.awayPenalties} oldu. ${winner} büyük bir çekişmeden galip ayrıldı!`,
      date: match.date,
      type: 'penalty_drama',
      importance: isFinal ? 'critical' : 'high',
      teams: [match.homeTeam, match.awayTeam],
    });
  } else if (match.status === 'extra_time') {
    const winner = getMatchWinner(match);
    items.push({
      id: uid('news'),
      headline: `Uzatmalarda kırılma anı! ${winner} ${roundName}'a adını yazdırdı`,
      body: `${match.homeTeam} ${h}(${match.homeExtraTime})-${a}(${match.awayExtraTime}) ${match.awayTeam}. Uzatma dakikalarında ${winner} bulduğu gollerle tur atladı. Maç son derece çekişmeli geçti!`,
      date: match.date,
      type: 'result',
      importance: isFinal ? 'critical' : 'medium',
      teams: [match.homeTeam, match.awayTeam],
    });
  } else if (match.status === 'played') {
    const winner = getMatchWinner(match);
    const goalDiff = Math.abs(h - a);

    // Giant-killing detection: check tier difference
    const homeSeed = cupSeason.participants.find(p => p.name === match.homeTeam);
    const awaySeed = cupSeason.participants.find(p => p.name === match.awayTeam);

    // Heuristic upset: 3+ goal difference
    if (goalDiff >= 3) {
      const loser = winner === match.homeTeam ? match.awayTeam : match.homeTeam;
      items.push({
        id: uid('news'),
        headline: `${roundName} sürprizi! ${winner}, ${loser}'u ${h}-${a} ile geçti`,
        body: `${roundName} turunda büyük bir sürpriz yaşandı. ${winner}, ${loser} karşısında ${goalDiff} farklı galibiyet aldı. ${loser} taraftarları şoke oldu!`,
        date: match.date,
        type: 'upset',
        importance: isFinal ? 'critical' : 'high',
        teams: [match.homeTeam, match.awayTeam],
      });
    } else {
      items.push({
        id: uid('news'),
        headline: `${match.homeTeam} ${h}-${a} ${match.awayTeam} | ${roundName} sonucu`,
        body: `${roundName} turunda ${match.homeTeam} ile ${match.awayTeam} karşı karşıya geldi. Maç ${h}-${a} sona erdi${winner ? ` ve ${winner} tur atladı` : ''}.`,
        date: match.date,
        type: 'result',
        importance: isFinal ? 'critical' : 'medium',
        teams: [match.homeTeam, match.awayTeam],
      });
    }
  }

  return items;
}

// ──────────────────────────────────────────────────────────────
//  13. FORMAT CUP BRACKET
// ──────────────────────────────────────────────────────────────

/**
 * Returns a bracket tree structure suitable for UI rendering.
 *
 * Structure:
 *   CupBracket
 *     └── rounds: BracketRound[]
 *           └── matches: BracketMatch[]
 *
 * Each BracketRound represents one elimination stage (left to right).
 * Matches are ordered top-to-bottom within a round.
 * `winner` is populated only for completed matches.
 */
export function formatCupBracket(
  cupSeason: CupSeason,
): CupBracket {
  const rounds: BracketRound[] = [];

  for (const round of cupSeason.rounds) {
    const matches: BracketMatch[] = round.matches.map(m => {
      let winner: string | null = null;
      if (m.status !== 'scheduled') {
        winner = getMatchWinner(m);
      }

      return {
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        homeExtraTime: m.homeExtraTime,
        awayExtraTime: m.awayExtraTime,
        homePenalties: m.homePenalties,
        awayPenalties: m.awayPenalties,
        winner,
      };
    });

    rounds.push({
      name: round.name,
      roundNumber: round.roundNumber,
      matches,
    });
  }

  return {
    cupId: cupSeason.cupId,
    cupName: cupSeason.name,
    year: cupSeason.year,
    rounds,
  };
}

// ──────────────────────────────────────────────────────────────
//  14. UTILITY EXPORTS
// ──────────────────────────────────────────────────────────────

/** Get a CupDefinition by its id */
export function getCupDefinition(id: string): CupDefinition | undefined {
  return CUP_DEFINITIONS.find(d => d.id === id);
}

/** Get the total number of rounds in a cup definition */
export function getCupRoundCount(def: CupDefinition): number {
  return def.rounds.length;
}

/** Get Turkish name for a RoundType */
export function getRoundTypeName(rt: RoundType): string {
  const map: Record<RoundType, string> = {
    round_of_64: '64 Turu',
    round_of_32: '32 Turu',
    round_of_16: 'Son 16',
    quarter_final: 'Çeyrek Final',
    semi_final: 'Yarı Final',
    final: 'Final',
  };
  return map[rt] ?? rt;
}

/** Get Turkish name for a CupType */
export function getCupTypeName(ct: CupType): string {
  const map: Record<CupType, string> = {
    domestic_cup: 'Kupa',
    super_cup: 'Süper Kupa',
    continental: 'Kıtalararası',
    youth_cup: 'Gençlik Kupası',
  };
  return map[ct] ?? ct;
}

/** Determine if a team is still active in the cup */
export function isTeamActive(cupSeason: CupSeason, teamName: string): boolean {
  const p = cupSeason.participants.find(pp => pp.name === teamName);
  if (!p) return false;
  return !p.eliminated;
}

/** Get the deepest round a team has reached */
export function getTeamDeepestRound(
  cupSeason: CupSeason,
  teamName: string,
): { roundNumber: number; roundName: string } {
  let deepest = { roundNumber: 0, roundName: '' };

  for (const round of cupSeason.rounds) {
    const played = round.matches.some(
      m => m.homeTeam === teamName || m.awayTeam === teamName,
    );
    if (played && round.roundNumber > deepest.roundNumber) {
      deepest = { roundNumber: round.roundNumber, roundName: round.name };
    }
  }

  return deepest;
}
