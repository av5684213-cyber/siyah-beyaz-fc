-- ═══════════════════════════════════════════════════════════════════════
-- ADIM 3: Youth Academy Migration
-- Gençlik Akademisi tabloları: youth_players + youth_facilities
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 1. youth_players TABLOSU ─────────────────────────────────────────
-- Her profilin genç oyuncularını saklar. JSONB ile esnek stat saklama.
CREATE TABLE IF NOT EXISTS youth_players (
  id            TEXT PRIMARY KEY,           -- youth_xxxxx_xxxxx formatında ID
  profile_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  age           INTEGER NOT NULL DEFAULT 16,
  position      TEXT NOT NULL,              -- GK, DEF, MID, FWD
  specific_position TEXT NOT NULL DEFAULT 'CM',
  rating        INTEGER NOT NULL DEFAULT 50,
  potential     INTEGER NOT NULL DEFAULT 70,
  hidden_potential INTEGER NOT NULL DEFAULT 75,
  academy_level INTEGER NOT NULL DEFAULT 1,
  category      TEXT NOT NULL DEFAULT 'U19', -- U17, U19, U21
  is_wonderkid  BOOLEAN NOT NULL DEFAULT FALSE,
  development_curve TEXT NOT NULL DEFAULT 'normal', -- early, late, normal, injury_prone
  join_date     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  weekly_training_hours INTEGER NOT NULL DEFAULT 15,
  total_training_weeks  INTEGER NOT NULL DEFAULT 0,
  stats_gained_this_season JSONB NOT NULL DEFAULT '{}',
  personality_traits JSONB NOT NULL DEFAULT '[]',
  traits        JSONB NOT NULL DEFAULT '[]',
  trait_levels  JSONB NOT NULL DEFAULT '{}',
  scout_report  JSONB,                     -- null veya scout raporu objesi
  injured       BOOLEAN NOT NULL DEFAULT FALSE,
  injury_weeks_remaining INTEGER NOT NULL DEFAULT 0,
  cond          INTEGER NOT NULL DEFAULT 85,
  form          INTEGER NOT NULL DEFAULT 60,
  morale        INTEGER NOT NULL DEFAULT 70,
  confidence    INTEGER NOT NULL DEFAULT 60,
  stats         JSONB NOT NULL DEFAULT '{}',  -- tüm detaylı istatistikler
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: profile_id üzerinden hızlı sorgulama
CREATE INDEX IF NOT EXISTS idx_youth_players_profile_id ON youth_players(profile_id);

-- RLS: Kullanıcı sadece kendi genç oyuncularını görsün
ALTER TABLE youth_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY youth_players_select ON youth_players
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY youth_players_insert ON youth_players
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY youth_players_update ON youth_players
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY youth_players_delete ON youth_players
  FOR DELETE USING (profile_id = auth.uid());

-- Service role tam erişim (cron job'lar için)
CREATE POLICY youth_players_service ON youth_players
  FOR ALL USING (true) WITH CHECK (true);


-- ─── 2. youth_facilities TABLOSU ──────────────────────────────────────
-- Her profilin tesis seviyelerini saklar. Tek satır per profile.
CREATE TABLE IF NOT EXISTS youth_facilities (
  profile_id    UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  facility_levels JSONB NOT NULL DEFAULT '{}',  -- {"training_pitch": 2, "gym": 3, ...}
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_youth_facilities_profile_id ON youth_facilities(profile_id);

-- RLS
ALTER TABLE youth_facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY youth_facilities_select ON youth_facilities
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY youth_facilities_insert ON youth_facilities
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY youth_facilities_update ON youth_facilities
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY youth_facilities_delete ON youth_facilities
  FOR DELETE USING (profile_id = auth.uid());

CREATE POLICY youth_facilities_service ON youth_facilities
  FOR ALL USING (true) WITH CHECK (true);


-- ─── 3. profiles TABLOSUNA GÜNCELLEME ─────────────────────────────────
-- academy_weekly_budget: Akademi haftalık bütçe ödeneği
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academy_weekly_budget INTEGER DEFAULT 0;

-- last_youth_intake_season: Son genç alımı yapılan sezon (tekrar kontrolü için)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_youth_intake_season TEXT;
