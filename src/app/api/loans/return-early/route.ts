/**
 * POST /api/loans/return-early
 * Kiralanmış bir oyuncuyu erken iade eder.
 *
 * Body: { playerId, profileId }
 *
 * - Kredi iadesi YOK
 * - loan_status = 'returned_early', loaned_to_profile_id temizlenir
 * - is_on_loan_market = false (pazara geri çıkmaz, sahibine döner)
 * - loans tablosu da güncellenir
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidUserId } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';

interface ReturnEarlyRequest {
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
    const body: ReturnEarlyRequest = await request.json();
    const { playerId, profileId } = body;

    // ── Parametre doğrulama ──
    if (!playerId || !profileId) {
      return NextResponse.json({ error: 'playerId ve profileId zorunlu' }, { status: 400 });
    }

    if (!isValidUserId(profileId)) {
      return NextResponse.json({ error: 'Geçersiz profil ID' }, { status: 400 });
    }

    // ── Oyuncuyu getir ──
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, profile_id, name, loan_status, loaned_to_profile_id, loan_owner_profile_id')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError || !player) {
      console.error('[POST /api/loans/return-early] Player fetch error:', playerError?.message);
      return NextResponse.json({ error: 'Oyuncu bulunamadı' }, { status: 404 });
    }

    // ── Yetki kontrolü: ya kiralayan ya da sahibi erken iade yapabilir ──
    const isBorrower = player.loaned_to_profile_id === profileId;
    const isOwner = player.loan_owner_profile_id === profileId || player.profile_id === profileId;

    if (!isBorrower && !isOwner) {
      return NextResponse.json({ error: 'Bu oyuncuyu iade etme yetkiniz yok' }, { status: 403 });
    }

    // ── Oyuncu gerçekten kirada mı? ──
    if (player.loan_status !== 'active') {
      return NextResponse.json({ error: 'Bu oyuncu kirada değil, iade edilemez' }, { status: 400 });
    }

    // ── Oyuncunun kiralama durumunu güncelle ──
    const { error: updateError } = await supabase
      .from('players')
      .update({
        loan_status: 'returned_early',
        loaned_to_profile_id: null,
        loan_end_date: null,
        is_on_loan_market: false,
      })
      .eq('id', playerId);

    if (updateError) {
      console.error('[POST /api/loans/return-early] Player update error:', updateError.message);
      return NextResponse.json({ error: 'Oyuncu iade işlemi başarısız oldu' }, { status: 500 });
    }

    // ── loans tablosundaki aktif kaydı güncelle ──
    const { data: activeLoan } = await supabase
      .from('loans')
      .select('id')
      .eq('player_id', playerId)
      .eq('status', 'active')
      .maybeSingle();

    if (activeLoan) {
      const { error: loanUpdateError } = await supabase
        .from('loans')
        .update({
          status: 'returned_early',
        })
        .eq('id', activeLoan.id);

      if (loanUpdateError) {
        console.error('[POST /api/loans/return-early] Loan update error:', loanUpdateError.message);
        // Kritik değil, devam et — logla
      }
    }

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} erken iade edildi`,
      note: 'Kredi iadesi yapılmaz',
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/loans/return-early', method: 'POST' });
  }
}
