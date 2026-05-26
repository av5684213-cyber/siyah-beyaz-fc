/**
 * Cron Job: Günlük Bakım
 *
 * Her gün:
 * - Tüm oyuncuların form_rating değerini hesaplar ve günceller
 * - Antrenman katılımına göre morale günceller (apply-training'den taşındı)
 * - Süresi dolan cezaları ve sakatlıkları temizler
 * - Tüm profillerin level'ini XP'ye göre kontrol eder
 *
 * Vercel Cron ile günlük 03:00'da çalışacak şekilde zamanlanır.
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateAllFormRatings } from '@/lib/fm/formRatingService';
import { cleanupExpiredSuspensionsAndInjuries } from '@/lib/fm/matchConsequencesService';
import { processDailyLevelCheck } from '@/lib/fm/xpLevelFansService';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { safeJsonParse } from '@/lib/fm/sharedUtils';

export const maxDuration = 60; // 5 dakika (Vercel limiti)

// ═══════════════════════════════════════════════════════════════
// Antrenman katılımına göre morale güncelleme (apply-training'den taşındı)
// ═══════════════════════════════════════════════════════════════
async function updateMoraleFromTraining(): Promise<{ updated: number; errors: string[] }> {
  if (!isSupabaseConfigured()) {
    return { updated: 0, errors: ['Supabase not configured'] };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { updated: 0, errors: ['Supabase client is null'] };
  }

  const errors: string[] = [];
  let updated = 0;

  try {
    // 1. Son 7 gündeki bireysel antrenman katılımlarını say
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

    let attendanceByPlayer: Record<string, number> = {};
    let usedAttendanceTable = false;

    const { data: attendances, error: attError } = await supabase
      .from('training_attendances')
      .select('player_id')
      .gte('training_date', oneWeekAgoStr);

    if (attendances && !attError && attendances.length > 0) {
      usedAttendanceTable = true;
      for (const att of attendances) {
        const pid = att.player_id as string;
        attendanceByPlayer[pid] = (attendanceByPlayer[pid] || 0) + 1;
      }
    } else {
      // Fallback: trainings.player_ids'den çıkar
      const { data: trainings } = await supabase
        .from('trainings')
        .select('player_ids')
        .gte('created_at', oneWeekAgo.toISOString());

      if (trainings && Array.isArray(trainings)) {
        for (const t of trainings) {
          const playerIds = safeJsonParse<string[]>(t.player_ids, []);
          for (const pid of playerIds) {
            attendanceByPlayer[pid] = (attendanceByPlayer[pid] || 0) + 1;
          }
        }
      }
    }

    const trainedPlayerIds = new Set(Object.keys(attendanceByPlayer));

    // 2. Tüm oyuncuların morale'ini güncelle (form_rating zaten updateAllFormRatings tarafından güncelleniyor)
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('id, morale, is_injured')
      .not('profile_id', 'is', 'null');

    if (playersError || !allPlayers) {
      return { updated: 0, errors: ['Oyuncular alınamadı'] };
    }

    const moraleUpdates: { id: string; morale: number }[] = [];

    for (const player of allPlayers) {
      const didTrain = trainedPlayerIds.has(player.id);
      const trainCount = attendanceByPlayer[player.id] || 0;
      const isInjured = player.is_injured;

      if (isInjured) continue; // Sakat oyuncuların moralini değiştirme

      const currentMorale = player.morale ?? 70;

      if (didTrain) {
        // Her antrenman katılımı için +1 moral artışı (max +10)
        const moraleGain = Math.min(10, trainCount * 1);
        const newMorale = Math.min(100, Math.round(currentMorale + moraleGain));
        if (newMorale !== currentMorale) {
          moraleUpdates.push({ id: player.id, morale: newMorale });
        }
      } else {
        // Antrenman yapmayanların moral düşer (sabit -2)
        const newMorale = Math.max(20, Math.round(currentMorale - 2));
        if (newMorale !== currentMorale) {
          moraleUpdates.push({ id: player.id, morale: newMorale });
        }
      }
    }

    // 3. Toplu güncelleme
    for (let i = 0; i < moraleUpdates.length; i += 50) {
      const batch = moraleUpdates.slice(i, i + 50);
      for (const upd of batch) {
        const { error } = await supabase
          .from('players')
          .update({ morale: upd.morale })
          .eq('id', upd.id);

        if (!error) updated++;
        else errors.push(`Player ${upd.id}: ${error.message}`);
      }
    }

    console.log(`[update-form-ratings] Morale update: ${updated} players, ${trainedPlayerIds.size} trained (source: ${usedAttendanceTable ? 'training_attendances' : 'trainings.player_ids'})`);
  } catch (err) {
    const errMsg = `Error in updateMoraleFromTraining: ${err}`;
    errors.push(errMsg);
    console.error(`[update-form-ratings] ${errMsg}`);
  }

  return { updated, errors };
}

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    console.log('[cron/update-form-ratings] Starting daily maintenance...');

    // 1. Form rating güncelle
    const formResult = await updateAllFormRatings();
    console.log(`[cron/update-form-ratings] Form ratings: ${formResult.updated} updated, ${formResult.errors.length} errors`);

    // 2. Antrenman katılımına göre morale güncelle (apply-training'den taşındı)
    const moraleResult = await updateMoraleFromTraining();
    console.log(`[cron/update-form-ratings] Morale: ${moraleResult.updated} updated, ${moraleResult.errors.length} errors`);

    // 3. Süresi dolan ceza ve sakatlıkları temizle
    const cleanupResult = await cleanupExpiredSuspensionsAndInjuries();
    console.log(`[cron/update-form-ratings] Cleanup: ${cleanupResult.unsuspended} unsuspended, ${cleanupResult.healed} healed`);

    // 4. Günlük level kontrolü (XP → level senkronizasyonu)
    const levelResult = await processDailyLevelCheck();
    console.log(`[cron/update-form-ratings] Level check: ${levelResult.checked} checked, ${levelResult.leveledUp} leveled up`);

    const allErrors = [
      ...formResult.errors.slice(0, 5),
      ...moraleResult.errors.slice(0, 5),
      ...cleanupResult.errors.slice(0, 5),
      ...levelResult.errors.slice(0, 5),
    ];

    return NextResponse.json({
      success: true,
      formRatingsUpdated: formResult.updated,
      moraleUpdated: moraleResult.updated,
      unsuspended: cleanupResult.unsuspended,
      healed: cleanupResult.healed,
      levelChecked: levelResult.checked,
      levelUps: levelResult.leveledUp,
      errors: allErrors.length > 0 ? allErrors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/update-form-ratings', method: 'GET' });
  }
}
