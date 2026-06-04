/**
 * celebrationSystem.ts
 *
 * TASARIM-2: Trophy Celebrations and Achievement Badges
 *
 * Kupa kazanımlarını ve başarı rozetlerini yönetir.
 * Sezon sonu şampiyonlukları trophy_cabinet'e kaydeder,
 * maç sonu başarımları achievement_badges'e ekler.
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile, MatchResult } from './types';

// ─── Trophy Types ──────────────────────────────────────────────────

export type TrophyType = 'league' | 'cup' | 'super_cup';

export interface TrophyEntry {
  id: string;
  profile_id: string;
  trophy_type: TrophyType;
  season: string;
  team_name: string;
  league_name: string;
  won_at: string;
}

// ─── Badge Types ───────────────────────────────────────────────────

export type BadgeType =
  | 'first_win'        // İlk galibiyet
  | 'unbeaten_10'      // 10 maç yenilmez
  | 'top_scorer'       // Ligde en çok gol atan takım
  | 'youth_star'       // Genç oyuncu yetiştirme
  | 'champion'         // Şampiyonluk
  | 'promotion'        // Üst lige yükselme
  | 'clean_sheet_5'    // 5 maç üst üste gol yememe
  | 'hat_trick'        // Bir maçta 3+ gol
  | 'big_win'          // 3-0 veya daha iyi galip gelme
  | 'comeback_king'    // Geriden dönüp kazanma
  | 'transfer_guru'    // Transfer piyasasında iyi iş
  | 'youth_promotion'; // Genci birinci takıma terfi ettirme

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  first_win: {
    type: 'first_win',
    name: 'İlk Galibiyet',
    description: 'İlk maçını kazandın!',
    icon: '🏆',
    color: 'text-yellow-300',
  },
  unbeaten_10: {
    type: 'unbeaten_10',
    name: 'Yenilmez',
    description: '10 maç üst üste yenilmedin!',
    icon: '🛡️',
    color: 'text-blue-300',
  },
  top_scorer: {
    type: 'top_scorer',
    name: 'Gol Kralı Takımı',
    description: 'Ligde en çok gol atan takım!',
    icon: '⚽',
    color: 'text-amber-300',
  },
  youth_star: {
    type: 'youth_star',
    name: 'Yıldız Avcısı',
    description: 'Altyapıdan yıldız bir oyuncu yetiştirdin!',
    icon: '🌟',
    color: 'text-purple-300',
  },
  champion: {
    type: 'champion',
    name: 'Şampiyon',
    description: 'Lig şampiyonu oldun!',
    icon: '👑',
    color: 'text-yellow-200',
  },
  promotion: {
    type: 'promotion',
    name: 'Yükselen Yıldız',
    description: 'Üst lige yükseldin!',
    icon: '🚀',
    color: 'text-emerald-300',
  },
  clean_sheet_5: {
    type: 'clean_sheet_5',
    name: 'Kale Duvarı',
    description: '5 maç üst üste gol yemedin!',
    icon: '🧱',
    color: 'text-cyan-300',
  },
  hat_trick: {
    type: 'hat_trick',
    name: 'Hat-Trick',
    description: 'Bir maçta 3+ gol attın!',
    icon: '🎩',
    color: 'text-rose-300',
  },
  big_win: {
    type: 'big_win',
    name: 'Farklı Galibiyet',
    description: 'Rakibini 3+ gol farkla yendin!',
    icon: '💪',
    color: 'text-orange-300',
  },
  comeback_king: {
    type: 'comeback_king',
    name: 'Dönüş Kralı',
    description: 'Geriye düşüp maçı çevirdin!',
    icon: '🔄',
    color: 'text-pink-300',
  },
  transfer_guru: {
    type: 'transfer_guru',
    name: 'Transfer Ustası',
    description: 'Transfer piyasasında harika işler çıkardın!',
    icon: '💰',
    color: 'text-green-300',
  },
  youth_promotion: {
    type: 'youth_promotion',
    name: 'Gençlik Hamlesi',
    description: 'Bir genci birinci takıma terfi ettirdin!',
    icon: '🧬',
    color: 'text-teal-300',
  },
};

export interface BadgeEntry {
  id: string;
  profile_id: string;
  badge_type: BadgeType;
  badge_name: string;
  badge_description: string;
  earned_at: string;
}

// ─── Season Results Interface ──────────────────────────────────────

export interface SeasonResults {
  champion_profile_id: string;
  champion_team_name: string;
  league_name: string;
  season_id: string;
  cup_winner_profile_id?: string | null;
  cup_winner_team_name?: string | null;
  top_scorer_profile_id?: string | null;
}

// ─── Match Context for Badge Checks ────────────────────────────────

export interface MatchContext {
  isWin: boolean;
  isFirstWin: boolean;        // İlk galibiyet mi?
  homeScore: number;
  awayScore: number;
  isHome: boolean;
  consecutiveUnbeaten: number; // Üst üste yenilmezlik
  consecutiveCleanSheets: number; // Üst üste gol yememe
  hadHatTrick: boolean;       // Hat-trick var mı?
  hadComeback: boolean;       // Geriden dönüldü mü?
  isBigWin: boolean;          // 3+ gol fark
  isYouthPromoted: boolean;   // Genç terfi ettirildi mi?
  topScorerInLeague: boolean; // Ligde en çok gol atan takım
}

// ═══════════════════════════════════════════════════════════════════
// TROPHY SYSTEM
// ═══════════════════════════════════════════════════════════════════

/**
 * Sezon sonu kupa kazanımlarını trophy_cabinet'e kaydeder.
 * Sadece service-role veya RPC ile çağrılmalı (RLS: INSERT WITH CHECK false).
 */
export async function checkAndAwardTrophies(
  profileId: string,
  seasonResults: SeasonResults
): Promise<TrophyType[]> {
  const awarded: TrophyType[] = [];
  if (!isSupabaseConfigured()) return awarded;

  const supabase = getSupabase();
  if (!supabase) return awarded;

  // Lig şampiyonluğu
  if (seasonResults.champion_profile_id === profileId) {
    try {
      const { error } = await supabase.from('trophy_cabinet').insert({
        profile_id: profileId,
        trophy_type: 'league',
        season: seasonResults.season_id,
        team_name: seasonResults.champion_team_name,
        league_name: seasonResults.league_name,
      });
      if (!error) awarded.push('league');
    } catch (err) {
      console.warn('[celebrationSystem] League trophy insert error:', err);
    }
  }

  // Kupa şampiyonluğu
  if (seasonResults.cup_winner_profile_id === profileId) {
    try {
      const { error } = await supabase.from('trophy_cabinet').insert({
        profile_id: profileId,
        trophy_type: 'cup',
        season: seasonResults.season_id,
        team_name: seasonResults.cup_winner_team_name || '',
        league_name: seasonResults.league_name,
      });
      if (!error) awarded.push('cup');
    } catch (err) {
      console.warn('[celebrationSystem] Cup trophy insert error:', err);
    }
  }

  // Süper kupa (hem lig hem kupa şampiyonu)
  if (
    seasonResults.champion_profile_id === profileId &&
    seasonResults.cup_winner_profile_id === profileId
  ) {
    try {
      const { error } = await supabase.from('trophy_cabinet').insert({
        profile_id: profileId,
        trophy_type: 'super_cup',
        season: seasonResults.season_id,
        team_name: seasonResults.champion_team_name,
        league_name: seasonResults.league_name,
      });
      if (!error) awarded.push('super_cup');
    } catch (err) {
      console.warn('[celebrationSystem] Super cup trophy insert error:', err);
    }
  }

  return awarded;
}

/**
 * Bir profilin tüm kupalarını getirir.
 */
export async function loadTrophies(profileId: string): Promise<TrophyEntry[]> {
  if (!isSupabaseConfigured() || !profileId) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from('trophy_cabinet')
      .select('*')
      .eq('profile_id', profileId)
      .order('won_at', { ascending: false });

    return (data || []) as TrophyEntry[];
  } catch (err) {
    console.warn('[celebrationSystem] Load trophies error:', err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════
// ACHIEVEMENT BADGE SYSTEM
// ═══════════════════════════════════════════════════════════════════

/**
 * Maç sonrası başarı rozetlerini kontrol eder ve kazanıldıysa kaydeder.
 * Her badge_type için sadece bir kez kazanılabilir (UNIQUE constraint).
 */
export async function checkAndAwardBadges(
  profileId: string,
  matchContext: MatchContext,
  profile?: Profile | null
): Promise<BadgeType[]> {
  const earned: BadgeType[] = [];
  if (!isSupabaseConfigured() || !profileId) return earned;

  const supabase = getSupabase();
  if (!supabase) return earned;

  // ─── İlk Galibiyet ───
  if (matchContext.isFirstWin && matchContext.isWin) {
    const badge = await awardBadge(supabase, profileId, 'first_win');
    if (badge) earned.push('first_win');
  }

  // ─── Büyük Galibiyet (3-0 veya daha iyi) ───
  if (matchContext.isBigWin && matchContext.isWin) {
    const badge = await awardBadge(supabase, profileId, 'big_win');
    if (badge) earned.push('big_win');
  }

  // ─── 10 Maç Yenilmezlik ───
  if (matchContext.consecutiveUnbeaten >= 10) {
    const badge = await awardBadge(supabase, profileId, 'unbeaten_10');
    if (badge) earned.push('unbeaten_10');
  }

  // ─── Hat-Trick ───
  if (matchContext.hadHatTrick) {
    const badge = await awardBadge(supabase, profileId, 'hat_trick');
    if (badge) earned.push('hat_trick');
  }

  // ─── Geriden Dönüş ───
  if (matchContext.hadComeback && matchContext.isWin) {
    const badge = await awardBadge(supabase, profileId, 'comeback_king');
    if (badge) earned.push('comeback_king');
  }

  // ─── 5 Maç Üst Üste Gol Yememe ───
  if (matchContext.consecutiveCleanSheets >= 5) {
    const badge = await awardBadge(supabase, profileId, 'clean_sheet_5');
    if (badge) earned.push('clean_sheet_5');
  }

  // ─── Gol Kralı Takımı ───
  if (matchContext.topScorerInLeague) {
    const badge = await awardBadge(supabase, profileId, 'top_scorer');
    if (badge) earned.push('top_scorer');
  }

  // ─── Genç Terfi ───
  if (matchContext.isYouthPromoted) {
    const badge = await awardBadge(supabase, profileId, 'youth_promotion');
    if (badge) earned.push('youth_promotion');
  }

  return earned;
}

/**
 * Şampiyonluk rozeti — sezon sonunda çağrılır.
 */
export async function awardChampionBadge(profileId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !profileId) return false;
  const supabase = getSupabase();
  if (!supabase) return false;
  return !!(await awardBadge(supabase, profileId, 'champion'));
}

/**
 * Yükselme rozeti — sezon sonunda çağrılır.
 */
export async function awardPromotionBadge(profileId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !profileId) return false;
  const supabase = getSupabase();
  if (!supabase) return false;
  return !!(await awardBadge(supabase, profileId, 'promotion'));
}

/**
 * Genç yıldız rozeti — altyapıdan yüksek potansiyelli oyuncu geldiğinde.
 */
export async function awardYouthStarBadge(profileId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !profileId) return false;
  const supabase = getSupabase();
  if (!supabase) return false;
  return !!(await awardBadge(supabase, profileId, 'youth_star'));
}

// ─── Internal: Badge kaydet ────────────────────────────────────────

async function awardBadge(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  profileId: string,
  badgeType: BadgeType
): Promise<boolean> {
  const def = BADGE_DEFINITIONS[badgeType];
  if (!def) return false;

  try {
    // Önce zaten var mı kontrol et
    const { data: existing } = await supabase
      .from('achievement_badges')
      .select('id')
      .eq('profile_id', profileId)
      .eq('badge_type', badgeType)
      .maybeSingle();

    if (existing) return false; // Zaten kazanılmış

    const { error } = await supabase.from('achievement_badges').insert({
      profile_id: profileId,
      badge_type: badgeType,
      badge_name: def.name,
      badge_description: def.description,
    });

    return !error;
  } catch (err) {
    console.warn(`[celebrationSystem] Badge ${badgeType} award error:`, err);
    return false;
  }
}

/**
 * Bir profilin tüm rozetlerini getirir.
 */
export async function loadBadges(profileId: string): Promise<BadgeEntry[]> {
  if (!isSupabaseConfigured() || !profileId) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from('achievement_badges')
      .select('*')
      .eq('profile_id', profileId)
      .order('earned_at', { ascending: false });

    return (data || []) as BadgeEntry[];
  } catch (err) {
    console.warn('[celebrationSystem] Load badges error:', err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════
// MATCH CONTEXT HELPER
// ═══════════════════════════════════════════════════════════════════

/**
 * Maç sonucundan MatchContext oluşturur.
 * matchResult + ek verilerle badge kontrolü için context hazırlar.
 */
export function buildMatchContext(params: {
  matchResult: MatchResult;
  isHome: boolean;
  consecutiveUnbeaten?: number;
  consecutiveCleanSheets?: number;
  isFirstWin?: boolean;
  isYouthPromoted?: boolean;
  topScorerInLeague?: boolean;
}): MatchContext {
  const { matchResult, isHome } = params;
  const homeScore = matchResult.score.home;
  const awayScore = matchResult.score.away;
  const myScore = isHome ? homeScore : awayScore;
  const oppScore = isHome ? awayScore : homeScore;
  const isWin = myScore > oppScore;
  const goalDiff = myScore - oppScore;

  // Hat-trick kontrolü: herhangi bir oyuncu 3+ gol attı mı?
  let hadHatTrick = false;
  if (matchResult.playerStats) {
    for (const stats of Object.values(matchResult.playerStats)) {
      if ((stats?.goals || 0) >= 3) {
        hadHatTrick = true;
        break;
      }
    }
  }

  // Geriden dönüş kontrolü (basit: maç sonucu galibiyet ve maç olaylarında geriye düşme var)
  // Detaylı analiz için match events'e bakmak gerekir ama basit kontrol yeterli
  const hadComeback = isWin && matchResult.events?.some(
    (e: any) =>
      e.type === 'GOAL' &&
      e.minute <= 60 &&
      (isHome ? e.team === 'AWAY' : e.team === 'HOME') &&
      (isHome ? awayScore > homeScore : homeScore > awayScore)
  ) || false;

  return {
    isWin,
    isFirstWin: params.isFirstWin || false,
    homeScore,
    awayScore,
    isHome,
    consecutiveUnbeaten: params.consecutiveUnbeaten || 0,
    consecutiveCleanSheets: params.consecutiveCleanSheets || 0,
    hadHatTrick,
    hadComeback,
    isBigWin: isWin && goalDiff >= 3,
    isYouthPromoted: params.isYouthPromoted || false,
    topScorerInLeague: params.topScorerInLeague || false,
  };
}
