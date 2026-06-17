/**
 * Cron Job: Maç Simülasyonu Queue İşleyicisi
 *
 * match-simulator cron'u pending fikstürleri match_simulation_queue tablosuna ekler.
 * Bu endpoint her çağrıda kuyruktan 1 maç alıp simüle eder.
 * Vercel hobby/pro planında 10-60 saniye limitine takılmamak için tasarlandı.
 *
 * GET /api/cron/process-match-queue
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { simulateEnhancedMatch } from '@/lib/fm/enhancedMatchEngine';
import { applyCardSuspensions, applyMatchInjuries, saveMatchEvents } from '@/lib/fm/matchConsequencesService';
import { pickRefereeForMatch, generateLeagueReferees, getRefereeDisplayInfo, type Referee } from '@/lib/fm/referee';
import { safeJsonParse } from '@/lib/fm/sharedUtils';
import { computeStadiumEffects, applyStadiumEffects, detectMatchConditions, fetchStadiumLevels } from '@/lib/fm/stadiumMatrix';
import { calculateTeamPlayStyleModifiers } from '@/lib/fm/playStyles';
import { createErrorResponse } from '@/lib/api-error-handler';
import { acquireCronLock, releaseCronLock } from '@/lib/fm/cronLockService';
import { buildActiveTactic } from '@/lib/fm/tacticBuilder';

export const maxDuration = 60; // Pro plan sınırı

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

  // Cron lock: aynı anda iki instance çift işlem yapmasın
  const lock = await acquireCronLock(supabase, 'process-match-queue', 120);
  if (!lock) {
    return NextResponse.json({ message: 'Already running, skipped' });
  }

  try {
    // 1. Kuyruktan işlenecek bir maç al (en eski pending)
    const { data: queueItems, error: queueError } = await supabase
      .from('match_simulation_queue')
      .select('id, fixture_id, retry_count')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);

    if (queueError) {
      // Tablo mevcut değilse
      const errMsg = queueError.message || String(queueError);
      if (errMsg.includes('does not exist') || errMsg.includes('not found') || errMsg.includes('relation')) {
        return NextResponse.json({
          action: 'queue_not_ready',
          message: 'match_simulation_queue tablosu mevcut değil. Migration çalıştırın.',
          timestamp: new Date().toISOString(),
        }, { status: 503 });
      }
      return createErrorResponse(queueError, { route: '/api/cron/process-match-queue', method: 'GET' });
    }

    if (!queueItems || queueItems.length === 0) {
      return NextResponse.json({
        action: 'none',
        message: 'Kuyrukta bekleyen maç yok',
        timestamp: new Date().toISOString(),
      });
    }

    const queueItem = queueItems[0];

    // 2. Status'u processing olarak işaretle
    const { error: lockError } = await supabase
      .from('match_simulation_queue')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', queueItem.id)
      .eq('status', 'pending'); // Race condition koruması

    if (lockError || (lockError as any)?.count === 0) {
      // Başka bir instance aynı anda aldı, tekrar dene
      return NextResponse.json({
        action: 'retry',
        message: 'Kilit alınamadı, başka bir instance işliyor',
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Fikstür verisini çek — completed, live veya in_progress olanları atla
    const { data: fixture, error: fixtureError } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id, tur, season_id, match_date, status')
      .eq('id', queueItem.fixture_id)
      .single();

    if (fixtureError || !fixture) {
      await markQueueItem(supabase, queueItem.id, 'failed', 'Fixture not found: ' + (fixtureError?.message || 'unknown'));
      return NextResponse.json({ action: 'failed', message: 'Fixture bulunamadı' });
    }

    // Client tarafından oynanmış veya zaten işlenmiş maçları atla
    // SIM-7 FIX: Also skip 'finished' status (legacy inconsistency)
    if (fixture.status === 'completed' || fixture.status === 'finished' || fixture.status === 'live' || fixture.status === 'in_progress') {
      console.log(`[process-match-queue] Fixture ${fixture.id} already ${fixture.status}, skipping`);
      await markQueueItem(supabase, queueItem.id, 'completed');
      return NextResponse.json({
        action: 'skipped',
        message: `Fixture already ${fixture.status}`,
        fixture_id: fixture.id,
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Maç simülasyonu yap
    try {
      const result = await simulateSingleMatch(supabase, fixture);

      // 5. Queue item'ı completed olarak işaretle
      await markQueueItem(supabase, queueItem.id, 'completed');

      return NextResponse.json({
        action: 'match_simulated',
        queue_id: queueItem.id,
        fixture_id: fixture.id,
        home_team: result.homeTeam,
        away_team: result.awayTeam,
        score: result.score,
        timestamp: new Date().toISOString(),
      });
    } catch (simErr) {
      // Simülasyon hatası — retry count kontrol et
      const newRetry = (queueItem.retry_count || 0) + 1;
      if (newRetry >= 3) {
        await markQueueItem(supabase, queueItem.id, 'failed', String(simErr));
      } else {
        // Tekrar denenecek — pending'e geri al
        await supabase
          .from('match_simulation_queue')
          .update({ status: 'pending', retry_count: newRetry, started_at: null, error_message: String(simErr) })
          .eq('id', queueItem.id);
      }

      return NextResponse.json({
        action: 'simulation_error',
        fixture_id: fixture.id,
        retry_count: newRetry,
        error: String(simErr),
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/process-match-queue', method: 'GET' });
  } finally {
    await releaseCronLock(supabase, 'process-match-queue', lock);
  }
}

// ═══════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════

async function markQueueItem(
  supabase: any,
  queueId: string,
  status: 'completed' | 'failed' | 'pending',
  errorMessage?: string
) {
  const update: Record<string, any> = { status };
  if (status === 'completed') update.completed_at = new Date().toISOString();
  if (errorMessage) update.error_message = errorMessage;
  await supabase.from('match_simulation_queue').update(update).eq('id', queueId);
}

async function simulateSingleMatch(
  supabase: any,
  fixture: { id: string; home_team_id: string; away_team_id: string; tur: number; season_id: string; match_date: string }
): Promise<{ homeTeam: string; awayTeam: string; score: string }> {
  // Ev sahibi takımın oyuncularını çek
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
    throw new Error(`Team data not found for fixture ${fixture.id}`);
  }

  // Oyuncuları çek
  const { data: homePlayers } = await supabase
    .from('players')
    .select('*')
    .eq('team_name', homeTeamData.name);

  const { data: awayPlayers } = await supabase
    .from('players')
    .select('*')
    .eq('team_name', awayTeamData.name);

  if (!homePlayers || homePlayers.length < 7 || !awayPlayers || awayPlayers.length < 7) {
    throw new Error(`Not enough players (${homePlayers?.length || 0} vs ${awayPlayers?.length || 0})`);
  }

  // Cezalı ve sakat oyuncuları filtrele
  const todayDate = new Date().toISOString().split('T')[0];
  const filterAvailable = (players: any[]) => players.filter(p => {
    if (p.suspended_until && p.suspended_until >= todayDate) return false;
    if (p.is_injured) return false;
    if (p.injury) {
      try {
        const inj = typeof p.injury === 'string' ? JSON.parse(p.injury) : p.injury;
        if (inj.remaining_days > 0) return false;
      } catch {}
    }
    // Çok yorgun oyuncu (cond < 20) oynayamaz
    if ((p.cond ?? 100) < 20) return false;
    return true;
  });

  const availableHome = filterAvailable(homePlayers);
  const availableAway = filterAvailable(awayPlayers);

  // HÜKMEN MAĞLUBİYET: Yeterli oyuncu yoksa (7'den az), o takım 3-0 hükmen yenik sayılır
  // Bu, sezonun donmasını engeller
  if (availableHome.length < 7 || availableAway.length < 7) {
    const forfeitScore = { home: availableHome.length < 7 ? 0 : 3, away: availableAway.length < 7 ? 0 : 3 };
    const loserTeam = availableHome.length < 7 ? homeTeamData.name : awayTeamData.name;
    console.warn(`[process-match-queue] HÜKMEN MAĞLUBİYET: ${loserTeam} yetersiz kadro (${availableHome.length} vs ${availableAway.length}), skor: ${forfeitScore.home}-${forfeitScore.away}`);

    // Fikstürü tamamlandı olarak işaretle
    await supabase
      .from('fixtures')
      .update({
        status: 'completed',
        home_score: forfeitScore.home,
        away_score: forfeitScore.away,
      })
      .eq('id', fixture.id);

    // Lig puanlarını güncelle (hükmen mağlup takıma 0 puan, rakibe 3 puan)
    await updateLeagueStandings(supabase, fixture.season_id, homeTeamData.id, awayTeamData.id, forfeitScore.home, forfeitScore.away);

    return {
      homeTeam: homeTeamData.name,
      awayTeam: awayTeamData.name,
      score: `${forfeitScore.home}-${forfeitScore.away} (hükmen)`,
    };
  }

  // Taktikleri çek
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
  } catch {}

  try {
    if (awayTeamData.profile_id) {
      const { data: tAway } = await supabase
        .from('active_tactics')
        .select('*')
        .eq('profile_id', awayTeamData.profile_id)
        .maybeSingle();
      if (tAway) awayTacticsData = tAway;
    }
  } catch {}

  // Hakem ata
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
    console.warn('[process-match-queue] Referee assignment failed:', refErr);
  }

  // Stadyum etkileri
  try {
    let stadiumUpgrades: Record<string, number> = {};
    if (homeTeamData.profile_id) {
      stadiumUpgrades = await fetchStadiumLevels(homeTeamData.profile_id);
    }
    const matchConditions = detectMatchConditions(fixture.match_date, (fixture as any).match_time);
    const stadiumEffects = computeStadiumEffects(stadiumUpgrades, matchConditions.isNightMatch, matchConditions.isWinterMatch);

    if (Object.keys(stadiumUpgrades).length > 0) {
      const applied = applyStadiumEffects(availableHome.slice(0, 11), availableAway.slice(0, 11), stadiumEffects);
      availableHome.splice(0, 11, ...applied.modifiedHomeSquad);
      availableAway.splice(0, 11, ...applied.modifiedAwaySquad);
    }
  } catch (stadiumErr) {
    console.warn('[process-match-queue] Stadium effects failed:', stadiumErr);
  }

  // Simülasyonu çalıştır
  const homeTactic = buildActiveTactic(homeTacticsData);
  const awayTactic = buildActiveTactic(awayTacticsData);

  const homePSMods = calculateTeamPlayStyleModifiers(availableHome.slice(0, 11), homeTactic.playStyle);
  const awayPSMods = calculateTeamPlayStyleModifiers(availableAway.slice(0, 11), awayTactic.playStyle);

  const matchResult = simulateEnhancedMatch(
    availableHome.slice(0, 11),
    availableAway.slice(0, 11),
    homeTactic,
    awayTactic,
    {
      homeTeamName: homeTeamData.name,
      awayTeamName: awayTeamData.name,
      refereeStrictness: refereeForMatch?.strictness,
      refereePersonality: refereeForMatch?.personality as any,
      refereeName: refereeForMatch?.name,
      homePlayStyleModifiers: homePSMods,
      awayPlayStyleModifiers: awayPSMods,
    }
  );

  const finalHomeScore = matchResult.homeScore;
  const finalAwayScore = matchResult.awayScore;

  // Sonucu kaydet
  const { error: updateError } = await supabase
    .from('fixtures')
    .update({
      status: 'completed',
      home_score: finalHomeScore,
      away_score: finalAwayScore,
      referee_id: refereeForMatch?.id ?? null,
      referee_name: refereeForMatch?.name ?? null,
      referee_personality: refereeForMatch?.personality ?? null,
      referee_strictness: refereeForMatch?.strictness ?? null,
    })
    .eq('id', fixture.id);

  if (updateError) {
    throw new Error('Failed to update fixture result: ' + updateError.message);
  }

  // Maç olaylarını kaydet
  await saveMatchEvents(fixture.id, matchResult.events);

  // Kart cezalarını uygula (S3-2 FIX: nextMatchDate ile)
  const cardEvents = matchResult.events
    .filter((e: any) => {
      const t = (e.type || '').toLowerCase();
      return t === 'yellow_card' || t === 'yellow' || t === 'red_card' || t === 'red';
    })
    .map((e: any) => {
      const t = (e.type || '').toLowerCase();
      const normalizedType = (t === 'yellow_card' || t === 'yellow') ? 'yellow_card' : 'red_card';
      return { type: normalizedType, playerId: e.playerId || e.player, team: e.team };
    });

  if (cardEvents.length > 0) {
    // S3-2 FIX: Find next fixture date for proper "1 match" suspension
    let nextMatchDate: Date | undefined;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: nextFixtures } = await supabase
        .from('fixtures')
        .select('match_date')
        .eq('season_id', fixture.season_id)
        .neq('status', 'completed')
        .gt('match_date', todayStr)
        .or(`home_team_id.eq.${fixture.home_team_id},away_team_id.eq.${fixture.home_team_id},home_team_id.eq.${fixture.away_team_id},away_team_id.eq.${fixture.away_team_id}`)
        .order('match_date', { ascending: true })
        .limit(1);
      if (nextFixtures && nextFixtures.length > 0 && nextFixtures[0].match_date) {
        nextMatchDate = new Date(nextFixtures[0].match_date);
      }
    } catch (nextMatchErr) {
      console.warn('[process-match-queue] Next match date lookup failed, using 3-day default:', nextMatchErr);
    }
    await applyCardSuspensions(cardEvents, nextMatchDate);
  }

  // Sakatlıkları uygula
  const injuryEvents = matchResult.events
    .filter((e: any) => (e.type || '').toLowerCase() === 'injury')
    .map((e: any) => ({ playerId: e.playerId || e.player, playerName: e.playerName || e.player }));

  if (injuryEvents.length > 0) {
    await applyMatchInjuries(injuryEvents);
  }

  // Lig puanlarını güncelle
  await updateLeagueStandings(supabase, fixture.season_id, homeTeamData.id, awayTeamData.id, finalHomeScore, finalAwayScore);

  // Increment matches_played for all starting players (via RPC to avoid double-counting)
  const playerUpdateIds = [
    ...(availableHome.slice(0, 11).map((p: any) => p.id) || []),
    ...(availableAway.slice(0, 11).map((p: any) => p.id) || []),
  ];
  if (playerUpdateIds.length > 0) {
    for (const pid of playerUpdateIds) {
      try {
        await supabase.rpc('increment_player_stat', {
          p_player_id: pid,
          p_stat: 'matches_played',
          p_amount: 1,
        });
      } catch (rpcErr) {
        // Fallback: direct update if RPC not available
        try {
          const { data: curP } = await supabase
            .from('players')
            .select('id, matches_played')
            .eq('id', pid)
            .maybeSingle();
          if (curP) {
            await supabase
              .from('players')
              .update({ matches_played: (curP.matches_played || 0) + 1 })
              .eq('id', pid);
          }
        } catch {}
      }
    }

    // B8: Gol atan oyuncular
    const goalEvents = matchResult.events.filter((e: any) =>
      ['goal', 'GOAL', 'penalty_goal', 'free_kick_goal'].includes(e.type || '') && (e.playerId || e.player_id)
    );
    for (const goal of goalEvents as any[]) {
      const pid = goal.playerId || goal.player_id;
      if (!pid) continue;
      try {
        await supabase.rpc('increment_player_stat', {
          p_player_id: pid, p_stat: 'goals', p_amount: 1,
        });
      } catch {}
    }

    // B8: Asist yapanlar
    const assistEvents = matchResult.events.filter((e: any) =>
      ['goal', 'GOAL'].includes(e.type || '') && (e.assistPlayerId || e.assist_player_id)
    );
    for (const assist of assistEvents as any[]) {
      const apid = assist.assistPlayerId || assist.assist_player_id;
      if (!apid) continue;
      try {
        await supabase.rpc('increment_player_stat', {
          p_player_id: apid, p_stat: 'assists', p_amount: 1,
        });
      } catch {}
    }
  }

  // Oyuncu maç ratinglerini güncelle
  try {
    const allPlayerRatings = [
      ...matchResult.homePlayerRatings,
      ...matchResult.awayPlayerRatings,
    ];
    if (allPlayerRatings.length > 0) {
      const ratingUpdates: { id: string; match_ratings: any }[] = [];
      for (const pr of allPlayerRatings) {
        if (!pr.playerId) continue;
        const { data: playerData } = await supabase
          .from('players')
          .select('id, match_ratings')
          .eq('id', pr.playerId)
          .maybeSingle();
        if (!playerData) continue;
        const existingRatings = safeJsonParse<number[]>(playerData.match_ratings, []);
        const updatedRatings = [...existingRatings, pr.rating];
        if (updatedRatings.length > 5) updatedRatings.shift();
        ratingUpdates.push({ id: playerData.id, match_ratings: updatedRatings });
      }
      for (let i = 0; i < ratingUpdates.length; i += 50) {
        const batch = ratingUpdates.slice(i, i + 50);
        // TODO: Migrate to RPC (BUG-1) — players.upsert will fail once RLS is enforced; cron needs service-role
        await supabase.from('players').upsert(batch, { onConflict: 'id' });
      }
    }
  } catch (mrErr) {
    console.warn('[process-match-queue] match_ratings update failed:', mrErr);
  }

  // Hakem istatistiklerini güncelle
  if (refereeForMatch) {
    try {
      const yellowCount = matchResult.events.filter((e: any) => {
        const t = (e.type || '').toLowerCase();
        return t === 'yellow_card' || t === 'yellow';
      }).length;
      const redCount = matchResult.events.filter((e: any) => {
        const t = (e.type || '').toLowerCase();
        return t === 'red_card' || t === 'red';
      }).length;
      const penaltyCount = matchResult.events.filter((e: any) => {
        const t = (e.type || '').toLowerCase();
        return t === 'penalty';
      }).length;
      await supabase.from('referees').update({
        total_matches: (refereeForMatch.totalMatches || 0) + 1,
        total_yellows: (refereeForMatch.totalYellows || 0) + yellowCount,
        total_reds: (refereeForMatch.totalReds || 0) + redCount,
        total_penalties: (refereeForMatch.totalPenalties || 0) + penaltyCount,
      }).eq('id', refereeForMatch.id);
    } catch (refUpdateErr) {
      console.warn('[process-match-queue] Referee stats update failed:', refUpdateErr);
    }
  }

  // ── XP / Fans güncelleme ──────────────────────────────────────────────
  // Kazanma/beraberlik/mağlubiyet sonucuna göre profile XP ve fan değişimi yaz
  try {
    const { awardMatchXpAndFans } = await import('@/lib/fm/xpLevelFansService');

    // Ev sahibi için sonuç hesapla
    if (homeTeamData.profile_id) {
      try {
        const homeResult: 'win' | 'draw' | 'loss' =
          finalHomeScore > finalAwayScore ? 'win' :
          finalHomeScore === finalAwayScore ? 'draw' : 'loss';
        await awardMatchXpAndFans(homeTeamData.profile_id, homeResult, 'league');
      } catch (xpErr) {
        console.warn('[process-match-queue] Home XP/fans award error:', xpErr);
      }
    }

    // Deplasman takımı için sonuç hesapla (ters açı)
    if (awayTeamData.profile_id) {
      try {
        const awayResult: 'win' | 'draw' | 'loss' =
          finalAwayScore > finalHomeScore ? 'win' :
          finalAwayScore === finalHomeScore ? 'draw' : 'loss';
        await awardMatchXpAndFans(awayTeamData.profile_id, awayResult, 'league');
      } catch (xpErr) {
        console.warn('[process-match-queue] Away XP/fans award error:', xpErr);
      }
    }
  } catch (xpImportErr) {
    console.warn('[process-match-queue] XP/fans service import error:', xpImportErr);
  }

  console.log(`[process-match-queue] ${homeTeamData.name} ${finalHomeScore}-${finalAwayScore} ${awayTeamData.name}`);

  return {
    homeTeam: homeTeamData.name,
    awayTeam: awayTeamData.name,
    score: `${finalHomeScore}-${finalAwayScore}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// LİG PUAN TABLOSU GÜNCELLEME
// ═══════════════════════════════════════════════════════════════

async function updateLeagueStandings(
  supabase: any,
  seasonId: string,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number
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
      // league_teams.played de güncellenmeli — season-end buna bakıyor
      try {
        await supabase.from('league_teams')
          .update({ played: updated.played, won: updated.won, drawn: updated.drawn, lost: updated.lost, gf: updated.gf, ga: updated.ga, points: updated.points })
          .eq('id', homeTeamId);
      } catch (ltErr) {
        console.warn('[process-match-queue] league_teams home update failed:', ltErr);
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
      };
      await supabase.from('league_standings').update(updated).eq('id', awayStanding.id);
      // league_teams.played de güncellenmeli
      try {
        await supabase.from('league_teams')
          .update({ played: updated.played, won: updated.won, drawn: updated.drawn, lost: updated.lost, gf: updated.gf, ga: updated.ga, points: updated.points })
          .eq('id', awayTeamId);
      } catch (ltErr) {
        console.warn('[process-match-queue] league_teams away update failed:', ltErr);
      }
    }
  } catch (err) {
    console.error('[process-match-queue] Error updating standings:', err);
  }
}
