-- ═══════════════════════════════════════════════════════════════════
-- Migration: Integration Updates (GÖREV 1-5)
-- ═══════════════════════════════════════════════════════════════════

-- GÖREV 3: fixtures tablosuna competition_type kolonu ekle
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS competition_type TEXT DEFAULT 'league'
  CHECK (competition_type IN ('league', 'cup', 'friendly'));

-- GÖREV 1: Stadyum efektleri için facility seviyelerini tutan tablo (zaten user_facilities var)
-- Ek kolon: is_night_match ve is_winter_match bilgisi maçta belirlenir, tablo gereksiz

-- GÖREV 2: trainings tablosuna player_ids kolonu ekle (JSON array)
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS player_ids JSONB DEFAULT '[]';

-- GÖREV 4: scouted_players tablosu 20260527000001 migration'ında oluşturuluyor (TEXT profile_id, FK, ek kolonlar)

-- GÖREV 5: player_achievements tablosuna unique constraint ekle
CREATE UNIQUE INDEX IF NOT EXISTS player_achievements_unique 
  ON player_achievements(player_id, achievement_type, season_id);

-- GÖREV 5: hall_of_fame tablosuna retired_season kolonu ekle
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS retired_season TEXT;

-- Index: fixtures competition_type
CREATE INDEX IF NOT EXISTS idx_fixtures_competition_type ON fixtures(competition_type);

-- Index: trainings profile_id + created_at
CREATE INDEX IF NOT EXISTS idx_trainings_profile_created ON trainings(profile_id, created_at DESC);
