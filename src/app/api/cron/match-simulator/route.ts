/**
 * Cron Job: Maç Simülasyonu — Queue Enqueuer
 *
 * Bu cron artık doğrudan maç simüle ETMEZ.
 * Sadece pending fikstürleri match_simulation_queue tablosuna ekler.
 * Gerçek simülasyon /api/cron/process-match-queue tarafından yapılır.
 *
 * Queue tablosu mevcut değilse, eski davranışa fallback yapar
 * (doğrudan simülasyon — ama maxDuration=60 ile sınırlandırılır).
 *
 * GET /api/cron/match-simulator
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';

export const maxDuration = 60; // Pro plan sınırına uygun

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (false) { // CRON_SECRET disabled
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  let supabase = getServiceSupabase();
    if (!supabase) supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is null' }, { status: 500 });
  }

  try {
    console.log('[cron/match-simulator] Fetching pending fixtures...');

    // 1. Oynanmamış ve bugüne denk gelen fikstürleri bul
    // MatchScheduleManager ile İstanbul saati hesapla
    const { getIstanbulDateTime, shouldPlayLeague } = await import('@/lib/fm/schedule/MatchScheduleManager');
    const istNow = getIstanbulDateTime(new Date());
    const today = istNow.dateStr;
    const dayOfWeek = istNow.dayOfWeek;
    const dayNames = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

    // Takvim kuralı: Bugün lig maçı olmalı mı?
    if (!shouldPlayLeague(dayOfWeek)) {
      console.log(`[cron/match-simulator] Bugün lig maçı yok (${dayNames[dayOfWeek]}). Atlanıyor.`);
      return NextResponse.json({
        success: true,
        message: `Bugün lig maçı yok (${dayNames[dayOfWeek]})`,
        enqueued: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Saat kontrolü: cron hangi saatte çalışıyorsa sadece o saatin maçlarını al
    const currentHour = istNow.hour.toString().padStart(2, '0');
    const matchTimeFilter = `${currentHour}:00`;

    const { data: pendingFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id, tur, season_id, match_date, match_time, status')
      .in('status', ['scheduled'])       // Sadece schedule edilmiş maçlar
      .lte('match_date', today)          // Bugüne kadar olan maçlar
      .or(`match_time.is.null,match_time.eq.${matchTimeFilter}`) // Saat eşleşmeli veya saitsiz (eski fikstürler)
      .in('competition_type', ['league', null]) // Sadece lig maçları (kupa ayrı scheduler)
      .limit(50);

    if (fixturesError) {
      console.error('[cron/match-simulator] Error fetching fixtures:', fixturesError);
      return createErrorResponse(fixturesError, { route: '/api/cron/match-simulator', method: 'GET' });
    }

    if (!pendingFixtures || pendingFixtures.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending fixtures to enqueue',
        enqueued: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Eski fikstürleri (7 günden eski, match_time null) filtrele — çift simülasyon önler
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const eligibleFixtures = pendingFixtures.filter(f => {
      if (!f.match_date) return false;
      if (f.match_date < sevenDaysAgo && !f.match_time) return false; // Eski saatsiz fikstürü atla
      if (!f.match_time) return true;  // Saatsiz ama yakın fikstür (bugüne ait)
      return f.match_time.startsWith(matchTimeFilter); // Saat eşleşmeli
    });

    if (eligibleFixtures.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No eligible fixtures to enqueue (after 7-day filter)',
        enqueued: 0,
        total_pending: pendingFixtures.length,
        filtered: pendingFixtures.length,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[cron/match-simulator] Found ${pendingFixtures.length} pending, ${eligibleFixtures.length} eligible after 7-day filter`);

    // ═══════════════════════════════════════════════════════════════
    // 1b. KULLANICI MAÇLARINI VE KUPA/PLAYOFF FİKSTÜRLERİNİ FİLTRELE
    // match-scheduler + match-tick bunları hallediyor.
    // Bu cron sadece bot-vs-bot LİG maçlarını kuyruğa ekler.
    // ═══════════════════════════════════════════════════════════════
    const { data: profileTeams } = await supabase
      .from('league_teams')
      .select('id, profile_id')
      .not('profile_id', 'is', null);

    const userTeamIds = new Set((profileTeams || []).map((t: any) => t.id));

    const botOnlyLeagueFixtures = eligibleFixtures.filter(f => {
      // Kupa, playoff ve hazırlık fikstürlerini tamamen atla
      // Kupa maçları match-scheduler-cup tarafından halledilir
      const compType = (f as any).competition_type;
      if (compType === 'cup' || compType === 'playoff' || compType === 'friendly') return false;
      // Kullanıcı katılımı olan maçları atla (match-scheduler bunları canlıya alır)
      return !userTeamIds.has(f.home_team_id) && !userTeamIds.has(f.away_team_id);
    });

    console.log(`[cron/match-simulator] After bot-only + league filter: ${botOnlyLeagueFixtures.length} fixtures (removed ${eligibleFixtures.length - botOnlyLeagueFixtures.length} user/cup fixtures)`);

    // 2. Queue tablosuna ekle — çift kayıt önleme ile
    let queueTableExists = true;
    let enqueued = 0;
    let alreadyInQueue = 0;
    const enqueueErrors: string[] = [];

    for (const fixture of botOnlyLeagueFixtures) {
      try {
        // Önce bu fikstür zaten kuyrukta mı kontrol et
        const { data: alreadyQueued } = await supabase
          .from('match_simulation_queue')
          .select('id')
          .eq('fixture_id', fixture.id)
          .in('status', ['pending', 'processing'])
          .maybeSingle();

        if (alreadyQueued) {
          console.log(`[match-simulator] ${fixture.id} already in queue, skip`);
          alreadyInQueue++;
          continue;
        }

        const { error: insertError } = await supabase
          .from('match_simulation_queue')
          .insert({
            fixture_id: fixture.id,
            status: 'pending',
          });

        if (insertError) {
          const errMsg = insertError.message || String(insertError);
          // Unique constraint violation = zaten kuyrukta
          if (errMsg.includes('unique') || errMsg.includes('duplicate') || errMsg.includes('already exists')) {
            alreadyInQueue++;
          } else if (errMsg.includes('does not exist') || errMsg.includes('not found') || errMsg.includes('relation')) {
            queueTableExists = false;
            break;
          } else {
            enqueueErrors.push(`Fixture ${fixture.id}: ${errMsg}`);
          }
        } else {
          enqueued++;
        }
      } catch (insertErr) {
        enqueueErrors.push(`Fixture ${fixture.id}: ${String(insertErr)}`);
      }
    }

    // 3. Queue tablosu mevcut değilse uyarı ver
    if (!queueTableExists) {
      console.warn('[cron/match-simulator] ⚠️ match_simulation_queue tablosu mevcut değil! Migration çalıştırın: supabase/migrations/20250525_add_match_simulation_queue.sql');
      console.warn('[cron/match-simulator] process-match-queue endpoint\'i de bu tabloyu gerektirir.');

      return NextResponse.json({
        success: true,
        mode: 'queue_not_available',
        message: 'match_simulation_queue tablosu mevcut değil. Lütfen migration çalıştırın.',
        pending_fixtures: pendingFixtures.length,
        hint: 'supabase/migrations/20250525_add_match_simulation_queue.sql dosyasını Supabase dashboard\'da çalıştırın.',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      mode: 'queue',
      enqueued,
      already_in_queue: alreadyInQueue,
      total_pending: botOnlyLeagueFixtures.length,
      total_before_filter: pendingFixtures.length,
      user_team_fixtures_filtered: eligibleFixtures.length - botOnlyLeagueFixtures.length,
      errors: enqueueErrors.length > 0 ? enqueueErrors.slice(0, 5) : undefined,
      message: `${enqueued} maç kuyruğa eklendi. /api/cron/process-match-queue tarafından işlenecekler.`,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/match-simulator', method: 'GET' });
  }
}
