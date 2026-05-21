/**
 * API Route: /api/notifications/preferences
 *
 * GET  — Kullanıcının bildirim tercihlerini oku
 * POST — Kullanıcının bildirim tercihlerini kaydet
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

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
    const profileId = searchParams.get('profileId');

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
        },
      });
    }

    return NextResponse.json({
      preferences: {
        match_reminder: data.match_reminder ?? true,
        transfer_offer: data.transfer_offer ?? true,
        training_report: data.training_report ?? true,
        push_enabled: data.push_enabled ?? false,
      },
    });
  } catch (err) {
    console.error('[preferences] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
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
    const { profileId, preferences } = body;

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
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' });

    if (error) {
      console.error('[preferences] Kaydetme hatası:', error.message);
      return NextResponse.json({ error: 'Tercihler kaydedilemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Bildirim tercihleri kaydedildi' });
  } catch (err) {
    console.error('[preferences] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
