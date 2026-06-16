/**
 * POST /api/loans/list
 * Kullanıcı kendi oyuncusunu kiralık pazara çıkarır.
 *
 * Body: { playerId, loanFee (optional, default 0), profileId }
 *
 * - Oyuncunun is_on_loan_market = true, loan_fee = X olarak ayarlar
 * - loans tablosuna 'listed' durumunda kayıt oluşturur
 *
 * NOT: Supabase'de is_on_loan_market, loan_status gibi kolonlar henüz yoksa
 * sadece temel kolonları sorgular ve günceller.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidUserId } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

interface ListLoanRequest {
  playerId: string;
  loanFee?: number;
  profileId: string;
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    const body: ListLoanRequest = await request.json();
    const { playerId, loanFee = 0, profileId: bodyProfileId } = body;
    const profileId = getAuthenticatedUserId(request, bodyProfileId);

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

    // ── Oyuncuyu getir (önce tüm kolonlarla dene, hata olursa sadece temel kolonlarla) ──
    let player: any = null;
    let playerError: any = null;

    // Tam sorgu (tüm kolonlar varsa)
    const fullResult = await supabase
      .from('players')
      .select('id, profile_id, team_name, name, is_on_loan_market, loan_status')
      .eq('id', playerId)
      .maybeSingle();

    if (fullResult.error) {
      // Kolonlar henüz yoksa — sadece temel kolonlarla tekrar dene
      console.warn('[POST /api/loans/list] Full select failed, trying basic select:', fullResult.error.message);
      const basicResult = await supabase
        .from('players')
        .select('id, profile_id, team_name, name')
        .eq('id', playerId)
        .maybeSingle();

      player = basicResult.data;
      playerError = basicResult.error;

      if (player) {
        // Kolonlar yoksa varsayılan değerlerle devam et
        player.is_on_loan_market = false;
        player.loan_status = null;
      }
    } else {
      player = fullResult.data;
      playerError = null;
    }

    if (playerError || !player) {
      console.error('[POST /api/loans/list] Player fetch error:', playerError?.message, 'playerId:', playerId);
      return NextResponse.json({
        error: 'Oyuncu bulunamadı. Lütfen supabase-migration.sql dosyasını Supabase SQL Editor\'de çalıştırdığınızdan emin olun.',
        debug: { playerId, profileId, playerError: playerError?.message }
      }, { status: 404 });
    }

    // ── Yetki kontrolü: oyuncu bu profile mı ait? ──
    const profileOwnsPlayer = player.profile_id === profileId;
    let teamNameOwnsPlayer = false;

    if (!profileOwnsPlayer && player.team_name) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('team_name')
        .eq('id', profileId)
        .maybeSingle();

      if (profileData && profileData.team_name && player.team_name.toLowerCase() === profileData.team_name.toLowerCase()) {
        teamNameOwnsPlayer = true;
        // Fix: update the player's profile_id since it was missing
        console.log('[POST /api/loans/list] Fixing missing profile_id for player:', player.id, '→ profileId:', profileId);
        await supabase.rpc('rpc_save_training_result', { p_profile_id: profileId, p_player_id: player.id, p_updates: { profile_id: profileId } });
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
    const updatePayload: Record<string, unknown> = {
      loan_fee: loanFee,
      loan_owner_profile_id: profileId,
    };

    // is_on_loan_market kolonu varsa ekle
    try {
      const { error: testUpdate } = await supabase
        .from('players')
        .update({ is_on_loan_market: true })
        .eq('id', playerId)
        .select('id')
        .limit(1);

      if (!testUpdate) {
        updatePayload.is_on_loan_market = true;
      }
    } catch {
      // Kolon yoksa devam et
    }

    const { error: updateError } = await supabase
      .from('players')
      .update(updatePayload)
      .eq('id', playerId);

    if (updateError) {
      console.error('[POST /api/loans/list] Player update error:', updateError.message);
      return NextResponse.json({ error: 'Oyuncu kiralık pazara çıkarılamadı: ' + updateError.message }, { status: 500 });
    }

    // ── loans tablosuna kayıt oluştur ──
    let loanRecord: any = null;
    const { data: loanData, error: loanInsertError } = await supabase
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
      console.warn('[POST /api/loans/list] Loan insert error (non-critical):', loanInsertError.message);
      // loans tablosu yoksa da oyuncu kiralık pazarına çıkmış sayılır
      // Kolonlar sonradan eklendiğinde düzeltilebilir
    } else {
      loanRecord = loanData;
    }

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} kiralık pazarına çıkarıldı`,
      loanFee,
      loanId: loanRecord?.id,
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/loans/list', method: 'POST' });
  }
}
