/**
 * Match Page Types
 *
 * MatchPage ve alt bileşenlerinin paylaştığı tip tanımları.
 */

export interface FixtureData {
  id: string;
  tur: number;
  match_date: string;
  match_time: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team_id: string;
  away_team_id: string;
  home: { name: string; id: string; is_bot?: boolean; profile_id?: string } | null;
  away: { name: string; id: string; is_bot?: boolean; profile_id?: string } | null;
  season_id?: string;
  is_friendly?: boolean;
  is_quick_match?: boolean;
  referee_name?: string | null;
  referee_personality?: string | null;
  referee_strictness?: number | null;
}

export interface MatchEventRow {
  id: string;
  fixture_id: string;
  event_type: string;
  minute: number;
  player_name: string | null;
  team: string | null;
  detail: string | null;
  created_at: string;
}

export interface PlayerStatRow {
  id: string;
  name: string;
  position: string;
  rating: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  team_name: string;
}

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export interface LiveStrategyPanelProps {
  currentFormation: string;
  currentTactic: string;
  onApply: (formation: string, tactic: string) => void;
  isApplying: boolean;
  lastApplied: string | null;
  changeCount: number;
}
