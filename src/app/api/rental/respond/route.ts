/**
 * POST /api/rental/respond
 * Kiralama teklifini kabul veya reddet
 *
 * Body: { agreementId, response: 'accept' | 'reject', ownerTeamId }
 *
 * Kabul: Oyuncu kiralayanın kadrosuna geçer, anlaşma aktif olur
 * Ret: Para iadesi yapılır, oyuncu listede kalır
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { RENTAL_COMMISSION_KR } from '@/lib/fm/constants';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { agreementId, response, ownerTeamId } = body;

    if (!agreementId || !response || !ownerTeamId) {
      return NextResponse.json({ error: 'agreementId, response ve ownerTeamId zorunlu' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(response)) {
      return NextResponse.json({ error: 'response "accept" veya "reject" olmalıdır' }, { status: 400 });
    }

    // ── Anlaşmayı getir ──
    const { data: agreement, error: agreementError } = await supabase
      .from('rental_agreements')
      .select('*')
      .eq('id', agreementId)
      .maybeSingle();

    if (agreementError || !agreement) {
      return NextResponse.json({ error: 'Anlaşma bulunamadı' }, { status: 404 });
    }

    // Sadece ilan sahibi yanıtlayabilir
    if (agreement.owner_team_id !== ownerTeamId) {
      return NextResponse.json({ error: 'Bu teklifi yanıtlayamazsınız — ilan sahibi değilsiniz' }, { status: 403 });
    }

    // Sadece pending durumu yanıtlanabilir
    if (agreement.status !== 'pending') {
      return NextResponse.json({ error: `Bu anlaşma zaten "${agreement.status}" durumunda` }, { status: 400 });
    }

    if (response === 'accept') {
      // ═══════════════════════════════════════════════════════════
      // KABUL: Oyuncuyu kiralayanın kadrosuna taşı
      // ═══════════════════════════════════════════════════════════

      // Anlaşmayı güncelle
      await supabase
        .from('rental_agreements')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
        })
        .eq('id', agreementId);

      // Oyuncuyu kiralayanın kadrosuna taşı
      // SAHİPLİK DOĞRULAMA: Sadece ilan sahibinin oyuncusunu güncelle
      const renterProfile = await supabase
        .from('profiles')
        .select('id, team_name')
        .eq('id', agreement.renter_team_id)
        .maybeSingle();

      const { error: playerOwnerCheck } = await supabase
        .from('players')
        .update({
          loan_status: 'active',
          loaned_to_profile_id: agreement.renter_team_id,
          is_on_loan_market: false,
          profile_id: agreement.renter_team_id,
          team_name: renterProfile.data?.team_name || agreement.renter_team_id,
        })
        .eq('id', agreement.player_id)
        .eq('profile_id', agreement.owner_team_id);

      // rental_listings'i güncelle
      if (agreement.listing_id) {
        await supabase
          .from('rental_listings')
          .update({ status: 'rented' })
          .eq('id', agreement.listing_id);
      }

      // loans tablosunu güncelle
      try {
        const { data: existingLoan } = await supabase
          .from('loans')
          .select('id')
          .eq('player_id', agreement.player_id)
          .in('status', ['listed', 'pending'])
          .maybeSingle();

        if (existingLoan) {
          await supabase
            .from('loans')
            .update({ status: 'active' })
            .eq('id', existingLoan.id);
        }
      } catch (loanErr: any) {
        console.warn('[POST /api/rental/respond] Loans update non-critical:', loanErr?.message);
      }

      return NextResponse.json({
        success: true,
        message: 'Kiralama teklifi kabul edildi. Oyuncu kiralayanın kadrosuna eklendi.',
        status: 'accepted',
      });

    } else {
      // ═══════════════════════════════════════════════════════════
      // RED: Para iadesi yap, oyuncu listede kalsın
      // ═══════════════════════════════════════════════════════════

      // Anlaşmayı güncelle
      await supabase
        .from('rental_agreements')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString(),
        })
        .eq('id', agreementId);

      // Kiralayana iade: KR + Euro
      const renterProfile = await supabase
        .from('profiles')
        .select('id, credits, money')
        .eq('id', agreement.renter_team_id)
        .maybeSingle();

      if (renterProfile.data) {
        await supabase
          .from('profiles')
          .update({
            credits: (renterProfile.data.credits || 0) + (agreement.commission || RENTAL_COMMISSION_KR),
            money: (renterProfile.data.money || 0) + (agreement.total_cost || 0),
          })
          .eq('id', agreement.renter_team_id);
      }

      // Sahipten Euro düş (geri al)
      const ownerProfile = await supabase
        .from('profiles')
        .select('id, money')
        .eq('id', agreement.owner_team_id)
        .maybeSingle();

      if (ownerProfile.data) {
        await supabase
          .from('profiles')
          .update({
            money: Math.max(0, (ownerProfile.data.money || 0) - (agreement.total_cost || 0)),
          })
          .eq('id', agreement.owner_team_id);
      }

      // Oyuncuyu tekrar listede yap
      // SAHİPLİK DOĞRULAMA: Sadece ilan sahibinin oyuncusunu güncelle
      const { error: rejectPlayerError } = await supabase
        .from('players')
        .update({
          loan_status: 'listed',
          loaned_to_profile_id: null,
          is_on_loan_market: true,
        })
        .eq('id', agreement.player_id)
        .eq('profile_id', agreement.owner_team_id);

      // rental_listings'i tekrar aktif yap
      if (agreement.listing_id) {
        await supabase
          .from('rental_listings')
          .update({ status: 'active' })
          .eq('id', agreement.listing_id);
      }

      // loans tablosunu listed'e geri al
      try {
        const { data: existingLoan } = await supabase
          .from('loans')
          .select('id')
          .eq('player_id', agreement.player_id)
          .eq('status', 'pending')
          .maybeSingle();

        if (existingLoan) {
          await supabase
            .from('loans')
            .update({ status: 'listed' })
            .eq('id', existingLoan.id);
        }
      } catch (loanErr: any) {
        console.warn('[POST /api/rental/respond] Loans update non-critical:', loanErr?.message);
      }

      return NextResponse.json({
        success: true,
        message: 'Kiralama teklifi reddedildi. Ödeme iade edildi.',
        status: 'rejected',
      });
    }
  } catch (err) {
    console.error('[POST /api/rental/respond] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

