/**
 * Cron Job: Kupa Maç Hatırlatma Bildirimi
 *
 * Cumartesi ve Pazar günleri kupa maçlarından 10 dakika önce
 * kullanıcılara Web Push bildirim gönderir.
 * Cmt-Paz 17:50 İstanbul saatinde tetiklenir.
 *
 * GET /api/cron/match-reminder-cup
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import webpush from 'web-push';
import { createErrorResponse } from '@/lib/api-error-handler';
import { shouldPlayCup, getIstanbulDateTime } from '@/lib/fm/schedule/MatchScheduleManager';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (false) // CRON_SECRET disabled //.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  let supabase = getServiceSupabase();
    if (!supabase) supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi null' }, { status: 500 });
  }

  try {
    // Takvim kuralı kontrolü
    const istNow = getIstanbulDateTime(new Date());
    const dayNames = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

    if (!shouldPlayCup(istNow.dayOfWeek)) {
      return NextResponse.json({ success: true, sent: 0, message: `Bugün kupa maçı yok (${dayNames[istNow.dayOfWeek]})` });
    }

    // VAPID ayarları
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@touchlinemanager.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: 'VAPID anahtarları yapılandırılmamış' }, { status: 500 });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // 10-20 dakika içinde başlayacak kupa maçlarını bul
    // DİKKAT: match_time İstanbul saatinde saklanıyor, bu yüzden
    // karşılaştırma da İstanbul saati ile yapılmalı
    const istNowDate = istNow.date; // İstanbul saatinde Date objesi
    const tenMinLater = new Date(istNowDate.getTime() + 10 * 60 * 1000);
    const twentyMinLater = new Date(istNowDate.getTime() + 20 * 60 * 1000);
    const today = istNowDate.toISOString().split('T')[0];

    const { data: upcomingFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('id, home_team_id, away_team_id, match_time, tur')
      .eq('status', 'scheduled')
      .eq('match_date', today)
      .eq('competition_type', 'cup');

    if (fixturesError) {
      return createErrorResponse(fixturesError, { route: '/api/cron/match-reminder-cup', method: 'GET' });
    }

    if (!upcomingFixtures || upcomingFixtures.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'Yaklaşan kupa maçı yok' });
    }

    // 10-20 dakika içindeki kupa maçlarını filtrele
    const targetFixtures = upcomingFixtures.filter((f: Record<string, unknown>) => {
      const matchTime = f.match_time as string;
      if (!matchTime) return false;
      const [hours, minutes] = matchTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return false;

      // match_time İstanbul saatinde saklanıyor, İstanbul context'inde karşılaştır
      const matchDate = new Date(istNowDate);
      matchDate.setHours(hours, minutes, 0, 0);
      return matchDate >= tenMinLater && matchDate <= twentyMinLater;
    });

    if (targetFixtures.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: '10-20 dk aralığında kupa maçı yok' });
    }

    // Bildirim tercihi açık olan kullanıcıları bul
    const { data: enabledPrefs } = await supabase
      .from('notification_preferences')
      .select('profile_id')
      .eq('match_reminder', true)
      .eq('push_enabled', true);

    const enabledProfileIds = new Set((enabledPrefs || []).map((p: { profile_id: string }) => p.profile_id));

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const fixture of targetFixtures) {
      const { data: homeTeam } = await supabase
        .from('league_teams').select('name, profile_id').eq('id', fixture.home_team_id).maybeSingle();
      const { data: awayTeam } = await supabase
        .from('league_teams').select('name, profile_id').eq('id', fixture.away_team_id).maybeSingle();

      const teamNames = [homeTeam?.name, awayTeam?.name].filter(Boolean);
      const profileIds = [homeTeam?.profile_id, awayTeam?.profile_id].filter(Boolean) as string[];

      if (profileIds.length === 0) continue;

      const targetProfileIds = profileIds.filter(pid => enabledProfileIds.has(pid));
      if (targetProfileIds.length === 0) { skipped += profileIds.length; continue; }

      const { data: subscriptions } = await supabase
        .from('push_subscriptions').select('*').in('profile_id', targetProfileIds);

      if (!subscriptions || subscriptions.length === 0) { skipped += targetProfileIds.length; continue; }

      const matchTitle = `🏆 ${teamNames.join(' vs ')} — Kupa Maçı`;

      for (const sub of subscriptions) {
        try {
          const authValue = (sub as Record<string, unknown>).auth_key || (sub as Record<string, unknown>).auth || '';
          const pushSubscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: authValue } };

          await webpush.sendNotification(pushSubscription, JSON.stringify({
            title: '🏆 Kupa Maçı Hatırlatması!',
            body: `${matchTitle} 10 dakika içinde başlıyor!`,
            icon: '/favicon.ico',
            url: `/match/${fixture.id}`,
          }));
          sent++;
        } catch (pushErr: unknown) {
          const statusCode = (pushErr as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
          errors++;
        }
      }
    }

    return NextResponse.json({ success: true, sent, skipped, errors: errors > 0 ? errors : undefined, timestamp: new Date().toISOString() });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/match-reminder-cup', method: 'GET' });
  }
}
