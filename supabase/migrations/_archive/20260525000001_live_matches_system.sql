-- ============================================================
-- Live Matches System - Real-time Match Simulation
-- ============================================================
-- Maçlar 30 gerçek dakikada simüle edilir (90 oyun dakikası).
-- Tüm olaylar önceden hesaplanır ve dakika dakika açılır.
-- Frontend Supabase realtime ile olayları dinler.
-- ============================================================

-- 0. Önceki başarısız kurulumu temizle
DROP TABLE IF EXISTS live_matches CASCADE;
DROP POLICY IF EXISTS "Notifications read own" ON notifications;
DROP POLICY IF EXISTS "Notifications write" ON notifications;
DROP TABLE IF EXISTS notifications CASCADE;

-- 1. match_events tablosuna is_revealed kolonu ekle
ALTER TABLE match_events
ADD COLUMN IF NOT EXISTS is_revealed BOOLEAN DEFAULT FALSE;

-- İndeks: canlı maçlarda sadece açılan olayları hızlıca bulmak için
DROP INDEX IF EXISTS idx_match_events_fixture_revealed;
CREATE INDEX idx_match_events_fixture_revealed
ON match_events(fixture_id, is_revealed);

-- Dakika bazlı sıralama için
DROP INDEX IF EXISTS idx_match_events_fixture_minute;
CREATE INDEX idx_match_events_fixture_minute
ON match_events(fixture_id, minute);

-- 2. live_matches tablosu - canlı maç durumunu takip eder
CREATE TABLE live_matches (
  fixture_id UUID PRIMARY KEY REFERENCES fixtures(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  current_minute INTEGER DEFAULT 0,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'halftime', 'completed')),
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  home_team_id UUID,
  away_team_id UUID,
  home_team_name TEXT,
  away_team_name TEXT,
  season_id UUID,
  simulation_speed REAL DEFAULT 3.0,
  total_events INTEGER DEFAULT 0,
  revealed_events INTEGER DEFAULT 0,
  weather TEXT DEFAULT 'sunny',
  referee_name TEXT,
  referee_personality TEXT,
  referee_strictness INTEGER,
  home_possession REAL DEFAULT 50,
  home_stats JSONB DEFAULT '{}',
  away_stats JSONB DEFAULT '{}',
  home_player_ratings JSONB DEFAULT '[]',
  away_player_ratings JSONB DEFAULT '[]',
  man_of_the_match TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- live_matches için RLS
ALTER TABLE live_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Live matches read" ON live_matches FOR SELECT USING (true);
CREATE POLICY "Live matches write" ON live_matches FOR ALL USING (true);

-- Realtime için REPLICA IDENTITY FULL
ALTER TABLE live_matches REPLICA IDENTITY FULL;
ALTER TABLE match_events REPLICA IDENTITY FULL;

-- 3. fixtures tablosuna scheduled_time kolonu
ALTER TABLE fixtures
ADD COLUMN IF NOT EXISTS scheduled_time TEXT;

DROP INDEX IF EXISTS idx_fixtures_status_date;
CREATE INDEX idx_fixtures_status_date
ON fixtures(status, match_date);

-- 4. notifications tablosu
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  tag TEXT,
  type TEXT DEFAULT 'match_event',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_profile_unread
ON notifications(profile_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications read own" ON notifications FOR SELECT USING (true);
CREATE POLICY "Notifications write" ON notifications FOR ALL USING (true);
