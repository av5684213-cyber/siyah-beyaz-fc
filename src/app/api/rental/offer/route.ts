/**
 * POST /api/rental/offer
 * Kiralık oyuncu için kiralama teklifi yap (rental_agreements tablosuna kayıt)
 *
 * Body: { listingId, playerId, renterTeamId, durationWeeks }
 *
 * Ekonomi:
 * - daily_cost (ilan sahibi belirledi) * gün sayısı = total_cost (Euro)
 * - 10 KR komisyon sistemde kalır
 * - Teklif pending durumda oluşturulur, ilan sahibi kabul/reddetmelidir
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const COMMISSION_KR = 10;

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
    const { listingId, playerId, renterTeamId, durationWeeks = 12 } = body;

    if (!playerId || !renterTeamId) {
      return NextResponse.json({ error: 'playerId ve renterTeamId zorunlu' }, { status: 400 });
    }

    if (durationWeeks < 1 || durationWeeks > 34) {
      return NextResponse.json({ error: 'Kiralama süresi 1-34 hafta arasında olmalıdır' }, { status: 400 });
    }

    // ── İlanı getir ──
    const { data: listing, error: listingError } = await supabase
      .from('rental_listings')
      .select('id, player_id, owner_team_id, daily_cost, status')
      .eq('id', listingId)
      .maybeSingle();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 });
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Bu ilan artık aktif değil' }, { status: 400 });
    }

    // ── Oyuncuyu getir ──
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, name, profile_id, team_name, loan_status, is_on_loan_market, market_value')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError || !player) {
      return NextResponse.json({ error: 'Oyuncu bulunamadı' }, { status: 404 });
    }

    // Kendi oyuncusunu kiralayamaz
    if (player.profile_id === renterTeamId || listing.owner_team_id === renterTeamId) {
      return NextResponse.json({ error: 'Kendi oyuncunuzu kiralayamazsınız' }, { status: 400 });
    }

    // Oyuncu zaten kirada mı?
    if (player.loan_status === 'active') {
      return NextResponse.json({ error: 'Bu oyuncu zaten kirada' }, { status: 400 });
    }

    // ── Bekleyen teklif var mı kontrol et ──
    const { data: existingOffer } = await supabase
      .from('rental_agreements')
      .select('id, status')
      .eq('player_id', playerId)
      .eq('renter_team_id', renterTeamId)
      .in('status', ['pending', 'accepted'])
      .maybeSingle();

    if (existingOffer) {
      return NextResponse.json({ error: 'Bu oyuncu için zaten bekleyen/aktif bir teklifiniz var' }, { status: 400 });
    }

    // ── Kiralayan profilini getir ──
    const { data: renterProfile } = await supabase
      .from('profiles')
      .select('id, credits, money, team_name')
      .eq('id', renterTeamId)
      .maybeSingle();

    if (!renterProfile) {
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    // ── Maliyet hesapla ──
    const dailyCost = listing.daily_cost || 0;
    const totalDays = durationWeeks * 7;
    const totalCostEuro = dailyCost * totalDays;

    // ── Bakiye kontrolü ──
    if ((renterProfile.credits || 0) < COMMISSION_KR) {
      return NextResponse.json({
        error: `Yetersiz kredi. Kiralama komisyonu: ${COMMISSION_KR} KR. Mevcut: ${renterProfile.credits || 0} KR`,
      }, { status: 400 });
    }

    if ((renterProfile.money || 0) < totalCostEuro) {
      return NextResponse.json({
        error: `Yetersiz Euro bakiye. Toplam kiralama ücreti: ${totalCostEuro.toLocaleString('tr-TR')} €. Mevcut: ${(renterProfile.money || 0).toLocaleString('tr-TR')} €`,
      }, { status: 400 });
    }

    // ── Komisyonu düş (KR) ──
    await supabase
      .from('profiles')
      .update({ credits: (renterProfile.credits || 0) - COMMISSION_KR })
      .eq('id', renterTeamId);

    // ── Euro ücreti alıcıdan düş, satıcıya ekle ──
    await supabase
      .from('profiles')
      .update({ money: (renterProfile.money || 0) - totalCostEuro })
      .eq('id', renterTeamId);

    // Sahip profile
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('id, money')
      .eq('id', listing.owner_team_id)
      .maybeSingle();

    if (ownerProfile) {
      await supabase
        .from('profiles')
        .update({ money: (ownerProfile.money || 0) + totalCostEuro })
        .eq('id', listing.owner_team_id);
    }

    // ── Bitiş tarihi hesapla ──
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + totalDays);

    // ── rental_agreements tablosuna kayıt oluştur ──
    const { data: agreement, error: agreementError } = await supabase
      .from('rental_agreements')
      .insert({
        listing_id: listingId,
        player_id: playerId,
        owner_team_id: listing.owner_team_id,
        renter_team_id: renterTeamId,
        duration_weeks: durationWeeks,
        daily_cost: dailyCost,
        total_cost: totalCostEuro,
        commission: COMMISSION_KR,
        end_date: endDate.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (agreementError) {
      console.error('[POST /api/rental/offer] Agreement insert error:', agreementError.message);
      // Finansal işlemi geri al
      await supabase.from('profiles').update({ credits: renterProfile.credits || 0, money: renterProfile.money || 0 }).eq('id', renterTeamId);
      if (ownerProfile) {
        await supabase.from('profiles').update({ money: ownerProfile.money || 0 }).eq('id', listing.owner_team_id);
      }
      return NextResponse.json({ error: 'Anlaşma kaydedilemedi: ' + agreementError.message }, { status: 500 });
    }

    // ── Oyuncuyu geçici olarak "pending_loan" durumuna al ──
    await supabase
      .from('players')
      .update({
        loan_status: 'pending_loan',
        loaned_to_profile_id: renterTeamId,
        loan_end_date: endDate.toISOString().split('T')[0],
        loan_fee: totalCostEuro,
      })
      .eq('id', playerId);

    // ── İlanı beklemede işaretle ──
    await supabase
      .from('rental_listings')
      .update({ status: 'pending' })
      .eq('id', listingId);

    // ── loans tablosunda da kayıt ──
    try {
      const { data: existingLoan } = await supabase
        .from('loans')
        .select('id')
        .eq('player_id', playerId)
        .eq('status', 'listed')
        .maybeSingle();

      if (existingLoan) {
        await supabase
          .from('loans')
          .update({
            status: 'pending',
            loaned_to_team_id: renterProfile.team_name || renterTeamId,
            loan_fee_paid: totalCostEuro,
            start_date: new Date().toISOString(),
            end_date: endDate.toISOString(),
          })
          .eq('id', existingLoan.id);
      }
    } catch (loanErr: any) {
      console.warn('[POST /api/rental/offer] Loans table update failed (non-critical):', loanErr?.message);
    }

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} için kiralama teklifi gönderildi`,
      agreementId: agreement?.id,
      totalCostEuro,
      commission: COMMISSION_KR,
      durationWeeks,
      endDate: endDate.toISOString().split('T')[0],
    });
  } catch (err) {
    console.error('[POST /api/rental/offer] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
