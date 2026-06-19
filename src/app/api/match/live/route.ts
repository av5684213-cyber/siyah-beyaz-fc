/**
 * BUG-3: Canlı Maç API Endpoint'i
 *
 * POST /api/match/live
 * Maçı başlatır (start), simülasyon adımı çalıştırır (simulate_step),
 * veya taktik müdahalesi uygular (apply_tactics).
 *
 * Body: { action: 'start' | 'simulate_step' | 'apply_tactics', matchId, ... }
 *
 * Key behaviors:
 * - start: loads fixture data, creates initial state in match_live_state table
 * - simulate_step: runs 5-min segment using enhancedMatchEngine (startMinute/endMinute)
 * - apply_tactics: only when is_paused=true, updates tactics with 2-min delay flag
 *   Limited to 3 interventions per team per match
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { simulateEnhancedMatch, type EnhancedMatchResult } from '@/lib/fm/enhancedMatchEngine';
import type { Player, ActiveTactic } from '@/lib/fm/types';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

const SEGMENT_DURATION = 5; // 5 oyun dakikası per adım
const SEGMENT_REAL_WAIT_SECONDS = 30; // 30 saniye bekleme
const MAX_TACTIC_INTERVENTIONS = 3; // Her takım için max taktik müdahale sayısı
const TACTIC_DELAY_MINUTES = 2; // Taktik değişikliğinin etkili olması için 2 dakikalık gecikme

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is null' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { action, matchId } = body;

    if (!matchId) {
      return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
    }

    switch (action) {
      case 'start': {
        return await handleStart(supabase, matchId);
      }
      case 'simulate_step': {
        return await handleSimulateStep(supabase, matchId);
      }
      case 'apply_tactics': {
        const { profileId: bodyProfileId, tactics } = body;
        const profileId = getAuthenticatedUserId(request, bodyProfileId);
        if (!profileId || !tactics) {
          return NextResponse.json({ error: 'profileId and tactics are required' }, { status: 400 });
        }
        return await handleApplyTactics(supabase, matchId, profileId, tactics);
      }
      case 'resume': {
        return await handleResume(supabase, matchId);
      }
      default:
        return NextResponse.json({ error: 'Invalid action. Use: start, simulate_step, apply_tactics, resume' }, { status: 400 });
    }
  } catch (err) {
    console.error('[match/live] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── START: Maçı başlat ────────────────────────────────────────────────────
async function handleStart(supabase: any, matchId: string) {
  // Fikstürü al
  const { data: fixture, error: fixtureError } = await supabase
    .from('fixtures')
    .select('id, home_team_id, away_team_id, status')
    .eq('id', matchId)
    .maybeSingle();

  if (fixtureError || !fixture) {
    return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
  }

  // Zaten canlı mı kontrol et
  const { data: existingState } = await supabase
    .from('match_live_state')
    .select('state_json')
    .eq('match_id', matchId)
    .maybeSingle();

  if (existingState?.state_json) {
    const parsed = typeof existingState.state_json === 'string'
      ? JSON.parse(existingState.state_json)
      : existingState.state_json;
    // Devam eden maç varsa onu döndür
    if (parsed && !parsed.isCompleted) {
      return NextResponse.json({
        success: true,
        state: parsed,
        resumed: true,
        nextStepIn: SEGMENT_REAL_WAIT_SECONDS,
      });
    }
  }

  // Ev sahibi ve deplasman takımların oyuncularını al
  const { data: homeTeam } = await supabase
    .from('league_teams')
    .select('profile_id, name')
    .eq('id', fixture.home_team_id)
    .maybeSingle();

  const { data: awayTeam } = await supabase
    .from('league_teams')
    .select('profile_id, name')
    .eq('id', fixture.away_team_id)
    .maybeSingle();

  const homeProfileId = homeTeam?.profile_id;
  const awayProfileId = awayTeam?.profile_id;

  // Oyuncuları çek
  const { data: homePlayers } = await supabase
    .from('players')
    .select('*')
    .eq('profile_id', homeProfileId);

  const { data: awayPlayers } = await supabase
    .from('players')
    .select('*')
    .eq('profile_id', awayProfileId);

  if (!homePlayers?.length || !awayPlayers?.length) {
    return NextResponse.json({ error: 'Takımlarda yeterli oyuncu yok' }, { status: 400 });
  }

  // Taktikleri çek
  const { data: homeTactic } = await supabase
    .from('active_tactics')
    .select('*')
    .eq('profile_id', homeProfileId)
    .maybeSingle();

  const { data: awayTactic } = await supabase
    .from('active_tactics')
    .select('*')
    .eq('profile_id', awayProfileId)
    .maybeSingle();

  // State oluştur — tacticInterventionCount ile
  const initialState = {
    matchId,
    homeTeamName: homeTeam?.name || 'Ev Sahibi',
    awayTeamName: awayTeam?.name || 'Deplasman',
    homeProfileId: homeProfileId || null,
    awayProfileId: awayProfileId || null,
    homePlayers,
    awayPlayers,
    homeTactic: homeTactic || { formation: '4-4-2', mentality: 3 },
    awayTactic: awayTactic || { formation: '4-4-2', mentality: 3 },
    currentMinute: 0,
    homeScore: 0,
    awayScore: 0,
    segmentDuration: SEGMENT_DURATION,
    currentSegment: 0,
    totalSegments: Math.ceil(90 / SEGMENT_DURATION),
    events: [],
    isPaused: false,
    isCompleted: false,
    halftime: false,
    // Taktik müdahale sayaçları
    homeTacticInterventions: 0,
    awayTacticInterventions: 0,
    // Bekleyen taktik değişiklikleri (2 dakika gecikme ile)
    pendingTacticChange: null as null | {
      teamSide: 'home' | 'away';
      tactics: any;
      effectiveAtMinute: number;
    },
    startedAt: new Date().toISOString(),
  };

  // match_live_state tablosuna kaydet
  const { error: stateError } = await supabase
    .from('match_live_state')
    .upsert({
      match_id: matchId,
      state_json: initialState,
      segment_duration: SEGMENT_DURATION,
      current_segment: 0,
      is_paused: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'match_id' });

  if (stateError) {
    console.warn('[match/live] match_live_state upsert error:', stateError.message);
  }

  return NextResponse.json({
    success: true,
    state: initialState,
    nextStepIn: SEGMENT_REAL_WAIT_SECONDS,
  });
}

// ─── SIMULATE_STEP: 5 dakikalık simülasyon adımı ──────────────────────────
async function handleSimulateStep(supabase: any, matchId: string) {
  // State'i oku
  let state: any = null;
  let liveIsPaused = false;

  const { data: liveState } = await supabase
    .from('match_live_state')
    .select('state_json, current_segment, is_paused')
    .eq('match_id', matchId)
    .maybeSingle();

  if (liveState) {
    state = typeof liveState.state_json === 'string' ? JSON.parse(liveState.state_json) : liveState.state_json;
    liveIsPaused = liveState.is_paused || false;
  }

  if (!state) {
    return NextResponse.json({ error: 'Match state not found. Start the match first.' }, { status: 404 });
  }

  if (state.currentMinute >= 90 || state.isCompleted) {
    return NextResponse.json({ success: true, state, message: 'Match already completed' });
  }

  if (liveIsPaused || state.isPaused) {
    return NextResponse.json({
      success: true,
      state,
      isPaused: true,
      message: 'Match is paused for tactical intervention',
    });
  }

  // Bekleyen taktik değişikliğini uygula (2 dakika gecikme)
  if (state.pendingTacticChange) {
    const pending = state.pendingTacticChange;
    if (state.currentMinute >= pending.effectiveAtMinute) {
      // Taktik artık etkili — uygula
      if (pending.teamSide === 'home') {
        state.homeTactic = { ...state.homeTactic, ...pending.tactics };
      } else {
        state.awayTactic = { ...state.awayTactic, ...pending.tactics };
      }
      state.pendingTacticChange = null;
      console.log(`[match/live] Pending tactic applied at minute ${state.currentMinute} for ${pending.teamSide}`);
    }
  }

  // 5 dakikalık segmenti simüle et
  const fromMinute = state.currentMinute + 1;
  const toMinute = Math.min(state.currentMinute + SEGMENT_DURATION, 90);

  const result: EnhancedMatchResult = simulateEnhancedMatch(
    state.homePlayers as Player[],
    state.awayPlayers as Player[],
    (state.homeTactic || {}) as ActiveTactic,
    (state.awayTactic || {}) as ActiveTactic,
    {
      homeTeamName: state.homeTeamName || 'Ev Sahibi',
      awayTeamName: state.awayTeamName || 'Deplasman',
      startMinute: fromMinute,
      endMinute: toMinute,
      initialHomeScore: state.homeScore || 0,
      initialAwayScore: state.awayScore || 0,
    }
  );

  // State güncelle
  state.currentMinute = toMinute;
  state.homeScore = result.homeScore;
  state.awayScore = result.awayScore;
  state.currentSegment = (state.currentSegment || 0) + 1;
  state.events = [...(state.events || []), ...result.events];

  // İstatistikleri state'e ekle (tamamlanınca göstermek için)
  if (result.homeStats) state.homeStats = result.homeStats;
  if (result.awayStats) state.awayStats = result.awayStats;
  if (result.homePlayerRatings) state.homePlayerRatings = result.homePlayerRatings;
  if (result.awayPlayerRatings) state.awayPlayerRatings = result.awayPlayerRatings;
  if (result.manOfTheMatch) state.manOfTheMatch = result.manOfTheMatch;

  // Devre arası ve maç sonu kontrolleri
  if (toMinute >= 45 && fromMinute <= 45 && !state.halftime) {
    state.isPaused = true;
    state.halftime = true;
  }
  if (toMinute >= 90) {
    state.isCompleted = true;
    state.isPaused = false; // Maç bittiyse duraklatma yok
  }

  // DB'ye kaydet
  try {
    await supabase
      .from('match_live_state')
      .update({
        state_json: state,
        current_segment: state.currentSegment,
        is_paused: state.isPaused || false,
        updated_at: new Date().toISOString(),
      })
      .eq('match_id', matchId);
  } catch (dbErr) {
    console.warn('[match/live] State update failed:', dbErr);
  }

  // Yeni olayları match_events'e yaz
  if (result.events.length > 0) {
    try {
      const eventRows = result.events.map((event: any) => ({
        fixture_id: matchId,
        event_type: event.type,
        minute: event.minute,
        team: event.team,
        player_id: event.playerId || null,
        player_name: event.playerName || null,
        detail: event.description || null,
        is_revealed: true,
      }));
      await supabase.from('match_events').insert(eventRows);
    } catch (evtErr) {
      console.warn('[match/live] Event insert failed:', evtErr);
    }
  }

  // Skoru match_sessions'a da güncelle
  try {
    await supabase
      .from('match_sessions')
      .update({
        current_minute: toMinute,
        home_score: state.homeScore,
        away_score: state.awayScore,
        status: toMinute >= 90 ? 'completed' : (state.isPaused ? 'halftime' : 'live'),
      })
      .eq('fixture_id', matchId);
  } catch (sessErr) {
    console.warn('[match/live] Session update failed:', sessErr);
  }

  // Maç bittiyse fikstürü güncelle
  if (state.isCompleted) {
    try {
      await supabase
        .from('fixtures')
        .update({
          status: 'completed',
          home_score: state.homeScore,
          away_score: state.awayScore,
        })
        .eq('id', matchId);
    } catch (fixErr) {
      console.warn('[match/live] Fixture update failed:', fixErr);
    }
  }

  return NextResponse.json({
    success: true,
    segment: {
      fromMinute,
      toMinute,
      homeScore: state.homeScore,
      awayScore: state.awayScore,
      events: result.events,
    },
    state,
    isPaused: state.isPaused || false,
    isCompleted: state.isCompleted || false,
    nextStepIn: state.isCompleted ? 0 : SEGMENT_REAL_WAIT_SECONDS,
  });
}

// ─── APPLY_TACTICS: Kullanıcıdan gelen taktik değişikliği ────────────────
// Sadece is_paused=true durumunda çalışır
// Her takım maç başına en fazla MAX_TACTIC_INTERVENTIONS (3) kez müdahale edebilir
// Taktik değişikliği TACTIC_DELAY_MINUTES (2) dakikalık oyun gecikmesiyle uygulanır
async function handleApplyTactics(supabase: any, matchId: string, profileId: string, tactics: any) {
  // State'i oku
  let state: any = null;
  let liveIsPaused = false;

  const { data: liveState } = await supabase
    .from('match_live_state')
    .select('state_json, is_paused')
    .eq('match_id', matchId)
    .maybeSingle();

  if (liveState) {
    state = typeof liveState.state_json === 'string' ? JSON.parse(liveState.state_json) : liveState.state_json;
    liveIsPaused = liveState.is_paused || false;
  }

  if (!state) {
    return NextResponse.json({ error: 'Match state not found' }, { status: 404 });
  }

  // Maç bittiyse müdahale izni yok
  if (state.isCompleted) {
    return NextResponse.json({ error: 'Maç sona erdi, taktik değişikliği yapılamaz' }, { status: 400 });
  }

  // ZORUNLU: Sadece is_paused=true olduğunda müdahaleye izin ver
  if (!liveIsPaused && !state.isPaused) {
    return NextResponse.json({
      error: 'Taktik müdahalesi sadece duraklama anında yapılabilir (devre arası veya segment arası)',
    }, { status: 400 });
  }

  // Takım tespiti — state'teki profileId'leri kullan (daha verimli)
  let teamSide: 'home' | 'away' | null = null;
  if (state.homeProfileId === profileId) {
    teamSide = 'home';
  } else if (state.awayProfileId === profileId) {
    teamSide = 'away';
  }

  // Fallback: state'te profileId yoksa DB'den kontrol et
  if (!teamSide) {
    const { data: fixture } = await supabase
      .from('fixtures')
      .select('home_team_id, away_team_id')
      .eq('id', matchId)
      .maybeSingle();

    if (fixture) {
      const { data: homeTeam } = await supabase
        .from('league_teams')
        .select('profile_id')
        .eq('id', fixture.home_team_id)
        .maybeSingle();

      const { data: awayTeam } = await supabase
        .from('league_teams')
        .select('profile_id')
        .eq('id', fixture.away_team_id)
        .maybeSingle();

      if (homeTeam?.profile_id === profileId) teamSide = 'home';
      else if (awayTeam?.profile_id === profileId) teamSide = 'away';
    }
  }

  if (!teamSide) {
    return NextResponse.json({ error: 'Bu maçta size ait takım bulunamadı' }, { status: 403 });
  }

  // Müdahale sayısı kontrolü
  const interventionKey = teamSide === 'home' ? 'homeTacticInterventions' : 'awayTacticInterventions';
  const currentInterventions = state[interventionKey] || 0;

  if (currentInterventions >= MAX_TACTIC_INTERVENTIONS) {
    return NextResponse.json({
      error: `Maksimum taktik müdahale sayısına ulaşıldı (${MAX_TACTIC_INTERVENTIONS}/${MAX_TACTIC_INTERVENTIONS})`,
      interventionsUsed: currentInterventions,
      maxInterventions: MAX_TACTIC_INTERVENTIONS,
    }, { status: 429 });
  }

  // Müdahale sayısını artır
  state[interventionKey] = currentInterventions + 1;

  // Taktik değişikliğini 2 dakika gecikmeyle planla
  // (Maç devam ettiğinde 2 dakika sonra etkili olacak)
  state.pendingTacticChange = {
    teamSide,
    tactics,
    effectiveAtMinute: state.currentMinute + TACTIC_DELAY_MINUTES,
  };

  // Anlık taktik güncelleme (UI'da gösterim için) — ama 2 dk sonrasına kadar
  // engine'de etkili olmayacak, pendingTacticChange simulate_step'te uygulanır
  // Ancak duraklama anında UI'da göstermek için tactic'i hemen state'e yazalım
  if (teamSide === 'home') {
    state.homeTactic = { ...state.homeTactic, ...tactics };
  } else {
    state.awayTactic = { ...state.awayTactic, ...tactics };
  }

  // Taktik müdahale olayını ekle
  const tacticEvent = {
    minute: state.currentMinute,
    type: 'TACTICAL_CHANGE',
    team: teamSide,
    playerName: '',
    playerId: '',
    description: `Taktik değişikliği: ${tactics.formation || state[teamSide === 'home' ? 'homeTactic' : 'awayTactic']?.formation || '4-4-2'} - Mentalite: ${tactics.mentality || '3'}${tactics.pressing ? ' + Pressing' : ''} (${TACTIC_DELAY_MINUTES} dk gecikmeyle)`,
    x: 50,
    y: 50,
    ratingImpact: 0,
  };
  state.events = [...(state.events || []), tacticEvent];

  // Duraklamayı kaldır (müdahale sonrası devam et)
  state.isPaused = false;

  // State kaydet
  try {
    await supabase
      .from('match_live_state')
      .update({
        state_json: state,
        is_paused: false,
        updated_at: new Date().toISOString(),
      })
      .eq('match_id', matchId);
  } catch (dbErr) {
    console.warn('[match/live] Tactics state update failed:', dbErr);
  }

  // Taktik müdahale olayını match_events'e yaz
  try {
    await supabase.from('match_events').insert({
      fixture_id: matchId,
      event_type: 'TACTICAL_CHANGE',
      minute: state.currentMinute,
      team: teamSide,
      player_id: null,
      player_name: null,
      detail: tacticEvent.description,
      is_revealed: true,
    });
  } catch (evtErr) {
    console.warn('[match/live] Tactic event insert failed:', evtErr);
  }

  // active_tactics tablosunu da güncelle (kalıcı taktik değişikliği)
  try {
    await supabase.rpc('rpc_update_tactics', {
      p_profile_id: profileId,
      p_tactics: tactics,
    });
  } catch (rpcErr) {
    console.warn('[match/live] rpc_update_tactics failed:', rpcErr);
  }

  return NextResponse.json({
    success: true,
    teamSide,
    updatedTactics: teamSide === 'home' ? state.homeTactic : state.awayTactic,
    interventionsUsed: state[interventionKey],
    maxInterventions: MAX_TACTIC_INTERVENTIONS,
    delayMinutes: TACTIC_DELAY_MINUTES,
    effectiveAtMinute: state.pendingTacticChange?.effectiveAtMinute || state.currentMinute + TACTIC_DELAY_MINUTES,
  });
}

// ─── RESUME: Duraklamayı kaldır ve devam et ──────────────────────────────
async function handleResume(supabase: any, matchId: string) {
  let state: any = null;

  const { data: liveState } = await supabase
    .from('match_live_state')
    .select('state_json, is_paused')
    .eq('match_id', matchId)
    .maybeSingle();

  if (liveState) {
    state = typeof liveState.state_json === 'string' ? JSON.parse(liveState.state_json) : liveState.state_json;
  }

  if (!state) {
    return NextResponse.json({ error: 'Match state not found' }, { status: 404 });
  }

  if (!state.isPaused && !liveState?.is_paused) {
    return NextResponse.json({ error: 'Match is not paused' }, { status: 400 });
  }

  if (state.isCompleted) {
    return NextResponse.json({ error: 'Match is already completed' }, { status: 400 });
  }

  // Duraklamayı kaldır
  state.isPaused = false;

  try {
    await supabase
      .from('match_live_state')
      .update({
        state_json: state,
        is_paused: false,
        updated_at: new Date().toISOString(),
      })
      .eq('match_id', matchId);
  } catch (dbErr) {
    console.warn('[match/live] Resume state update failed:', dbErr);
  }

  return NextResponse.json({
    success: true,
    state,
    message: 'Match resumed',
    nextStepIn: SEGMENT_REAL_WAIT_SECONDS,
  });
}
