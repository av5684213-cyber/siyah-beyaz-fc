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

-- 3. Ensure notifications table has all required columns
-- (Table already exists from unified_core_schema; just ensure columns are present)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'match_event';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Index for fast lookup of unread notifications by profile
CREATE INDEX IF NOT EXISTS idx_notifications_profile_unread ON notifications(profile_id, is_read);

-- RLS for notifications — permissive
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "notifications_select_all" ON notifications FOR SELECT USING (true);
  CREATE POLICY "notifications_insert_all" ON notifications FOR INSERT WITH CHECK (true);
  CREATE POLICY "notifications_update_all" ON notifications FOR UPDATE USING (true);
  CREATE POLICY "notifications_delete_all" ON notifications FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
