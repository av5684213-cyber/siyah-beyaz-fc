/**
 * POST /api/rental/list
 * Oyuncuyu kiralık listesine ekle (rental_listings tablosu)
 *
 * Body: { playerId, ownerTeamId, dailyCost }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

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
    const { playerId, ownerTeamId, dailyCost = 0 } = body;

    if (!playerId) {
      return NextResponse.json({ error: 'playerId zorunlu' }, { status: 400 });
    }

    // Oyuncuyu getir
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, name, profile_id, team_name, is_on_loan_market, loan_status, market_value')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError || !player) {
      return NextResponse.json({ error: 'Oyuncu bulunamadı' }, { status: 404 });
    }

    // Zaten kiralık pazarında mı?
    if (player.is_on_loan_market) {
      return NextResponse.json({ error: 'Bu oyuncu zaten kiralık pazarında' }, { status: 400 });
    }

    if (player.loan_status === 'active') {
      return NextResponse.json({ error: 'Bu oyuncu şu anda kirada' }, { status: 400 });
    }

    // rental_listings tablosuna ekle
    const { data: listing, error: insertError } = await supabase
      .from('rental_listings')
      .insert({
        player_id: playerId,
        owner_team_id: ownerTeamId || player.team_name || player.profile_id,
        daily_cost: dailyCost,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[POST /api/rental/list] Insert error:', insertError.message);
      // rental_listings tablosu yoksa fallback: sadece players tablosunu güncelle
    }

    // Oyuncuyu kiralık pazarına çıkar
    const { error: updateError } = await supabase
      .from('players')
      .update({
        is_on_loan_market: true,
        loan_fee: dailyCost,
        loan_owner_profile_id: ownerTeamId || player.profile_id,
        loan_status: 'listed',
      })
      .eq('id', playerId);

    if (updateError) {
      console.error('[POST /api/rental/list] Player update error:', updateError.message);
      return NextResponse.json({ error: 'Oyuncu güncellenemedi: ' + updateError.message }, { status: 500 });
    }

    // loans tablosuna da kayıt oluştur
    await supabase.from('loans').insert({
      player_id: playerId,
      owner_team_id: ownerTeamId || player.team_name || player.profile_id,
      loan_fee_paid: dailyCost,
      status: 'listed',
    }).select().single();

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} kiralık listesine eklendi`,
      dailyCost,
      listingId: listing?.id,
    });
  } catch (err) {
    console.error('[POST /api/rental/list] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
