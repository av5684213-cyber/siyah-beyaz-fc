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
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
     console.error('Error checking career stats:', fetchError);
     return;
  }

  if (existing) {
    const newMatches = existing.matches_played + 1;
    const newRating = (existing.avg_rating * existing.matches_played + stats.rating) / newMatches;

    await supabase
      .from('player_career_stats')
      .update({
        matches_played: newMatches,
        goals: existing.goals + stats.goals,
        assists: existing.assists + stats.assists,
        yellow_cards: existing.yellow_cards + stats.yellowCards,
        red_cards: existing.red_cards + stats.redCards,
        fouls: existing.fouls + stats.fouls,
        avg_rating: Number(newRating.toFixed(2))
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('player_career_stats')
      .insert([{
        player_id: playerId,
        season_id: seasonId,
        team_id: teamId,
        matches_played: 1,
        goals: stats.goals,
        assists: stats.assists,
        yellow_cards: stats.yellowCards,
        red_cards: stats.redCards,
        fouls: stats.fouls,
        avg_rating: Number(stats.rating.toFixed(2))
      }]);
  }
}
