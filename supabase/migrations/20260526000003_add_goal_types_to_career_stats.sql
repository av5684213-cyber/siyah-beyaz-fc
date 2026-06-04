-- PROMPT 8: Add goal_types, save_types, matches_played, motm_count, fouls columns to player_career_stats

ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS goal_types JSONB DEFAULT '{}';
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS save_types JSONB DEFAULT '{}';
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS motm_count INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS fouls INTEGER DEFAULT 0;
