/**
 * Fikstür API Route — Takımın sezon fikstürünü getirir
 *
 * GET /api/fixture/[teamId]?seasonId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase yapılandırılmamış.' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const { teamId } = await params;
    if (!teamId) {
      return NextResponse.json({ error: true, message: 'teamId parametresi gerekli.' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');

    // 1. teamId ile league_teams kaydını bul
    const { data: teamData } = await supabase
      .from('league_teams')
      .select('id, name, league_id')
      .eq('profile_id', teamId)
      .maybeSingle();

    if (!teamData) {
      // Alternatif: profiles tablosundan team_name ile ara
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, team_name')
        .eq('id', teamId)
        .maybeSingle();

      if (!profile) {
        return NextResponse.json({ error: true, message: 'Takım bulunamadı.' }, { status: 404 });
      }

      const { data: altTeam } = await supabase
        .from('league_teams')
        .select('id, name, league_id')
        .eq('name', profile.team_name)
        .maybeSingle();

      if (!altTeam) {
        return NextResponse.json({ fixtures: [], nextMatch: null });
      }

      return await fetchFixturesForTeam(supabase, altTeam.id, altTeam.league_id, seasonId);
    }

    return await fetchFixturesForTeam(supabase, teamData.id, teamData.league_id, seasonId);
  } catch (err) {
    console.error('[GET /api/fixture/[teamId]] Exception:', err);
    return NextResponse.json(
      { error: true, message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
}

async function fetchFixturesForTeam(
  supabase: { from: (table: string) => any },
  leagueTeamId: string,
  leagueId: string | null,
  seasonId: string | null
): Promise<NextResponse> {
  try {
    let targetSeasonId = seasonId;
    if (!targetSeasonId && leagueId) {
      const { data: seasonData } = await supabase
        .from('seasons')
        .select('id')
        .eq('league_id', leagueId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      targetSeasonId = seasonData?.id || null;
    }

    if (!targetSeasonId) {
      return NextResponse.json({ fixtures: [], nextMatch: null });
    }

    const { data: fixtures, error: fixturesError } = await supabase
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
        referee_name,
        home:league_teams!home_team_id (name, id),
        away:league_teams!away_team_id (name, id)
      `)
      .eq('season_id', targetSeasonId)
      .or(`home_team_id.eq.${leagueTeamId},away_team_id.eq.${leagueTeamId}`)
      .order('tur', { ascending: true });

    if (fixturesError) {
      console.error('[GET /api/fixture] Fixtures error:', fixturesError.message);
      return NextResponse.json({ error: true, message: 'Fikstür yüklenirken hata oluştu.' }, { status: 500 });
    }

    // Sonraki maç (scheduled ve en yakın tarihli)
    const now = new Date().toISOString().split('T')[0];
    const nextMatch = (fixtures || [])
      .filter((f: Record<string, unknown>) => f.status === 'scheduled' && (f.match_date as string) >= now)
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (a.match_date as string).localeCompare(b.match_date as string))[0] || null;

    // Resolve team names for fixtures where join failed
    const unresolvedIds = new Set<string>();
    (fixtures || []).forEach((f: Record<string, unknown>) => {
      if (!(f.home as Record<string, string>)?.name && f.home_team_id) unresolvedIds.add(f.home_team_id as string);
      if (!(f.away as Record<string, string>)?.name && f.away_team_id) unresolvedIds.add(f.away_team_id as string);
    });

    let teamNameMap = new Map<string, string>();
    if (unresolvedIds.size > 0) {
      const { data: missingTeams } = await supabase
        .from('league_teams')
        .select('id, name')
        .in('id', Array.from(unresolvedIds));
      (missingTeams || []).forEach((t: Record<string, string>) => {
        teamNameMap.set(t.id, t.name);
      });
    }

    const cleanedFixtures = (fixtures || []).map((f: Record<string, unknown>) => ({
      id: f.id,
      tur: f.tur,
      match_date: f.match_date,
      match_time: f.match_time,
      status: f.status,
      home_score: f.home_score,
      away_score: f.away_score,
      home_team: (f.home as Record<string, string>)?.name || teamNameMap.get(f.home_team_id as string) || 'Bilinmiyor',
      away_team: (f.away as Record<string, string>)?.name || teamNameMap.get(f.away_team_id as string) || 'Bilinmiyor',
      home_team_id: f.home_team_id || (f.home as Record<string, string>)?.id || '',
      away_team_id: f.away_team_id || (f.away as Record<string, string>)?.id || '',
      is_home: f.home_team_id === leagueTeamId,
      referee_name: f.referee_name || null,
    }));

    const cleanedNextMatch = nextMatch ? {
      id: nextMatch.id,
      tur: nextMatch.tur,
      match_date: nextMatch.match_date,
      match_time: nextMatch.match_time,
      opponent: nextMatch.home_team_id === leagueTeamId
        ? ((nextMatch.away as Record<string, string>)?.name || 'Bilinmiyor')
        : ((nextMatch.home as Record<string, string>)?.name || 'Bilinmiyor'),
      is_home: nextMatch.home_team_id === leagueTeamId,
    } : null;

    return NextResponse.json({
      fixtures: cleanedFixtures,
      nextMatch: cleanedNextMatch,
    });
  } catch (err) {
    console.error('[fetchFixturesForTeam] Error:', err);
    return NextResponse.json({ fixtures: [], nextMatch: null });
  }
}
