-- ============================================================
-- GÖREV 3: Gençlik akademisi sezon başı üretimi senkronizasyonu
-- ============================================================

-- 1. youth_players tablosu: season_intake_used kolonu ekle
-- Her profil/sezon için alımın yalnızca bir kez yapılabildiğini takip eder
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS season_intake_used BOOLEAN DEFAULT FALSE;

-- 2. profiles tablosuna academy_level kolonu ekle (user_facilities tablosu yoksa fallback)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academy_level INTEGER DEFAULT 1;

-- 3. seasons tablosuna intake_completed kolonu ekle
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS intake_completed BOOLEAN DEFAULT FALSE;

-- 4. youth_players tablosu yoksa oluştur
CREATE TABLE IF NOT EXISTS youth_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  player_id VARCHAR(100) NOT NULL,
  player_name VARCHAR(200),
  position VARCHAR(10),
  rating INTEGER,
  potential INTEGER,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  season_intake_used BOOLEAN DEFAULT FALSE,
  UNIQUE(profile_id, player_id)
);

-- İndeks
CREATE INDEX IF NOT EXISTS idx_youth_players_profile ON youth_players(profile_id);

-- RLS
DO $$ BEGIN
  ALTER TABLE youth_players ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can read own youth players" ON youth_players FOR SELECT USING (profile_id = auth.uid()::text);
  CREATE POLICY "Users can insert own youth players" ON youth_players FOR INSERT WITH CHECK (profile_id = auth.uid()::text);
EXCEPTION WHEN others THEN
  -- Policies may already exist
  NULL;
END $$;
