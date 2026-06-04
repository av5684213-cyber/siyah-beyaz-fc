-- ═══════════════════════════════════════════════════════════════════
-- PROMPT 1: Hall of Fame Şema Uyumsuzluğu Düzeltme
-- hallOfFameService.ts'in yazmaya çalıştığı kolonlar DB'de yoktu.
-- Bu migration eksik kolonları ekler.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS player_name TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS seasons_played INTEGER DEFAULT 0;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS total_goals INTEGER DEFAULT 0;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS total_assists INTEGER DEFAULT 0;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS total_matches INTEGER DEFAULT 0;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS total_clean_sheets INTEGER DEFAULT 0;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS total_motm INTEGER DEFAULT 0;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS avg_rating NUMERIC DEFAULT 0;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS peak_rating NUMERIC DEFAULT 0;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS legend_tier TEXT DEFAULT 'bronze';
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS is_club_legend BOOLEAN DEFAULT false;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS awards_won JSONB DEFAULT '[]';
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS joined_day INTEGER DEFAULT 0;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS retired_day INTEGER DEFAULT 0;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS retired_season TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS inducted_at TIMESTAMPTZ DEFAULT NOW();
