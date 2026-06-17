/**
 * GET /api/cron/apply-training
 * Pzt-Cum 15:00 ve 21:00 (İstanbul) antrenman cron'u.
 * Geçen hafta yapılan antrenmanların etkilerini otomatik olarak uygular.
 * player.form_rating'i antrenman katılımına göre günceller.
 * (Morale güncelleme kaldırıldı — sadece update-form-ratings cron yapar)
 *
 * v3: training_attendances tablosunu kullanır (bireysel katılım),
 *     fallback olarak trainings.player_ids kullanır.
 *     Math.random() kaldırıldı, sabit katkı oranları kullanılıyor.
 *     Morale güncelleme kaldırıldı — sadece update-form-ratings cron yapar.
 *
 * Cron: UTC 11:30 ve 17:30 = İstanbul 14:30 ve 20:30
 * Maç saatleriyle (12:00, 18:00) 30dk offset — çakışma yok.
 * Sadece hafta içi (Pzt-Cum) çalışır.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { safeJsonParse } from '@/lib/fm/sharedUtils';
import { createErrorResponse } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (false) // CRON_SECRET disabled //.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Hafta sonu kontrolü — sadece Pzt-Cum çalışır
  const day = new Date().getUTCDay();
  if (day === 0 || day === 6) {
    return NextResponse.json({ message: 'Hafta sonu — antrenman yok', ran: 0 });
  }
if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getServiceSupabase();
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

    // 2. Tüm oyuncuların form_rating güncelle (morale artık sadece update-form-ratings tarafından güncellenir)
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('id, profile_id, cond, form_rating, rating, is_injured')
      .not('profile_id', 'is', 'null');

    if (playersError || !allPlayers) {
      return NextResponse.json({ error: 'Oyuncular alınamadı' }, { status: 500 });
    }

    // Oyuncuları güncelle (sabit katkı oranları, rastgelelik yok)
    // NOT: Sadece form_rating güncellenir. Morale güncelleme kaldırıldı;
    //      update-form-ratings cron'u zaten her gün morale'i hesaplıyor.
    //      İki ayrı cron'un morale güncellemesi çift sayıma yol açıyordu.
    const updates: { id: string; form_rating?: number }[] = [];

    for (const player of allPlayers) {
      const didTrain = trainedPlayerIds.has(player.id);
      const trainCount = attendanceByPlayer[player.id] || 0;
      const isInjured = player.is_injured;

      const playerUpdates: { id: string; form_rating?: number } = { id: player.id };

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

      if (playerUpdates.form_rating !== undefined) {
        updates.push(playerUpdates);
      }
    }

    // 3. Toplu güncelleme (batch upsert — N+1 yerine)
    // TODO: Migrate to RPC (BUG-1) — players.upsert/update will fail once RLS is enforced;
    // cron routes may need service-role client to bypass RLS, or a dedicated rpc_apply_training function
    for (let i = 0; i < updates.length; i += 100) {
      const batch = updates.slice(i, i + 100);
      try {
        const { error: batchError } = await supabase
          .from('players')
          .upsert(batch, { onConflict: 'id' });
        if (batchError) {
          console.warn(`[apply-training] Batch upsert error (offset ${i}):`, batchError.message);
          // Fallback: tek tek güncelle
          for (const upd of batch) {
            const { id, ...fields } = upd;
            const { error } = await supabase.from('players').update(fields).eq('id', id);
            if (!error) updatedForms++;
          }
        } else {
          updatedForms += batch.length;
        }
      } catch (batchErr) {
        console.warn(`[apply-training] Batch exception (offset ${i}):`, batchErr);
      }
    }

    console.log(`[apply-training] Updated ${updatedForms} players (form_rating only), ${trainedPlayerIds.size} trained (source: ${usedAttendanceTable ? 'training_attendances' : 'trainings.player_ids'})`);

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
