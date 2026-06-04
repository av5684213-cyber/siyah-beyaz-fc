import { NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = getAuthenticatedUserId(request, searchParams.get('userId'));

  if (!userId) {
    return NextResponse.json({ error: 'userId parametresi gerekli.' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış.', squad: null, opponent: null, fixture: null });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client null.', squad: null, opponent: null, fixture: null });
  }

  try {
    // 1. Find user's league_team by profile_id
    const { data: teamData } = await supabase
      .from('league_teams')
      .select('id, name, league_id')
      .eq('profile_id', userId)
      .maybeSingle();

    let leagueTeamId = teamData?.id;
    let teamName = teamData?.name;
    let leagueId = teamData?.league_id;

    // Fallback: find by profile team_name
    if (!leagueTeamId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, team_name')
        .eq('id', userId)
        .maybeSingle();

      if (!profile?.team_name) {
        return NextResponse.json({ error: 'Takım bulunamadı.', squad: null, opponent: null, fixture: null });
      }

      const { data: altTeam } = await supabase
        .from('league_teams')
        .select('id, name, league_id')
        .eq('name', profile.team_name)
        .maybeSingle();

      if (!altTeam) {
        return NextResponse.json({ error: 'Lig takımı bulunamadı.', squad: null, opponent: null, fixture: null });
      }

      leagueTeamId = altTeam.id;
      teamName = altTeam.name;
      leagueId = altTeam.league_id;
    }

    // 2. Find current season
    if (!leagueId) {
      return NextResponse.json({ error: 'Lig bulunamadı.', squad: null, opponent: null, fixture: null });
    }

    const { data: seasonData } = await supabase
      .from('seasons')
      .select('id')
      .eq('league_id', leagueId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!seasonData) {
      return NextResponse.json({ error: 'Sezon bulunamadı.', squad: null, opponent: null, fixture: null });
    }

    // 3. Find next scheduled fixture
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select(`
        id,
        tur,
        match_date,
        match_time,
        status,
        home_team_id,
        away_team_id,
        home:league_teams!home_team_id (name, id),
        away:league_teams!away_team_id (name, id)
      `)
      .eq('season_id', seasonData.id)
      .eq('status', 'scheduled')
      .or(`home_team_id.eq.${leagueTeamId},away_team_id.eq.${leagueTeamId}`)
      .order('match_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fixturesError) {
      console.error('[next-opponent-squad] Fixtures error:', fixturesError.message);
      return NextResponse.json({ error: 'Fikstür yüklenirken hata oluştu.', squad: null, opponent: null, fixture: null });
    }

    if (!fixtures) {
      return NextResponse.json({ error: 'Planlanmış maç bulunamadı.', squad: null, opponent: null, fixture: null });
    }

    // 4. Determine opponent
    const isHome = fixtures.home_team_id === leagueTeamId;
    const opponentTeamId = isHome ? fixtures.away_team_id : fixtures.home_team_id;
    const opponentTeamName = isHome
      ? ((fixtures.away as Record<string, string>)?.name || 'Bilinmiyor')
      : ((fixtures.home as Record<string, string>)?.name || 'Bilinmiyor');

    // 5. Fetch opponent's players
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, name, position, specific_position, rating, klt, age, pas, sut, tk, hiz, guc, alg, top, kfa, klc, form, cond, morale, nation')
      .eq('team_name', opponentTeamName)
      .order('rating', { ascending: false });

    if (playersError) {
      console.error('[next-opponent-squad] Players error:', playersError.message);
      return NextResponse.json({ error: 'Rakip oyuncular yüklenirken hata oluştu.', squad: null, opponent: null, fixture: null });
    }

    // 6. Build formation info - sort by position group then rating
    const positionOrder: Record<string, number> = {
      'GK': 0,
      'CB': 1, 'LB': 2, 'RB': 3, 'LWB': 4, 'RWB': 5,
      'CDM': 6, 'CM': 7, 'CAM': 8, 'LM': 9, 'RM': 10,
      'LW': 11, 'RW': 12,
      'CF': 13, 'ST': 14,
      'DEF': 1, 'MID': 7, 'FWD': 14,
    };

    const sortedPlayers = (players || []).sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const posA = (a.specific_position as string) || (a.position as string) || 'MID';
      const posB = (b.specific_position as string) || (b.position as string) || 'MID';
      const orderA = positionOrder[posA] ?? 7;
      const orderB = positionOrder[posB] ?? 7;
      if (orderA !== orderB) return orderA - orderB;
      return ((b.rating as number) || 0) - ((a.rating as number) || 0);
    });

    // Take top 11 as starting
    const starting = sortedPlayers.slice(0, 11);
    const subs = sortedPlayers.slice(11, 18);

    const fixtureInfo = {
      id: fixtures.id,
      tur: fixtures.tur,
      match_date: fixtures.match_date,
      match_time: fixtures.match_time,
      opponent: opponentTeamName,
      is_home: isHome,
    };

    return NextResponse.json({
      squad: {
        starting: starting.map((p: Record<string, unknown>) => ({
          id: p.id,
          name: p.name,
          position: p.position,
          specific_position: p.specific_position || p.position,
          rating: p.rating ?? p.klt ?? 60,
          age: p.age,
          nation: p.nation,
          form: p.form ?? 70,
        })),
        subs: subs.map((p: Record<string, unknown>) => ({
          id: p.id,
          name: p.name,
          position: p.position,
          specific_position: p.specific_position || p.position,
          rating: p.rating ?? p.klt ?? 60,
          age: p.age,
          nation: p.nation,
          form: p.form ?? 70,
        })),
      },
      opponent: opponentTeamName,
      fixture: fixtureInfo,
    });
  } catch (error: any) {
    return createErrorResponse(error, { route: '/api/next-opponent-squad', method: 'GET' });
  }
}
