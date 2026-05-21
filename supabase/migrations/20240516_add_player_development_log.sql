-- ═══════════════════════════════════════════════════════════════
-- Player Development Log Tablosu (DUZELTILMIS VERSIYON)
-- Oyuncu OVR değişimlerini kaydeder
-- DÜZELTME: CREATE POLICY ifadeleri DO $$ ... EXCEPTION ile sarıldı
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS player_development_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT NOT NULL,
  profile_id TEXT,
  team_name TEXT,
  old_ovr NUMERIC NOT NULL,
  new_ovr NUMERIC NOT NULL,
  training_sessions INTEGER DEFAULT 0,
  training_contribution NUMERIC DEFAULT 0,
  potential_bonus NUMERIC DEFAULT 0,
  age_penalty NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE player_development_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own development logs"
    ON player_development_log FOR SELECT
    USING (profile_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_dev_log_player
  ON player_development_log (player_id, updated_at DESC);
