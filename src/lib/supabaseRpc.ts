/**
 * BUG-1: Type-safe RPC wrapper module
 *
 * All write operations that have a corresponding Supabase RPC function
 * should go through these helpers instead of direct table writes.
 * This ensures:
 *   1. Server-side validation (SECURITY DEFINER)
 *   2. Optimistic locking (version columns)
 *   3. Authorization checks (p_profile_id ownership)
 *   4. Atomicity (single transaction per RPC)
 *
 * Migration: supabase/migrations/20260605000001_rpc_security_and_rls.sql
 *
 * When RLS is enabled with WITH CHECK (false), direct REST API writes
 * will return 403. Only RPC calls (SECURITY DEFINER) can write.
 */

import { getSupabase } from '@/lib/supabase';

// ─── Generic RPC call wrapper ────────────────────────────────────────────────

/**
 * Type-safe RPC call wrapper.
 * Throws on Supabase errors so callers can use try/catch.
 */
export async function rpcCall<T = unknown>(
  fnName: string,
  params: Record<string, unknown>,
): Promise<T> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.rpc(fnName, params);
  if (error) throw error;
  return data as T;
}

// ─── Transfer Market RPCs ────────────────────────────────────────────────────

/**
 * Place a bid on an auction listing.
 * Uses optimistic locking (version) to prevent race conditions.
 *
 * Returns: { success, new_version, auto_win } or { success: false, reason, conflict? }
 */
export async function rpcTransferBid(
  listingId: string,
  bidderId: string,
  bidderName: string,
  bidAmount: number,
  version: number,
) {
  return rpcCall('rpc_transfer_bid', {
    p_listing_id: listingId,
    p_bidder_id: bidderId,
    p_bidder_name: bidderName,
    p_bid_amount: bidAmount,
    p_version: version,
  });
}

/**
 * Accept/complete a transfer as the auction winner.
 * Atomically: verify winner, transfer player ownership, pay seller, deactivate listing.
 *
 * Returns: { success, transfer_fee, tax_amount, seller_revenue, player_id }
 *       or { success: false, reason, conflict? }
 */
export async function rpcAcceptTransfer(
  listingId: string,
  winnerId: string,
  version: number,
) {
  return rpcCall('rpc_accept_transfer', {
    p_listing_id: listingId,
    p_winner_id: winnerId,
    p_version: version,
  });
}

// ─── Tactics RPC ─────────────────────────────────────────────────────────────

/**
 * Update active tactics for a profile.
 * Only the profile owner can update their tactics.
 *
 * The `tactics` object should contain keys matching the active_tactics columns:
 * formation, mentality, pressing, passing_style, intensity, play_style,
 * tempo, defensive_line, defense_line, width, aggression
 *
 * Returns: { success: true } or { success: false, reason }
 */
export async function rpcUpdateTactics(
  profileId: string,
  tactics: Record<string, unknown>,
) {
  return rpcCall('rpc_update_tactics', {
    p_profile_id: profileId,
    p_tactics: tactics,
  });
}

// ─── Training RPC ────────────────────────────────────────────────────────────

/**
 * Train a player. Only the player's owner can train them.
 * Improves rating based on age/potential, reduces condition.
 *
 * Returns: { success, old_rating, new_rating, improvement, cond_loss }
 *       or { success: false, reason }
 */
export async function rpcTrainPlayer(
  profileId: string,
  playerId: string,
  trainingType: string,
  intensity = 3,
) {
  return rpcCall('rpc_train_player', {
    p_profile_id: profileId,
    p_player_id: playerId,
    p_training_type: trainingType,
    p_intensity: intensity,
  });
}

// ─── Transfer Listing RPCs ───────────────────────────────────────────────────

/**
 * List a player on the transfer market.
 * Only the player's owner can list them. Prevents double-listing.
 *
 * Returns: { success: true, listing_id } or { success: false, reason }
 */
export async function rpcListPlayerOnMarket(
  profileId: string,
  playerId: string,
  price: number,
  minPrice: number,
  maxPrice: number,
  sellerName: string,
) {
  return rpcCall('rpc_list_player_on_market', {
    p_profile_id: profileId,
    p_player_id: playerId,
    p_price: price,
    p_min_price: minPrice,
    p_max_price: maxPrice,
    p_seller_name: sellerName,
  });
}

/**
 * Cancel an active listing. Only the seller can cancel, and only if no bids exist.
 *
 * Returns: { success: true } or { success: false, reason }
 */
export async function rpcCancelListing(
  profileId: string,
  listingId: string,
) {
  return rpcCall('rpc_cancel_listing', {
    p_profile_id: profileId,
    p_listing_id: listingId,
  });
}
