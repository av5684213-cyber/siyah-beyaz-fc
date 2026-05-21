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
    console.error('[POST /api/rental/offer] Supabase is not configured. Check environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).');
    return NextResponse.json({
      error: 'Supabase yapılandırılmamış',
      userMessage: 'Sistem bağlantısı yapılandırılmamış. Lütfen sayfayı yenileyip tekrar deneyin veya yöneticiyle iletişime geçin.',
      debug: 'Supabase environment variables missing',
    }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.error('[POST /api/rental/offer] Supabase client could not be created. getSupabase() returned null.');
    return NextResponse.json({
      error: 'Supabase istemcisi oluşturulamadı',
      userMessage: 'Veritabanı bağlantısı sağlanamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
      debug: 'getSupabase() returned null',
    }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { listingId, playerId, renterTeamId, durationWeeks = 12 } = body;

    if (!playerId || !renterTeamId) {
      console.warn('[POST /api/rental/offer] Missing required fields. playerId:', playerId, 'renterTeamId:', renterTeamId, { body });
      return NextResponse.json({
        error: 'playerId ve renterTeamId zorunlu',
        userMessage: 'Gerekli bilgiler eksik. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: `playerId=${playerId}, renterTeamId=${renterTeamId}`,
      }, { status: 400 });
    }

    if (durationWeeks < 1 || durationWeeks > 34) {
      console.warn('[POST /api/rental/offer] Invalid durationWeeks:', durationWeeks, 'Must be 1-34.');
      return NextResponse.json({
        error: 'Kiralama süresi 1-34 hafta arasında olmalıdır',
        userMessage: 'Kiralama süresi 1 ile 34 hafta arasında olmalıdır. Lütfen geçerli bir süre girin.',
        debug: `durationWeeks=${durationWeeks}, must be 1-34`,
      }, { status: 400 });
    }

    // ── İlanı getir ──
    const { data: listing, error: listingError } = await supabase
      .from('rental_listings')
      .select('id, player_id, owner_team_id, daily_cost, status')
      .eq('id', listingId)
      .maybeSingle();

    if (listingError) {
      console.error('[POST /api/rental/offer] Error fetching rental listing. listingId:', listingId, 'error:', listingError.message, 'The rental_listings table may not exist or migration has not been run.');
      return NextResponse.json({
        error: 'İlan bulunamadı',
        userMessage: 'Kiralama ilanı getirilirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: { listingId, error: listingError.message },
      }, { status: 404 });
    }

    if (!listing) {
      console.warn('[POST /api/rental/offer] Listing not found. listingId:', listingId, 'It may have been deleted or the ID is incorrect.');
      return NextResponse.json({
        error: 'İlan bulunamadı',
        userMessage: 'Kiralama ilanı bulunamadı. İlan kaldırılmış veya süresi dolmuş olabilir.',
        debug: { listingId },
      }, { status: 404 });
    }

    if (listing.status !== 'active') {
      console.warn('[POST /api/rental/offer] Listing is not active. listingId:', listingId, 'status:', listing.status);
      return NextResponse.json({
        error: 'Bu ilan artık aktif değil',
        userMessage: 'Bu kiralama ilanı artık aktif değil. Başka bir ilan seçiniz.',
        debug: { listingId, listingStatus: listing.status },
      }, { status: 400 });
    }

    // ── Oyuncuyu getir ──
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, name, profile_id, team_name, loan_status, is_on_loan_market, market_value')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError) {
      console.error('[POST /api/rental/offer] Error fetching player. playerId:', playerId, 'error:', playerError.message, 'The players table may have schema issues.');
      return NextResponse.json({
        error: 'Oyuncu bulunamadı',
        userMessage: 'Oyuncu bilgisi getirilirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: { playerId, error: playerError.message },
      }, { status: 404 });
    }

    if (!player) {
      console.warn('[POST /api/rental/offer] Player not found. playerId:', playerId, 'The player may have been deleted.');
      return NextResponse.json({
        error: 'Oyuncu bulunamadı',
        userMessage: 'Oyuncu bulunamadı. Oyuncu transfer edilmiş veya silinmiş olabilir.',
        debug: { playerId },
      }, { status: 404 });
    }

    // Kendi oyuncusunu kiralayamaz
    if (player.profile_id === renterTeamId || listing.owner_team_id === renterTeamId) {
      console.warn('[POST /api/rental/offer] User tried to rent their own player. playerId:', playerId, 'renterTeamId:', renterTeamId, 'ownerTeamId:', listing.owner_team_id, 'playerProfileId:', player.profile_id);
      return NextResponse.json({
        error: 'Kendi oyuncunuzu kiralayamazsınız',
        userMessage: 'Kendi oyuncunuzu kiralayamazsınız. Lütfen başka bir oyuncu seçin.',
        debug: { playerId, renterTeamId, ownerTeamId: listing.owner_team_id, playerProfileId: player.profile_id },
      }, { status: 400 });
    }

    // Oyuncu zaten kirada mı?
    if (player.loan_status === 'active') {
      console.warn('[POST /api/rental/offer] Player is already on loan. playerId:', playerId, 'playerName:', player.name, 'loan_status:', player.loan_status);
      return NextResponse.json({
        error: 'Bu oyuncu zaten kirada',
        userMessage: 'Bu oyuncu zaten başka bir takımda kirada. Kiralama süresi dolana kadar teklif veremezsiniz.',
        debug: { playerId, playerName: player.name, loan_status: player.loan_status },
      }, { status: 400 });
    }

    // ── Bekleyen teklif var mı kontrol et ──
    const { data: existingOffer, error: existingOfferError } = await supabase
      .from('rental_agreements')
      .select('id, status')
      .eq('player_id', playerId)
      .eq('renter_team_id', renterTeamId)
      .in('status', ['pending', 'accepted'])
      .maybeSingle();

    if (existingOfferError) {
      console.error('[POST /api/rental/offer] Error checking existing offers. playerId:', playerId, 'renterTeamId:', renterTeamId, 'error:', existingOfferError.message, 'The rental_agreements table may not exist.');
      return NextResponse.json({
        error: 'Mevcut teklifler kontrol edilemedi',
        userMessage: 'Mevcut teklifler kontrol edilirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: { playerId, renterTeamId, error: existingOfferError.message },
      }, { status: 500 });
    }

    if (existingOffer) {
      console.warn('[POST /api/rental/offer] Duplicate offer attempt. playerId:', playerId, 'renterTeamId:', renterTeamId, 'existingOfferId:', existingOffer.id, 'existingStatus:', existingOffer.status);
      return NextResponse.json({
        error: 'Bu oyuncu için zaten bekleyen/aktif bir teklifiniz var',
        userMessage: 'Bu oyuncu için zaten bekleyen veya aktif bir teklifiniz var. Teklifinizin sonucunu bekleyin.',
        debug: { playerId, renterTeamId, existingOfferId: existingOffer.id, existingStatus: existingOffer.status },
      }, { status: 400 });
    }

    // ── Kiralayan profilini getir ──
    const { data: renterProfile, error: renterProfileError } = await supabase
      .from('profiles')
      .select('id, credits, money, team_name')
      .eq('id', renterTeamId)
      .maybeSingle();

    if (renterProfileError) {
      console.error('[POST /api/rental/offer] Error fetching renter profile. renterTeamId:', renterTeamId, 'error:', renterProfileError.message);
      return NextResponse.json({
        error: 'Profil bulunamadı',
        userMessage: 'Profil bilgileriniz getirilirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: { renterTeamId, error: renterProfileError.message },
      }, { status: 404 });
    }

    if (!renterProfile) {
      console.warn('[POST /api/rental/offer] Renter profile not found. renterTeamId:', renterTeamId);
      return NextResponse.json({
        error: 'Profil bulunamadı',
        userMessage: 'Profiliniz bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: { renterTeamId },
      }, { status: 404 });
    }

    // ── Maliyet hesapla ──
    const dailyCost = listing.daily_cost || 0;
    const totalDays = durationWeeks * 7;
    const totalCostEuro = dailyCost * totalDays;

    // ── Bakiye kontrolü ──
    if ((renterProfile.credits || 0) < COMMISSION_KR) {
      console.warn('[POST /api/rental/offer] Insufficient credits. renterTeamId:', renterTeamId, 'required:', COMMISSION_KR, 'available:', renterProfile.credits || 0);
      return NextResponse.json({
        error: `Yetersiz kredi. Kiralama komisyonu: ${COMMISSION_KR} KR. Mevcut: ${renterProfile.credits || 0} KR`,
        userMessage: `Yetersiz kredi bakiye. Kiralama komisyonu ${COMMISSION_KR} KR gerektiriyor ancak mevcut bakiyeniz ${renterProfile.credits || 0} KR. Lütfen kredi yükleyin.`,
        debug: { required: COMMISSION_KR, available: renterProfile.credits || 0 },
      }, { status: 400 });
    }

    if ((renterProfile.money || 0) < totalCostEuro) {
      console.warn('[POST /api/rental/offer] Insufficient Euro balance. renterTeamId:', renterTeamId, 'totalCost:', totalCostEuro, 'available:', renterProfile.money || 0);
      return NextResponse.json({
        error: `Yetersiz Euro bakiye. Toplam kiralama ücreti: ${totalCostEuro.toLocaleString('tr-TR')} €. Mevcut: ${(renterProfile.money || 0).toLocaleString('tr-TR')} €`,
        userMessage: `Yetersiz Euro bakiye. Toplam kiralama ücreti ${totalCostEuro.toLocaleString('tr-TR')} € ancak mevcut bakiyeniz ${(renterProfile.money || 0).toLocaleString('tr-TR')} €. Lütfen bakiyenizi artırın veya daha kısa süre seçin.`,
        debug: { totalCostEuro, available: renterProfile.money || 0, dailyCost, durationWeeks },
      }, { status: 400 });
    }

    // ── Komisyonu düş (KR) ──
    const { error: commissionDeductError } = await supabase
      .from('profiles')
      .update({ credits: (renterProfile.credits || 0) - COMMISSION_KR })
      .eq('id', renterTeamId);

    if (commissionDeductError) {
      console.error('[POST /api/rental/offer] Failed to deduct commission from renter. renterTeamId:', renterTeamId, 'commission:', COMMISSION_KR, 'error:', commissionDeductError.message);
      return NextResponse.json({
        error: 'Komisyon düşülemedi',
        userMessage: 'Kiralama komisyonu düşülürken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: { renterTeamId, commission: COMMISSION_KR, error: commissionDeductError.message },
      }, { status: 500 });
    }

    // ── Euro ücreti alıcıdan düş, satıcıya ekle ──
    const { error: euroDeductError } = await supabase
      .from('profiles')
      .update({ money: (renterProfile.money || 0) - totalCostEuro })
      .eq('id', renterTeamId);

    if (euroDeductError) {
      console.error('[POST /api/rental/offer] Failed to deduct Euro from renter. renterTeamId:', renterTeamId, 'amount:', totalCostEuro, 'error:', euroDeductError.message, 'Attempting to refund commission.');
      // Komisyonu geri öde
      await supabase.from('profiles').update({ credits: renterProfile.credits || 0 }).eq('id', renterTeamId);
      return NextResponse.json({
        error: 'Euro ücreti düşülemedi',
        userMessage: 'Kiralama ücreti düşülürken bir hata oluştu. Komisyon iade edildi. Lütfen tekrar deneyin.',
        debug: { renterTeamId, totalCostEuro, error: euroDeductError.message },
      }, { status: 500 });
    }

    // Sahip profile
    const { data: ownerProfile, error: ownerProfileError } = await supabase
      .from('profiles')
      .select('id, money')
      .eq('id', listing.owner_team_id)
      .maybeSingle();

    if (ownerProfileError) {
      console.error('[POST /api/rental/offer] Error fetching owner profile. ownerTeamId:', listing.owner_team_id, 'error:', ownerProfileError.message, 'Payment was already deducted from renter.');
    }

    if (ownerProfile) {
      const { error: ownerPaymentError } = await supabase
        .from('profiles')
        .update({ money: (ownerProfile.money || 0) + totalCostEuro })
        .eq('id', listing.owner_team_id);

      if (ownerPaymentError) {
        console.error('[POST /api/rental/offer] Failed to add Euro to owner. ownerTeamId:', listing.owner_team_id, 'amount:', totalCostEuro, 'error:', ownerPaymentError.message, 'Renter was charged but owner was not paid. Manual correction may be needed.');
      }
    } else if (!ownerProfile && !ownerProfileError) {
      console.warn('[POST /api/rental/offer] Owner profile not found. ownerTeamId:', listing.owner_team_id, 'Payment was deducted from renter but owner could not be credited. Manual correction may be needed.');
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
      console.error('[POST /api/rental/offer] Agreement insert failed. playerId:', playerId, 'renterTeamId:', renterTeamId, 'listingId:', listingId, 'error:', agreementError.message, 'The rental_agreements table may not exist or have schema mismatch. Attempting financial rollback.');
      // Finansal işlemi geri al
      try {
        await supabase.from('profiles').update({ credits: renterProfile.credits || 0, money: renterProfile.money || 0 }).eq('id', renterTeamId);
        if (ownerProfile) {
          await supabase.from('profiles').update({ money: ownerProfile.money || 0 }).eq('id', listing.owner_team_id);
        }
        console.info('[POST /api/rental/offer] Financial rollback completed successfully.');
      } catch (rollbackErr) {
        console.error('[POST /api/rental/offer] Financial rollback FAILED. Manual intervention required. renterTeamId:', renterTeamId, 'ownerTeamId:', listing.owner_team_id, 'rollbackError:', rollbackErr instanceof Error ? rollbackErr.message : String(rollbackErr));
      }
      return NextResponse.json({
        error: 'Anlaşma kaydedilemedi',
        userMessage: 'Kiralama anlaşması kaydedilirken bir hata oluştu. Finansal işlemleriniz geri alındı. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: { playerId, renterTeamId, listingId, error: agreementError.message },
      }, { status: 500 });
    }

    // ── Oyuncuyu geçici olarak "pending_loan" durumuna al ──
    const { error: playerUpdateError } = await supabase
      .from('players')
      .update({
        loan_status: 'pending_loan',
        loaned_to_profile_id: renterTeamId,
        loan_end_date: endDate.toISOString().split('T')[0],
        loan_fee: totalCostEuro,
      })
      .eq('id', playerId);

    if (playerUpdateError) {
      console.error('[POST /api/rental/offer] Failed to update player loan status. playerId:', playerId, 'error:', playerUpdateError.message, 'Agreement was created but player status not updated. This may cause display issues.');
    }

    // ── İlanı beklemede işaretle ──
    const { error: listingUpdateError } = await supabase
      .from('rental_listings')
      .update({ status: 'pending' })
      .eq('id', listingId);

    if (listingUpdateError) {
      console.error('[POST /api/rental/offer] Failed to update listing status to pending. listingId:', listingId, 'error:', listingUpdateError.message, 'Agreement was created but listing status not updated.');
    }

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
      console.warn('[POST /api/rental/offer] Loans table update failed (non-critical). playerId:', playerId, 'error:', loanErr?.message || String(loanErr), 'The loans table may not exist or have different schema.');
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
    console.error('[POST /api/rental/offer] Unhandled exception:', err instanceof Error ? err.message : String(err), err instanceof Error ? err.stack : '');
    return NextResponse.json({
      error: 'Bir hata oluştu',
      userMessage: 'Kiralama teklifi gönderilirken beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.',
      debug: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
