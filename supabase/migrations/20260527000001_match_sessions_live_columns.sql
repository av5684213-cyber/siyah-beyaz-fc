-- =============================================================================
-- Match Sessions Live Columns
-- Canlı maç müdahale sistemi için eksik kolonları ekle
-- Tarih: 2026-05-27
-- =============================================================================

-- Taktik objeleri (JSONB) — match-scheduler yazar, match-tick okur
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_tactic_obj JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_tactic_obj JSONB DEFAULT '{}';

-- Taktik modifikatörleri — update-tactic endpoint'i günceller
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_goal_mod NUMERIC DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_goal_mod NUMERIC DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_conceed_mod NUMERIC DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_conceed_mod NUMERIC DEFAULT 0;

-- Formasyon bilgileri
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_formation TEXT DEFAULT '4-4-2';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_formation TEXT DEFAULT '4-4-2';

-- Simülasyon hızı (3 = 30 gerçek dakikada 90 maç dakikası)
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS simulation_speed NUMERIC DEFAULT 3;

-- Takım kimlikleri ve isimleri
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_team_id TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_team_id TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_team_name TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_team_name TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS season_id TEXT;

-- Hakem verisi
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS referee_data JSONB DEFAULT '{}';

-- Taktik değişiklik takibi (PROMPT 6)
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS prev_tactic TEXT;

-- last_tick_at kolonu (last_updated yerine)
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS last_tick_at TIMESTAMPTZ;
