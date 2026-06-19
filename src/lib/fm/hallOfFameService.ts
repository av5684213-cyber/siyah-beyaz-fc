// ═══════════════════════════════════════════════════════════════════════
// Managerium — Hall of Fame Museum Service (Adım 5)
// Emekli oyuncuların HOF'a alınması, kariyer özetinin hesaplanması,
// tüm zamanların rekorları, persistent okuma/yazma
// ═══════════════════════════════════════════════════════════════════════

import { getSupabase } from '@/lib/supabase';
import type { Player } from './types';
import { safeJsonParse } from './sharedUtils';

// ─── Types ────────────────────────────────────────────────────────────

export type LegendTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export interface HallOfFameEntry {
  id: string;
  profile_id: string;
  player_id: string;
  player_name: string;
  position: string;
  nationality?: string;
  seasons_played: number;
  total_goals: number;
  total_assists: number;
  total_matches: number;
  total_clean_sheets: number;
  total_motm: number;
  avg_rating: number;
  peak_rating: number;
  legend_tier: LegendTier;
  is_club_legend: boolean;
  awards_won: string[];
  joined_day?: number;
  retired_day?: number;
  retired_season?: string;
  inducted_at?: string;
}

export interface AllTimeRecord {
  category: string;
  label: string;
  icon: string;
  playerName: string;
  value: number;
  unit: string;
}

// ─── Legend Tier Hesaplama ────────────────────────────────────────────

/**
 * Oyuncunun kariyer istatistiklerine göre efsane tier'ını belirler.
 * 
 * Platinum: 3+ sezon, 100+ gol veya 8.5+ avg rating veya 5+ MotM
 * Gold:     2+ sezon, 50+ gol veya 7.5+ avg rating veya 3+ MotM
 * Silver:   1+ sezon, 20+ gol veya 7.0+ avg rating
 * Bronze:   Emekli olan ama yukarıdaki kriterleri karşılamayanlar
 */
export function computeLegendTier(player: Player, careerStats?: {
  totalGoals?: number;
  totalAssists?: number;
  totalMatches?: number;
  avgRating?: number;
  motm?: number;
  seasonsPlayed?: number;
}): LegendTier {
  const goals = careerStats?.totalGoals ?? getTotalGoals(player);
  const avgRating = careerStats?.avgRating ?? (player.form_rating || player.rating);
  const motm = careerStats?.motm ?? 0;
  const seasons = careerStats?.seasonsPlayed ?? estimateSeasonsPlayed(player);

  if (seasons >= 3 && (goals >= 100 || avgRating >= 8.5 || motm >= 5)) return 'platinum';
  if (seasons >= 2 && (goals >= 50 || avgRating >= 7.5 || motm >= 3)) return 'gold';
  if (seasons >= 1 && (goals >= 20 || avgRating >= 7.0)) return 'silver';
  return 'bronze';
}

/**
 * Klüp efsanesi mi? (is_club_legend)
 * En az 3 sezon + 50+ gol VEYA 7.5+ avg rating VEYA 5+ MotM
 */
export function isClubLegend(player: Player, careerStats?: {
  totalGoals?: number;
  avgRating?: number;
  motm?: number;
  seasonsPlayed?: number;
}): boolean {
  const goals = careerStats?.totalGoals ?? getTotalGoals(player);
  const avgRating = careerStats?.avgRating ?? (player.form_rating || player.rating);
  const motm = careerStats?.motm ?? 0;
  const seasons = careerStats?.seasonsPlayed ?? estimateSeasonsPlayed(player);

  return seasons >= 3 && (goals >= 50 || avgRating >= 7.5 || motm >= 5);
}

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────────

function getTotalGoals(player: Player): number {
  if (!player.goalStats) return 0;
  return Object.values(player.goalStats).reduce((a, b) => a + b, 0);
}

function estimateSeasonsPlayed(player: Player): number {
  // Basit tahmin: (current_age - joined_age) ile sezon sayısı
  // Eğer bu bilgi yoksa, en az 1 sezon oynamış kabul et (emekli olduysa)
  if ((player as Record<string, unknown>).career_stats) {
    return Math.max(1, Math.floor(((player as Record<string, unknown>).career_stats as Record<string, unknown>).seasons as number || 1));
  }
  return 1;
}

/**
 * HOF'a alınacak oyuncuları filtreler.
 * Her emekli oyuncu otomatik olarak HOF'a girmez — en az BRONZE tier olmalı.
 */
export function shouldInductToHOF(player: Player, careerStats?: {
  totalGoals?: number;
  totalAssists?: number;
  totalMatches?: number;
  avgRating?: number;
  motm?: number;
  seasonsPlayed?: number;
}): boolean {
  // is_legend olan herkes otomatik girer
  if (player.is_legend) return true;
  
  // En az 1 sezon oynamış ve belli bir kalitede olanlar
  const tier = computeLegendTier(player, careerStats);
  return tier !== 'bronze' || (careerStats?.totalMatches ?? 0) >= 15 || getTotalGoals(player) >= 5;
}

// ─── HOF Entry Oluşturma ─────────────────────────────────────────────

/**
 * Emekli bir oyuncudan HOF entry oluşturur.
 */
export function createHOFEntry(
  player: Player,
  profileId: string,
  retiredDay: number,
  retiredSeason: string,
  careerStats?: {
    totalGoals?: number;
    totalAssists?: number;
    totalMatches?: number;
    totalCleanSheets?: number;
    avgRating?: number;
    motm?: number;
    seasonsPlayed?: number;
    awardsWon?: string[];
  },
): HallOfFameEntry {
  const totalGoals = careerStats?.totalGoals ?? getTotalGoals(player);
  const tier = computeLegendTier(player, careerStats);
  const legend = isClubLegend(player, careerStats);

  return {
    id: `hof_${player.id}_${profileId}`,
    profile_id: profileId,
    player_id: player.id,
    player_name: player.name,
    position: player.position,
    nationality: player.nation,
    seasons_played: careerStats?.seasonsPlayed ?? estimateSeasonsPlayed(player),
    total_goals: totalGoals,
    total_assists: careerStats?.totalAssists ?? 0,
    total_matches: careerStats?.totalMatches ?? 0,
    total_clean_sheets: careerStats?.totalCleanSheets ?? 0,
    total_motm: careerStats?.motm ?? 0,
    avg_rating: careerStats?.avgRating ?? (player.form_rating || player.rating),
    peak_rating: player.rating,
    legend_tier: tier,
    is_club_legend: legend,
    awards_won: careerStats?.awardsWon ?? [],
    joined_day: (player as Record<string, unknown>).joined_day as number | undefined,
    retired_day: retiredDay,
    retired_season: retiredSeason,
  };
}

// ─── Supabase Kaydetme ────────────────────────────────────────────────

/**
 * Emekli oyuncuları HOF'a kaydeder.
 * Sadece shouldInductToHOF() ile uygun olanlar kaydedilir.
 */
export async function inductRetiredPlayers(
  retiredPlayers: Player[],
  profileId: string,
  retiredDay: number,
  retiredSeason: string,
): Promise<{ inducted: HallOfFameEntry[]; skipped: Player[] }> {
  const inducted: HallOfFameEntry[] = [];
  const skipped: Player[] = [];

  for (const player of retiredPlayers) {
    if (shouldInductToHOF(player)) {
      // Career stats'ı Supabase'den çekmeyi dene
      const careerStats = await fetchCareerStatsForHOF(player.id, retiredSeason);
      const entry = createHOFEntry(player, profileId, retiredDay, retiredSeason, careerStats);
      inducted.push(entry);
    } else {
      skipped.push(player);
    }
  }

  // Supabase'e kaydet
  if (inducted.length > 0) {
    const supabase = getSupabase();
    if (supabase) {
      const rows = inducted.map(entry => ({
        id: entry.id,
        profile_id: entry.profile_id,
        player_id: entry.player_id,
        player_name: entry.player_name,
        position: entry.position,
        nationality: entry.nationality,
        seasons_played: entry.seasons_played,
        total_goals: entry.total_goals,
        total_assists: entry.total_assists,
        total_matches: entry.total_matches,
        total_clean_sheets: entry.total_clean_sheets,
        total_motm: entry.total_motm,
        avg_rating: entry.avg_rating,
        peak_rating: entry.peak_rating,
        legend_tier: entry.legend_tier,
        is_club_legend: entry.is_club_legend,
        awards_won: JSON.stringify(entry.awards_won),
        joined_day: entry.joined_day,
        retired_day: entry.retired_day,
        retired_season: entry.retired_season,
        inducted_at: new Date().toISOString(),
      }));

      // SORUN-9 FIX: UPSERT with player_id+profile_id conflict resolution
      // Aynı oyuncu farklı sezonlarda emekli olursa duplicate engelle
      // onConflict: player_id + profile_id kombinasyonu benzersiz olmalı
      const { error } = await supabase
        .from('hall_of_fame')
        .upsert(rows, { onConflict: 'player_id,profile_id' });

      if (error) {
        console.error('[inductRetiredPlayers] Upsert error:', error.message);
      }

      // Profile'daki hof_count'u güncelle
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('hof_count')
        .eq('id', profileId)
        .maybeSingle();

      if (currentProfile) {
        await supabase
          .from('profiles')
          .update({ hof_count: (currentProfile.hof_count || 0) + inducted.length })
          .eq('id', profileId);
      }
    }
  }

  return { inducted, skipped };
}

// ─── Career Stats Çekme ──────────────────────────────────────────────

/**
 * Emekli olan oyuncunun kariyer istatistiklerini Supabase'den çeker.
 * Tüm sezonların toplamını hesaplar.
 */
async function fetchCareerStatsForHOF(
  playerId: string,
  _lastSeasonId: string,
): Promise<{
  totalGoals: number;
  totalAssists: number;
  totalMatches: number;
  totalCleanSheets: number;
  avgRating: number;
  motm: number;
  seasonsPlayed: number;
  awardsWon: string[];
} | undefined> {
  try {
    const supabase = getSupabase();
    if (!supabase) return undefined;

    // Tüm sezonların kariyer istatistiklerini çek
    const { data, error } = await supabase
      .from('player_career_stats')
      .select('*')
      .eq('player_id', playerId);

    if (error || !data || data.length === 0) return undefined;

    // Toplamları hesapla
    let totalGoals = 0;
    let totalAssists = 0;
    let totalMatches = 0;
    let totalCleanSheets = 0;
    let totalMotm = 0;
    let ratingSum = 0;
    let ratedSeasons = 0;
    const awardsWon: string[] = [];

    for (const row of data) {
      totalGoals += row.goals || 0;
      totalAssists += row.assists || 0;
      totalMatches += row.matches_played || 0;
      totalCleanSheets += row.clean_sheets || 0;
      totalMotm += row.motm || 0;
      if (row.avg_rating > 0) {
        ratingSum += row.avg_rating;
        ratedSeasons++;
      }
    }

    // Sezon ödüllerini çek
    const { data: awardData } = await supabase
      .from('season_awards')
      .select('award_type')
      .eq('player_id', playerId);

    if (awardData) {
      for (const a of awardData) {
        if (a.award_type && !awardsWon.includes(a.award_type)) {
          awardsWon.push(a.award_type);
        }
      }
    }

    return {
      totalGoals,
      totalAssists,
      totalMatches,
      totalCleanSheets,
      avgRating: ratedSeasons > 0 ? Math.round((ratingSum / ratedSeasons) * 100) / 100 : 0,
      motm: totalMotm,
      seasonsPlayed: data.length,
      awardsWon,
    };
  } catch (err) {
    console.error('[fetchCareerStatsForHOF] Error:', err);
    return undefined;
  }
}

// ─── Supabase'den Okuma ──────────────────────────────────────────────

/**
 * Bir profilin tüm HOF üyelerini getirir.
 */
export async function loadHallOfFame(profileId: string): Promise<HallOfFameEntry[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('hall_of_fame')
      .select('*')
      .eq('profile_id', profileId)
      .order('avg_rating', { ascending: false });

    if (error || !data) return [];

    return data.map(mapHofFromRow);
  } catch {
    return [];
  }
}

/**
 * Tüm zamanların rekorlarını hesaplar.
 */
export async function computeAllTimeRecords(profileId: string): Promise<AllTimeRecord[]> {
  const hof = await loadHallOfFame(profileId);
  if (hof.length === 0) return [];

  const records: AllTimeRecord[] = [];

  // En çok gol
  const topScorer = [...hof].sort((a, b) => b.total_goals - a.total_goals)[0];
  if (topScorer && topScorer.total_goals > 0) {
    records.push({
      category: 'goals',
      label: 'En Çok Gol',
      icon: '⚽',
      playerName: topScorer.player_name,
      value: topScorer.total_goals,
      unit: 'gol',
    });
  }

  // En çok asist
  const topAssister = [...hof].sort((a, b) => b.total_assists - a.total_assists)[0];
  if (topAssister && topAssister.total_assists > 0) {
    records.push({
      category: 'assists',
      label: 'En Çok Asist',
      icon: '🎯',
      playerName: topAssister.player_name,
      value: topAssister.total_assists,
      unit: 'asist',
    });
  }

  // En çok maç
  const topMatches = [...hof].sort((a, b) => b.total_matches - a.total_matches)[0];
  if (topMatches && topMatches.total_matches > 0) {
    records.push({
      category: 'matches',
      label: 'En Çok Maç',
      icon: '🏟️',
      playerName: topMatches.player_name,
      value: topMatches.total_matches,
      unit: 'maç',
    });
  }

  // En yüksek rating
  const topRating = [...hof].sort((a, b) => b.avg_rating - a.avg_rating)[0];
  if (topRating && topRating.avg_rating > 0) {
    records.push({
      category: 'rating',
      label: 'En Yüksek Rating',
      icon: '⭐',
      playerName: topRating.player_name,
      value: Math.round(topRating.avg_rating * 10) / 10,
      unit: 'avg',
    });
  }

  // En çok MotM
  const topMotm = [...hof].sort((a, b) => b.total_motm - a.total_motm)[0];
  if (topMotm && topMotm.total_motm > 0) {
    records.push({
      category: 'motm',
      label: 'En Çok Maçın Adamı',
      icon: '🏅',
      playerName: topMotm.player_name,
      value: topMotm.total_motm,
      unit: 'MotM',
    });
  }

  // En çok clean sheet (sadece kaleciler)
  const gks = hof.filter(p => p.position === 'GK');
  const topCS = [...gks].sort((a, b) => b.total_clean_sheets - a.total_clean_sheets)[0];
  if (topCS && topCS.total_clean_sheets > 0) {
    records.push({
      category: 'cleansheets',
      label: 'En Çok Clean Sheet',
      icon: '🧤',
      playerName: topCS.player_name,
      value: topCS.total_clean_sheets,
      unit: 'CS',
    });
  }

  // En yüksek peak rating
  const topPeak = [...hof].sort((a, b) => b.peak_rating - a.peak_rating)[0];
  if (topPeak && topPeak.peak_rating > 0) {
    records.push({
      category: 'peak',
      label: 'En Yüksek Zirve Rating',
      icon: '🏔️',
      playerName: topPeak.player_name,
      value: topPeak.peak_rating,
      unit: 'OVR',
    });
  }

  return records;
}

// ─── Row Mapping ─────────────────────────────────────────────────────

function mapHofFromRow(row: any): HallOfFameEntry {
  return {
    id: row.id,
    profile_id: row.profile_id,
    player_id: row.player_id,
    player_name: row.player_name,
    position: row.position,
    nationality: row.nationality,
    seasons_played: row.seasons_played || 0,
    total_goals: row.total_goals || 0,
    total_assists: row.total_assists || 0,
    total_matches: row.total_matches || 0,
    total_clean_sheets: row.total_clean_sheets || 0,
    total_motm: row.total_motm || 0,
    avg_rating: row.avg_rating || 0,
    peak_rating: row.peak_rating || 0,
    legend_tier: row.legend_tier as LegendTier || 'bronze',
    is_club_legend: row.is_club_legend || false,
    awards_won: safeJsonParse<string[]>(row.awards_won, []),
    joined_day: row.joined_day,
    retired_day: row.retired_day,
    retired_season: row.retired_season,
    inducted_at: row.inducted_at,
  };
}
