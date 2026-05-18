/**
 * POST /api/loans/request
 * Kiralık pazarındaki bir oyuncuyu kiralamayı talep eder.
 *
 * Body: { playerId, profileId }
 *
 * - 10 kredi tahsil edilir (sistemde kalır, sahibine verilmez)
 * - Oyuncunun loaned_to_profile_id = requesting user, loan_status = 'active'
 * - loan_end_date = sezon sonu ('2026-08-31')
 * - loans tablosundaki kayıt 'active' olarak güncellenir
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidUserId } from '@/lib/fm/security';

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
    const { playerId, profileId } = body;

    // ── Parametre doğrulama ──
    if (!playerId || !profileId) {
      return NextResponse.json({ error: 'playerId ve profileId zorunlu' }, { status: 400 });
    }

    if (!isValidUserId(profileId)) {
      return NextResponse.json({ error: 'Geçersiz profil ID' }, { status: 400 });
    }

    // ── İstek sahibinin profilini getir ──
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, credits, team_name')
      .eq('id', profileId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('[POST /api/loans/request] Profile fetch error:', profileError?.message);
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    // ── Kredi kontrolü ──
    if ((profile.credits || 0) < LOAN_CREDITS_COST) {
      return NextResponse.json({
        error: `Yetersiz kredi. Kiralama ücreti: ${LOAN_CREDITS_COST} kredi. Mevcut: ${profile.credits || 0}`,
      }, { status: 400 });
    }

    // ── Oyuncuyu getir ──
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, profile_id, team_name, name, is_on_loan_market, loan_fee, loan_status, loaned_to_profile_id')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError || !player) {
      console.error('[POST /api/loans/request] Player fetch error:', playerError?.message);
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

    // ── Krediyi düş ──
    const newCredits = (profile.credits || 0) - LOAN_CREDITS_COST;
    const { error: creditsError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', profileId);

    if (creditsError) {
      console.error('[POST /api/loans/request] Credits update error:', creditsError.message);
      return NextResponse.json({ error: 'Kredi düşülemedi' }, { status: 500 });
    }

    // ── Oyuncunun kiralama durumunu güncelle ──
    const { error: updatePlayerError } = await supabase
      .from('players')
      .update({
        loaned_to_profile_id: profileId,
        loan_status: 'active',
        loan_end_date: SEASON_END_DATE,
        is_on_loan_market: false, // artık pazar değil, kirada
      })
      .eq('id', playerId);

    if (updatePlayerError) {
      console.error('[POST /api/loans/request] Player update error:', updatePlayerError.message);
      // Krediyi geri iade et (rollback)
      await supabase
        .from('profiles')
        .update({ credits: profile.credits || 0 })
        .eq('id', profileId);
      return NextResponse.json({ error: 'Oyuncu kiralama işlemi başarısız oldu' }, { status: 500 });
    }

    // ── loans tablosundaki kaydı güncelle ──
    const { data: existingLoan } = await supabase
      .from('loans')
      .select('id')
      .eq('player_id', playerId)
      .eq('status', 'listed')
      .maybeSingle();

    if (existingLoan) {
      const { error: loanUpdateError } = await supabase
        .from('loans')
        .update({
          loaned_to_team_id: profile.team_name || profileId,
          start_date: new Date().toISOString(),
          end_date: SEASON_END_DATE,
          loan_fee_paid: LOAN_CREDITS_COST,
          status: 'active',
        })
        .eq('id', existingLoan.id);

      if (loanUpdateError) {
        console.error('[POST /api/loans/request] Loan update error:', loanUpdateError.message);
        // Kritik değil, devam et — logla
      }
    } else {
      // Kayıt yoksa yeni oluştur
      const { error: loanInsertError } = await supabase
        .from('loans')
        .insert({
          player_id: playerId,
          owner_team_id: player.team_name || player.profile_id,
          loaned_to_team_id: profile.team_name || profileId,
          start_date: new Date().toISOString(),
          end_date: SEASON_END_DATE,
          loan_fee_paid: LOAN_CREDITS_COST,
          status: 'active',
        });

      if (loanInsertError) {
        console.error('[POST /api/loans/request] Loan insert error:', loanInsertError.message);
        // Kritik değil, devam et — logla
      }
    }

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} başarıyla kiralandı`,
      creditsSpent: LOAN_CREDITS_COST,
      creditsRemaining: newCredits,
      loanEndDate: SEASON_END_DATE,
    });
  } catch (err) {
    console.error('[POST /api/loans/request] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' }, { status: 500 });
  }
}
