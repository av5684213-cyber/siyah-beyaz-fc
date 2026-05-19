/**
 * GET /api/cron/match-reminder
 * Maç başlamadan 10 dk önce hatırlatma bildirimi gönder
 *
 * Her 5 dakikada bir çalışır, 10 dakika içinde başlayacak maçları bulur
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const reminderTime = tenMinutesLater.toTimeString().slice(0, 5);

    // Bugün oynanacak ve 10 dk içinde başlayacak maçları bul
    const { data: upcomingMatches, error: matchError } = await supabase
      .from('fixtures')
      .select(`
        id,
        match_date,
        match_time,
        home_team_id,
        away_team_id,
        status,
        home:league_teams!home_team_id(name, profile_id),
        away:league_teams!away_team_id(name, profile_id)
      `)
      .eq('match_date', today)
      .eq('status', 'scheduled')
      .gte('match_time', currentTime)
      .lte('match_time', reminderTime);

    if (matchError || !upcomingMatches || upcomingMatches.length === 0) {
      return NextResponse.json({ message: 'Hatırlatma gerektiren maç yok', sent: 0 });
    }

    let sent = 0;
    const notifications: string[] = [];

    for (const match of upcomingMatches) {
      const homeTeam = match.home as any;
      const awayTeam = match.away as any;
      const homeProfileId = homeTeam?.profile_id;
      const awayProfileId = awayTeam?.profile_id;
      const homeName = homeTeam?.name || 'Bilinmiyor';
      const awayName = awayTeam?.name || 'Bilinmiyor';
      const matchTime = match.match_time || '00:00';

      // Ev sahibi takımın yöneticisine bildirim
      if (homeProfileId) {
        try {
          const { data: stadiumData } = await supabase
            .from('league_teams')
            .select('stadium_name')
            .eq('id', match.home_team_id)
            .maybeSingle();

          const { sendMatchReminder } = await import('@/lib/push/notifications');
          const n = await sendMatchReminder(homeProfileId, {
            opponent: awayName,
            isHome: true,
            matchTime,
            stadium: stadiumData?.stadium_name || 'Stadyum',
          });

          if (n > 0) {
            sent += n;
            notifications.push(`EV: ${homeName} vs ${awayName} → ${homeProfileId}`);
          }
        } catch { /* push not available */ }
      }

      // Deplasman takımının yöneticisine bildirim
      if (awayProfileId) {
        try {
          const { sendMatchReminder } = await import('@/lib/push/notifications');
          const n = await sendMatchReminder(awayProfileId, {
            opponent: homeName,
            isHome: false,
            matchTime,
            stadium: 'Deplasman',
          });

          if (n > 0) {
            sent += n;
            notifications.push(`DEP: ${awayName} vs ${homeName} → ${awayProfileId}`);
          }
        } catch { /* push not available */ }
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      matchCount: upcomingMatches.length,
      notifications,
    });
  } catch (err) {
    console.error('[match-reminder] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
