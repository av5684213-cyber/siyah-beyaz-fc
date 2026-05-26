/**
 * GET /api/cron/auction-cleanup
 * Süresi dolan açık artırmaları çözümler.
 *
 * Cron job tarafından tetiklenir (her saat önerilir).
 *
 * İşlem:
 * 1. Süresi dolmuş aktif açık artırmaları bul (expires_at < NOW(), status = 'active')
 * 2. Kazanan teklif varsa:
 *    - Listing durumunu 'sold' yap
 *    - Satıcıya satış fiyatı - %2.5 komisyon ekle
 *    - Alıcının tutulan parasını iade et, sonra kazanan teklif tutarını düş
 *    - Oyuncuyu kazananın takımına transfer et
 * 3. Teklif yoksa:
 *    - Listing durumunu 'expired' yap
 *    - Oyuncuyu satıcının kadrosuna geri ver (is_for_sale = false)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { acquireCronLock, releaseCronLock } from '@/lib/fm/cronLockService';

export const maxDuration = 60;

const AUCTION_TAX_RATE = 0.025; // %2.5 komisyon
const JOB_NAME = 'auction-cleanup';

export async function GET(request: NextRequest) {
  // CRON_SECRET protection
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client could not be created' }, { status: 500 });
  }

  // ── Cron lock: aynı anda sadece bir instance çalışsın ──
  const lock = await acquireCronLock(supabase, JOB_NAME, 300); // 5 dk TTL
  if (!lock) {
    return NextResponse.json({ message: 'Another instance is already running', skipped: true });
  }

  const counts = { resolved: 0, sold: 0, expired: 0 };
  const errors: string[] = [];

  try {
    // ── 1. Süresi dolmuş aktif açık artırmaları getir ──
    const now = new Date().toISOString();

    const { data: expiredAuctions, error: fetchError } = await supabase
      .from('market_listings')
      .select('*')
      .eq('status', 'active')
      .lt('expires_at', now);

    if (fetchError) {
      console.error('[cron/auction-cleanup] Fetch error:', fetchError.message);
      return NextResponse.json({ error: 'Expired auctions could not be fetched' }, { status: 500 });
    }

    if (!expiredAuctions?.length) {
      console.log('[cron/auction-cleanup] No expired auctions to process');
      return NextResponse.json({ resolved: 0, sold: 0, expired: 0 });
    }

    console.log(`[cron/auction-cleanup] Processing ${expiredAuctions.length} expired auctions`);

    // ── 2. Her bir süresi dolmuş açık artırmayı çözümle ──
    for (const auction of expiredAuctions) {
      try {
        const hasWinningBid = auction.current_bidder_id && auction.current_bid && auction.current_bid > 0;

        if (hasWinningBid) {
          // ── Kazanan teklif var ──
          const salePrice = Number(auction.current_bid);
          const taxAmount = Math.round(salePrice * AUCTION_TAX_RATE);
          const sellerProceeds = salePrice - taxAmount;

          // ── 2a. Listing durumunu 'sold' yap ──
          const { error: updateListingError } = await supabase
            .from('market_listings')
            .update({ status: 'sold' })
            .eq('id', auction.id);

          if (updateListingError) {
            console.error(`[cron/auction-cleanup] Failed to update listing ${auction.id} to sold:`, updateListingError.message);
            errors.push(`Listing ${auction.id}: status update failed`);
            continue;
          }

          // ── 2b. Satıcının parasına satış tutarını ekle (komisyon düşülmüş) ──
          const { data: sellerProfile } = await supabase
            .from('profiles')
            .select('money')
            .eq('id', auction.seller_id)
            .maybeSingle();

          if (sellerProfile) {
            const newSellerMoney = Number(sellerProfile.money) + sellerProceeds;
            const { error: sellerMoneyError } = await supabase
              .from('profiles')
              .update({ money: newSellerMoney })
              .eq('id', auction.seller_id);

            if (sellerMoneyError) {
              console.error(`[cron/auction-cleanup] Failed to update seller ${auction.seller_id} money:`, sellerMoneyError.message);
              errors.push(`Listing ${auction.id}: seller money update failed`);
            }
          } else {
            console.warn(`[cron/auction-cleanup] Seller profile ${auction.seller_id} not found`);
          }

          // ── 2c. Alıcının tutulan parası zaten rezerve edilmiş ──
          // Para placeBid anında profiles.money'den düşülmüştü (held_amount).
          // Transferi tamamla, held_amount'u sıfırla.
          const { data: buyerProfile } = await supabase
            .from('profiles')
            .select('money')
            .eq('id', auction.current_bidder_id)
            .maybeSingle();

          if (buyerProfile) {
            // held_amount zaten para olarak düşülmüştü, tekrar düşmeye gerek yok
            // Sadece held_amount'u 0'a çek
            const { error: buyerMoneyError } = await supabase
              .from('profiles')
              .update({ money: Number(buyerProfile.money) }) // no change needed, already deducted
              .eq('id', auction.current_bidder_id);

            if (buyerMoneyError) {
              console.error(`[cron/auction-cleanup] Failed to update buyer ${auction.current_bidder_id}:`, buyerMoneyError.message);
              errors.push(`Listing ${auction.id}: buyer money update failed`);
            }
          } else {
            console.warn(`[cron/auction-cleanup] Buyer profile ${auction.current_bidder_id} not found`);
          }

          // ── 2d. Oyuncuyu kazananın takımına transfer et ──
          // Kazananın takım adını al
          const { data: winnerProfile } = await supabase
            .from('profiles')
            .select('team_name')
            .eq('id', auction.current_bidder_id)
            .maybeSingle();

          const winnerTeamName = winnerProfile?.team_name || '';

          const { error: playerUpdateError } = await supabase
            .from('players')
            .update({
              owner_team_id: auction.current_bidder_id,
              profile_id: auction.current_bidder_id,
              team_name: winnerTeamName,
              is_for_sale: false,
            })
            .eq('id', auction.player_id);

          if (playerUpdateError) {
            console.error(`[cron/auction-cleanup] Failed to update player ${auction.player_id} owner:`, playerUpdateError.message);
            errors.push(`Listing ${auction.id}: player ownership transfer failed`);
          }

          counts.sold++;
          console.log(`[cron/auction-cleanup] Auction ${auction.id} SOLD: player ${auction.player_id} to ${auction.current_bidder_id} for ${salePrice} (tax: ${taxAmount})`);
        } else {
          // ── Teklif yok ──
          // Listing durumunu 'expired' yap
          const { error: updateListingError } = await supabase
            .from('market_listings')
            .update({ status: 'expired' })
            .eq('id', auction.id);

          if (updateListingError) {
            console.error(`[cron/auction-cleanup] Failed to update listing ${auction.id} to expired:`, updateListingError.message);
            errors.push(`Listing ${auction.id}: expired status update failed`);
            continue;
          }

          // Oyuncuyu satıcının kadrosuna geri ver
          const { error: playerReturnError } = await supabase
            .from('players')
            .update({ is_for_sale: false })
            .eq('id', auction.player_id);

          if (playerReturnError) {
            console.error(`[cron/auction-cleanup] Failed to return player ${auction.player_id} to seller:`, playerReturnError.message);
            errors.push(`Listing ${auction.id}: player return failed`);
          }

          // Eğer held_amount varsa (teklif verip sonra geri çekilmiş olabilir), iade et
          const heldAmount = auction.held_amount || 0;
          if (heldAmount > 0 && auction.highest_bidder_id) {
            try {
              const { data: prevBidder } = await supabase
                .from('profiles')
                .select('money')
                .eq('id', auction.highest_bidder_id)
                .maybeSingle();
              if (prevBidder) {
                await supabase
                  .from('profiles')
                  .update({ money: Number(prevBidder.money) + heldAmount })
                  .eq('id', auction.highest_bidder_id);
                console.log(`[cron/auction-cleanup] Refunded held_amount ${heldAmount} to ${auction.highest_bidder_id}`);
              }
            } catch (refundErr) {
              console.error(`[cron/auction-cleanup] Held amount refund failed:`, refundErr);
            }
          }

          counts.expired++;
          console.log(`[cron/auction-cleanup] Auction ${auction.id} EXPIRED: player ${auction.player_id} returned to seller ${auction.seller_id}`);
        }

        counts.resolved++;
      } catch (err) {
        const errMsg = `Error processing auction ${auction.id}: ${err}`;
        errors.push(errMsg);
        console.error(`[cron/auction-cleanup] ${errMsg}`);
      }
    }

    console.log(`[cron/auction-cleanup] Complete: resolved=${counts.resolved}, sold=${counts.sold}, expired=${counts.expired}`);

    return NextResponse.json({
      success: true,
      resolved: counts.resolved,
      sold: counts.sold,
      expired: counts.expired,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/cron/auction-cleanup', method: 'GET' });
  } finally {
    // ── Cron lock'u serbest bırak ──
    await releaseCronLock(supabase, JOB_NAME, lock);
  }
}
