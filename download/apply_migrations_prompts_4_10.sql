-- ============================================================
-- SQL Migration: PROMPT 1-10 + Teknik/Performans Düzeltmeleri
-- Tarih: 2026-05-26
-- Supabase SQL Editor'de çalıştırın
-- ============================================================

-- 1. cron_locks tablosu (Cron Lock için gerekli)
CREATE TABLE IF NOT EXISTS cron_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(job_name)
);
CREATE INDEX IF NOT EXISTS idx_cron_locks_expires ON cron_locks(expires_at);
ALTER TABLE cron_locks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'cron_locks_all') THEN
    CREATE POLICY "cron_locks_all" ON cron_locks FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 2. notifications: is_read sütunu + doğru indeks
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  tag TEXT,
  type TEXT DEFAULT 'match_event',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Notifications read') THEN
    CREATE POLICY "Notifications read" ON notifications FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Notifications write') THEN
    CREATE POLICY "Notifications write" ON notifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
-- Yanlış indeksi sil, doğruyu oluştur
DROP INDEX IF EXISTS idx_notifications_read;
CREATE INDEX IF NOT EXISTS idx_notifications_profile_unread ON notifications(profile_id, is_read) WHERE is_read = FALSE;

-- 3. rating_start_of_season sütunu
ALTER TABLE players ADD COLUMN IF NOT EXISTS rating_start_of_season INTEGER DEFAULT 0;

-- 4. uniq_match_session_fixture constraint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uniq_match_session_fixture') THEN
    ALTER TABLE match_sessions ADD CONSTRAINT uniq_match_session_fixture UNIQUE (fixture_id);
  END IF;
END $$;

-- 5. injury_severity sütunu (form düşüşü için gerekli)
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_severity TEXT DEFAULT NULL;

-- 6. [VERITABANI-1] Eksik composite indeksler
CREATE INDEX IF NOT EXISTS idx_fixtures_status_date ON fixtures(status, match_date);
CREATE INDEX IF NOT EXISTS idx_league_standings_league_season ON league_standings(league_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_players_profile_position ON players(profile_id, position);

-- ============================================================
-- Tamamlandı ✓
-- ============================================================
