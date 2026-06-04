-- ============================================================
-- Migration: training_attendances + player_development_log tabloları
-- Tarih: 2026-05-31
-- Açıklama:
--   1. training_attendances: Bireysel oyuncu antrenman katılım kayıtları
--   2. player_development_log: Oyuncu gelişim geçmişi (OVR değişiklikleri)
--   3. trainings tablosuna player_ids sütunu garanti
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. training_attendances tablosu
-- Her antrenman seansında katılan her oyuncu için bir kayıt
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS training_attendances (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL,
  training_date DATE NOT NULL DEFAULT CURRENT_DATE,
  training_type TEXT NOT NULL DEFAULT 'morning' CHECK (training_type IN ('morning', 'afternoon')),
  training_id TEXT,  -- İsteğe bağlı: trainings tablosundaki kayda referans
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index: Oyuncunun son 7 gün katılımlarını hızlı sorgulama
CREATE INDEX IF NOT EXISTS idx_training_attendances_player_date
  ON training_attendances(player_id, training_date DESC);

-- Index: Profile bazlı sorgulama
CREATE INDEX IF NOT EXISTS idx_training_attendances_profile
  ON training_attendances(profile_id, training_date DESC);

-- RLS
ALTER TABLE training_attendances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own training attendances" ON training_attendances
  FOR SELECT USING (profile_id = auth.uid()::text);
CREATE POLICY "Service role can manage training attendances" ON training_attendances
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 2. player_development_log tablosu (yoksa oluştur, varsa alter)
-- Oyuncu OVR değişikliklerinin geçmişi
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS player_development_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT NOT NULL,
  profile_id TEXT,
  team_name TEXT,
  old_ovr NUMERIC NOT NULL,
  new_ovr NUMERIC NOT NULL,
  change_reason TEXT NOT NULL DEFAULT 'weekly_training',
  training_sessions INTEGER DEFAULT 0,
  training_contribution NUMERIC DEFAULT 0,
  match_performance_contribution NUMERIC DEFAULT 0,
  potential_bonus NUMERIC DEFAULT 0,
  age_penalty NUMERIC DEFAULT 0,
  season_week INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eski tablo varsa yeni sütunları ekle
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS change_reason TEXT DEFAULT 'weekly_training';
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS match_performance_contribution NUMERIC DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS season_week INTEGER;

-- Index: Oyuncu bazlı gelişim geçmişi
CREATE INDEX IF NOT EXISTS idx_player_dev_log_player
  ON player_development_log(player_id, created_at DESC);

-- Index: Profile bazlı sorgulama
CREATE INDEX IF NOT EXISTS idx_player_dev_log_profile
  ON player_development_log(profile_id, created_at DESC);

-- RLS
ALTER TABLE player_development_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own development logs" ON player_development_log
  FOR SELECT USING (profile_id = auth.uid()::text);
CREATE POLICY "Service role can manage development logs" ON player_development_log
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 3. trainings tablosuna player_ids sütunu garanti
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS player_ids JSONB DEFAULT '[]'::jsonb;
