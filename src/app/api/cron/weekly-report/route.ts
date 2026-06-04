import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: profiles } = await supabase.from('profiles').select('id');
    if (!profiles) return NextResponse.json({ message: 'No profiles' });

    let reportsCreated = 0;
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    for (const profile of profiles) {
      try {
        // Get user's fixtures from past week
        const { data: teamData } = await supabase
          .from('league_teams')
          .select('id')
          .eq('profile_id', profile.id)
          .limit(1);

        if (!teamData || teamData.length === 0) continue;
        const teamId = teamData[0].id;

        const { data: fixtures } = await supabase
          .from('fixtures')
          .select('*')
          .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
          .eq('status', 'completed')
          .gte('match_date', oneWeekAgo);

        if (!fixtures) continue;

        const wins = fixtures.filter((f: any) => {
          const isHome = f.home_team_id === teamId;
          return isHome ? f.home_score > f.away_score : f.away_score > f.home_score;
        }).length;
        const draws = fixtures.filter((f: any) => f.home_score === f.away_score).length;
        const losses = fixtures.length - wins - draws;

        // Best player of the week
        const { data: bestPlayer } = await supabase
          .from('players')
          .select('id, name')
          .eq('profile_id', profile.id)
          .order('form_rating', { ascending: false })
          .limit(1)
          .maybeSingle();

        // League position
        const { data: leagueData } = await supabase
          .from('league_teams')
          .select('league_id')
          .eq('id', teamId)
          .maybeSingle();

        let leaguePosition: number | null = null;
        if (leagueData) {
          const { data: standings } = await supabase
            .from('league_teams')
            .select('id, points')
            .eq('league_id', leagueData.league_id)
            .order('points', { ascending: false });
          if (standings) {
            leaguePosition = standings.findIndex((s: any) => s.id === teamId) + 1;
          }
        }

        // Next opponent
        const { data: nextMatch } = await supabase
          .from('fixtures')
          .select('home_team_id, away_team_id')
          .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
          .eq('status', 'scheduled')
          .order('match_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        let nextOpponent = null;
        if (nextMatch) {
          const oppTeamId = nextMatch.home_team_id === teamId ? nextMatch.away_team_id : nextMatch.home_team_id;
          const { data: oppTeam } = await supabase
            .from('league_teams')
            .select('name')
            .eq('id', oppTeamId)
            .maybeSingle();
          nextOpponent = oppTeam?.name || 'Bilinmiyor';
        }

        // Financial
        const weeklyIncome = wins * 50000 + draws * 15000;

        // Get current season
        const { data: seasonData } = await supabase
          .from('seasons')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Save report
        const { error } = await supabase.from('weekly_reports').upsert({
          user_id: profile.id,
          season_id: seasonData?.id || 'unknown',
          week_number: Math.ceil((new Date().getDate()) / 7),
          wins,
          draws,
          losses,
          best_player_id: bestPlayer?.id,
          best_player_name: bestPlayer?.name,
          weekly_income: weeklyIncome,
          league_position: leaguePosition,
          next_opponent: nextOpponent,
        }, { onConflict: 'user_id,season_id,week_number' });

        if (!error) {
          reportsCreated++;
          // Send notification
          await supabase.from('notifications').insert({
            user_id: profile.id,
            type: 'weekly_report',
            title: '📊 Haftalık Rapor Hazır',
            body: `${wins}G ${draws}B ${losses}M — Raporunuzu inceleyin!`,
          });
        }
      } catch (err) {
        console.error(`Weekly report error for ${profile.id}:`, err);
      }
    }

    return NextResponse.json({ success: true, reportsCreated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
