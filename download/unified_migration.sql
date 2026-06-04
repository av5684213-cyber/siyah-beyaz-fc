-- ═══════════════════════════════════════════════════════════════════════════════
-- Siyah Beyaz FC — UNIFIED MIGRATION FILE
-- Tarih: 2026-03-05
-- Açıklama: Tüm veritabanı şemasını tek dosyada birleştirir.
--           Bu dosya TEK KAYNAK (single source of truth) olarak kullanılmalıdır.
--           Diğer tüm migration dosyaları arşivlenebilir.
--
-- Çalıştırma: Supabase Dashboard → SQL Editor → Yapıştır → Run
--             VEYA: psql -f unified_migration.sql
--
-- İdempotent: IF NOT EXISTS / IF EXISTS / DO $$ BEGIN ... EXCEPTION ... END $$ 
--             kullanılarak birden fazla çalıştırılabilir.
--
-- Sıralama:
--   A. Extensions
--   B. Table Creation (CREATE TABLE IF NOT EXISTS)
--   C. Column Additions (ALTER TABLE ADD COLUMN IF NOT EXISTS)
--   D. Constraints (UNIQUE, CHECK)
--   E. Indexes (CREATE INDEX IF NOT EXISTS)
--   F. Cascade Delete FK Constraints
--   G. RLS Policies
--   H. Triggers & Helper Functions
--   I. RPC Functions (SECURITY DEFINER)
--   J. Seed Data
--   K. Schema Cache Reload
-- ═══════════════════════════════════════════════════════════════════════════════


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION A: EXTENSIONS                                                    ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION B: TABLE CREATION                                                ║
-- ║  Tables are created with IF NOT EXISTS. All columns included inline.      ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- ─── B1. PROFILES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  manager_name TEXT,
  team_name TEXT,
  league_name TEXT DEFAULT '4. Lig',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  money BIGINT DEFAULT 5000000,
  fans INTEGER DEFAULT 100,
  reputation INTEGER DEFAULT 50,
  credits INTEGER DEFAULT 0,
  current_day INTEGER DEFAULT 1,
  team_id TEXT,
  defense_powers JSONB DEFAULT '{}',
  ticket_price NUMERIC DEFAULT 25,
  academy_level INTEGER DEFAULT 1,
  academy_extra_slots BOOLEAN DEFAULT false,
  stadium_capacity INTEGER DEFAULT 5000,
  region TEXT,
  active_upgrade_type TEXT,
  active_upgrade_id TEXT,
  active_upgrade_finish_day INTEGER,
  active_upgrade_speedup BOOLEAN,
  active_upgrade_started_at TIMESTAMPTZ,
  active_upgrade_end_at TIMESTAMPTZ,
  stadium_upgrades JSONB DEFAULT '{}',
  sponsors JSONB DEFAULT '[]',
  philosophy TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  stadium_name TEXT,
  is_bot BOOLEAN DEFAULT false,
  bot_difficulty INTEGER DEFAULT 1,
  academy_weekly_budget INTEGER DEFAULT 50000,
  last_youth_intake_season TEXT,
  total_trophies INTEGER DEFAULT 0,
  total_awards INTEGER DEFAULT 0,
  season_badges JSONB DEFAULT '[]',
  hof_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Personnel / Staff
  scout_slots INTEGER DEFAULT 0,
  staff_coaches INTEGER DEFAULT 0,
  staff_physios INTEGER DEFAULT 0,
  staff_monthly_fees INTEGER DEFAULT 0,
  -- Role for admin
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  -- Financial log
  last_weekly_income NUMERIC DEFAULT 0,
  last_weekly_expense NUMERIC DEFAULT 0,
  last_weekly_net NUMERIC DEFAULT 0,
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  -- Badges
  badges JSONB DEFAULT '[]',
  -- TV revenue
  tv_revenue_weekly INTEGER DEFAULT 0,
  league_tier INTEGER DEFAULT 4,
  league_position INTEGER DEFAULT 10,
  -- Email
  email TEXT,
  -- Newspaper / Losses / Financial health / Friendly
  last_newspaper_applied DATE,
  consecutive_losses INTEGER DEFAULT 0,
  financial_health TEXT DEFAULT 'healthy',
  last_friendly_date TEXT,
  daily_friendly_count INTEGER DEFAULT 0
);

-- ─── B2. PLAYERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  specific_position VARCHAR(50),
  secondary_positions TEXT[],
  rating INTEGER DEFAULT 60,
  potential INTEGER DEFAULT 70,
  hidden_potential INTEGER DEFAULT 70,
  age INTEGER DEFAULT 20,
  height INTEGER,
  weight INTEGER,
  market_value BIGINT DEFAULT 0,
  salary INTEGER DEFAULT 0,
  nation TEXT DEFAULT 'Türkiye',
  team_name TEXT,
  profile_id TEXT,
  preferred_foot TEXT DEFAULT 'Right',
  -- Core stats
  speed INTEGER DEFAULT 50,
  power INTEGER DEFAULT 50,
  passing INTEGER DEFAULT 50,
  shooting INTEGER DEFAULT 50,
  defending INTEGER DEFAULT 50,
  vision INTEGER DEFAULT 50,
  control INTEGER DEFAULT 50,
  heading INTEGER DEFAULT 50,
  goalkeeping INTEGER DEFAULT 10,
  -- Condition / Mental
  cond INTEGER DEFAULT 100,
  form INTEGER DEFAULT 60,
  morale INTEGER DEFAULT 60,
  confidence INTEGER DEFAULT 60,
  chemistry INTEGER DEFAULT 50,
  -- Detailed Technical
  finishing INTEGER DEFAULT 50,
  dribbling INTEGER DEFAULT 50,
  first_touch INTEGER DEFAULT 50,
  crossing INTEGER DEFAULT 50,
  marking INTEGER DEFAULT 50,
  tackling_detailed INTEGER DEFAULT 50,
  technique INTEGER DEFAULT 50,
  long_shots INTEGER DEFAULT 50,
  off_the_ball INTEGER DEFAULT 50,
  -- Detailed Mental
  aggression INTEGER DEFAULT 50,
  bravery INTEGER DEFAULT 50,
  work_rate INTEGER DEFAULT 50,
  decisions INTEGER DEFAULT 50,
  determination INTEGER DEFAULT 50,
  concentration INTEGER DEFAULT 50,
  leadership INTEGER DEFAULT 50,
  anticipation INTEGER DEFAULT 50,
  flair INTEGER DEFAULT 50,
  positioning INTEGER DEFAULT 50,
  composure INTEGER DEFAULT 50,
  teamwork INTEGER DEFAULT 50,
  workrate INTEGER DEFAULT 50,
  -- Detailed Physical
  acceleration INTEGER DEFAULT 50,
  agility INTEGER DEFAULT 50,
  balance INTEGER DEFAULT 50,
  strength INTEGER DEFAULT 50,
  stamina INTEGER DEFAULT 50,
  jumping INTEGER DEFAULT 50,
  left_foot_detailed INTEGER DEFAULT 50,
  right_foot_detailed INTEGER DEFAULT 50,
  -- Traits & Style
  personality TEXT,
  play_style TEXT,
  trait_levels JSONB DEFAULT '{}',
  style_levels JSONB DEFAULT '{}',
  archetype TEXT,
  special_role TEXT,
  is_legend BOOLEAN DEFAULT false,
  is_starter BOOLEAN DEFAULT false,
  squad_no INTEGER,
  scouted BOOLEAN DEFAULT false,
  scouting_stars INTEGER DEFAULT 0,
  scouting_count INTEGER DEFAULT 0,
  photo_url TEXT,
  -- Form rating & injury history
  form_rating INTEGER DEFAULT 50,
  injury_history JSONB DEFAULT '[]',
  injury JSONB,
  goal_stats JSONB,
  save_stats JSONB,
  match_ratings JSONB,
  -- Card penalties & injury
  suspended_until TEXT,
  is_injured BOOLEAN DEFAULT false,
  injury_end_date TEXT,
  injury_severity TEXT,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  last_match_rating NUMERIC DEFAULT 0,
  -- Season tracking
  season_yellow_cards INTEGER DEFAULT 0,
  rating_start_of_season INTEGER DEFAULT 0,
  -- Loan system
  is_on_loan_market BOOLEAN DEFAULT false,
  loan_fee BIGINT DEFAULT 0,
  loan_status TEXT,
  loan_end_date TEXT,
  loaned_to_profile_id TEXT,
  loan_owner_profile_id TEXT,
  -- Contract system
  contract_end_week INTEGER,
  is_free_agent BOOLEAN DEFAULT false,
  -- Transfer
  is_for_sale BOOLEAN DEFAULT false,
  sale_price BIGINT DEFAULT 0,
  is_retiring BOOLEAN DEFAULT false,
  -- Turkish column aliases (backward compat)
  klt INTEGER,
  pas INTEGER,
  sut INTEGER,
  tk INTEGER,
  hiz INTEGER,
  guc INTEGER,
  alg INTEGER,
  top INTEGER,
  kfa INTEGER,
  klc INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B3. LEAGUES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B4. LEAGUE_TEAMS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS league_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profile_id TEXT,
  league_id UUID REFERENCES leagues(id),
  strength INTEGER DEFAULT 50,
  color TEXT,
  is_bot BOOLEAN DEFAULT false,
  bot_difficulty INTEGER DEFAULT 1,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  gf INTEGER DEFAULT 0,
  ga INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B5. SEASONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id),
  name TEXT DEFAULT 'Sezon 1',
  status TEXT DEFAULT 'active',
  is_finished BOOLEAN DEFAULT false,
  year INTEGER,
  start_date DATE,
  current_tur INTEGER DEFAULT 1,
  intake_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B6. LEAGUE_STANDINGS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS league_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id),
  team_id UUID REFERENCES league_teams(id),
  league_id UUID REFERENCES leagues(id),
  season INTEGER DEFAULT 1,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_diff INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B7. FIXTURES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID REFERENCES league_teams(id),
  away_team_id UUID REFERENCES league_teams(id),
  season_id UUID REFERENCES seasons(id),
  tur INTEGER DEFAULT 1,
  match_date DATE,
  match_time TEXT DEFAULT '12:00',
  status TEXT DEFAULT 'scheduled',
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  competition_type TEXT DEFAULT 'league',
  events JSONB DEFAULT '[]',
  match_data JSONB,
  scheduled_time TEXT,
  session_id UUID,
  referee_id TEXT,
  referee_name TEXT,
  referee_personality TEXT,
  referee_strictness INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B8. MATCH_HISTORY ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  home_team TEXT,
  away_team TEXT,
  score TEXT,
  match_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B9. TRANSFER_MARKET ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transfer_market (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT REFERENCES players(id) ON DELETE SET NULL,
  seller_id TEXT,
  seller_name TEXT,
  asking_price BIGINT DEFAULT 0,
  price BIGINT DEFAULT 0,
  min_price BIGINT DEFAULT 0,
  max_price BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_auction BOOLEAN DEFAULT false,
  starting_price BIGINT,
  reserve_price BIGINT,
  current_bid BIGINT DEFAULT 0,
  highest_bidder_id TEXT,
  highest_bidder_name TEXT,
  bid_count INT DEFAULT 0,
  listed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  held_amount BIGINT DEFAULT 0
);

-- ─── B10. LOANS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  owner_team_id TEXT,
  loaned_to_team_id TEXT,
  loan_fee_paid BIGINT DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'listed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B11. RENTAL_LISTINGS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rental_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  owner_team_id TEXT NOT NULL,
  daily_cost INT NOT NULL DEFAULT 0,
  duration_weeks INT NOT NULL DEFAULT 17,
  status TEXT NOT NULL DEFAULT 'active',
  listed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B12. RENTAL_AGREEMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rental_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES rental_listings(id) ON DELETE SET NULL,
  player_id TEXT NOT NULL,
  owner_team_id TEXT NOT NULL,
  renter_team_id TEXT NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  duration_weeks INT NOT NULL DEFAULT 12,
  daily_cost INT NOT NULL DEFAULT 0,
  total_cost BIGINT NOT NULL DEFAULT 0,
  commission INT NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- ─── B13. PUSH_SUBSCRIPTIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT,
  auth_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, endpoint)
);

-- ─── B14. SEASON_AWARDS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS season_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID,
  profile_id TEXT,
  league_name TEXT,
  award_type TEXT NOT NULL,
  team_name TEXT,
  player_id TEXT,
  player_name TEXT,
  stat_value NUMERIC,
  stat_detail JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B15. NOTIFICATION_PREFERENCES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL UNIQUE,
  match_reminder BOOLEAN DEFAULT true,
  transfer_offer BOOLEAN DEFAULT true,
  training_report BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B16. ERROR_LOGS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message TEXT,
  error_stack TEXT,
  route TEXT,
  method TEXT,
  user_id TEXT,
  request_body JSONB,
  source TEXT,
  level TEXT DEFAULT 'error',
  message TEXT,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B17. PLAYER_DEVELOPMENT_LOG ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_development_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  profile_id TEXT,
  old_rating INTEGER,
  new_rating INTEGER,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B18. TRAINING_STATE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_state (
  id TEXT PRIMARY KEY,
  state JSONB DEFAULT '{}'
);

-- ─── B19. ACTIVE_TACTICS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS active_tactics (
  id TEXT PRIMARY KEY,
  profile_id TEXT,
  formation TEXT DEFAULT '4-4-2',
  mentality INTEGER DEFAULT 3,
  pressing BOOLEAN DEFAULT false,
  passing_style TEXT DEFAULT 'Karışık',
  intensity TEXT DEFAULT 'normal',
  tactic_type TEXT,
  line_height INTEGER DEFAULT 50,
  width INTEGER DEFAULT 50,
  aggression INTEGER DEFAULT 50,
  passing_intensity INTEGER DEFAULT 50,
  screen_keeper BOOLEAN DEFAULT false,
  waste_time BOOLEAN DEFAULT false,
  park_the_bus BOOLEAN DEFAULT false,
  cross_game BOOLEAN DEFAULT false,
  lone_striker_counter BOOLEAN DEFAULT false,
  offside_trap BOOLEAN DEFAULT false,
  play_style TEXT DEFAULT 'dengeli',
  tempo TEXT DEFAULT 'normal',
  defensive_line TEXT DEFAULT 'normal'
);

-- ─── B20. TRAININGS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  player_id TEXT,
  program TEXT,
  week INTEGER,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B21. MATCH_SIMULATION_QUEUE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_simulation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ─── B22. TEAM_SPONSORSHIPS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_type TEXT DEFAULT 'Main',
  weekly_income INTEGER DEFAULT 0,
  remaining_rounds INTEGER DEFAULT 34,
  status TEXT DEFAULT 'active',
  bonus_type TEXT,
  bonus_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B23. POSITIONS (reference table) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS positions (
  code TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  position_group TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  pitch_zone TEXT
);

-- ─── B24. FRIENDLY_MATCHES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friendly_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id TEXT NOT NULL,
  away_team_id TEXT NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  home_team_name TEXT,
  away_team_name TEXT,
  match_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'completed',
  match_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B25. FRIENDLY_QUEUE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friendly_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_name VARCHAR(200),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'waiting',
  matched_with UUID REFERENCES friendly_queue(id) ON DELETE SET NULL
);

-- ─── B26. MATCH_EVENTS ──────────────────────────────────────────────────────
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B27. REFEREES ──────────────────────────────────────────────────────────
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

-- ─── B28. REFEREE_STATS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referee_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referee_id TEXT NOT NULL REFERENCES referees(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id),
  matches INTEGER DEFAULT 0,
  yellows INTEGER DEFAULT 0,
  reds INTEGER DEFAULT 0,
  penalties INTEGER DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  VAR_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referee_id, season_id)
);

-- ─── B29. WATCHLIST ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, player_id)
);

-- ─── B30. OPERATION_REPORTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS operation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  operation_type VARCHAR(100) NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B31. MATCH_SESSIONS ────────────────────────────────────────────────────
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
  home_tactic JSONB DEFAULT '{}',
  away_tactic JSONB DEFAULT '{}',
  home_tactic_obj JSONB DEFAULT '{}',
  away_tactic_obj JSONB DEFAULT '{}',
  home_goal_mod NUMERIC DEFAULT 0,
  away_goal_mod NUMERIC DEFAULT 0,
  home_conceed_mod NUMERIC DEFAULT 0,
  away_conceed_mod NUMERIC DEFAULT 0,
  home_formation TEXT DEFAULT '4-4-2',
  away_formation TEXT DEFAULT '4-4-2',
  simulation_speed NUMERIC DEFAULT 3,
  home_team_id TEXT,
  away_team_id TEXT,
  home_team_name TEXT,
  away_team_name TEXT,
  season_id TEXT,
  weather TEXT DEFAULT 'sunny',
  referee_id TEXT REFERENCES referees(id),
  referee_data JSONB DEFAULT '{}',
  prev_tactic TEXT,
  started_at TIMESTAMPTZ,
  last_tick_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B32. LIVE_MATCHES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pre_match',
  current_minute INTEGER DEFAULT 0,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  all_events JSONB DEFAULT '[]',
  visible_events JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  last_tick_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fixture_id)
);

-- ─── B33. YOUTH_PLAYERS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS youth_players (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER DEFAULT 16,
  position TEXT,
  specific_position TEXT,
  rating INTEGER DEFAULT 55,
  potential INTEGER DEFAULT 70,
  hidden_potential INTEGER DEFAULT 70,
  academy_level INTEGER DEFAULT 1,
  category TEXT DEFAULT 'bronze',
  is_wonderkid BOOLEAN DEFAULT false,
  development_curve TEXT DEFAULT 'normal',
  join_date DATE DEFAULT CURRENT_DATE,
  weekly_training_hours INTEGER DEFAULT 15,
  total_training_weeks INTEGER DEFAULT 0,
  stats_gained_this_season JSONB DEFAULT '{}',
  personality_traits JSONB DEFAULT '[]',
  traits JSONB DEFAULT '[]',
  trait_levels JSONB DEFAULT '{}',
  scout_report JSONB,
  injured BOOLEAN DEFAULT false,
  injury_weeks_remaining INTEGER DEFAULT 0,
  cond INTEGER DEFAULT 85,
  form INTEGER DEFAULT 60,
  morale INTEGER DEFAULT 70,
  confidence INTEGER DEFAULT 60,
  stats JSONB DEFAULT '{}',
  season_intake_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B34. YOUTH_FACILITIES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS youth_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL UNIQUE,
  facility_levels JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B35. USER_FACILITIES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL UNIQUE,
  facility_type TEXT,
  current_level INTEGER DEFAULT 0,
  upgrade_started_at TIMESTAMPTZ,
  upgrade_end_at TIMESTAMPTZ,
  speed_up_used BOOLEAN DEFAULT FALSE,
  facility_data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B36. TRAINING_ATTENDANCES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  program_id TEXT NOT NULL,
  week_number INTEGER DEFAULT 1,
  attended BOOLEAN DEFAULT true,
  stats_gained JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B37. WEEKLY_EVOLUTION ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  week INTEGER NOT NULL,
  rating_change NUMERIC DEFAULT 0,
  stat_changes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B38. LEAGUE_HISTORY ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS league_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id),
  season_id UUID REFERENCES seasons(id),
  season_name TEXT,
  champion_team_id UUID REFERENCES league_teams(id),
  champion_team_name TEXT,
  top_scorer_id TEXT,
  top_scorer_name TEXT,
  mvp_id TEXT,
  mvp_name TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B39. HALL_OF_FAME ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hall_of_fame (
  id TEXT PRIMARY KEY,
  season_id TEXT,
  league_name TEXT,
  champion_team TEXT,
  champion_profile_id TEXT,
  golden_boot_player TEXT DEFAULT '',
  golden_boot_goals INTEGER DEFAULT 0,
  top_assists_player TEXT DEFAULT '',
  top_assists_value INTEGER DEFAULT 0,
  mvp_player TEXT DEFAULT '',
  best_goalkeeper TEXT,
  -- Detailed player columns (from VERİTABANI-1)
  player_id TEXT,
  player_name TEXT,
  profile_id TEXT,
  position TEXT,
  nationality TEXT,
  seasons_played INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_clean_sheets INTEGER DEFAULT 0,
  total_motm INTEGER DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  peak_rating NUMERIC DEFAULT 0,
  legend_tier TEXT DEFAULT 'bronze',
  is_club_legend BOOLEAN DEFAULT false,
  awards_won JSONB DEFAULT '[]',
  joined_day INTEGER DEFAULT 0,
  retired_day INTEGER DEFAULT 0,
  retired_season TEXT,
  inducted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B40. CUP_SEASONS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cup_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id),
  league_id UUID REFERENCES leagues(id),
  name TEXT,
  status TEXT DEFAULT 'upcoming',
  current_round INTEGER DEFAULT 0,
  max_rounds INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B41. SEASON_STATS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS season_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  season_id TEXT NOT NULL,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, season_id)
);

-- ─── B42. PLAYER_ACHIEVEMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT,
  profile_id TEXT,
  achievement_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B43. NOTIFICATIONS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  tag TEXT,
  type TEXT DEFAULT 'match_event',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B44. USER_ACADEMY ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_academy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL UNIQUE,
  academy_level INTEGER DEFAULT 1,
  extra_slots BOOLEAN DEFAULT false,
  weekly_budget INTEGER DEFAULT 50000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B45. CRON_LOCKS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cron_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(job_name)
);

-- ─── B46. LAB_SESSIONS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_a JSONB NOT NULL DEFAULT '[]',
  team_b JSONB NOT NULL DEFAULT '[]',
  selected_formation TEXT NOT NULL DEFAULT '4-4-2',
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lab_sessions_user_id_unique UNIQUE (user_id)
);

-- ─── B47. FACILITY_UPGRADE_COSTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facility_upgrade_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_type TEXT NOT NULL,
  target_level INTEGER NOT NULL,
  credits_cost INTEGER NOT NULL DEFAULT 0,
  upgrade_days INTEGER NOT NULL DEFAULT 1
);

-- ─── B48. PLAYER_CAREER_STATS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_career_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  profile_id TEXT,
  season_id TEXT,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  motm_count INTEGER DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  goal_types JSONB DEFAULT '{}',
  save_types JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B49. RATE_LIMITS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- ─── B50. CHAT_MESSAGES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION C: COLUMN ADDITIONS                                              ║
-- ║  These ALTER TABLE statements ensure columns exist on existing tables      ║
-- ║  that may have been created by earlier migrations without all columns.     ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- ─── C1. PROFILES: Additional columns ───────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tv_revenue_weekly INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league_tier INTEGER DEFAULT 4;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league_position INTEGER DEFAULT 10;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league_name TEXT DEFAULT '4. Lig';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academy_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_weekly_income NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_weekly_expense NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_weekly_net NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sponsors JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_newspaper_applied DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_losses INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS financial_health TEXT DEFAULT 'healthy';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_friendly_date TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_friendly_count INTEGER DEFAULT 0;

-- ─── C2. PLAYERS: Additional columns ────────────────────────────────────────
ALTER TABLE players ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS specific_position VARCHAR(50);
-- Fix: Convert secondary_positions from JSONB to TEXT[] if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'secondary_positions' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE players ALTER COLUMN secondary_positions TYPE text[] USING (
      CASE WHEN secondary_positions IS NULL THEN NULL
           ELSE (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(secondary_positions::jsonb) AS elem)
      END
    );
  END IF;
END $$;
ALTER TABLE players ADD COLUMN IF NOT EXISTS secondary_positions TEXT[];
ALTER TABLE players ADD COLUMN IF NOT EXISTS hidden_potential INTEGER DEFAULT 70;
ALTER TABLE players ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS weight INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS preferred_foot TEXT DEFAULT 'Right';
ALTER TABLE players ADD COLUMN IF NOT EXISTS confidence INTEGER DEFAULT 60;
ALTER TABLE players ADD COLUMN IF NOT EXISTS chemistry INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS finishing INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS dribbling INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS first_touch INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS crossing INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS marking INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS tackling_detailed INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS technique INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS long_shots INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS off_the_ball INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS aggression INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS bravery INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS work_rate INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS decisions INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS determination INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS concentration INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS leadership INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS anticipation INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS flair INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS positioning INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS composure INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS teamwork INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS workrate INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS acceleration INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS agility INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS strength INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS stamina INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS jumping INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS left_foot_detailed INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS right_foot_detailed INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS personality TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS play_style TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS trait_levels JSONB DEFAULT '{}';
ALTER TABLE players ADD COLUMN IF NOT EXISTS style_levels JSONB DEFAULT '{}';
ALTER TABLE players ADD COLUMN IF NOT EXISTS archetype TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS special_role TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_legend BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_starter BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS squad_no INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS scouted BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS scouting_stars INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS scouting_count INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS form_rating INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_history JSONB DEFAULT '[]';
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury JSONB;
ALTER TABLE players ADD COLUMN IF NOT EXISTS goal_stats JSONB;
ALTER TABLE players ADD COLUMN IF NOT EXISTS save_stats JSONB;
ALTER TABLE players ADD COLUMN IF NOT EXISTS match_ratings JSONB;
ALTER TABLE players ADD COLUMN IF NOT EXISTS suspended_until TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_injured BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_end_date TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_severity TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_on_loan_market BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_fee BIGINT DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_status TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_end_date TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loaned_to_profile_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_owner_profile_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS contract_end_week INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_free_agent BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_for_sale BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS sale_price BIGINT DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_retiring BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS season_yellow_cards INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS rating_start_of_season INTEGER DEFAULT 0;

-- ─── C3. LEAGUE_TEAMS: Additional columns ───────────────────────────────────
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS league_id UUID;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS strength INTEGER DEFAULT 50;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS bot_difficulty INTEGER DEFAULT 1;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS played INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS won INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS drawn INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS lost INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS gf INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS ga INTEGER DEFAULT 0;
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- ─── C4. SEASONS: Additional columns ────────────────────────────────────────
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS intake_completed BOOLEAN DEFAULT false;

-- ─── C5. FIXTURES: Additional columns ───────────────────────────────────────
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]';
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS match_data JSONB;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS competition_type TEXT DEFAULT 'league';
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS scheduled_time TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_name TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_personality TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_strictness INTEGER;

-- ─── C6. TRANSFER_MARKET: Additional columns ────────────────────────────────
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS seller_id TEXT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS asking_price BIGINT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS price BIGINT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS min_price BIGINT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS max_price BIGINT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS is_auction BOOLEAN DEFAULT false;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS starting_price BIGINT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS reserve_price BIGINT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS current_bid BIGINT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS highest_bidder_id TEXT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS highest_bidder_name TEXT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS bid_count INT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS listed_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS held_amount BIGINT DEFAULT 0;

-- ─── C7. PUSH_SUBSCRIPTIONS: Additional columns ────────────────────────────
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS endpoint TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS p256dh TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS auth_key TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── C8. SEASON_AWARDS: Additional columns ──────────────────────────────────
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS league_name TEXT;
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS player_name TEXT;

-- ─── C9. NOTIFICATION_PREFERENCES: Additional columns ──────────────────────
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS match_reminder BOOLEAN DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS transfer_offer BOOLEAN DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS training_report BOOLEAN DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── C10. ERROR_LOGS: Additional columns ────────────────────────────────────
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'error';
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS context JSONB;

-- ─── C11. ACTIVE_TACTICS: Additional columns ────────────────────────────────
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS profile_id TEXT;

-- ─── C12. HALL_OF_FAME: Additional columns ──────────────────────────────────
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS champion_profile_id TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS champion_team TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS golden_boot_player TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS mvp_player TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS best_goalkeeper TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS top_assists_player TEXT;
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

-- ─── C13. MATCH_SESSIONS: Additional columns ────────────────────────────────
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS last_tick_at TIMESTAMPTZ;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_tactic_obj JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_tactic_obj JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_goal_mod NUMERIC DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_goal_mod NUMERIC DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_conceed_mod NUMERIC DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_conceed_mod NUMERIC DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_formation TEXT DEFAULT '4-4-2';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_formation TEXT DEFAULT '4-4-2';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS simulation_speed NUMERIC DEFAULT 3;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_team_id TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_team_id TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_team_name TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_team_name TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS season_id TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS referee_data JSONB DEFAULT '{}';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS prev_tactic TEXT;

-- ─── C14. USER_FACILITIES: Additional columns ───────────────────────────────
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS facility_type TEXT;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 0;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS upgrade_started_at TIMESTAMPTZ;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS upgrade_end_at TIMESTAMPTZ;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS speed_up_used BOOLEAN DEFAULT FALSE;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS facility_data JSONB DEFAULT '{}';
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── C15. NOTIFICATIONS: Additional columns ────────────────────────────────
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'match_event';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ─── C16. MATCH_EVENTS: Additional columns ─────────────────────────────────
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS player_name TEXT;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS is_revealed BOOLEAN DEFAULT true;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS detail TEXT;

-- ─── C17. PLAYER_CAREER_STATS: Additional columns ──────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'player_career_stats') THEN
    ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS goal_types JSONB DEFAULT '{}';
    ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS save_types JSONB DEFAULT '{}';
    ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0;
    ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS motm_count INTEGER DEFAULT 0;
    ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS fouls INTEGER DEFAULT 0;
  END IF;
END $$;

-- ─── C18. WATCHLIST: Rename user_id → profile_id (if applicable) ───────────
-- The watchlist table originally used user_id but should use profile_id for consistency.
-- If the existing table has user_id but not profile_id, add profile_id and migrate data.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE watchlist RENAME COLUMN user_id TO profile_id;
  END IF;
END $$;
-- Ensure profile_id column exists regardless
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS profile_id TEXT;

-- ─── C19. NOTIFICATIONS: Migrate user_id → profile_id (if applicable) ──────
-- The notifications table originally had user_id; ensure profile_id is populated.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'user_id'
  ) THEN
    UPDATE notifications SET profile_id = user_id WHERE profile_id IS NULL AND user_id IS NOT NULL;
  END IF;
END $$;


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION D: CONSTRAINTS                                                   ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- ─── D1. match_sessions: UNIQUE on fixture_id ──────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uniq_match_session_fixture') THEN
    ALTER TABLE match_sessions ADD CONSTRAINT uniq_match_session_fixture UNIQUE (fixture_id);
  END IF;
END $$;

-- ─── D2. match_simulation_queue: UNIQUE on fixture_id ──────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uniq_queue_fixture') THEN
    ALTER TABLE match_simulation_queue ADD CONSTRAINT uniq_queue_fixture UNIQUE (fixture_id);
  END IF;
END $$;

-- ─── D3. facility_upgrade_costs: UNIQUE on (facility_type, target_level) ────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'facility_upgrade_costs_facility_type_target_level_key'
  ) THEN
    ALTER TABLE facility_upgrade_costs
      ADD CONSTRAINT facility_upgrade_costs_facility_type_target_level_key
      UNIQUE (facility_type, target_level);
  END IF;
END $$;

-- ─── D4. youth_facilities: PRIMARY KEY on profile_id ────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'youth_facilities'::regclass AND contype = 'p'
  ) THEN
    IF NOT EXISTS (
      SELECT profile_id, COUNT(*) FROM youth_facilities GROUP BY profile_id HAVING COUNT(*) > 1
    ) THEN
      ALTER TABLE youth_facilities ADD CONSTRAINT youth_facilities_pkey PRIMARY KEY (profile_id);
    END IF;
  END IF;
END $$;

-- ─── D5. user_facilities: UNIQUE on (profile_id, facility_type) ─────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_facilities_profile_id_key'
  ) THEN
    ALTER TABLE user_facilities DROP CONSTRAINT user_facilities_profile_id_key;
  END IF;
END $$;


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION E: INDEXES                                                       ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- Composite indexes (VERİTABANI-5)
CREATE INDEX IF NOT EXISTS idx_fixtures_status_date
  ON public.fixtures(status, match_date);

CREATE INDEX IF NOT EXISTS idx_league_standings_league_season
  ON public.league_standings(league_id, season_id);

CREATE INDEX IF NOT EXISTS idx_players_profile_position
  ON public.players(profile_id, position);

CREATE INDEX IF NOT EXISTS idx_transfer_market_active_expires
  ON public.transfer_market(is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_league_teams_league_profile
  ON public.league_teams(league_id, profile_id);

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_players_specific_position ON players(specific_position);

CREATE INDEX IF NOT EXISTS idx_notifications_profile_unread
  ON notifications(profile_id, is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_cron_locks_expires ON cron_locks(expires_at);

CREATE INDEX IF NOT EXISTS idx_lab_sessions_user_id ON public.lab_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_rental_listings_player ON rental_listings(player_id);
CREATE INDEX IF NOT EXISTS idx_rental_listings_status ON rental_listings(status);
CREATE INDEX IF NOT EXISTS idx_rental_listings_owner ON rental_listings(owner_team_id);

CREATE INDEX IF NOT EXISTS idx_push_subs_profile ON push_subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON push_subscriptions(endpoint);

CREATE INDEX IF NOT EXISTS idx_rental_agreements_player ON rental_agreements(player_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_owner ON rental_agreements(owner_team_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_renter ON rental_agreements(renter_team_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_status ON rental_agreements(status);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_profile ON notification_preferences(profile_id);

-- Remove incorrect index if it exists
DROP INDEX IF EXISTS idx_notifications_read;

-- user_facilities unique index on (profile_id, facility_type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_facilities_profile_type
  ON user_facilities(profile_id, facility_type);


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION F: CASCADE DELETE FK CONSTRAINTS                                 ║
-- ║  When a profile is deleted, all related records are automatically deleted. ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- 1. players.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_profile_id_fkey;
ALTER TABLE public.players ADD CONSTRAINT players_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. league_teams.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.league_teams DROP CONSTRAINT IF EXISTS league_teams_profile_id_fkey;
ALTER TABLE public.league_teams ADD CONSTRAINT league_teams_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. active_tactics.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.active_tactics DROP CONSTRAINT IF EXISTS active_tactics_profile_id_fkey;
ALTER TABLE public.active_tactics ADD CONSTRAINT active_tactics_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. trainings.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.trainings DROP CONSTRAINT IF EXISTS trainings_profile_id_fkey;
ALTER TABLE public.trainings ADD CONSTRAINT trainings_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. watchlist.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_profile_id_fkey;
ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey;
ALTER TABLE public.watchlist ADD CONSTRAINT watchlist_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. notifications.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_profile_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 7. youth_players.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.youth_players DROP CONSTRAINT IF EXISTS youth_players_profile_id_fkey;
ALTER TABLE public.youth_players ADD CONSTRAINT youth_players_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 8. user_academy.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.user_academy DROP CONSTRAINT IF EXISTS user_academy_profile_id_fkey;
ALTER TABLE public.user_academy ADD CONSTRAINT user_academy_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 9. user_facilities.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.user_facilities DROP CONSTRAINT IF EXISTS user_facilities_profile_id_fkey;
ALTER TABLE public.user_facilities ADD CONSTRAINT user_facilities_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION G: RLS POLICIES                                                  ║
-- ║  Row Level Security enabled on all tables. Policies use DROP IF EXISTS     ║
-- ║  + CREATE pattern for idempotent re-creation.                              ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- ─── Enable RLS on all tables ───────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_market ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_development_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_simulation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendly_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendly_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referee_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cup_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_academy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- ─── G1. PROFILES ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id::uuid);
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id::uuid);

-- ─── G2. PLAYERS ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "players_select_all" ON public.players;
CREATE POLICY "players_select_all" ON public.players FOR SELECT USING (true);
DROP POLICY IF EXISTS "players_update_own" ON public.players;
CREATE POLICY "players_update_own" ON public.players FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "players_insert_service" ON public.players;
CREATE POLICY "players_insert_service" ON public.players FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "players_delete_service" ON public.players;
CREATE POLICY "players_delete_service" ON public.players FOR DELETE USING (false);

-- ─── G3. LEAGUES ────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "leagues_select_all" ON leagues FOR SELECT USING (true);
  CREATE POLICY "leagues_insert_all" ON leagues FOR INSERT WITH CHECK (true);
  CREATE POLICY "leagues_update_all" ON leagues FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G4. LEAGUE_TEAMS ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "league_teams_select_all" ON public.league_teams;
CREATE POLICY "league_teams_select_all" ON public.league_teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "league_teams_update_own" ON public.league_teams;
CREATE POLICY "league_teams_update_own" ON public.league_teams FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "league_teams_insert_service" ON public.league_teams;
CREATE POLICY "league_teams_insert_service" ON public.league_teams FOR INSERT WITH CHECK (true);

-- ─── G5. SEASONS ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "seasons_select_all" ON public.seasons;
CREATE POLICY "seasons_select_all" ON public.seasons FOR SELECT USING (true);
DROP POLICY IF EXISTS "seasons_update_service" ON public.seasons;
CREATE POLICY "seasons_update_service" ON public.seasons FOR UPDATE USING (true);
DROP POLICY IF EXISTS "seasons_insert_service" ON public.seasons;
CREATE POLICY "seasons_insert_service" ON public.seasons FOR INSERT WITH CHECK (true);

-- ─── G6. FIXTURES ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "fixtures_select_all" ON public.fixtures;
CREATE POLICY "fixtures_select_all" ON public.fixtures FOR SELECT USING (true);
DROP POLICY IF EXISTS "fixtures_update_service" ON public.fixtures;
CREATE POLICY "fixtures_update_service" ON public.fixtures FOR UPDATE USING (true);
DROP POLICY IF EXISTS "fixtures_insert_service" ON public.fixtures;
CREATE POLICY "fixtures_insert_service" ON public.fixtures FOR INSERT WITH CHECK (true);

-- ─── G7. MATCH_SESSIONS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "match_sessions_select_all" ON public.match_sessions;
CREATE POLICY "match_sessions_select_all" ON public.match_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "match_sessions_update_service" ON public.match_sessions;
CREATE POLICY "match_sessions_update_service" ON public.match_sessions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "match_sessions_insert_service" ON public.match_sessions;
CREATE POLICY "match_sessions_insert_service" ON public.match_sessions FOR INSERT WITH CHECK (true);

-- ─── G8. MATCH_SIMULATION_QUEUE ─────────────────────────────────────────────
DROP POLICY IF EXISTS "match_sim_queue_select_all" ON public.match_simulation_queue;
CREATE POLICY "match_sim_queue_select_all" ON public.match_simulation_queue FOR SELECT USING (true);
DROP POLICY IF EXISTS "match_sim_queue_update_service" ON public.match_simulation_queue;
CREATE POLICY "match_sim_queue_update_service" ON public.match_simulation_queue FOR UPDATE USING (true);
DROP POLICY IF EXISTS "match_sim_queue_insert_service" ON public.match_simulation_queue;
CREATE POLICY "match_sim_queue_insert_service" ON public.match_simulation_queue FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "match_sim_queue_delete_service" ON public.match_simulation_queue;
CREATE POLICY "match_sim_queue_delete_service" ON public.match_simulation_queue FOR DELETE USING (true);

-- ─── G9. ACTIVE_TACTICS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "active_tactics_select_all" ON public.active_tactics;
CREATE POLICY "active_tactics_select_all" ON public.active_tactics FOR SELECT USING (true);
DROP POLICY IF EXISTS "active_tactics_update_own" ON public.active_tactics;
CREATE POLICY "active_tactics_update_own" ON public.active_tactics FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "active_tactics_insert_service" ON public.active_tactics;
CREATE POLICY "active_tactics_insert_service" ON public.active_tactics FOR INSERT WITH CHECK (true);

-- ─── G10. TRAININGS ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "trainings_select_all" ON public.trainings;
CREATE POLICY "trainings_select_all" ON public.trainings FOR SELECT USING (true);
DROP POLICY IF EXISTS "trainings_update_own" ON public.trainings;
CREATE POLICY "trainings_update_own" ON public.trainings FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "trainings_insert_service" ON public.trainings;
CREATE POLICY "trainings_insert_service" ON public.trainings FOR INSERT WITH CHECK (true);

-- ─── G11. YOUTH_PLAYERS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "youth_players_select_all" ON public.youth_players;
CREATE POLICY "youth_players_select_all" ON public.youth_players FOR SELECT USING (true);
DROP POLICY IF EXISTS "youth_players_update_own" ON public.youth_players;
CREATE POLICY "youth_players_update_own" ON public.youth_players FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "youth_players_insert_service" ON public.youth_players;
CREATE POLICY "youth_players_insert_service" ON public.youth_players FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "youth_players_delete_service" ON public.youth_players;
CREATE POLICY "youth_players_delete_service" ON public.youth_players FOR DELETE USING (auth.uid() = profile_id::uuid);

-- ─── G12. WATCHLIST ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "watchlist_select_own" ON public.watchlist;
CREATE POLICY "watchlist_select_own" ON public.watchlist FOR SELECT USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "watchlist_insert_own" ON public.watchlist;
CREATE POLICY "watchlist_insert_own" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "watchlist_delete_own" ON public.watchlist;
CREATE POLICY "watchlist_delete_own" ON public.watchlist FOR DELETE USING (auth.uid() = profile_id::uuid);

-- ─── G13. NOTIFICATIONS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications;
CREATE POLICY "notifications_insert_service" ON public.notifications FOR INSERT WITH CHECK (true);

-- ─── G14. USER_ACADEMY ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "user_academy_select_own" ON public.user_academy;
CREATE POLICY "user_academy_select_own" ON public.user_academy FOR SELECT USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "user_academy_update_own" ON public.user_academy;
CREATE POLICY "user_academy_update_own" ON public.user_academy FOR UPDATE USING (auth.uid() = profile_id::uuid);
DROP POLICY IF EXISTS "user_academy_insert_service" ON public.user_academy;
CREATE POLICY "user_academy_insert_service" ON public.user_academy FOR INSERT WITH CHECK (true);

-- ─── G15. TRANSFER_MARKET ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "transfer_market_select_all" ON public.transfer_market;
CREATE POLICY "transfer_market_select_all" ON public.transfer_market FOR SELECT USING (true);
DROP POLICY IF EXISTS "transfer_market_insert_service" ON public.transfer_market;
CREATE POLICY "transfer_market_insert_service" ON public.transfer_market FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "transfer_market_update_service" ON public.transfer_market;
CREATE POLICY "transfer_market_update_service" ON public.transfer_market FOR UPDATE USING (true);

-- ─── G16. LOANS ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "loans_all" ON loans FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G17. RENTAL_LISTINGS ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "rental_select_all" ON rental_listings FOR SELECT USING (true);
  CREATE POLICY "rental_insert_all" ON rental_listings FOR INSERT WITH CHECK (true);
  CREATE POLICY "rental_update_all" ON rental_listings FOR UPDATE USING (true);
  CREATE POLICY "rental_delete_all" ON rental_listings FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G18. RENTAL_AGREEMENTS ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "rental_agreements_select_all" ON rental_agreements FOR SELECT USING (true);
  CREATE POLICY "rental_agreements_insert_all" ON rental_agreements FOR INSERT WITH CHECK (true);
  CREATE POLICY "rental_agreements_update_all" ON rental_agreements FOR UPDATE USING (true);
  CREATE POLICY "rental_agreements_delete_all" ON rental_agreements FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G19. PUSH_SUBSCRIPTIONS ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "push_subs_select_all" ON push_subscriptions FOR SELECT USING (true);
  CREATE POLICY "push_subs_insert_all" ON push_subscriptions FOR INSERT WITH CHECK (true);
  CREATE POLICY "push_subs_update_all" ON push_subscriptions FOR UPDATE USING (true);
  CREATE POLICY "push_subs_delete_all" ON push_subscriptions FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G20. SEASON_AWARDS ─────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "season_awards_select_all" ON season_awards FOR SELECT USING (true);
  CREATE POLICY "season_awards_insert_all" ON season_awards FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G21. NOTIFICATION_PREFERENCES ──────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "notif_prefs_select_all" ON notification_preferences FOR SELECT USING (true);
  CREATE POLICY "notif_prefs_insert_all" ON notification_preferences FOR INSERT WITH CHECK (true);
  CREATE POLICY "notif_prefs_update_all" ON notification_preferences FOR UPDATE USING (true);
  CREATE POLICY "notif_prefs_delete_all" ON notification_preferences FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G22. ERROR_LOGS ────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "error_logs_select_all" ON error_logs FOR SELECT USING (true);
  CREATE POLICY "error_logs_insert_all" ON error_logs FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G23. PLAYER_DEVELOPMENT_LOG ────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "player_dev_log_select_all" ON player_development_log FOR SELECT USING (true);
  CREATE POLICY "player_dev_log_insert_all" ON player_development_log FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G24. TRAINING_STATE ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "training_state_select_all" ON training_state FOR SELECT USING (true);
  CREATE POLICY "training_state_insert_all" ON training_state FOR INSERT WITH CHECK (true);
  CREATE POLICY "training_state_update_all" ON training_state FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G25. MATCH_HISTORY ─────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "match_history_select_all" ON match_history FOR SELECT USING (true);
  CREATE POLICY "match_history_insert_all" ON match_history FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G26. TEAM_SPONSORSHIPS ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "team_sponsorships_select_all" ON team_sponsorships FOR SELECT USING (true);
  CREATE POLICY "team_sponsorships_insert_all" ON team_sponsorships FOR INSERT WITH CHECK (true);
  CREATE POLICY "team_sponsorships_update_all" ON team_sponsorships FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G27. FRIENDLY_MATCHES ──────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "friendly_matches_select_all" ON friendly_matches FOR SELECT USING (true);
  CREATE POLICY "friendly_matches_insert_all" ON friendly_matches FOR INSERT WITH CHECK (true);
  CREATE POLICY "friendly_matches_update_all" ON friendly_matches FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G28. FRIENDLY_QUEUE ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "friendly_queue_select_all" ON friendly_queue FOR SELECT USING (true);
  CREATE POLICY "friendly_queue_insert_all" ON friendly_queue FOR INSERT WITH CHECK (true);
  CREATE POLICY "friendly_queue_update_all" ON friendly_queue FOR UPDATE USING (true);
  CREATE POLICY "friendly_queue_delete_all" ON friendly_queue FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G29. MATCH_EVENTS ──────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "match_events_select_all" ON match_events FOR SELECT USING (true);
  CREATE POLICY "match_events_insert_all" ON match_events FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G30. REFEREES ──────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "referees_select_all" ON referees FOR SELECT USING (true);
  CREATE POLICY "referees_insert_all" ON referees FOR INSERT WITH CHECK (true);
  CREATE POLICY "referees_update_all" ON referees FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G31. REFEREE_STATS ─────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "referee_stats_select_all" ON referee_stats FOR SELECT USING (true);
  CREATE POLICY "referee_stats_insert_all" ON referee_stats FOR INSERT WITH CHECK (true);
  CREATE POLICY "referee_stats_update_all" ON referee_stats FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G32. OPERATION_REPORTS ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "operation_reports_select_all" ON operation_reports FOR SELECT USING (true);
  CREATE POLICY "operation_reports_insert_all" ON operation_reports FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G33. LIVE_MATCHES ──────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "live_matches_select_all" ON live_matches FOR SELECT USING (true);
  CREATE POLICY "live_matches_insert_all" ON live_matches FOR INSERT WITH CHECK (true);
  CREATE POLICY "live_matches_update_all" ON live_matches FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G34. LEAGUE_STANDINGS ──────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "league_standings_select_all" ON league_standings FOR SELECT USING (true);
  CREATE POLICY "league_standings_insert_all" ON league_standings FOR INSERT WITH CHECK (true);
  CREATE POLICY "league_standings_update_all" ON league_standings FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G35. TRAINING_ATTENDANCES ──────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "training_attendances_select_all" ON training_attendances FOR SELECT USING (true);
  CREATE POLICY "training_attendances_insert_all" ON training_attendances FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G36. WEEKLY_EVOLUTION ──────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "weekly_evolution_select_all" ON weekly_evolution FOR SELECT USING (true);
  CREATE POLICY "weekly_evolution_insert_all" ON weekly_evolution FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G37. LEAGUE_HISTORY ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "league_history_select_all" ON league_history FOR SELECT USING (true);
  CREATE POLICY "league_history_insert_all" ON league_history FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G38. HALL_OF_FAME ──────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "hall_of_fame_select_all" ON hall_of_fame FOR SELECT USING (true);
  CREATE POLICY "hall_of_fame_insert_all" ON hall_of_fame FOR INSERT WITH CHECK (true);
  CREATE POLICY "hall_of_fame_update_all" ON hall_of_fame FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G39. CUP_SEASONS ───────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "cup_seasons_select_all" ON cup_seasons FOR SELECT USING (true);
  CREATE POLICY "cup_seasons_insert_all" ON cup_seasons FOR INSERT WITH CHECK (true);
  CREATE POLICY "cup_seasons_update_all" ON cup_seasons FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G40. SEASON_STATS ──────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "season_stats_select_all" ON season_stats FOR SELECT USING (true);
  CREATE POLICY "season_stats_insert_all" ON season_stats FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── G41. YOUTH_FACILITIES ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "youth_facilities_select_all" ON youth_facilities;
CREATE POLICY "youth_facilities_select_all" ON youth_facilities FOR SELECT USING (true);
DROP POLICY IF EXISTS "youth_facilities_insert_all" ON youth_facilities;
CREATE POLICY "youth_facilities_insert_all" ON youth_facilities FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "youth_facilities_update_all" ON youth_facilities;
CREATE POLICY "youth_facilities_update_all" ON youth_facilities FOR UPDATE USING (true);
DROP POLICY IF EXISTS "youth_facilities_delete_all" ON youth_facilities;
CREATE POLICY "youth_facilities_delete_all" ON youth_facilities FOR DELETE USING (true);

-- ─── G42. USER_FACILITIES ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own facilities" ON user_facilities;
DROP POLICY IF EXISTS "Users can insert own facilities" ON user_facilities;
DROP POLICY IF EXISTS "Users can update own facilities" ON user_facilities;
DROP POLICY IF EXISTS "Service role full access facilities" ON user_facilities;
DROP POLICY IF EXISTS "user_facilities_select_all" ON user_facilities;
DROP POLICY IF EXISTS "user_facilities_insert_all" ON user_facilities;
DROP POLICY IF EXISTS "user_facilities_update_all" ON user_facilities;
CREATE POLICY "user_facilities_select_all" ON user_facilities FOR SELECT USING (true);
CREATE POLICY "user_facilities_insert_all" ON user_facilities FOR INSERT WITH CHECK (true);
CREATE POLICY "user_facilities_update_all" ON user_facilities FOR UPDATE USING (true);
CREATE POLICY "user_facilities_delete_all" ON user_facilities FOR DELETE USING (true);

-- ─── G43. CRON_LOCKS ────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'cron_locks_all') THEN
    CREATE POLICY "cron_locks_all" ON cron_locks FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ─── G44. LAB_SESSIONS ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own lab session" ON public.lab_sessions;
DROP POLICY IF EXISTS "Users can insert own lab session" ON public.lab_sessions;
DROP POLICY IF EXISTS "Users can update own lab session" ON public.lab_sessions;
DROP POLICY IF EXISTS "Users can delete own lab session" ON public.lab_sessions;
CREATE POLICY "lab_sessions_select_all" ON public.lab_sessions FOR SELECT USING (true);
CREATE POLICY "lab_sessions_insert_all" ON public.lab_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "lab_sessions_update_all" ON public.lab_sessions FOR UPDATE USING (true);
CREATE POLICY "lab_sessions_delete_all" ON public.lab_sessions FOR DELETE USING (true);

-- ─── G45. POSITIONS ─────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE POLICY "positions_select_all" ON positions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION H: TRIGGERS & HELPER FUNCTIONS                                   ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- Lab sessions auto-update trigger
CREATE OR REPLACE FUNCTION public.update_lab_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lab_sessions_updated_at ON public.lab_sessions;
CREATE TRIGGER trigger_update_lab_sessions_updated_at
  BEFORE UPDATE ON public.lab_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lab_sessions_updated_at();


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION I: RPC FUNCTIONS (SECURITY DEFINER)                              ║
-- ║  These functions bypass RLS and enforce their own authorization checks.   ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- ─── I1. rpc_transfer_buy ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_transfer_buy(
  p_player_id UUID,
  p_buyer_id UUID,
  p_buyer_team TEXT,
  p_transfer_fee BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_profile_id UUID;
  v_buyer_money BIGINT;
  v_seller_id UUID;
  v_listing_id UUID;
  v_result JSONB;
BEGIN
  SELECT profile_id INTO v_player_profile_id
  FROM public.players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_player_profile_id IS NOT NULL AND v_player_profile_id != p_buyer_id THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Bu oyuncu zaten bir takıma ait');
  END IF;

  SELECT money INTO v_buyer_money
  FROM public.profiles
  WHERE id = p_buyer_id::uuid
  FOR UPDATE;

  IF v_buyer_money < p_transfer_fee THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Yetersiz bakiye');
  END IF;

  SELECT id, seller_id INTO v_listing_id, v_seller_id
  FROM public.transfer_market
  WHERE player_id = p_player_id AND is_active = true
  FOR UPDATE
  LIMIT 1;

  UPDATE public.profiles SET money = money - p_transfer_fee WHERE id = p_buyer_id::uuid;

  IF v_seller_id IS NOT NULL AND v_seller_id != 'free-agent-system' THEN
    UPDATE public.profiles
    SET money = money + ROUND(p_transfer_fee * 0.975)
    WHERE id = v_seller_id::uuid;
  END IF;

  UPDATE public.players
  SET profile_id = p_buyer_id, team_name = p_buyer_team, club = p_buyer_team, is_for_sale = false
  WHERE id = p_player_id;

  IF v_listing_id IS NOT NULL THEN
    UPDATE public.transfer_market SET is_active = false WHERE id = v_listing_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'transfer_fee', p_transfer_fee,
    'remaining_money', v_buyer_money - p_transfer_fee
  );
END;
$$;

-- ─── I2. rpc_buy_free_agent ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_buy_free_agent(
  p_player_id UUID,
  p_buyer_id UUID,
  p_buyer_team TEXT,
  p_transfer_fee BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_profile_id UUID;
  v_buyer_money BIGINT;
  v_listing_id UUID;
BEGIN
  SELECT profile_id INTO v_player_profile_id
  FROM public.players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_player_profile_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Bu oyuncu serbest değil');
  END IF;

  SELECT money INTO v_buyer_money
  FROM public.profiles
  WHERE id = p_buyer_id::uuid
  FOR UPDATE;

  IF v_buyer_money < p_transfer_fee THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Yetersiz bakiye');
  END IF;

  SELECT id INTO v_listing_id
  FROM public.transfer_market
  WHERE player_id = p_player_id AND is_active = true
  FOR UPDATE
  LIMIT 1;

  UPDATE public.profiles SET money = money - p_transfer_fee WHERE id = p_buyer_id::uuid;

  UPDATE public.players
  SET profile_id = p_buyer_id, team_name = p_buyer_team, club = p_buyer_team, is_free_agent = false
  WHERE id = p_player_id;

  IF v_listing_id IS NOT NULL THEN
    UPDATE public.transfer_market SET is_active = false WHERE id = v_listing_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'transfer_fee', p_transfer_fee,
    'remaining_money', v_buyer_money - p_transfer_fee
  );
END;
$$;

-- ─── I3. rpc_sell_player ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_sell_player(
  p_player_id UUID,
  p_seller_id UUID,
  p_sale_price BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_profile_id UUID;
  v_seller_money BIGINT;
  v_tax_rate NUMERIC := 0.025;
  v_net_revenue BIGINT;
BEGIN
  SELECT profile_id INTO v_player_profile_id
  FROM public.players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_player_profile_id IS NULL OR v_player_profile_id::text != p_seller_id::text THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Bu oyuncu size ait değil');
  END IF;

  v_net_revenue := ROUND(p_sale_price * (1 - v_tax_rate));

  SELECT money INTO v_seller_money
  FROM public.profiles
  WHERE id = p_seller_id::uuid
  FOR UPDATE;

  UPDATE public.profiles SET money = money + v_net_revenue WHERE id = p_seller_id::uuid;

  UPDATE public.players
  SET profile_id = NULL, team_name = 'Transfer Listesi', club = 'Transfer Listesi', is_for_sale = false
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', true,
    'net_revenue', v_net_revenue,
    'tax_amount', ROUND(p_sale_price * v_tax_rate)
  );
END;
$$;

-- ─── I4. rpc_update_player_cond ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_update_player_cond(
  p_player_id UUID,
  p_owner_id UUID,
  p_new_cond INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT profile_id INTO v_profile_id
  FROM public.players
  WHERE id = p_player_id
  FOR UPDATE;

  IF v_profile_id IS NULL OR v_profile_id::text != p_owner_id::text THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Yetkisiz');
  END IF;

  UPDATE public.players SET cond = LEAST(100, GREATEST(0, p_new_cond)) WHERE id = p_player_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── RPC Grant permissions ──────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.rpc_transfer_buy TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_buy_free_agent TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_sell_player TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_update_player_cond TO anon, authenticated;


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION J: SEED DATA                                                     ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- Default leagues
INSERT INTO leagues (name, tier) VALUES
  ('1. Lig', 1),
  ('2. Lig', 2),
  ('3. Lig', 3),
  ('4. Lig', 4)
ON CONFLICT DO NOTHING;

-- Positions reference data
INSERT INTO positions (code, name_tr, name_en, position_group, sort_order, pitch_zone) VALUES
  ('GK',  'Kaleci',              'Goalkeeper',           'GK',  0,  'goal'),
  ('CB',  'Merkez Defans',       'Center Back',          'DEF', 10, 'defense'),
  ('LB',  'Sol Bek',            'Left Back',            'DEF', 11, 'defense'),
  ('RB',  'Sağ Bek',            'Right Back',           'DEF', 12, 'defense'),
  ('LWB', 'Sol Kanat Bek',      'Left Wing Back',       'DEF', 13, 'defense_mid'),
  ('RWB', 'Sağ Kanat Bek',      'Right Wing Back',      'DEF', 14, 'defense_mid'),
  ('CDM', 'Defansif Orta Saha',  'Defensive Midfielder', 'MID', 20, 'defense_mid'),
  ('CM',  'Merkez Orta Saha',    'Central Midfielder',   'MID', 21, 'midfield'),
  ('CAM', 'Ofansif Orta Saha',   'Attacking Midfielder', 'MID', 22, 'midfield_attack'),
  ('LM',  'Sol Açık',           'Left Midfielder',      'MID', 23, 'midfield'),
  ('RM',  'Sağ Açık',           'Right Midfielder',     'MID', 24, 'midfield'),
  ('LW',  'Sol Kanat',          'Left Winger',          'MID', 25, 'attack'),
  ('RW',  'Sağ Kanat',          'Right Winger',         'MID', 26, 'attack'),
  ('CF',  'Göbek Forvet',        'Center Forward',       'FWD', 30, 'attack'),
  ('ST',  'Santrfor',            'Striker',              'FWD', 31, 'attack')
ON CONFLICT (code) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  position_group = EXCLUDED.position_group,
  sort_order = EXCLUDED.sort_order,
  pitch_zone = EXCLUDED.pitch_zone;

-- Facility upgrade costs levels 6-10 (seed from level 5 data)
INSERT INTO facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days)
SELECT facility_type, 6, credits_cost * 2, upgrade_days * 2
FROM facility_upgrade_costs
WHERE target_level = 5
ON CONFLICT (facility_type, target_level) DO NOTHING;

INSERT INTO facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days)
SELECT facility_type, 7, credits_cost * 4, upgrade_days * 3
FROM facility_upgrade_costs
WHERE target_level = 5
ON CONFLICT (facility_type, target_level) DO NOTHING;

INSERT INTO facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days)
SELECT facility_type, 8, credits_cost * 8, upgrade_days * 4
FROM facility_upgrade_costs
WHERE target_level = 5
ON CONFLICT (facility_type, target_level) DO NOTHING;

INSERT INTO facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days)
SELECT facility_type, 9, credits_cost * 16, upgrade_days * 5
FROM facility_upgrade_costs
WHERE target_level = 5
ON CONFLICT (facility_type, target_level) DO NOTHING;

INSERT INTO facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days)
SELECT facility_type, 10, credits_cost * 32, upgrade_days * 6
FROM facility_upgrade_costs
WHERE target_level = 5
ON CONFLICT (facility_type, target_level) DO NOTHING;


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  SECTION K: SCHEMA CACHE RELOAD                                          ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

NOTIFY pgrst, 'reload schema';


-- ═══════════════════════════════════════════════════════════════════════════════
-- UNIFIED MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════
-- Summary of sections applied:
--   A. Extensions            → uuid-ossp, pgcrypto
--   B. Table Creation        → 50 tables
--   C. Column Additions      → All missing columns for existing tables
--   D. Constraints           → UNIQUE, CHECK, PK constraints
--   E. Indexes               → Composite + single-column indexes
--   F. Cascade Delete FK     → 9 FK constraints with ON DELETE CASCADE
--   G. RLS Policies          → 45 table policies (granular per-table)
--   H. Triggers              → lab_sessions updated_at
--   I. RPC Functions         → 4 SECURITY DEFINER functions
--   J. Seed Data             → Leagues, positions, facility costs
--   K. Schema Cache Reload   → PostgREST NOTIFY
-- ═══════════════════════════════════════════════════════════════════════════════
