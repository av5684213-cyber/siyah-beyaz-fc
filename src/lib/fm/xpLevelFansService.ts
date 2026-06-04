/**
 * XP/Level/Fans System Service
 *
 * Provides functions for:
 * - Awarding XP based on match results (win/draw/loss)
 * - Level checking and level-up logic
 * - Fans adjustment based on match results
 * - Weekly fans natural fluctuation based on team performance
 *
 * XP Awards:
 * - Win: +50 XP, +100 fans
 * - Draw: +20 XP, +30 fans
 * - Loss: +5 XP, -10 fans
 *
 * Level formula: 1000 * level XP required to reach next level
 * Example: Level 1 → 2 needs 1000 XP, Level 2 → 3 needs 2000 XP, etc.
 */

import { getSupabase, isSupabaseConfigured } from '../supabase';
import { createErrorResponse } from '@/lib/api-error-handler';

// ═══════════════════════════════════════════════════════════════════
// XP CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const XP_REWARDS = {
  WIN: 50,
  DRAW: 20,
  LOSS: 5,
  CUP_WIN: 75,        // Bonus for cup matches
  CUP_FINAL_WIN: 150, // Bonus for cup final
  DERBY_WIN: 60,      // Bonus for derby
  SEASON_CHAMPION: 500,
  SEASON_PROMOTION: 200,
  SEASON_RELEGATION: 0,
} as const;

export const FANS_REWARDS = {
  WIN: 100,
  DRAW: 30,
  LOSS: -10,
  CUP_WIN: 150,
  CUP_FINAL_WIN: 300,
  DERBY_WIN: 120,
  SEASON_CHAMPION: 1000,
  SEASON_PROMOTION: 500,
  SEASON_RELEGATION: -200,
} as const;

// ═══════════════════════════════════════════════════════════════════
// LEVEL CALCULATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate required XP for a given level.
 * Formula: sum of (1000 * i) for i = 1 to level-1
 * Level 1 = 0 XP, Level 2 = 1000 XP, Level 3 = 3000 XP, Level 4 = 6000 XP, etc.
 */
export function getRequiredXpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Sum: 1000 * (1 + 2 + ... + (level-1)) = 1000 * (level-1) * level / 2
  return 1000 * (level - 1) * level / 2;
}

/**
 * Calculate the level for a given XP amount.
 */
export function calculateLevel(xp: number): number {
  // Solve: 1000 * (n-1) * n / 2 <= xp
  // n^2 - n - 2*xp/1000 <= 0
  // n = (1 + sqrt(1 + 8*xp/1000)) / 2
  if (xp <= 0) return 1;
  const level = Math.floor((1 + Math.sqrt(1 + 8 * xp / 1000)) / 2);
  return Math.max(1, level);
}

/**
 * Get XP needed to reach the next level from current XP.
 */
export function getXpToNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const nextLevelXp = getRequiredXpForLevel(currentLevel + 1);
  return nextLevelXp - currentXp;
}

// ═══════════════════════════════════════════════════════════════════
// MATCH RESULT XP/FANS AWARDING
// ═══════════════════════════════════════════════════════════════════

export interface MatchResultAward {
  profileId: string;
  xpGained: number;
  fansGained: number;
  newLevel: number;
  leveledUp: boolean;
}

/**
 * Award XP and fans based on match result.
 * Called after a match is completed (from match simulator or weekly processing).
 */
export async function awardMatchXpAndFans(
  profileId: string,
  result: 'win' | 'draw' | 'loss',
  matchType?: 'normal' | 'derby' | 'cup' | 'cup_final' | 'friendly'
): Promise<MatchResultAward | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, xp, level, fans, stadium_upgrades')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      console.error('[xpLevelFans] Profile not found:', profileId, profileError);
      return null;
    }

    // Calculate XP reward
    let xpGained = 0;
    let fansGained = 0;

    if (result === 'win') {
      xpGained = XP_REWARDS.WIN;
      fansGained = FANS_REWARDS.WIN;
      if (matchType === 'cup') { xpGained = XP_REWARDS.CUP_WIN; fansGained = FANS_REWARDS.CUP_WIN; }
      if (matchType === 'cup_final') { xpGained = XP_REWARDS.CUP_FINAL_WIN; fansGained = FANS_REWARDS.CUP_FINAL_WIN; }
      if (matchType === 'derby') { xpGained = XP_REWARDS.DERBY_WIN; fansGained = FANS_REWARDS.DERBY_WIN; }
    } else if (result === 'draw') {
      xpGained = XP_REWARDS.DRAW;
      fansGained = FANS_REWARDS.DRAW;
    } else {
      xpGained = XP_REWARDS.LOSS;
      fansGained = FANS_REWARDS.LOSS;
    }

    // Friendly matches give half rewards
    if (matchType === 'friendly') {
      xpGained = Math.floor(xpGained * 0.5);
      fansGained = Math.floor(fansGained * 0.5);
    }

    // Skor Tabelası bonusu — her maç sonrası ekstra taraftar
    try {
      const { getScoreboardFanBonus } = await import('@/lib/fm/stadiumMatrix');
      const stadiumUpgrades = typeof (profile as any).stadium_upgrades === 'string'
        ? JSON.parse((profile as any).stadium_upgrades)
        : ((profile as any).stadium_upgrades || {});
      const scoreboardLevel = stadiumUpgrades.scoreboards || 0;
      if (scoreboardLevel > 0) {
        const fanMultiplier = getScoreboardFanBonus(scoreboardLevel); // 1.0 + level * 0.02
        const bonusFans = Math.round(fansGained * (fanMultiplier - 1.0));
        fansGained += bonusFans;
      }
    } catch {}

    const newXp = (profile.xp || 0) + xpGained;
    const newFans = Math.max(0, (profile.fans || 0) + fansGained);
    const newLevel = calculateLevel(newXp);
    const leveledUp = newLevel > (profile.level || 1);

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        xp: newXp,
        level: newLevel,
        fans: newFans,
      })
      .eq('id', profileId);

    if (updateError) {
      console.error('[xpLevelFans] Profile update error:', updateError);
      return null;
    }

    // If leveled up, send notification
    if (leveledUp) {
      try {
        const { sendPushToProfile } = await import('@/lib/push-notifications');
        await sendPushToProfile(profileId, {
          title: `Seviye Atlama! 🎉`,
          body: `Tebrikler! Seviye ${newLevel}'e ulaştınız!`,
          icon: '/icon-192x192.png',
        });
      } catch {}
    }

    return {
      profileId,
      xpGained,
      fansGained,
      newLevel,
      leveledUp,
    };
  } catch (err) {
    console.error('[xpLevelFans] awardMatchXpAndFans error:', err);
    return null;
  }
}

/**
 * Batch award XP and fans for multiple match results.
 * Used by the match simulator cron after processing fixtures.
 */
export async function batchAwardMatchXpAndFans(
  results: Array<{
    profileId: string;
    result: 'win' | 'draw' | 'loss';
    matchType?: 'normal' | 'derby' | 'cup' | 'cup_final' | 'friendly';
  }>
): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;

  for (const r of results) {
    try {
      const award = await awardMatchXpAndFans(r.profileId, r.result, r.matchType);
      if (award) {
        processed++;
      }
    } catch (err) {
      errors.push(`Profile ${r.profileId}: ${err}`);
    }
  }

  return { processed, errors };
}

// ═══════════════════════════════════════════════════════════════════
// WEEKLY FANS FLUCTUATION (CRON)
// ═══════════════════════════════════════════════════════════════════

/**
 * Simulate weekly natural fans fluctuation based on team performance.
 * - Top teams gain fans naturally
 * - Bottom teams lose fans naturally
 * - Mid-table teams have small random changes
 * Called by weekly cron.
 */
export async function processWeeklyFansFluctuation(): Promise<{
  processed: number;
  errors: string[];
}> {
  if (!isSupabaseConfigured()) return { processed: 0, errors: ['Supabase not configured'] };

  const supabase = getSupabase();
  if (!supabase) return { processed: 0, errors: ['Supabase client is null'] };

  const errors: string[] = [];
  let processed = 0;

  try {
    // Get all profiles with their league positions
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, fans, league_name, is_bot')
      .is('is_bot', null); // Only real users

    if (profileError || !profiles) {
      return { processed: 0, errors: [profileError?.message || 'No profiles'] };
    }

    for (const profile of profiles) {
      try {
        const currentFans = profile.fans || 100;

        // Get the user's league position
        const { data: teamData } = await supabase
          .from('league_teams')
          .select('id, league_id, points, played')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (!teamData) continue;

        // Get standings to determine position
        const { data: standings } = await supabase
          .from('league_standings')
          .select('team_id, points')
          .eq('league_id', teamData.league_id)
          .order('points', { ascending: false });

        if (!standings) continue;

        const position = standings.findIndex((s: any) => s.team_id === teamData.id) + 1;
        const totalTeams = standings.length;

        // Calculate fans fluctuation based on position
        let fansChange = 0;

        if (position <= 3) {
          // Top 3: gain fans (more for higher position)
          fansChange = Math.floor(Math.random() * 50) + (4 - position) * 20;
        } else if (position <= Math.floor(totalTeams / 2)) {
          // Upper mid-table: small random gain
          fansChange = Math.floor(Math.random() * 20) - 5;
        } else if (position > totalTeams - 3) {
          // Bottom 3: lose fans
          fansChange = -(Math.floor(Math.random() * 30) + (position - totalTeams + 3) * 15);
        } else {
          // Lower mid-table: small random loss
          fansChange = -(Math.floor(Math.random() * 15)) + 5;
        }

        // Apply minimum fans threshold
        const newFans = Math.max(10, currentFans + fansChange);

        await supabase
          .from('profiles')
          .update({ fans: newFans })
          .eq('id', profile.id);

        processed++;
      } catch (err) {
        errors.push(`Profile ${profile.id}: ${err}`);
      }
    }
  } catch (err) {
    errors.push(`Fatal: ${err}`);
  }

  return { processed, errors };
}

// ═══════════════════════════════════════════════════════════════════
// DAILY LEVEL CHECK (CRON)
// ═══════════════════════════════════════════════════════════════════

/**
 * Check all profiles and update their level based on XP.
 * Called by daily cron.
 * This ensures level stays in sync even if individual updates fail.
 */
export async function processDailyLevelCheck(): Promise<{
  checked: number;
  leveledUp: number;
  errors: string[];
}> {
  if (!isSupabaseConfigured()) return { checked: 0, leveledUp: 0, errors: ['Supabase not configured'] };

  const supabase = getSupabase();
  if (!supabase) return { checked: 0, leveledUp: 0, errors: ['Supabase client is null'] };

  const errors: string[] = [];
  let checked = 0;
  let leveledUp = 0;

  try {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, xp, level, is_bot')
      .is('is_bot', null);

    if (profileError || !profiles) {
      return { checked: 0, leveledUp: 0, errors: [profileError?.message || 'No profiles'] };
    }

    for (const profile of profiles) {
      try {
        const currentXp = profile.xp || 0;
        const currentLevel = profile.level || 1;
        const calculatedLevel = calculateLevel(currentXp);

        if (calculatedLevel !== currentLevel) {
          await supabase
            .from('profiles')
            .update({ level: calculatedLevel })
            .eq('id', profile.id);

          if (calculatedLevel > currentLevel) {
            leveledUp++;
          }
        }

        checked++;
      } catch (err) {
        errors.push(`Profile ${profile.id}: ${err}`);
      }
    }
  } catch (err) {
    errors.push(`Fatal: ${err}`);
  }

  return { checked, leveledUp, errors };
}
