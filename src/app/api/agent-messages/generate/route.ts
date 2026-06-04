import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateAgentMessages } from '@/lib/fm/agentMessageEngine';
import type { Profile, Player } from '@/lib/fm/types';

// ── POST: Generate agent messages for a profile (cron or manual trigger) ──
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not available' }, { status: 500 });

  try {
    const body = await request.json();
    const { profileId } = body as { profileId: string };

    if (!profileId) {
      return NextResponse.json({ error: 'profileId required' }, { status: 400 });
    }

    // 1. Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, team_name, league_name, league_position, current_day')
      .eq('id', profileId)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 2. Get squad
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('profile_id', profileId);

    if (!players || players.length === 0) {
      return NextResponse.json({ generated: 0 });
    }

    // 3. Get league position from standings if not on profile
    let leaguePosition = profile.league_position || 10;
    if (!leaguePosition) {
      const { data: team } = await supabase
        .from('league_teams')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (team) {
        const { data: standing } = await supabase
          .from('league_standings')
          .select('position')
          .eq('team_id', team.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (standing) leaguePosition = standing.position;
      }
    }

    // 4. Get existing unread messages to avoid duplicates
    const { data: existingMessages } = await supabase
      .from('agent_messages')
      .select('player_id, message_type')
      .eq('profile_id', profileId)
      .is('player_response', null);

    const existingKeys = new Set(
      (existingMessages || []).map((m: any) => `${m.player_id}-${m.message_type}`)
    );

    // 5. Generate messages
    const messages = generateAgentMessages({
      profile: profile as Profile,
      squad: players as Player[],
      leaguePosition,
      currentWeek: profile.current_day || 1,
      totalTeamsInLeague: 18,
    });

    // 6. Filter out duplicates
    const newMessages = messages.filter(
      m => !existingKeys.has(`${m.player_id}-${m.message_type}`)
    );

    // 7. Insert new messages
    let inserted = 0;
    for (const msg of newMessages) {
      const { error } = await supabase
        .from('agent_messages')
        .insert({
          profile_id: profileId,
          player_id: msg.player_id,
          message_type: msg.message_type,
          message_text: msg.message_text,
          is_read: false,
        });

      if (!error) inserted++;
      else console.error('[agent-messages/generate] Insert error:', error.message);
    }

    return NextResponse.json({ generated: inserted, total: newMessages.length });

  } catch (err) {
    console.error('[agent-messages/generate] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
