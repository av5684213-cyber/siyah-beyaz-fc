import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { sanitizeInput, isValidUserId, sanitizeError, checkRateLimit } from '@/lib/fm/security';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  // Rate limiting: 3 registrations per 5 minutes
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateCheck = checkRateLimit(`register:${clientIp}`, 3, 300000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'Çok fazla kayıt denemesi. Lütfen bekleyin.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { userId, teamName, managerName, philosophy, color1, color2, region } = body;

    // Input validation
    if (!userId || !teamName || !managerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate userId format
    if (!isValidUserId(userId)) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID formatı' }, { status: 400 });
    }

    // Sanitize text inputs
    const safeTeamName = sanitizeInput(teamName, 50);
    const safeManagerName = sanitizeInput(managerName, 50);
    const safePhilosophy = sanitizeInput(philosophy || 'balanced', 20);
    const safeColor1 = sanitizeInput(color1 || '#000000', 7);
    const safeColor2 = sanitizeInput(color2 || '#ffffff', 7);
    const safeRegion = sanitizeInput(region || 'TR', 5);

    // 1. Check if there's a bot team available for takeover
    const { data: botProfiles, error: botError } = await supabase
      .from('profiles')
      .select('id, team_name, money, reputation, league_name')
      .eq('is_bot', true)
      .limit(1);

    let tookOverBot = false;
    let leagueName: string | null = null;

    if (!botError && botProfiles && botProfiles.length > 0) {
      const bot = botProfiles[0];
      leagueName = bot.league_name || null;

      // 2. Take over the bot's profile — replace with user's data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          manager_name: safeManagerName,
          team_name: safeTeamName,
          is_bot: false,
          bot_difficulty: null,
          philosophy: safePhilosophy,
          primary_color: safeColor1,
          secondary_color: safeColor2,
          region: safeRegion,
        })
        .eq('id', bot.id);

      if (!updateError) {
        // Update all players to point to new user ID
        await supabase.from('players').update({ profile_id: userId, team_name: safeTeamName }).eq('profile_id', bot.id);
        
        // Update league_teams reference
        await supabase.from('league_teams').update({ profile_id: userId, is_bot: false, is_npc: false, name: safeTeamName }).eq('profile_id', bot.id);
        
        // Delete old bot profile
        await supabase.from('profiles').delete().eq('id', bot.id);
        
        // Create new user profile with bot's money/league
        const newProfile = {
          id: userId,
          manager_name: safeManagerName,
          team_name: safeTeamName,
          league_name: leagueName,
          money: bot.money || 100000000,
          reputation: bot.reputation || 30,
          credits: 250,
          current_day: 1,
          ticket_price: 35,
          stadium_capacity: 10000,
          region: safeRegion,
          philosophy: safePhilosophy,
          primary_color: safeColor1,
          secondary_color: safeColor2,
          is_bot: false,
          created_at: new Date().toISOString(),
        };
        await supabase.from('profiles').insert(newProfile);

        tookOverBot = true;
        console.log(`[register] User took over bot team → "${safeTeamName}"`);
      }
    }

    if (!tookOverBot) {
      console.log(`[register] No bot teams available, creating new team`);
    }

    return NextResponse.json({
      success: true,
      tookOverBot,
      botTeamName: tookOverBot ? safeTeamName : null,
      leagueName,
    });
  } catch (err: any) {
    console.error('[register] Error:', err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
