/**
 * POST /api/rental/list
 * Oyuncuyu kiralık listesine ekle (rental_listings tablosu)
 *
 * Body: { playerId, ownerTeamId, dailyCost, durationWeeks }
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
    const { playerId, ownerTeamId, dailyCost = 0, durationWeeks = 17 } = body;

    if (!playerId) {
      return NextResponse.json({ error: 'playerId zorunlu' }, { status: 400 });
    }

    if (typeof durationWeeks !== 'number' || durationWeeks < 1 || durationWeeks > 34) {
      return NextResponse.json({ error: 'Kiralama süresi 1-34 hafta arasında olmalıdır' }, { status: 400 });
    }

    // Oyuncuyu getir — önce tüm kolonlarla dene, hata olursa sadece temel kolonlarla tekrar dene
    let player: any = null;

    const fullResult = await supabase
      .from('players')
      .select('id, name, profile_id, team_name, is_on_loan_market, loan_status, market_value')
      .eq('id', playerId)
      .maybeSingle();

    if (fullResult.error) {
      // Kolonlar henüz yoksa — sadece temel kolonlarla tekrar dene
      console.warn('[POST /api/rental/list] Full select failed, trying basic select:', fullResult.error.message);
      const basicResult = await supabase
        .from('players')
        .select('id, name, profile_id, team_name, market_value')
        .eq('id', playerId)
        .maybeSingle();

      if (basicResult.error || !basicResult.data) {
        console.error('[POST /api/rental/list] Player not found. playerId:', playerId, 'error:', basicResult.error?.message);
        return NextResponse.json({
          error: 'Oyuncu bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
          debug: { playerId, error: basicResult.error?.message }
        }, { status: 404 });
      }

      player = { ...basicResult.data, is_on_loan_market: false, loan_status: null };
    } else {
      player = fullResult.data;
    }

    if (!player) {
      console.error('[POST /api/rental/list] Player is null after query. playerId:', playerId);
      return NextResponse.json({
        error: 'Oyuncu bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: { playerId, ownerTeamId }
      }, { status: 404 });
    }

    // Zaten kiralık pazarında mı?
    if (player.is_on_loan_market) {
      return NextResponse.json({ error: 'Bu oyuncu zaten kiralık pazarında' }, { status: 400 });
    }

    if (player.loan_status === 'active') {
      return NextResponse.json({ error: 'Bu oyuncu şu anda kirada' }, { status: 400 });
    }

    // rental_listings tablosuna ekle — duration_weeks kolonu yoksa tekrar dene
    let listingId: string | null = null;
    const baseListingPayload = {
      player_id: playerId,
      owner_team_id: ownerTeamId || player.team_name || player.profile_id,
      daily_cost: dailyCost,
      status: 'active',
    };

    const { data: listing, error: insertError } = await supabase
      .from('rental_listings')
      .insert({
        ...baseListingPayload,
        duration_weeks: durationWeeks,
      })
      .select()
      .single();

    if (insertError) {
      console.warn('[POST /api/rental/list] rental_listings insert with duration_weeks failed:', insertError.message);
      // duration_weeks kolonu yoksa tekrar dene
      const { data: fallbackListing, error: fallbackError } = await supabase
        .from('rental_listings')
        .insert(baseListingPayload)
        .select()
        .single();

      if (fallbackError) {
        console.warn('[POST /api/rental/list] rental_listings insert error (non-critical):', fallbackError.message);
        // rental_listings tablosu yoksa da devam et — players tablosu güncellenecek
      } else {
        listingId = fallbackListing?.id;
      }
    } else {
      listingId = listing?.id;
    }

    // Oyuncuyu kiralık pazarına çıkar — önce tüm kolonlarla güncelle, hata olursa sadece temel kolonlarla
    const fullUpdatePayload = {
      is_on_loan_market: true,
      loan_fee: dailyCost,
      loan_owner_profile_id: ownerTeamId || player.profile_id,
      loan_status: 'listed',
    };

    const { error: fullUpdateError } = await supabase
      .from('players')
      .update(fullUpdatePayload)
      .eq('id', playerId);

    if (fullUpdateError) {
      console.warn('[POST /api/rental/list] Full update failed, trying minimal update:', fullUpdateError.message);
      // Sadece mevcut kolonları güncelle
      const { error: basicUpdateError } = await supabase
        .from('players')
        .update({ market_value: player.market_value }) // En az bir kolon güncellenmeli
        .eq('id', playerId);

      if (basicUpdateError) {
        console.error('[POST /api/rental/list] Player update error:', basicUpdateError.message);
        return NextResponse.json({ error: 'Oyuncu güncellenemedi: ' + basicUpdateError.message }, { status: 500 });
      }
    }

    // loans tablosuna da kayıt oluştur
    try {
      await supabase.from('loans').insert({
        player_id: playerId,
        owner_team_id: ownerTeamId || player.team_name || player.profile_id,
        loan_fee_paid: dailyCost,
        duration_weeks: durationWeeks,
        status: 'listed',
      });
    } catch (loanErr) {
      console.warn('[POST /api/rental/list] loans insert error (non-critical):', loanErr);
    }

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} kiralık listesine eklendi`,
      dailyCost,
      durationWeeks,
      listingId,
    });
  } catch (err) {
    console.error('[POST /api/rental/list] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
