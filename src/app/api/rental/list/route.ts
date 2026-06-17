/**
 * POST /api/rental/list
 * Oyuncuyu kiralık listesine ekle (rental_listings tablosu)
 *
 * Body: { playerId, ownerTeamId, dailyCost, durationWeeks }
 *
 * DÜZELTME: players tablosundan sadece temel kolonları çek,
 * is_on_loan_market gibi olmayan kolonları sorgulama.
 * Sadece rental_listings ve loans tablolarına yaz.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    console.error('[POST /api/rental/list] Supabase is not configured.');
    return NextResponse.json({
      success: false,
      error: 'Supabase yapılandırılmamış',
      userMessage: 'Sistem bağlantısı yapılandırılmamış. Lütfen sayfayı yenileyip tekrar deneyin.',
    }, { status: 500 });
  }

  let supabase = getServiceSupabase();
  if (!supabase) supabase = getSupabase();
  if (!supabase) {
    console.error('[POST /api/rental/list] Supabase client null.');
    return NextResponse.json({
      success: false,
      error: 'Supabase istemcisi oluşturulamadı',
      userMessage: 'Veritabanı bağlantısı sağlanamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
    }, { status: 500 });
  }

  try {
    const body = await request.json();
    const bodyUserId = body.userId || body.ownerTeamId || body.profileId;
    const { playerId, ownerTeamId, dailyCost = 0, durationWeeks = 17 } = body;

    console.log('[POST /api/rental/list] Request:', { playerId, ownerTeamId, dailyCost, durationWeeks });

    if (!playerId) {
      return NextResponse.json({
        success: false,
        error: 'playerId zorunlu',
        userMessage: 'Oyuncu bilgisi eksik. Lütfen sayfayı yenileyip tekrar deneyin.',
      }, { status: 400 });
    }

    // ── Sahiplik doğrulama: ownerTeamId verildiyse, oyuncunun profile_id'si ile eşleşmeli ──
    const expectedOwner = ownerTeamId || null;

    if (typeof durationWeeks !== 'number' || durationWeeks < 1 || durationWeeks > 34) {
      return NextResponse.json({
        success: false,
        error: 'Kiralama süresi 1-34 hafta arasında olmalıdır',
        userMessage: 'Kiralama süresi 1 ile 34 hafta arasında olmalıdır.',
      }, { status: 400 });
    }

    // ── Oyuncuyu getir — SADECE temel kolonlar ──
    // is_on_loan_market, loan_status gibi kolonlar players tablosunda OLMAYABİLİR
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, name, profile_id, team_name, market_value')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError) {
      console.error('[POST /api/rental/list] Player query error:', playerError.message);
      return NextResponse.json({
        success: false,
        error: 'Oyuncu sorgulanamadı',
        userMessage: 'Teknik bir hata oluştu, daha sonra tekrar deneyin.',
        debug: playerError.message,
      }, { status: 500 });
    }

    if (!player) {
      console.error('[POST /api/rental/list] Player not found. playerId:', playerId);
      return NextResponse.json({
        success: false,
        error: 'Oyuncu bulunamadı',
        userMessage: 'Oyuncu bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
      }, { status: 404 });
    }

    // ── Sahiplik doğrulama ──
    if (expectedOwner && player.profile_id && player.profile_id !== expectedOwner) {
      console.warn('[POST /api/rental/list] Ownership mismatch. playerId:', playerId, 'expectedOwner:', expectedOwner, 'actualOwner:', player.profile_id);
      return NextResponse.json({
        success: false,
        error: 'Bu oyuncu sizin kadronuzda değil',
        userMessage: 'Bu oyuncu sizin kadronuzda değil. Sadece kendi oyuncularınızı kiralık listesine ekleyebilirsiniz.',
      }, { status: 403 });
    }

    // ── Aynı oyuncu zaten kiralık listesinde mi? ──
    // rental_listings tablosundan kontrol et (players tablosundaki kolonlara güvenme)
    const { data: existingListing, error: existingError } = await supabase
      .from('rental_listings')
      .select('id, status')
      .eq('player_id', playerId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingError && !isTableNotFoundError(existingError.message)) {
      console.warn('[POST /api/rental/list] Could not check existing listings:', existingError.message);
      // Non-critical — devam et
    }

    if (existingListing) {
      console.warn('[POST /api/rental/list] Player already has active listing. playerId:', playerId);
      return NextResponse.json({
        success: false,
        error: 'Bu oyuncu zaten kiralık pazarında',
        userMessage: 'Bu oyuncu zaten kiralık pazarında listelenmiş.',
      }, { status: 400 });
    }

    // ── rental_listings tablosuna ekle ──
    const listingPayload = {
      player_id: playerId,
      owner_team_id: ownerTeamId || player.team_name || player.profile_id,
      daily_cost: dailyCost,
      duration_weeks: durationWeeks,
      status: 'active',
    };

    console.log('[POST /api/rental/list] Inserting rental listing:', listingPayload);

    const { data: listing, error: insertError } = await supabase
      .from('rental_listings')
      .insert(listingPayload)
      .select()
      .single();

    if (insertError) {
      console.error('[POST /api/rental/list] rental_listings insert failed:', insertError.message, insertError);

      if (isTableNotFoundError(insertError.message)) {
        return NextResponse.json({
          success: false,
          error: 'rental_listings tablosu bulunamadı',
          userMessage: 'Kiralık pazarı sistemi henüz veritabanına yüklenmemiş. Lütfen Supabase SQL Editor\'de supabase/migrations/20260521000002_rental_system.sql dosyasını çalıştırın.',
          debug: insertError.message,
        }, { status: 500 });
      }

      // Kolon hatası olabilir — duration_weeks olmadan dene
      if (/column.*does not exist/i.test(insertError.message)) {
        console.warn('[POST /api/rental/list] Column missing, trying without duration_weeks:', insertError.message);
        const fallbackPayload = {
          player_id: playerId,
          owner_team_id: ownerTeamId || player.team_name || player.profile_id,
          daily_cost: dailyCost,
          status: 'active',
        };

        const { data: fallbackListing, error: fallbackError } = await supabase
          .from('rental_listings')
          .insert(fallbackPayload)
          .select()
          .single();

        if (fallbackError) {
          console.error('[POST /api/rental/list] Fallback insert also failed:', fallbackError.message);
          return NextResponse.json({
            success: false,
            error: 'İlan oluşturulamadı',
            userMessage: 'Teknik bir hata oluştu, daha sonra tekrar deneyin.',
            debug: fallbackError.message,
          }, { status: 500 });
        }

        console.log('[POST /api/rental/list] Fallback insert succeeded:', fallbackListing?.id);
        return NextResponse.json({
          success: true,
          message: `${player.name || 'Oyuncu'} kiralık listesine eklendi`,
          dailyCost,
          durationWeeks,
          listingId: fallbackListing?.id,
        });
      }

      return NextResponse.json({
        success: false,
        error: 'İlan oluşturulamadı',
        userMessage: 'Teknik bir hata oluştu, daha sonra tekrar deneyin.',
        debug: insertError.message,
      }, { status: 500 });
    }

    console.log('[POST /api/rental/list] Listing created:', listing?.id);

    // ── loans tablosuna da kayıt oluştur (non-critical) ──
    const { error: loanInsertError } = await supabase.from('loans').insert({
      player_id: playerId,
      owner_team_id: ownerTeamId || player.team_name || player.profile_id,
      loan_fee_paid: dailyCost,
      duration_weeks: durationWeeks,
      status: 'listed',
    });

    if (loanInsertError) {
      if (isTableNotFoundError(loanInsertError.message)) {
        console.warn('[POST /api/rental/list] loans table does not exist (non-critical). Run migration 20260521000002_rental_system.sql');
      } else {
        console.warn('[POST /api/rental/list] loans insert error (non-critical):', loanInsertError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} kiralık listesine eklendi`,
      dailyCost,
      durationWeeks,
      listingId: listing?.id,
    });

  } catch (err) {
    return createErrorResponse(err, { route: '/api/rental/list', method: 'POST' });
  }
}

// Tablo yokluğunu tespit etmek için yardımcı fonksiyon
function isTableNotFoundError(msg: string): boolean {
  return /relation .* does not exist|could not find|not found|does not exist/i.test(msg);
}
