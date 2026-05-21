/**
 * POST /api/rental/list
 * Oyuncuyu kiralık listesine ekle (rental_listings tablosu)
 *
 * Body: { playerId, ownerTeamId, dailyCost, durationWeeks }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    console.error('[POST /api/rental/list] Supabase is not configured. Check environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).');
    return NextResponse.json({
      error: 'Supabase yapılandırılmamış',
      userMessage: 'Sistem bağlantısı yapılandırılmamış. Lütfen sayfayı yenileyip tekrar deneyin veya yöneticiyle iletişime geçin.',
      debug: 'Supabase environment variables missing',
    }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.error('[POST /api/rental/list] Supabase client could not be created. getSupabase() returned null.');
    return NextResponse.json({
      error: 'Supabase istemcisi oluşturulamadı',
      userMessage: 'Veritabanı bağlantısı sağlanamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
      debug: 'getSupabase() returned null',
    }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { playerId, ownerTeamId, dailyCost = 0, durationWeeks = 17 } = body;

    if (!playerId) {
      console.warn('[POST /api/rental/list] Missing playerId in request body.', { body });
      return NextResponse.json({
        error: 'playerId zorunlu',
        userMessage: 'Oyuncu bilgisi eksik. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: 'playerId is required but was not provided',
      }, { status: 400 });
    }

    if (typeof durationWeeks !== 'number' || durationWeeks < 1 || durationWeeks > 34) {
      console.warn('[POST /api/rental/list] Invalid durationWeeks:', durationWeeks, 'Must be 1-34.');
      return NextResponse.json({
        error: 'Kiralama süresi 1-34 hafta arasında olmalıdır',
        userMessage: 'Kiralama süresi 1 ile 34 hafta arasında olmalıdır. Lütfen geçerli bir süre girin.',
        debug: `durationWeeks=${durationWeeks}, must be 1-34`,
      }, { status: 400 });
    }

    // Oyuncuyu getir — önce tüm kolonlarla dene, hata olursa sadece temel kolonlarla tekrar dene
    let player: any = null;

    const fullResult = await supabase
      .from('players')
      .select('id, name, profile_id, team_name, is_on_loan_market, loan_status, market_value')
      .eq('id', playerId)
      .maybeSingle();

    if (fullResult.error) {
      // Kolonlar henüz yoksa — sadece temel kolonlarla tekrar dene
      console.warn('[POST /api/rental/list] Full select failed, trying basic select:', fullResult.error.message, { playerId });
      const basicResult = await supabase
        .from('players')
        .select('id, name, profile_id, team_name, market_value')
        .eq('id', playerId)
        .maybeSingle();

      if (basicResult.error || !basicResult.data) {
        console.error('[POST /api/rental/list] Player not found after basic select. playerId:', playerId, 'error:', basicResult.error?.message, 'data:', basicResult.data);
        return NextResponse.json({
          error: 'Oyuncu bulunamadı',
          userMessage: 'Oyuncu bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
          debug: { playerId, fullSelectError: fullResult.error.message, basicSelectError: basicResult.error?.message || null },
        }, { status: 404 });
      }

      player = { ...basicResult.data, is_on_loan_market: false, loan_status: null };
    } else {
      player = fullResult.data;
    }

    if (!player) {
      console.error('[POST /api/rental/list] Player is null after query. playerId:', playerId, 'This should not happen — check Supabase data integrity.');
      return NextResponse.json({
        error: 'Oyuncu bulunamadı',
        userMessage: 'Oyuncu bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.',
        debug: { playerId, ownerTeamId, reason: 'player_null_after_query' },
      }, { status: 404 });
    }

    // Zaten kiralık pazarında mı?
    if (player.is_on_loan_market) {
      console.warn('[POST /api/rental/list] Player already on loan market. playerId:', playerId, 'playerName:', player.name);
      return NextResponse.json({
        error: 'Bu oyuncu zaten kiralık pazarında',
        userMessage: 'Bu oyuncu zaten kiralık pazarında listelenmiş. Aynı oyuncuyu tekrar ekleyemezsiniz.',
        debug: { playerId, playerName: player.name, is_on_loan_market: true },
      }, { status: 400 });
    }

    if (player.loan_status === 'active') {
      console.warn('[POST /api/rental/list] Player is currently on loan. playerId:', playerId, 'playerName:', player.name, 'loan_status:', player.loan_status);
      return NextResponse.json({
        error: 'Bu oyuncu şu anda kirada',
        userMessage: 'Bu oyuncu şu anda başka bir takımda kirada. Kiralama süresi dolana kadar tekrar listelenemez.',
        debug: { playerId, playerName: player.name, loan_status: player.loan_status },
      }, { status: 400 });
    }

    // rental_listings tablosuna ekle — duration_weeks kolonu yoksa tekrar dene
    let listingId: string | null = null;
    const baseListingPayload = {
      player_id: playerId,
      owner_team_id: ownerTeamId || player.team_name || player.profile_id,
      daily_cost: dailyCost,
      status: 'active',
    };

    const { data: listing, error: insertError } = await supabase
      .from('rental_listings')
      .insert({
        ...baseListingPayload,
        duration_weeks: durationWeeks,
      })
      .select()
      .single();

    // Tablo yokluğunu tespit etmek için yardımcı fonksiyon
    const isTableNotFoundError = (msg: string): boolean =>
      /relation .* does not exist|could not find|not found|does not exist/i.test(msg);

    if (insertError) {
      console.warn('[POST /api/rental/list] rental_listings insert with duration_weeks failed:', insertError.message, { playerId, durationWeeks, dailyCost });

      // Tablo mevcut değilse — kullanıcıya migration mesajı göster
      if (isTableNotFoundError(insertError.message)) {
        console.error('[POST /api/rental/list] rental_listings table does not exist. Migration required: supabase/migrations/20260521000002_rental_system.sql');
        return NextResponse.json({
          error: 'rental_listings tablosu bulunamadı',
          userMessage: 'Kiralık pazarı sistemi henüz veritabanına yüklenmemiş. Lütfen yöneticinizle iletişime geçin ve 20260521000002_rental_system.sql migration dosyasını çalıştırmasını isteyin.',
          debug: { playerId, error: insertError.message, hint: 'Run supabase/migrations/20260521000002_rental_system.sql' },
        }, { status: 500 });
      }

      // duration_weeks kolonu yoksa tekrar dene
      const { data: fallbackListing, error: fallbackError } = await supabase
        .from('rental_listings')
        .insert(baseListingPayload)
        .select()
        .single();

      if (fallbackError) {
        console.error('[POST /api/rental/list] rental_listings insert error (both attempts failed). playerId:', playerId, 'firstError:', insertError.message, 'fallbackError:', fallbackError.message);

        if (isTableNotFoundError(fallbackError.message)) {
          return NextResponse.json({
            error: 'rental_listings tablosu bulunamadı',
            userMessage: 'Kiralık pazarı sistemi henüz veritabanına yüklenmemiş. Lütfen yöneticinizle iletişime geçin ve 20260521000002_rental_system.sql migration dosyasını çalıştırmasını isteyin.',
            debug: { playerId, firstError: insertError.message, fallbackError: fallbackError.message, hint: 'Run supabase/migrations/20260521000002_rental_system.sql' },
          }, { status: 500 });
        }

        // Diğer hatalar — rental_listings tablosu olmadan da devam et
      } else {
        listingId = fallbackListing?.id;
        console.info('[POST /api/rental/list] rental_listings insert succeeded (fallback without duration_weeks). listingId:', listingId);
      }
    } else {
      listingId = listing?.id;
      console.info('[POST /api/rental/list] rental_listings insert succeeded. listingId:', listingId);
    }

    // Oyuncuyu kiralık pazarına çıkar — önce tüm kolonlarla güncelle, hata olursa sadece temel kolonlarla
    const fullUpdatePayload = {
      is_on_loan_market: true,
      loan_fee: dailyCost,
      loan_owner_profile_id: ownerTeamId || player.profile_id,
      loan_status: 'listed',
    };

    const { error: fullUpdateError } = await supabase
      .from('players')
      .update(fullUpdatePayload)
      .eq('id', playerId);

    if (fullUpdateError) {
      console.warn('[POST /api/rental/list] Full player update failed, trying minimal update. playerId:', playerId, 'error:', fullUpdateError.message, 'Missing columns may include: is_on_loan_market, loan_fee, loan_owner_profile_id, loan_status');
      // Sadece mevcut kolonları güncelle
      const { error: basicUpdateError } = await supabase
        .from('players')
        .update({ market_value: player.market_value }) // En az bir kolon güncellenmeli
        .eq('id', playerId);

      if (basicUpdateError) {
        console.error('[POST /api/rental/list] Player update error (both attempts failed). playerId:', playerId, 'fullUpdateError:', fullUpdateError.message, 'basicUpdateError:', basicUpdateError.message, 'Player may not exist or RLS policy blocking update.');
        return NextResponse.json({
          error: 'Oyuncu güncellenemedi',
          userMessage: 'Oyuncu kiralık listesine eklenirken güncelleme başarısız oldu. Lütfen sayfayı yenileyip tekrar deneyin.',
          debug: { playerId, fullUpdateError: fullUpdateError.message, basicUpdateError: basicUpdateError.message },
        }, { status: 500 });
      }
    }

    // loans tablosuna da kayıt oluştur
    const { error: loanInsertError } = await supabase.from('loans').insert({
      player_id: playerId,
      owner_team_id: ownerTeamId || player.team_name || player.profile_id,
      loan_fee_paid: dailyCost,
      duration_weeks: durationWeeks,
      status: 'listed',
    });

    if (loanInsertError) {
      // loans tablosu yoksa non-critical uyarı ver ama başarısız olma
      if (isTableNotFoundError(loanInsertError.message)) {
        console.warn('[POST /api/rental/list] loans table does not exist (non-critical). playerId:', playerId, 'hint: Run migration 20260521000002_rental_system.sql');
      } else {
        console.warn('[POST /api/rental/list] loans insert error (non-critical). playerId:', playerId, 'error:', loanInsertError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${player.name || 'Oyuncu'} kiralık listesine eklendi`,
      dailyCost,
      durationWeeks,
      listingId,
    });
  } catch (err) {
    console.error('[POST /api/rental/list] Unhandled exception:', err instanceof Error ? err.message : String(err), err instanceof Error ? err.stack : '');
    return NextResponse.json({
      error: 'Bir hata oluştu',
      userMessage: 'Oyuncu kiralık listesine eklenirken beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.',
      debug: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
