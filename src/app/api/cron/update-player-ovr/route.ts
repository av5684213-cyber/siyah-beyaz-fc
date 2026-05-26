/**
 * Cron Job: Haftalık Oyuncu OVR Güncelleme
 *
 * Her Pazar gecesi çalışır (23:00).
 * Her oyuncu için bireysel antrenman katılımına ve maç performansına göre yeni OVR hesaplar:
 *   - Antrenman katkısı: Son 7 gündeki bireysel antrenman katılım sayısı * 0.2 (sabit, rastgelelik yok)
 *   - Maç performans katkısı: Son 5 maç rating ortalaması / 20 (0.15-0.5 arası)
 *   - Potansiyel etkisi: potential > overall ise + (potential - overall) / 10 (en fazla +2)
 *   - Yaş etkisi: 30+ yaş her yıl için -0.5 (en fazla -3)
 *   - Yeni OVR = min(potential, max(40, yeni_değer))
 *   - player_development_log tablosuna kayıt ekler
 *
 * GET /api/cron/update-player-ovr
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { safeJsonParse } from '@/lib/fm/sharedUtils';
import { createErrorResponse } from '@/lib/api-error-handler';

export const maxDuration = 60;

// Sezon haftası hesaplama (basit: yılın kaçıncı haftası)
function getSeasonWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

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
    console.log('[cron/update-player-ovr] Starting weekly OVR update (v2 - individual training)...');
    const startTime = Date.now();
    const seasonWeek = getSeasonWeek();

    // 1. Tüm oyuncuları çek (match_ratings dahil)
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('id, name, rating, potential, age, profile_id, team_name, match_ratings')
      .limit(5000);

    if (playersError) {
      console.error('[cron/update-player-ovr] Players fetch error:', playersError.message);
      return NextResponse.json({ error: playersError.message }, { status: 500 });
    }

    if (!allPlayers || allPlayers.length === 0) {
      return NextResponse.json({ success: true, updated: 0, message: 'No players found' });
    }

    // 2. Son 7 gündeki bireysel antrenman katılımlarını say (training_attendances tablosu)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: attendances, error: attError } = await supabase
      .from('training_attendances')
      .select('player_id')
      .gte('training_date', sevenDaysAgo);

    // player_id → katılım sayısı
    const attendanceByPlayer: Record<string, number> = {};
    if (attendances && !attError) {
      for (const att of attendances) {
        const pid = att.player_id as string;
        attendanceByPlayer[pid] = (attendanceByPlayer[pid] || 0) + 1;
      }
      console.log(`[cron/update-player-ovr] Found ${attendances.length} attendance records for ${Object.keys(attendanceByPlayer).length} players`);
    } else {
      // training_attendances tablosu yoksa fallback: trainings tablosundan profile bazlı
      console.warn('[cron/update-player-ovr] training_attendances not available, falling back to trainings table');
      const { data: recentTrainings } = await supabase
        .from('trainings')
        .select('profile_id, player_ids')
        .gte('training_date', sevenDaysAgo);

      if (recentTrainings) {
        for (const t of recentTrainings) {
          const playerIds = safeJsonParse<string[]>(t.player_ids, []);
          for (const pid of playerIds) {
            attendanceByPlayer[pid] = (attendanceByPlayer[pid] || 0) + 1;
          }
        }
      }
    }

    // 3. Her oyuncu için yeni OVR hesapla
    let updated = 0;
    let increased = 0;
    let decreased = 0;
    const playerUpdates: { id: string; rating: number }[] = [];
    const logEntries: Record<string, unknown>[] = [];

    for (const player of allPlayers) {
      try {
        const baseOvr = player.rating || 50;
        const potential = player.potential || baseOvr;
        const age = player.age || 20;

        // ── Antrenman katkısı (bireysel, sabit oran) ──
        const playerTrainings = attendanceByPlayer[player.id] || 0;
        const trainingContribution = playerTrainings * 0.2; // Sabit: her katılım 0.2 OVR

        // ── Maç performans katkısı (son 5 maç rating ortalaması / 20) ──
        const matchRatings = safeJsonParse<number[]>(player.match_ratings, []);
        let matchPerformanceContribution = 0;
        if (matchRatings.length > 0) {
          const avgRating = matchRatings.reduce((sum: number, r: number) => sum + r, 0) / matchRatings.length;
          // Ortalama rating 1-10 arası. / 20 ile 0.05-0.5 arası katkı ver
          matchPerformanceContribution = avgRating / 20;
        }

        // ── Potansiyel etkisi ──
        let potentialBonus = 0;
        if (potential > baseOvr) {
          potentialBonus = Math.min(2, (potential - baseOvr) / 10);
        }

        // ── Yaş etkisi ──
        let agePenalty = 0;
        if (age >= 30) {
          agePenalty = Math.min(3, (age - 29) * 0.5);
        }

        // ── Yeni OVR hesapla ──
        const totalChange = trainingContribution + matchPerformanceContribution + potentialBonus - agePenalty;
        const newOvr = Math.min(potential || 92, Math.max(40, baseOvr + totalChange));
        const roundedOvr = Math.round(newOvr * 10) / 10;

        // Sadece değişen oyuncuları güncelle
        if (Math.abs(roundedOvr - baseOvr) >= 0.05) {
          playerUpdates.push({ id: player.id, rating: roundedOvr });

          logEntries.push({
            player_id: player.id,
            profile_id: player.profile_id,
            team_name: player.team_name,
            old_ovr: baseOvr,
            new_ovr: roundedOvr,
            change_reason: 'weekly_training',
            training_sessions: playerTrainings,
            training_contribution: Math.round(trainingContribution * 100) / 100,
            match_performance_contribution: Math.round(matchPerformanceContribution * 100) / 100,
            potential_bonus: Math.round(potentialBonus * 100) / 100,
            age_penalty: Math.round(agePenalty * 100) / 100,
            season_week: seasonWeek,
          });

          if (roundedOvr > baseOvr) increased++;
          else decreased++;
          updated++;
        }
      } catch (playerErr) {
        console.error(`[cron/update-player-ovr] Error processing player ${player.id}:`, playerErr);
      }
    }

    // 4. Toplu güncelleme (players tablosu — batch upsert)
    for (let i = 0; i < playerUpdates.length; i += 100) {
      const batch = playerUpdates.slice(i, i + 100);
      try {
        const { error: updateError } = await supabase
          .from('players')
          .upsert(batch, { onConflict: 'id' });

        if (updateError) {
          console.error(`[cron/update-player-ovr] Batch update error (offset ${i}):`, updateError.message);
        }
      } catch (batchErr) {
        console.error(`[cron/update-player-ovr] Batch exception (offset ${i}):`, batchErr);
      }
    }

    // 5. player_development_log tablosuna kayıt ekle
    if (logEntries.length > 0) {
      for (let i = 0; i < logEntries.length; i += 100) {
        const batch = logEntries.slice(i, i + 100);
        try {
          const { error: logError } = await supabase
            .from('player_development_log')
            .insert(batch);

          if (logError) {
            console.warn('[cron/update-player-ovr] Log insert error:', logError.message);
          }
        } catch (logErr) {
          console.error('[cron/update-player-ovr] Log batch error:', logErr);
        }
      }
    }

    const durationMs = Date.now() - startTime;
    console.log(`[cron/update-player-ovr] Done in ${durationMs}ms: ${updated} updated (${increased} up, ${decreased} down)`);

    return NextResponse.json({
      success: true,
      updated,
      increased,
      decreased,
      totalPlayers: allPlayers.length,
      seasonWeek,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/update-player-ovr', method: 'GET' });
  }
}
