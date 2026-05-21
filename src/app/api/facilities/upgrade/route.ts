/**
 * Facilities Upgrade API — Tesis yükseltme başlat / hızlandır / iptal et
 * POST /api/facilities/upgrade
 *
 * Body: { profileId, facilityType, action: 'start' | 'speedup' | 'cancel' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface UpgradeRequest {
  profileId: string;
  facilityType: string;
  action: 'start' | 'speedup' | 'cancel';
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase yapılandırılmamış.' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const body: UpgradeRequest = await request.json();
    const { profileId, facilityType, action } = body;

    if (!profileId || !facilityType || !action) {
      return NextResponse.json({ error: true, message: 'Eksik parametreler.' }, { status: 400 });
    }

    // Get current facility status
    const { data: facility, error: facilityError } = await supabase
      .from('user_facilities')
      .select('*')
      .eq('profile_id', profileId)
      .eq('facility_type', facilityType)
      .maybeSingle();

    const currentLevel = facility?.current_level || 0;

    // Get profile for credits check
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, credits')
      .eq('id', profileId)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: true, message: 'Profil bulunamadı.' }, { status: 404 });
    }

    if (action === 'start') {
      // Check if any facility is already upgrading
      const { data: activeUpgrades } = await supabase
        .from('user_facilities')
        .select('*')
        .eq('profile_id', profileId)
        .not('upgrade_end_at', 'is', null)
        .gt('upgrade_end_at', new Date().toISOString());

      if (activeUpgrades && activeUpgrades.length > 0) {
        return NextResponse.json({ error: true, message: 'Zaten devam eden bir yükseltme var.' }, { status: 400 });
      }

      const targetLevel = currentLevel + 1;

      // Max level 5
      if (targetLevel > 5) {
        return NextResponse.json({ error: true, message: 'Maksimum seviyeye ulaşıldı.' }, { status: 400 });
      }

      // Get upgrade cost
      const { data: costData } = await supabase
        .from('facility_upgrade_costs')
        .select('*')
        .eq('facility_type', facilityType)
        .eq('target_level', targetLevel)
        .maybeSingle();

      if (!costData) {
        return NextResponse.json({ error: true, message: 'Yükseltme maliyeti bulunamadı.' }, { status: 404 });
      }

      // Check credits
      if ((profile.credits || 0) < costData.credits_cost) {
        return NextResponse.json({ error: true, message: `Yetersiz kredi. ${costData.credits_cost} kredi gerekli.` }, { status: 400 });
      }

      // Deduct credits
      const newCredits = (profile.credits || 0) - costData.credits_cost;
      await supabase.from('profiles').update({ credits: newCredits }).eq('id', profileId);

      // Calculate upgrade end time
      const upgradeEnd = new Date(Date.now() + costData.upgrade_days * 24 * 60 * 60 * 1000).toISOString();

      // Upsert facility
      if (facility) {
        await supabase.from('user_facilities').update({
          upgrade_started_at: new Date().toISOString(),
          upgrade_end_at: upgradeEnd,
          speed_up_used: false,
          updated_at: new Date().toISOString(),
        }).eq('id', facility.id);
      } else {
        await supabase.from('user_facilities').insert({
          profile_id: profileId,
          facility_type: facilityType,
          current_level: 0,
          upgrade_started_at: new Date().toISOString(),
          upgrade_end_at: upgradeEnd,
          speed_up_used: false,
        });
      }

      return NextResponse.json({
        success: true,
        message: `${facilityType} seviye ${targetLevel} yükseltmesi başlatıldı.`,
        credits_spent: costData.credits_cost,
        credits_remaining: newCredits,
        upgrade_end_at: upgradeEnd,
        upgrade_days: costData.upgrade_days,
      });

    } else if (action === 'speedup') {
      if (!facility || !facility.upgrade_end_at || facility.speed_up_used) {
        return NextResponse.json({ error: true, message: 'Hızlandırma yapılamaz.' }, { status: 400 });
      }

      const targetLevel = currentLevel + 1;

      // Get speedup cost
      const { data: costData } = await supabase
        .from('facility_upgrade_costs')
        .select('*')
        .eq('facility_type', facilityType)
        .eq('target_level', targetLevel)
        .maybeSingle();

      const speedupCost = costData?.instant_half_credits || 5;

      if ((profile.credits || 0) < speedupCost) {
        return NextResponse.json({ error: true, message: `Yetersiz kredi. ${speedupCost} kredi gerekli.` }, { status: 400 });
      }

      // Deduct credits
      const newCredits = (profile.credits || 0) - speedupCost;
      await supabase.from('profiles').update({ credits: newCredits }).eq('id', profileId);

      // Halve the remaining time
      const currentEnd = new Date(facility.upgrade_end_at).getTime();
      const now = Date.now();
      const remaining = currentEnd - now;
      const newEnd = new Date(now + remaining / 2).toISOString();

      await supabase.from('user_facilities').update({
        upgrade_end_at: newEnd,
        speed_up_used: true,
        updated_at: new Date().toISOString(),
      }).eq('id', facility.id);

      return NextResponse.json({
        success: true,
        message: 'Yükseltme hızlandırıldı!',
        credits_spent: speedupCost,
        credits_remaining: newCredits,
        new_upgrade_end_at: newEnd,
      });

    } else if (action === 'cancel') {
      if (!facility || !facility.upgrade_end_at) {
        return NextResponse.json({ error: true, message: 'Aktif yükseltme yok.' }, { status: 400 });
      }

      const targetLevel = currentLevel + 1;

      // Refund 50% of credits
      const { data: costData } = await supabase
        .from('facility_upgrade_costs')
        .select('credits_cost')
        .eq('facility_type', facilityType)
        .eq('target_level', targetLevel)
        .maybeSingle();

      const refund = costData ? Math.floor(costData.credits_cost * 0.5) : 0;
      const newCredits = (profile.credits || 0) + refund;

      await supabase.from('profiles').update({ credits: newCredits }).eq('id', profileId);
      await supabase.from('user_facilities').update({
        upgrade_started_at: null,
        upgrade_end_at: null,
        speed_up_used: false,
        updated_at: new Date().toISOString(),
      }).eq('id', facility.id);

      return NextResponse.json({
        success: true,
        message: 'Yükseltme iptal edildi.',
        credits_refunded: refund,
        credits_remaining: newCredits,
      });

    } else {
      return NextResponse.json({ error: true, message: 'Geçersiz action.' }, { status: 400 });
    }

  } catch (err) {
    console.error('[POST /api/facilities/upgrade] Exception:', err);
    return NextResponse.json({ error: true, message: 'Bir hata oluştu.' }, { status: 500 });
  }
}
