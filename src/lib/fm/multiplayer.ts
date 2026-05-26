import { getSupabase, isSupabaseConfigured } from '../supabase';

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

/** Complete a transfer: update seller money, player ownership, deactivate listing. */
async function completeTransfer(
  supabase: ReturnType<typeof getSupabase>,
  listing: MarketListing,
  buyerId: string,
  finalPrice: number,
) {
  const taxAmount = finalPrice * TAX_RATE;
  const sellerRevenue = finalPrice - taxAmount;

  // Credit seller
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

  // Transfer player ownership
  // Alıcının takım adını da güncelle (buyPlayerFromMarket ile tutarlı)
  const { data: buyerProfile } = await supabase
    .from('profiles')
    .select('team_name')
    .eq('id', buyerId)
    .maybeSingle();

  await supabase
    .from('players')
    .update({
      profile_id: buyerId,
      team_name: buyerProfile?.team_name || buyerId,
    })
    .eq('id', listing.player_id);

  // Deactivate listing
  await supabase
    .from('transfer_market')
    .update({ is_active: false })
    .eq('id', listing.id);

  return { taxAmount, sellerRevenue };
}

// ---------------------------------------------------------------------------
// List Player on Market
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

  // Determine auction vs direct-buy mode
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
  };

  // Auctions get a 4-hour expiry; free agents do not
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
  const supabase = getSupabase();

  // 1. Fetch listing
  const { data: listing, error: fetchError } = await supabase
    .from('transfer_market')
    .select('*')
    .eq('id', listingId)
    .single();

  if (fetchError || !listing) return { success: false, error: 'Listing not found' };

  // 2. Auction items must go through placeBid
  if (listing.is_auction) {
    return { success: false, error: 'This is an auction listing. Use placeBid instead.' };
  }

  // 3. Calculate tax and revenue
  const taxAmount = listing.price * TAX_RATE;
  const sellerRevenue = listing.price - taxAmount;

  // 4. Update seller's money
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

  // 5. Update player ownership
  await supabase
    .from('players')
    .update({
      profile_id: buyerId,
      team_name: buyerTeam,
    })
    .eq('id', listing.player_id);

  // 6. Deactivate listing
  await supabase.from('transfer_market').update({ is_active: false }).eq('id', listingId);

  return {
    success: true,
    player: listing.player_data,
    price: listing.price,
    taxAmount,
    sellerRevenue,
  };
};

// ---------------------------------------------------------------------------
// Place Bid on Auction
// ---------------------------------------------------------------------------

export const placeBid = async (
  listingId: string,
  bidderId: string,
  bidderName: string,
  bidAmount: number,
) => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const supabase = getSupabase();

  // 1. Fetch the listing
  const { data: listing, error: fetchError } = await supabase
    .from('transfer_market')
    .select('*')
    .eq('id', listingId)
    .single();

  if (fetchError || !listing) return { success: false, error: 'Listing not found' };

  // 2. Must be active auction
  if (!listing.is_active) return { success: false, error: 'Listing is no longer active' };
  if (!listing.is_auction) return { success: false, error: 'This is not an auction listing' };

  // 3. Bid must exceed current highest bid (or listing price if no bids)
  const currentHigh = listing.current_bid ?? listing.price;
  if (bidAmount <= currentHigh) {
    return { success: false, error: `Bid must be higher than the current highest bid (${currentHigh.toLocaleString()})` };
  }

  // 4. Bid must not exceed max_price (auto-buy cap)
  if (listing.max_price && bidAmount > listing.max_price) {
    return { success: false, error: `Bid exceeds the maximum allowed price (${listing.max_price.toLocaleString()})` };
  }

  // 5. Bidder cannot be the seller
  if (bidderId === listing.seller_id) {
    return { success: false, error: 'You cannot bid on your own listing' };
  }

  // 6. Check bidder has enough money (mevcut tutulan parayı da hesaba kat)
  const { data: bidderProfile } = await supabase
    .from('profiles')
    .select('money')
    .eq('id', bidderId)
    .single();

  // Mevcut en yüksek teklif sahibinin held_amount'unu iade et
  const prevHeldAmount = listing.held_amount || 0;
  const prevBidderId = listing.highest_bidder_id;
  const availableMoney = Number(bidderProfile?.money || 0);

  if (!bidderProfile || availableMoney < bidAmount) {
    return { success: false, error: 'Insufficient funds' };
  }

  // 7. Yeni teklif sahibinin parasını rezerve et (held_amount)
  // Önceki teklif sahibinin parasını iade et
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

  // Yeni teklif sahibinin parasından düş
  await supabase
    .from('profiles')
    .update({ money: availableMoney - bidAmount })
    .eq('id', bidderId);

  // 8. Update listing with new bid + held_amount
  const newBidCount = (listing.bid_count ?? 0) + 1;
  const newExpiry = auctionExpiry(); // extend by 4 hours from NOW

  const { error: updateError } = await supabase
    .from('transfer_market')
    .update({
      current_bid: bidAmount,
      highest_bidder_id: bidderId,
      highest_bidder_name: bidderName,
      bid_count: newBidCount,
      expires_at: newExpiry,
      held_amount: bidAmount,
    })
    .eq('id', listingId);

  if (updateError) {
    // Para kesildi ama listing güncellenemedi — parayı geri iade et
    await supabase
      .from('profiles')
      .update({ money: availableMoney })
      .eq('id', bidderId);
    return { success: false, error: updateError.message };
  }

  // 9. Record the bid in auction_bids (graceful — table may not exist yet)
  try {
    await supabase.from('auction_bids').insert({
      listing_id: listingId,
      bidder_id: bidderId,
      bidder_name: bidderName,
      bid_amount: bidAmount,
    });
  } catch {
    // auction_bids table may not exist — non-critical, skip bid history
  }

  // 10. Auto-buy check: if bid meets or exceeds max_price, immediately complete
  let autoWin = false;
  if (listing.max_price && bidAmount >= listing.max_price) {
    autoWin = true;
    // Para zaten reserve edildi (held_amount), sadece transferi tamamla
    // held_amount'u 0'a düş (para zaten kesildi)
    await supabase
      .from('transfer_market')
      .update({ held_amount: 0 })
      .eq('id', listingId);

    // Complete transfer
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
// ---------------------------------------------------------------------------

export const cancelAuction = async (listingId: string, sellerId: string) => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  const supabase = getSupabase();

  // 1. Fetch listing
  const { data: listing, error: fetchError } = await supabase
    .from('transfer_market')
    .select('*')
    .eq('id', listingId)
    .single();

  if (fetchError || !listing) return { success: false, error: 'Listing not found' };

  // 2. Only the seller can cancel
  if (listing.seller_id !== sellerId) {
    return { success: false, error: 'Only the seller can cancel this auction' };
  }

  // 3. Cannot cancel if there are bids
  if ((listing.bid_count ?? 0) > 0) {
    return { success: false, error: 'Cannot cancel — auction already has bids' };
  }

  // 4. Deactivate
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
    // auction_bids table may not exist yet
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

  // 1. Fetch all active auctions that have expired
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
    // ── Duplicate transfer koruması: Atomik lock ──
    // Önce listing'i processing olarak işaretle (is_active = false + processing_flag)
    // Eğer başka bir instance aynı listing'i işlemişse, bu update 0 satır etkiler
    const { data: lockResult, error: lockError } = await supabase
      .from('transfer_market')
      .update({ is_active: false }) // Lock: hemen deaktif et, duplicate engelle
      .eq('id', listing.id)
      .eq('is_active', true)        // Sadece hala aktifse güncelle (race condition koruması)
      .select('id');

    if (lockError || !lockResult || lockResult.length === 0) {
      // Başka bir process bu listing'i zaten işlemiş — atla
      continue;
    }

    const reserveThreshold = listing.reserve_price ?? listing.min_price ?? 0;
    const currentBid = listing.current_bid ?? 0;
    const hasValidBid = currentBid >= reserveThreshold && listing.highest_bidder_id;

    if (hasValidBid) {
      // İmzalanmış mı kontrol et
      const { data: playerData } = await supabase
        .from('players')
        .select('profile_id')
        .eq('id', listing.player_id)
        .maybeSingle();

      const isSigned = playerData?.profile_id === listing.highest_bidder_id;

      if (isSigned) {
        // ── Kazanan imzalamış → listing zaten deaktif (lock adımında) ──
        resolved++;
      } else {
        // ── İmzalamamış → 24 saat sonrasını bekle (tazminat sistemi) ──
        const auctionEnd = new Date(listing.expires_at);
        const penaltyDeadline = new Date(auctionEnd.getTime() + SIGNING_DEADLINE_HOURS * 60 * 60 * 1000);
        const isPastDeadline = new Date() > penaltyDeadline;

        if (isPastDeadline) {
          // Tazminat: teklifin %5'i satıcıya
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

          // Satıcı gerçek kullanıcıysa listing'i sıfırla ve yeniden aç
          if (listing.seller_id && listing.seller_id !== 'free-agent-system') {
            const newExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            await supabase
              .from('transfer_market')
              .update({
                is_active: true,          // Yeniden aktif et
                current_bid: null,
                highest_bidder_id: null,
                highest_bidder_name: null,
                bid_count: 0,
                expires_at: newExpiry.toISOString(),
              })
              .eq('id', listing.id);
          }
          // Serbest oyuncu ise listing zaten deaktif (lock adımında)
          resolved++;
        } else {
          // Henüz 24 saat dolmamışsa — listing'i tekrar aktif yap (bekleme süresi devam ediyor)
          await supabase
            .from('transfer_market')
            .update({ is_active: true })
            .eq('id', listing.id);
        }
      }
    } else {
      // No valid bid — listing zaten deaktif (lock adımında), hiçbir şey yapma
      resolved++;
    }
  }

  return { resolved };
};

// ---------------------------------------------------------------------------
// Get Market Listings (with background expiry resolution)
// ---------------------------------------------------------------------------

export const getMarketListings = async (): Promise<MarketListing[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabase();

  // NOTE: Expired auctions are now resolved server-side only via /api/market/expire cron.
  // Client-side fire-and-forget was removed to prevent race conditions and duplicate transfers.

  const { data } = await supabase
    .from('transfer_market')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  let listings: MarketListing[] = (data ?? []) as MarketListing[];

  // ── Sahipli oyuncuları filtrele ──
  // transfer_market is_active=true olsa bile, oyuncunun profile_id'si null değilse
  // bu oyuncu zaten satın alınmış demektir — listeden çıkar
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
        // Sahipli oyuncuların listelerini deaktif et (temizlik)
        const ownedListingIds = listings
          .filter(l => ownedIds.has(l.player_id))
          .map(l => l.id);

        if (ownedListingIds.length > 0) {
          await supabase
            .from('transfer_market')
            .update({ is_active: false })
            .in('id', ownedListingIds);
        }

        // Listeden kaldır
        listings = listings.filter(l => !ownedIds.has(l.player_id));
      }
    }
  }

  const now = new Date();

  // Mark auction listings that have expired (for UI display purposes)
  return listings.map((l) => ({
    ...l,
    expired: l.is_auction && l.expires_at ? new Date(l.expires_at) < now : false,
  }));
};

// ---------------------------------------------------------------------------
// Get My Auctions (seller's own listings)
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
  if (!isSupabaseConfigured()) {
    // Return early if not configured, local storage handled by context if needed
    return { success: false };
  }
  const supabase = getSupabase();

  // Check current count of free agents
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
      is_auction: false, // free agents are direct-buy only
      starting_price: p.market_value,
      reserve_price: Math.round(p.market_value * 0.8),
      bid_count: 0,
    });
  }

  // Use chunks for large inserts
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
    // 1. Fetch all players belonging to the team
    const { data: players, error: fetchError } = await supabase
      .from('players')
      .select('*')
      .eq('profile_id', teamId);

    if (fetchError) return { success: false, error: fetchError.message };
    if (!players || players.length === 0) return { success: true, moved: 0 };

    // 2. Insert each player into transfer_market
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
      });
      if (!insertError) moved++;
    }

    // 3. Delete players from players table
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

    // Her profil icin season_awards sayisini cek (champion sayisi)
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
