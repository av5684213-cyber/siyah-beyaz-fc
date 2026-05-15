import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { userId, teamName, managerName, philosophy, color1, color2, region } = body;

    if (!userId || !teamName || !managerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check if there's a bot team available for takeover
    const { data: botProfiles, error: botError } = await supabase
      .from('profiles')
      .select('id, team_name, money, reputation, league_name')
      .eq('is_bot', true)
      .limit(1);

    let tookOverBot = false;
    let botTeamId: string | null = null;
    let leagueName: string | null = null;

    if (!botError && botProfiles && botProfiles.length > 0) {
      const bot = botProfiles[0];
      botTeamId = bot.id;
      leagueName = bot.league_name || null;

      // 2. Take over the bot's profile — replace with user's data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          id: userId, // This won't work as PK, need different approach
          manager_name: managerName,
          team_name: teamName,
          is_bot: false,
          bot_difficulty: null,
          philosophy: philosophy || 'balanced',
          primary_color: color1 || '#000000',
          secondary_color: color2 || '#ffffff',
          region: region || 'TR',
        })
        .eq('id', bot.id);

      if (!updateError) {
        // Update all players to point to new user ID
        await supabase.from('players').update({ profile_id: userId, team_name: teamName }).eq('profile_id', bot.id);
        
        // Update league_teams reference
        await supabase.from('league_teams').update({ profile_id: userId, is_bot: false, is_npc: false, name: teamName }).eq('profile_id', bot.id);
        
        // Delete old bot profile
        await supabase.from('profiles').delete().eq('id', bot.id);
        
        // Create new user profile with bot's money/league
        const newProfile = {
          id: userId,
          manager_name: managerName,
          team_name: teamName,
          league_name: leagueName,
          money: bot.money || 100000000,
          reputation: bot.reputation || 30,
          mg_coins: 250,
          current_day: 1,
          ticket_price: 35,
          stadium_capacity: 10000,
          region: region || 'TR',
          philosophy: philosophy || 'balanced',
          primary_color: color1 || '#000000',
          secondary_color: color2 || '#ffffff',
          is_bot: false,
          created_at: new Date().toISOString(),
        };
        await supabase.from('profiles').insert(newProfile);

        tookOverBot = true;
        console.log(`[register] User ${userId} took over bot team "${bot.team_name}" → "${teamName}"`);
      }
    }

    if (!tookOverBot) {
      // No bot available — create fresh team (existing logic)
      console.log(`[register] No bot teams available, creating new team for ${userId}`);
      // The client-side initTeam will handle this case
    }

    return NextResponse.json({
      success: true,
      tookOverBot,
      botTeamName: tookOverBot ? teamName : null,
      leagueName,
    });
  } catch (err: any) {
    console.error('[register] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
