import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { sanitizeError, isValidUserId } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';

/**
 * GET: Kullanıcının akademi durumunu getir
 * - Mevcut seviye, yükseltme durumu, kalan süre
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'No Supabase client' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId || !isValidUserId(profileId)) {
      return NextResponse.json({ error: 'Geçersiz profil ID' }, { status: 400 });
    }

    // Akademi kaydını getir
    const { data: academy, error: academyError } = await supabase
      .from('user_academy')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    // Kayıt yoksa profiles'tan oluştur
    if (academyError && academyError.code === 'PGRST116') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('academy_level')
        .eq('id', profileId)
        .single();

      const level = profile?.academy_level || 1;

      const { data: newAcademy, error: insertError } = await supabase
        .from('user_academy')
        .insert({
          profile_id: profileId,
          current_level: level,
        })
        .select()
        .single();

      if (insertError) {
        console.error('[academy/status] Insert error:', insertError);
        return NextResponse.json({ error: 'Akademi kaydı oluşturulamadı' }, { status: 500 });
      }

      return NextResponse.json({
        currentLevel: newAcademy.current_level,
        isUpgrading: false,
        upgradeStartedAt: null,
        upgradeEndAt: null,
        speedUpUsed: false,
        remainingMs: 0,
        nextLevelCost: null,
      });
    }

    if (academyError) {
      console.error('[academy/status] Fetch error:', academyError);
      return NextResponse.json({ error: 'Akademi verisi alınamadı' }, { status: 500 });
    }

    // Yükseltme durumunu hesapla
    const isUpgrading = academy.upgrade_end_at
      ? new Date(academy.upgrade_end_at) > new Date()
      : false;

    let remainingMs = 0;
    if (isUpgrading && academy.upgrade_end_at) {
      remainingMs = new Date(academy.upgrade_end_at).getTime() - Date.now();
    }

    // Sonraki seviye maliyeti
    const targetLevel = academy.current_level + 1;
    let nextLevelCost = null;
    if (targetLevel <= 10) {
      const { data: costData } = await supabase
        .from('academy_upgrade_costs')
        .select('*')
        .eq('level', targetLevel)
        .single();
      nextLevelCost = costData;
    }

    return NextResponse.json({
      currentLevel: academy.current_level,
      isUpgrading,
      upgradeStartedAt: academy.upgrade_started_at,
      upgradeEndAt: academy.upgrade_end_at,
      speedUpUsed: academy.speed_up_used,
      remainingMs: Math.max(0, remainingMs),
      nextLevelCost,
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/academy/status', method: 'GET' });
  }
}
