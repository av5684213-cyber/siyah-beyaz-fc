/**
 * API Route: /api/notifications/preferences
 *
 * GET  — Kullanıcının bildirim tercihlerini oku
 * POST — Kullanıcının bildirim tercihlerini kaydet
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const profileId = getAuthenticatedUserId(request, searchParams.get('profileId'));

    if (!profileId) {
      return NextResponse.json({ error: 'profileId zorunlu' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      console.error('[preferences] Okuma hatası:', error.message);
      return NextResponse.json({ error: 'Tercihler okunamadı' }, { status: 500 });
    }

    // Kayıt yoksa varsayılanları döndür
    if (!data) {
      return NextResponse.json({
        preferences: {
          match_reminder: true,
          transfer_offer: true,
          training_report: true,
          push_enabled: false,
          goal_alert: true,
          match_result: true,
          daily_task_reminder: true,
          weekly_report: true,
          injury_update: true,
          youth_academy: true,
        },
      });
    }

    return NextResponse.json({
      preferences: {
        match_reminder: data.match_reminder ?? true,
        transfer_offer: data.transfer_offer ?? true,
        training_report: data.training_report ?? true,
        push_enabled: data.push_enabled ?? false,
        goal_alert: data.goal_alert ?? true,
        match_result: data.match_result ?? true,
        daily_task_reminder: data.daily_task_reminder ?? true,
        weekly_report: data.weekly_report ?? true,
        injury_update: data.injury_update ?? true,
        youth_academy: data.youth_academy ?? true,
      },
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/notifications/preferences', method: 'GET' });
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { profileId: bodyProfileId, preferences } = body;
    const profileId = getAuthenticatedUserId(request, bodyProfileId);

    if (!profileId) {
      return NextResponse.json({ error: 'profileId zorunlu' }, { status: 400 });
    }

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json({ error: 'preferences objesi zorunlu' }, { status: 400 });
    }

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        profile_id: profileId,
        match_reminder: preferences.match_reminder ?? true,
        transfer_offer: preferences.transfer_offer ?? true,
        training_report: preferences.training_report ?? true,
        push_enabled: preferences.push_enabled ?? false,
        goal_alert: preferences.goal_alert ?? true,
        match_result: preferences.match_result ?? true,
        daily_task_reminder: preferences.daily_task_reminder ?? true,
        weekly_report: preferences.weekly_report ?? true,
        injury_update: preferences.injury_update ?? true,
        youth_academy: preferences.youth_academy ?? true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' });

    if (error) {
      console.error('[preferences] Kaydetme hatası:', error.message);
      return NextResponse.json({ error: 'Tercihler kaydedilemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Bildirim tercihleri kaydedildi' });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/notifications/preferences', method: 'POST' });
  }
}
