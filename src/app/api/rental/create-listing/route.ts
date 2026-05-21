/**
 * POST /api/rental/create-listing
 * Oyuncuyu kiralık listesine ekle — SADECE rental_listings ve loans tablolarına yazar.
 * players tablosu GÜNCELLENMEZ (loan kolonları mevcut olmayabilir).
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

    // Oyuncuyu getir — sadece temel bilgiler (loan kolonlarını sorgulama)
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, name, profile_id, team_name, market_value, specific_position, position, rating, age')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError || !player) {
      console.error('[POST /api/rental/create-listing] Player not found. playerId:', playerId, 'error:', playerError?.message);
      return NextResponse.json({
        error: 'Oyuncu bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: { playerId, error: playerError?.message }
      }, { status: 404 });
    }

    // Zaten aktif bir kiralama ilanı var mı kontrol et
    const { data: existingListing, error: checkError } = await supabase
      .from('rental_listings')
      .select('id, status')
      .eq('player_id', playerId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingListing) {
      return NextResponse.json({ error: 'Bu oyuncu zaten kiralık pazarında' }, { status: 400 });
    }

    // Zaten aktif kiralama var mı kontrol et (loans tablosu)
    const { data: existingLoan } = await supabase
      .from('loans')
      .select('id, status')
      .eq('player_id', playerId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingLoan) {
      return NextResponse.json({ error: 'Bu oyuncu şu anda kirada' }, { status: 400 });
    }

    // rental_listings tablosuna ekle
    const listingPayload = {
      player_id: playerId,
      owner_team_id: ownerTeamId || player.team_name || player.profile_id,
      daily_cost: dailyCost,
      duration_weeks: durationWeeks,
      status: 'active',
    };

    const { data: listing, error: insertError } = await supabase
      .from('rental_listings')
      .insert(listingPayload)
      .select()
      .single();

    if (insertError) {
      console.error('[POST /api/rental/create-listing] rental_listings insert error:', insertError.message);
      // duration_weeks kolonu yoksa fallback
      if (insertError.message.includes('duration_weeks')) {
        const { data: fallbackListing, error: fallbackError } = await supabase
          .from('rental_listings')
          .insert({
            player_id: playerId,
            owner_team_id: ownerTeamId || player.team_name || player.profile_id,
            daily_cost: dailyCost,
            status: 'active',
          })
          .select()
          .single();

        if (fallbackError) {
          return NextResponse.json({ error: 'Kiralama ilanı oluşturulamadı: ' + fallbackError.message }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          message: `${player.name || 'Oyuncu'} kiralık listesine eklendi`,
          dailyCost,
          durationWeeks,
          listingId: fallbackListing?.id,
        });
      }
      return NextResponse.json({ error: 'Kiralama ilanı oluşturulamadı: ' + insertError.message }, { status: 500 });
    }

    // loans tablosuna da kayıt oluştur (non-critical)
    try {
      await supabase.from('loans').insert({
        player_id: playerId,
        owner_team_id: ownerTeamId || player.team_name || player.profile_id,
        loan_fee_paid: dailyCost,
        duration_weeks: durationWeeks,
        status: 'listed',
      });
    } catch (loanErr) {
      console.warn('[POST /api/rental/create-listing] loans insert error (non-critical):', loanErr);
    }

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} kiralık listesine eklendi`,
      dailyCost,
      durationWeeks,
      listingId: listing?.id,
    });
  } catch (err) {
    console.error('[POST /api/rental/create-listing] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
