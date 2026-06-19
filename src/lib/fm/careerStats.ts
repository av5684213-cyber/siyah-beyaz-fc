import { getSupabase, isSupabaseConfigured } from '../supabase';

export interface CareerStat {
  id?: string;
  player_id: string;
  season_id: string;
  team_id?: string;
  team_name?: string; // For display
  matches_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  fouls: number;
  clean_sheets: number;
  motm: number;
  saves: number;
  position?: string;
  rating?: number;
  avg_rating: number;
}

export async function fetchPlayerCareerStats(playerId: string): Promise<CareerStat[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('player_career_stats')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching career stats:', error);
    return [];
  }

  return data || [];
}

export async function updateMatchCareerStats(
  playerId: string, 
  seasonId: string, 
  teamId: string | null,
  stats: {
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    fouls: number;
    rating: number;
    cleanSheet?: boolean;
    isMotm?: boolean;
    saves?: number;
    position?: string;
    playerRating?: number;
    goalTypes?: Record<string, number>;
    saveTypes?: Record<string, number>;
  }
) {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabase();

  // 1. Get existing or create
  const { data: existing, error: fetchError } = await supabase
    .from('player_career_stats')
    .select('*')
    .eq('player_id', playerId)
    .eq('season_id', seasonId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
     console.error('Error checking career stats:', fetchError);
     return;
  }

  if (existing) {
    const newMatches = existing.matches_played + 1;
    const newRating = (existing.avg_rating * existing.matches_played + stats.rating) / newMatches;

    // Merge goal_types and save_types JSONB
    const existingGoalTypes = (existing.goal_types && typeof existing.goal_types === 'object') ? existing.goal_types as Record<string, number> : {};
    const existingSaveTypes = (existing.save_types && typeof existing.save_types === 'object') ? existing.save_types as Record<string, number> : {};

    const mergedGoalTypes = { ...existingGoalTypes };
    if (stats.goalTypes) {
      for (const [type, count] of Object.entries(stats.goalTypes)) {
        mergedGoalTypes[type] = (mergedGoalTypes[type] || 0) + count;
      }
    }

    const mergedSaveTypes = { ...existingSaveTypes };
    if (stats.saveTypes) {
      for (const [type, count] of Object.entries(stats.saveTypes)) {
        mergedSaveTypes[type] = (mergedSaveTypes[type] || 0) + count;
      }
    }

    const updateData: Record<string, any> = {
      matches_played: newMatches,
      goals: existing.goals + stats.goals,
      assists: existing.assists + stats.assists,
      yellow_cards: existing.yellow_cards + stats.yellowCards,
      red_cards: existing.red_cards + stats.redCards,
      fouls: (existing.fouls || 0) + stats.fouls,
      avg_rating: Number(newRating.toFixed(2)),
      goal_types: mergedGoalTypes,
      save_types: mergedSaveTypes,
      motm_count: (existing.motm_count || 0) + (stats.isMotm ? 1 : 0),
    };

    // ADIM 4: clean_sheets, motm, saves
    if (stats.cleanSheet) {
      updateData.clean_sheets = (existing.clean_sheets || 0) + 1;
    }
    if (stats.isMotm) {
      updateData.motm = (existing.motm || 0) + 1;
    }
    if (stats.saves && stats.saves > 0) {
      updateData.saves = (existing.saves || 0) + stats.saves;
    }

    await supabase
      .from('player_career_stats')
      .update(updateData)
      .eq('id', existing.id);
  } else {
    const insertData: Record<string, any> = {
      player_id: playerId,
      season_id: seasonId,
      team_id: teamId,
      matches_played: 1,
      goals: stats.goals,
      assists: stats.assists,
      yellow_cards: stats.yellowCards,
      red_cards: stats.redCards,
      fouls: stats.fouls,
      avg_rating: Number(stats.rating.toFixed(2)),
      clean_sheets: stats.cleanSheet ? 1 : 0,
      motm: stats.isMotm ? 1 : 0,
      motm_count: stats.isMotm ? 1 : 0,
      saves: stats.saves || 0,
      goal_types: stats.goalTypes || {},
      save_types: stats.saveTypes || {},
    };
    if (stats.position) insertData.position = stats.position;
    if (stats.playerRating) insertData.rating = stats.playerRating;

    await supabase
      .from('player_career_stats')
      .insert([insertData]);
  }
}
