/**
 * Cron Job: Haftalık Gençlik Antrenmanı (ADIM 3)
 *
 * Her hafta çalışır:
 * - Tüm genç oyuncuların antrenman simülasyonunu yapar
 * - Tesis seviyelerine göre gelişim hızını hesaplar
 * - Stat artışları, sakatlık kontrolleri uygular
 *
 * Vercel Cron ile haftalık çalışacak şekilde zamanlanır.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processYouthWeeklyTraining, YOUTH_FACILITIES } from '@/lib/fm/youthAcademy';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';

export const maxDuration = 300; // 5 dakika (Vercel limiti)

// Supabase service role client (cron job için admin erişimi)
function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(request: NextRequest) {
  // Cron secret doğrulama (fail-closed, header-only)
  const cronCheck = verifyCronSecret(request);
  if (!cronCheck.valid) {
    return NextResponse.json({ error: cronCheck.error }, { status: 401 });
  }

  try {
    console.log('[cron/youth-training] Starting weekly youth training...');
    const supabase = getServiceSupabase();

    // 1. Tüm genç oyuncuları çek
    const { data: allYouthPlayers, error: youthError } = await supabase
      .from('youth_players')
      .select('*');

    if (youthError) {
      console.error('[cron/youth-training] Error fetching youth players:', youthError.message);
      return NextResponse.json({ error: youthError.message }, { status: 500 });
    }

    if (!allYouthPlayers || allYouthPlayers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No youth players to train',
        trained: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Tüm tesis seviyelerini çek (profile_id bazında)
    const profileIds = [...new Set(allYouthPlayers.map((p: any) => p.profile_id))];
    const { data: facilitiesData } = await supabase
      .from('youth_facilities')
      .select('profile_id, facility_levels')
      .in('profile_id', profileIds);

    // profile_id -> facility_levels map
    const facilitiesMap: Record<string, Record<string, number>> = {};
    if (facilitiesData) {
      for (const row of facilitiesData) {
        const levels = typeof row.facility_levels === 'string'
          ? JSON.parse(row.facility_levels)
          : row.facility_levels;
        facilitiesMap[row.profile_id] = levels || {};
      }
    }

    // 3. Her oyuncuyu antrenman et
    let trained = 0;
    let injured = 0;
    let errors = 0;
    const batchSize = 50;

    for (let i = 0; i < allYouthPlayers.length; i += batchSize) {
      const batch = allYouthPlayers.slice(i, i + batchSize);
      const updates: any[] = [];

      for (const row of batch) {
        try {
          // FacilityState[] oluştur
          const playerFacilities = facilitiesMap[row.profile_id] || {};
          const facilityStates = YOUTH_FACILITIES.map(f => ({
            facilityId: f.id,
            currentLevel: playerFacilities[f.id] ?? 1,
          }));

          // YouthPlayer objesini oluştur (row'dan)
          const youthPlayer = mapRowToYouthPlayer(row);

          // Antrenman simülasyonu
          const trainedPlayer = processYouthWeeklyTraining(youthPlayer, facilityStates);

          if (trainedPlayer.injured && !youthPlayer.injured) injured++;
          trained++;

          // Güncellenmiş oyuncuyu Supabase için hazırla
          updates.push({
            id: trainedPlayer.id,
            profile_id: row.profile_id,
            rating: trainedPlayer.rating,
            potential: trainedPlayer.potential,
            injured: trainedPlayer.injured,
            injury_weeks_remaining: trainedPlayer.injuryWeeksRemaining,
            morale: trainedPlayer.morale,
            confidence: trainedPlayer.confidence,
            cond: trainedPlayer.cond,
            form: trainedPlayer.form,
            total_training_weeks: trainedPlayer.totalTrainingWeeks,
            stats_gained_this_season: JSON.stringify(trainedPlayer.statsGainedThisSeason),
            stats: JSON.stringify(buildStatsObject(trainedPlayer)),
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.error(`[cron/youth-training] Error training player ${row.id}:`, err);
          errors++;
        }
      }

      // Batch update
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('youth_players')
          .upsert(updates, { onConflict: 'id' });

        if (updateError) {
          console.error('[cron/youth-training] Batch update error:', updateError.message);
          errors += updates.length;
        }
      }
    }

    console.log(`[cron/youth-training] Done: ${trained} trained, ${injured} new injuries, ${errors} errors`);

    return NextResponse.json({
      success: true,
      trained,
      newInjuries: injured,
      errors: errors || undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/youth-training] Fatal error:', err);
    return NextResponse.json(
      { error: sanitizeError(err) },
      { status: 500 }
    );
  }
}

// ─── Helper: Supabase row -> YouthPlayer ──────────────────────────────

function mapRowToYouthPlayer(row: any): any {
  const stats = row.stats ? (typeof row.stats === 'string' ? JSON.parse(row.stats) : row.stats) : {};
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    position: row.position,
    specificPosition: row.specific_position,
    rating: row.rating,
    potential: row.potential,
    hidden_potential: row.hidden_potential,
    academyLevel: row.academy_level,
    joinDate: row.join_date,
    weeklyTrainingHours: row.weekly_training_hours,
    totalTrainingWeeks: row.total_training_weeks,
    developmentCurve: row.development_curve,
    isWonderkid: row.is_wonderkid,
    category: row.category,
    injured: row.injured,
    injuryWeeksRemaining: row.injury_weeks_remaining,
    cond: row.cond,
    form: row.form,
    morale: row.morale,
    confidence: row.confidence,
    personalityTraits: row.personality_traits
      ? (typeof row.personality_traits === 'string' ? JSON.parse(row.personality_traits) : row.personality_traits)
      : [],
    traits: row.traits
      ? (typeof row.traits === 'string' ? JSON.parse(row.traits) : row.traits)
      : [],
    traitLevels: row.trait_levels
      ? (typeof row.trait_levels === 'string' ? JSON.parse(row.trait_levels) : row.trait_levels)
      : {},
    statsGainedThisSeason: row.stats_gained_this_season
      ? (typeof row.stats_gained_this_season === 'string' ? JSON.parse(row.stats_gained_this_season) : row.stats_gained_this_season)
      : {},
    scoutReport: row.scout_report
      ? (typeof row.scout_report === 'string' ? JSON.parse(row.scout_report) : row.scout_report)
      : null,
    // Tüm stat'leri stats JSONB'den al
    speed: stats.speed ?? 50,
    passing: stats.passing ?? 50,
    shooting: stats.shooting ?? 50,
    defending: stats.defending ?? 50,
    power: stats.power ?? 50,
    goalkeeping: stats.goalkeeping ?? 15,
    finishing: stats.finishing ?? 50,
    dribbling: stats.dribbling ?? 50,
    firstTouch: stats.firstTouch ?? 50,
    crossing: stats.crossing ?? 50,
    marking: stats.marking ?? 50,
    tackling: stats.tackling ?? 50,
    technique: stats.technique ?? 50,
    longShots: stats.longShots ?? 50,
    offTheBall: stats.offTheBall ?? 50,
    heading: stats.heading ?? 50,
    aggression: stats.aggression ?? 50,
    bravery: stats.bravery ?? 50,
    workRate: stats.workRate ?? 50,
    decisions: stats.decisions ?? 50,
    determination: stats.determination ?? 50,
    concentration: stats.concentration ?? 50,
    leadership: stats.leadership ?? 30,
    anticipation: stats.anticipation ?? 50,
    flair: stats.flair ?? 20,
    positioning: stats.positioning ?? 50,
    composure: stats.composure ?? 50,
    teamwork: stats.teamwork ?? 50,
    vision: stats.vision ?? 50,
    agility: stats.agility ?? 50,
    balance: stats.balance ?? 50,
    strength: stats.strength ?? 50,
    acceleration: stats.acceleration ?? 50,
    jumping: stats.jumping ?? 50,
    stamina: stats.stamina ?? 60,
    control: stats.control ?? 50,
  };
}

// ─── Helper: YouthPlayer -> stats JSONB ───────────────────────────────

function buildStatsObject(player: any): Record<string, number> {
  const statKeys = [
    'speed', 'passing', 'shooting', 'defending', 'power', 'goalkeeping',
    'finishing', 'dribbling', 'firstTouch', 'crossing', 'marking', 'tackling',
    'technique', 'longShots', 'offTheBall', 'heading', 'aggression', 'bravery',
    'workRate', 'decisions', 'determination', 'concentration', 'leadership',
    'anticipation', 'flair', 'positioning', 'composure', 'teamwork', 'vision',
    'agility', 'balance', 'strength', 'acceleration', 'jumping', 'stamina', 'control',
  ];
  const stats: Record<string, number> = {};
  for (const key of statKeys) {
    if (player[key] !== undefined) {
      stats[key] = player[key];
    }
  }
  return stats;
}
