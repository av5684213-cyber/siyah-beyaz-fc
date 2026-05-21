// ═══════════════════════════════════════════════════════════════════════
// Managerium — Sezon Sonu Ödüller Sistemi (Season Awards Service)
// Sezon sonu istatistik hesaplamaları, ödül belirleme, badge kazanma
// ═══════════════════════════════════════════════════════════════════════

import { getSupabase } from '@/lib/supabase';
import type { Player, SeasonAward, SeasonSummary, SeasonBadge, SeasonAwardCeremony, AwardType, LeagueTeam } from './types';
import { AWARD_LABELS } from './types';
import { safeJsonParse } from './sharedUtils';

// ─── Sezon ID Yardımcıları ────────────────────────────────────────────

export function getSeasonId(currentDay: number): string {
  return `season-${Math.ceil(currentDay / 34)}`;
}

export function getSeasonNumber(currentDay: number): number {
  return Math.ceil(currentDay / 34);
}

// ─── Ödül Hesaplama ──────────────────────────────────────────────────

interface PlayerSeasonStats {
  playerId: string;
  playerName: string;
  position: string;
  rating: number;
  age: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
  cleanSheets: number;
  avgRating: number;
  motm: number;
}

/**
 * Kadrodaki oyuncuların sezon istatistiklerinden ödülleri hesaplar.
 * Her ödül kategorisinde en iyi oyuncuyu belirler.
 */
export function computeSeasonAwards(
  squad: Player[],
  seasonId: string,
  profileId: string,
  teamName: string,
  leagueName?: string,
): SeasonAward[] {
  const awards: SeasonAward[] = [];

  // Oyuncu sezon istatistiklerini topla (career_stats'tan veya mevcut verilerden)
  const playerStats: PlayerSeasonStats[] = squad.map(p => ({
    playerId: p.id,
    playerName: p.name,
    position: p.position,
    rating: p.rating,
    age: p.age,
    goals: p.goalStats ? Object.values(p.goalStats).reduce((a, b) => a + b, 0) : 0,
    assists: 0, // Will be populated from career_stats
    yellowCards: 0,
    redCards: 0,
    matchesPlayed: 0,
    cleanSheets: p.saveStats ? Object.values(p.saveStats).reduce((a, b) => a + b, 0) > 0 ? 1 : 0 : 0,
    avgRating: p.form_rating ?? p.rating,
    motm: 0,
  }));

  // ─── Altın Krampon (En golcü) ────────────────────────────────────
  const topScorer = [...playerStats].sort((a, b) => b.goals - a.goals)[0];
  if (topScorer && topScorer.goals > 0) {
    awards.push({
      id: `award_${seasonId}_golden_boot_${profileId}`,
      season_id: seasonId,
      profile_id: profileId,
      league_name: leagueName,
      award_type: 'golden_boot',
      player_id: topScorer.playerId,
      player_name: topScorer.playerName,
      team_name: teamName,
      stat_value: topScorer.goals,
      stat_detail: { goals: topScorer.goals, matches: topScorer.matchesPlayed, avg_rating: topScorer.avgRating },
    });
  }

  // ─── MVP (En yüksek ortalama rating + gol + asist katkısı) ────────
  const mvpCandidates = playerStats.map(p => ({
    ...p,
    mvpScore: p.avgRating * 0.5 + (p.goals * 2) + (p.assists * 1.5) + (p.matchesPlayed * 0.1),
  }));
  const mvp = [...mvpCandidates].sort((a, b) => b.mvpScore - a.mvpScore)[0];
  if (mvp) {
    awards.push({
      id: `award_${seasonId}_mvp_${profileId}`,
      season_id: seasonId,
      profile_id: profileId,
      league_name: leagueName,
      award_type: 'mvp',
      player_id: mvp.playerId,
      player_name: mvp.playerName,
      team_name: teamName,
      stat_value: Math.round(mvp.mvpScore * 10) / 10,
      stat_detail: { avg_rating: mvp.avgRating, goals: mvp.goals, assists: mvp.assists, matches: mvp.matchesPlayed },
    });
  }

  // ─── En İyi Kaleci ──────────────────────────────────────────────
  const goalkeepers = playerStats.filter(p => p.position === 'GK');
  const bestGK = [...goalkeepers].sort((a, b) => {
    const scoreA = a.avgRating + a.cleanSheets * 3;
    const scoreB = b.avgRating + b.cleanSheets * 3;
    return scoreB - scoreA;
  })[0];
  if (bestGK) {
    awards.push({
      id: `award_${seasonId}_best_gk_${profileId}`,
      season_id: seasonId,
      profile_id: profileId,
      league_name: leagueName,
      award_type: 'best_gk',
      player_id: bestGK.playerId,
      player_name: bestGK.playerName,
      team_name: teamName,
      stat_value: bestGK.avgRating,
      stat_detail: { avg_rating: bestGK.avgRating, clean_sheets: bestGK.cleanSheets, matches: bestGK.matchesPlayed },
    });
  }

  // ─── Asist Kralı ────────────────────────────────────────────────
  const topAssister = [...playerStats].sort((a, b) => b.assists - a.assists)[0];
  if (topAssister && topAssister.assists > 0) {
    awards.push({
      id: `award_${seasonId}_top_assists_${profileId}`,
      season_id: seasonId,
      profile_id: profileId,
      league_name: leagueName,
      award_type: 'top_assists',
      player_id: topAssister.playerId,
      player_name: topAssister.playerName,
      team_name: teamName,
      stat_value: topAssister.assists,
      stat_detail: { assists: topAssister.assists, matches: topAssister.matchesPlayed, avg_rating: topAssister.avgRating },
    });
  }

  // ─── En İyi Genç (U21, en yüksek rating) ──────────────────────────
  const youngPlayers = playerStats.filter(p => p.age <= 21);
  const bestYoung = [...youngPlayers].sort((a, b) => b.avgRating - a.avgRating)[0];
  if (bestYoung) {
    awards.push({
      id: `award_${seasonId}_best_young_${profileId}`,
      season_id: seasonId,
      profile_id: profileId,
      league_name: leagueName,
      award_type: 'best_young',
      player_id: bestYoung.playerId,
      player_name: bestYoung.playerName,
      team_name: teamName,
      stat_value: bestYoung.avgRating,
      stat_detail: { avg_rating: bestYoung.avgRating, age: bestYoung.age, goals: bestYoung.goals, assists: bestYoung.assists },
    });
  }

  // ─── Fair Play (En az kart, en çok maç oynayan) ──────────────────
  const fairPlayCandidates = playerStats.filter(p => p.matchesPlayed >= 10);
  const fairPlay = [...fairPlayCandidates].sort((a, b) => {
    const cardsA = a.yellowCards + a.redCards * 3;
    const cardsB = b.yellowCards + b.redCards * 3;
    if (cardsA !== cardsB) return cardsA - cardsB;
    return b.matchesPlayed - a.matchesPlayed;
  })[0];
  if (fairPlay) {
    awards.push({
      id: `award_${seasonId}_fair_play_${profileId}`,
      season_id: seasonId,
      profile_id: profileId,
      league_name: leagueName,
      award_type: 'fair_play',
      player_id: fairPlay.playerId,
      player_name: fairPlay.playerName,
      team_name: teamName,
      stat_value: fairPlay.yellowCards + fairPlay.redCards * 3,
      stat_detail: { yellow_cards: fairPlay.yellowCards, red_cards: fairPlay.redCards, matches: fairPlay.matchesPlayed },
    });
  }

  return awards;
}

// ─── Sezon Özeti Hesaplama ───────────────────────────────────────────

/**
 * Sezon sonu takım özet istatistiklerini hesaplar.
 */
export function computeSeasonSummary(
  squad: Player[],
  seasonId: string,
  profileId: string,
  teamName: string,
  leagueName?: string,
  leagueStandings?: LeagueTeam[],
): SeasonSummary {
  // Toplam istatistikler
  let totalGoals = 0;
  let totalAssists = 0;
  let totalYellow = 0;
  let totalRed = 0;
  let totalRating = 0;
  let ratedCount = 0;
  let totalCleanSheets = 0;

  let topScorerName = '';
  let topScorerGoals = 0;
  let topAssisterName = '';
  let topAssisterAssists = 0;
  let bestPlayerName = '';
  let bestPlayerRating = 0;

  for (const p of squad) {
    const goals = p.goalStats ? Object.values(p.goalStats).reduce((a, b) => a + b, 0) : 0;
    const assists = 0; // TODO: populate from career_stats
    const yCards = 0;
    const rCards = 0;
    const rating = p.form_rating ?? p.rating;
    const cleanSheets = (p.position === 'GK' && p.saveStats) ? 1 : 0;

    totalGoals += goals;
    totalAssists += assists;
    totalYellow += yCards;
    totalRed += rCards;
    totalCleanSheets += cleanSheets;

    if (rating > 0) {
      totalRating += rating;
      ratedCount++;
    }

    if (goals > topScorerGoals) {
      topScorerGoals = goals;
      topScorerName = p.name;
    }
    if (assists > topAssisterAssists) {
      topAssisterAssists = assists;
      topAssisterName = p.name;
    }
    if (rating > bestPlayerRating) {
      bestPlayerRating = rating;
      bestPlayerName = p.name;
    }
  }

  // Lig pozisyonu
  let finalPosition = 0;
  let points = 0;
  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  if (leagueStandings) {
    const myTeam = leagueStandings.find(t => t.name === teamName);
    if (myTeam) {
      finalPosition = leagueStandings.indexOf(myTeam) + 1;
      points = myTeam.points;
      won = myTeam.won;
      drawn = myTeam.drawn;
      lost = myTeam.lost;
      goalsFor = myTeam.gf;
      goalsAgainst = myTeam.ga;
    }
  }

  const isChampion = finalPosition === 1;
  const isPromoted = finalPosition <= 3 && finalPosition > 0;
  const isRelegated = finalPosition >= leagueStandings?.length - 1 && finalPosition > 0;

  return {
    id: `summary_${seasonId}_${profileId}`,
    season_id: seasonId,
    profile_id: profileId,
    team_name: teamName,
    league_name: leagueName,
    final_position: finalPosition,
    points,
    won,
    drawn,
    lost,
    goals_for: goalsFor,
    goals_against: goalsAgainst,
    total_goals: totalGoals || goalsFor,
    total_assists: totalAssists,
    total_yellow: totalYellow,
    total_red: totalRed,
    total_clean_sheets: totalCleanSheets,
    avg_team_rating: ratedCount > 0 ? Math.round(totalRating / ratedCount * 10) / 10 : 0,
    top_scorer_name: topScorerName,
    top_scorer_goals: topScorerGoals,
    top_assister_name: topAssisterName,
    top_assister_assists: topAssisterAssists,
    best_player_name: bestPlayerName,
    best_player_rating: Math.round(bestPlayerRating * 10) / 10,
    is_champion: isChampion,
    is_promoted: isPromoted,
    is_relegated: isRelegated,
    awards_count: 0, // Will be updated after awards computation
    badge_earned: undefined,
  };
}

// ─── Badge Hesaplama ──────────────────────────────────────────────────

/**
 * Lig pozisyonuna göre sezon badge'i belirler.
 */
export function computeSeasonBadge(
  finalPosition: number,
  isChampion: boolean,
  awards: SeasonAward[],
  totalTeams?: number,
): SeasonBadge | null {
  const seasonId = awards[0]?.season_id || 'unknown';

  // Şampiyonluk badge'i
  if (isChampion) {
    return {
      season_id: seasonId,
      type: 'champion_gold',
      label: 'Şampiyon',
      icon: '🏆',
    };
  }

  // Bireysel ödül badge'leri
  const awardTypes = awards.map(a => a.award_type);
  if (awardTypes.includes('golden_boot')) {
    return {
      season_id: seasonId,
      type: 'golden_boot',
      label: 'Altın Krampon Sahibi',
      icon: '👢',
    };
  }
  if (awardTypes.includes('mvp')) {
    return {
      season_id: seasonId,
      type: 'mvp',
      label: 'MVP',
      icon: '⭐',
    };
  }

  // Lig pozisyonuna göre badge
  if (finalPosition <= 3 && finalPosition > 0) {
    return {
      season_id: seasonId,
      type: 'top4',
      label: `#${finalPosition} Sıra`,
      icon: '🥈',
    };
  }

  if (finalPosition > 0 && totalTeams && finalPosition >= totalTeams - 1) {
    return {
      season_id: seasonId,
      type: 'relegated',
      label: 'Düşme',
      icon: '⬇️',
    };
  }

  if (finalPosition > 0 && finalPosition <= totalTeams! / 2) {
    return {
      season_id: seasonId,
      type: 'mid_table',
      label: 'Orta Sıra',
      icon: '📋',
    };
  }

  return null;
}

// ─── Supabase'e Kaydetme ──────────────────────────────────────────────

/**
 * Sezon ödüllerini ve özetini Supabase'e kaydeder.
 * Profile'a trophy ve award sayılarını günceller.
 */
export async function saveSeasonAwardsAndSummary(
  awards: SeasonAward[],
  summary: SeasonSummary,
  badge: SeasonBadge | null,
  profileId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    // 1. Ödülleri kaydet
    if (awards.length > 0) {
      const awardRows = awards.map(a => ({
        id: a.id,
        season_id: a.season_id,
        profile_id: a.profile_id,
        league_name: a.league_name,
        award_type: a.award_type,
        player_id: a.player_id,
        player_name: a.player_name,
        team_name: a.team_name,
        stat_value: a.stat_value,
        stat_detail: JSON.stringify(a.stat_detail || {}),
      }));

      const { error: awardError } = await supabase
        .from('season_awards')
        .upsert(awardRows, { onConflict: 'id' });

      if (awardError) {
        console.error('[saveSeasonAwards] Award upsert error:', awardError.message);
      }
    }

    // 2. Özeti kaydet
    const summaryRow = {
      id: summary.id,
      season_id: summary.season_id,
      profile_id: summary.profile_id,
      team_name: summary.team_name,
      league_name: summary.league_name,
      final_position: summary.final_position,
      points: summary.points,
      won: summary.won,
      drawn: summary.drawn,
      lost: summary.lost,
      goals_for: summary.goals_for,
      goals_against: summary.goals_against,
      total_goals: summary.total_goals,
      total_assists: summary.total_assists,
      total_yellow: summary.total_yellow,
      total_red: summary.total_red,
      total_clean_sheets: summary.total_clean_sheets,
      avg_team_rating: summary.avg_team_rating,
      top_scorer_name: summary.top_scorer_name,
      top_scorer_goals: summary.top_scorer_goals,
      top_assister_name: summary.top_assister_name,
      top_assister_assists: summary.top_assister_assists,
      best_player_name: summary.best_player_name,
      best_player_rating: summary.best_player_rating,
      is_champion: summary.is_champion,
      is_promoted: summary.is_promoted,
      is_relegated: summary.is_relegated,
      awards_count: awards.length,
      badge_earned: badge?.type || null,
    };

    const { error: summaryError } = await supabase
      .from('season_summaries')
      .upsert(summaryRow, { onConflict: 'id' });

    if (summaryError) {
      console.error('[saveSeasonAwards] Summary upsert error:', summaryError.message);
    }

    // 3. Profile güncelle: trophy/award sayıları ve badge'ler
    const updateData: Record<string, any> = {};
    if (summary.is_champion) {
      updateData.total_trophies = 1; // Increment will be done via RPC or read-then-write
    }
    updateData.total_awards = awards.length;

    // Badge'leri güncelle
    if (badge) {
      // Mevcut badge'leri oku, yenisini ekle
      const { data: profileData } = await supabase
        .from('profiles')
        .select('season_badges')
        .eq('id', profileId)
        .single();

      const existingBadges = safeJsonParse<SeasonBadge[]>(profileData.season_badges, []);

      // Aynı sezonun badge'ini güncelle veya ekle
      const updatedBadges = [
        ...existingBadges.filter((b: SeasonBadge) => b.season_id !== badge.season_id),
        badge,
      ];

      updateData.season_badges = JSON.stringify(updatedBadges);
    }

    if (Object.keys(updateData).length > 0) {
      // Read current values for incrementing
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('total_trophies, total_awards')
        .eq('id', profileId)
        .single();

      if (currentProfile) {
        if (summary.is_champion) {
          updateData.total_trophies = (currentProfile.total_trophies || 0) + 1;
        }
        updateData.total_awards = (currentProfile.total_awards || 0) + awards.length;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId);

      if (profileError) {
        console.error('[saveSeasonAwards] Profile update error:', profileError.message);
      }
    }

    return { success: true };
  } catch (err) {
    console.error('[saveSeasonAwards] Exception:', err);
    return { success: false, error: String(err) };
  }
}

// ─── Supabase'den Okuma ──────────────────────────────────────────────

/**
 * Belirli bir sezonun ödüllerini getirir.
 */
export async function loadSeasonAwards(profileId: string, seasonId: string): Promise<SeasonAward[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('season_awards')
      .select('*')
      .eq('profile_id', profileId)
      .eq('season_id', seasonId);

    if (error || !data) return [];

    return data.map(mapAwardFromRow);
  } catch {
    return [];
  }
}

/**
 * Tüm sezon özetlerini getirir.
 */
export async function loadAllSeasonSummaries(profileId: string): Promise<SeasonSummary[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('season_summaries')
      .select('*')
      .eq('profile_id', profileId)
      .order('season_id', { ascending: false });

    if (error || !data) return [];

    return data.map(mapSummaryFromRow);
  } catch {
    return [];
  }
}

/**
 * Tam ödül töreni verisini hazırlar (son sezon için).
 */
export async function loadAwardCeremony(profileId: string, seasonId: string): Promise<SeasonAwardCeremony | null> {
  try {
    const [awards, summaries] = await Promise.all([
      loadSeasonAwards(profileId, seasonId),
      loadAllSeasonSummaries(profileId),
    ]);

    const summary = summaries.find(s => s.season_id === seasonId);
    if (!summary) return null;

    // Badge'i profile'dan oku
    const supabase = getSupabase();
    let badge: SeasonBadge | null = null;
    if (supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('season_badges')
        .eq('id', profileId)
        .single();

      if (data?.season_badges) {
        const badges = safeJsonParse<SeasonBadge[]>(data.season_badges, []);
        badge = badges.find(b => b.season_id === seasonId) || null;
      }
    }

    return {
      season_id: seasonId,
      summary,
      awards,
      badge,
    };
  } catch {
    return null;
  }
}

/**
 * Şampiyonluk sayısını getirir.
 */
export async function getChampionshipCount(profileId: string): Promise<number> {
  try {
    const supabase = getSupabase();
    if (!supabase) return 0;

    const { count, error } = await supabase
      .from('season_summaries')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .eq('is_champion', true);

    return count || 0;
  } catch {
    return 0;
  }
}

// ─── Yardımcı: Row Mapping ──────────────────────────────────────────

function mapAwardFromRow(row: any): SeasonAward {
  return {
    id: row.id,
    season_id: row.season_id,
    profile_id: row.profile_id,
    league_name: row.league_name,
    award_type: row.award_type as AwardType,
    player_id: row.player_id,
    player_name: row.player_name,
    team_name: row.team_name,
    stat_value: row.stat_value,
    stat_detail: safeJsonParse<Record<string, number | string>>(row.stat_detail, undefined),
    created_at: row.created_at,
  };
}

function mapSummaryFromRow(row: any): SeasonSummary {
  return {
    id: row.id,
    season_id: row.season_id,
    profile_id: row.profile_id,
    team_name: row.team_name,
    league_name: row.league_name,
    final_position: row.final_position,
    points: row.points || 0,
    won: row.won || 0,
    drawn: row.drawn || 0,
    lost: row.lost || 0,
    goals_for: row.goals_for || 0,
    goals_against: row.goals_against || 0,
    total_goals: row.total_goals || 0,
    total_assists: row.total_assists || 0,
    total_yellow: row.total_yellow || 0,
    total_red: row.total_red || 0,
    total_clean_sheets: row.total_clean_sheets || 0,
    avg_team_rating: row.avg_team_rating || 0,
    top_scorer_name: row.top_scorer_name,
    top_scorer_goals: row.top_scorer_goals || 0,
    top_assister_name: row.top_assister_name,
    top_assister_assists: row.top_assister_assists || 0,
    best_player_name: row.best_player_name,
    best_player_rating: row.best_player_rating || 0,
    is_champion: row.is_champion || false,
    is_promoted: row.is_promoted || false,
    is_relegated: row.is_relegated || false,
    awards_count: row.awards_count || 0,
    badge_earned: row.badge_earned,
    created_at: row.created_at,
  };
}

// ─── Şampiyonluk kontrolü (career_stats'tan hesaplama) ──────────────

/**
 * Supabase'deki career_stats tablosundan oyuncu sezon istatistiklerini çeker
 * ve ödül hesaplamasını geliştirilmiş veriyle yapar.
 */
export async function computeSeasonAwardsWithCareerStats(
  profileId: string,
  seasonId: string,
  squad: Player[],
  teamName: string,
  leagueName?: string,
): Promise<SeasonAward[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return computeSeasonAwards(squad, seasonId, profileId, teamName, leagueName);

    // Career stats'ı çek
    const playerIds = squad.map(p => p.id);
    const { data: careerData } = await supabase
      .from('player_career_stats')
      .select('*')
      .eq('season_id', seasonId)
      .in('player_id', playerIds);

    if (!careerData || careerData.length === 0) {
      // Fallback: mevcut verilerle hesapla
      return computeSeasonAwards(squad, seasonId, profileId, teamName, leagueName);
    }

    // Career stats map: playerId -> stats
    const statsMap: Record<string, any> = {};
    for (const row of careerData) {
      statsMap[row.player_id] = row;
    }

    const awards: SeasonAward[] = [];

    // ─── Altın Krampon ─────────────────────────────────────────────
    const scorerData = [...careerData].sort((a, b) => b.goals - a.goals)[0];
    if (scorerData && scorerData.goals > 0) {
      const player = squad.find(p => p.id === scorerData.player_id);
      awards.push({
        id: `award_${seasonId}_golden_boot_${profileId}`,
        season_id: seasonId,
        profile_id: profileId,
        league_name: leagueName,
        award_type: 'golden_boot',
        player_id: scorerData.player_id,
        player_name: player?.name || scorerData.player_id,
        team_name: teamName,
        stat_value: scorerData.goals,
        stat_detail: { goals: scorerData.goals, matches: scorerData.matches_played, avg_rating: Math.round(scorerData.avg_rating * 10) / 10 },
      });
    }

    // ─── MVP ───────────────────────────────────────────────────────
    const mvpData = [...careerData].sort((a, b) => {
      const scoreA = a.avg_rating * 0.5 + a.goals * 2 + a.assists * 1.5 + a.matches_played * 0.1;
      const scoreB = b.avg_rating * 0.5 + b.goals * 2 + b.assists * 1.5 + b.matches_played * 0.1;
      return scoreB - scoreA;
    })[0];
    if (mvpData) {
      const player = squad.find(p => p.id === mvpData.player_id);
      awards.push({
        id: `award_${seasonId}_mvp_${profileId}`,
        season_id: seasonId,
        profile_id: profileId,
        league_name: leagueName,
        award_type: 'mvp',
        player_id: mvpData.player_id,
        player_name: player?.name || mvpData.player_id,
        team_name: teamName,
        stat_value: Math.round((mvpData.avg_rating * 0.5 + mvpData.goals * 2 + mvpData.assists * 1.5) * 10) / 10,
        stat_detail: { avg_rating: Math.round(mvpData.avg_rating * 10) / 10, goals: mvpData.goals, assists: mvpData.assists, matches: mvpData.matches_played },
      });
    }

    // ─── En İyi Kaleci ────────────────────────────────────────────
    const gkData = careerData.filter(row => {
      const player = squad.find(p => p.id === row.player_id);
      return player?.position === 'GK';
    });
    const bestGKData = [...gkData].sort((a, b) => {
      const scoreA = a.avg_rating + (a.clean_sheets || 0) * 3;
      const scoreB = b.avg_rating + (b.clean_sheets || 0) * 3;
      return scoreB - scoreA;
    })[0];
    if (bestGKData) {
      const player = squad.find(p => p.id === bestGKData.player_id);
      awards.push({
        id: `award_${seasonId}_best_gk_${profileId}`,
        season_id: seasonId,
        profile_id: profileId,
        league_name: leagueName,
        award_type: 'best_gk',
        player_id: bestGKData.player_id,
        player_name: player?.name || bestGKData.player_id,
        team_name: teamName,
        stat_value: Math.round(bestGKData.avg_rating * 10) / 10,
        stat_detail: { avg_rating: Math.round(bestGKData.avg_rating * 10) / 10, clean_sheets: bestGKData.clean_sheets || 0, matches: bestGKData.matches_played },
      });
    }

    // ─── Asist Kralı ──────────────────────────────────────────────
    const assisterData = [...careerData].sort((a, b) => b.assists - a.assists)[0];
    if (assisterData && assisterData.assists > 0) {
      const player = squad.find(p => p.id === assisterData.player_id);
      awards.push({
        id: `award_${seasonId}_top_assists_${profileId}`,
        season_id: seasonId,
        profile_id: profileId,
        league_name: leagueName,
        award_type: 'top_assists',
        player_id: assisterData.player_id,
        player_name: player?.name || assisterData.player_id,
        team_name: teamName,
        stat_value: assisterData.assists,
        stat_detail: { assists: assisterData.assists, matches: assisterData.matches_played, avg_rating: Math.round(assisterData.avg_rating * 10) / 10 },
      });
    }

    // ─── En İyi Genç (U21) ────────────────────────────────────────
    const youngData = careerData.filter(row => {
      const player = squad.find(p => p.id === row.player_id);
      return player && player.age <= 21;
    });
    const bestYoungData = [...youngData].sort((a, b) => b.avg_rating - a.avg_rating)[0];
    if (bestYoungData) {
      const player = squad.find(p => p.id === bestYoungData.player_id);
      awards.push({
        id: `award_${seasonId}_best_young_${profileId}`,
        season_id: seasonId,
        profile_id: profileId,
        league_name: leagueName,
        award_type: 'best_young',
        player_id: bestYoungData.player_id,
        player_name: player?.name || bestYoungData.player_id,
        team_name: teamName,
        stat_value: Math.round(bestYoungData.avg_rating * 10) / 10,
        stat_detail: { avg_rating: Math.round(bestYoungData.avg_rating * 10) / 10, age: player?.age || 0, goals: bestYoungData.goals, assists: bestYoungData.assists },
      });
    }

    // ─── Fair Play ────────────────────────────────────────────────
    const fairPlayData = [...careerData].filter(r => r.matches_played >= 5).sort((a, b) => {
      const cardsA = a.yellow_cards + a.red_cards * 3;
      const cardsB = b.yellow_cards + b.red_cards * 3;
      if (cardsA !== cardsB) return cardsA - cardsB;
      return b.matches_played - a.matches_played;
    })[0];
    if (fairPlayData) {
      const player = squad.find(p => p.id === fairPlayData.player_id);
      awards.push({
        id: `award_${seasonId}_fair_play_${profileId}`,
        season_id: seasonId,
        profile_id: profileId,
        league_name: leagueName,
        award_type: 'fair_play',
        player_id: fairPlayData.player_id,
        player_name: player?.name || fairPlayData.player_id,
        team_name: teamName,
        stat_value: fairPlayData.yellow_cards + fairPlayData.red_cards * 3,
        stat_detail: { yellow_cards: fairPlayData.yellow_cards, red_cards: fairPlayData.red_cards, matches: fairPlayData.matches_played },
      });
    }

    return awards;
  } catch (err) {
    console.error('[computeSeasonAwardsWithCareerStats] Error, falling back:', err);
    return computeSeasonAwards(squad, seasonId, profileId, teamName, leagueName);
  }
}
