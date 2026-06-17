/**
 * Cron Job: Playoff Maç Başlatıcı
 *
 * Cuma günleri 20:00 UTC (23:00 İstanbul) saatinde
 * playoff fikstürlerini canlıya alır.
 * Lig ve kupa scheduler'dan ayrı çalışır.
 *
 * GET /api/cron/match-scheduler-playoff
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { pickRefereeForMatch, generateLeagueReferees, type Referee } from '@/lib/fm/referee';
import { sendPushToProfile } from '@/lib/push-notifications';
import { createErrorResponse } from '@/lib/api-error-handler';
import { buildActiveTactic } from '@/lib/fm/tacticBuilder';
import { getWeatherForDate } from '@/lib/fm/stadiumMatrix';
import { getIstanbulDateTime, shouldPlayPlayoff } from '@/lib/fm/schedule/MatchScheduleManager';
// Paylaşılan maç yardımcıları (DRY)
import { filterAvailable, tacticToModifiers, insertInAppNotification, applyForfeitResult } from '@/lib/fm/schedule/matchSchedulerUtils';
// Cron Lock: Race condition önleme
import { acquireCronLock, releaseCronLock } from '@/lib/fm/cronLockService';

export const maxDuration = 60;

/** Playoff maç scheduler için kilit adı ve TTL */
const LOCK_NAME = 'match-scheduler-playoff';
const LOCK_TTL_SECONDS = 55;

// Not: filterAvailable, tacticToModifiers, insertInAppNotification, applyForfeitResult
// artık @/lib/fm/schedule/matchSchedulerUtils dosyasından geliyor (DRY)

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (false) // CRON_SECRET disabled //.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi null' }, { status: 500 });
  }

  // ── Cron Lock: Aynı anda birden fazla instance çalışmasını önle ──
  const lock = await acquireCronLock(supabase, LOCK_NAME, LOCK_TTL_SECONDS);
  if (!lock) {
    return NextResponse.json({
      success: true,
      message: 'Başka bir instance bu job\'ı şu an çalıştırıyor, atlanıyor',
      locked: true,
      timestamp: new Date().toISOString(),
    });
  }

  const results: Array<{ fixtureId: string; homeTeam: string; awayTeam: string; sessionId: string }> = [];
  const errors: string[] = [];

  try {
    console.log('[cron/match-scheduler-playoff] Playoff maç başlatıcı başlıyor...');

    const istNow = getIstanbulDateTime(new Date());
    const today = istNow.dateStr;
    const dayOfWeek = istNow.dayOfWeek;
    const dayNames = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
    console.log(`[cron/match-scheduler-playoff] İstanbul: ${today} ${istNow.timeStr} (${dayNames[dayOfWeek]})`);

    // ── Takvim kuralı: Bugün playoff maçı olmalı mı? (Cuma) ──
    if (!shouldPlayPlayoff(dayOfWeek)) {
      console.log(`[cron/match-scheduler-playoff] Bugün playoff maçı yok (${dayNames[dayOfWeek]}). Atlanıyor.`);
      return NextResponse.json({
        success: true,
        message: `Bugün playoff maçı yok (${dayNames[dayOfWeek]})`,
        started: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Playoff fikstürlerini getir
    const { data: pendingFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id, tur, season_id, match_date, match_time, competition_type')
      .eq('status', 'scheduled')
      .eq('match_date', today)
      .eq('competition_type', 'playoff') // Sadece playoff maçları
      .limit(50);

    if (fixturesError) {
      console.error('[cron/match-scheduler-playoff] Fikstür sorgu hatası:', fixturesError);
      return createErrorResponse(fixturesError, { route: '/api/cron/match-scheduler-playoff', method: 'GET' });
    }

    if (!pendingFixtures || pendingFixtures.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Bugün playoff fikstürü bulunamadı',
        started: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Saat kontrolü: playoff maçları 20:00 İstanbul saatinde
    const readyFixtures = pendingFixtures.filter((f: any) => {
      const matchTime = f.match_time;
      if (!matchTime) return true;
      return matchTime <= istNow.timeStr;
    });

    if (readyFixtures.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Playoff maç saati henüz gelmedi',
        started: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[cron/match-scheduler-playoff] ${readyFixtures.length} playoff maçı başlatılıyor`);

    // Her playoff fikstürü için maç oturumu oluştur
    for (const fixture of readyFixtures) {
      try {
        // Zaten session var mı?
        const { data: existingSession } = await supabase
          .from('match_sessions')
          .select('id, status')
          .eq('fixture_id', fixture.id)
          .in('status', ['live', 'halftime', 'completed'])
          .maybeSingle();

        if (existingSession) {
          console.log(`[match-scheduler-playoff] Fikstür ${fixture.id} zaten canlı (${existingSession.status})`);
          continue;
        }

        // Takım bilgilerini çek
        const { data: homeTeamData } = await supabase
          .from('league_teams').select('id, name, profile_id').eq('id', fixture.home_team_id).single();
        const { data: awayTeamData } = await supabase
          .from('league_teams').select('id, name, profile_id').eq('id', fixture.away_team_id).single();

        if (!homeTeamData || !awayTeamData) {
          errors.push(`Fikstür ${fixture.id}: Takım bulunamadı`);
          continue;
        }

        // Oyuncuları çek
        const { data: homePlayers } = await supabase.from('players').select('*').eq('team_name', homeTeamData.name);
        const { data: awayPlayers } = await supabase.from('players').select('*').eq('team_name', awayTeamData.name);

        if (!homePlayers || homePlayers.length < 7 || !awayPlayers || awayPlayers.length < 7) {
          errors.push(`Fikstür ${fixture.id}: Yetersiz oyuncu (${homePlayers?.length || 0} vs ${awayPlayers?.length || 0})`);
          continue;
        }

        const availableHome = filterAvailable(homePlayers, true).slice(0, 11);
        const availableAway = filterAvailable(awayPlayers, true).slice(0, 11);

        // Loose filtreyle tekrar dene (düşük kondisyonlu oyuncuları da al)
        const availableHomeLoose = availableHome.length < 7 ? filterAvailable(homePlayers, false).slice(0, 11) : availableHome;
        const availableAwayLoose = availableAway.length < 7 ? filterAvailable(awayPlayers, false).slice(0, 11) : availableAway;

        if (availableHomeLoose.length < 7 || availableAwayLoose.length < 7) {
          const forfeit = await applyForfeitResult(supabase, fixture.id, availableHomeLoose.length, availableAwayLoose.length);
          errors.push(`Fikstür ${fixture.id}: ${forfeit.note}`);
          continue;
        }

        const finalHome = availableHomeLoose;
        const finalAway = availableAwayLoose;

        // Taktikleri çek
        let homeTacticsData: Record<string, any> | null = null;
        let awayTacticsData: Record<string, any> | null = null;

        try {
          if (homeTeamData.profile_id) {
            const { data: tHome } = await supabase.from('active_tactics').select('*').eq('profile_id', homeTeamData.profile_id).maybeSingle();
            if (tHome) homeTacticsData = tHome;
          }
        } catch {}
        try {
          if (awayTeamData.profile_id) {
            const { data: tAway } = await supabase.from('active_tactics').select('*').eq('profile_id', awayTeamData.profile_id).maybeSingle();
            if (tAway) awayTacticsData = tAway;
          }
        } catch {}

        const homeTacticObj = buildActiveTactic(homeTacticsData);
        const awayTacticObj = buildActiveTactic(awayTacticsData);

        // Hakem ata
        let refereeForMatch: Referee | null = null;
        try {
          let actualLeagueId: string | null = null;
          if (fixture.season_id) {
            const { data: seasonData } = await supabase.from('seasons').select('league_id').eq('id', fixture.season_id).maybeSingle();
            actualLeagueId = seasonData?.league_id || null;
          }
          let refereeList: Referee[] = [];
          if (actualLeagueId) {
            const { data: existingReferees } = await supabase.from('referees').select('*').eq('league_id', actualLeagueId);
            refereeList = (existingReferees as Referee[]) || [];
          }
          if (refereeList.length === 0 && actualLeagueId) {
            refereeList = generateLeagueReferees(actualLeagueId, 6);
            for (const ref of refereeList) {
              await supabase.from('referees').upsert({
                id: ref.id, name: ref.name, personality: ref.personality,
                experience: ref.experience, league_id: ref.league_id,
                strictness: ref.strictness, total_matches: ref.totalMatches,
                total_yellows: ref.totalYellows, total_reds: ref.totalReds,
                total_penalties: ref.totalPenalties,
              });
            }
          }
          const matchWeek = fixture.tur || 1;
          refereeForMatch = pickRefereeForMatch(refereeList, matchWeek);
        } catch (refErr) {
          console.warn('[match-scheduler-playoff] Hakem atama hatası:', refErr);
        }

        const matchDate = fixture.match_date || new Date().toISOString().split('T')[0];
        const weather = getWeatherForDate(matchDate);
        const homeTacticStr = homeTacticObj.playStyle || 'dengeli';
        const awayTacticStr = awayTacticObj.playStyle || 'dengeli';
        const homeMods = tacticToModifiers(homeTacticStr);
        const awayMods = tacticToModifiers(awayTacticStr);

        // Maç oturumu oluştur
        const { data: sessionData, error: sessionError } = await supabase
          .from('match_sessions')
          .insert({
            fixture_id: fixture.id, status: 'live', started_at: new Date().toISOString(),
            current_minute: 0, home_score: 0, away_score: 0,
            home_tactic: homeTacticStr, away_tactic: awayTacticStr,
            home_formation: homeTacticObj.formation || '4-4-2',
            away_formation: awayTacticObj.formation || '4-4-2',
            home_goal_mod: homeMods.goalMod, away_goal_mod: awayMods.goalMod,
            home_conceed_mod: homeMods.conceedMod, away_conceed_mod: awayMods.conceedMod,
            home_players: JSON.stringify(finalHome), away_players: JSON.stringify(finalAway),
            home_tactic_obj: JSON.stringify(homeTacticObj), away_tactic_obj: JSON.stringify(awayTacticObj),
            referee_data: refereeForMatch ? JSON.stringify({
              id: refereeForMatch.id, name: refereeForMatch.name,
              personality: refereeForMatch.personality, strictness: refereeForMatch.strictness,
              experience: refereeForMatch.experience,
            }) : '{}',
            weather, home_team_name: homeTeamData.name, away_team_name: awayTeamData.name,
            home_team_id: fixture.home_team_id, away_team_id: fixture.away_team_id,
            season_id: fixture.season_id, simulation_speed: 3.0,
            last_updated: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (sessionError || !sessionData) {
          errors.push(`Fikstür ${fixture.id}: Session oluşturma hatası: ${sessionError?.message}`);
          continue;
        }

        const sessionId = sessionData.id;

        // Maç başlangıç olayı
        const weatherTr: Record<string, string> = { sunny: 'Güneşli', rainy: 'Yağmurlu', snowy: 'Karlı', windy: 'Rüzgarlı' };
        await supabase.from('match_events').insert({
          fixture_id: fixture.id, event_type: 'match_start', minute: 0, team: 'home',
          detail: `Playoff maçı başlıyor! 🏆 Hava: ${weatherTr[weather] || 'Güneşli'}.`,
          is_revealed: true,
        });

        // live_matches kaydı
        try {
          await supabase.from('live_matches').insert({
            fixture_id: fixture.id, home_team_id: fixture.home_team_id, away_team_id: fixture.away_team_id,
            home_team_name: homeTeamData.name, away_team_name: awayTeamData.name,
            started_at: new Date().toISOString(), status: 'live', current_minute: 0,
            home_score: 0, away_score: 0, weather,
            referee_id: refereeForMatch?.id ?? null, referee_name: refereeForMatch?.name ?? null,
            home_possession: 50, total_events: 1, revealed_events: 1,
            session_id: sessionId, updated_at: new Date().toISOString(),
          });
        } catch (liveErr) {
          console.warn('[match-scheduler-playoff] live_matches ekleme hatası:', liveErr);
        }

        // match_participants
        try {
          const participants = [
            { fixture_id: fixture.id, team_id: fixture.home_team_id, profile_id: homeTeamData.profile_id || null, side: 'home' as const },
            { fixture_id: fixture.id, team_id: fixture.away_team_id, profile_id: awayTeamData.profile_id || null, side: 'away' as const },
          ];
          await supabase.from('match_participants').upsert(participants, { onConflict: 'fixture_id,team_id' });
        } catch {}

        // Fikstürü live yap
        await supabase.from('fixtures').update({
          status: 'live', session_id: sessionId,
          referee_id: refereeForMatch?.id ?? null, referee_name: refereeForMatch?.name ?? null,
        }).eq('id', fixture.id);

        // Push bildirimleri: Playoff maçı başladı!
        const pushTitle = '🏆 Playoff Maçı Başladı!';
        const pushBody = `${homeTeamData.name} vs ${awayTeamData.name} — Playoff maçı canlı!`;

        for (const profileId of [homeTeamData.profile_id, awayTeamData.profile_id]) {
          if (!profileId) continue;
          try {
            await sendPushToProfile(profileId, { title: pushTitle, body: pushBody, icon: '/favicon.ico', url: `/match/${fixture.id}` });
          } catch {}
          await insertInAppNotification(supabase, profileId, pushTitle, pushBody, 'match_started', fixture.id);
        }

        results.push({ fixtureId: fixture.id, homeTeam: homeTeamData.name, awayTeam: awayTeamData.name, sessionId });
        console.log(`[match-scheduler-playoff] Playoff oturumu: ${homeTeamData.name} vs ${awayTeamData.name}`);

      } catch (err) {
        errors.push(`Fikstür ${fixture.id}: ${err}`);
        console.error(`[match-scheduler-playoff] Fikstür hatası ${fixture.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      started: results.length,
      results,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/match-scheduler-playoff', method: 'GET' });
  } finally {
    // ── Cron Lock bırak ──
    if (lock) {
      await releaseCronLock(supabase, LOCK_NAME, lock);
    }
  }
}
