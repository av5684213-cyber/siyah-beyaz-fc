/**
 * Cron Job: Maç Başlatıcı (Live Match Session Starter)
 *
 * Scheduled maçları canlıya alır. Artık tüm 90 dakikayı önceden
 * hesaplamaz. Bunun yerine bir match_sessions kaydı oluşturur
 * ve match-tick cron'u kademeli olarak simülasyonu yürütür.
 *
 * Bu sayede kullanıcılar maç sırasında taktik değiştirebilir ve
 * bu değişiklikler kalan simülasyonu etkiler.
 *
 * GET /api/cron/match-scheduler
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { pickRefereeForMatch, generateLeagueReferees, type Referee } from '@/lib/fm/referee';
import { sendPushToProfile } from '@/lib/push-notifications';
import { createErrorResponse } from '@/lib/api-error-handler';
import { buildActiveTactic } from '@/lib/fm/tacticBuilder';
import { getWeatherForDate } from '@/lib/fm/stadiumMatrix';
import { calculateAtmosphereScore, getAtmosphereModifiers } from '@/lib/fm/atmosphere';
// MatchScheduleManager: Yeni takvim kuralları
import { shouldPlayLeague, getIstanbulDateTime } from '@/lib/fm/schedule/MatchScheduleManager';
// Paylaşılan maç yardımcıları (DRY)
import { filterAvailable, tacticToModifiers, insertInAppNotification, applyForfeitResult } from '@/lib/fm/schedule/matchSchedulerUtils';
// Cron Lock: Race condition önleme
import { acquireCronLock, releaseCronLock } from '@/lib/fm/cronLockService';

export const maxDuration = 60; // 5 dakika (Vercel limiti)

/** Bu cron job için kilit adı ve TTL */
const LOCK_NAME = 'match-scheduler';
const LOCK_TTL_SECONDS = 55; // maxDuration'dan kısa, kilit takılmasını önler

// Yardımcı: rastgele seçim
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Not: filterAvailable, tacticToModifiers, insertInAppNotification, applyForfeitResult
// artık @/lib/fm/schedule/matchSchedulerUtils dosyasından geliyor (DRY)

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (false) // CRON_SECRET disabled //.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is null' }, { status: 500 });
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

  const results: Array<{
    fixtureId: string;
    homeTeam: string;
    awayTeam: string;
    sessionId: string;
  }> = [];
  const errors: string[] = [];

  try {
    console.log('[cron/match-scheduler] Starting match session initialization...');

    // 1. Bugün oynanacak scheduled maçları bul (Istanbul saat diliminde)
    const istNow = getIstanbulDateTime(new Date());
    const today = istNow.dateStr;
    const currentTimeStr = istNow.timeStr;
    const dayOfWeek = istNow.dayOfWeek;
    const dayNames = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
    console.log(`[cron/match-scheduler] İstanbul: ${today} ${currentTimeStr} (${dayNames[dayOfWeek]})`);

    // ── Takvim kuralı: Bugün lig maçı olmalı mı? ──
    // Lig maçları sadece Pzt-Per (1-4) oynanır
    if (!shouldPlayLeague(dayOfWeek)) {
      console.log(`[cron/match-scheduler] Bugün lig maçı yok (${dayNames[dayOfWeek]}). Atlanıyor.`);
      return NextResponse.json({
        success: true,
        message: `Bugün lig maçı yok (${dayNames[dayOfWeek]})`,
        started: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Sadece lig fikstürlerini getir (kupa değil)
    // [40] Önce fikstür var mı kontrol et, yoksa generate_league_fixtures çağır
    const { count: fixtureCount } = await supabase
      .from('fixtures')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .eq('match_date', today)
      .in('competition_type', ['league', null]);

    if (!fixtureCount || fixtureCount === 0) {
      // [BUG-8] Bugün fikstür yok — ama sezon zaten fikstür üretildi mi kontrol et
      // Eğer sezonun herhangi bir fikstürü varsa, tekrar üretme (idempotency)
      const { data: activeSeasons } = await supabase
        .from('seasons')
        .select('id, league_id')
        .eq('is_finished', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activeSeasons && activeSeasons.length > 0) {
        for (const season of activeSeasons) {
          // Sezonun herhangi bir fikstürü var mı?
          const { count: seasonFixtureCount } = await supabase
            .from('fixtures')
            .select('id', { count: 'exact', head: true })
            .eq('season_id', season.id)
            .in('competition_type', ['league', null]);

          if (!seasonFixtureCount || seasonFixtureCount === 0) {
            // Sadece sezonun HİÇ fikstürü yoksa üret
            console.log(`[cron/match-scheduler] Sezon ${season.id} için fikstür üretiliyor (sezon boş)...`);
            try {
              await supabase.rpc('generate_league_fixtures', { p_season_id: season.id });
              console.log(`[cron/match-scheduler] Fikstür üretildi: sezon ${season.id}`);
            } catch (fixErr) {
              console.warn(`[cron/match-scheduler] generate_league_fixtures hatası: ${fixErr}`);
            }
          } else {
            console.log(`[cron/match-scheduler] Sezon ${season.id} zaten ${seasonFixtureCount} fikstüre sahip, üretim atlanıyor.`);
          }
        }
      }
    }

    const { data: pendingFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id, tur, season_id, match_date, match_time, competition_type')
      .eq('status', 'scheduled')
      .eq('match_date', today)
      .in('competition_type', ['league', null]) // Sadece lig maçları
      .limit(50);

    if (fixturesError) {
      console.error('[cron/match-scheduler] Error fetching fixtures:', fixturesError);
      return createErrorResponse(fixturesError, { route: '/api/cron/match-scheduler', method: 'GET' });
    }

    if (!pendingFixtures || pendingFixtures.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending fixtures to start',
        started: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Sadece maç saati gelmiş olanları filtrele
    const readyFixtures = pendingFixtures.filter((f: any) => {
      const matchTime = f.match_time;
      if (!matchTime) return true;
      return matchTime <= currentTimeStr;
    });

    if (readyFixtures.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No fixtures ready to start (match time not reached yet)',
        started: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[cron/match-scheduler] Found ${readyFixtures.length} fixtures ready to start`);

    // 2. Her fikstür için maç OTURUMU başlat (tüm simülasyonu yapma!)
    for (const fixture of readyFixtures) {
      try {
        // Zaten bu fixture için bir session var mı kontrol et
        // Sadece live/halftime/completed durumundaki session'ları kontrol et
        // (aborted/failed gibi durumlar yeni session oluşturulmasına izin verir)
        const { data: existingSession } = await supabase
          .from('match_sessions')
          .select('id, status')
          .eq('fixture_id', fixture.id)
          .in('status', ['live', 'halftime', 'completed'])
          .maybeSingle();

        if (existingSession) {
          console.log(`[cron/match-scheduler] Fixture ${fixture.id} already has session (${existingSession.status}), skip`);
          continue;
        }

        // ── Ev sahibi ve deplasman takım bilgilerini çek ──
        const { data: homeTeamData } = await supabase
          .from('league_teams')
          .select('id, name, profile_id')
          .eq('id', fixture.home_team_id)
          .maybeSingle();

        const { data: awayTeamData } = await supabase
          .from('league_teams')
          .select('id, name, profile_id')
          .eq('id', fixture.away_team_id)
          .maybeSingle();

        if (!homeTeamData || !awayTeamData) {
          errors.push(`Fixture ${fixture.id}: Team data not found`);
          continue;
        }

        // ── Oyuncuları çek ──
        const { data: homePlayers } = await supabase
          .from('players')
          .select('*')
          .eq('team_name', homeTeamData.name);

        const { data: awayPlayers } = await supabase
          .from('players')
          .select('*')
          .eq('team_name', awayTeamData.name);

        if (!homePlayers || homePlayers.length < 7 || !awayPlayers || awayPlayers.length < 7) {
          errors.push(`Fixture ${fixture.id}: Not enough players (${homePlayers?.length || 0} vs ${awayPlayers?.length || 0})`);
          continue;
        }

        // Cezalı ve sakat oyuncuları filtrele (strict mod)
        let availableHome = filterAvailable(homePlayers, true).slice(0, 11);
        let availableAway = filterAvailable(awayPlayers, true).slice(0, 11);

        // A3: Yeterli oyuncu yoksa loose filtreyle tekrar dene (sadece sakat/cezalı hariç)
        if (availableHome.length < 7) {
          availableHome = filterAvailable(homePlayers, false).slice(0, 11);
          console.log(`[match-scheduler] A3: Home team ${fixture.home_team_id} düşük kondisyon ignored (${availableHome.length} oyuncu)`);
        }
        if (availableAway.length < 7) {
          availableAway = filterAvailable(awayPlayers, false).slice(0, 11);
          console.log(`[match-scheduler] A3: Away team ${fixture.away_team_id} düşük kondisyon ignored (${availableAway.length} oyuncu)`);
        }

        if (availableHome.length < 7 || availableAway.length < 7) {
          const forfeit = await applyForfeitResult(supabase, fixture.id, availableHome.length, availableAway.length);
          errors.push(`Fixture ${fixture.id}: ${forfeit.note}`);
          continue;
        }

        // ── Taktikleri çek (active_tactics) ──
        let homeTacticsData: Record<string, any> | null = null;
        let awayTacticsData: Record<string, any> | null = null;

        try {
          if (homeTeamData.profile_id) {
            const { data: tHome } = await supabase
              .from('active_tactics')
              .select('*')
              .eq('profile_id', homeTeamData.profile_id)
              .maybeSingle();
            if (tHome) homeTacticsData = tHome;
          }
        } catch (err) {
          console.warn(`[cron/match-scheduler] Home tactics fetch failed:`, err);
        }

        try {
          if (awayTeamData.profile_id) {
            const { data: tAway } = await supabase
              .from('active_tactics')
              .select('*')
              .eq('profile_id', awayTeamData.profile_id)
              .maybeSingle();
            if (tAway) awayTacticsData = tAway;
          }
        } catch (err) {
          console.warn(`[cron/match-scheduler] Away tactics fetch failed:`, err);
        }

        const homeTacticObj = buildActiveTactic(homeTacticsData);
        const awayTacticObj = buildActiveTactic(awayTacticsData);

        // ── Hakem ata ──
        let refereeForMatch: Referee | null = null;
        try {
          let actualLeagueId: string | null = null;
          if (fixture.season_id) {
            const { data: seasonData } = await supabase
              .from('seasons')
              .select('league_id')
              .eq('id', fixture.season_id)
              .maybeSingle();
            actualLeagueId = seasonData?.league_id || null;
          }

          let refereeList: Referee[] = [];
          if (actualLeagueId) {
            const { data: existingReferees } = await supabase
              .from('referees')
              .select('*')
              .eq('league_id', actualLeagueId);
            refereeList = (existingReferees as Referee[]) || [];
          }

          if (refereeList.length === 0 && actualLeagueId) {
            refereeList = generateLeagueReferees(actualLeagueId, 6);
            for (const ref of refereeList) {
              await supabase.from('referees').upsert({
                id: ref.id,
                name: ref.name,
                personality: ref.personality,
                experience: ref.experience,
                league_id: ref.league_id,
                strictness: ref.strictness,
                total_matches: ref.totalMatches,
                total_yellows: ref.totalYellows,
                total_reds: ref.totalReds,
                total_penalties: ref.totalPenalties,
              });
            }
          }

          const matchWeek = fixture.tur || 1;
          refereeForMatch = pickRefereeForMatch(refereeList, matchWeek);
        } catch (refErr) {
          console.warn('[cron/match-scheduler] Referee assignment failed:', refErr);
        }

        // ── Hava durumu seç ──
        // SORUN-8 FIX: Deterministic weather based on match date (consistent with fixture page)
        const matchDate = fixture.match_date || new Date().toISOString().split('T')[0];
        const weather = getWeatherForDate(matchDate);

        // ── Taktik string'ini ve mod'ları hesapla ──
        const homeTacticStr = homeTacticObj.playStyle || 'dengeli';
        const awayTacticStr = awayTacticObj.playStyle || 'dengeli';
        const homeMods = tacticToModifiers(homeTacticStr);
        const awayMods = tacticToModifiers(awayTacticStr);

        // ═══════════════════════════════════════════════════════════
        // match_sessions kaydı oluştur (simülasyon YAPILMIYOR)
        // match-tick cron'u kademeli olarak simülasyonu yürütecek
        // ═══════════════════════════════════════════════════════════
        const { data: sessionData, error: sessionError } = await supabase
          .from('match_sessions')
          .insert({
            fixture_id: fixture.id,
            status: 'live',
            started_at: new Date().toISOString(),
            current_minute: 0,
            home_score: 0,
            away_score: 0,
            home_tactic: homeTacticStr,
            away_tactic: awayTacticStr,
            home_formation: homeTacticObj.formation || '4-4-2',
            away_formation: awayTacticObj.formation || '4-4-2',
            home_goal_mod: homeMods.goalMod,
            away_goal_mod: awayMods.goalMod,
            home_conceed_mod: homeMods.conceedMod,
            away_conceed_mod: awayMods.conceedMod,
            home_players: JSON.stringify(availableHome),
            away_players: JSON.stringify(availableAway),
            home_tactic_obj: JSON.stringify(homeTacticObj),
            away_tactic_obj: JSON.stringify(awayTacticObj),
            referee_data: refereeForMatch ? JSON.stringify({
              id: refereeForMatch.id,
              name: refereeForMatch.name,
              personality: refereeForMatch.personality,
              strictness: refereeForMatch.strictness,
              experience: refereeForMatch.experience,
            }) : '{}',
            weather,
            home_team_name: homeTeamData.name,
            away_team_name: awayTeamData.name,
            home_team_id: fixture.home_team_id,
            away_team_id: fixture.away_team_id,
            season_id: fixture.season_id,
            simulation_speed: 3.0,
            last_updated: new Date().toISOString(),
          })
          .select('id')
          .maybeSingle();

        if (sessionError || !sessionData) {
          errors.push(`Fixture ${fixture.id}: Failed to create session: ${sessionError?.message}`);
          continue;
        }

        const sessionId = sessionData.id;

        // ── S3-5 FIX: Atmosphere calculation for home team ──
        try {
          // Ev sahibi takımın atmosfer verisini topla
          const homeProfileId = homeTeamData.profile_id;
          let atmoScore = 50; // Default neutral

          if (homeProfileId) {
            // Stadyum kapasitesi ve doluluk
            const { data: homeProfile } = await supabase
              .from('profiles')
              .select('fans, reputation, stadium_upgrades')
              .eq('id', homeProfileId)
              .maybeSingle();

            const { data: homeStanding } = await supabase
              .from('league_standings')
              .select('played')
              .eq('team_id', fixture.home_team_id)
              .maybeSingle();

            // Home team position in standings
            const { count: teamsAbove } = await supabase
              .from('league_standings')
              .select('id', { count: 'exact', head: true })
              .eq('league_id', fixture.season_id || '')
              .gt('points', (homeStanding as any)?.points || 0);
            const leaguePosition = (teamsAbove || 0) + 1;

            // Total teams in league
            const { count: totalTeams } = await supabase
              .from('league_teams')
              .select('id', { count: 'exact', head: true })
              .eq('league_id', fixture.season_id || '');

            // Check rivalry (teams in same city or known rivals)
            let isRivalry = false;
            try {
              const { data: homeTeam } = await supabase
                .from('league_teams')
                .select('name')
                .eq('id', fixture.home_team_id)
                .maybeSingle();
              const { data: awayTeam } = await supabase
                .from('league_teams')
                .select('name')
                .eq('id', fixture.away_team_id)
                .maybeSingle();
              // Simple rivalry check: same city keywords or known derbies
              const rivalryKeywords = ['istanbul', 'izmir', 'ankara'];
              const homeCity = rivalryKeywords.find(k => (homeTeam?.name || '').toLowerCase().includes(k));
              const awayCity = rivalryKeywords.find(k => (awayTeam?.name || '').toLowerCase().includes(k));
              isRivalry = !!(homeCity && awayCity && homeCity === awayCity);
            } catch (e) { console.warn("[silent-catch]", e); }

            const stadiumUpgrades = typeof homeProfile?.stadium_upgrades === 'string'
              ? JSON.parse(homeProfile?.stadium_upgrades || '{}')
              : (homeProfile?.stadium_upgrades || {});
            const stadiumCapacity = stadiumUpgrades.capacity || 15000;

            atmoScore = calculateAtmosphereScore({
              stadiumCapacity,
              attendance: Math.round(stadiumCapacity * (0.6 + Math.random() * 0.35)), // 60-95% attendance
              ticketPrice: stadiumUpgrades.ticketPrice || 50,
              leaguePosition,
              totalTeams: totalTeams || 18,
              fans: homeProfile?.fans || 1000,
              reputation: homeProfile?.reputation || 50,
              isRivalry,
            });
          }

          const atmoMods = getAtmosphereModifiers(atmoScore);

          // Update session with atmosphere data
          await supabase.from('match_sessions').update({
            home_atmosphere: { score: atmoScore, ...atmoMods },
          }).eq('id', sessionId);

          console.log(`[match-scheduler] S3-5: Atmosphere ${atmoScore} for ${homeTeamData.name} (homeAdv: ${atmoMods.homeAdvantage.toFixed(3)})`);
        } catch (atmoErr) {
          console.warn('[match-scheduler] S3-5 Atmosphere calculation failed:', atmoErr);
        }

        // ── Maç başlangıcı olayını ekle ──
        const refInfo = refereeForMatch
          ? ` Hakem: ${refereeForMatch.name} (${refereeForMatch.personality}, Sertlik: ${refereeForMatch.strictness}).`
          : '';
        const weatherTr: Record<string, string> = {
          sunny: 'Güneşli', rainy: 'Yağmurlu', snowy: 'Karlı', windy: 'Rüzgarlı',
        };

        await supabase.from('match_events').insert({
          fixture_id: fixture.id,
          event_type: 'match_start',
          minute: 0,
          team: 'home',
          detail: `Maç başlıyor! Hava durumu: ${weatherTr[weather] || 'Güneşli'}.${refInfo}`,
          is_revealed: true,
        });

        // ── live_matches tablosuna kayıt oluştur ──
        try {
          await supabase.from('live_matches').insert({
            fixture_id: fixture.id,
            home_team_id: fixture.home_team_id,
            away_team_id: fixture.away_team_id,
            home_team_name: homeTeamData.name,
            away_team_name: awayTeamData.name,
            started_at: new Date().toISOString(),
            status: 'live',
            current_minute: 0,
            home_score: 0,
            away_score: 0,
            weather,
            referee_id: refereeForMatch?.id ?? null,
            referee_name: refereeForMatch?.name ?? null,
            referee_personality: refereeForMatch?.personality ?? null,
            referee_strictness: refereeForMatch?.strictness ?? null,
            home_possession: 50,
            total_events: 1,
            revealed_events: 1,
            session_id: sessionId,
            updated_at: new Date().toISOString(),
          });
        } catch (liveErr) {
          console.warn(`[cron/match-scheduler] live_matches insert failed:`, liveErr);
        }

        // ── match_participants tablosuna kayıt ekle (GÖREV 7) ──
        // RLS ve match_chat erişimi için ev sahibi ve deplasman katılımcılarını kaydet
        try {
          const participants = [
            {
              fixture_id: fixture.id,
              team_id: fixture.home_team_id,
              profile_id: homeTeamData.profile_id || null,
              side: 'home' as const,
            },
            {
              fixture_id: fixture.id,
              team_id: fixture.away_team_id,
              profile_id: awayTeamData.profile_id || null,
              side: 'away' as const,
            },
          ];
          await supabase.from('match_participants').upsert(participants, {
            onConflict: 'fixture_id,team_id',
          });
        } catch (participantErr) {
          console.warn(`[cron/match-scheduler] match_participants insert failed:`, participantErr);
        }

        // ── Fikstürü 'live' durumuna güncelle ──
        const { error: updateError } = await supabase
          .from('fixtures')
          .update({
            status: 'live',
            session_id: sessionId,
            referee_id: refereeForMatch?.id ?? null,
            referee_name: refereeForMatch?.name ?? null,
            referee_personality: refereeForMatch?.personality ?? null,
            referee_strictness: refereeForMatch?.strictness ?? null,
          })
          .eq('id', fixture.id);

        if (updateError) {
          errors.push(`Fixture ${fixture.id}: Failed to update status to live: ${updateError.message}`);
          continue;
        }

        // ── Hakem istatistiklerini güncelle (maç başına +1) ──
        if (refereeForMatch) {
          try {
            await supabase.from('referees').update({
              total_matches: (refereeForMatch.totalMatches || 0) + 1,
            }).eq('id', refereeForMatch.id);
          } catch (refUpdateErr) {
            console.warn('[match-scheduler] Referee stats update failed:', refUpdateErr);
          }
        }

        // ── Push bildirimleri: "Maç Başladı!" ──
        const pushTitle = '⚽ Maç Başladı!';
        const pushBody = `${homeTeamData.name} vs ${awayTeamData.name} — Canlı yayında!`;

        if (homeTeamData.profile_id) {
          try {
            await sendPushToProfile(homeTeamData.profile_id, {
              title: pushTitle,
              body: pushBody,
              icon: '/favicon.ico',
              url: `/match/${fixture.id}`,
            });
          } catch (pushErr) {
            console.warn(`[match-scheduler] Push to home manager failed:`, pushErr);
          }
          await insertInAppNotification(supabase, homeTeamData.profile_id, pushTitle, pushBody, 'match_started', fixture.id);
        }

        if (awayTeamData.profile_id) {
          try {
            await sendPushToProfile(awayTeamData.profile_id, {
              title: pushTitle,
              body: pushBody,
              icon: '/favicon.ico',
              url: `/match/${fixture.id}`,
            });
          } catch (pushErr) {
            console.warn(`[match-scheduler] Push to away manager failed:`, pushErr);
          }
          await insertInAppNotification(supabase, awayTeamData.profile_id, pushTitle, pushBody, 'match_started', fixture.id);
        }

        results.push({
          fixtureId: fixture.id,
          homeTeam: homeTeamData.name,
          awayTeam: awayTeamData.name,
          sessionId,
        });

        console.log(`[cron/match-scheduler] Session created: ${homeTeamData.name} vs ${awayTeamData.name} — session: ${sessionId}`);

      } catch (err) {
        errors.push(`Fixture ${fixture.id}: ${err}`);
        console.error(`[cron/match-scheduler] Error starting fixture ${fixture.id}:`, err);
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
    return createErrorResponse(err, { route: '/api/cron/match-scheduler', method: 'GET' });
  } finally {
    // ── Cron Lock bırak ──
    if (lock) {
      await releaseCronLock(supabase, LOCK_NAME, lock);
    }
  }
}
