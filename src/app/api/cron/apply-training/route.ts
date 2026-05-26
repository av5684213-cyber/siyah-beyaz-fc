/**
 * @deprecated Bu route kullanılmıyor ve vercel.json'da kayıtlı değil.
 * İşlevi /api/cron/update-form-ratings cron'una taşındı (zaten günlük çalışıyor).
 * Form rating güncelleme mantığı orada zaten var; gereksiz tekrar.
 *
 * GET /api/cron/apply-training
 * Haftalık cron job — geçen hafta yapılan antrenmanların etkilerini
 * otomatik olarak uygular (eğer client uygulamamışsa).
 * Ayrıca player.form_rating ve player.morale'i antrenman katılımına göre günceller.
 *
 * v2: training_attendances tablosunu kullanır (bireysel katılım),
 *     fallback olarak trainings.player_ids kullanır.
 *     Math.random() kaldırıldı, sabit katkı oranları kullanılıyor.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { safeJsonParse } from '@/lib/fm/sharedUtils';
import { createErrorResponse } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'deprecated', message: 'Bu endpoint devre dışı. İşlevi /api/cron/update-form-ratings cron\'una taşındı.' }, { status: 410 });
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    let updatedForms = 0;

    // 1. Son 7 gündeki bireysel antrenman katılımlarını say
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

    // Önce training_attendances tablosunu dene
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
      console.log(`[apply-training] Using training_attendances: ${attendances.length} records for ${Object.keys(attendanceByPlayer).length} players`);
    } else {
      // Fallback: trainings.player_ids'den çıkar
      console.warn('[apply-training] training_attendances empty or not available, falling back to trainings.player_ids');
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

    // 2. Tüm oyuncuların form_rating ve moralini güncelle
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('id, profile_id, cond, morale, form_rating, rating, is_injured')
      .not('profile_id', 'is', 'null');

    if (playersError || !allPlayers) {
      return NextResponse.json({ error: 'Oyuncular alınamadı' }, { status: 500 });
    }

    // Oyuncuları güncelle (sabit katkı oranları, rastgelelik yok)
    const updates: { id: string; form_rating?: number; morale?: number }[] = [];

    for (const player of allPlayers) {
      const didTrain = trainedPlayerIds.has(player.id);
      const trainCount = attendanceByPlayer[player.id] || 0;
      const isInjured = player.is_injured;

      const playerUpdates: { id: string; form_rating?: number; morale?: number } = { id: player.id };

      // Form rating güncelleme (sabit oranlar)
      const currentForm = player.form_rating ?? player.rating ?? 50;
      if (didTrain && !isInjured) {
        // Her antrenman katılımı için +1.5 form artışı (sabit)
        const formGain = Math.min(15, trainCount * 1.5);
        playerUpdates.form_rating = Math.min(99, Math.round(currentForm + formGain));
      } else if (!isInjured) {
        // Antrenman yapmayan oyuncuların formu düşer (sabit -3)
        playerUpdates.form_rating = Math.max(30, Math.round(currentForm - 3));
      }

      // Moral güncelleme (sabit oranlar)
      const currentMorale = player.morale ?? 70;
      if (didTrain && !isInjured) {
        // Her antrenman katılımı için +1 moral artışı
        const moraleGain = Math.min(10, trainCount * 1);
        playerUpdates.morale = Math.min(100, Math.round(currentMorale + moraleGain));
      } else if (!didTrain && !isInjured) {
        // Antrenman yapmayanların moral düşer (sabit -2)
        playerUpdates.morale = Math.max(20, Math.round(currentMorale - 2));
      }

      if (playerUpdates.form_rating !== undefined || playerUpdates.morale !== undefined) {
        updates.push(playerUpdates);
      }
    }

    // 3. Toplu güncelleme
    for (let i = 0; i < updates.length; i += 50) {
      const batch = updates.slice(i, i + 50);
      for (const upd of batch) {
        const { id, ...fields } = upd;
        const { error } = await supabase
          .from('players')
          .update(fields)
          .eq('id', id);

        if (!error) updatedForms++;
      }
    }

    console.log(`[apply-training] Updated ${updatedForms} players, ${trainedPlayerIds.size} trained (source: ${usedAttendanceTable ? 'training_attendances' : 'trainings.player_ids'})`);

    return NextResponse.json({
      success: true,
      trainedPlayers: trainedPlayerIds.size,
      updatedForms,
      source: usedAttendanceTable ? 'training_attendances' : 'trainings.player_ids',
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/apply-training', method: 'GET' });
  }
}
