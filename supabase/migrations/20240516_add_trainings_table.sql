-- ═══════════════════════════════════════════════════════════════
-- Training Logs Tablosu
-- Antrenman sonuçlarını kaydetmek için
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS trainings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL,
  team_name TEXT,
  session_type TEXT NOT NULL DEFAULT 'morning',  -- 'morning' (15:00) veya 'afternoon' (21:00)
  training_date DATE NOT NULL DEFAULT CURRENT_DATE,
  training_time TEXT NOT NULL DEFAULT '15:00',
  player_results JSONB DEFAULT '[]'::jsonb,     -- [{player_id, player_name, position, stats_gained: {stat: value}, cond_change, morale_change}]
  avg_cond_change NUMERIC DEFAULT 0,
  avg_morale_change NUMERIC DEFAULT 0,
  total_players INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Politikaları
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi antrenmanlarını görebilir
CREATE POLICY "Users can view own trainings"
  ON trainings FOR SELECT
  USING (profile_id = auth.uid()::text);

-- Kullanıcılar kendi antrenmanlarını kaydedebilir
CREATE POLICY "Users can insert own trainings"
  ON trainings FOR INSERT
  WITH CHECK (profile_id = auth.uid()::text);

-- Index: profile_id + training_date (son antrenmanları hızlı çekmek için)
CREATE INDEX IF NOT EXISTS idx_trainings_profile_date
  ON trainings (profile_id, training_date DESC);
