-- ═══════════════════════════════════════════════════════════════
-- Migration: All pending schema changes
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

-- 3. Create notifications table (for season award notifications etc.)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'general',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by profile
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(profile_id, read) WHERE read = FALSE;

-- RLS for notifications — permissive
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select_all" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_all" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_all" ON public.notifications;
CREATE POLICY "notifications_select_all" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert_all" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update_all" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "notifications_delete_all" ON public.notifications FOR DELETE USING (true);
