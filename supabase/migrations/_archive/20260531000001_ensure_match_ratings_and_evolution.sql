-- ============================================================
-- Migration: match_ratings sütunu garanti + weekly_evolution log tablosu
-- Tarih: 2026-05-31
-- Açıklama:
--   1. players tablosunda match_ratings JSONB sütunu yoksa ekle
--   2. match_ratings için index oluştur (sorgu performansı)
--   3. weekly_evolution_logs tablosu oluştur (cron sonuçlarını izlemek için)
-- ============================================================

-- 1. match_ratings sütunu (yoksa ekle)
ALTER TABLE players ADD COLUMN IF NOT EXISTS match_ratings JSONB DEFAULT '[]'::jsonb;

-- 2. match_ratings için GIN index (JSONB sorgularını hızlandır)
CREATE INDEX IF NOT EXISTS idx_players_match_ratings ON players USING gin (match_ratings);

-- 3. weekly_evolution_logs tablosu (cron sonuçlarını izle)
CREATE TABLE IF NOT EXISTS weekly_evolution_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  total_players INTEGER NOT NULL DEFAULT 0,
  updated_players INTEGER NOT NULL DEFAULT 0,
  high_growth INTEGER NOT NULL DEFAULT 0,
  low_growth INTEGER NOT NULL DEFAULT 0,
  no_match INTEGER NOT NULL DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  duration_ms INTEGER
);

-- 4. match_ratings'i NULL olan kayıtları boş array ile güncelle
UPDATE players SET match_ratings = '[]'::jsonb WHERE match_ratings IS NULL;

-- 5. RLS policy for weekly_evolution_logs (sadece service_role erişebilir)
ALTER TABLE weekly_evolution_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage evolution logs" ON weekly_evolution_logs
  FOR ALL USING (auth.role() = 'service_role');
