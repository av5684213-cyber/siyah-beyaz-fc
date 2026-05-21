/**
 * POST /api/market/expire
 * Süresi dolan açık artırmaları kontrol eder ve tazminat sistemini işler.
 *
 * Cron job tarafından tetiklenir (her saat).
 *
 * İşlem:
 * 1. Süresi dolmuş, kazananı olan ama imzalanmamış açık artırmaları bul
 * 2. İmzalama süresi (24 saat) geçmişse:
 *    - Kazananın teklifinin %5'ini satıcıya tazminat olarak öde
 *    - Oyuncuyu tekrar pazara çıkar (veya serbest bırak)
 *    - Listing'i deaktif et
 * 3. İmzalama süresi henüz geçmemişse atla
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const PENALTY_RATE = 0.05; // Teklifin %5'i tazminat
const SIGNING_DEADLINE_HOURS = 24;

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase istemcisi oluşturulamadı' }, { status: 500 });
  }

  try {
    const now = new Date();
    const results: { processed: number; penalties: number; completed: number; expired: number } = {
      processed: 0,
      penalties: 0,
      completed: 0,
      expired: 0,
    };

    // ── 1. Süresi dolmuş açık artırmaları getir ──
    const { data: expiredListings, error } = await supabase
      .from('transfer_market')
      .select('*')
      .eq('is_active', true)
      .eq('is_auction', true)
      .lt('expires_at', now.toISOString());

    if (error) {
      console.error('[POST /api/market/expire] Fetch error:', error.message);
      return NextResponse.json({ error: 'Açık artırmalar yüklenemedi' }, { status: 500 });
    }

    if (!expiredListings?.length) {
      return NextResponse.json({ message: 'İşlenecek süresi dolmuş açık artırma yok', results });
    }

    for (const listing of expiredListings) {
      results.processed++;

      const reserveThreshold = listing.reserve_price ?? listing.min_price ?? 0;
      const currentBid = listing.current_bid ?? 0;
      const hasValidBid = currentBid >= reserveThreshold && listing.highest_bidder_id;

      if (!hasValidBid) {
        // ── Geçerli teklif yok → listing'i deaktif et ──
        await supabase
          .from('transfer_market')
          .update({ is_active: false })
          .eq('id', listing.id);
        results.expired++;
        continue;
      }

      // ── Geçerli teklif var → İmzalama süresini kontrol et ──
      // Kazanan deadline: auction expires_at + 24 saat
      const auctionEnd = new Date(listing.expires_at);
      const signingDeadline = new Date(auctionEnd.getTime() + SIGNING_DEADLINE_HOURS * 60 * 60 * 1000);

      // İmzalanmış mı kontrol et (oyuncunun profile_id'si kazananın mı?)
      const { data: playerData } = await supabase
        .from('players')
        .select('profile_id')
        .eq('id', listing.player_id)
        .maybeSingle();

      const isSigned = playerData?.profile_id === listing.highest_bidder_id;

      if (isSigned) {
        // ── Kazanan imzalamış → listing deaktif ──
        await supabase
          .from('transfer_market')
          .update({ is_active: false })
          .eq('id', listing.id);
        results.completed++;
        continue;
      }

      // ── Henüz imzalamamış ──
      if (now < signingDeadline) {
        // Deadline henüz geçmemiş — bekle
        continue;
      }

      // ── Deadline geçmiş → Tazminat sistemi devreye girer ──
      const penaltyAmount = Math.round(currentBid * PENALTY_RATE);

      // Kazananın bakiyesinden tazminatı düş
      const { data: winnerProfile } = await supabase
        .from('profiles')
        .select('money')
        .eq('id', listing.highest_bidder_id)
        .maybeSingle();

      if (winnerProfile) {
        const newWinnerMoney = Math.max(0, Number(winnerProfile.money) - penaltyAmount);
        await supabase
          .from('profiles')
          .update({ money: newWinnerMoney })
          .eq('id', listing.highest_bidder_id);

        // Satıcıya tazminatı ekle
        const { data: sellerProfile } = await supabase
          .from('profiles')
          .select('money')
          .eq('id', listing.seller_id)
          .maybeSingle();

        if (sellerProfile) {
          await supabase
            .from('profiles')
            .update({ money: Number(sellerProfile.money) + penaltyAmount })
            .eq('id', listing.seller_id);
        }
      }

      // Oyuncuyu tekrar pazara çıkar (veya takıma geri ver)
      // Eğer seller_id gerçek bir kullanıcıysa → tekrar listele
      // Eğer free-agent-system ise → sadece deaktif et (zaten serbest)
      if (listing.seller_id && listing.seller_id !== 'free-agent-system') {
        // Yeni açık artırma olarak tekrar listele (3 gün)
        const newExpiry = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        await supabase
          .from('transfer_market')
          .update({
            is_active: true,
            is_auction: true,
            current_bid: null,
            highest_bidder_id: null,
            highest_bidder_name: null,
            bid_count: 0,
            expires_at: newExpiry.toISOString(),
            price: listing.min_price || listing.price,
          })
          .eq('id', listing.id);
      } else {
        // Serbest oyuncu → deaktif et, oyuncu zaten serbest kalacak
        await supabase
          .from('transfer_market')
          .update({ is_active: false })
          .eq('id', listing.id);
      }

      results.penalties++;
    }

    return NextResponse.json({
      message: 'Açık artırma tazminat kontrolü tamamlandı',
      results,
    });
  } catch (err) {
    console.error('[POST /api/market/expire] Exception:', err);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
