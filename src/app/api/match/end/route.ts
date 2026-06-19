import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculateMatchRevenue } from '@/lib/fm/financialModel';
import { getInflationFactor } from '@/lib/fm/inflation';
import { verifyProfileExists } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase yok' }, { status: 500 });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Supabase client yok' }, { status: 500 });

  try {
    const body = await request.json();
    const { userId: bodyUserId, isHome, homeScore, awayScore, isFriendly } = body;
    const userId = getAuthenticatedUserId(request, bodyUserId);

    if (!userId) {
      return NextResponse.json({ error: 'userId zorunlu.' }, { status: 400 });
    }

    // Verify profile exists
    const { valid: profileValid, error: profileErr, status: profileStatus } = await verifyProfileExists(supabase, userId);
    if (!profileValid) {
      return NextResponse.json({ error: profileErr || 'Profil bulunamadı' }, { status: profileStatus || 404 });
    }

    // Profili DB'den çek (client'tan güvenme)
    const { data: profile } = await supabase
      .from('profiles')
      .select('money, stadium_capacity, ticket_price, stadium_upgrades, reputation, current_day')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });

    if (isFriendly) {
      return NextResponse.json({ revenue: 0, attendance: 0 });
    }

    // calculateMatchRevenue financialModel'den çağır
    const { revenue, attendance } = calculateMatchRevenue(
      profile,
      isHome ?? true,
      homeScore,
      awayScore
    );

    // Enflasyon çarpanını uygula — gelir enflasyona göre artsın
    const inflationFactor = getInflationFactor(profile.current_day || 1);
    const inflatedRevenue = Math.floor(revenue * inflationFactor);

    // Para güncelle
    const newMoney = (profile.money || 0) + inflatedRevenue;
    await supabase.rpc('rpc_update_profile', { p_profile_id: userId, p_updates: { money: newMoney } });

    return NextResponse.json({ revenue: inflatedRevenue, attendance });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/match/end', method: 'POST' });
  }
}
