-- ============================================================
-- Integration: Stadium Effects, Cup Competition Type, Scout, HOF
-- ============================================================

-- 1. competition_type kolonu fixtures tablosuna ekle
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fixtures' AND column_name = 'competition_type'
  ) THEN
    ALTER TABLE fixtures ADD COLUMN competition_type VARCHAR(20) DEFAULT 'league';
    COMMENT ON COLUMN fixtures.competition_type IS 'Maç türü: league, cup, friendly';
  END IF;
END $$;

-- 2. competition_type değerini güncelle (mevcut veriler için)
UPDATE fixtures SET competition_type = 'league' WHERE competition_type IS NULL;

-- 3. user_facilities tablosu (stadyum seviyeleri)
CREATE TABLE IF NOT EXISTS user_facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  facility_id VARCHAR(50) NOT NULL,
  level INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, facility_id)
);

-- 4. scouted_players tablosu (keşif sistemi)
CREATE TABLE IF NOT EXISTS scouted_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  player_id VARCHAR(100) NOT NULL,
  player_name VARCHAR(200),
  position VARCHAR(10),
  rating INTEGER,
  potential INTEGER,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, player_id)
);

-- 5. player_achievements tablosu
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id VARCHAR(100) NOT NULL,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  season_id VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, achievement_type, season_id)
);

-- 6. hall_of_fame tablosu
CREATE TABLE IF NOT EXISTS hall_of_fame (
  id VARCHAR(200) PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  player_id VARCHAR(100) NOT NULL,
  player_name VARCHAR(200),
  position VARCHAR(10),
  nationality VARCHAR(100),
  seasons_played INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_clean_sheets INTEGER DEFAULT 0,
  total_motm INTEGER DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  peak_rating INTEGER DEFAULT 0,
  legend_tier VARCHAR(20) DEFAULT 'bronze',
  is_club_legend BOOLEAN DEFAULT FALSE,
  awards_won JSONB DEFAULT '[]',
  joined_day INTEGER,
  retired_day INTEGER,
  retired_season VARCHAR(100),
  inducted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. season_awards tablosu
CREATE TABLE IF NOT EXISTS season_awards (
  id VARCHAR(200) PRIMARY KEY,
  season_id VARCHAR(100),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  league_name VARCHAR(200),
  award_type VARCHAR(50) NOT NULL,
  player_id VARCHAR(100),
  player_name VARCHAR(200),
  team_name VARCHAR(200),
  stat_value NUMERIC,
  stat_detail JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. İndeksler
CREATE INDEX IF NOT EXISTS idx_fixtures_competition_type ON fixtures(competition_type);
CREATE INDEX IF NOT EXISTS idx_user_facilities_profile ON user_facilities(profile_id);
CREATE INDEX IF NOT EXISTS idx_scouted_players_profile ON scouted_players(profile_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_player ON player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_hall_of_fame_profile ON hall_of_fame(profile_id);
CREATE INDEX IF NOT EXISTS idx_season_awards_profile ON season_awards(profile_id);

-- 9. RLS politikaları
ALTER TABLE user_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouted_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own facilities" ON user_facilities FOR SELECT USING (profile_id = auth.uid()::text);
CREATE POLICY "Users can insert own facilities" ON user_facilities FOR INSERT WITH CHECK (profile_id = auth.uid()::text);
CREATE POLICY "Users can update own facilities" ON user_facilities FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "Users can read own scouted players" ON scouted_players FOR SELECT USING (profile_id = auth.uid()::text);
CREATE POLICY "Users can insert own scouted players" ON scouted_players FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "Users can read own achievements" ON player_achievements FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "Users can read own HOF" ON hall_of_fame FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "Users can read own awards" ON season_awards FOR SELECT USING (profile_id = auth.uid()::text);
