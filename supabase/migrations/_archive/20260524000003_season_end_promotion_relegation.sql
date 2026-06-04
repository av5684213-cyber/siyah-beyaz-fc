-- ============================================================
-- Migration: Sezon sonu küme düşme/yükselme + rozet + lig geçmişi
-- Tarih: 2026-05-24
-- Açıklama:
--   1. league_history tablosu: Sezon sonu arşiv kayıtları
--   2. profiles.badges sütunu: Şampiyonluk rozetleri
--   3. league_tier güncelleme desteği
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. league_history tablosu
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS league_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  league_id TEXT NOT NULL,
  season_id TEXT NOT NULL,
  season_name TEXT,
  champion_team_id TEXT,
  champion_team_name TEXT,
  top_scorer_id TEXT,
  top_scorer_name TEXT,
  mvp_id TEXT,
  mvp_name TEXT,
  relegated_teams JSONB DEFAULT '[]'::jsonb,
  promoted_teams JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index: Lig bazlı geçmiş sorgulama
CREATE INDEX IF NOT EXISTS idx_league_history_league
  ON league_history(league_id, completed_at DESC);

-- RLS
ALTER TABLE league_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read league history" ON league_history
  FOR SELECT USING (true);
CREATE POLICY "Service role can manage league history" ON league_history
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 2. profiles.badges sütunu (yoksa ekle)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- ═══════════════════════════════════════════════════════════════
-- 3. leagues.tier sütunu garanti (küme düşme/yükselme için)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 4;

-- Mevcut liglerin tier'ını güncelle (isimden çıkar)
UPDATE leagues SET tier = 1 WHERE name ILIKE '%1.%' OR name ILIKE 'süper lig%' OR name ILIKE 'super lig%';
UPDATE leagues SET tier = 2 WHERE name ILIKE '%2.%' AND tier = 4;
UPDATE leagues SET tier = 3 WHERE name ILIKE '%3.%' AND tier = 4;
UPDATE leagues SET tier = 4 WHERE name ILIKE '%4.%' AND tier = 4;

-- ═══════════════════════════════════════════════════════════════
-- 4. league_teams tablosuna profile_id index (şampiyon rozeti için)
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_league_teams_profile
  ON league_teams(profile_id) WHERE profile_id IS NOT NULL;
