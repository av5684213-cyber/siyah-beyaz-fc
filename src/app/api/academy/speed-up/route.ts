import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { sanitizeError, verifyProfileExists } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

interface SpeedUpRequest {
  profileId: string;
}

/**
 * POST: Aktif yükseltmeyi hızlandır
 * - Kalan süreyi hesapla
 * - instant_half_credits_cost kadar kredi varsa kalan süreyi yarıya indir
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
    const body: SpeedUpRequest = await request.json();
    const { profileId: bodyProfileId } = body;
    const profileId = getAuthenticatedUserId(request, bodyProfileId);

    if (!profileId) {
      return NextResponse.json({ error: 'Geçersiz profil ID' }, { status: 400 });
    }

    // Verify profile exists
    const { valid, profile, error: profileError, status: profileStatus } = await verifyProfileExists(supabase, profileId);
    if (!valid) {
      return NextResponse.json({ error: profileError || 'Profil bulunamadı' }, { status: profileStatus || 404 });
    }

    // Akademi kaydını getir
    const { data: academy, error: academyError } = await supabase
      .from('user_academy')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (academyError || !academy) {
      return NextResponse.json({ error: 'Akademi kaydı bulunamadı' }, { status: 404 });
    }

    // Aktif yükseltme var mı?
    if (!academy.upgrade_end_at || new Date(academy.upgrade_end_at) <= new Date()) {
      return NextResponse.json({ error: 'Aktif yükseltme yok' }, { status: 400 });
    }

    // Hızlandırma zaten kullanıldı mı?
    if (academy.speed_up_used) {
      return NextResponse.json({ error: 'Hızlandırma zaten kullanıldı' }, { status: 400 });
    }

    const targetLevel = academy.current_level + 1;

    // Hızlandırma maliyetini getir
    const { data: costData, error: costError } = await supabase
      .from('academy_upgrade_costs')
      .select('instant_half_credits_cost')
      .eq('level', targetLevel)
      .maybeSingle();

    if (costError || !costData) {
      return NextResponse.json({ error: 'Hızlandırma maliyeti bulunamadı' }, { status: 500 });
    }

    const speedUpCost = costData.instant_half_credits_cost as number;

    // Kredi kontrolü
    if ((profile.credits || 0) < speedUpCost) {
      return NextResponse.json({
        error: `Yetersiz Kredi. Hızlandırma için ${speedUpCost} Kredi gerekli`,
        required: speedUpCost,
        current: profile.credits || 0,
      }, { status: 400 });
    }

    // Yeni bitiş tarihini hesapla (kalan sürenin yarısı)
    const now = new Date();
    const currentEnd = new Date(academy.upgrade_end_at);
    const remainingMs = currentEnd.getTime() - now.getTime();
    const newEnd = new Date(now.getTime() + Math.ceil(remainingMs / 2));

    // Akademi kaydını güncelle
    const { error: updateAcademyError } = await supabase
      .from('user_academy')
      .update({
        upgrade_end_at: newEnd.toISOString(),
        speed_up_used: true,
        updated_at: now.toISOString(),
      })
      .eq('profile_id', profileId);

    if (updateAcademyError) {
      console.error('[academy/speed-up] Update error:', updateAcademyError);
      return NextResponse.json({ error: 'Hızlandırma uygulanamadı' }, { status: 500 });
    }

    // Krediyi düş
    const { error: updateCreditsError } = await supabase
      .from('profiles')
      .update({ credits: (profile.credits || 0) - speedUpCost })
      .eq('id', profileId);

    if (updateCreditsError) {
      console.error('[academy/speed-up] Credits update error:', updateCreditsError);
      return NextResponse.json({ error: 'Kredi düşülemedi' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Yükseltme hızlandırıldı! Kalan süre yarıya indirildi.',
      newUpgradeEndAt: newEnd.toISOString(),
      creditsSpent: speedUpCost,
      remainingCredits: (profile.credits || 0) - speedUpCost,
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/academy/speed-up', method: 'POST' });
  }
}
