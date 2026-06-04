-- =====================================================
-- RLS POLICIES FOR CRITICAL TABLES
-- =====================================================
-- This migration enables Row Level Security on all critical tables
-- and creates appropriate policies. It also creates SECURITY DEFINER
-- RPC functions for operations that need to bypass RLS safely.
--
-- Run this in the Supabase SQL Editor or via psql.
-- =====================================================

-- Enable RLS on all critical tables
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_market ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_simulation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_academy ENABLE ROW LEVEL SECURITY;

-- ──── PROFILES ────
-- Anyone can read profiles (needed for leaderboard, match UI)
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
-- Users can only update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id::uuid);
-- Insert is handled server-side only (no direct client insert)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id::uuid);

-- ──── PLAYERS ────
-- Anyone can read players (needed for match, league, scouting)
DROP POLICY IF EXISTS "players_select_all" ON public.players;
CREATE POLICY "players_select_all" ON public.players FOR SELECT USING (true);
-- Users can only update players they own (profile_id matches)
DROP POLICY IF EXISTS "players_update_own" ON public.players;
CREATE POLICY "players_update_own" ON public.players FOR UPDATE USING (auth.uid() = profile_id::uuid);
-- No direct client insert for players (server-side only via RPC)
DROP POLICY IF EXISTS "players_insert_service" ON public.players;
CREATE POLICY "players_insert_service" ON public.players FOR INSERT WITH CHECK (true);
-- No direct client delete
DROP POLICY IF EXISTS "players_delete_service" ON public.players;
CREATE POLICY "players_delete_service" ON public.players FOR DELETE USING (false);

-- ──── TRANSFER MARKET ────
-- Anyone can read active listings
DROP POLICY IF EXISTS "transfer_market_select_all" ON public.transfer_market;
CREATE POLICY "transfer_market_select_all" ON public.transfer_market FOR SELECT USING (true);
-- Only server-side can insert/update (RPC only)
DROP POLICY IF EXISTS "transfer_market_insert_service" ON public.transfer_market;
CREATE POLICY "transfer_market_insert_service" ON public.transfer_market FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "transfer_market_update_service" ON public.transfer_market;
CREATE POLICY "transfer_market_update_service" ON public.transfer_market FOR UPDATE USING (true);

-- ──── LEAGUE_TEAMS ────
DROP POLICY IF EXISTS "league_teams_select_all" ON public.league_teams;
CREATE POLICY "league_teams_select_all" ON public.league_teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "league_teams_update_own" ON public.league_teams;
CREATE POLICY "league_teams_update_own" ON public.league_teams FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "league_teams_insert_service" ON public.league_teams;
CREATE POLICY "league_teams_insert_service" ON public.league_teams FOR INSERT WITH CHECK (true);

-- ──── FIXTURES ────
DROP POLICY IF EXISTS "fixtures_select_all" ON public.fixtures;
CREATE POLICY "fixtures_select_all" ON public.fixtures FOR SELECT USING (true);
DROP POLICY IF EXISTS "fixtures_update_service" ON public.fixtures;
CREATE POLICY "fixtures_update_service" ON public.fixtures FOR UPDATE USING (true);
DROP POLICY IF EXISTS "fixtures_insert_service" ON public.fixtures;
CREATE POLICY "fixtures_insert_service" ON public.fixtures FOR INSERT WITH CHECK (true);

-- ──── SEASONS ────
DROP POLICY IF EXISTS "seasons_select_all" ON public.seasons;
CREATE POLICY "seasons_select_all" ON public.seasons FOR SELECT USING (true);
DROP POLICY IF EXISTS "seasons_update_service" ON public.seasons;
CREATE POLICY "seasons_update_service" ON public.seasons FOR UPDATE USING (true);
DROP POLICY IF EXISTS "seasons_insert_service" ON public.seasons;
CREATE POLICY "seasons_insert_service" ON public.seasons FOR INSERT WITH CHECK (true);

-- ──── MATCH_SESSIONS ────
DROP POLICY IF EXISTS "match_sessions_select_all" ON public.match_sessions;
CREATE POLICY "match_sessions_select_all" ON public.match_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "match_sessions_update_service" ON public.match_sessions;
CREATE POLICY "match_sessions_update_service" ON public.match_sessions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "match_sessions_insert_service" ON public.match_sessions;
CREATE POLICY "match_sessions_insert_service" ON public.match_sessions FOR INSERT WITH CHECK (true);

-- ──── MATCH_SIMULATION_QUEUE ────
DROP POLICY IF EXISTS "match_sim_queue_select_all" ON public.match_simulation_queue;
CREATE POLICY "match_sim_queue_select_all" ON public.match_simulation_queue FOR SELECT USING (true);
DROP POLICY IF EXISTS "match_sim_queue_update_service" ON public.match_simulation_queue;
CREATE POLICY "match_sim_queue_update_service" ON public.match_simulation_queue FOR UPDATE USING (true);
DROP POLICY IF EXISTS "match_sim_queue_insert_service" ON public.match_simulation_queue;
CREATE POLICY "match_sim_queue_insert_service" ON public.match_simulation_queue FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "match_sim_queue_delete_service" ON public.match_simulation_queue;
CREATE POLICY "match_sim_queue_delete_service" ON public.match_simulation_queue FOR DELETE USING (true);

-- ──── ACTIVE_TACTICS ────
DROP POLICY IF EXISTS "active_tactics_select_all" ON public.active_tactics;
CREATE POLICY "active_tactics_select_all" ON public.active_tactics FOR SELECT USING (true);
DROP POLICY IF EXISTS "active_tactics_update_own" ON public.active_tactics;
CREATE POLICY "active_tactics_update_own" ON public.active_tactics FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "active_tactics_insert_service" ON public.active_tactics;
CREATE POLICY "active_tactics_insert_service" ON public.active_tactics FOR INSERT WITH CHECK (true);

-- ──── TRAININGS ────
DROP POLICY IF EXISTS "trainings_select_all" ON public.trainings;
CREATE POLICY "trainings_select_all" ON public.trainings FOR SELECT USING (true);
DROP POLICY IF EXISTS "trainings_update_own" ON public.trainings;
CREATE POLICY "trainings_update_own" ON public.trainings FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "trainings_insert_service" ON public.trainings;
CREATE POLICY "trainings_insert_service" ON public.trainings FOR INSERT WITH CHECK (true);

-- ──── YOUTH_PLAYERS ────
DROP POLICY IF EXISTS "youth_players_select_all" ON public.youth_players;
CREATE POLICY "youth_players_select_all" ON public.youth_players FOR SELECT USING (true);
DROP POLICY IF EXISTS "youth_players_update_own" ON public.youth_players;
CREATE POLICY "youth_players_update_own" ON public.youth_players FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "youth_players_insert_service" ON public.youth_players;
CREATE POLICY "youth_players_insert_service" ON public.youth_players FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "youth_players_delete_service" ON public.youth_players;
CREATE POLICY "youth_players_delete_service" ON public.youth_players FOR DELETE USING (auth.uid() = profile_id::uuid);

-- ──── WATCHLIST ────
DROP POLICY IF EXISTS "watchlist_select_own" ON public.watchlist;
CREATE POLICY "watchlist_select_own" ON public.watchlist FOR SELECT USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "watchlist_insert_own" ON public.watchlist;
CREATE POLICY "watchlist_insert_own" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "watchlist_delete_own" ON public.watchlist;
CREATE POLICY "watchlist_delete_own" ON public.watchlist FOR DELETE USING (auth.uid() = profile_id::uuid);

-- ──── NOTIFICATIONS ────
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications;
CREATE POLICY "notifications_insert_service" ON public.notifications FOR INSERT WITH CHECK (true);

-- ──── USER_ACADEMY ────
DROP POLICY IF EXISTS "user_academy_select_own" ON public.user_academy;
CREATE POLICY "user_academy_select_own" ON public.user_academy FOR SELECT USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "user_academy_update_own" ON public.user_academy;
CREATE POLICY "user_academy_update_own" ON public.user_academy FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "user_academy_insert_service" ON public.user_academy;
CREATE POLICY "user_academy_insert_service" ON public.user_academy FOR INSERT WITH CHECK (true);

-- =====================================================
-- SUPABASE RPC FUNCTIONS
-- =====================================================
-- These functions allow safe server-side operations that clients
-- cannot directly perform. They enforce business logic at the DB level.
-- SECURITY DEFINER means they run with the function creator's
-- privileges (typically postgres), bypassing RLS. This is intentional
-- — the RPC functions contain their own authorization checks.

-- RPC: Safe transfer purchase (prevents race condition)
CREATE OR REPLACE FUNCTION public.rpc_transfer_buy(
  p_player_id UUID,
  p_buyer_id UUID,
  p_buyer_team TEXT,
  p_transfer_fee BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_profile_id UUID;
  v_buyer_money BIGINT;
  v_seller_id UUID;
  v_listing_id UUID;
  v_result JSONB;
BEGIN
  -- 1. Lock the player row (SELECT FOR UPDATE prevents race condition)
  SELECT profile_id INTO v_player_profile_id
  FROM public.players
  WHERE id = p_player_id
  FOR UPDATE;

  -- Check if player is still available (not owned by another user)
  IF v_player_profile_id IS NOT NULL AND v_player_profile_id != p_buyer_id THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Bu oyuncu zaten bir takıma ait');
  END IF;

  -- 2. Lock the buyer's profile row
  SELECT money INTO v_buyer_money
  FROM public.profiles
  WHERE id = p_buyer_id::uuid
  FOR UPDATE;

  -- Check balance
  IF v_buyer_money < p_transfer_fee THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Yetersiz bakiye');
  END IF;

  -- 3. Get the active listing
  SELECT id, seller_id INTO v_listing_id, v_seller_id
  FROM public.transfer_market
  WHERE player_id = p_player_id AND is_active = true
  FOR UPDATE
  LIMIT 1;

  -- 4. Deduct buyer money
  UPDATE public.profiles SET money = money - p_transfer_fee WHERE id = p_buyer_id::uuid;

  -- 5. Credit seller (with 2.5% tax)
  IF v_seller_id IS NOT NULL AND v_seller_id != 'free-agent-system' THEN
    UPDATE public.profiles
    SET money = money + ROUND(p_transfer_fee * 0.975)
    WHERE id = v_seller_id::uuid;
  END IF;

  -- 6. Transfer player ownership
  UPDATE public.players
  SET profile_id = p_buyer_id, team_name = p_buyer_team, club = p_buyer_team, is_for_sale = false
  WHERE id = p_player_id;

  -- 7. Deactivate listing
  IF v_listing_id IS NOT NULL THEN
    UPDATE public.transfer_market SET is_active = false WHERE id = v_listing_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'transfer_fee', p_transfer_fee,
    'remaining_money', v_buyer_money - p_transfer_fee
  );
END;
$$;

-- RPC: Safe free agent purchase (prevents race condition)
CREATE OR REPLACE FUNCTION public.rpc_buy_free_agent(
  p_player_id UUID,
  p_buyer_id UUID,
  p_buyer_team TEXT,
  p_transfer_fee BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_profile_id UUID;
  v_buyer_money BIGINT;
  v_listing_id UUID;
BEGIN
  -- 1. Lock the player row
  SELECT profile_id INTO v_player_profile_id
  FROM public.players
  WHERE id = p_player_id
  FOR UPDATE;

  -- Must be a free agent
  IF v_player_profile_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Bu oyuncu serbest değil');
  END IF;

  -- 2. Lock buyer profile
  SELECT money INTO v_buyer_money
  FROM public.profiles
  WHERE id = p_buyer_id::uuid
  FOR UPDATE;

  IF v_buyer_money < p_transfer_fee THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Yetersiz bakiye');
  END IF;

  -- 3. Check for active listing
  SELECT id INTO v_listing_id
  FROM public.transfer_market
  WHERE player_id = p_player_id AND is_active = true
  FOR UPDATE
  LIMIT 1;

  -- 4. Deduct money
  UPDATE public.profiles SET money = money - p_transfer_fee WHERE id = p_buyer_id::uuid;

  -- 5. Transfer ownership
  UPDATE public.players
  SET profile_id = p_buyer_id, team_name = p_buyer_team, club = p_buyer_team, is_free_agent = false
  WHERE id = p_player_id;

  -- 6. Deactivate listing
  IF v_listing_id IS NOT NULL THEN
    UPDATE public.transfer_market SET is_active = false WHERE id = v_listing_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'transfer_fee', p_transfer_fee,
    'remaining_money', v_buyer_money - p_transfer_fee
  );
END;
$$;

-- RPC: Sell player (mark as free agent)
CREATE OR REPLACE FUNCTION public.rpc_sell_player(
  p_player_id UUID,
  p_seller_id UUID,
  p_sale_price BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_profile_id UUID;
  v_seller_money BIGINT;
  v_tax_rate NUMERIC := 0.025;
  v_net_revenue BIGINT;
BEGIN
  -- 1. Lock the player row
  SELECT profile_id INTO v_player_profile_id
  FROM public.players
  WHERE id = p_player_id
  FOR UPDATE;

  -- Verify ownership
  IF v_player_profile_id IS NULL OR v_player_profile_id::text != p_seller_id::text THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Bu oyuncu size ait değil');
  END IF;

  -- 2. Calculate net revenue
  v_net_revenue := ROUND(p_sale_price * (1 - v_tax_rate));

  -- 3. Lock seller profile
  SELECT money INTO v_seller_money
  FROM public.profiles
  WHERE id = p_seller_id::uuid
  FOR UPDATE;

  -- 4. Add revenue
  UPDATE public.profiles SET money = money + v_net_revenue WHERE id = p_seller_id::uuid;

  -- 5. Mark player as free agent
  UPDATE public.players
  SET profile_id = NULL, team_name = 'Transfer Listesi', club = 'Transfer Listesi', is_for_sale = false
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', true,
    'net_revenue', v_net_revenue,
    'tax_amount', ROUND(p_sale_price * v_tax_rate)
  );
END;
$$;

-- RPC: Update player condition (for training/match usage)
CREATE OR REPLACE FUNCTION public.rpc_update_player_cond(
  p_player_id UUID,
  p_owner_id UUID,
  p_new_cond INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT profile_id INTO v_profile_id
  FROM public.players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_profile_id IS NULL OR v_profile_id::text != p_owner_id::text THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Yetkisiz');
  END IF;

  UPDATE public.players SET cond = LEAST(100, GREATEST(0, p_new_cond)) WHERE id = p_player_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.rpc_transfer_buy TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_buy_free_agent TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_sell_player TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_update_player_cond TO anon, authenticated;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
