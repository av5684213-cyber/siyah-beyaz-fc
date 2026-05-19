// ═══════════════════════════════════════════════════════════════════════
//  MATCH TYPE UTILITIES  –  Derive match_type from fixture data
//  Since we can't ALTER TABLE with anon key, match_type is computed
//  on the frontend instead of stored as a DB column.
// ═══════════════════════════════════════════════════════════════════════

import { MatchType } from './types';

// ──────────────────────────────────────────────────────────────
//  1. TYPES
// ──────────────────────────────────────────────────────────────

/** Minimal fixture shape needed to determine match type */
export interface FixtureLike {
  /** Week / round number in the season (1–34 for league, 30+ for cup rounds) */
  tur: number;
  /** Home team ID */
  home_team_id: string;
  /** Away team ID */
  away_team_id: string;
  /** Optional: if this is a friendly match from the friendly system */
  is_friendly?: boolean;
}

/** Map of team_id → region/city string, used for derby detection */
export type TeamRegionMap = Record<string, string>;

// ──────────────────────────────────────────────────────────────
//  2. CONSTANTS
// ──────────────────────────────────────────────────────────────

/**
 * Threshold: tur values >= this are considered cup / playoff rounds.
 *
 * In a 34-week league season:
 *   - Weeks 1–29  → Regular league matches
 *   - Weeks 30–34 → Playoff / cup elimination rounds
 *
 * This can be adjusted per league configuration.
 */
export const CUP_TUR_THRESHOLD = 30;

/**
 * The final week of the season — matches here are considered cup finals.
 */
export const CUP_FINAL_TUR = 34;

/**
 * Known derby pairs by region.
 * Teams sharing the same region/city are considered derby rivals.
 * This map can be extended as more teams are added to the game.
 */
export const DERBY_REGIONS: Record<string, string[]> = {
  istanbul: [
    'Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor',
    // Add Istanbul-based team IDs as they're discovered
  ],
  ankara: [
    'Ankaragücü', 'Gençlerbirliği', 'Ankaraspor',
  ],
  izmir: [
    'Karşıyaka', 'Göztepe', 'İzmirspor',
  ],
};

// ──────────────────────────────────────────────────────────────
//  3. MAIN FUNCTION
// ──────────────────────────────────────────────────────────────

/**
 * Determine the match type from fixture data.
 *
 * Priority order:
 *   1. Friendly  → if `is_friendly` flag is set
 *   2. Cup Final → if tur === CUP_FINAL_TUR and tur >= CUP_TUR_THRESHOLD
 *   3. Cup       → if tur >= CUP_TUR_THRESHOLD
 *   4. Derby     → if both teams share the same region
 *   5. Normal    → default (regular league match)
 *
 * @param fixture  - Fixture object with tur, home_team_id, away_team_id
 * @param teamRegions - Optional map of team_id → region for derby detection
 * @returns The derived MatchType
 */
export function getMatchType(
  fixture: FixtureLike,
  teamRegions?: TeamRegionMap,
): MatchType {
  const { tur, home_team_id, away_team_id, is_friendly } = fixture;

  // 1. Friendly matches (from friendly match system)
  if (is_friendly) {
    return 'friendly';
  }

  // 2. Cup final (last week of the season in cup rounds)
  if (tur >= CUP_TUR_THRESHOLD && tur >= CUP_FINAL_TUR) {
    return 'cup_final';
  }

  // 3. Cup / playoff rounds (tur >= threshold)
  if (tur >= CUP_TUR_THRESHOLD) {
    // Within cup rounds, still check for derby
    if (teamRegions && isDerby(home_team_id, away_team_id, teamRegions)) {
      return 'derby';
    }
    return 'cup';
  }

  // 4. Derby detection (same city/region teams)
  if (teamRegions && isDerby(home_team_id, away_team_id, teamRegions)) {
    return 'derby';
  }

  // 5. Normal league match
  return 'normal';
}

// ──────────────────────────────────────────────────────────────
//  4. DERBY DETECTION
// ──────────────────────────────────────────────────────────────

/**
 * Check if two teams are derby rivals (same city/region).
 *
 * @param homeTeamId  - Home team's ID
 * @param awayTeamId  - Away team's ID
 * @param teamRegions - Map of team_id → region/city string
 * @returns true if both teams are in the same region
 */
export function isDerby(
  homeTeamId: string,
  awayTeamId: string,
  teamRegions: TeamRegionMap,
): boolean {
  const homeRegion = teamRegions[homeTeamId];
  const awayRegion = teamRegions[awayTeamId];

  // Both teams must have a region, and they must match
  if (!homeRegion || !awayRegion) return false;

  return homeRegion.toLowerCase() === awayRegion.toLowerCase();
}

// ──────────────────────────────────────────────────────────────
//  5. BATCH HELPERS
// ──────────────────────────────────────────────────────────────

/**
 * Derive match_type for an array of fixtures.
 *
 * @param fixtures    - Array of fixture-like objects
 * @param teamRegions - Optional map of team_id → region for derby detection
 * @returns Array of { fixture, matchType } objects
 */
export function getMatchTypes<T extends FixtureLike>(
  fixtures: T[],
  teamRegions?: TeamRegionMap,
): Array<T & { match_type: MatchType }> {
  return fixtures.map(fixture => ({
    ...fixture,
    match_type: getMatchType(fixture, teamRegions),
  }));
}

/**
 * Filter fixtures by match type.
 */
export function filterByMatchType<T extends FixtureLike>(
  fixtures: T[],
  matchType: MatchType,
  teamRegions?: TeamRegionMap,
): T[] {
  return fixtures.filter(f => getMatchType(f, teamRegions) === matchType);
}

// ──────────────────────────────────────────────────────────────
//  6. DISPLAY HELPERS
// ──────────────────────────────────────────────────────────────

/** Turkish labels for each match type */
export const MATCH_TYPE_LABELS: Record<MatchType, { tr: string; en: string; emoji: string; color: string }> = {
  normal:    { tr: 'Lig Maçı',    en: 'League Match',   emoji: '⚽', color: 'text-white/60' },
  derby:     { tr: 'Derbi',       en: 'Derby',          emoji: '🔥', color: 'text-red-400' },
  cup:       { tr: 'Kupa Maçı',   en: 'Cup Match',      emoji: '🏆', color: 'text-amber-400' },
  cup_final: { tr: 'Kupa Finali', en: 'Cup Final',      emoji: '🏆', color: 'text-yellow-300' },
  friendly:  { tr: 'Hazırlık',    en: 'Friendly',       emoji: '🤝', color: 'text-green-400' },
};

/**
 * Get display info for a match type.
 */
export function getMatchTypeDisplay(matchType: MatchType) {
  return MATCH_TYPE_LABELS[matchType] ?? MATCH_TYPE_LABELS.normal;
}

/**
 * Check if a match type is a "big match" (derby, cup, or cup_final)
 * — useful for commentary / media system intensity.
 */
export function isBigMatch(matchType: MatchType): boolean {
  return matchType === 'derby' || matchType === 'cup' || matchType === 'cup_final';
}

/**
 * Get a match type badge CSS class string for UI rendering.
 */
export function getMatchTypeBadgeClass(matchType: MatchType): string {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border';
  switch (matchType) {
    case 'derby':
      return `${base} bg-red-500/10 text-red-400 border-red-500/30`;
    case 'cup':
      return `${base} bg-amber-500/10 text-amber-400 border-amber-500/30`;
    case 'cup_final':
      return `${base} bg-yellow-500/10 text-yellow-300 border-yellow-500/30`;
    case 'friendly':
      return `${base} bg-green-500/10 text-green-400 border-green-500/30`;
    default:
      return `${base} bg-white/5 text-white/40 border-white/10`;
  }
}
