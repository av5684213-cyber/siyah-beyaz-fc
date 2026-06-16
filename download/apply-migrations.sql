-- =============================================================
-- Touchline Manager - Missing Schema Migration Script
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- This script creates missing tables and columns
-- =============================================================

-- 1. Create lab_sessions table (TacticLab persistence)
CREATE TABLE IF NOT EXISTS public.lab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_a JSONB NOT NULL DEFAULT '[]',
  team_b JSONB NOT NULL DEFAULT '[]',
  selected_formation TEXT NOT NULL DEFAULT '4-4-2',
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lab_sessions_user_id_unique UNIQUE (user_id)
);

-- RLS for lab_sessions
ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own lab session" ON public.lab_sessions;
CREATE POLICY "Users can read own lab session"
  ON public.lab_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lab session" ON public.lab_sessions;
CREATE POLICY "Users can insert own lab session"
  ON public.lab_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lab session" ON public.lab_sessions;
CREATE POLICY "Users can update own lab session"
  ON public.lab_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own lab session" ON public.lab_sessions;
CREATE POLICY "Users can delete own lab session"
  ON public.lab_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_lab_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lab_sessions_updated_at ON public.lab_sessions;
CREATE TRIGGER trigger_update_lab_sessions_updated_at
  BEFORE UPDATE ON public.lab_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lab_sessions_updated_at();

CREATE INDEX IF NOT EXISTS idx_lab_sessions_user_id ON public.lab_sessions(user_id);

-- 2. Add last_newspaper_applied column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_newspaper_applied DATE;

-- 3. Add consecutive_losses column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_losses INTEGER DEFAULT 0;

-- 4. Add financial_health column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS financial_health TEXT DEFAULT 'healthy';

-- 5. Add last_friendly_date and daily_friendly_count columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_friendly_date TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_friendly_count INTEGER DEFAULT 0;

-- 6. Add held_amount to transfer_market
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS held_amount BIGINT DEFAULT 0;

-- 7. Add season_yellow_cards to players
ALTER TABLE players ADD COLUMN IF NOT EXISTS season_yellow_cards INTEGER DEFAULT 0;

-- 8. Unique constraint on match_simulation_queue
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_queue_fixture'
  ) THEN
    ALTER TABLE match_simulation_queue ADD CONSTRAINT uniq_queue_fixture UNIQUE (fixture_id);
  END IF;
END $$;

-- 9. Add goal_types columns to player_career_stats (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'player_career_stats') THEN
    ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS goal_types JSONB DEFAULT '{}';
    ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS save_types JSONB DEFAULT '{}';
    ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0;
    ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS motm_count INTEGER DEFAULT 0;
    ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS fouls INTEGER DEFAULT 0;
  END IF;
END $$;
