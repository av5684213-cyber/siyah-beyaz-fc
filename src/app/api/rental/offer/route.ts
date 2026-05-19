/**
 * POST /api/rental/offer
 * Kiralık oyuncu için teklif yap
 *
 * Body: { listingId, playerId, borrowerTeamId, offerAmount, durationWeeks }
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
    const { listingId, playerId, borrowerTeamId, offerAmount = 0, durationWeeks = 12 } = body;

    if (!playerId || !borrowerTeamId) {
      return NextResponse.json({ error: 'playerId ve borrowerTeamId zorunlu' }, { status: 400 });
    }

    // Oyuncuyu getir
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, name, is_on_loan_market, loan_status, loan_owner_profile_id, team_name')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError || !player) {
      return NextResponse.json({ error: 'Oyuncu bulunamadı' }, { status: 404 });
    }

    if (!player.is_on_loan_market) {
      return NextResponse.json({ error: 'Bu oyuncu kiralık pazarında değil' }, { status: 400 });
    }

    if (player.loan_status === 'active') {
      return NextResponse.json({ error: 'Bu oyuncu zaten kirada' }, { status: 400 });
    }

    // Kendi oyuncusunu kiralayamaz
    if (player.loan_owner_profile_id === borrowerTeamId || player.team_name === borrowerTeamId) {
      return NextResponse.json({ error: 'Kendi oyuncunuzu kiralayamazsınız' }, { status: 400 });
    }

    // Ödeme: Kredi (KR) cinsinden komisyon — 10 KR
    const COMMISSION = 10;

    // Borrower'ın kredisini kontrol et
    const { data: borrowerProfile } = await supabase
      .from('profiles')
      .select('id, credits, team_name')
      .eq('id', borrowerTeamId)
      .maybeSingle();

    if (!borrowerProfile) {
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    if ((borrowerProfile.credits || 0) < COMMISSION) {
      return NextResponse.json({ error: `Yetersiz kredi. Kiralama komisyonu: ${COMMISSION} KR` }, { status: 400 });
    }

    // Komisyonu düş
    await supabase
      .from('profiles')
      .update({ credits: (borrowerProfile.credits || 0) - COMMISSION })
      .eq('id', borrowerTeamId);

    // Oyuncuyu kirala
    const loanEndDate = new Date();
    loanEndDate.setDate(loanEndDate.getDate() + durationWeeks * 7);

    await supabase
      .from('players')
      .update({
        loan_status: 'active',
        loaned_to_profile_id: borrowerTeamId,
        loan_end_date: loanEndDate.toISOString().split('T')[0],
        is_on_loan_market: false,
      })
      .eq('id', playerId);

    // rental_listings'i güncelle
    if (listingId) {
      await supabase
        .from('rental_listings')
        .update({ status: 'rented' })
        .eq('id', listingId);
    }

    // loans tablosunu güncelle
    const { data: existingLoan } = await supabase
      .from('loans')
      .select('id')
      .eq('player_id', playerId)
      .eq('status', 'listed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingLoan) {
      await supabase
        .from('loans')
        .update({
          status: 'active',
          loaned_to_team_id: borrowerTeamId,
          loan_fee_paid: offerAmount,
          start_date: new Date().toISOString(),
          end_date: loanEndDate.toISOString(),
        })
        .eq('id', existingLoan.id);
    } else {
      await supabase.from('loans').insert({
        player_id: playerId,
        owner_team_id: player.loan_owner_profile_id || player.team_name,
        loaned_to_team_id: borrowerTeamId,
        loan_fee_paid: offerAmount,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: loanEndDate.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} başarıyla kiralandı (${durationWeeks} hafta)`,
      commission: COMMISSION,
      loanEndDate: loanEndDate.toISOString().split('T')[0],
    });
  } catch (err) {
    console.error('[POST /api/rental/offer] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
