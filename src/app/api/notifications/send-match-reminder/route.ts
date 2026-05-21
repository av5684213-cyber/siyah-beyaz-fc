/**
 * Cron Job: Maç Hatırlatma Bildirimi
 *
 * Maç başlamadan 10 dakika önce o maçta oynayan takımlara ait
 * kullanıcılara Web Push bildirim gönderir.
 *
 * GET /api/notifications/send-match-reminder
 * Header: x-cron-secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyCronSecret, sanitizeError } from '@/lib/fm/security';
import webpush from 'web-push';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const cronCheck = verifyCronSecret(request);
  if (!cronCheck.valid) {
    return NextResponse.json({ error: cronCheck.error }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is null' }, { status: 500 });
  }

  try {
    // VAPID ayarları
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@siyahbeyazfc.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({
        error: 'VAPID keys not configured. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT in .env',
      }, { status: 500 });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // 1. Önümüzdeki 10-20 dakika içinde başlayacak maçları bul
    const now = new Date();
    const tenMinLater = new Date(now.getTime() + 10 * 60 * 1000);
    const twentyMinLater = new Date(now.getTime() + 20 * 60 * 1000);

    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    // Bugünün scheduled maçlarını çek
    const { data: upcomingFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id, match_time, tur')
      .eq('status', 'scheduled')
      .eq('match_date', today);

    if (fixturesError) {
      console.error('[send-match-reminder] Fixtures error:', fixturesError.message);
      return NextResponse.json({ error: fixturesError.message }, { status: 500 });
    }

    if (!upcomingFixtures || upcomingFixtures.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No upcoming matches' });
    }

    // 10-20 dakika içindeki maçları filtrele
    const targetFixtures = upcomingFixtures.filter((f: Record<string, unknown>) => {
      const matchTime = f.match_time as string;
      if (!matchTime) return false;
      const [hours, minutes] = matchTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return false;
      
      const matchDate = new Date(now);
      matchDate.setHours(hours, minutes, 0, 0);
      
      return matchDate >= tenMinLater && matchDate <= twentyMinLater;
    });

    if (targetFixtures.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No matches in the 10-20 min window' });
    }

    // 2. Her maç için ilgili takımların kullanıcılarına bildirim gönder
    let sent = 0;
    let errors = 0;

    for (const fixture of targetFixtures) {
      // Ev sahibi ve deplasman takım bilgilerini al
      const { data: homeTeam } = await supabase
        .from('league_teams')
        .select('name, profile_id')
        .eq('id', fixture.home_team_id)
        .maybeSingle();

      const { data: awayTeam } = await supabase
        .from('league_teams')
        .select('name, profile_id')
        .eq('id', fixture.away_team_id)
        .maybeSingle();

      const teamNames = [homeTeam?.name, awayTeam?.name].filter(Boolean);
      const profileIds = [homeTeam?.profile_id, awayTeam?.profile_id].filter(Boolean) as string[];

      if (profileIds.length === 0) continue;

      // Bu kullanıcılara ait push aboneliklerini çek
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .in('profile_id', profileIds);

      if (!subscriptions || subscriptions.length === 0) continue;

      const matchTitle = `${teamNames.join(' vs ')} - ${fixture.tur}. Hafta`;

      for (const sub of subscriptions) {
        try {
          // auth_key sütununu kullan (master migration şemasına uygun)
          const authValue = (sub as Record<string, unknown>).auth_key || (sub as Record<string, unknown>).auth || '';
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: authValue,
            },
          };

          await webpush.sendNotification(pushSubscription, JSON.stringify({
            title: '⚽ Maç Hatırlatması!',
            body: `${matchTitle} 10 dakika içinde başlıyor!`,
            icon: '/favicon.ico',
            url: `/match/${fixture.id}`,
          }));

          sent++;
        } catch (pushErr: unknown) {
          // Abonelik geçersizse sil
          const statusCode = (pushErr as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          }
          errors++;
          console.error('[send-match-reminder] Push error:', pushErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      errors: errors > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[send-match-reminder] Fatal error:', err);
    return NextResponse.json(
      { error: sanitizeError(err) },
      { status: 500 }
    );
  }
}
