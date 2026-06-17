import { getSupabase, isSupabaseConfigured } from '../supabase';
import { rpcTransferBid, rpcListPlayerOnMarket, rpcCancelListing } from '../supabaseRpc';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface MarketListing {
  id: string;
  player_id: string;
  player_data: any;
  seller_id: string;
  seller_name: string;
  price: number;
  current_bid?: number;
  highest_bidder_id?: string;
  highest_bidder_name?: string;
  min_price?: number;
  max_price?: number;
  is_active: boolean;
  created_at: string;
  // Auction fields
  expires_at?: string;            // ISO timestamp when auction ends
  bid_count?: number;             // Total number of bids
  is_auction?: boolean;           // true = auction mode, false = direct buy (free agents)
  starting_price?: number;        // Original listing price (for reference)
  reserve_price?: number;         // Minimum price seller will accept
  // BUG-2: Optimistic locking
  version?: number;               // Version counter for concurrent update detection
  held_amount?: number;           // Amount held from highest bidder
}

export interface AuctionBid {
  id: string;
  listing_id: string;
  bidder_id: string;
  bidder_name: string;
  bid_amount: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TAX_RATE = 0.025; // 2.5% Tax
const AUCTION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate an expiry ISO string that is 4 hours from now. */
function auctionExpiry(): string {
  return new Date(Date.now() + AUCTION_DURATION_MS).toISOString();
}

/**
 * Transferi tamamla: satıcıya ödeme yap, oyuncu sahipliğini değiştir, ilanı deaktif et.
 * Önce atomik RPC dener, başarısız olursa sıralı yönteme düşer (geriye uyumluluk).
 *
 * BUG-1: Artık RPC öncelikli — doğrudan tablo yazması sadece RPC kullanılamazsa yapılır.
 */
async function completeTransfer(
  supabase: ReturnType<typeof getSupabase>,
  listing: MarketListing,
  buyerId: string,
  finalPrice: number,
) {
  const taxAmount = finalPrice * TAX_RATE;
  const sellerRevenue = finalPrice - taxAmount;

  // ── Atomik transfer denemesi: rpc_transfer_buy ──
  const { data: rpcResult, error: rpcError } = await supabase!.rpc('rpc_transfer_buy', {
    p_player_id: listing.player_id,
    p_buyer_id: buyerId,
    p_buyer_team: '',
    p_transfer_fee: finalPrice,
  });

  if (!rpcError && rpcResult?.success) {
    console.info('[completeTransfer] Atomik RPC başarılı, transfer tamamlandı');
    return { taxAmount, sellerRevenue };
  }

  if (rpcError) {
    console.warn('[completeTransfer] rpc_transfer_buy RPC hatası, sıralı yönteme geçiliyor:', rpcError.message);
  } else if (rpcResult && !rpcResult.success) {
    console.warn('[completeTransfer] rpc_transfer_buy iş mantığı hatası:', rpcResult.reason);
  }

  // ── Geriye uyumluluk: Eski sıralı yöntem ──
  const { data: sellerProfile } = await supabase!
    .from('profiles')
    .select('money')
    .eq('id', listing.seller_id)
    .single();

  if (sellerProfile) {
    await supabase!
      .from('profiles')
      .update({ money: Number(sellerProfile.money) + sellerRevenue })
      .eq('id', listing.seller_id);
  }

  const { data: buyerProfile } = await supabase!
    .from('profiles')
    .select('team_name')
    .eq('id', buyerId)
    .maybeSingle();

  await supabase!
    .from('players')
    .update({
      profile_id: buyerId,
      team_name: buyerProfile?.team_name || buyerId,
    })
    .eq('id', listing.player_id);

  await supabase!
    .from('transfer_market')
    .update({ is_active: false })
    .eq('id', listing.id);

  return { taxAmount, sellerRevenue };
}

// ---------------------------------------------------------------------------
// List Player on Market
// BUG-1: rpc_list_player_on_market RPC kullanarak atomik listeleme
// ---------------------------------------------------------------------------

export const listPlayerOnMarket = async (
  player: any,
  sellerId: string,
  sellerName: string,
  price: number,
  minPrice?: number,
  maxPrice?: number,
) => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const supabase = getSupabase();

  // BUG-1: RPC ile atomik listeleme dene
  let rpcResult: any;
  let rpcError: any;
  try {
    rpcResult = await rpcListPlayerOnMarket(
      sellerId,
      player.id,
      price,
      minPrice ?? Math.round(price * 0.8),
      maxPrice ?? Math.round(price * 1.5),
      sellerName,
    );
  } catch (err: any) {
    rpcError = err;
  }

  if (!rpcError && rpcResult?.success) {
    return { success: true, listing_id: rpcResult.listing_id };
  }

  if (rpcError) {
    console.warn('[listPlayerOnMarket] RPC hatası, geriye uyumluluk:', rpcError.message);
  } else if (rpcResult && !rpcResult.success) {
    return { success: false, error: rpcResult.reason || 'Listeleme başarısız' };
  }

  // Geriye uyumluluk: doğrudan insert
  const isAuction = sellerId !== 'free-agent-system';

  const insertPayload: Record<string, any> = {
    player_id: player.id,
    player_data: player,
    seller_id: sellerId,
    seller_name: sellerName,
    price,
    min_price: minPrice ?? Math.round(price * 0.8),
    max_price: maxPrice ?? Math.round(price * 1.5),
    is_active: true,
    is_auction: isAuction,
    starting_price: price,
    reserve_price: minPrice ?? Math.round(price * 0.8),
    bid_count: 0,
    version: 1,
  };

  if (isAuction) {
    insertPayload.expires_at = auctionExpiry();
  }

  const { error } = await supabase.from('transfer_market').insert(insertPayload);

  if (error) return { success: false, error: error.message };
  return { success: true };
};

// ---------------------------------------------------------------------------
// Buy Player from Market (non-auction / free-agent direct purchase)
// ---------------------------------------------------------------------------

export const buyPlayerFromMarket = async (listingId: string, buyerId: string, buyerTeam: string) => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const supabase = getSupabase()!;

  // ── Atomik transfer: rpc_market_buy ile dene (race condition önler) ──
  const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_market_buy', {
    p_listing_id: listingId,
    p_buyer_id: buyerId,
    p_buyer_team: buyerTeam,
  });

  if (!rpcError && rpcResult?.success) {
    return {
      success: true,
      player: null,
      price: rpcResult.price,
      taxAmount: rpcResult.tax_amount,
      sellerRevenue: rpcResult.seller_revenue,
      playerId: rpcResult.player_id,
    };
  }

  if (rpcError) {
    console.warn('[buyPlayerFromMarket] rpc_market_buy RPC hatası, sıralı yönteme geçiliyor:', rpcError.message);
  } else if (rpcResult && !rpcResult.success) {
    return { success: false, error: rpcResult.reason || 'Transfer başarısız' };
  }

  // ── Geriye uyumluluk: Eski sıralı yöntem ──
  const { data: listing, error: fetchError } = await supabase
    .from('transfer_market')
    .select('*')
    .eq('id', listingId)
    .single();

  if (fetchError || !listing) return { success: false, error: 'Listing not found' };

  if (listing.is_auction) {
    return { success: false, error: 'This is an auction listing. Use placeBid instead.' };
  }

  const taxAmount = (listing.asking_price || listing.price) * TAX_RATE;
  const sellerRevenue = (listing.asking_price || listing.price) - taxAmount;

  const { data: sellerProfile } = await supabase
    .from('profiles')
    .select('money')
    .eq('id', listing.seller_id)
    .single();

  if (sellerProfile) {
    await supabase
      .from('profiles')
      .update({ money: Number(sellerProfile.money) + sellerRevenue })
      .eq('id', listing.seller_id);
  }

  await supabase
    .from('players')
    .update({
      profile_id: buyerId,
      team_name: buyerTeam,
    })
    .eq('id', listing.player_id);

  await supabase.from('transfer_market').update({ is_active: false }).eq('id', listingId);

  return {
    success: true,
    player: listing.player_data,
    price: listing.asking_price || listing.price,
    taxAmount,
    sellerRevenue,
  };
};

// ---------------------------------------------------------------------------
// Place Bid on Auction
// BUG-2: rpc_transfer_bid ile atomik + version kontrolü
// ---------------------------------------------------------------------------

export const placeBid = async (
  listingId: string,
  bidderId: string,
  bidderName: string,
  bidAmount: number,
) => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const supabase = getSupabase();

  // 1. Fetch the listing (version dahil)
  const { data: listing, error: fetchError } = await supabase
    .from('transfer_market')
    .select('*')
    .eq('id', listingId)
    .single();

  if (fetchError || !listing) return { success: false, error: 'Listing not found' };
  if (!listing.is_active) return { success: false, error: 'Listing is no longer active' };
  if (!listing.is_auction) return { success: false, error: 'This is not an auction listing' };

  const currentHigh = listing.current_bid ?? (listing.asking_price || listing.price);
  if (bidAmount <= currentHigh) {
    return { success: false, error: `Bid must be higher than the current highest bid (${currentHigh.toLocaleString()})` };
  }

  if (listing.max_price && bidAmount > listing.max_price) {
    return { success: false, error: `Bid exceeds the maximum allowed price (${listing.max_price.toLocaleString()})` };
  }

  if (bidderId === listing.seller_id) {
    return { success: false, error: 'You cannot bid on your own listing' };
  }

  // BUG-2: RPC ile atomik teklif ver (version kontrolü dahil)
  const currentVersion = listing.version || 1;
  let rpcResult: any;
  let rpcError: any;
  try {
    rpcResult = await rpcTransferBid(
      listingId,
      bidderId,
      bidderName,
      bidAmount,
      currentVersion,
    );
  } catch (err: any) {
    rpcError = err;
  }

  if (!rpcError && rpcResult?.success) {
    const autoWin = rpcResult.auto_win || (listing.max_price && bidAmount >= listing.max_price);

    if (autoWin) {
      // Transfer tamamlandı — player_data'yı getir
      return {
        success: true,
        autoWin: true,
        player: listing.player_data,
        price: bidAmount,
      };
    }

    return { success: true, autoWin: false };
  }

  // Conflict detected (version mismatch)
  if (rpcResult?.conflict) {
    return { success: false, error: 'İlan güncellendi, lütfen sayfayı yenileyip tekrar deneyin', conflict: true };
  }

  if (rpcError) {
    console.warn('[placeBid] rpc_transfer_bid RPC hatası, sıralı yönteme geçiliyor:', rpcError.message);
  } else if (rpcResult && !rpcResult.success) {
    return { success: false, error: rpcResult.reason || 'Teklif başarısız' };
  }

  // ── Geriye uyumluluk: Eski sıralı yöntem (RPC yoksa) ──
  const { data: bidderProfile } = await supabase
    .from('profiles')
    .select('money')
    .eq('id', bidderId)
    .single();

  const prevHeldAmount = listing.held_amount || 0;
  const prevBidderId = listing.highest_bidder_id;
  const availableMoney = Number(bidderProfile?.money || 0);

  if (!bidderProfile || availableMoney < bidAmount) {
    return { success: false, error: 'Insufficient funds' };
  }

  if (prevBidderId && prevHeldAmount > 0) {
    try {
      const { data: prevBidder } = await supabase
        .from('profiles')
        .select('money')
        .eq('id', prevBidderId)
        .maybeSingle();
      if (prevBidder) {
        await supabase
          .from('profiles')
          .update({ money: Number(prevBidder.money) + prevHeldAmount })
          .eq('id', prevBidderId);
      }
    } catch (e) {
      console.warn('[placeBid] Previous bidder refund failed:', e);
    }
  }

  await supabase
    .from('profiles')
    .update({ money: availableMoney - bidAmount })
    .eq('id', bidderId);

  const newBidCount = (listing.bid_count ?? 0) + 1;
  const newExpiry = auctionExpiry();

  const { error: updateError } = await supabase
    .from('transfer_market')
    .update({
      current_bid: bidAmount,
      highest_bidder_id: bidderId,
      highest_bidder_name: bidderName,
      bid_count: newBidCount,
      expires_at: newExpiry,
      held_amount: bidAmount,
      version: (listing.version || 1) + 1,
    })
    .eq('id', listingId);

  if (updateError) {
    await supabase
      .from('profiles')
      .update({ money: availableMoney })
      .eq('id', bidderId);
    return { success: false, error: updateError.message };
  }

  try {
    await supabase.from('auction_bids').insert({
      listing_id: listingId,
      bidder_id: bidderId,
      bidder_name: bidderName,
      bid_amount: bidAmount,
    });
  } catch {
    // auction_bids table may not exist — non-critical
  }

  let autoWin = false;
  if (listing.max_price && bidAmount >= listing.max_price) {
    autoWin = true;
    await supabase
      .from('transfer_market')
      .update({ held_amount: 0 })
      .eq('id', listingId);
    await completeTransfer(supabase, { ...listing, current_bid: bidAmount } as MarketListing, bidderId, bidAmount);
  }

  return {
    success: true,
    autoWin,
    ...(autoWin ? { player: listing.player_data, price: bidAmount } : {}),
  };
};

// ---------------------------------------------------------------------------
// Cancel Auction
// BUG-1: RPC ile atomik iptal
// ---------------------------------------------------------------------------

export const cancelAuction = async (listingId: string, sellerId: string) => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const supabase = getSupabase();

  // BUG-1: RPC dene
  let rpcResult: any;
  let rpcError: any;
  try {
    rpcResult = await rpcCancelListing(sellerId, listingId);
  } catch (err: any) {
    rpcError = err;
  }

  if (!rpcError && rpcResult?.success) {
    return { success: true };
  }

  if (rpcResult && !rpcResult.success && !rpcError) {
    return { success: false, error: rpcResult.reason || 'İptal başarısız' };
  }

  if (rpcError) {
    console.warn('[cancelAuction] RPC hatası, sıralı yönteme geçiliyor:', rpcError.message);
  }

  // Geriye uyumluluk: doğrudan güncelleme
  const { data: listing, error: fetchError } = await supabase
    .from('transfer_market')
    .select('*')
    .eq('id', listingId)
    .single();

  if (fetchError || !listing) return { success: false, error: 'Listing not found' };
  if (listing.seller_id !== sellerId) return { success: false, error: 'Only the seller can cancel this auction' };
  if ((listing.bid_count ?? 0) > 0) return { success: false, error: 'Cannot cancel — auction already has bids' };

  const { error: updateError } = await supabase
    .from('transfer_market')
    .update({ is_active: false })
    .eq('id', listingId);

  if (updateError) return { success: false, error: updateError.message };
  return { success: true };
};

// ---------------------------------------------------------------------------
// Get Auction Bids
// ---------------------------------------------------------------------------

export const getAuctionBids = async (listingId: string): Promise<AuctionBid[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('auction_bids')
      .select('*')
      .eq('listing_id', listingId)
      .order('bid_amount', { ascending: false });

    if (error) return [];
    return (data as AuctionBid[]) ?? [];
  } catch {
    return [];
  }
};

// ---------------------------------------------------------------------------
// Resolve Expired Auctions
// ---------------------------------------------------------------------------

/** @deprecated Kullanma. Cron auction-cleanup kullanıyor. */
export const resolveExpiredAuctions = async () => {
  if (!isSupabaseConfigured()) return { resolved: 0 };
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data: expiredListings, error } = await supabase
    .from('transfer_market')
    .select('*')
    .eq('is_active', true)
    .eq('is_auction', true)
    .lt('expires_at', now);

  if (error || !expiredListings?.length) return { resolved: 0 };

  let resolved = 0;
  const SIGNING_DEADLINE_HOURS = 24;
  const PENALTY_RATE = 0.05;

  for (const listing of expiredListings) {
    const { data: lockResult, error: lockError } = await supabase
      .from('transfer_market')
      .update({ is_active: false })
      .eq('id', listing.id)
      .eq('is_active', true)
      .select('id');

    if (lockError || !lockResult || lockResult.length === 0) {
      continue;
    }

    const reserveThreshold = listing.reserve_price ?? listing.min_price ?? 0;
    const currentBid = listing.current_bid ?? 0;
    const hasValidBid = currentBid >= reserveThreshold && listing.highest_bidder_id;

    if (hasValidBid) {
      const { data: playerData } = await supabase
        .from('players')
        .select('profile_id')
        .eq('id', listing.player_id)
        .maybeSingle();

      const isSigned = playerData?.profile_id === listing.highest_bidder_id;

      if (isSigned) {
        resolved++;
      } else {
        const auctionEnd = new Date(listing.expires_at);
        const penaltyDeadline = new Date(auctionEnd.getTime() + SIGNING_DEADLINE_HOURS * 60 * 60 * 1000);
        const isPastDeadline = new Date() > penaltyDeadline;

        if (isPastDeadline) {
          const penaltyAmount = Math.round(currentBid * PENALTY_RATE);

          const { data: winnerProfile } = await supabase
            .from('profiles')
            .select('money')
            .eq('id', listing.highest_bidder_id)
            .maybeSingle();

          if (winnerProfile) {
            await supabase
              .from('profiles')
              .update({ money: Math.max(0, Number(winnerProfile.money) - penaltyAmount) })
              .eq('id', listing.highest_bidder_id);

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

          if (listing.seller_id && listing.seller_id !== 'free-agent-system') {
            const newExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            await supabase
              .from('transfer_market')
              .update({
                is_active: true,
                current_bid: null,
                highest_bidder_id: null,
                highest_bidder_name: null,
                bid_count: 0,
                expires_at: newExpiry.toISOString(),
                version: (listing.version || 1) + 1,
              })
              .eq('id', listing.id);
          }
          resolved++;
        } else {
          await supabase
            .from('transfer_market')
            .update({ is_active: true })
            .eq('id', listing.id);
        }
      }
    } else {
      resolved++;
    }
  }

  return { resolved };
};

// ---------------------------------------------------------------------------
// Get Market Listings
// ---------------------------------------------------------------------------

export const getMarketListings = async (): Promise<MarketListing[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabase();

  const { data } = await supabase
    .from('transfer_market')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  let listings: MarketListing[] = (data ?? []) as MarketListing[];

  if (listings.length > 0) {
    const playerIds = listings.map(l => l.player_id).filter(Boolean);
    if (playerIds.length > 0) {
      const { data: ownedPlayers } = await supabase
        .from('players')
        .select('id')
        .in('id', playerIds)
        .not('profile_id', 'is', null);

      const ownedIds = new Set((ownedPlayers || []).map((p: { id: string }) => p.id));

      if (ownedIds.size > 0) {
        const ownedListingIds = listings
          .filter(l => ownedIds.has(l.player_id))
          .map(l => l.id);

        if (ownedListingIds.length > 0) {
          await supabase
            .from('transfer_market')
            .update({ is_active: false })
            .in('id', ownedListingIds);
        }

        listings = listings.filter(l => !ownedIds.has(l.player_id));
      }
    }
  }

  const now = new Date();

  return listings.map((l) => ({
    ...l,
    expired: l.is_auction && l.expires_at ? new Date(l.expires_at) < now : false,
  }));
};

// ---------------------------------------------------------------------------
// Get My Auctions
// ---------------------------------------------------------------------------

export const getMyAuctions = async (sellerId: string): Promise<MarketListing[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabase();

  const { data } = await supabase
    .from('transfer_market')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  return (data as MarketListing[]) ?? [];
};

// ---------------------------------------------------------------------------
// Mass List Players
// ---------------------------------------------------------------------------

export const massListPlayers = async (players: any[], sellerId: string, sellerName: string) => {
  for (const p of players) {
    await listPlayerOnMarket(p, sellerId, sellerName, p.market_value);
  }
  return { success: true, total: players.length };
};

// ---------------------------------------------------------------------------
// Init Free Agents on Market
// ---------------------------------------------------------------------------

import { generatePlayer } from './playerGenerator';

export const initFreeAgentsOnMarket = async () => {
  if (!isSupabaseConfigured()) return { success: false };
  const supabase = getSupabase();

  const { count } = await supabase
    .from('transfer_market')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', 'free-agent-system')
    .eq('is_active', true);

  if (count !== null && count >= 150) return { success: true, count };

  const needed = 150 - (count || 0);
  const players: any[] = [];

  for (let i = 0; i < needed; i++) {
    const pos = (['GK', 'DEF', 'MID', 'FWD'] as const)[Math.floor(Math.random() * 4)];
    const p = generatePlayer(pos);
    players.push({
      player_id: p.id,
      player_data: p,
      seller_id: 'free-agent-system',
      seller_name: 'SERBEST OYUNCU',
      price: p.market_value,
      min_price: Math.round(p.market_value * 0.8),
      max_price: Math.round(p.market_value * 1.5),
      is_active: true,
      is_auction: false,
      starting_price: p.market_value,
      reserve_price: Math.round(p.market_value * 0.8),
      bid_count: 0,
      version: 1,
    });
  }

  const CHUNK_SIZE = 50;
  for (let i = 0; i < players.length; i += CHUNK_SIZE) {
    const chunk = players.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase.from('transfer_market').insert(chunk);
    if (error) {
      console.error('Error seeding free agents chunk:', error);
      return { success: false, error: error.message };
    }
  }

  return { success: true, count: 150 };
};

// ---------------------------------------------------------------------------
// Team Management & Leaderboard
// ---------------------------------------------------------------------------

export const moveTeamToMarket = async (teamId: string, profileId: string, teamName: string) => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const supabase = getSupabase();

  try {
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('*')
      .eq('profile_id', teamId);

    if (fetchError) return { success: false, error: fetchError.message };
    if (!players || players.length === 0) return { success: true, moved: 0 };

    let moved = 0;
    for (const p of players) {
      const { error: insertError } = await supabase.from('transfer_market').insert({
        player_id: p.id,
        player_data: p,
        seller_id: profileId,
        seller_name: teamName,
        price: p.market_value ?? 0,
        min_price: Math.round((p.market_value ?? 0) * 0.8),
        max_price: Math.round((p.market_value ?? 0) * 1.5),
        is_active: true,
        is_auction: true,
        starting_price: p.market_value ?? 0,
        reserve_price: Math.round((p.market_value ?? 0) * 0.8),
        bid_count: 0,
        expires_at: auctionExpiry(),
        version: 1,
      });
      if (!insertError) moved++;
    }

    const { error: deleteError } = await supabase
      .from('players')
      .delete()
      .eq('profile_id', teamId);

    if (deleteError) {
      console.error('Error deleting players after market move:', deleteError);
    }

    return { success: true, moved };
  } catch (err) {
    console.error('moveTeamToMarket error:', err);
    return { success: false, error: 'Unexpected error' };
  }
};

export const listAllSquadOnMarket = async (players: any[], profileId: string, teamName: string) => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured', total: 0 };

  try {
    const result = await massListPlayers(players, profileId, teamName);
    return result;
  } catch (err) {
    console.error('listAllSquadOnMarket error:', err);
    return { success: false, error: 'Unexpected error', total: 0 };
  }
};

export const getGlobalLeaderboard = async () => {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        manager_name,
        team_name,
        reputation,
        level,
        fans,
        money,
        league_name,
        league_tier,
        current_day
      `)
      .order('reputation', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    const enhancedData = await Promise.all(data.map(async (profile) => {
      try {
        const { count: champCount } = await supabase
          .from('season_awards')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profile.id)
          .eq('award_type', 'champion');

        const { count: totalAwards } = await supabase
          .from('season_awards')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profile.id);

        return {
          ...profile,
          championship_count: champCount || 0,
          total_awards: totalAwards || 0,
        };
      } catch {
        return { ...profile, championship_count: 0, total_awards: 0 };
      }
    }));

    return enhancedData;
  } catch {
    return [];
  }
};

export const assignTeamToManager = async (managerId: string, teamId: string) => {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabase();

  try {
    await supabase
      .from('profiles')
      .update({ team_id: teamId })
      .eq('id', managerId);
  } catch (err) {
    console.error('assignTeamToManager error:', err);
  }
};

export const getTeamSquad = async (teamId: string) => {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('profile_id', teamId);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
};
