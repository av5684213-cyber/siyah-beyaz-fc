/**
 * @deprecated Bu route kullanılmıyor ve vercel.json'da kayıtlı değil.
 * Bırakılan mimari: match_sessions tabanlı canlı maç oturumu başlatma.
 * Aktif simülasyon: /api/cron/process-match-queue kullanılıyor.
 *
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
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { pickRefereeForMatch, generateLeagueReferees, type Referee } from '@/lib/fm/referee';
import { sendPushToProfile } from '@/lib/push-notifications';
import { createErrorResponse } from '@/lib/api-error-handler';

export const maxDuration = 60; // 5 dakika (Vercel limiti)

// Yardımcı: rastgele seçim
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═══════════════════════════════════════════════════════════════
// active_tactics → ActiveTactic dönüştürücü
// ═══════════════════════════════════════════════════════════════
function buildActiveTactic(tacticsData: Record<string, any> | null): any {
  const tempo = Number(tacticsData?.tempo || 50);
  const defLine = tacticsData?.defense_line || 'standart';
  const playWidth = tacticsData?.play_width || 'normal';
  return {
    formation: tacticsData?.formation || '4-4-2',
    mentality: Number(tacticsData?.mentality || 3),
    pressing: tacticsData?.pressing || false,
    passingStyle: tacticsData?.passing_style || 'Karışık',
    intensity: tempo > 70 ? 'high' : tempo < 30 ? 'low' : 'normal',
    tactic_type: tacticsData?.formation || '4-4-2',
    lineHeight: defLine === 'onde' ? 70 : defLine === 'geride' ? 30 : 50,
    width: playWidth === 'genis' ? 70 : playWidth === 'dar' ? 30 : 50,
    aggression: tempo > 70 ? 70 : 50,
    passingIntensity: tempo,
    screenKeeper: false,
    wasteTime: false,
    parkTheBus: defLine === 'geride',
    crossGame: playWidth === 'genis',
    loneStrikerCounter: false,
    offsideTrap: tacticsData?.pressing || false,
    playStyle: defLine === 'onde' ? 'hucum' : defLine === 'geride' ? 'savunma' : 'dengeli',
    tempo: tempo > 70 ? 'hizli' : tempo < 30 ? 'yavas' : 'normal',
    defensiveLine: defLine === 'onde' ? 'onde' : defLine === 'geride' ? 'geride' : 'normal',
  };
}

// ═══════════════════════════════════════════════════════════════
// Oyuncu filtreleme (cezalı/sakat)
// ═══════════════════════════════════════════════════════════════
function filterAvailable(players: any[]): any[] {
  const todayDate = new Date().toISOString().split('T')[0];
  return players.filter(p => {
    if (p.suspended_until && p.suspended_until >= todayDate) return false;
    if (p.is_injured) return false;
    if (p.injury) {
      try {
        const inj = typeof p.injury === 'string' ? JSON.parse(p.injury) : p.injury;
        if (inj.remaining_days > 0) return false;
      } catch { /* ignore */ }
    }
    return true;
  });
}

// ═══════════════════════════════════════════════════════════════
// In-app notification helper (graceful — tablo yoksa atla)
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
    console.warn('[match-scheduler] In-app notification insert skipped:', err);
  }
}

// ═══════════════════════════════════════════════════════════════
// Taktik → goalMod/conceedMod dönüşümü
// ═══════════════════════════════════════════════════════════════
function tacticToModifiers(tacticStr: string): { goalMod: number; conceedMod: number } {
  switch (tacticStr) {
    case 'hucum':
    case 'attack':
      return { goalMod: 0.10, conceedMod: 0.05 };
    case 'savunma':
    case 'defense':
      return { goalMod: -0.05, conceedMod: -0.10 };
    case 'kontra':
    case 'counter':
      return { goalMod: 0.05, conceedMod: 0.0 };
    case 'pres':
    case 'press':
      return { goalMod: 0.03, conceedMod: 0.02 };
    case 'normal':
    case 'dengeli':
    default:
      return { goalMod: 0, conceedMod: 0 };
  }
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

  const results: Array<{
    fixtureId: string;
    homeTeam: string;
    awayTeam: string;
    sessionId: string;
  }> = [];
  const errors: string[] = [];

  try {
    console.log('[cron/match-scheduler] Starting match session initialization...');

    // 1. Bugün oynanacak scheduled maçları bul
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    const { data: pendingFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id, tur, season_id, match_date, match_time')
      .eq('status', 'scheduled')
      .eq('match_date', today)
      .limit(10);

    if (fixturesError) {
      console.error('[cron/match-scheduler] Error fetching fixtures:', fixturesError);
      return NextResponse.json({ error: fixturesError.message }, { status: 500 });
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
        const { data: existingSession } = await supabase
          .from('match_sessions')
          .select('id')
          .eq('fixture_id', fixture.id)
          .maybeSingle();

        if (existingSession) {
          console.log(`[cron/match-scheduler] Session already exists for fixture ${fixture.id}, skipping`);
          continue;
        }

        // ── Ev sahibi ve deplasman takım bilgilerini çek ──
        const { data: homeTeamData } = await supabase
          .from('league_teams')
          .select('id, name, profile_id')
          .eq('id', fixture.home_team_id)
          .single();

        const { data: awayTeamData } = await supabase
          .from('league_teams')
          .select('id, name, profile_id')
          .eq('id', fixture.away_team_id)
          .single();

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

        // Cezalı ve sakat oyuncuları filtrele
        const availableHome = filterAvailable(homePlayers).slice(0, 11);
        const availableAway = filterAvailable(awayPlayers).slice(0, 11);

        if (availableHome.length < 7 || availableAway.length < 7) {
          errors.push(`Fixture ${fixture.id}: Not enough available players after filtering (${availableHome.length} vs ${availableAway.length})`);
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
        const weather = pickRandom(['sunny', 'sunny', 'sunny', 'rainy', 'snowy', 'windy'] as const);

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
            simulation_speed: 2.0,
            last_updated: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (sessionError || !sessionData) {
          errors.push(`Fixture ${fixture.id}: Failed to create session: ${sessionError?.message}`);
          continue;
        }

        const sessionId = sessionData.id;

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
  }
}
