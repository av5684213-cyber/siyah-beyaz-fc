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
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { processYouthWeeklyTraining, YOUTH_FACILITIES } from '@/lib/fm/youthAcademy';
import { mapYouthPlayerFromRow, buildStatsObject } from '@/lib/fm/sharedUtils';
import { createErrorResponse } from '@/lib/api-error-handler';

export const maxDuration = 60; // 5 dakika (Vercel limiti)

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is null' }, { status: 500 });
  }

  try {
    console.log('[cron/youth-training] Starting weekly youth training...');

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
    const profileIds = [...new Set(allYouthPlayers.map((p: Record<string, unknown>) => p.profile_id as string))];
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
        facilitiesMap[row.profile_id as string] = levels || {};
      }
    }

    // 3. Her oyuncuyu antrenman et
    let trained = 0;
    let injured = 0;
    let errors = 0;
    const batchSize = 50;

    for (let i = 0; i < allYouthPlayers.length; i += batchSize) {
      const batch = allYouthPlayers.slice(i, i + batchSize);
      const updates: Record<string, unknown>[] = [];

      for (const row of batch) {
        try {
          // FacilityState[] oluştur
          const profileId = (row as Record<string, unknown>).profile_id as string;
          const playerFacilities = facilitiesMap[profileId] || {};
          const facilityStates = YOUTH_FACILITIES.map(f => ({
            facilityId: f.id,
            currentLevel: playerFacilities[f.id] ?? 1,
          }));

          // YouthPlayer objesini oluştur — merkezi mapYouthPlayerFromRow kullanarak
          const youthPlayer = mapYouthPlayerFromRow(row as Record<string, unknown>);

          // Antrenman simülasyonu
          const trainedPlayer = processYouthWeeklyTraining(youthPlayer, facilityStates);

          if (trainedPlayer.injured && !youthPlayer.injured) injured++;
          trained++;

          // Güncellenmiş oyuncuyu Supabase için hazırla — merkezi buildStatsObject kullanarak
          updates.push({
            id: trainedPlayer.id,
            profile_id: profileId,
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
            stats: JSON.stringify(buildStatsObject(trainedPlayer as Record<string, unknown>)),
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.error(`[cron/youth-training] Error training player ${(row as Record<string, unknown>).id}:`, err);
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
    return createErrorResponse(err, { route: '/api/cron/youth-training', method: 'GET' });
  }
}
