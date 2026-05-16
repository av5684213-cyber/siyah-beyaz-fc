/**
 * Cron Job: Haftalık Oyuncu OVR Güncelleme
 *
 * Her Pazar gecesi çalışır.
 * Her oyuncu için yeni OVR hesaplar:
 *   - Antrenman katkısı: Son 7 gündeki antrenman sayısı * (0.1-0.5)
 *   - Potansiyel etkisi: potential > overall ise + (potential - overall) / 10 (en fazla +2)
 *   - Yaş etkisi: 30+ yaş her yıl için -0.5 (en fazla -3)
 *   - Yeni OVR = min(92, max(40, yeni_değer))
 *   - player_development_log tablosuna kayıt ekler
 *
 * GET /api/cron/update-player-ovr
 * Header: x-cron-secret veya Query: ?secret=<CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const cronCheck = verifyCronSecret(request);
  if (!cronCheck.valid) {
    return NextResponse.json({ error: cronCheck.error }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is null' }, { status: 500 });
  }

  try {
    console.log('[cron/update-player-ovr] Starting weekly OVR update...');

    // 1. Tüm oyuncuları çek
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('id, name, rating, potential, age, profile_id, team_name')
      .limit(5000);

    if (playersError) {
      console.error('[cron/update-player-ovr] Players fetch error:', playersError.message);
      return NextResponse.json({ error: playersError.message }, { status: 500 });
    }

    if (!allPlayers || allPlayers.length === 0) {
      return NextResponse.json({ success: true, updated: 0, message: 'No players found' });
    }

    // 2. Son 7 gündeki antrenmanları çek (training_count per profile_id)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: recentTrainings } = await supabase
      .from('trainings')
      .select('profile_id, total_players')
      .gte('training_date', sevenDaysAgo);

    // profile_id → training session count
    const trainingCountByProfile: Record<string, number> = {};
    if (recentTrainings) {
      for (const t of recentTrainings) {
        const pid = t.profile_id as string;
        trainingCountByProfile[pid] = (trainingCountByProfile[pid] || 0) + 1;
      }
    }

    // 3. Her oyuncu için yeni OVR hesapla
    let updated = 0;
    let increased = 0;
    let decreased = 0;
    const logEntries: Record<string, unknown>[] = [];
    const batchSize = 100;

    for (let i = 0; i < allPlayers.length; i += batchSize) {
      const batch = allPlayers.slice(i, i + batchSize);

      for (const player of batch) {
        try {
          const baseOvr = player.rating || 50;
          const potential = player.potential || baseOvr;
          const age = player.age || 20;

          // Antrenman katkısı
          const profileTrainings = trainingCountByProfile[player.profile_id] || 0;
          const trainingContribution = profileTrainings * (0.1 + Math.random() * 0.4); // 0.1-0.5 per session

          // Potansiyel etkisi
          let potentialBonus = 0;
          if (potential > baseOvr) {
            potentialBonus = Math.min(2, (potential - baseOvr) / 10);
          }

          // Yaş etkisi
          let agePenalty = 0;
          if (age >= 30) {
            agePenalty = Math.min(3, (age - 29) * 0.5);
          }

          // Yeni OVR hesapla
          const newOvr = Math.min(92, Math.max(40, baseOvr + trainingContribution + potentialBonus - agePenalty));
          const roundedOvr = Math.round(newOvr * 10) / 10;

          // Sadece değişen oyuncuları güncelle
          if (Math.abs(roundedOvr - baseOvr) >= 0.1) {
            logEntries.push({
              player_id: player.id,
              profile_id: player.profile_id,
              team_name: player.team_name,
              old_ovr: baseOvr,
              new_ovr: roundedOvr,
              training_sessions: profileTrainings,
              training_contribution: Math.round(trainingContribution * 100) / 100,
              potential_bonus: Math.round(potentialBonus * 100) / 100,
              age_penalty: Math.round(agePenalty * 100) / 100,
              updated_at: new Date().toISOString(),
            });

            if (roundedOvr > baseOvr) increased++;
            else decreased++;
            updated++;
          }
        } catch (playerErr) {
          console.error(`[cron/update-player-ovr] Error processing player ${player.id}:`, playerErr);
        }
      }
    }

    // 4. Toplu güncelleme (player tablosu)
    for (const log of logEntries) {
      try {
        await supabase
          .from('players')
          .update({ rating: log.new_ovr })
          .eq('id', log.player_id);
      } catch (updateErr) {
        console.error(`[cron/update-player-ovr] Update error for player ${log.player_id}:`, updateErr);
      }
    }

    // 5. player_development_log tablosuna kayıt ekle
    if (logEntries.length > 0) {
      try {
        // Tablo yoksa oluştur mantığı — upsert ile
        const { error: logError } = await supabase
          .from('player_development_log')
          .insert(logEntries.slice(0, 500)); // Max 500 kayıt

        if (logError) {
          // Tablo mevcut olmayabilir — oluştur ve tekrar dene
          console.warn('[cron/update-player-ovr] Log insert error (table may not exist):', logError.message);
          console.log('[cron/update-player-ovr] Skipping development log. Run migration SQL to create player_development_log table.');
        }
      } catch (logErr) {
        console.error('[cron/update-player-ovr] Log error:', logErr);
      }
    }

    console.log(`[cron/update-player-ovr] Done: ${updated} updated (${increased} increased, ${decreased} decreased)`);

    return NextResponse.json({
      success: true,
      updated,
      increased,
      decreased,
      totalPlayers: allPlayers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/update-player-ovr] Fatal error:', err);
    return NextResponse.json(
      { error: sanitizeError(err) },
      { status: 500 }
    );
  }
}
