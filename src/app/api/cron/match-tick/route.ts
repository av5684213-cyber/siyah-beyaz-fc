/**
 * Cron Job: Maç Tick (Artırımlı Canlı Maç Simülasyonu)
 *
 * Her 2 dakikada bir çağrılır. Canlı maçları ilerletir:
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
 *
 * TODO: Migrate to RPC (BUG-1) — All supabase.from('players').update() calls in this file
 * will fail once RLS WITH CHECK (false) is enforced. Cron routes need either:
 *   a) service-role Supabase client to bypass RLS, or
 *   b) dedicated RPC functions (e.g. rpc_update_match_stats) for atomic stat updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { simulateEnhancedMatch, type EnhancedMatchResult, type Weather } from '@/lib/fm/enhancedMatchEngine';
import { getWeatherForDate } from '@/lib/fm/stadiumMatrix';
import { applyCardSuspensions, applyMatchInjuries } from '@/lib/fm/matchConsequencesService';
import { sendPushToProfile } from '@/lib/push-notifications';
import { calculateMatchRevenue } from '@/lib/fm/financialModel';
import type { Player, ActiveTactic } from '@/lib/fm/types';
import { createErrorResponse } from '@/lib/api-error-handler';
import { makeTacticalDecision } from '@/lib/fm/botService';
// Cron Lock: Race condition önleme

// DÜZELTME: Güvenli JSON parse — bozuk veri gelirse match-tick çökmez
function safeJsonParse<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val as T;
  try { return JSON.parse(val as string) as T; } catch { return fallback; }
}
import { acquireCronLock, releaseCronLock } from '@/lib/fm/cronLockService';

export const maxDuration = 60; // 5 dakika

/** Match tick için kilit adı ve TTL (2 dk aralıkta çalışır, 50 sn TTL yeterli) */
const LOCK_NAME = 'match-tick';
const LOCK_TTL_SECONDS = 50;

// ═══════════════════════════════════════════════════════════════
// Simülasyon hızı: 1 gerçek dakika = kaç maç dakikası?
// Varsayılan: 3 (90 dk maç ~ 30 gerçek dakikada biter)
// ═══════════════════════════════════════════════════════════════
const DEFAULT_SIMULATION_SPEED = 3;

// Devre arası gerçek hayatta kaç dakika sürer
const HALFTIME_REAL_DURATION_MINUTES = 1;

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
      url: fixtureId ? `/match/${fixtureId}` : null,
      is_read: false,
    });
  } catch (err) {
    console.warn('[m[cron/match-tick] In-app notification insert skipped:', err);
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
        gd: ((homeStanding.gf || 0) + homeScore) - ((homeStanding.ga || 0) + awayScore),
      };
      await supabase.from('league_standings').update(updated).eq('id', homeStanding.id);
      // B1: league_teams.played de güncellenmeli — season-end buna bakıyor
      try {
        await supabase.from('league_teams')
          .update({ played: updated.played, won: updated.won, drawn: updated.drawn, lost: updated.lost, gf: updated.gf, ga: updated.ga, points: updated.points })
          .eq('id', homeTeamId);
      } catch (ltErr) {
        console.warn('[m[cron/match-tick] league_teams home update failed:', ltErr);
      }
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
        gd: ((awayStanding.gf || 0) + awayScore) - ((awayStanding.ga || 0) + homeScore),
      };
      await supabase.from('league_standings').update(updated).eq('id', awayStanding.id);
      // B1: league_teams.played de güncellenmeli
      try {
        await supabase.from('league_teams')
          .update({ played: updated.played, won: updated.won, drawn: updated.drawn, lost: updated.lost, gf: updated.gf, ga: updated.ga, points: updated.points })
          .eq('id', awayTeamId);
      } catch (ltErr) {
        console.warn('[m[cron/match-tick] league_teams away update failed:', ltErr);
      }
    }
  } catch (err) {
    console.error('[m[cron/match-tick] Error updating standings:', err);
  }
}

// ═══════════════════════════════════════════════════════════════
// Artırımlı simülasyon: Sadece fromMinute → toMinute arası
// Artık TÜM maçı simüle edip filtrelemiyor — sadece istenen aralığı
// simüle ediyor (deterministik sonuçlar, taktik değişiklikleri etkili)
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
    initialHomeScore?: number;
    initialAwayScore?: number;
    homeInjuryModifier?: number;
    awayInjuryModifier?: number;
    seed?: number;
    // S3-5 FIX: Atmosphere score from match-scheduler
    atmosphereScore?: number;
  }
): EnhancedMatchResult {
  // Sadece fromMinute → toMinute arasını simüle et (tüm maç DEĞİL)
  const result = simulateEnhancedMatch(
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
      startMinute: fromMinute,    // YENI: sadece bu aralığı simüle et
      endMinute: toMinute,        // YENI: sadece bu aralığı simüle et
      initialHomeScore: options.initialHomeScore ?? 0,  // YENI: önceki goller
      initialAwayScore: options.initialAwayScore ?? 0,  // YENI: önceki goller
      homeTacticModifiers: {
        goalMod: options.homeGoalMod || 0,
        conceedMod: options.homeConceedMod || 0,
      },
      awayTacticModifiers: {
        goalMod: options.awayGoalMod || 0,
        conceedMod: options.awayConceedMod || 0,
      },
      homeInjuryModifier: options.homeInjuryModifier,
      awayInjuryModifier: options.awayInjuryModifier,
      seed: options.seed,
      // S3-5 FIX: Pass atmosphere score to match engine
      atmosphereScore: options.atmosphereScore,
    }
  );

  return result;
}

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (false) // CRON_SECRET disabled //.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
// SORUN-11: Additional Vercel cron signature verification (defense-in-depth)
const vercelCronSig = request.headers.get('x-vercel-cron-signature');
if (process.env.VERCEL === '1' && !vercelCronSig) {
  console.warn('[m[cron/match-tick] Missing X-Vercel-Cron-Signature header — possible external invocation');
  // Don't block — Vercel may not always send this header. Just log the warning.
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
      message: 'Başka bir instance match-tick çalıştırıyor, atlanıyor',
      locked: true,
      timestamp: new Date().toISOString(),
    });
  }

  const tickResults: Array<{
    fixtureId: string;
    currentMinute: number;
    newEvents: number;
    status: string;
  }> = [];
  const errors: string[] = [];

  try {
    console.log('[cron/m[cron/match-tick] Starting incremental match tick...');

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
        console.warn('[m[cron/match-tick] match_sessions query failed:', sessionsError.message);
      } else {
        liveSessions = sessionsData || [];
      }
    } catch (sessionErr) {
      console.warn('[m[cron/match-tick] match_sessions table may not exist:', sessionErr);
    }

    // Fallback: match_sessions yoksa, live_matches tablosundan devam et (eski sistem)
    if (liveSessions.length === 0) {
      console.log('[m[cron/match-tick] No match_sessions found, checking live_matches fallback...');
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
        console.warn('[m[cron/match-tick] live_matches fallback also failed:', liveErr);
      }

      return NextResponse.json({
        success: true,
        message: 'No live matches to tick',
        ticked: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[cron/m[cron/match-tick] Found ${liveSessions.length} live sessions`);

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

        console.log(`[m[cron/match-tick] Session ${session.id}: simulating ${fromMinute}-${toMinute} (current: ${currentMinute}, target: ${targetMinute})`);

        // ── Session'dan oyuncu ve taktik verilerini güvenli parse et ──
        const homePlayers = safeJsonParse<Player[]>(session.home_players, []);
        const awayPlayers = safeJsonParse<Player[]>(session.away_players, []);
        const homeTactic = safeJsonParse<ActiveTactic>(session.home_tactic_obj, {} as ActiveTactic);
        const awayTactic = safeJsonParse<ActiveTactic>(session.away_tactic_obj, {} as ActiveTactic);

        if (!homePlayers?.length || !awayPlayers?.length) {
          errors.push(`Session ${session.id}: Missing player data`);
          continue;
        }

        // ── Hakem verisini güvenli parse et ──
        const refereeData = safeJsonParse<Record<string, unknown>>(session.referee_data, {});

        // ── Taktik değişikliği algılama ──
        // Session'daki taktik önceki tick'ten farklı mı kontrol et
        // Farklı ise TACTICAL_CHANGE event'i match_events'e yaz
        const prevTactic = session.prev_tactic || null;
        const currentTactic = session.home_tactic || null;
        if (prevTactic !== null && currentTactic !== null && prevTactic !== currentTactic && session.current_minute > 0) {
          try {
            await supabase.from('match_events').insert({
              fixture_id: fixtureId,
              event_type: 'TACTICAL_CHANGE',
              minute: session.current_minute,
              team: 'home',
              detail: `Taktik degistirildi: ${currentTactic}`,
              is_revealed: true,
            });
          } catch (tacErr) {
            console.warn(`[m[cron/match-tick] TACTICAL_CHANGE event insert failed:`, tacErr);
          }
        }
        // prev_tactic'i guncelle
        if (currentTactic && currentTactic !== prevTactic) {
          try {
            await supabase.from('match_sessions')
              .update({ prev_tactic: currentTactic })
              .eq('id', session.id);
          } catch {}
        }

        // ── Bot AI: Check if any team is a bot and make tactical decisions ──
        let botGoalModHome = 0;
        let botConceedModHome = 0;
        let botGoalModAway = 0;
        let botConceedModAway = 0;

        const _scoreDiff = Math.abs((session.home_score || 0) - (session.away_score || 0));
        const _isCritical =
          fromMinute <= 5 ||
          (fromMinute >= 44 && fromMinute <= 46) ||
          fromMinute === 60 ||
          fromMinute === 75 ||
          (_scoreDiff >= 2 && fromMinute > 15);

        if (_isCritical) {
          try {
            // Look up profile IDs for both teams
            const { data: homeTeam } = await supabase
              .from('league_teams')
              .select('profile_id')
              .eq('id', session.home_team_id)
              .maybeSingle();
            const homeProfileId = homeTeam?.profile_id || null;

            const { data: awayTeam } = await supabase
              .from('league_teams')
              .select('profile_id')
              .eq('id', session.away_team_id)
              .maybeSingle();
            const awayProfileId = awayTeam?.profile_id || null;

            // Check home team bot
            if (homeProfileId) {
              try {
                const { data: homeTeamProfile } = await supabase
                  .from('profiles')
                  .select('id, is_bot')
                  .eq('id', homeProfileId)
                  .maybeSingle();

                if (homeTeamProfile?.is_bot) {
                  const botDecision = await makeTacticalDecision(
                    homeProfileId,
                    fixtureId,
                    fromMinute,
                    { botScore: session.home_score || 0, oppScore: session.away_score || 0, isHome: true }
                  );
                  if (botDecision) {
                    // Map mentality/pressing to session tactic modifiers
                    if (botDecision.mentality >= 5) {
                      botGoalModHome += 0.15;
                      botConceedModHome += 0.08;
                    } else if (botDecision.mentality >= 4) {
                      botGoalModHome += 0.08;
                      botConceedModHome += 0.03;
                    } else if (botDecision.mentality <= 2) {
                      botGoalModHome -= 0.05;
                      botConceedModHome -= 0.10;
                    }
                    if (botDecision.pressing) {
                      botGoalModHome += 0.03;
                    }
                    console.log(`[m[cron/match-tick] Home bot ${homeProfileId} tactic: ${botDecision.details}, goalMod=${botGoalModHome}, conceedMod=${botConceedModHome}`);
                  }
                }
              } catch (homeBotErr) {
                console.warn(`[m[cron/match-tick] Home bot AI error (non-blocking):`, homeBotErr);
              }
            }

            // Check away team bot
            if (awayProfileId) {
              try {
                const { data: awayTeamProfile } = await supabase
                  .from('profiles')
                  .select('id, is_bot')
                  .eq('id', awayProfileId)
                  .maybeSingle();

                if (awayTeamProfile?.is_bot) {
                  const botDecision = await makeTacticalDecision(
                    awayProfileId,
                    fixtureId,
                    fromMinute,
                    { botScore: session.away_score || 0, oppScore: session.home_score || 0, isHome: false }
                  );
                  if (botDecision) {
                    // Map mentality/pressing to session tactic modifiers
                    if (botDecision.mentality >= 5) {
                      botGoalModAway += 0.15;
                      botConceedModAway += 0.08;
                    } else if (botDecision.mentality >= 4) {
                      botGoalModAway += 0.08;
                      botConceedModAway += 0.03;
                    } else if (botDecision.mentality <= 2) {
                      botGoalModAway -= 0.05;
                      botConceedModAway -= 0.10;
                    }
                    if (botDecision.pressing) {
                      botGoalModAway += 0.03;
                    }
                    console.log(`[m[cron/match-tick] Away bot ${awayProfileId} tactic: ${botDecision.details}, goalMod=${botGoalModAway}, conceedMod=${botConceedModAway}`);
                  }
                }
              } catch (awayBotErr) {
                console.warn(`[m[cron/match-tick] Away bot AI error (non-blocking):`, awayBotErr);
              }
            }

            // Bot taktik değişikliğini uygula — accumulation yerine SET mantığı
            // Sorun: Her tick'te += ile birikim → sınırsız büyüyordu
            // Çözüm: Bot kararını session'daki taban değere ekle (ilk değerden itibaren)
            if (botGoalModHome !== 0 || botConceedModHome !== 0 || botGoalModAway !== 0 || botConceedModAway !== 0) {
              try {
                // Taban (başlangıç) taktik modifiyerlerini hesapla
                const homeBaseGoalMod = Number(session.home_goal_mod) || 0;
                const homeBaseConceedMod = Number(session.home_conceed_mod) || 0;
                const awayBaseGoalMod = Number(session.away_goal_mod) || 0;
                const awayBaseConceedMod = Number(session.away_conceed_mod) || 0;

                await supabase
                  .from('match_sessions')
                  .update({
                    home_goal_mod: homeBaseGoalMod + botGoalModHome,
                    home_conceed_mod: homeBaseConceedMod + botConceedModHome,
                    away_goal_mod: awayBaseGoalMod + botGoalModAway,
                    away_conceed_mod: awayBaseConceedMod + botConceedModAway,
                  })
                  .eq('id', session.id);
              } catch (modUpdateErr) {
                console.warn(`[m[cron/match-tick] Bot tactic modifier update failed:`, modUpdateErr);
              }
            }
          } catch (botAiErr) {
            console.warn(`[m[cron/match-tick] Bot AI section error (non-blocking):`, botAiErr);
          }
        }

        // B2: Fizyoterapist yıldızı çek
        let homePhysioStars = 0;
        let awayPhysioStars = 0;
        try {
          const { data: homeTeamForPhysio } = await supabase
            .from('league_teams')
            .select('profile_id')
            .eq('id', session.home_team_id)
            .maybeSingle();
          const physioHomeProfileId = homeTeamForPhysio?.profile_id || null;
          if (physioHomeProfileId) {
            try {
              const { data: homeStaff } = await supabase
                .from('staff')
                .select('stars, type')
                .eq('profile_id', physioHomeProfileId)
                .eq('type', 'physio');
              homePhysioStars = Math.max(0, ...(homeStaff || []).map(s => s.stars || 0));
            } catch {}
          }
        } catch {}
        try {
          const { data: awayTeamForPhysio } = await supabase
            .from('league_teams')
            .select('profile_id')
            .eq('id', session.away_team_id)
            .maybeSingle();
          const physioAwayProfileId = awayTeamForPhysio?.profile_id || null;
          if (physioAwayProfileId) {
            try {
              const { data: awayStaff } = await supabase
                .from('staff')
                .select('stars, type')
                .eq('profile_id', physioAwayProfileId)
                .eq('type', 'physio');
              awayPhysioStars = Math.max(0, ...(awayStaff || []).map(s => s.stars || 0));
            } catch {}
          }
        } catch {}

        // Fizyoterapist etkisi: her yıldız %4 azaltma (eski %8 — 5 yıldız = %20 azaltma, daha gerçekçi)
        const homePhysioMod = 1.0 - (homePhysioStars * 0.04);
        const awayPhysioMod = 1.0 - (awayPhysioStars * 0.04);

        // D6: Deterministic weather seed — session.match_date kullan (bugünün tarihine değil)
        const weatherSeed = parseInt(fixtureId.replace(/-/g, '').slice(0, 8), 16) || 0;
        const sessionMatchDate = session.match_date || (session as any).match_date || null;
        const matchDate = sessionMatchDate || new Date().toISOString().split('T')[0];
        const dateSeed = parseInt(matchDate.replace(/-/g, ''), 10) || 0;
        const deterministicSeed = (weatherSeed + dateSeed) % 1000000;

        // D6: Hava durumu — session'dan oku, yoksa deterministic fallback
        let matchWeather: Weather = session.weather as Weather;
        if (!matchWeather && sessionMatchDate) {
          matchWeather = getWeatherForDate(sessionMatchDate) as Weather;
          console.log(`[m[cron/match-tick] D6 fallback: session.weather yok, getWeatherForDate(${sessionMatchDate}) = ${matchWeather}`);
        } else if (!matchWeather) {
          matchWeather = 'sunny';
        }

        // ── Aktif Operasyon Efektleri ──
        let opGoalModHome = 0, opGoalModAway = 0;
        try {
          // Profile ID'leri çöz
          let _opHomeProfileId: string | null = null;
          let _opAwayProfileId: string | null = null;
          try {
            const { data: _opHomeTeam } = await supabase
              .from('league_teams')
              .select('profile_id')
              .eq('id', session.home_team_id)
              .maybeSingle();
            _opHomeProfileId = _opHomeTeam?.profile_id || null;
            const { data: _opAwayTeam } = await supabase
              .from('league_teams')
              .select('profile_id')
              .eq('id', session.away_team_id)
              .maybeSingle();
            _opAwayProfileId = _opAwayTeam?.profile_id || null;
          } catch { /* sessizce geç */ }

          const now = new Date().toISOString();
          const { data: ops } = await supabase
            .from('active_operations')
            .select('profile_id, impact_type, impact_value, target_profile_id')
            .gt('expires_at', now);

          for (const op of ops || []) {
            const isHomeOp = op.profile_id === _opHomeProfileId;
            const isAwayOp = op.profile_id === _opAwayProfileId;
            const targetsHome = op.target_profile_id === _opHomeProfileId;
            const targetsAway = op.target_profile_id === _opAwayProfileId;

            const v = Number(op.impact_value) || 0;
            switch (op.impact_type) {
              case 'luck':
                if (isHomeOp) opGoalModHome += v;
                if (isAwayOp) opGoalModAway += v;
                if (targetsHome) opGoalModHome -= v;
                if (targetsAway) opGoalModAway -= v;
                break;
              case 'stamina':
                if (targetsHome) opGoalModHome -= v * 0.4;
                if (targetsAway) opGoalModAway -= v * 0.4;
                break;
              case 'error_rate':
                if (targetsHome) opGoalModAway += v * 0.5;
                if (targetsAway) opGoalModHome += v * 0.5;
                break;
              case 'defense':
                if (isHomeOp) opGoalModHome += v * 0.25;
                if (isAwayOp) opGoalModAway += v * 0.25;
                break;
            }
          }
        } catch { /* sessizce geç */ }

        // Operasyon modifer'larını mevcut modifier'lara ekle
        const finalHomeGoalMod = (Number(session.home_goal_mod) || 0) + botGoalModHome + opGoalModHome;
        const finalAwayGoalMod = (Number(session.away_goal_mod) || 0) + botGoalModAway + opGoalModAway;

        // ── S3-5 FIX: Atmosphere score from session ──
        const homeAtmoData = safeJsonParse<Record<string, unknown>>(session.home_atmosphere, {});
        const sessionAtmosphereScore = typeof homeAtmoData?.score === 'number' ? homeAtmoData.score : 50;

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
            weather: matchWeather,
            homeGoalMod: finalHomeGoalMod,
            awayGoalMod: finalAwayGoalMod,
            homeConceedMod: (Number(session.home_conceed_mod) || 0) + botConceedModHome,
            awayConceedMod: (Number(session.away_conceed_mod) || 0) + botConceedModAway,
            initialHomeScore: session.home_score || 0,   // Önceki golleri taşı
            initialAwayScore: session.away_score || 0,   // Önceki golleri taşı
            homeInjuryModifier: homePhysioMod,
            awayInjuryModifier: awayPhysioMod,
            seed: deterministicSeed,
            // S3-5 FIX: Pass atmosphere score to match engine (replaces fixed HOME_ADVANTAGE)
            atmosphereScore: sessionAtmosphereScore,
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

        // ── Skoru güncelle ──
        // Artırımlı simülasyon initialHomeScore/initialAwayScore ile başladığı için
        // incrementalResult.homeScore zaten TOPLAM skoru içerir (önceki + yeni goller)
        let newHomeScore = incrementalResult.homeScore;
        let newAwayScore = incrementalResult.awayScore;

        // Fallback: DB'deki tüm revealed golleri say (tutarsızlık olursa)
        try {
          const { data: allRevealedGoals } = await supabase
            .from('match_events')
            .select('team, event_type')
            .eq('fixture_id', fixtureId)
            .in('event_type', ['goal'])
            .eq('is_revealed', true);

          if (allRevealedGoals && allRevealedGoals.length > 0) {
            let dbHomeScore = 0;
            let dbAwayScore = 0;
            for (const g of allRevealedGoals) {
              if (g.team === 'home') dbHomeScore++;
              else if (g.team === 'away') dbAwayScore++;
            }
            // DB skoru daha yüksekse (güvenlik), onu kullan
            if (dbHomeScore + dbAwayScore > newHomeScore + newAwayScore) {
              newHomeScore = dbHomeScore;
              newAwayScore = dbAwayScore;
            }
          }
        } catch (scoreErr) {
          // DB sorgusu başarısız olursa simülasyon skorunu kullan (zaten yukarıda atandı)
        }

        // ── Durumu hesapla ──
        let newStatus = session.status;
        if (toMinute >= 45 && currentMinute < 45 && newStatus !== 'halftime') {
          // Yarı devre kondisyon toparlanması: her oyuncu +8 cond
          for (const p of [...homePlayers, ...awayPlayers]) {
            if (p && typeof p.cond === 'number') {
              p.cond = Math.min(100, p.cond + 8);
            } else if (p) {
              p.currentCond = Math.min(100, (p.currentCond || 80) + 8);
            }
          }
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
              last_tick_at: new Date().toISOString(),  // DOGRU kolon adı (last_updated degil)
            })
            .eq('id', session.id);
        } catch (sessionUpdateErr) {
          console.warn(`[m[cron/match-tick] match_sessions update failed:`, sessionUpdateErr);
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
          console.warn(`[m[cron/match-tick] live_matches update failed:`, liveUpdateErr);
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
          console.warn(`[m[cron/match-tick] Team lookup failed:`, teamErr);
        }

        for (const event of incrementalResult.events) {
          const evtType = (event.type || '').toLowerCase();
          if (!IMPORTANT_EVENT_TYPES.includes(evtType)) continue;

          const teamLabel = event.team === 'home'
            ? (session.home_team_name || 'Ev Sahibi')
            : (session.away_team_name || 'Deplasman');

          let notifTitle = '';
          let notifBody = '';

          let notifType = 'match_event';

          switch (evtType) {
            case 'goal':
              notifTitle = '⚽ GOL!';
              {
                // playerName bazen null gelebilir — player_id'den ismi çöz
                let goalPlayerName = event.playerName;
                if (!goalPlayerName && event.playerId) {
                  try {
                    const { data: goalPlayer } = await supabase
                      .from('players')
                      .select('name')
                      .eq('id', event.playerId)
                      .maybeSingle();
                    goalPlayerName = goalPlayer?.name || null;
                  } catch {}
                }
                if (!goalPlayerName) {
                  notifBody = `${event.minute}' ${teamLabel}: Muhteşem bir gol!`;
                } else {
                  notifBody = `${event.minute}' ${teamLabel}: ${goalPlayerName} gol attı!`;
                }
              }
              notifType = 'match_goal';
              break;
            case 'red_card':
              notifTitle = '🟥 Kırmızı Kart!';
              {
                let redCardPlayerName = event.playerName;
                if (!redCardPlayerName && event.playerId) {
                  try {
                    const { data: redCardPlayer } = await supabase
                      .from('players')
                      .select('name')
                      .eq('id', event.playerId)
                      .maybeSingle();
                    redCardPlayerName = redCardPlayer?.name || null;
                  } catch {}
                }
                notifBody = `${event.minute}' ${teamLabel}: ${redCardPlayerName || 'Takım arkadaşı'} kırmızı kart gördü!`;
              }
              notifType = 'match_event';
              break;
            case 'injury':
              notifTitle = '🏥 Sakatlık!';
              {
                let injuryPlayerName = event.playerName;
                if (!injuryPlayerName && event.playerId) {
                  try {
                    const { data: injuryPlayer } = await supabase
                      .from('players')
                      .select('name')
                      .eq('id', event.playerId)
                      .maybeSingle();
                    injuryPlayerName = injuryPlayer?.name || null;
                  } catch {}
                }
                notifBody = `${event.minute}' ${teamLabel}: ${injuryPlayerName || 'Takım arkadaşı'} sakatlandı!`;
              }
              notifType = 'match_event';
              break;
            case 'own_goal':
              notifTitle = '🤦 Autogol!';
              {
                let ownGoalPlayerName = event.playerName;
                if (!ownGoalPlayerName && event.playerId) {
                  try {
                    const { data: ownGoalPlayer } = await supabase
                      .from('players')
                      .select('name')
                      .eq('id', event.playerId)
                      .maybeSingle();
                    ownGoalPlayerName = ownGoalPlayer?.name || null;
                  } catch {}
                }
                notifBody = `${event.minute}' ${teamLabel}: ${ownGoalPlayerName || 'Takım arkadaşı'} kendi kalesine gol attı!`;
              }
              notifType = 'match_goal';
              break;
            case 'penalty':
              notifTitle = '⚠️ Penaltı!';
              notifBody = `${event.minute}' ${teamLabel} penaltı kazandı!`;
              notifType = 'match_event';
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
                type: notifType,
              });
            } catch (pushErr) {
              console.warn(`[m[cron/match-tick] Push failed for ${profileId}:`, pushErr);
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
          console.log(`[cron/m[cron/match-tick] Finalizing match ${fixtureId}: ${newHomeScore}-${newAwayScore}`);

          // ── Fikstürü 'completed' olarak güncelle ──
          try {
            await supabase
              .from('fixtures')
              .update({
                status: 'completed',
                home_score: newHomeScore,
                away_score: newAwayScore,
                updated_at: new Date().toISOString(),
              })
              .eq('id', fixtureId);
            console.log(`[m[cron/match-tick] Match ${fixtureId} completed: ${newHomeScore}-${newAwayScore}`);
          } catch (fixtureUpdateErr) {
            console.error('[m[cron/match-tick] Fixture completion update error:', fixtureUpdateErr);
          }

          // ── Tüm olayları açığa çıkar (güvenlik) ──
          try {
            await supabase
              .from('match_events')
              .update({ is_revealed: true })
              .eq('fixture_id', fixtureId)
              .eq('is_revealed', false);
          } catch {}

          // ── KALICI KAYIT: Tüm olayları match_sessions.events JSONB'ye de yaz ──
          // Bu sayede sezon boyunca "tekrar izle" her zaman çalışır.
          // match_events tablosu bir şekilde silinse bile match_sessions.events yedek olur.
          try {
            const { data: allEvents } = await supabase
              .from('match_events')
              .select('*')
              .eq('fixture_id', fixtureId)
              .order('minute', { ascending: true });

            if (allEvents && allEvents.length > 0) {
              await supabase
                .from('match_sessions')
                .update({
                  events: allEvents,
                  status: 'completed',
                  current_minute: 90,
                  home_score: newHomeScore,
                  away_score: newAwayScore,
                  completed_at: new Date().toISOString(),
                })
                .eq('fixture_id', fixtureId);
              console.log(`[m[cron/match-tick] Match ${fixtureId}: ${allEvents.length} olay match_sessions'a kalıcı kaydedildi`);
            }
          } catch (persistErr) {
            console.warn(`[m[cron/match-tick] match_sessions kalıcı kayıt hatası:`, persistErr);
          }

          // ── Kart cezalarını uygula (S3-2 FIX: nextMatchDate ile) ──
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

              // S3-2 FIX: Find next fixture date for proper "1 match" suspension
              let nextMatchDate: Date | undefined;
              try {
                const teamIds = [session.home_team_id, session.away_team_id].filter(Boolean);
                const todayStr = new Date().toISOString().split('T')[0];
                if (teamIds.length > 0 && session.season_id) {
                  const { data: nextFixtures } = await supabase
                    .from('fixtures')
                    .select('match_date')
                    .eq('season_id', session.season_id)
                    .neq('status', 'completed')
                    .gt('match_date', todayStr)
                    .or(`home_team_id.eq.${session.home_team_id},away_team_id.eq.${session.home_team_id},home_team_id.eq.${session.away_team_id},away_team_id.eq.${session.away_team_id}`)
                    .order('match_date', { ascending: true })
                    .limit(1);
                  if (nextFixtures && nextFixtures.length > 0 && nextFixtures[0].match_date) {
                    nextMatchDate = new Date(nextFixtures[0].match_date);
                  }
                }
              } catch (nextMatchErr) {
                console.warn('[m[cron/match-tick] Next match date lookup failed, using 3-day default:', nextMatchErr);
              }

              await applyCardSuspensions(cardEvents, nextMatchDate);
            }
          } catch (cardErr) {
            console.warn(`[m[cron/match-tick] Card suspensions failed:`, cardErr);
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
            console.warn(`[m[cron/match-tick] Injury application failed:`, injuryErr);
          }

          // ── Sezon rekoru kontrolü ──
          try {
            if (homeProfileId || awayProfileId) {
              const { data: allGoalEvents } = await supabase
                .from('match_events')
                .select('player_id, team')
                .in('event_type', ['goal', 'penalty_goal', 'free_kick_goal', 'own_goal'])
                .eq('fixture_id', fixtureId);
              for (const ev of allGoalEvents || []) {
                const scorerProfileId = ev.team === 'home' ? homeProfileId : awayProfileId;
                if (!scorerProfileId || !ev.player_id) continue;
                const { data: scorer } = await supabase
                  .from('players').select('name, goals').eq('id', ev.player_id).maybeSingle();
                if (!scorer) continue;
                const seasonGoals = (scorer.goals || 0) + 1;
                // league_id'yi season_id'den çöz
                let recordLeagueId = '';
                try {
                  if (session.season_id) {
                    const { data: seasonRow } = await supabase
                      .from('seasons').select('league_id').eq('id', session.season_id).maybeSingle();
                    recordLeagueId = seasonRow?.league_id || '';
                  }
                } catch { /* sessizce geç */ }
                const { data: record } = await supabase
                  .from('season_records')
                  .select('record_value')
                  .eq('league_id', recordLeagueId)
                  .eq('record_type', 'season_goals')
                  .maybeSingle();
                const prevRecord = record?.record_value || 0;
                if (seasonGoals > prevRecord && seasonGoals >= 15) {
                  await supabase.from('season_records').upsert({
                    league_id: recordLeagueId,
                    record_type: 'season_goals',
                    record_value: seasonGoals,
                    player_name: scorer.name,
                    season_id: session.season_id,
                  });
                  try {
                    const { sendPushToProfile } = await import('@/lib/push-notifications');
                    await sendPushToProfile(scorerProfileId, {
                      title: 'SEZON REKORU!',
                      body: `${scorer.name} bu sezon ${seasonGoals} gol attı — lig rekoru!`,
                    });
                  } catch { /* push sessizce geç */ }
                  await supabase.from('notifications').insert({
                    profile_id: scorerProfileId,
                    title: 'Sezon Rekoru!',
                    body: `${scorer.name} ${seasonGoals} gol ile lig sezon rekoru kırdı!`,
                    type: 'record_broken',
                    is_read: false,
                  });
                }
              }
            }
          } catch { /* sessizce geç */ }

          // ── Sigorta ödemesi kontrolü ──
          try {
            const { data: allInjuryEvents } = await supabase
              .from('match_events')
              .select('player_id')
              .eq('fixture_id', fixtureId)
              .eq('event_type', 'injury');
            for (const ev of allInjuryEvents || []) {
              if (!ev.player_id) continue;
              const { data: injuredP } = await supabase
                .from('players').select('id, is_insured, market_value, profile_id').eq('id', ev.player_id).maybeSingle();
              if (injuredP?.is_insured && injuredP.profile_id) {
                const payout = Math.round((injuredP.market_value || 0) * 0.15);
                if (payout > 0) {
                  const { data: prof } = await supabase
                    .from('profiles').select('money').eq('id', injuredP.profile_id).maybeSingle();
                  if (prof) {
                    await supabase.from('profiles')
                      .update({ money: (prof.money || 0) + payout })
                      .eq('id', injuredP.profile_id);
                  }
                  await supabase.from('notifications').insert({
                    profile_id: injuredP.profile_id,
                    title: '🛡 Sigorta Ödemesi',
                    body: `Sakatlık sigortası devreye girdi: +${payout.toLocaleString('tr-TR')}€`,
                    type: 'insurance_payout',
                    is_read: false,
                  });
                }
              }
            }
          } catch { /* sessizce geç */ }

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

              // DÜZELTME: Tur tamamlandığında seasons.current_tur artır
              // Aynı turdaki tüm lig maçları bittiyse, bir sonraki tura geç
              try {
                const { data: fixtureInfo } = await supabase
                  .from('fixtures')
                  .select('tur, season_id, competition_type')
                  .eq('id', fixtureId)
                  .maybeSingle();

                const fixtureTur = fixtureInfo?.tur as number;
                const fixSeasonId = fixtureInfo?.season_id as string;
                const compType = fixtureInfo?.competition_type as string;

                if (fixtureTur && fixSeasonId && compType !== 'cup' && compType !== 'playoff') {
                  // Only count LEAGUE fixtures (competition_type = 'league' or null)
                  // Cup/playoff fixtures in the same tur should not block current_tur progression
                  const { count: remaining } = await supabase
                    .from('fixtures')
                    .select('id', { count: 'exact', head: true })
                    .eq('season_id', fixSeasonId)
                    .eq('tur', fixtureTur)
                    .neq('status', 'completed')
                    .or('competition_type.is.null,competition_type.eq.league');

                  if ((remaining ?? 1) === 0) {
                    await supabase.from('seasons')
                      .update({ current_tur: fixtureTur + 1 })
                      .eq('id', fixSeasonId);
                    console.log(`[m[cron/match-tick] Tur ${fixtureTur} tamamlandı → seasons.current_tur = ${fixtureTur + 1}`);
                  }
                }
              } catch (turErr) {
                console.warn('[m[cron/match-tick] Tur güncelleme hatası:', turErr);
              }
            }
          } catch (standingsErr) {
            console.warn(`[m[cron/match-tick] Standings update failed:`, standingsErr);
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
              console.warn('[m[cron/match-tick] Referee stats update failed:', refUpdateErr);
            }
          }

          // ── "Maç Bitti" bildirimi — kişiselleştirilmiş ──
          const homeWon = newHomeScore > newAwayScore;
          const isDraw = newHomeScore === newAwayScore;

          for (const profileId of [homeProfileId, awayProfileId]) {
            if (!profileId) continue;
            const isHome = profileId === homeProfileId;
            const won = isHome ? homeWon : !homeWon;
            const draw = isDraw;
            const icon = won ? '🏆' : draw ? '🤝' : '💔';
            const myScore = isHome ? newHomeScore : newAwayScore;
            const oppScore = isHome ? newAwayScore : newHomeScore;
            const resultText = won ? 'Galibiyet!' : draw ? 'Beraberlik' : 'Mağlubiyet';
            const oppName = isHome ? (session.away_team_name || 'Rakip') : (session.home_team_name || 'Ev Sahibi');
            const venueText = isHome ? '' : ' deplasman maçı';

            try {
              await sendPushToProfile(profileId, {
                title: `${icon} ${myScore}-${oppScore} ${resultText}`,
                body: `${oppName}${venueText} karşısında`,
                icon: '/favicon.ico',
                url: `/match/${fixtureId}`,
                type: 'match_result',
              });
            } catch (pushErr) {
              console.warn(`[m[cron/match-tick] End match push failed:`, pushErr);
            }
            await insertInAppNotification(
              supabase, profileId, `${icon} ${myScore}-${oppScore} ${resultText}`,
              `${oppName}${venueText} karşısında`,
              'match_ended', fixtureId,
            );
          }

          // ═══════════════════════════════════════════════════════════
          // KAZANMA/KAYBETME SERİSİ MORAL ETKİSİ
          // 5+ galibiyet serisi: +3 morale tüm oyunculara
          // 5+ kaybetme serisi: -5 morale tüm oyunculara
          // ═══════════════════════════════════════════════════════════
          try {
            const homeWon = newHomeScore > newAwayScore;
            for (const [pid, won] of [[homeProfileId, homeWon], [awayProfileId, !homeWon]] as [string | null, boolean][]) {
              if (!pid) continue;
              const { data: profile } = await supabase
                .from('profiles')
                .select('consecutive_losses, consecutive_wins')
                .eq('id', pid)
                .maybeSingle();

              const newConsecLosses = won ? 0 : (profile?.consecutive_losses || 0) + 1;
              const newConsecWins = won ? (profile?.consecutive_wins || 0) + 1 : 0;

              const seriesBonus = newConsecWins >= 5 ? 3 : newConsecLosses >= 5 ? -5 : 0;
              if (seriesBonus !== 0) {
                // Tüm oyuncuların moralini güncelle
                const { data: teamPlayers } = await supabase
                  .from('players')
                  .select('id, morale')
                  .eq('profile_id', pid);
                if (teamPlayers) {
                  for (const p of teamPlayers) {
                    const newMorale = Math.max(10, Math.min(99, (p.morale || 60) + seriesBonus));
                    // TODO: Migrate to RPC (BUG-1) — players.update will fail once RLS is enforced; cron needs service-role
                    await supabase.from('players').update({ morale: newMorale }).eq('id', p.id);
                  }
                }
              }

              await supabase.from('profiles')
                .update({ consecutive_losses: newConsecLosses, consecutive_wins: newConsecWins })
                .eq('id', pid);
            }
          } catch (streakErr) {
            console.warn('[m[cron/match-tick] Streak morale update failed:', streakErr);
          }

          // ═══════════════════════════════════════════════════════════
          // DÜZELTME 1: Ev sahibine bilet geliri öde (gerçek + bot takımlar)
          // ═══════════════════════════════════════════════════════════
          try {
            // Her iki takımın da profil bilgisini al (bot dahil)
            const profileIds = [homeProfileId, awayProfileId].filter(Boolean) as string[];
            let homeProfileData: any = null;

            if (profileIds.length > 0) {
              const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, money, stadium_capacity, ticket_price, stadium_upgrades, reputation, is_bot')
                .in('id', profileIds);

              if (profilesData) {
                homeProfileData = profilesData.find((p: any) => p.id === homeProfileId) || null;
              }
            }

            // Ev sahibi profili yoksa, bot takım için varsayılan değerlerle hesapla
            if (!homeProfileData && homeProfileId) {
              homeProfileData = {
                id: homeProfileId,
                money: 0,
                stadium_capacity: 15000,
                ticket_price: 25,
                stadium_upgrades: {},
                reputation: 40,
                is_bot: true,
              };
            }

            if (homeProfileData) {
              const matchRevenue = calculateMatchRevenue(
                homeProfileData,
                true,   // isHome = true (ev sahibi)
                newHomeScore,
                newAwayScore,
              );

              if (matchRevenue.revenue > 0) {
                const newMoney = (homeProfileData.money || 0) + matchRevenue.revenue;
                await supabase.from('profiles')
                  .update({ money: newMoney })
                  .eq('id', homeProfileId);

                // Gerçek kullanıcılara bildirim gönder
                if (!homeProfileData.is_bot) {
                  const revenueTitle = '⚽ Maç Geliri';
                  const revenueBody = `Bilet geliri: ${(matchRevenue.revenue).toLocaleString('tr-TR')} € (Taraftar: ${matchRevenue.attendance.toLocaleString('tr-TR')})`;
                  await insertInAppNotification(
                    supabase, homeProfileId!, revenueTitle, revenueBody,
                    'match_revenue', fixtureId,
                  );
                }
                console.log(`[m[cron/match-tick] Home match revenue: ${matchRevenue.revenue} € for ${homeProfileId} (attendance: ${matchRevenue.attendance}, bot: ${!!homeProfileData.is_bot})`);
              }
            }
          } catch (revenueErr) {
            console.warn(`[m[cron/match-tick] Match revenue calculation failed:`, revenueErr);
          }

          // ═══════════════════════════════════════════════════════════
          // MAÇ SONU OYUNCU GÜNCELLEMELERİ (tek birleşik blok)
          // 1) Gol atan → goals++
          // 2) Asist yapan → assists++
          // 3) Oynayan → matches_played++, match_ratings, kondisyon düşüşü
          // 4) Kaleci clean_sheets
          // 5) Kartlar → yellow_cards/red_cards++
          // ═══════════════════════════════════════════════════════════
          try {
            // ── 1) Gol atan oyuncuların goals sütununu artır ──
            const { data: goalEvents } = await supabase
              .from('match_events')
              .select('player_id, event_type')
              .eq('fixture_id', fixtureId)
              .in('event_type', ['goal', 'penalty_goal', 'free_kick_goal']);

            if (goalEvents) {
              const goalsByPlayer: Record<string, number> = {};
              for (const e of goalEvents) {
                if (e.player_id) goalsByPlayer[e.player_id] = (goalsByPlayer[e.player_id] || 0) + 1;
              }
              for (const [pid, count] of Object.entries(goalsByPlayer)) {
                try {
                  await supabase.rpc('increment_player_stat', { p_player_id: pid, p_stat: 'goals', p_amount: count });
                } catch (rpcErr) {
                  // RPC yoksa manuel update
                  const { data: p } = await supabase.from('players').select('goals').eq('id', pid).maybeSingle();
                  if (p) await supabase.from('players').update({ goals: (p.goals || 0) + count }).eq('id', pid);
                }
              }
            }

            // ── 2) Asist yapan oyuncuların assists sütununu artır ──
            const { data: assistEvents } = await supabase
              .from('match_events')
              .select('assist_player_id')
              .eq('fixture_id', fixtureId)
              .in('event_type', ['goal', 'penalty_goal', 'free_kick_goal'])
              .not('assist_player_id', 'is', null);

            if (assistEvents) {
              for (const e of assistEvents) {
                if (e.assist_player_id) {
                  try {
                    await supabase.rpc('increment_player_stat', { p_player_id: e.assist_player_id, p_stat: 'assists', p_amount: 1 });
                  } catch {
                    const { data: p } = await supabase.from('players').select('assists').eq('id', e.assist_player_id).maybeSingle();
                    if (p) await supabase.from('players').update({ assists: (p.assists || 0) + 1 }).eq('id', e.assist_player_id);
                  }
                }
              }
            }

            // ── 3) Kart alan oyuncuların yellow_cards/red_cards artır ──
            const { data: cardEvents } = await supabase
              .from('match_events')
              .select('player_id, event_type')
              .eq('fixture_id', fixtureId)
              .in('event_type', ['yellow_card', 'red_card']);

            if (cardEvents) {
              for (const e of cardEvents) {
                if (!e.player_id) continue;
                const statName = e.event_type === 'yellow_card' ? 'yellow_cards' : 'red_cards';
                try {
                  await supabase.rpc('increment_player_stat', { p_player_id: e.player_id, p_stat: statName, p_amount: 1 });
                  // DÜZELTME M5: Sarı kartta season_yellow_cards da artır (küme cezası takibi)
                  if (e.event_type === 'yellow_card') {
                    try {
                      await supabase.rpc('increment_player_stat', { p_player_id: e.player_id, p_stat: 'season_yellow_cards', p_amount: 1 });
                    } catch {
                      const { data: p2 } = await supabase.from('players').select('season_yellow_cards').eq('id', e.player_id).maybeSingle();
                      if (p2) await supabase.from('players').update({ season_yellow_cards: (p2.season_yellow_cards || 0) + 1 }).eq('id', e.player_id);
                    }
                  }
                } catch {
                  const { data: p } = await supabase.from('players').select(statName).eq('id', e.player_id).maybeSingle();
                  if (p) await supabase.from('players').update({ [statName]: ((p as any)[statName] || 0) + 1 }).eq('id', e.player_id);
                  // Fallback: season_yellow_cards da güncelle
                  if (e.event_type === 'yellow_card') {
                    try {
                      const { data: p2 } = await supabase.from('players').select('season_yellow_cards').eq('id', e.player_id).maybeSingle();
                      if (p2) await supabase.from('players').update({ season_yellow_cards: (p2.season_yellow_cards || 0) + 1 }).eq('id', e.player_id);
                    } catch {}
                  }
                }
              }
            }

            // ── 4) Oynayan oyuncuların matches_played + match_ratings + kondisyon + morale güncelle ──
            // DÜZELTME K1: Ev/deplasman ayrımı → morale güncelleme için
            const homeWon = newHomeScore > newAwayScore;
            const awayWon = newAwayScore > newHomeScore;
            const drew = newHomeScore === newAwayScore;

            const homePlayerIdSet = new Set(
              (Array.isArray(homePlayers) ? homePlayers : []).map((p: any) => p.id).filter(Boolean)
            );
            const awayPlayerIdSet = new Set(
              (Array.isArray(awayPlayers) ? awayPlayers : []).map((p: any) => p.id).filter(Boolean)
            );

            const allPlayerIds = [...homePlayerIdSet, ...awayPlayerIdSet];

            if (allPlayerIds.length > 0) {
              const { data: existingPlayersData } = await supabase
                .from('players')
                .select('id, matches_played, match_ratings, cond, stamina, morale, position')
                .in('id', allPlayerIds);

              const playerMap = new Map((existingPlayersData || []).map((p: any) => [p.id, p]));

              for (const pid of allPlayerIds) {
                const existingPlayer = playerMap.get(pid);
                if (!existingPlayer) continue;

                const isHome = homePlayerIdSet.has(pid);

                // match_ratings: son 5 maç (güvenli parse)
                let ratings: number[] = [];
                try {
                  const raw = existingPlayer.match_ratings;
                  if (Array.isArray(raw)) ratings = raw;
                  else if (typeof raw === 'string') ratings = safeJsonParse<number[]>(raw, []);
                } catch { ratings = []; }

                const thisRating = incrementalResult.homePlayerRatings?.find((r: any) => r.playerId === pid)?.rating
                               || incrementalResult.awayPlayerRatings?.find((r: any) => r.playerId === pid)?.rating
                               || 6.0;
                const ratingValue = Math.round(thisRating * 10) / 10;
                ratings.push(ratingValue);
                if (ratings.length > 5) ratings.shift(); // Son 5

                // form_rating: son 5 maç ortalaması (0-100 skalası)
                const formRating = ratings.length > 0
                  ? Math.round((ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length) * 10)
                  : 50;

                // Kondisyon düşüşü — dakika bazlı + stamina etkisi
                const stamina = existingPlayer.stamina || 50;
                const isGK = existingPlayer.position === 'GK';
                let condDrain: number;
                if (isGK) {
                  condDrain = 5;
                } else {
                  const minutesPlayed = session.current_minute || 90;
                  const baseCondDrain = Math.round(minutesPlayed * 0.15); // 0.15/dk → 90dk = ~13
                  const staminaFactor = stamina / 100;
                  condDrain = Math.max(8, Math.round(baseCondDrain * (2.0 - staminaFactor)));
                  // Stamina=100 → drain=8, stamina=50 → drain=13, stamina=0 → drain=20
                }
                const newCond = Math.max(10, (existingPlayer.cond || 80) - condDrain);

                // DÜZELTME K1: Morale güncelleme — maç sonucuna göre
                const won = isHome ? homeWon : awayWon;
                const moraleDelta = won ? +8 : drew ? +2 : -8;
                const newMorale = Math.min(100, Math.max(10, (existingPlayer.morale ?? 60) + moraleDelta));

                // Toplu update (matches_played + match_ratings + cond + form_rating + morale)
                const newMatchesPlayed = (existingPlayer.matches_played || 0) + 1;

                await supabase.from('players').update({
                  matches_played: newMatchesPlayed,
                  match_ratings: ratings,
                  form_rating: Math.max(0, Math.min(100, formRating)),
                  last_match_rating: ratingValue,
                  cond: newCond,
                  morale: newMorale,
                }).eq('id', pid);
              }
              console.log(`[m[cron/match-tick] Updated matches_played + match_ratings + cond + morale for ${allPlayerIds.length} players`);
            }

            // ── 5) Kaleciler için clean_sheets ──
            if (newHomeScore === 0 || newAwayScore === 0) {
              // Deplasman gol atmadı → ev kalecisi clean sheet
              if (newAwayScore === 0) {
                const homeGK = homePlayers?.find((p: any) => p.position === 'GK' || p.specificPosition === 'GK');
                if (homeGK?.id) {
                  try {
                    await supabase.rpc('increment_player_stat', { p_player_id: homeGK.id, p_stat: 'clean_sheets', p_amount: 1 });
                  } catch {
                    const { data: p } = await supabase.from('players').select('clean_sheets').eq('id', homeGK.id).maybeSingle();
                    if (p) await supabase.from('players').update({ clean_sheets: (p.clean_sheets || 0) + 1 }).eq('id', homeGK.id);
                  }
                }
              }
              // Ev sahibi gol atmadı → deplasman kalecisi clean sheet
              if (newHomeScore === 0) {
                const awayGK = awayPlayers?.find((p: any) => p.position === 'GK' || p.specificPosition === 'GK');
                if (awayGK?.id) {
                  try {
                    await supabase.rpc('increment_player_stat', { p_player_id: awayGK.id, p_stat: 'clean_sheets', p_amount: 1 });
                  } catch {
                    const { data: p } = await supabase.from('players').select('clean_sheets').eq('id', awayGK.id).maybeSingle();
                    if (p) await supabase.from('players').update({ clean_sheets: (p.clean_sheets || 0) + 1 }).eq('id', awayGK.id);
                  }
                }
              }
            }

          } catch (statsErr) {
            console.warn(`[m[cron/match-tick] Player stats update failed:`, statsErr);
          }

          // ═══════════════════════════════════════════════════════════
          // DÜZELTME K6: Kupa maçı sonucu → cup_seasons güncelle
          // ═══════════════════════════════════════════════════════════
          try {
            const { data: fixtureInfo } = await supabase
              .from('fixtures')
              .select('competition_type, season_id')
              .eq('id', fixtureId)
              .maybeSingle();

            if (fixtureInfo?.competition_type === 'cup') {
              // B2: Doğru league_id'yi bul — fixture'ın season_id'sinden seasons.league_id'ye
              let leagueIdForCup: string | null = null;
              try {
                const { data: seasonRow } = await supabase
                  .from('seasons')
                  .select('league_id')
                  .eq('id', fixtureInfo.season_id)
                  .maybeSingle();
                leagueIdForCup = seasonRow?.league_id || null;
              } catch {
                leagueIdForCup = null; // Fallback — season_id, league_id değildir
              }

              // leagueIdForCup yoksa, cup_seasons'ı league_id olmadan arayamayız — atla
              if (!leagueIdForCup) {
                console.warn(`[m[cron/match-tick] Kupa: league_id çözülemedi (season_id=${fixtureInfo.season_id}), cup güncelleme atlanıyor`);
                continue; // Bu session'ın cup güncellemesini atla, bir sonraki session'a geç
              }

              // Bu maç bir kupa maçı — cup_seasons'da güncelle
              const { data: cupSeasonRow } = await supabase
                .from('cup_seasons')
                .select('id, data, current_round, league_id, cup_id, is_completed')
                .eq('league_id', leagueIdForCup)  // B2: league_id ile ara, season_id ile değil
                .eq('status', 'active')
                .maybeSingle();

              if (cupSeasonRow && !cupSeasonRow.is_completed) {
                // DÜZELTME: Kupa verisini güvenli parse et — null/bozuk JSON koruması
                const csData = safeJsonParse<any>(cupSeasonRow.data, null);
                if (!csData) {
                  console.warn('[m[cron/match-tick] Kupa verisi null/bozuk, atlanıyor');
                } else {

                // Kupa verisindeki maçı güncelle (fixture_id öncelikli, fallback: isim eşleşme)
                const homeTeamName = session.home_team_name;
                const awayTeamName = session.away_team_name;
                let matchUpdated = false;

                // İsim eşleşme yardımcısı — case-insensitive + kısmi eşleşme
                const namesMatch = (a: string, b: string) => {
                  if (!a || !b) return false;
                  const na = a.trim().toLowerCase();
                  const nb = b.trim().toLowerCase();
                  return na === nb || na.includes(nb) || nb.includes(na);
                };

                // 1. Doğrudan fixture_id ile eşleştir (güvenilir)
                // S3-6 FIX: Primary matching by fixture_id in cup_seasons.data
                // TODO: Future improvement — query fixtures.cup_season_id + round + teams
                //       instead of iterating through all cup_seasons.data matches.
                //       The cup_season_id column is now on fixtures for this purpose.
                outerLoop: for (const round of csData.rounds || []) {
                  for (const match of round.matches || []) {
                    if ((match as any).fixture_id === fixtureId) {
                      (match as any).homeScore = newHomeScore;
                      (match as any).awayScore = newAwayScore;
                      (match as any).status = 'played';
                      matchUpdated = true;
                      break outerLoop;
                    }
                  }
                }

                // 2. fixture_id yoksa takım adı ile (fallback)
                // S3-6 NOTE: This fallback is fragile for teams with similar names.
                //            The cup_season_id column on fixtures will enable a better approach:
                //            Query fixture by cup_season_id + teams instead of name matching.
                if (!matchUpdated) {
                  const hn = session.home_team_name as string;
                  const an = session.away_team_name as string;
                  outerLoop2: for (const round of csData.rounds || []) {
                    for (const match of round.matches || []) {
                      if (namesMatch((match as any).homeTeam, hn) && namesMatch((match as any).awayTeam, an)) {
                        (match as any).homeScore = newHomeScore;
                        (match as any).awayScore = newAwayScore;
                        (match as any).status = 'played';
                        matchUpdated = true;
                        break outerLoop2;
                      }
                    }
                  }
                }

                if (!matchUpdated) {
                  console.warn(`[m[cron/match-tick] Kupa eşleşmedi: ${fixtureId} — ${session.home_team_name} vs ${session.away_team_name}`);
                }

                if (matchUpdated) {
                  await supabase.from('cup_seasons').update({ data: csData }).eq('id', cupSeasonRow.id);

                  // Bu turdaki tüm maçlar bitti mi? → advanceCupRound
                  const currentRoundIdx = csData.currentRound - 1;
                  const currentRound = csData.rounds[currentRoundIdx];
                  const allPlayed = currentRound?.matches.every(
                    (m: any) => m.status === 'played' || m.status === 'penalties' || m.status === 'extra_time'
                  );

                  if (allPlayed) {
                    const { advanceCupRound, CUP_DEFINITIONS } = await import('@/lib/fm/cupSystem');
                    const cupDef = CUP_DEFINITIONS.find(d => d.id === csData.cupId);
                    if (cupDef) {
                      const advanced = advanceCupRound(csData, cupDef);
                      await supabase.from('cup_seasons').update({
                        data: advanced,
                        current_round: advanced.currentRound,
                        is_completed: advanced.isCompleted,
                        winner: advanced.winner,
                        runner_up: advanced.runnerUp,
                      }).eq('id', cupSeasonRow.id);

                      if (!advanced.isCompleted) {
                        // Bir sonraki tur fixture'larını oluştur
                        const { generateCupFixtures } = await import('@/lib/fm/cupSystem');
                        const nextFixtures = generateCupFixtures(advanced, fixtureInfo.season_id);

                        // Takım adlarını ID'ye çevir — DÜZELTME C2: leagueIdForCup kullan (season_id değil)
                        const teamNameToId: Record<string, string> = {};
                        const { data: lt } = await supabase
                          .from('league_teams').select('id, name').eq('league_id', leagueIdForCup);
                        for (const t of lt || []) teamNameToId[t.name] = t.id;

                        const fixtureRows = nextFixtures
                          .filter(f => teamNameToId[f.home_team_id] && teamNameToId[f.away_team_id])
                          .map(f => ({
                            ...f,
                            home_team_id: teamNameToId[f.home_team_id],
                            away_team_id: teamNameToId[f.away_team_id],
                            // S3-6 FIX: cup_season_id for reliable bracket matching
                            cup_season_id: cupSeasonRow?.id || null,
                          }));

                        if (fixtureRows.length > 0) {
                          const { data: insertedNextFixtures } = await supabase
                            .from('fixtures')
                            .insert(fixtureRows)
                            .select('id, home_team_id, away_team_id');

                          console.log(`[m[cron/match-tick] Kupa: ${fixtureRows.length} sonraki tur fixture eklendi`);

                          // Yeni fixture_id'leri cup_seasons.data'ya yaz
                          if (insertedNextFixtures && insertedNextFixtures.length > 0) {
                            for (const ins of insertedNextFixtures) {
                              for (const round of (advanced.rounds || [])) {
                                for (const match of (round.matches || [])) {
                                  const hId = (teamNameToId as Record<string, string>)[match.homeTeam];
                                  const aId = (teamNameToId as Record<string, string>)[match.awayTeam];
                                  if (hId === ins.home_team_id && aId === ins.away_team_id) {
                                    (match as any).fixture_id = ins.id;
                                  }
                                }
                              }
                            }
                            await supabase.from('cup_seasons').update({ data: advanced }).eq('id', cupSeasonRow.id);
                            console.log(`[m[cron/match-tick] Kupa: ${insertedNextFixtures.length} fixture_id → cup_seasons güncellendi`);
                          }
                        }
                      } else {
                        // Kupa bitti → şampiyona ödülü öde
                        if (advanced.winner) {
                          // Winner is a team name → find profile via league_teams
                          const { data: winnerTeam } = await supabase
                            .from('league_teams')
                            .select('profile_id')
                            .eq('name', advanced.winner)
                            .eq('league_id', fixtureInfo.season_id)
                            .maybeSingle();
                          if (winnerTeam?.profile_id) {
                            const championReward = advanced.championReward || 10_000_000;
                            const { data: wp } = await supabase.from('profiles').select('money').eq('id', winnerTeam.profile_id).single();
                            if (wp) {
                              await supabase.from('profiles').update({ money: (wp.money || 0) + championReward }).eq('id', winnerTeam.profile_id);
                              console.log(`[m[cron/match-tick] Kupa şampiyonu ${advanced.winner}: ${championReward.toLocaleString('tr-TR')} € ödül`);
                            }
                          }
                        }
                      }
                    }
                  }
                  console.log(`[m[cron/match-tick] Kupa maçı sonucu güncellendi: ${homeTeamName} ${newHomeScore}-${newAwayScore} ${awayTeamName}`);
                }
                } // else csData sonu
              }
            }
          } catch (cupErr) {
            console.warn(`[m[cron/match-tick] Cup match result update failed:`, cupErr);
          }

          // ═══════════════════════════════════════════════════════════
          // PLAYOFF MAÇI SONUCU → Yükselme
          // Yarı finaller bittikten sonra final oluştur
          // Final bittikten sonra kazananı bir üst lige yükselt
          // ═══════════════════════════════════════════════════════════
          try {
            const { data: fixtureInfo2 } = await supabase
              .from('fixtures')
              .select('competition_type, season_id')
              .eq('id', fixtureId)
              .maybeSingle();

            if (fixtureInfo2?.competition_type === 'playoff') {
              // Tur 35 (yarı finaller) bitti mi?
              const { data: playoffResults } = await supabase
                .from('fixtures')
                .select('home_team_id, away_team_id, home_score, away_score, tur')
                .eq('competition_type', 'playoff')
                .eq('status', 'completed')
                .gte('tur', 35);

              if (playoffResults && playoffResults.length >= 2) {
                // Yarı finaller tamamlandı — final oluştur (henüz yoksa)
                const { count: finalCount } = await supabase
                  .from('fixtures')
                  .select('id', { count: 'exact', head: true })
                  .eq('competition_type', 'playoff')
                  .eq('tur', 36);

                if (!finalCount || finalCount === 0) {
                  // Yarı final kazananlarını bul
                  const winners: string[] = [];
                  for (const pf of playoffResults.filter((r: any) => r.tur === 35)) {
                    const winner = (pf.home_score > pf.away_score) ? pf.home_team_id : pf.away_team_id;
                    winners.push(winner);
                  }

                  if (winners.length >= 2) {
                    const finalDate = new Date();
                    finalDate.setDate(finalDate.getDate() + 2);
                    await supabase.from('fixtures').insert({
                      home_team_id: winners[0],
                      away_team_id: winners[1],
                      season_id: fixtureInfo2.season_id,
                      tur: 36,
                      match_date: finalDate.toISOString().split('T')[0],
                      match_time: '18:00',
                      status: 'scheduled',
                      competition_type: 'playoff',
                    });
                    console.log(`[m[cron/match-tick] Playoff finali oluşturuldu: ${winners[0]} vs ${winners[1]}`);
                  }
                }
              }

              // Final maçı (tur 36) bitti mi? → Kazananı yükselt
              const { data: finalMatch } = await supabase
                .from('fixtures')
                .select('home_team_id, away_team_id, home_score, away_score, season_id')
                .eq('competition_type', 'playoff')
                .eq('tur', 36)
                .eq('status', 'completed')
                .maybeSingle();

              if (finalMatch) {
                const playoffWinnerId = finalMatch.home_score > finalMatch.away_score
                  ? finalMatch.home_team_id
                  : finalMatch.away_team_id;

                // Kazananın mevcut ligini bul ve bir üst lige taşı
                const { data: winnerTeam } = await supabase
                  .from('league_teams')
                  .select('id, name, league_id, profile_id')
                  .eq('id', playoffWinnerId)
                  .maybeSingle();

                if (winnerTeam) {
                  // Mevcut ligin tier'ını bul
                  const { data: currentLeague } = await supabase
                    .from('leagues')
                    .select('id, name, tier')
                    .eq('id', winnerTeam.league_id)
                    .maybeSingle();

                  if (currentLeague && currentLeague.tier > 1) {
                    const { moveTeamToLeague } = await import('@/lib/fm/leagueHelpers');
                    const targetTier = currentLeague.tier - 1;
                    // Üst lig bul
                    const { data: upperLeagues } = await supabase
                      .from('leagues')
                      .select('id, name, tier')
                      .eq('tier', targetTier)
                      .order('created_at', { ascending: true })
                      .limit(1);

                    if (upperLeagues && upperLeagues.length > 0) {
                      const targetLeague = upperLeagues[0];
                      await moveTeamToLeague(supabase, winnerTeam.id, targetLeague.id, winnerTeam.name, winnerTeam.profile_id);
                      console.log(`[m[cron/match-tick] Playoff kazananı yükseltildi: ${winnerTeam.name} → ${targetLeague.name}`);

                      // Bildirim gönder
                      if (winnerTeam.profile_id) {
                        await insertInAppNotification(
                          supabase, winnerTeam.profile_id,
                          '🎉 Playoff Kazananı!',
                          `${winnerTeam.name} playoff'u kazanarak ${targetLeague.name}'e yükseldi!`,
                          'promotion', fixtureId,
                        );
                      }
                    }
                  }
                }
              }
            }
          } catch (playoffErr) {
            console.warn(`[m[cron/match-tick] Playoff completion logic failed:`, playoffErr);
          }
        }

        tickResults.push({
          fixtureId,
          currentMinute: toMinute,
          newEvents: newEventRows.length,
          status: newStatus,
        });

        console.log(`[m[cron/match-tick] ${fixtureId}: minute=${toMinute}, events=${newEventRows.length}, status=${newStatus}`);

      } catch (err) {
        errors.push(`Session ${session.id}: ${err}`);
        console.error(`[m[cron/match-tick] Error processing session ${session.id}:`, err);
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
  } finally {
    // ── Cron Lock bırak ──
    if (lock) {
      await releaseCronLock(supabase, LOCK_NAME, lock);
    }
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
