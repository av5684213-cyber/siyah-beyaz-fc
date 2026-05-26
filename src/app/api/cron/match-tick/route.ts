/**
 * @deprecated Bu route kullanılmıyor ve vercel.json'da kayıtlı değil.
 * Bırakılan mimari: match_sessions tabanlı tick simülasyonu.
 * Aktif simülasyon: /api/cron/process-match-queue kullanılıyor.
 *
 * Cron Job: Maç Tick (Artırımlı Canlı Maç Simülasyonu)
 *
 * Her 1-2 dakikada bir çağrılır. Canlı maçları ilerletir:
 * - match_sessions'den mevcut oturumu okur
 * - Son simüle edilen dakikadan itibaren birkaç dakikalık simülasyon yapar
 * - Olayları match_events tablosuna yazar (is_revealed=true)
 * - Taktik değişiklikleri kalan simülasyonu etkiler
 * - Supabase Realtime üzerinden tüm bağlı istemcilere yayın yapılır
 * - Devre arası ve maç sonu durumlarını yönetir
 * - Maç sonunda kart cezaları, sakatlıklar ve puan durumunu günceller
 *
 * GET /api/cron/match-tick
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { simulateEnhancedMatch, type EnhancedMatchResult, type Weather } from '@/lib/fm/enhancedMatchEngine';
import { applyCardSuspensions, applyMatchInjuries } from '@/lib/fm/matchConsequencesService';
import { sendPushToProfile } from '@/lib/push-notifications';
import type { Player, ActiveTactic } from '@/lib/fm/types';
import { createErrorResponse } from '@/lib/api-error-handler';

export const maxDuration = 60; // 5 dakika

// ═══════════════════════════════════════════════════════════════
// Simülasyon hızı: 1 gerçek dakika = kaç maç dakikası?
// Varsayılan: 2 (90 dk maç ~ 45 gerçek dakikada biter)
// ═══════════════════════════════════════════════════════════════
const DEFAULT_SIMULATION_SPEED = 2;

// Devre arası gerçek hayatta kaç dakika sürer
const HALFTIME_REAL_DURATION_MINUTES = 2;

// Her tick'te simüle edilecek maksimum dakika sayısı
const MAX_MINUTES_PER_TICK = 6;

// ═══════════════════════════════════════════════════════════════
// In-app notification helper (graceful)
// ═══════════════════════════════════════════════════════════════
async function insertInAppNotification(
  supabase: any,
  profileId: string,
  title: string,
  body: string,
  type: string,
  fixtureId?: string,
): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      profile_id: profileId,
      title,
      body,
      type,
      fixture_id: fixtureId || null,
      read: false,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[match-tick] In-app notification insert skipped:', err);
  }
}

// ═══════════════════════════════════════════════════════════════
// Lig puan tablosu güncelleme
// ═══════════════════════════════════════════════════════════════
async function updateLeagueStandings(
  supabase: any,
  seasonId: string,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
): Promise<void> {
  try {
    const { data: homeStanding } = await supabase
      .from('league_standings')
      .select('*')
      .eq('team_id', homeTeamId)
      .eq('season_id', seasonId)
      .single();

    if (homeStanding) {
      const updated = {
        played: (homeStanding.played || 0) + 1,
        won: (homeStanding.won || 0) + (homeScore > awayScore ? 1 : 0),
        drawn: (homeStanding.drawn || 0) + (homeScore === awayScore ? 1 : 0),
        lost: (homeStanding.lost || 0) + (homeScore < awayScore ? 1 : 0),
        gf: (homeStanding.gf || 0) + homeScore,
        ga: (homeStanding.ga || 0) + awayScore,
        points: (homeStanding.points || 0) + (homeScore > awayScore ? 3 : homeScore === awayScore ? 1 : 0),
      };
      await supabase.from('league_standings').update(updated).eq('id', homeStanding.id);
    }

    const { data: awayStanding } = await supabase
      .from('league_standings')
      .select('*')
      .eq('team_id', awayTeamId)
      .eq('season_id', seasonId)
      .single();

    if (awayStanding) {
      const updated = {
        played: (awayStanding.played || 0) + 1,
        won: (awayStanding.won || 0) + (awayScore > homeScore ? 1 : 0),
        drawn: (awayStanding.drawn || 0) + (awayScore === homeScore ? 1 : 0),
        lost: (awayStanding.lost || 0) + (awayScore < homeScore ? 1 : 0),
        gf: (awayStanding.gf || 0) + awayScore,
        ga: (awayStanding.ga || 0) + homeScore,
        points: (awayStanding.points || 0) + (awayScore > homeScore ? 3 : awayScore === homeScore ? 1 : 0),
      };
      await supabase.from('league_standings').update(updated).eq('id', awayStanding.id);
    }
  } catch (err) {
    console.error('[match-tick] Error updating standings:', err);
  }
}

// ═══════════════════════════════════════════════════════════════
// Artırımlı simülasyon: Sadece fromMinute → toMinute arası
// ═══════════════════════════════════════════════════════════════
function simulateIncremental(
  homePlayers: Player[],
  awayPlayers: Player[],
  homeTactic: ActiveTactic,
  awayTactic: ActiveTactic,
  fromMinute: number,
  toMinute: number,
  options: {
    homeTeamName: string;
    awayTeamName: string;
    refereeStrictness?: number;
    refereePersonality?: any;
    refereeName?: string;
    weather?: Weather;
    homeGoalMod?: number;
    awayGoalMod?: number;
    homeConceedMod?: number;
    awayConceedMod?: number;
  }
): EnhancedMatchResult {
  // Tüm maçı simüle et, ama sadece fromMinute-toMinute arasındaki olayları al
  const fullResult = simulateEnhancedMatch(
    homePlayers,
    awayPlayers,
    homeTactic,
    awayTactic,
    {
      homeTeamName: options.homeTeamName,
      awayTeamName: options.awayTeamName,
      refereeStrictness: options.refereeStrictness,
      refereePersonality: options.refereePersonality,
      refereeName: options.refereeName,
      weather: options.weather,
      homeTacticModifiers: {
        goalMod: options.homeGoalMod || 0,
        conceedMod: options.homeConceedMod || 0,
      },
      awayTacticModifiers: {
        goalMod: options.awayGoalMod || 0,
        conceedMod: options.awayConceedMod || 0,
      },
    }
  );

  // Sadece istenen dakika aralığındaki olayları filtrele
  const filteredEvents = fullResult.events.filter(e => e.minute >= fromMinute && e.minute <= toMinute);

  // Skoru bu aralıktaki gollere göre hesapla
  let homeScore = 0;
  let awayScore = 0;
  for (const evt of filteredEvents) {
    if (evt.type === 'goal') {
      if (evt.team === 'home') homeScore++;
      else if (evt.team === 'away') awayScore++;
    }
  }

  return {
    ...fullResult,
    events: filteredEvents,
    homeScore,
    awayScore,
  };
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'deprecated', message: 'Bu endpoint devre dışı. Aktif simülasyon: /api/cron/process-match-queue' }, { status: 410 });
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

  const tickResults: Array<{
    fixtureId: string;
    currentMinute: number;
    newEvents: number;
    status: string;
  }> = [];
  const errors: string[] = [];

  try {
    console.log('[cron/match-tick] Starting incremental match tick...');

    // ═══════════════════════════════════════════════════════════
    // 1. Canlı maç oturumlarını bul (match_sessions tablosundan)
    // ═══════════════════════════════════════════════════════════
    let liveSessions: any[] = [];

    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('match_sessions')
        .select('*')
        .in('status', ['live', 'halftime']);

      if (sessionsError) {
        console.warn('[match-tick] match_sessions query failed:', sessionsError.message);
      } else {
        liveSessions = sessionsData || [];
      }
    } catch (sessionErr) {
      console.warn('[match-tick] match_sessions table may not exist:', sessionErr);
    }

    // Fallback: match_sessions yoksa, live_matches tablosundan devam et (eski sistem)
    if (liveSessions.length === 0) {
      console.log('[match-tick] No match_sessions found, checking live_matches fallback...');
      try {
        const { data: liveData } = await supabase
          .from('live_matches')
          .select('*')
          .in('status', ['live', 'halftime']);

        if (liveData && liveData.length > 0) {
          // Eski sistem: Önceden hesaplanmış olayları açığa çıkar
          for (const liveMatch of liveData) {
            await tickLegacyMatch(supabase, liveMatch, errors, tickResults);
          }

          if (tickResults.length > 0) {
            return NextResponse.json({
              success: true,
              mode: 'legacy',
              ticked: tickResults.length,
              results: tickResults,
              errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (liveErr) {
        console.warn('[match-tick] live_matches fallback also failed:', liveErr);
      }

      return NextResponse.json({
        success: true,
        message: 'No live matches to tick',
        ticked: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[cron/match-tick] Found ${liveSessions.length} live sessions`);

    // ═══════════════════════════════════════════════════════════
    // 2. Her canlı maç oturumunu ilerlet
    // ═══════════════════════════════════════════════════════════
    for (const session of liveSessions) {
      try {
        const fixtureId = session.fixture_id;
        const startedAt = new Date(session.started_at).getTime();
        const nowMs = Date.now();
        const simSpeed = session.simulation_speed || DEFAULT_SIMULATION_SPEED;

        // ── Geçen gerçek süreyi hesapla ──
        let elapsedRealMinutes: number;

        if (session.status === 'halftime') {
          const firstHalfRealMinutes = 45 / simSpeed;
          const halftimeStartedAt = startedAt + firstHalfRealMinutes * 60000;
          const halftimeElapsed = (nowMs - halftimeStartedAt) / 60000;

          if (halftimeElapsed < HALFTIME_REAL_DURATION_MINUTES) {
            // Devre arası devam ediyor
            tickResults.push({
              fixtureId,
              currentMinute: 45,
              newEvents: 0,
              status: 'halftime',
            });
            continue;
          }

          // Devre arası bitti, ikinci yarı başlıyor
          const secondHalfStartedAt = halftimeStartedAt + HALFTIME_REAL_DURATION_MINUTES * 60000;
          const secondHalfElapsed = (nowMs - secondHalfStartedAt) / 60000;
          elapsedRealMinutes = firstHalfRealMinutes + HALFTIME_REAL_DURATION_MINUTES + secondHalfElapsed;
        } else {
          elapsedRealMinutes = (nowMs - startedAt) / 60000;
        }

        // ── Hedef maç dakikasını hesapla ──
        const targetMinute = Math.min(Math.floor(elapsedRealMinutes * simSpeed), 90);
        const currentMinute = session.current_minute || 0;

        // Zaten hedef dakikadayız, atla
        if (currentMinute >= targetMinute) {
          tickResults.push({
            fixtureId,
            currentMinute,
            newEvents: 0,
            status: session.status,
          });
          continue;
        }

        // ── Simüle edilecek dakika aralığı ──
        const fromMinute = currentMinute + 1;
        const toMinute = Math.min(targetMinute, currentMinute + MAX_MINUTES_PER_TICK);

        console.log(`[match-tick] Session ${session.id}: simulating ${fromMinute}-${toMinute} (current: ${currentMinute}, target: ${targetMinute})`);

        // ── Session'dan oyuncu ve taktik verilerini parse et ──
        let homePlayers: Player[];
        let awayPlayers: Player[];
        let homeTactic: ActiveTactic;
        let awayTactic: ActiveTactic;

        try {
          homePlayers = typeof session.home_players === 'string'
            ? JSON.parse(session.home_players) : session.home_players;
          awayPlayers = typeof session.away_players === 'string'
            ? JSON.parse(session.away_players) : session.away_players;
          homeTactic = typeof session.home_tactic_obj === 'string'
            ? JSON.parse(session.home_tactic_obj) : session.home_tactic_obj;
          awayTactic = typeof session.away_tactic_obj === 'string'
            ? JSON.parse(session.away_tactic_obj) : session.away_tactic_obj;
        } catch (parseErr) {
          errors.push(`Session ${session.id}: Failed to parse session data: ${parseErr}`);
          continue;
        }

        if (!homePlayers?.length || !awayPlayers?.length) {
          errors.push(`Session ${session.id}: Missing player data`);
          continue;
        }

        // ── Hakem verisini parse et ──
        let refereeData: any = {};
        try {
          refereeData = typeof session.referee_data === 'string'
            ? JSON.parse(session.referee_data) : session.referee_data;
        } catch {}

        // ── Artırımlı simülasyonu çalıştır ──
        const incrementalResult = simulateIncremental(
          homePlayers,
          awayPlayers,
          homeTactic as ActiveTactic,
          awayTactic as ActiveTactic,
          fromMinute,
          toMinute,
          {
            homeTeamName: session.home_team_name || 'Ev Sahibi',
            awayTeamName: session.away_team_name || 'Deplasman',
            refereeStrictness: refereeData.strictness,
            refereePersonality: refereeData.personality,
            refereeName: refereeData.name,
            weather: session.weather as Weather,
            homeGoalMod: session.home_goal_mod || 0,
            awayGoalMod: session.away_goal_mod || 0,
            homeConceedMod: session.home_conceed_mod || 0,
            awayConceedMod: session.away_conceed_mod || 0,
          }
        );

        // ── Yeni olayları match_events tablosuna kaydet ──
        const newEventRows = incrementalResult.events.map((event) => ({
          fixture_id: fixtureId,
          event_type: event.type,
          minute: event.minute,
          team: event.team,
          player_id: event.playerId || null,
          player_name: event.playerName || null,
          assist_player_id: event.assistPlayerId || null,
          assist_player_name: event.assistPlayerName || null,
          detail: event.description || null,
          is_revealed: true, // Artırımlı simülasyon: her olay anında görünür
        }));

        if (newEventRows.length > 0) {
          try {
            const { error: eventsError } = await supabase
              .from('match_events')
              .insert(newEventRows);

            if (eventsError) {
              // is_revealed sütunu yoksa fallback
              if (eventsError.message?.includes('is_revealed') || eventsError.message?.includes('column')) {
                const fallbackRows = newEventRows.map(({ is_revealed, ...rest }) => rest);
                await supabase.from('match_events').insert(fallbackRows);
              } else {
                errors.push(`Session ${session.id}: Failed to insert events: ${eventsError.message}`);
              }
            }
          } catch (evtErr) {
            errors.push(`Session ${session.id}: Event insert exception: ${evtErr}`);
          }
        }

        // ── Skoru güncelle (mevcut skor + yeni goller) ──
        let newHomeScore = session.home_score || 0;
        let newAwayScore = session.away_score || 0;

        // Tüm revealed goal olaylarını say
        try {
          const { data: allRevealedGoals } = await supabase
            .from('match_events')
            .select('team, event_type')
            .eq('fixture_id', fixtureId)
            .in('event_type', ['goal'])
            .eq('is_revealed', true);

          if (allRevealedGoals && allRevealedGoals.length > 0) {
            newHomeScore = 0;
            newAwayScore = 0;
            for (const g of allRevealedGoals) {
              if (g.team === 'home') newHomeScore++;
              else if (g.team === 'away') newAwayScore++;
            }
          }
        } catch (scoreErr) {
          // Fallback: sadece bu aralıktaki golleri ekle
          newHomeScore += incrementalResult.homeScore;
          newAwayScore += incrementalResult.awayScore;
        }

        // ── Durumu hesapla ──
        let newStatus = session.status;
        if (toMinute >= 45 && currentMinute < 45 && newStatus !== 'halftime') {
          // Devre arası
          newStatus = 'halftime';

          // Devre arası olayını ekle
          try {
            await supabase.from('match_events').insert({
              fixture_id: fixtureId,
              event_type: 'halftime',
              minute: 45,
              team: 'home',
              detail: 'İlk yarı sona erdi. Hakem düdüğü çaldı.',
              is_revealed: true,
            });
          } catch {}
        }

        if (toMinute >= 90) {
          newStatus = 'completed';

          // Maç sonu olayını ekle
          try {
            await supabase.from('match_events').insert({
              fixture_id: fixtureId,
              event_type: 'fulltime',
              minute: 90,
              team: 'home',
              detail: 'Maç sona erdi! Hakem son düdüğü çaldı.',
              is_revealed: true,
            });
          } catch {}
        }

        // ── Session'ı güncelle ──
        try {
          await supabase
            .from('match_sessions')
            .update({
              current_minute: toMinute,
              home_score: newHomeScore,
              away_score: newAwayScore,
              status: newStatus,
              last_updated: new Date().toISOString(),
            })
            .eq('id', session.id);
        } catch (sessionUpdateErr) {
          console.warn(`[match-tick] match_sessions update failed:`, sessionUpdateErr);
        }

        // ── live_matches tablosunu güncelle ──
        try {
          await supabase
            .from('live_matches')
            .update({
              current_minute: toMinute,
              home_score: newHomeScore,
              away_score: newAwayScore,
              status: newStatus === 'completed' ? 'completed' : newStatus === 'halftime' ? 'halftime' : 'live',
              updated_at: new Date().toISOString(),
            })
            .eq('fixture_id', fixtureId);
        } catch (liveUpdateErr) {
          console.warn(`[match-tick] live_matches update failed:`, liveUpdateErr);
        }

        // ── Önemli olaylar için bildirim gönder ──
        const IMPORTANT_EVENT_TYPES = ['goal', 'red_card', 'injury', 'penalty', 'own_goal'];

        let homeProfileId: string | null = null;
        let awayProfileId: string | null = null;

        try {
          const { data: homeTeam } = await supabase
            .from('league_teams')
            .select('profile_id, name')
            .eq('id', session.home_team_id)
            .maybeSingle();
          homeProfileId = homeTeam?.profile_id || null;

          const { data: awayTeam } = await supabase
            .from('league_teams')
            .select('profile_id, name')
            .eq('id', session.away_team_id)
            .maybeSingle();
          awayProfileId = awayTeam?.profile_id || null;
        } catch (teamErr) {
          console.warn(`[match-tick] Team lookup failed:`, teamErr);
        }

        for (const event of incrementalResult.events) {
          const evtType = (event.type || '').toLowerCase();
          if (!IMPORTANT_EVENT_TYPES.includes(evtType)) continue;

          const teamLabel = event.team === 'home'
            ? (session.home_team_name || 'Ev Sahibi')
            : (session.away_team_name || 'Deplasman');

          let notifTitle = '';
          let notifBody = '';

          switch (evtType) {
            case 'goal':
              notifTitle = '⚽ GOL!';
              notifBody = `${event.minute}' ${teamLabel}: ${event.playerName || 'Bilinmeyen'} gol attı!`;
              break;
            case 'red_card':
              notifTitle = '🟥 Kırmızı Kart!';
              notifBody = `${event.minute}' ${teamLabel}: ${event.playerName || 'Bilinmeyen'} kırmızı kart gördü!`;
              break;
            case 'injury':
              notifTitle = '🏥 Sakatlık!';
              notifBody = `${event.minute}' ${teamLabel}: ${event.playerName || 'Bilinmeyen'} sakatlandı!`;
              break;
            case 'penalty':
              notifTitle = '⚠️ Penaltı!';
              notifBody = `${event.minute}' ${teamLabel} penaltı kazandı!`;
              break;
            default:
              continue;
          }

          for (const profileId of [homeProfileId, awayProfileId]) {
            if (!profileId) continue;
            try {
              await sendPushToProfile(profileId, {
                title: notifTitle,
                body: notifBody,
                icon: '/favicon.ico',
                url: `/match/${fixtureId}`,
              });
            } catch (pushErr) {
              console.warn(`[match-tick] Push failed for ${profileId}:`, pushErr);
            }
            await insertInAppNotification(
              supabase, profileId, notifTitle, notifBody,
              evtType === 'goal' ? 'match_goal' : 'match_event',
              fixtureId,
            );
          }
        }

        // ═══════════════════════════════════════════════════════════
        // MAÇ SONU İŞLEMLERİ
        // ═══════════════════════════════════════════════════════════
        if (newStatus === 'completed') {
          console.log(`[cron/match-tick] Finalizing match ${fixtureId}: ${newHomeScore}-${newAwayScore}`);

          // ── Fikstürü 'completed' olarak güncelle ──
          await supabase
            .from('fixtures')
            .update({
              status: 'completed',
              home_score: newHomeScore,
              away_score: newAwayScore,
            })
            .eq('id', fixtureId);

          // ── Tüm olayları açığa çıkar (güvenlik) ──
          try {
            await supabase
              .from('match_events')
              .update({ is_revealed: true })
              .eq('fixture_id', fixtureId)
              .eq('is_revealed', false);
          } catch {}

          // ── Kart cezalarını uygula ──
          try {
            const { data: allCardEvents } = await supabase
              .from('match_events')
              .select('event_type, player_id, team')
              .eq('fixture_id', fixtureId)
              .in('event_type', ['yellow_card', 'red_card']);

            if (allCardEvents && allCardEvents.length > 0) {
              const cardEvents = allCardEvents.map((e: any) => ({
                type: (e.event_type || '').toLowerCase() === 'yellow_card' ? 'yellow_card' : 'red_card',
                playerId: e.player_id,
                team: e.team,
              }));
              await applyCardSuspensions(cardEvents);
            }
          } catch (cardErr) {
            console.warn(`[match-tick] Card suspensions failed:`, cardErr);
          }

          // ── Sakatlıkları uygula ──
          try {
            const { data: allInjuryEvents } = await supabase
              .from('match_events')
              .select('player_id, player_name')
              .eq('fixture_id', fixtureId)
              .eq('event_type', 'injury');

            if (allInjuryEvents && allInjuryEvents.length > 0) {
              const injuryEvents = allInjuryEvents.map((e: any) => ({
                playerId: e.player_id,
                playerName: e.player_name,
              }));
              await applyMatchInjuries(injuryEvents);
            }
          } catch (injuryErr) {
            console.warn(`[match-tick] Injury application failed:`, injuryErr);
          }

          // ── Lig puan tablosunu güncelle ──
          try {
            const seasonId = session.season_id;
            if (seasonId) {
              await updateLeagueStandings(
                supabase,
                seasonId,
                session.home_team_id,
                session.away_team_id,
                newHomeScore,
                newAwayScore,
              );
            }
          } catch (standingsErr) {
            console.warn(`[match-tick] Standings update failed:`, standingsErr);
          }

          // ── Hakem istatistiklerini güncelle ──
          if (refereeData?.id) {
            try {
              const { data: allCardEvt } = await supabase
                .from('match_events')
                .select('event_type')
                .eq('fixture_id', fixtureId)
                .in('event_type', ['yellow_card', 'red_card']);

              const yellows = allCardEvt?.filter((e: any) => e.event_type === 'yellow_card').length || 0;
              const reds = allCardEvt?.filter((e: any) => e.event_type === 'red_card').length || 0;

              const { data: allPenEvt } = await supabase
                .from('match_events')
                .select('event_type')
                .eq('fixture_id', fixtureId)
                .eq('event_type', 'penalty');

              const penalties = allPenEvt?.length || 0;

              await supabase.from('referees').update({
                total_yellows: (refereeData.totalYellows || 0) + yellows,
                total_reds: (refereeData.totalReds || 0) + reds,
                total_penalties: (refereeData.totalPenalties || 0) + penalties,
              }).eq('id', refereeData.id);
            } catch (refUpdateErr) {
              console.warn('[match-tick] Referee stats update failed:', refUpdateErr);
            }
          }

          // ── "Maç Bitti" bildirimi ──
          const endTitle = '🏁 Maç Sona Erdi!';
          const endBody = `${session.home_team_name || 'Ev Sahibi'} ${newHomeScore} - ${newAwayScore} ${session.away_team_name || 'Deplasman'}`;

          for (const profileId of [homeProfileId, awayProfileId]) {
            if (!profileId) continue;
            try {
              await sendPushToProfile(profileId, {
                title: endTitle,
                body: endBody,
                icon: '/favicon.ico',
                url: `/match/${fixtureId}`,
              });
            } catch (pushErr) {
              console.warn(`[match-tick] End match push failed:`, pushErr);
            }
            await insertInAppNotification(
              supabase, profileId, endTitle, endBody,
              'match_ended', fixtureId,
            );
          }
        }

        tickResults.push({
          fixtureId,
          currentMinute: toMinute,
          newEvents: newEventRows.length,
          status: newStatus,
        });

        console.log(`[match-tick] ${fixtureId}: minute=${toMinute}, events=${newEventRows.length}, status=${newStatus}`);

      } catch (err) {
        errors.push(`Session ${session.id}: ${err}`);
        console.error(`[match-tick] Error processing session ${session.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'incremental',
      ticked: tickResults.length,
      results: tickResults,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/match-tick', method: 'GET' });
  }
}

// ═══════════════════════════════════════════════════════════════
// LEGACY: Eski sistem (önceden hesaplanmış olayları açığa çıkar)
// match_sessions tablosu henüz oluşturulmamışsa kullanılır
// ═══════════════════════════════════════════════════════════════
async function tickLegacyMatch(
  supabase: any,
  liveMatch: any,
  errors: string[],
  tickResults: Array<{ fixtureId: string; currentMinute: number; newEvents: number; status: string }>,
): Promise<void> {
  const fixtureId = liveMatch.fixture_id;
  const startedAt = new Date(liveMatch.started_at).getTime();
  const nowMs = Date.now();

  let elapsedRealMinutes: number;
  const SIMULATION_SPEED = 2;
  const HALFTIME_DURATION = 2;

  if (liveMatch.status === 'halftime') {
    const firstHalfReal = 45 / SIMULATION_SPEED;
    const halftimeStartedAt = startedAt + firstHalfReal * 60000;
    const halftimeElapsed = (nowMs - halftimeStartedAt) / 60000;

    if (halftimeElapsed < HALFTIME_DURATION) {
      tickResults.push({ fixtureId, currentMinute: 45, newEvents: 0, status: 'halftime' });
      return;
    }

    const secondHalfStarted = halftimeStartedAt + HALFTIME_DURATION * 60000;
    elapsedRealMinutes = firstHalfReal + HALFTIME_DURATION + (nowMs - secondHalfStarted) / 60000;
  } else {
    elapsedRealMinutes = (nowMs - startedAt) / 60000;
  }

  const currentGameMinute = Math.min(Math.floor(elapsedRealMinutes * SIMULATION_SPEED), 90);

  // Olayları açığa çıkar
  let newlyRevealedEvents: any[] = [];
  try {
    const { data: revealed } = await supabase
      .from('match_events')
      .update({ is_revealed: true })
      .eq('fixture_id', fixtureId)
      .lte('minute', currentGameMinute)
      .eq('is_revealed', false)
      .select('*');
    newlyRevealedEvents = revealed || [];
  } catch {
    // is_revealed sütunu yoksa tüm olaylar zaten görünür
  }

  // Skoru hesapla
  let currentHomeScore = 0;
  let currentAwayScore = 0;
  try {
    const { data: goals } = await supabase
      .from('match_events')
      .select('team')
      .eq('fixture_id', fixtureId)
      .in('event_type', ['goal'])
      .eq('is_revealed', true);
    if (goals) {
      for (const g of goals) {
        if (g.team === 'home') currentHomeScore++;
        else currentAwayScore++;
      }
    }
  } catch {}

  let newStatus = liveMatch.status;
  if (currentGameMinute >= 45 && currentGameMinute < 46 && liveMatch.status !== 'halftime') newStatus = 'halftime';
  if (currentGameMinute > 45 && liveMatch.status === 'halftime') newStatus = 'live';
  if (currentGameMinute >= 90) newStatus = 'completed';

  try {
    await supabase.from('live_matches').update({
      current_minute: currentGameMinute,
      home_score: currentHomeScore,
      away_score: currentAwayScore,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('fixture_id', fixtureId);
  } catch {}

  if (currentGameMinute >= 90) {
    await supabase.from('fixtures').update({
      status: 'completed',
      home_score: currentHomeScore,
      away_score: currentAwayScore,
    }).eq('id', fixtureId);
  }

  tickResults.push({
    fixtureId,
    currentMinute: currentGameMinute,
    newEvents: newlyRevealedEvents.length,
    status: newStatus,
  });
}
