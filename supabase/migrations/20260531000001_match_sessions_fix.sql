-- S1-1 FIX: match_sessions tablosuna eksik kolonlar
-- Kod bu kolonlara yazıyor ama schema'da tanımlı değildi

ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS match_date TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_tactic TEXT DEFAULT 'normal';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_tactic TEXT DEFAULT 'normal';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_formation TEXT DEFAULT '4-4-2';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_formation TEXT DEFAULT '4-4-2';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_goal_mod REAL DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_goal_mod REAL DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_conceed_mod REAL DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_conceed_mod REAL DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_tactic_obj JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_tactic_obj JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS referee_data JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_team_name TEXT DEFAULT '';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_team_name TEXT DEFAULT '';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_team_id UUID;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_team_id UUID;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS simulation_speed REAL DEFAULT 3.0;

-- S3-1 FIX: live_matches tablosuna eksik kolonlar
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS home_team_id UUID;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS away_team_id UUID;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS home_team_name TEXT DEFAULT '';
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS away_team_name TEXT DEFAULT '';
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_name TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_personality TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_strictness REAL;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS home_possession INTEGER DEFAULT 50;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS total_events INTEGER DEFAULT 0;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS revealed_events INTEGER DEFAULT 0;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES match_sessions(id);
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- S3-5 FIX: Atmosphere data for match simulation
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_atmosphere JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_atmosphere JSONB DEFAULT '{}';

-- S3-6 FIX: Cup season ID on fixtures for reliable bracket matching
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS cup_season_id TEXT;
