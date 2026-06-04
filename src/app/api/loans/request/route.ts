/**
 * POST /api/loans/request
 * Kiralık pazarındaki bir oyuncuyu kiralamayı talep eder.
 *
 * Body: { playerId, profileId }
 *
 * Ekonomi modeli:
 * - 10 Kredi tahsil edilir (sistemde kalır — oyun komisyonu)
 * - Euro kiralama ücreti = oyuncu piyasa değeri × %15 × enflasyon çarpanı
 * - Euro ücreti alıcıdan (kiralayan) düşülüp satıcıya (oyuncu sahibi) eklenir
 * - Oyuncunun loaned_to_profile_id = requesting user, loan_status = 'active'
 * - loan_end_date = sezon sonu ('2026-08-31')
 * - loans tablosundaki kayıt 'active' olarak güncellenir
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidUserId } from '@/lib/fm/security';
import { calculateLoanFeeEuro, getInflationFactor } from '@/lib/fm/inflation';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

const LOAN_CREDITS_COST = 10;
const SEASON_END_DATE = '2026-08-31';

interface LoanRequest {
  playerId: string;
  profileId: string;
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    const body: LoanRequest = await request.json();
    const { playerId, profileId: bodyProfileId } = body;
    const profileId = getAuthenticatedUserId(request, bodyProfileId);

    if (!playerId || !profileId) {
      return NextResponse.json({ error: 'playerId ve profileId zorunlu' }, { status: 400 });
    }

    if (!isValidUserId(profileId)) {
      return NextResponse.json({ error: 'Geçersiz profil ID' }, { status: 400 });
    }

    // ── İstek sahibinin profilini getir ──
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, credits, money, team_name, current_day')
      .eq('id', profileId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('[POST /api/loans/request] Profile fetch error:', profileError?.message);
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    // ── Kredi kontrolü (10 Kredi — sistem komisyonu) ──
    if ((profile.credits || 0) < LOAN_CREDITS_COST) {
      return NextResponse.json({
        error: `Yetersiz kredi. Kiralama komisyonu: ${LOAN_CREDITS_COST} kredi. Mevcut: ${profile.credits || 0}`,
      }, { status: 400 });
    }

    // ── Oyuncuyu getir (tam kolonlarla dene, hata olursa temel kolonlarla) ──
    let player: any = null;
    const fullResult = await supabase
      .from('players')
      .select('id, profile_id, team_name, name, is_on_loan_market, loan_fee, loan_status, loaned_to_profile_id, market_value, rating, age')
      .eq('id', playerId)
      .maybeSingle();

    if (fullResult.error) {
      console.warn('[POST /api/loans/request] Full select failed, trying basic:', fullResult.error.message);
      const basicResult = await supabase
        .from('players')
        .select('id, profile_id, team_name, name, market_value, rating, age')
        .eq('id', playerId)
        .maybeSingle();

      player = basicResult.data;
      if (player) {
        player.is_on_loan_market = false;
        player.loan_status = null;
        player.loan_fee = 0;
        player.loaned_to_profile_id = null;
      }
    } else {
      player = fullResult.data;
    }

    if (!player) {
      console.error('[POST /api/loans/request] Player not found:', playerId);
      return NextResponse.json({ error: 'Oyuncu bulunamadı' }, { status: 404 });
    }

    // ── Kendi oyuncusunu kiralayamaz ──
    if (player.profile_id === profileId) {
      return NextResponse.json({ error: 'Kendi oyuncunuzu kiralayamazsınız' }, { status: 400 });
    }

    // ── Oyuncu kiralık pazarında mı? ──
    if (!player.is_on_loan_market) {
      return NextResponse.json({ error: 'Bu oyuncu kiralık pazarında değil' }, { status: 400 });
    }

    // ── Oyuncu zaten kirada mı? ──
    if (player.loan_status === 'active') {
      return NextResponse.json({ error: 'Bu oyuncu zaten kirada' }, { status: 400 });
    }

    // ═══════════════════════════════════════════════════════════════
    // EURO KİRALAMA ÜCRETİ HESAPLAMA (Enflasyon bazlı)
    // ═══════════════════════════════════════════════════════════════
    const currentDay = profile.current_day || 1;
    const playerMarketValue = player.market_value || (player.rating || 50) * 50000;
    const loanFeeEuro = calculateLoanFeeEuro(playerMarketValue, currentDay);

    // ── Alıcının Euro bakiyesi yeterli mi? ──
    if ((profile.money || 0) < loanFeeEuro) {
      return NextResponse.json({
        error: `Yetersiz bakiye. Kiralama ücreti: ${loanFeeEuro.toLocaleString('tr-TR')} €. Mevcut: ${(profile.money || 0).toLocaleString('tr-TR')} €`,
      }, { status: 400 });
    }

    // ── Oyuncu sahibinin profilini getir (Euro transferi için) ──
    const ownerId = player.profile_id;
    const { data: ownerProfile, error: ownerError } = await supabase
      .from('profiles')
      .select('id, money')
      .eq('id', ownerId)
      .maybeSingle();

    if (ownerError || !ownerProfile) {
      console.error('[POST /api/loans/request] Owner profile fetch error:', ownerError?.message);
      return NextResponse.json({ error: 'Oyuncu sahibi profili bulunamadı' }, { status: 404 });
    }

    // ═══════════════════════════════════════════════════════════════
    // FİNANSAL İŞLEMLER
    // ═══════════════════════════════════════════════════════════════

    // 1) Krediyi düş (10 Kredi — sistem komisyonu)
    const newCredits = (profile.credits || 0) - LOAN_CREDITS_COST;
    const { error: creditsError } = await supabase
      .rpc('rpc_update_profile', { p_profile_id: profileId, p_updates: { credits: newCredits } });

    if (creditsError) {
      console.error('[POST /api/loans/request] Credits update error:', creditsError.message);
      return NextResponse.json({ error: 'Kredi düşülemedi' }, { status: 500 });
    }

    // 2) Euro kiralama ücreti: Alıcıdan düş, satıcıya ekle
    const newBorrowerMoney = (profile.money || 0) - loanFeeEuro;
    const { error: borrowerMoneyError } = await supabase
      .rpc('rpc_update_profile', { p_profile_id: profileId, p_updates: { money: newBorrowerMoney } });

    if (borrowerMoneyError) {
      console.error('[POST /api/loans/request] Borrower money update error:', borrowerMoneyError.message);
      await supabase.rpc('rpc_update_profile', { p_profile_id: profileId, p_updates: { credits: profile.credits || 0 } });
      return NextResponse.json({ error: 'Euro kiralama ücreti düşülemedi' }, { status: 500 });
    }

    const newOwnerMoney = (ownerProfile.money || 0) + loanFeeEuro;
    const { error: ownerMoneyError } = await supabase
      .rpc('rpc_update_profile', { p_profile_id: ownerId, p_updates: { money: newOwnerMoney } });

    if (ownerMoneyError) {
      console.error('[POST /api/loans/request] Owner money update error:', ownerMoneyError.message);
      await supabase.rpc('rpc_update_profile', { p_profile_id: profileId, p_updates: { money: profile.money || 0 } });
      await supabase.rpc('rpc_update_profile', { p_profile_id: profileId, p_updates: { credits: profile.credits || 0 } });
      return NextResponse.json({ error: 'Oyuncu sahibine ödeme yapılamadı' }, { status: 500 });
    }

    // ── Oyuncunun kiralama durumunu güncelle ──
    const playerUpdate: Record<string, unknown> = {
      loaned_from_profile_id: player.profile_id,
      loaned_to_profile_id: profileId,
      loan_status: 'active',
      loan_end_date: SEASON_END_DATE,
      is_on_loan_market: false,
      loan_fee: loanFeeEuro,
    };

    const { data: rpcResult, error: updatePlayerError } = await supabase
      .rpc('rpc_save_training_result', { p_profile_id: profileId, p_player_id: playerId, p_updates: playerUpdate });

    if (updatePlayerError) {
      console.error('[POST /api/loans/request] Player update error:', updatePlayerError.message);
      // Kolonlar henüz yoksa sadece logla, finansal işlemleri geri al
      if (!updatePlayerError.message?.includes('does not exist')) {
        await supabase.rpc('rpc_update_profile', { p_profile_id: profileId, p_updates: { money: profile.money || 0, credits: profile.credits || 0 } });
        await supabase.rpc('rpc_update_profile', { p_profile_id: ownerId, p_updates: { money: ownerProfile.money || 0 } });
        return NextResponse.json({ error: 'Oyuncu kiralama işlemi başarısız oldu: ' + updatePlayerError.message }, { status: 500 });
      }
      // Kolon yoksa ama finansal işlemler başarılı — devam et
      console.warn('[POST /api/loans/request] Loan columns missing but financial transactions succeeded');
    }

    // ── loans tablosundaki kaydı güncelle ──
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
            loaned_to_team_id: profile.team_name || profileId,
            start_date: new Date().toISOString(),
            end_date: SEASON_END_DATE,
            loan_fee_paid: loanFeeEuro,
            status: 'active',
          })
          .eq('id', existingLoan.id);
      } else {
        await supabase
          .from('loans')
          .insert({
            player_id: playerId,
            owner_team_id: player.team_name || player.profile_id,
            loaned_to_team_id: profile.team_name || profileId,
            start_date: new Date().toISOString(),
            end_date: SEASON_END_DATE,
            loan_fee_paid: loanFeeEuro,
            status: 'active',
          });
      }
    } catch (loanErr: any) {
      console.warn('[POST /api/loans/request] Loan table operation failed (non-critical):', loanErr?.message);
    }

    // ── Enflasyon bilgisi ──
    const inflationFactor = getInflationFactor(currentDay);

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} başarıyla kiralandı`,
      creditsSpent: LOAN_CREDITS_COST,
      creditsRemaining: newCredits,
      loanFeeEuro,
      loanFeeEuroFormatted: `${(loanFeeEuro / 1_000_000).toFixed(1)}M €`,
      moneyRemaining: newBorrowerMoney,
      ownerReceived: loanFeeEuro,
      inflationFactor: parseFloat(inflationFactor.toFixed(4)),
      playerMarketValue: playerMarketValue,
      loanEndDate: SEASON_END_DATE,
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/loans/request', method: 'POST' });
  }
}
