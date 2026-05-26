-- Migration: Add UNIQUE constraint on match_sessions.fixture_id
-- This prevents duplicate match sessions for the same fixture
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_match_session_fixture'
  ) THEN
    ALTER TABLE match_sessions ADD CONSTRAINT uniq_match_session_fixture UNIQUE (fixture_id);
  END IF;
END $$;
