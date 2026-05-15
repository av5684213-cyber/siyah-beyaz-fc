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
  await supabase
    .from('players')
    .update({ profile_id: buyerId })
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

  // 6. Check bidder has enough money
  const { data: bidderProfile } = await supabase
    .from('profiles')
    .select('money')
    .eq('id', bidderId)
    .single();

  if (!bidderProfile || Number(bidderProfile.money) < bidAmount) {
    return { success: false, error: 'Insufficient funds' };
  }

  // 7. Update listing with new bid
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
    })
    .eq('id', listingId);

  if (updateError) return { success: false, error: updateError.message };

  // 8. Record the bid in auction_bids (graceful — table may not exist yet)
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

  // 9. Auto-buy check: if bid meets or exceeds max_price, immediately complete
  let autoWin = false;
  if (listing.max_price && bidAmount >= listing.max_price) {
    autoWin = true;

    // Deduct buyer money
    await supabase
      .from('profiles')
      .update({ money: Number(bidderProfile.money) - bidAmount })
      .eq('id', bidderId);

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

  for (const listing of expiredListings) {
    const reserveThreshold = listing.reserve_price ?? listing.min_price ?? 0;
    const currentBid = listing.current_bid ?? 0;
    const hasValidBid = currentBid >= reserveThreshold && listing.highest_bidder_id;

    if (hasValidBid) {
      // Deduct money from highest bidder
      const { data: bidderProfile } = await supabase
        .from('profiles')
        .select('money')
        .eq('id', listing.highest_bidder_id)
        .single();

      if (bidderProfile && Number(bidderProfile.money) >= currentBid) {
        await supabase
          .from('profiles')
          .update({ money: Number(bidderProfile.money) - currentBid })
          .eq('id', listing.highest_bidder_id);

        // Complete transfer to highest bidder
        await completeTransfer(
          supabase,
          listing as MarketListing,
          listing.highest_bidder_id,
          currentBid,
        );
        resolved++;
      } else {
        // Bidder no longer has funds — deactivate with no sale
        await supabase
          .from('transfer_market')
          .update({ is_active: false })
          .eq('id', listing.id);
        resolved++;
      }
    } else {
      // No valid bid — deactivate listing (no sale)
      await supabase
        .from('transfer_market')
        .update({ is_active: false })
        .eq('id', listing.id);
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

  // Resolve expired auctions in the background (fire-and-forget)
  resolveExpiredAuctions().catch(() => {});

  const { data } = await supabase
    .from('transfer_market')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const listings: MarketListing[] = (data ?? []) as MarketListing[];
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
      .select('id, manager_name, team_name, reputation, level, fans')
      .order('reputation', { ascending: false })
      .limit(20);

    if (error || !data) return [];
    return data;
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
