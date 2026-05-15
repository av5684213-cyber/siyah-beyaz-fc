import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { sanitizeError, isValidUserId } from '@/lib/fm/security';

interface SendNotificationRequest {
  profileId?: string;
  leagueName?: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  type?: string;
}

/**
 * POST: Push bildirim gönder
 * - Belirli bir kullanıcıya veya tüm kullanıcılara
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  try {
    const body: SendNotificationRequest = await request.json();
    const { profileId, leagueName, title, body: messageBody, url, tag, type } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ error: 'Başlık ve mesaj gerekli' }, { status: 400 });
    }

    // notifications tablosuna kaydet
    const notification = {
      title,
      body: messageBody,
      url: url || '/',
      tag: tag || 'general',
      type: type || 'general',
      is_read: false,
      created_at: new Date().toISOString(),
    };

    if (profileId && isValidUserId(profileId)) {
      // Belirli bir kullanıcıya
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({ ...notification, profile_id: profileId });

      if (insertError) {
        console.error('[notifications/send] Insert error:', insertError);
        return NextResponse.json({ error: 'Bildirim kaydedilemedi' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        sent: 1,
        target: 'user',
        profileId,
      });
    }

    if (leagueName) {
      // Ligdeki tüm kullanıcılara
      const { data: teams } = await supabase
        .from('league_teams')
        .select('profile_id')
        .eq('league_name', leagueName);

      if (teams && teams.length > 0) {
        const notifications = teams
          .filter((t: Record<string, unknown>) => t.profile_id)
          .map((t: Record<string, unknown>) => ({
            ...notification,
            profile_id: t.profile_id,
          }));

        const { error: bulkError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (bulkError) {
          console.error('[notifications/send] Bulk insert error:', bulkError);
          return NextResponse.json({ error: 'Toplu bildirim kaydedilemedi' }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          sent: notifications.length,
          target: 'league',
          leagueName,
        });
      }
    }

    return NextResponse.json({ error: 'Hedef belirtilmedi (profileId veya leagueName)' }, { status: 400 });
  } catch (err) {
    console.error('[notifications/send] Fatal error:', err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
