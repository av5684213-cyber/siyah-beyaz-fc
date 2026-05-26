-- ═══════════════════════════════════════════════════════════════
-- Migration: rating_start_of_season + match_sessions UNIQUE constraint
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- 1. Add rating_start_of_season column to players table
-- Used by "most_improved" award to track rating gain over a season
ALTER TABLE players ADD COLUMN IF NOT EXISTS rating_start_of_season INTEGER DEFAULT 0;

-- 2. Add UNIQUE constraint on match_sessions.fixture_id
-- Prevents duplicate match sessions for the same fixture
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uniq_match_session_fixture') THEN
    ALTER TABLE match_sessions ADD CONSTRAINT uniq_match_session_fixture UNIQUE (fixture_id);
  END IF;
END $$;
