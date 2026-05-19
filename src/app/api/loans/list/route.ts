/**
 * POST /api/loans/list
 * Kullanıcı kendi oyuncusunu kiralık pazara çıkarır.
 *
 * Body: { playerId, loanFee (optional, default 0), profileId }
 *
 * - Oyuncunun is_on_loan_market = true, loan_fee = X olarak ayarlar
 * - loans tablosuna 'listed' durumunda kayıt oluşturur
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidUserId } from '@/lib/fm/security';

interface ListLoanRequest {
  playerId: string;
  loanFee?: number;
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
    const body: ListLoanRequest = await request.json();
    const { playerId, loanFee = 0, profileId } = body;

    // ── Parametre doğrulama ──
    if (!playerId || !profileId) {
      return NextResponse.json({ error: 'playerId ve profileId zorunlu' }, { status: 400 });
    }

    if (!isValidUserId(profileId)) {
      return NextResponse.json({ error: 'Geçersiz profil ID' }, { status: 400 });
    }

    if (typeof loanFee !== 'number' || loanFee < 0) {
      return NextResponse.json({ error: 'loanFee 0 veya pozitif bir sayı olmalı' }, { status: 400 });
    }

    // ── Oyuncuyu getir ──
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, profile_id, team_name, name, is_on_loan_market, loan_status')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError || !player) {
      console.error('[POST /api/loans/list] Player fetch error:', playerError?.message, 'playerId:', playerId);
      return NextResponse.json({ 
        error: 'Oyuncu bulunamadı',
        debug: { playerId, profileId, playerError: playerError?.message }
      }, { status: 404 });
    }

    // ── Yetki kontrolü: oyuncu bu profile mı ait? ──
    // Fallback: profile_id eşleşmezse, team_name ile de kontrol et
    const profileOwnsPlayer = player.profile_id === profileId;
    let teamNameOwnsPlayer = false;
    
    if (!profileOwnsPlayer && player.team_name) {
      // Fetch profile's team_name to compare
      const { data: profileData } = await supabase
        .from('profiles')
        .select('team_name')
        .eq('id', profileId)
        .maybeSingle();
      
      if (profileData && profileData.team_name && player.team_name.toLowerCase() === profileData.team_name.toLowerCase()) {
        teamNameOwnsPlayer = true;
        // Fix: update the player's profile_id since it was missing
        console.log('[POST /api/loans/list] Fixing missing profile_id for player:', player.id, '→ profileId:', profileId);
        await supabase.from('players').update({ profile_id: profileId }).eq('id', player.id);
      }
    }

    if (!profileOwnsPlayer && !teamNameOwnsPlayer) {
      console.warn('[POST /api/loans/list] Authorization failed:', {
        playerId: player.id,
        playerProfileId: player.profile_id,
        playerTeamName: player.team_name,
        requestProfileId: profileId,
      });
      return NextResponse.json({ 
        error: 'Bu oyuncu sizin takımınıza ait değil',
        debug: { 
          playerProfileId: player.profile_id, 
          playerTeamName: player.team_name,
          requestProfileId: profileId,
        }
      }, { status: 403 });
    }

    // ── Zaten kiralık pazarında mı? ──
    if (player.is_on_loan_market) {
      return NextResponse.json({ error: 'Bu oyuncu zaten kiralık pazarında' }, { status: 400 });
    }

    // ── Zaten kirada olan oyuncu tekrar listelenemez ──
    if (player.loan_status === 'active') {
      return NextResponse.json({ error: 'Bu oyuncu şu anda kirada, tekrar listeleyemezsiniz' }, { status: 400 });
    }

    // ── Oyuncuyu kiralık pazara çıkar ──
    const { error: updateError } = await supabase
      .from('players')
      .update({
        is_on_loan_market: true,
        loan_fee: loanFee,
        loan_owner_profile_id: profileId,
      })
      .eq('id', playerId);

    if (updateError) {
      console.error('[POST /api/loans/list] Player update error:', updateError.message);
      return NextResponse.json({ error: 'Oyuncu kiralık pazara çıkarılamadı' }, { status: 500 });
    }

    // ── loans tablosuna kayıt oluştur ──
    const { data: loanRecord, error: loanInsertError } = await supabase
      .from('loans')
      .insert({
        player_id: playerId,
        owner_team_id: player.team_name || profileId,
        loan_fee_paid: loanFee,
        status: 'listed',
      })
      .select()
      .single();

    if (loanInsertError) {
      console.error('[POST /api/loans/list] Loan insert error:', loanInsertError.message);
      // Oyuncuyu geri al (rollback)
      await supabase
        .from('players')
        .update({ is_on_loan_market: false, loan_fee: 0, loan_owner_profile_id: null })
        .eq('id', playerId);
      return NextResponse.json({ error: 'Kiralık kaydı oluşturulamadı' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} kiralık pazarına çıkarıldı`,
      loanFee,
      loanId: loanRecord?.id,
    });
  } catch (err) {
    console.error('[POST /api/loans/list] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' }, { status: 500 });
  }
}
