-- ═══════════════════════════════════════════════════════════════════════════════
-- Siyah Beyaz FC — EKSİK TABLOLARI VE KOLONLARI TAMAMLAMA MİGRATİONU
-- Tarih: 2026-05-17
-- 
-- Bu dosya TEK SEFERDE çalıştırılabilir. Tüm ifadeler idempotent'tir:
--   - CREATE TABLE IF NOT EXISTS
--   - DO $$ ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--   - ALTER TABLE ADD COLUMN IF NOT EXISTS / DROP COLUMN IF EXISTS
--
-- İÇERİK:
--   A. EKSİK TABLOLAR (kodda kullanılıyor ama DB'de yok)
--   B. EKSİK KOLONLAR (tablo var ama kolon eksik)
--   C. YANLIŞ İNDEKSLERİN DÜZELTİLMESİ
-- ═══════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════
-- A. EKSİK TABLOLAR
-- ═══════════════════════════════════════════════════════════════

-- A1. match_events — Maç olaylarını kaydeder (goal, card, injury vs.)
-- saveMatchEvents() ve match/[id]/page.tsx tarafından kullanılıyor
CREATE TABLE IF NOT EXISTS match_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fixture_id TEXT NOT NULL,
  event_type TEXT NOT NULL,         -- 'goal', 'yellow_card', 'red_card', 'injury', 'substitution', 'commentary'
  minute INTEGER,
  team TEXT,                         -- 'HOME' veya 'AWAY'
  player_id TEXT,
  player_name TEXT,
  assist_player_id TEXT,
  assist_player_name TEXT,
  detail TEXT,                       -- Ek bilgi (sakatlık tipi, kart nedeni vs.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY match_events_select ON match_events
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY match_events_insert ON match_events
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_match_events_fixture ON match_events (fixture_id);


-- A2. match_participants — Maç sohbeti katılımcıları
-- match_chat ile ilişkili, RLS migration'da tanımlıydı ama tablo oluşturulmamış
CREATE TABLE IF NOT EXISTS match_participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fixture_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fixture_id, user_id)
);

ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own match participations"
  ON match_participants FOR SELECT
  USING (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can join matches"
  ON match_participants FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- A3. notifications — Bildirimler
-- NotificationCenter.tsx ve /api/notifications/send tarafından kullanılıyor
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT DEFAULT '/',
  tag TEXT DEFAULT 'general',
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY notifications_select ON notifications
    FOR SELECT USING (auth.uid()::text = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY notifications_insert ON notifications
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY notifications_update ON notifications
    FOR UPDATE USING (auth.uid()::text = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY notifications_delete ON notifications
    FOR DELETE USING (auth.uid()::text = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications (profile_id, created_at DESC);


-- A4. user_facilities — Kullanıcı tesis seviyeleri
-- /api/facilities ve /api/facilities/upgrade tarafından kullanılıyor
CREATE TABLE IF NOT EXISTS user_facilities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL UNIQUE,
  stadium_level INTEGER DEFAULT 1,
  training_ground_level INTEGER DEFAULT 1,
  health_center_level INTEGER DEFAULT 1,
  scout_office_level INTEGER DEFAULT 1,
  -- Yükseltme durumları
  upgrading_type TEXT,               -- Şu an yükseltilen tesis tipi
  upgrading_finish_day INTEGER,      -- Yükseltme bitiş günü (oyun içi gün)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_facilities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY user_facilities_select ON user_facilities
    FOR SELECT USING (auth.uid()::text = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY user_facilities_insert ON user_facilities
    FOR INSERT WITH CHECK (auth.uid()::text = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY user_facilities_update ON user_facilities
    FOR UPDATE USING (auth.uid()::text = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- A5. facility_upgrade_costs — Tesis yükseltme maliyet tablosu
-- /api/facilities/upgrade tarafından kullanılıyor
CREATE TABLE IF NOT EXISTS facility_upgrade_costs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  facility_type TEXT NOT NULL,       -- 'stadium', 'training_ground', 'health_center', 'scout_office'
  current_level INTEGER NOT NULL,    -- 1-4 (5 max level, 4→5 yükseltme)
  credits_cost INTEGER NOT NULL,     -- Kredi maliyeti
  upgrade_days INTEGER NOT NULL DEFAULT 1,  -- Gerçek gün cinsinden süre
  UNIQUE(facility_type, current_level)
);

ALTER TABLE facility_upgrade_costs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY facility_costs_select ON facility_upgrade_costs
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tesis maliyet verilerini seed et (sadece tablo boşsa)
INSERT INTO facility_upgrade_costs (facility_type, current_level, credits_cost, upgrade_days)
SELECT * FROM (
  VALUES
    ('stadium', 1, 50, 1),
    ('stadium', 2, 100, 2),
    ('stadium', 3, 200, 3),
    ('stadium', 4, 400, 5),
    ('training_ground', 1, 40, 1),
    ('training_ground', 2, 80, 2),
    ('training_ground', 3, 160, 3),
    ('training_ground', 4, 320, 5),
    ('health_center', 1, 30, 1),
    ('health_center', 2, 60, 2),
    ('health_center', 3, 120, 3),
    ('health_center', 4, 240, 5),
    ('scout_office', 1, 35, 1),
    ('scout_office', 2, 70, 2),
    ('scout_office', 3, 140, 3),
    ('scout_office', 4, 280, 5)
) AS v(facility_type, current_level, credits_cost, upgrade_days)
WHERE NOT EXISTS (SELECT 1 FROM facility_upgrade_costs LIMIT 1);


-- A6. user_academy — Kullanıcı akademi seviyeleri
-- /api/academy/status, /api/academy/upgrade, /api/academy/speed-up tarafından kullanılıyor
CREATE TABLE IF NOT EXISTS user_academy (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL UNIQUE,
  academy_level INTEGER DEFAULT 1,
  extra_slots BOOLEAN DEFAULT false,
  -- Yükseltme durumu
  upgrading BOOLEAN DEFAULT false,
  upgrading_finish_day INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_academy ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY user_academy_select ON user_academy
    FOR SELECT USING (auth.uid()::text = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY user_academy_insert ON user_academy
    FOR INSERT WITH CHECK (auth.uid()::text = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY user_academy_update ON user_academy
    FOR UPDATE USING (auth.uid()::text = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- A7. academy_upgrade_costs — Akademi yükseltme maliyet tablosu
-- /api/academy/upgrade ve /api/academy/speed-up tarafından kullanılıyor
CREATE TABLE IF NOT EXISTS academy_upgrade_costs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  current_level INTEGER NOT NULL,    -- 1-4 (5 max level)
  credits_cost INTEGER NOT NULL,     -- Kredi maliyeti
  upgrade_days INTEGER NOT NULL DEFAULT 1,
  extra_slots_cost INTEGER,          -- Ek slot maliyeti (opsiyonel)
  UNIQUE(current_level)
);

ALTER TABLE academy_upgrade_costs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY academy_costs_select ON academy_upgrade_costs
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Akademi maliyet verilerini seed et
INSERT INTO academy_upgrade_costs (current_level, credits_cost, upgrade_days, extra_slots_cost)
SELECT * FROM (
  VALUES
    (1, 60, 1, 30),
    (2, 120, 2, 60),
    (3, 240, 3, 120),
    (4, 480, 5, 240)
) AS v(current_level, credits_cost, upgrade_days, extra_slots_cost)
WHERE NOT EXISTS (SELECT 1 FROM academy_upgrade_costs LIMIT 1);


-- A8. season_stats — Sezon oyuncu istatistikleri
-- /api/cron/season-end-trigger tarafından kullanılıyor
CREATE TABLE IF NOT EXISTS season_stats (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT NOT NULL,
  season_id TEXT NOT NULL,
  team_id TEXT,
  team_name TEXT,
  matches_played INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, season_id)
);

ALTER TABLE season_stats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY season_stats_select ON season_stats
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_season_stats_player ON season_stats (player_id);
CREATE INDEX IF NOT EXISTS idx_season_stats_season ON season_stats (season_id);


-- ═══════════════════════════════════════════════════════════════
-- B. EKSİK KOLONLAR (tablo var ama kolon eksik)
-- ═══════════════════════════════════════════════════════════════

-- B1. friendly_queue: team_name ve is_priority kolonları eksik
ALTER TABLE friendly_queue ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE friendly_queue ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT false;

-- B2. friendly_matches: away_team_id, played_at, home_team_name, away_team_name, status kolonları eksik
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS away_team_id TEXT;
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS played_at TIMESTAMPTZ;
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS home_team_name TEXT;
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS away_team_name TEXT;
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- B3. profiles: credits kolonu var mı kontrol et
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fans INTEGER DEFAULT 1000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league_name TEXT;

-- ═══════════════════════════════════════════════════════════════
-- C. YANLIŞ İNDEKSLERİN DÜZELTİLMESİ
-- ═══════════════════════════════════════════════════════════════

-- C1. players tablosu: owner_team_id YOK, profile_id ve team_name var
-- Eski yanlış indeksi bırak, yenisini oluştur
DROP INDEX IF EXISTS idx_players_owner_team_id;
CREATE INDEX IF NOT EXISTS idx_players_profile_id ON players (profile_id);
CREATE INDEX IF NOT EXISTS idx_players_team_name ON players (team_name);

-- C2. matches tablosu YOK, fixtures kullanılıyor
DROP INDEX IF EXISTS idx_matches_match_date;
DROP INDEX IF EXISTS idx_matches_home_team_id;
DROP INDEX IF EXISTS idx_matches_away_team_id;
CREATE INDEX IF NOT EXISTS idx_fixtures_match_date ON fixtures (match_date);
CREATE INDEX IF NOT EXISTS idx_fixtures_home_team_id ON fixtures (home_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_away_team_id ON fixtures (away_team_id);

-- C3. league_table YOK, league_standings kullanılıyor
-- league_table.season YOK, league_standings.season_id var
DROP INDEX IF EXISTS idx_league_table_season;
DROP INDEX IF EXISTS idx_league_table_team_id;
DROP INDEX IF EXISTS idx_league_table_season_team;
CREATE INDEX IF NOT EXISTS idx_league_standings_season_id ON league_standings (season_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_team_id ON league_standings (team_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_season_team ON league_standings (season_id, team_id);

-- ═══════════════════════════════════════════════════════════════
-- D. REALTIME — Yeni tabloları realtime yayınına ekle
-- ═══════════════════════════════════════════════════════════════
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE match_events;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE match_participants;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE friendly_queue;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE friendly_matches;
EXCEPTION WHEN others THEN NULL;
END $$;
