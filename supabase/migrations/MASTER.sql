-- ═══════════════════════════════════════════════════════════════════════════
-- TOUCHLINE MANAGER — MASTER SQL (idempotent)
--
-- Tek dosyada tüm şema + veri + fix'ler. Tekrar çalıştırılabilir.
-- Supabase Dashboard > SQL Editor > tümünü yapıştır > Run.
-- ═══════════════════════════════════════════════════════════════════════════

-- Helper: fonksiyon varsa drop et (idempotent RPC oluşturmak için)
CREATE OR REPLACE FUNCTION drop_function_if_exists(fname text) RETURNS void AS $$
DECLARE
  frecord RECORD;
BEGIN
  FOR frecord IN
    SELECT pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = fname
  LOOP
    BEGIN
      EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s)', fname, frecord.args);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. PROFILES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  team_name TEXT,
  league_name TEXT DEFAULT '4. Lig',
  league_tier INTEGER DEFAULT 4,
  manager_name TEXT,
  money BIGINT DEFAULT 50000000,
  credits INTEGER DEFAULT 200,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  fans INTEGER DEFAULT 1000,
  current_day INTEGER DEFAULT 1,
  ticket_price INTEGER DEFAULT 35,
  stadium_capacity INTEGER DEFAULT 10000,
  region TEXT DEFAULT 'TR',
  philosophy TEXT DEFAULT 'balanced',
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#ffffff',
  reputation INTEGER DEFAULT 30,
  academy_level INTEGER DEFAULT 1,
  is_bot BOOLEAN DEFAULT false,
  bot_difficulty TEXT,
  role TEXT DEFAULT 'user',
  onboarding_completed BOOLEAN DEFAULT false,
  team_logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league_tier INTEGER DEFAULT 4;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_logo TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bot_difficulty TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ffp_restricted BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_newspaper_applied TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_income_breakdown JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_wins INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_losses INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS held_amount BIGINT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scout_slots INTEGER DEFAULT 0;

-- [56] PROFILES — 25 eksik kolon (4. hata raporu)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stadium_upgrades JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tv_revenue_weekly BIGINT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league_position INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_week INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS defense_powers JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academy_extra_slots INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_finish_day INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_speedup BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_started_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_end_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stadium_name TEXT DEFAULT 'Stadyum';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academy_weekly_budget INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_youth_intake_season TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_trophies INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_awards INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS season_badges JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hof_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_coaches INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_physios INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_monthly_fees BIGINT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_weekly_income BIGINT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_weekly_expense BIGINT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_weekly_net BIGINT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS financial_health JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_regen BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prev_tactic JSONB;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. LEAGUES + SEASONS + LEAGUE_TEAMS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  name TEXT,
  current_tur INTEGER DEFAULT 0,
  is_finished BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS current_tur INTEGER DEFAULT 0;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS is_finished BOOLEAN DEFAULT false;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

CREATE TABLE IF NOT EXISTS league_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#000000',
  is_bot BOOLEAN DEFAULT false,
  is_npc BOOLEAN DEFAULT false,
  bot_difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS is_npc BOOLEAN DEFAULT false;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS bot_difficulty TEXT;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#000000';
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS played INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS won INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS drawn INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS lost INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS gf INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS ga INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_league_teams_league ON league_teams(league_id);
CREATE INDEX IF NOT EXISTS idx_league_teams_profile ON league_teams(profile_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. PLAYERS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  team_name TEXT,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  specific_position TEXT,
  rating INTEGER DEFAULT 50,
  potential INTEGER DEFAULT 60,
  hidden_potential INTEGER DEFAULT 60,
  age INTEGER DEFAULT 20,
  height INTEGER DEFAULT 180,
  weight INTEGER DEFAULT 75,
  nation TEXT DEFAULT 'TR',
  preferred_foot TEXT DEFAULT 'Right' CHECK (preferred_foot IN ('Left', 'Right', 'Both')),
  speed INTEGER DEFAULT 50,
  power INTEGER DEFAULT 50,
  passing INTEGER DEFAULT 50,
  shooting INTEGER DEFAULT 50,
  defending INTEGER DEFAULT 50,
  vision INTEGER DEFAULT 50,
  control INTEGER DEFAULT 50,
  heading INTEGER DEFAULT 50,
  goalkeeping INTEGER DEFAULT 10,
  cond INTEGER DEFAULT 100,
  form INTEGER DEFAULT 60,
  morale INTEGER DEFAULT 60,
  confidence INTEGER DEFAULT 60,
  market_value BIGINT DEFAULT 500000,
  salary INTEGER DEFAULT 5000,
  personality JSONB DEFAULT '{}',
  archetype TEXT,
  traits JSONB DEFAULT '[]',
  is_for_sale BOOLEAN DEFAULT false,
  is_injured BOOLEAN DEFAULT false,
  injury_history JSONB DEFAULT '[]',
  match_ratings JSONB DEFAULT '[]',
  contract_end_week INTEGER DEFAULT 34,
  is_free_agent BOOLEAN DEFAULT false,
  form_rating INTEGER DEFAULT 50,
  scouted BOOLEAN DEFAULT false,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE players ADD COLUMN IF NOT EXISTS specific_position TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS hidden_potential INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS archetype TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS traits JSONB DEFAULT '[]';
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_injured BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_history JSONB DEFAULT '[]';
ALTER TABLE players ADD COLUMN IF NOT EXISTS match_ratings JSONB DEFAULT '[]';
ALTER TABLE players ADD COLUMN IF NOT EXISTS contract_end_week INTEGER DEFAULT 34;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_free_agent BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS form_rating INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS scouted BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS goals INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS assists INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS yellow_cards INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS red_cards INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS first_touch INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS off_the_ball INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS work_rate INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS long_shots INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS acceleration INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS agility INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS stamina INTEGER DEFAULT 60;
ALTER TABLE players ADD COLUMN IF NOT EXISTS jumping INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS left_foot INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS right_foot INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS determination INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS aggression INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS bravery INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS decisions INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS concentration INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS leadership INTEGER DEFAULT 30;
ALTER TABLE players ADD COLUMN IF NOT EXISTS anticipation INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS flair INTEGER DEFAULT 20;
ALTER TABLE players ADD COLUMN IF NOT EXISTS positioning INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS composure INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS teamwork INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS vision INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS finishing INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS dribbling INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS crossing INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS marking INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS tackling INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS technique INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS heading INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS season_yellow_cards INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS clean_sheets INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS control INTEGER DEFAULT 50;

-- [57] PLAYERS — 21 eksik kolon (4. hata raporu)
ALTER TABLE players ADD COLUMN IF NOT EXISTS tackling_detailed INTEGER DEFAULT 40;
ALTER TABLE players ADD COLUMN IF NOT EXISTS left_foot_detailed INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS right_foot_detailed INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS chemistry INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_legend BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS scouting_stars INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS scouting_count INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS suspended_until INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_end_date DATE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_severity TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS play_style TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS trait_levels JSONB DEFAULT '{}';
ALTER TABLE players ADD COLUMN IF NOT EXISTS style_levels JSONB DEFAULT '{}';
ALTER TABLE players ADD COLUMN IF NOT EXISTS special_role TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_starter BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS squad_no INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS sale_price BIGINT DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_retiring BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS last_match_rating INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_regen BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS strength INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_type TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_duration INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_start_week INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_end_week INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS secondary_positions TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_players_profile ON players(profile_id);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_name);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. FIXTURES + MATCH_EVENTS + MATCH_SESSIONS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  home_team_id UUID REFERENCES league_teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES league_teams(id) ON DELETE CASCADE,
  tur INTEGER NOT NULL,
  match_date DATE,
  match_time TEXT DEFAULT '12:00',
  status TEXT DEFAULT 'scheduled',
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  competition_type TEXT DEFAULT 'league',
  referee_name TEXT,
  referee_personality TEXT,
  referee_strictness INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS competition_type TEXT DEFAULT 'league';
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS match_time TEXT DEFAULT '12:00';
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_name TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_personality TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_strictness INTEGER;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_fixtures_season ON fixtures(season_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON fixtures(status);
CREATE INDEX IF NOT EXISTS idx_fixtures_home ON fixtures(home_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_away ON fixtures(away_team_id);

CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  minute INTEGER NOT NULL,
  team TEXT,
  player_name TEXT,
  player_id TEXT,
  description TEXT,
  data JSONB DEFAULT '{}',
  is_revealed BOOLEAN DEFAULT true,
  detail TEXT,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS is_revealed BOOLEAN DEFAULT true;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS detail TEXT;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_match_events_fixture_minute ON match_events(fixture_id, minute);
CREATE INDEX IF NOT EXISTS idx_match_events_fixture_type ON match_events(fixture_id, event_type);

CREATE TABLE IF NOT EXISTS match_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pre_match',
  current_minute INTEGER DEFAULT 0,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  events JSONB DEFAULT '[]',
  home_players JSONB DEFAULT '[]',
  away_players JSONB DEFAULT '[]',
  -- [BUG-8] home_tactic / away_tactic = playStyle string ('tiki-taka' vb.)
  -- Obje için home_tactic_obj / away_tactic_obj kullanılır
  home_tactic TEXT,
  away_tactic TEXT,
  weather TEXT DEFAULT 'sunny',
  referee_id TEXT,
  started_at TIMESTAMPTZ,
  last_tick_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  match_date TIMESTAMPTZ,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  retention_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS match_date TIMESTAMPTZ;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMPTZ;
-- [BUG-8] match-scheduler playStyle string'i JSONB'ye insert edemiyor — TEXT yap
ALTER TABLE match_sessions ALTER COLUMN home_tactic TYPE TEXT USING home_tactic::text;
ALTER TABLE match_sessions ALTER COLUMN away_tactic TYPE TEXT USING away_tactic::text;
-- [BUG-8] match-scheduler'ın insert ettiği ek sütunlar
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_formation TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_formation TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_goal_mod FLOAT DEFAULT 1.0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_goal_mod FLOAT DEFAULT 1.0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_conceed_mod FLOAT DEFAULT 1.0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_conceed_mod FLOAT DEFAULT 1.0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_tactic_obj JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_tactic_obj JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS referee_data JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_team_name TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_team_name TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_team_id UUID;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_team_id UUID;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS simulation_speed FLOAT DEFAULT 1.0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_atmosphere JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_match_sessions_fixture ON match_sessions(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_sessions_home_team ON match_sessions(home_team_id);
CREATE INDEX IF NOT EXISTS idx_match_sessions_away_team ON match_sessions(away_team_id);
CREATE INDEX IF NOT EXISTS idx_match_sessions_status ON match_sessions(status);

-- retention trigger
CREATE OR REPLACE FUNCTION set_match_session_retention()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at = NEW.completed_at + INTERVAL '365 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_match_session_retention ON match_sessions;
CREATE TRIGGER trg_match_session_retention
  BEFORE INSERT OR UPDATE ON match_sessions
  FOR EACH ROW EXECUTE FUNCTION set_match_session_retention();

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. STAFF + STAFF_TYPES (RLS DISABLED — service role key yok diye)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS staff_types (
  type TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  max_count INTEGER NOT NULL DEFAULT 1,
  base_salary INTEGER NOT NULL DEFAULT 0,
  description TEXT
);
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS name_tr TEXT;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS max_count INTEGER;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS base_salary INTEGER;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS description TEXT;

INSERT INTO staff_types (type, name_tr, max_count, base_salary, description) VALUES
  ('scout', 'Gözlemci', 3, 100000, 'Transfer piyasasında oyuncu keşfi yapar'),
  ('coach', 'Yardımcı Antrenör', 3, 150000, 'Antrenman kalitesini artırır'),
  ('physio', 'Fizyoterapist', 3, 80000, 'Sakatlık iyileşme süresini kısaltır'),
  ('youth_coordinator', 'Gençlik Koordinatörü', 2, 120000, 'Altyapıdan oyuncu yetiştirir'),
  ('sporting_director', 'Sportif Direktör', 1, 200000, 'Transfer stratejisi oluşturur'),
  ('analyst', 'Maç Analisti', 2, 60000, 'Rakip analiz raporları hazırlar')
ON CONFLICT (type) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  max_count = EXCLUDED.max_count,
  base_salary = EXCLUDED.base_salary,
  description = EXCLUDED.description;

CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL REFERENCES staff_types(type),
  stars INTEGER NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 5),
  name TEXT NOT NULL,
  contract_start_week INTEGER DEFAULT 1,
  contract_end_week INTEGER DEFAULT 34,
  total_cost INTEGER DEFAULT 0,
  salary_weekly INTEGER DEFAULT 0,
  hired_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS stars INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS contract_start_week INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS contract_end_week INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS total_cost INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS salary_weekly INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS hired_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_type ON staff(user_id, type);

-- RLS DISABLE (service role key eklenene kadar)
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_types DISABLE ROW LEVEL SECURITY;

-- Tüm policy'leri temizle
DO $$ BEGIN
  DROP POLICY IF EXISTS "Kullanici kendi personelini gorebilir" ON staff;
  DROP POLICY IF EXISTS "Kullanici kendi personelini ekleyebilir" ON staff;
  DROP POLICY IF EXISTS "Kullanici kendi personelini silebilir" ON staff;
  DROP POLICY IF EXISTS "Staff select own" ON staff;
  DROP POLICY IF EXISTS "Staff insert own" ON staff;
  DROP POLICY IF EXISTS "Staff update own" ON staff;
  DROP POLICY IF EXISTS "Staff delete own" ON staff;
  DROP POLICY IF EXISTS "staff_select_all" ON staff;
  DROP POLICY IF EXISTS "staff_insert_all" ON staff;
  DROP POLICY IF EXISTS "staff_update_all" ON staff;
  DROP POLICY IF EXISTS "staff_delete_all" ON staff;
  DROP POLICY IF EXISTS "staff_types_select_all" ON staff_types;
  DROP POLICY IF EXISTS "staff_types_insert_all" ON staff_types;
  DROP POLICY IF EXISTS "staff_types_update_all" ON staff_types;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. OTHER TABLES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS active_tactics (
  id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  formation TEXT DEFAULT '4-4-2',
  mentality INTEGER DEFAULT 3,
  pressing BOOLEAN DEFAULT false,
  passing_style TEXT DEFAULT 'mixed',
  line_height INTEGER DEFAULT 50,
  aggression INTEGER DEFAULT 50,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_state (
  id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  focus TEXT DEFAULT 'balanced',
  intensity INTEGER DEFAULT 50,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_facilities (
  profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  stadium_level INTEGER DEFAULT 1,
  training_level INTEGER DEFAULT 1,
  medical_level INTEGER DEFAULT 1,
  youth_level INTEGER DEFAULT 1,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_academy (
  profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  slots JSONB DEFAULT '[]',
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, player_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

CREATE TABLE IF NOT EXISTS notification_preferences (
  profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  description TEXT,
  target INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0,
  reward JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scouted_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT,
  player_data JSONB,
  scouted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_career_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  matches INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  sponsor_name TEXT,
  sponsor_type TEXT,
  amount BIGINT DEFAULT 0,
  duration_weeks INTEGER DEFAULT 0,
  start_week INTEGER,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  operation_type VARCHAR(100) NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  personality TEXT DEFAULT 'dengeci',
  experience INTEGER DEFAULT 5,
  league_id UUID REFERENCES leagues(id),
  strictness INTEGER DEFAULT 50,
  total_matches INTEGER DEFAULT 0,
  total_yellows INTEGER DEFAULT 0,
  total_reds INTEGER DEFAULT 0,
  total_penalties INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── league_id kolonunu NULL yapılabilir yap ───────────────────────────
ALTER TABLE referees ALTER COLUMN league_id DROP NOT NULL;

-- ─── Check constraint'i kaldır (Türkçe/İngilizce karışık değerler için) ──
ALTER TABLE referees DROP CONSTRAINT IF EXISTS referees_personality_check;

-- ─── Hakem seed verisi (18 hakem — Türkçe personality değerleri) ────────
INSERT INTO referees (id, name, personality, experience, league_id, strictness, total_matches, total_yellows, total_reds, total_penalties) VALUES
  ('ref-general-01', 'Mehmet Yıldız', 'katil', 7, NULL, 75, 0, 0, 0, 0),
  ('ref-general-02', 'Ahmet Kaya', 'dengeci', 5, NULL, 50, 0, 0, 0, 0),
  ('ref-general-03', 'Mustafa Demir', 'hosgorulu', 4, NULL, 25, 0, 0, 0, 0),
  ('ref-general-04', 'Ali Şahin', 'ev_sahibi', 6, NULL, 55, 0, 0, 0, 0),
  ('ref-general-05', 'Hasan Yıldırım', 'degisken', 5, NULL, 45, 0, 0, 0, 0),
  ('ref-general-06', 'İbrahim Öztürk', 'var_sever', 6, NULL, 40, 0, 0, 0, 0),
  ('ref-general-07', 'Yusuf Aydın', 'katil', 8, NULL, 78, 0, 0, 0, 0),
  ('ref-general-08', 'Murat Özdemir', 'dengeci', 5, NULL, 52, 0, 0, 0, 0),
  ('ref-general-09', 'Emre Arslan', 'hosgorulu', 3, NULL, 28, 0, 0, 0, 0),
  ('ref-general-10', 'Burak Doğan', 'ev_sahibi', 7, NULL, 58, 0, 0, 0, 0),
  ('ref-general-11', 'Serkan Kılıç', 'degisken', 4, NULL, 42, 0, 0, 0, 0),
  ('ref-general-12', 'Hakan Aslan', 'var_sever', 6, NULL, 38, 0, 0, 0, 0),
  ('ref-general-13', 'Tolga Çetin', 'katil', 7, NULL, 76, 0, 0, 0, 0),
  ('ref-general-14', 'Erkan Koç', 'dengeci', 5, NULL, 51, 0, 0, 0, 0),
  ('ref-general-15', 'Kemal Kurt', 'hosgorulu', 4, NULL, 26, 0, 0, 0, 0),
  ('ref-general-16', 'Cemal Özkan', 'ev_sahibi', 6, NULL, 56, 0, 0, 0, 0),
  ('ref-general-17', 'Selim Şimşek', 'degisken', 5, NULL, 44, 0, 0, 0, 0),
  ('ref-general-18', 'Kadir Polat', 'var_sever', 7, NULL, 41, 0, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  reset_time TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 minute',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key)
);

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT,
  error_message TEXT,
  error_stack TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  week INTEGER,
  income BIGINT DEFAULT 0,
  expense BIGINT DEFAULT 0,
  balance BIGINT DEFAULT 0,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. MATCHMAKING / MESSAGING / MULTIPLAYER
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS manager_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  other_profile_id TEXT,
  other_manager_name TEXT,
  other_manager_team TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manager_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES manager_conversations(id) ON DELETE CASCADE,
  sender_id TEXT,
  receiver_id TEXT,
  content TEXT,
  message_type TEXT DEFAULT 'chat',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manager_presence (
  profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  status_text TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  profile_id TEXT,
  team_name TEXT,
  content TEXT,
  message_type TEXT DEFAULT 'chat',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT,
  message_type TEXT,
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  is_responded BOOLEAN DEFAULT false,
  response TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS league_forum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  topic TEXT,
  content TEXT,
  is_pinned BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES league_forum(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS season_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  final_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS active_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  operation_type TEXT,
  target_id TEXT,
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  data JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT,
  amount BIGINT DEFAULT 0,
  weeks_remaining INTEGER DEFAULT 0,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trophy_cabinet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  trophy_type TEXT,
  trophy_name TEXT,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hall_of_fame (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT,
  player_name TEXT,
  achievement TEXT,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cron_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lock_key TEXT UNIQUE NOT NULL,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  locked_by TEXT
);

-- ═══ EKSİK TABLOLAR (2. hata raporundan) ═══

-- [26] league_standings — puan tablosu
CREATE TABLE IF NOT EXISTS league_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  team_id UUID REFERENCES league_teams(id) ON DELETE CASCADE,
  profile_id TEXT,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  gf INTEGER DEFAULT 0,
  ga INTEGER DEFAULT 0,
  gd INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  form TEXT,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(season_id, team_id)
);
CREATE INDEX IF NOT EXISTS idx_league_standings_season ON league_standings(season_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_league ON league_standings(league_id);

-- [27] training_attendances — antrenman katılımı
CREATE TABLE IF NOT EXISTS training_attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  training_date DATE DEFAULT CURRENT_DATE,
  attended BOOLEAN DEFAULT true,
  intensity INTEGER DEFAULT 50,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_training_attendances_player ON training_attendances(player_id);
CREATE INDEX IF NOT EXISTS idx_training_attendances_profile ON training_attendances(profile_id);

-- [28] live_matches — canlı maç takibi (match_sessions ile birleştirilebilir ama ayrı tutuluyor)
CREATE TABLE IF NOT EXISTS live_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  current_minute INTEGER DEFAULT 0,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pre_match',
  home_possession INTEGER DEFAULT 50,
  away_possession INTEGER DEFAULT 50,
  home_shots INTEGER DEFAULT 0,
  away_shots INTEGER DEFAULT 0,
  home_shots_on_target INTEGER DEFAULT 0,
  away_shots_on_target INTEGER DEFAULT 0,
  last_event TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- [BUG-8] match-scheduler'ın live_matches insert ettiği ek sütunlar
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS home_team_id UUID;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS away_team_id UUID;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS home_team_name TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS away_team_name TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS weather TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_name TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_personality TEXT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS referee_strictness FLOAT;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS total_events INTEGER DEFAULT 0;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS revealed_events INTEGER DEFAULT 0;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS session_id UUID;
CREATE INDEX IF NOT EXISTS idx_live_matches_fixture ON live_matches(fixture_id);
CREATE INDEX IF NOT EXISTS idx_live_matches_session ON live_matches(session_id);
CREATE INDEX IF NOT EXISTS idx_live_matches_status ON live_matches(status);
CREATE INDEX IF NOT EXISTS idx_live_matches_home_team ON live_matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_live_matches_away_team ON live_matches(away_team_id);

-- [28b] match_participants — RLS ve match_chat erişimi için (BUG-8)
CREATE TABLE IF NOT EXISTS match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id UUID NOT NULL,
  profile_id UUID,
  side TEXT NOT NULL CHECK (side IN ('home', 'away')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fixture_id, team_id)
);
CREATE INDEX IF NOT EXISTS idx_match_participants_fixture ON match_participants(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_team ON match_participants(team_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_profile ON match_participants(profile_id);
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "match_participants_select_all" ON match_participants;
DROP POLICY IF EXISTS "match_participants_insert_all" ON match_participants;
DROP POLICY IF EXISTS "match_participants_update_all" ON match_participants;
CREATE POLICY "match_participants_select_all" ON match_participants FOR SELECT USING (true);
CREATE POLICY "match_participants_insert_all" ON match_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "match_participants_update_all" ON match_participants FOR UPDATE USING (true);

-- [29] match_player_stats — maç sonrası oyuncu istatistikleri
CREATE TABLE IF NOT EXISTS match_player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  player_id TEXT,
  player_name TEXT,
  team TEXT,
  position TEXT,
  rating INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 90,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_match_player_stats_fixture ON match_player_stats(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_player_stats_player ON match_player_stats(player_id);

-- [30] trainings — antrenman programları
CREATE TABLE IF NOT EXISTS trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  training_type TEXT DEFAULT 'balanced',
  intensity INTEGER DEFAULT 50,
  focus TEXT,
  player_ids TEXT[] DEFAULT '{}',
  session_date DATE DEFAULT CURRENT_DATE,
  results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trainings_profile ON trainings(profile_id);

CREATE TABLE IF NOT EXISTS transfer_market (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  seller_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  seller_name TEXT,
  asking_price BIGINT DEFAULT 0,
  price BIGINT DEFAULT 0,
  min_price BIGINT DEFAULT 0,
  max_price BIGINT DEFAULT 0,
  status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  is_auction BOOLEAN DEFAULT false,
  starting_price BIGINT DEFAULT 0,
  reserve_price BIGINT DEFAULT 0,
  current_bid BIGINT DEFAULT 0,
  bid_count INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  player_data JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loan_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  owner_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  fee BIGINT DEFAULT 0,
  duration_weeks INTEGER DEFAULT 4,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_development_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  week INTEGER,
  rating_before INTEGER,
  rating_after INTEGER,
  change_reason TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT,
  keys JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- generate_league_fixtures: [BUG-8 DÜZELTME] 12:00 ve 18:00 slot, Pzt-Per iş günleri, idempotent
SELECT drop_function_if_exists('generate_league_fixtures');
CREATE OR REPLACE FUNCTION generate_league_fixtures(p_season_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_league_id uuid;
    v_team_ids uuid[];
    v_n integer;
    v_total_rounds integer;
    v_round integer;
    v_match integer;
    v_half integer;
    v_home_id uuid;
    v_away_id uuid;
    v_match_date date;
    v_team_ids_rotating uuid[];
    v_fixed_id uuid;
    v_last_id uuid;
    v_match_time text;
    v_match_count integer;
    v_existing_count integer;
    v_base_date date;
    v_target_dow integer;
    v_days_to_add integer;
BEGIN
    SELECT league_id INTO v_league_id FROM seasons WHERE id = p_season_id;
    IF v_league_id IS NULL THEN RETURN; END IF;

    -- [BUG-8] İdempotency: Bu sezon için zaten fikstür varsa tekrar üretme
    SELECT count(*) INTO v_existing_count FROM fixtures WHERE season_id = p_season_id;
    IF v_existing_count > 0 THEN
        RAISE NOTICE 'Sezon % için zaten % fikstür mevcut, üretim atlanıyor.', p_season_id, v_existing_count;
        RETURN;
    END IF;

    SELECT array_agg(id ORDER BY id) INTO v_team_ids
    FROM league_teams WHERE league_id = v_league_id;

    v_n := array_length(v_team_ids, 1);
    IF v_n IS NULL OR v_n < 2 THEN RETURN; END IF;

    IF v_n % 2 != 0 THEN
        v_team_ids := v_team_ids || '00000000-0000-0000-0000-000000000000'::uuid;
        v_n := v_n + 1;
    END IF;

    v_total_rounds := v_n - 1;
    v_half := v_n / 2;
    v_fixed_id := v_team_ids[1];
    v_team_ids_rotating := v_team_ids[2:v_n];

    -- [BUG-8] İlk maç günü = yarın, ama Pzt-Cum arası bir iş günü olsun
    -- 0=Paz, 1=Pzt, 2=Sal, 3=Çar, 4=Per, 5=Cum, 6=Cmt
    -- Hafta içi = Pzt-Cum (1-5), hafta sonu = Cmt-Paz (0,6) lig maçı yok
    v_base_date := CURRENT_DATE + 1;
    v_target_dow := EXTRACT(DOW FROM v_base_date)::integer;
    -- Cmt(6)/Paz(0) ise sonraki Pazartesi'ye kaydır
    IF v_target_dow = 6 THEN v_days_to_add := 2;       -- Cmt → Pzt (+2)
    ELSIF v_target_dow = 0 THEN v_days_to_add := 1;    -- Paz → Pzt (+1)
    ELSE v_days_to_add := 0;
    END IF;
    v_match_date := v_base_date + v_days_to_add;

    FOR v_round IN 1..v_total_rounds LOOP
        v_team_ids := ARRAY[v_fixed_id];
        FOR i IN 1..array_length(v_team_ids_rotating, 1) LOOP
            v_team_ids := v_team_ids || v_team_ids_rotating[i];
        END LOOP;

        v_match_count := 0;

        FOR v_match IN 0..(v_half - 1) LOOP
            v_home_id := v_team_ids[v_match + 1];
            v_away_id := v_team_ids[v_n - v_match];

            IF v_home_id != '00000000-0000-0000-0000-000000000000'::uuid AND
               v_away_id != '00000000-0000-0000-0000-000000000000'::uuid THEN

                -- [BUG-8] 12:00 ve 18:00 slotları arasında sırayla değiştir
                -- Çift index → 12:00, Tek index → 18:00
                IF v_match_count % 2 = 0 THEN
                    v_match_time := '12:00';
                ELSE
                    v_match_time := '18:00';
                END IF;

                INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status, competition_type)
                VALUES (v_home_id, v_away_id, p_season_id, v_round, v_match_date, v_match_time, 'scheduled', 'league')
                ON CONFLICT DO NOTHING;

                -- Rövanş: v_total_rounds hafta sonra, ters slot
                DECLARE
                    v_return_date date;
                    v_return_dow integer;
                    v_return_offset integer := v_total_rounds;
                    v_return_target_dow integer;
                    v_return_days_to_add integer;
                BEGIN
                    -- İş günü ekle (v_total_rounds hafta sonra)
                    v_return_date := v_match_date + (v_return_offset * 7);
                    v_return_dow := EXTRACT(DOW FROM v_return_date)::integer;
                    IF v_return_dow = 6 THEN v_return_days_to_add := 2;
                    ELSIF v_return_dow = 0 THEN v_return_days_to_add := 1;
                    ELSE v_return_days_to_add := 0;
                    END IF;
                    v_return_date := v_return_date + v_return_days_to_add;

                    -- Ters slot
                    INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status, competition_type)
                    VALUES (v_away_id, v_home_id, p_season_id, v_round + v_total_rounds,
                            v_return_date,
                            CASE WHEN v_match_time = '12:00' THEN '18:00' ELSE '12:00' END,
                            'scheduled', 'league')
                    ON CONFLICT DO NOTHING;
                END;

                v_match_count := v_match_count + 1;
            END IF;
        END LOOP;

        v_last_id := v_team_ids_rotating[array_length(v_team_ids_rotating, 1)];
        FOR i IN array_length(v_team_ids_rotating, 1)..2 LOOP
            v_team_ids_rotating[i] := v_team_ids_rotating[i-1];
        END LOOP;
        v_team_ids_rotating[1] := v_last_id;
        -- [BUG-8] Bir sonraki tur için 1 iş günü ekle (Pzt-Cum)
        -- Eğer cuma ise 3 gün ekle (Pzt'ye), değilse 1 gün ekle
        DECLARE
            v_next_dow integer;
            v_next_offset integer;
        BEGIN
            v_next_dow := EXTRACT(DOW FROM v_match_date)::integer;
            IF v_next_dow = 5 THEN v_next_offset := 3;   -- Cum → Pzt
            ELSE v_next_offset := 1;                       -- Pzt→Sal, Sal→Çar, Çar→Per, Per→Cum
            END IF;
            v_match_date := v_match_date + v_next_offset;
        END;
    END LOOP;
END;
$$;

-- assign_bot_to_user
SELECT drop_function_if_exists('assign_bot_to_user');
CREATE OR REPLACE FUNCTION assign_bot_to_user(
  p_profile_id TEXT,
  p_team_name TEXT,
  p_manager_name TEXT DEFAULT 'Menajer',
  p_philosophy TEXT DEFAULT 'balanced',
  p_color1 TEXT DEFAULT '#ffffff',
  p_color2 TEXT DEFAULT '#000000',
  p_region TEXT DEFAULT 'TR'
)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_bot_team RECORD;
  v_league_id UUID;
  v_league_name TEXT;
  v_old_profile_id UUID;
BEGIN
  SET LOCAL lock_timeout = '5s';

  SELECT lt.id, lt.league_id, lt.name AS old_team_name, lt.profile_id AS old_profile_id
  INTO v_bot_team
  FROM league_teams lt
  JOIN leagues l ON l.id = lt.league_id
  WHERE (lt.is_bot = true OR lt.is_npc = true)
    AND lt.profile_id IS NULL
    AND l.tier = 4
  ORDER BY lt.id
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_bot_available');
  END IF;

  SELECT id, name INTO v_league_id, v_league_name FROM leagues WHERE id = v_bot_team.league_id;

  UPDATE league_teams
  SET profile_id = p_profile_id, is_bot = false, is_npc = false, name = p_team_name, color = p_color1
  WHERE id = v_bot_team.id;

  IF v_bot_team.old_profile_id IS NOT NULL THEN
    UPDATE players SET profile_id = p_profile_id, team_name = p_team_name
    WHERE profile_id = v_bot_team.old_profile_id;
    DELETE FROM profiles WHERE id = v_bot_team.old_profile_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'league_id', v_league_id,
    'league_name', COALESCE(v_league_name, '4. Lig'), 'team_slot_id', v_bot_team.id, 'took_over_bot', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'reason', SQLERRM);
END;
$$;

-- increment_player_stat
SELECT drop_function_if_exists('increment_player_stat');
CREATE OR REPLACE FUNCTION increment_player_stat(
  p_player_id TEXT,
  p_stat TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_stat = 'goals' THEN
    UPDATE players SET goals = COALESCE(goals, 0) + p_amount WHERE id = p_player_id;
  ELSIF p_stat = 'assists' THEN
    UPDATE players SET assists = COALESCE(assists, 0) + p_amount WHERE id = p_player_id;
  ELSIF p_stat = 'yellow_cards' THEN
    UPDATE players SET yellow_cards = COALESCE(yellow_cards, 0) + p_amount WHERE id = p_player_id;
  ELSIF p_stat = 'red_cards' THEN
    UPDATE players SET red_cards = COALESCE(red_cards, 0) + p_amount WHERE id = p_player_id;
  END IF;
END;
$$;

-- cleanup_expired_match_sessions
CREATE OR REPLACE FUNCTION cleanup_expired_match_sessions()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE deleted_count INTEGER;
BEGIN
  DELETE FROM match_sessions WHERE retention_expires_at IS NOT NULL AND retention_expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ═══ TRANSFER RPC'LERİ ═══

-- [31a] rpc_list_player_on_market — oyuncuyu transfer listesine ekle
CREATE OR REPLACE FUNCTION rpc_list_player_on_market(
  p_seller_id TEXT,
  p_player_id TEXT,
  p_price BIGINT,
  p_min_price BIGINT,
  p_max_price BIGINT,
  p_seller_name TEXT
)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_listing_id UUID;
BEGIN
  -- Önce aynı oyuncunun aktif listing'i var mı kontrol et
  SELECT id INTO v_listing_id FROM transfer_market
  WHERE player_id = p_player_id AND status = 'active' LIMIT 1;

  IF v_listing_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_listed');
  END IF;

  INSERT INTO transfer_market (player_id, seller_id, asking_price, status, is_auction, created_at)
  VALUES (p_player_id, p_seller_id, p_price, 'active', false, NOW())
  RETURNING id INTO v_listing_id;

  -- Oyuncuyu satılık olarak işaretle
  UPDATE players SET is_for_sale = true WHERE id = p_player_id;

  RETURN jsonb_build_object('success', true, 'listing_id', v_listing_id);
END;
$$;

-- [31b] rpc_market_buy — oyuncuyu transferden satın al (atomik)
CREATE OR REPLACE FUNCTION rpc_market_buy(
  p_listing_id UUID,
  p_buyer_id TEXT,
  p_buyer_team TEXT
)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_listing transfer_market%ROWTYPE;
  v_seller_money BIGINT;
  v_buyer_money BIGINT;
  v_price BIGINT;
  v_tax BIGINT;
  v_seller_revenue BIGINT;
  v_player_id TEXT;
BEGIN
  -- Listing'i kilitle ve al
  SELECT * INTO v_listing FROM transfer_market
  WHERE id = p_listing_id AND status = 'active'
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_found_or_inactive');
  END IF;

  v_price := v_listing.asking_price;
  v_tax := ROUND(v_price * 0.10);
  v_seller_revenue := v_price - v_tax;
  v_player_id := v_listing.player_id;

  -- Alıcı bakiyesi kontrol
  SELECT money INTO v_buyer_money FROM profiles WHERE id = p_buyer_id;
  IF v_buyer_money IS NULL OR v_buyer_money < v_price THEN
    RETURN jsonb_build_object('success', false, 'reason', 'insufficient_funds');
  END IF;

  -- Satıcı bakiyesini artır
  UPDATE profiles SET money = money + v_seller_revenue WHERE id = v_listing.seller_id;

  -- Alıcı bakiyesini düş
  UPDATE profiles SET money = money - v_price WHERE id = p_buyer_id;

  -- Oyuncuyu transfer et
  UPDATE players SET profile_id = p_buyer_id, team_name = p_buyer_team, is_for_sale = false
  WHERE id = v_player_id;

  -- Listing'i kapat
  UPDATE transfer_market SET status = 'sold' WHERE id = p_listing_id;

  RETURN jsonb_build_object(
    'success', true,
    'price', v_price,
    'tax_amount', v_tax,
    'seller_revenue', v_seller_revenue,
    'player_id', v_player_id
  );
END;
$$;

-- [31c] rpc_cancel_listing — transfer listesini iptal et
CREATE OR REPLACE FUNCTION rpc_cancel_listing(
  p_listing_id UUID,
  p_seller_id TEXT
)
RETURNS JSONB LANGUAGE plpgsql AS $$
BEGIN
  UPDATE transfer_market SET status = 'cancelled'
  WHERE id = p_listing_id AND seller_id = p_seller_id AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- [31d] rpc_accept_transfer — transfer teklifini kabul et
CREATE OR REPLACE FUNCTION rpc_accept_transfer(
  p_listing_id UUID,
  p_seller_id TEXT
)
RETURNS JSONB LANGUAGE plpgsql AS $$
BEGIN
  UPDATE transfer_market SET status = 'accepted'
  WHERE id = p_listing_id AND seller_id = p_seller_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- [31e] rpc_train_player — oyuncuyu antrenman yap (mevcut RPC ile aynı)
-- Bu RPC zaten mevcut olabilir, DROP IF EXISTS ile güvenli
SELECT drop_function_if_exists('rpc_train_player');
CREATE OR REPLACE FUNCTION rpc_train_player(
  p_player_id TEXT,
  p_profile_id TEXT,
  p_focus TEXT DEFAULT 'balanced'
)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_player players%ROWTYPE;
  v_gain INTEGER;
BEGIN
  SELECT * INTO v_player FROM players WHERE id = p_player_id AND profile_id = p_profile_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'player_not_found');
  END IF;

  v_gain := 1 + floor(random() * 3);
  UPDATE players SET
    finishing = LEAST(99, COALESCE(finishing, 40) + CASE WHEN p_focus = 'attacking' THEN v_gain ELSE 0 END),
    tackling = LEAST(99, COALESCE(tackling, 40) + CASE WHEN p_focus = 'defending' THEN v_gain ELSE 0 END),
    passing = LEAST(99, COALESCE(passing, 40) + CASE WHEN p_focus = 'balanced' THEN v_gain ELSE 0 END),
    cond = GREATEST(0, COALESCE(cond, 100) - 5)
  WHERE id = p_player_id;

  RETURN jsonb_build_object('success', true, 'gain', v_gain);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. RLS POLICIES (public read for most tables)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referees ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_types ENABLE ROW LEVEL SECURITY;
-- staff DISABLED yukarıda

-- [37] transfer_market, loan_listings ve yeni tablolar için RLS
ALTER TABLE transfer_market ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "transfer_market_select_all" ON transfer_market FOR SELECT USING (true);
  CREATE POLICY "transfer_market_insert_all" ON transfer_market FOR INSERT WITH CHECK (true);
  CREATE POLICY "transfer_market_update_all" ON transfer_market FOR UPDATE USING (true);
  CREATE POLICY "transfer_market_delete_all" ON transfer_market FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "loan_listings_select_all" ON loan_listings FOR SELECT USING (true);
  CREATE POLICY "loan_listings_insert_all" ON loan_listings FOR INSERT WITH CHECK (true);
  CREATE POLICY "loan_listings_update_all" ON loan_listings FOR UPDATE USING (true);
  CREATE POLICY "loan_listings_delete_all" ON loan_listings FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "league_standings_select_all" ON league_standings FOR SELECT USING (true);
  CREATE POLICY "league_standings_insert_all" ON league_standings FOR INSERT WITH CHECK (true);
  CREATE POLICY "league_standings_update_all" ON league_standings FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "live_matches_select_all" ON live_matches FOR SELECT USING (true);
  CREATE POLICY "live_matches_insert_all" ON live_matches FOR INSERT WITH CHECK (true);
  CREATE POLICY "live_matches_update_all" ON live_matches FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "match_player_stats_select_all" ON match_player_stats FOR SELECT USING (true);
  CREATE POLICY "match_player_stats_insert_all" ON match_player_stats FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "training_attendances_select_all" ON training_attendances FOR SELECT USING (true);
  CREATE POLICY "training_attendances_insert_all" ON training_attendances FOR INSERT WITH CHECK (true);
  CREATE POLICY "training_attendances_update_all" ON training_attendances FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "trainings_select_all" ON trainings FOR SELECT USING (true);
  CREATE POLICY "trainings_insert_all" ON trainings FOR INSERT WITH CHECK (true);
  CREATE POLICY "trainings_update_all" ON trainings FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
  CREATE POLICY "profiles_insert_all" ON profiles FOR INSERT WITH CHECK (true);
  CREATE POLICY "profiles_update_all" ON profiles FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "leagues_select_all" ON leagues FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "seasons_select_all" ON seasons FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "league_teams_select_all" ON league_teams FOR SELECT USING (true);
  CREATE POLICY "league_teams_insert_all" ON league_teams FOR INSERT WITH CHECK (true);
  CREATE POLICY "league_teams_update_all" ON league_teams FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "players_select_all" ON players FOR SELECT USING (true);
  CREATE POLICY "players_insert_all" ON players FOR INSERT WITH CHECK (true);
  CREATE POLICY "players_update_all" ON players FOR UPDATE USING (true);
  CREATE POLICY "players_delete_all" ON players FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "fixtures_select_all" ON fixtures FOR SELECT USING (true);
  CREATE POLICY "fixtures_insert_all" ON fixtures FOR INSERT WITH CHECK (true);
  CREATE POLICY "fixtures_update_all" ON fixtures FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "match_events_select_all" ON match_events FOR SELECT USING (true);
  CREATE POLICY "match_events_insert_all" ON match_events FOR INSERT WITH CHECK (true);
  CREATE POLICY "match_events_update_all" ON match_events FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "match_sessions_select_all" ON match_sessions FOR SELECT USING (true);
  CREATE POLICY "match_sessions_insert_all" ON match_sessions FOR INSERT WITH CHECK (true);
  CREATE POLICY "match_sessions_update_all" ON match_sessions FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "referees_select_all" ON referees FOR SELECT USING (true);
  CREATE POLICY "referees_insert_all" ON referees FOR INSERT WITH CHECK (true);
  CREATE POLICY "referees_update_all" ON referees FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "staff_types_select_all" ON staff_types FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. REALTIME (_replica identity)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE match_chat REPLICA IDENTITY FULL;
ALTER TABLE manager_messages REPLICA IDENTITY FULL;
ALTER TABLE manager_conversations REPLICA IDENTITY FULL;
ALTER TABLE manager_presence REPLICA IDENTITY FULL;
ALTER TABLE match_events REPLICA IDENTITY FULL;
ALTER TABLE match_sessions REPLICA IDENTITY FULL;
ALTER TABLE fixtures REPLICA IDENTITY FULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 11. DOĞRULAMA
-- ═══════════════════════════════════════════════════════════════════════════
SELECT 'profiles' as tbl, COUNT(*) as cnt FROM profiles
UNION ALL SELECT 'leagues', COUNT(*) FROM leagues
UNION ALL SELECT 'seasons', COUNT(*) FROM seasons
UNION ALL SELECT 'league_teams', COUNT(*) FROM league_teams
UNION ALL SELECT 'players', COUNT(*) FROM players
UNION ALL SELECT 'fixtures', COUNT(*) FROM fixtures
UNION ALL SELECT 'staff_types', COUNT(*) FROM staff_types
UNION ALL SELECT 'staff', COUNT(*) FROM staff
UNION ALL SELECT 'referees', COUNT(*) FROM referees;

-- ═══════════════════════════════════════════════════════════════════════════
-- TAMAMLANDI.
-- Bu dosya idempotent'tir — istediğin kadar çalıştır, hata vermez.
-- Tek dosyada tüm şema + RPC + RLS + seed verileri.
-- ═══════════════════════════════════════════════════════════════════════════
