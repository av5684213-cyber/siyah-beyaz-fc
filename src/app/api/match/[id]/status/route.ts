/**
 * API Route: GET /api/match/[id]/status
 *
 * Bir maçın mevcut canlı durumunu döndürür:
 * - Fikstür detayları
 * - live_matches kaydı (varsa)
 * - Açığa çıkarılmış (is_revealed=true) maç olayları
 *
 * Client tarafı periyodik polling ile bu endpoint'i çağırarak
 * canlı maç ilerlemesini takip eder.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { sanitizeError } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: fixtureId } = await params;

  if (!fixtureId) {
    return NextResponse.json({ error: 'Fixture ID is required' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is null' }, { status: 500 });
  }

  try {
    // ── Fikstür detaylarını çek ──
    const { data: fixture, error: fixtureError } = await supabase
      .from('fixtures')
      .select(`
        id,
        tur,
        match_date,
        match_time,
        status,
        home_score,
        away_score,
        home_team_id,
        away_team_id,
        season_id,
        referee_name,
        referee_personality,
        referee_strictness,
        home:league_teams!home_team_id (name, id, is_bot, profile_id),
        away:league_teams!away_team_id (name, id, is_bot, profile_id)
      `)
      .eq('id', fixtureId)
      .maybeSingle();

    if (fixtureError || !fixture) {
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
    }

    // ── live_matches kaydını çek (varsa) ──
    let liveMatch = null;
    try {
      const { data: liveData } = await supabase
        .from('live_matches')
        .select('*')
        .eq('fixture_id', fixtureId)
        .maybeSingle();
      liveMatch = liveData || null;
    } catch (liveErr) {
      // live_matches tablosu mevcut olmayabilir — graceful degrade
      console.warn('[match/status] live_matches query failed (table may not exist):', liveErr);
    }

    // ── Açığa çıkarılmış maç olaylarını çek ──
    let revealedEvents: any[] = [];

    try {
      // Önce is_revealed sütunu ile sorgula
      const { data: eventsData, error: eventsError } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .eq('is_revealed', true)
        .order('minute', { ascending: true });

      if (eventsError) {
        // is_revealed sütunu olmayabilir — tüm olayları getir
        if (eventsError.message?.includes('is_revealed') || eventsError.message?.includes('column')) {
          console.warn('[match/status] is_revealed column not found, returning all events');
          const { data: allEvents } = await supabase
            .from('match_events')
            .select('*')
            .eq('fixture_id', fixtureId)
            .order('minute', { ascending: true });
          revealedEvents = allEvents || [];
        } else {
          console.error('[match/status] Events query error:', eventsError.message);
        }
      } else {
        revealedEvents = eventsData || [];
      }
    } catch (eventsErr) {
      console.warn('[match/status] Events query failed:', eventsErr);
    }

    // ── Skoru hesapla (açığa çıkarılmış gollerden) ──
    let calculatedHomeScore = 0;
    let calculatedAwayScore = 0;

    for (const event of revealedEvents) {
      const evtType = (event.event_type || '').toLowerCase();
      if (evtType === 'goal') {
        if (event.team === 'home') calculatedHomeScore++;
        else if (event.team === 'away') calculatedAwayScore++;
      }
    }

    // Eğer fikstür completed ise, fixture'daki skoru kullan
    const homeScore = fixture.status === 'completed' ? fixture.home_score : calculatedHomeScore;
    const awayScore = fixture.status === 'completed' ? fixture.away_score : calculatedAwayScore;

    // ── Yanıtı oluştur ──
    const response: Record<string, any> = {
      fixture: {
        ...fixture,
        // Canlı maçta hesaplanan skoru ekle
        calculated_home_score: homeScore,
        calculated_away_score: awayScore,
      },
      revealedEvents,
      timestamp: new Date().toISOString(),
    };

    if (liveMatch) {
      response.liveMatch = liveMatch;
    }

    return NextResponse.json(response);

  } catch (err) {
    return createErrorResponse(err, { route: '/api/match/[id]/status', method: 'GET' });
  }
}
