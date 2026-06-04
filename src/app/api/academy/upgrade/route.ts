import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { sanitizeError, verifyProfileExists } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

interface UpgradeRequest {
  profileId: string;
}

/**
 * POST: Akademi yükseltme başlat
 * - Kullanıcının yeterli kredisi var mı kontrol et
 * - Aktif yükseltme yoksa süreyi ayarla ve krediyi düş
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
    const body: UpgradeRequest = await request.json();
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

    // Fetch academy_level (not returned by verifyProfileExists)
    const { data: profileExtra } = await supabase
      .from('profiles')
      .select('academy_level')
      .eq('id', profileId)
      .single();

    const academyLevel = profileExtra?.academy_level || 1;

    // user_academy kaydını getir veya oluştur
    let { data: academy, error: academyError } = await supabase
      .from('user_academy')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (academyError && academyError.code === 'PGRST116') {
      // Kayıt yoksa oluştur
      const { data: newAcademy, error: insertError } = await supabase
        .from('user_academy')
        .insert({
          profile_id: profileId,
          current_level: academyLevel,
        })
        .select()
        .single();

      if (insertError) {
        console.error('[academy/upgrade] Insert error:', insertError);
        return NextResponse.json({ error: 'Akademi kaydı oluşturulamadı' }, { status: 500 });
      }
      academy = newAcademy;
    } else if (academyError) {
      console.error('[academy/upgrade] Fetch error:', academyError);
      return NextResponse.json({ error: 'Akademi verisi alınamadı' }, { status: 500 });
    }

    // Aktif yükseltme var mı kontrol et
    if (academy.upgrade_end_at && new Date(academy.upgrade_end_at) > new Date()) {
      return NextResponse.json({
        error: 'Zaten devam eden bir yükseltme var',
        upgradeEndAt: academy.upgrade_end_at,
      }, { status: 409 });
    }

    const currentLevel = academy.current_level;
    const targetLevel = currentLevel + 1;

    // Maksimum seviye kontrolü
    if (targetLevel > 10) {
      return NextResponse.json({ error: 'Maksimum akademi seviyesine ulaşıldı' }, { status: 400 });
    }

    // academy_upgrade_costs tablosundan maliyeti getir
    const { data: costData, error: costError } = await supabase
      .from('academy_upgrade_costs')
      .select('*')
      .eq('level', targetLevel)
      .single();

    if (costError || !costData) {
      console.error('[academy/upgrade] Cost fetch error:', costError);
      return NextResponse.json({ error: 'Yükseltme maliyeti bulunamadı' }, { status: 500 });
    }

    const creditsCost = costData.credits_cost as number;
    const upgradeDays = costData.upgrade_days as number;

    // Kredi kontrolü
    if (creditsCost > 0 && (profile.credits || 0) < creditsCost) {
      return NextResponse.json({
        error: `Yetersiz Kredi. Gerekli: ${creditsCost}, Mevcut: ${profile.credits || 0}`,
      }, { status: 400 });
    }

    // Yükseltmeyi başlat
    const now = new Date();
    const endDate = new Date(now.getTime() + upgradeDays * 24 * 60 * 60 * 1000);

    const { error: updateAcademyError } = await supabase
      .from('user_academy')
      .update({
        upgrade_started_at: now.toISOString(),
        upgrade_end_at: endDate.toISOString(),
        speed_up_used: false,
        updated_at: now.toISOString(),
      })
      .eq('profile_id', profileId);

    if (updateAcademyError) {
      console.error('[academy/upgrade] Update error:', updateAcademyError);
      return NextResponse.json({ error: 'Yükseltme başlatılamadı' }, { status: 500 });
    }

    // Krediyi düş (eğer maliyet varsa)
    if (creditsCost > 0) {
      const { error: updateCreditsError } = await supabase
        .from('profiles')
        .update({ credits: (profile.credits || 0) - creditsCost })
        .eq('id', profileId);

      if (updateCreditsError) {
        console.error('[academy/upgrade] Credits update error:', updateCreditsError);
        // Rollback academy upgrade
        await supabase
          .from('user_academy')
          .update({ upgrade_started_at: null, upgrade_end_at: null })
          .eq('profile_id', profileId);
        return NextResponse.json({ error: 'Kredi düşülemedi' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Akademi Seviye ${targetLevel} yükseltmesi başlatıldı`,
      currentLevel,
      targetLevel,
      creditsCost,
      upgradeDays,
      upgradeEndAt: endDate.toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/academy/upgrade', method: 'POST' });
  }
}
