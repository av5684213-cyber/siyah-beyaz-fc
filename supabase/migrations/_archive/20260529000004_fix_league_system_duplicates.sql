-- Migration: Fix league system - duplicate leagues bug
-- Problem: NPC teams created by maintenance had is_npc=true but NOT is_bot=true
-- This caused assign_bot_to_user RPC to never find available bot slots,
-- creating a new league for every user registration (18 duplicate leagues).
-- Fix: Update existing NPC teams to also have is_bot=true, and fix the RPC

-- 1. Fix existing NPC teams that are missing is_bot=true flag
-- These were created by the maintenance endpoint without is_bot=true
UPDATE league_teams
SET is_bot = true
WHERE is_npc = true
  AND is_bot = false
  AND profile_id IS NULL;

-- 2. Update the assign_bot_to_user RPC to also find is_npc=true teams
CREATE OR REPLACE FUNCTION assign_bot_to_user(
  p_profile_id UUID,
  p_team_name TEXT,
  p_manager_name TEXT DEFAULT 'Menajer',
  p_philosophy TEXT DEFAULT 'balanced',
  p_color1 TEXT DEFAULT '#ffffff',
  p_color2 TEXT DEFAULT '#000000',
  p_region TEXT DEFAULT 'TR'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_bot_team RECORD;
  v_league_id UUID;
  v_league_name TEXT;
  v_old_profile_id UUID;
  v_result JSONB;
BEGIN
  SET LOCAL lock_timeout = '5s';

  -- 1. Atomically select and lock a bot team slot in tier=4 leagues
  -- is_bot=true VEYA is_npc=true olan takımları devral (ikisi de bot takım)
  SELECT lt.id, lt.league_id, lt.name AS old_team_name, lt.profile_id AS old_profile_id
  INTO v_bot_team
  FROM league_teams lt
  JOIN leagues l ON l.id = lt.league_id
  WHERE (lt.is_bot = true OR lt.is_npc = true)
    AND lt.profile_id IS NULL
    AND l.tier = 4
  ORDER BY lt.id
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- 2. If no bot available, return failure
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'no_bot_available'
    );
  END IF;

  -- 3. Get league info
  SELECT id, name INTO v_league_id, v_league_name
  FROM leagues WHERE id = v_bot_team.league_id;

  -- 4. Update league_teams row to assign to user
  UPDATE league_teams
  SET profile_id = p_profile_id,
      is_bot = false,
      is_npc = false,
      name = p_team_name,
      color = p_color1
  WHERE id = v_bot_team.id;

  -- 5. If there's an old bot profile, reassign its players and delete it
  IF v_bot_team.old_profile_id IS NOT NULL THEN
    -- Transfer players from bot profile to new user
    UPDATE players
    SET profile_id = p_profile_id,
        team_name = p_team_name
    WHERE profile_id = v_bot_team.old_profile_id;

    -- Delete old bot profile
    DELETE FROM profiles WHERE id = v_bot_team.old_profile_id;
  END IF;

  -- 6. Return success
  RETURN jsonb_build_object(
    'success', true,
    'league_id', v_league_id,
    'league_name', COALESCE(v_league_name, '4. Lig'),
    'team_slot_id', v_bot_team.id,
    'took_over_bot', true
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'reason', SQLERRM
  );
END;
$$;

-- 3. Fix player_development_log_summary VIEW (SQL Error 42703 - column 'week' does not exist)
-- DİKKAT: Eski VIEW farklı sütunlara sahip, DROP+CREATE gerekli
DROP VIEW IF EXISTS player_development_log_summary;
CREATE VIEW player_development_log_summary AS
SELECT
  player_id,
  season_week,
  change_reason,
  match_performance_contribution,
  old_ovr,
  new_ovr,
  created_at
FROM player_development_log
ORDER BY created_at DESC;
