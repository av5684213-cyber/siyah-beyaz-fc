-- ═══════════════════════════════════════════════════════════════════════════
-- Touchline Manager — BİRLEŞİK MİGRASYON DOSYASI (Unified Core Schema)
-- Tarih: 2026-05-25
-- Açıklama: Tüm çekirdek tablolar, kolonlar, indeksler, RLS politikaları,
--           RPC fonksiyonları ve tetikleyicileri tek dosyada birleştirir.
--           supabase db reset ile sıfırdan kurulabilir.
-- ═══════════════════════════════════════════════════════════════════════════
-- NOT: Bu dosya mevcut migration'larla çakışabilir. Sıfırdan kurulum için
-- diğer migration dosyalarını silin ve sadece bu dosyayı kullanın.
-- Mevcut veritabanına uygulama için: IF NOT EXISTS / IF EXISTS kullanılmıştır.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 0: UZANTILAR VE YARDIMCI FONKSİYONLAR
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 1: PROFILES TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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
  -- Badges (champion badges etc.)
  badges JSONB DEFAULT '[]',
  -- TV revenue
  tv_revenue_weekly INTEGER DEFAULT 0,
  league_tier INTEGER DEFAULT 4,
  league_position INTEGER DEFAULT 10
);

-- Profiles: Mevcut tabloya eklenmemiş olabilecek kolonlar
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
  CREATE POLICY "profiles_insert_all" ON profiles FOR INSERT WITH CHECK (true);
  CREATE POLICY "profiles_update_all" ON profiles FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 2: PLAYERS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

-- Players: Mevcut tabloya eklenmemiş olabilecek kolonlar
ALTER TABLE players ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS specific_position VARCHAR(50);
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

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "players_select_all" ON players FOR SELECT USING (true);
  CREATE POLICY "players_insert_all" ON players FOR INSERT WITH CHECK (true);
  CREATE POLICY "players_update_all" ON players FOR UPDATE USING (true);
  CREATE POLICY "players_delete_all" ON players FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 3: LEAGUES TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "leagues_select_all" ON leagues FOR SELECT USING (true);
  CREATE POLICY "leagues_insert_all" ON leagues FOR INSERT WITH CHECK (true);
  CREATE POLICY "leagues_update_all" ON leagues FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Varsayılan ligler
INSERT INTO leagues (name, tier) VALUES
  ('1. Lig', 1),
  ('2. Lig', 2),
  ('3. Lig', 3),
  ('4. Lig', 4)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 4: LEAGUE_TEAMS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS league_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profile_id TEXT,
  league_id UUID REFERENCES leagues(id),
  strength INTEGER DEFAULT 50,
  color TEXT,
  is_bot BOOLEAN DEFAULT false,
  bot_difficulty INTEGER DEFAULT 1,
  -- League standings inline (for quick access)
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  gf INTEGER DEFAULT 0,
  ga INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- League_teams: Mevcut tabloya eklenmemiş olabilecek kolonlar
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

ALTER TABLE league_teams ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "league_teams_select_all" ON league_teams FOR SELECT USING (true);
  CREATE POLICY "league_teams_insert_all" ON league_teams FOR INSERT WITH CHECK (true);
  CREATE POLICY "league_teams_update_all" ON league_teams FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 5: SEASONS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id),
  name TEXT DEFAULT 'Sezon 1',
  status TEXT DEFAULT 'active',
  is_finished BOOLEAN DEFAULT false,
  year INTEGER,
  start_date DATE,
  current_tur INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seasons: Mevcut tabloya eklenmemiş olabilecek kolonlar
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS intake_completed BOOLEAN DEFAULT false;

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "seasons_select_all" ON seasons FOR SELECT USING (true);
  CREATE POLICY "seasons_insert_all" ON seasons FOR INSERT WITH CHECK (true);
  CREATE POLICY "seasons_update_all" ON seasons FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 6: LEAGUE_STANDINGS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE league_standings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "league_standings_select_all" ON league_standings FOR SELECT USING (true);
  CREATE POLICY "league_standings_insert_all" ON league_standings FOR INSERT WITH CHECK (true);
  CREATE POLICY "league_standings_update_all" ON league_standings FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 7: FIXTURES TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixtures: Mevcut tabloya eklenmemiş olabilecek kolonlar
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]';
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS match_data JSONB;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS competition_type TEXT DEFAULT 'league';
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS scheduled_time TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_name TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_personality TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_strictness INTEGER;

ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "fixtures_select_all" ON fixtures FOR SELECT USING (true);
  CREATE POLICY "fixtures_insert_all" ON fixtures FOR INSERT WITH CHECK (true);
  CREATE POLICY "fixtures_update_all" ON fixtures FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 8: MATCH_HISTORY TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  home_team TEXT,
  away_team TEXT,
  score TEXT,
  match_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "match_history_select_all" ON match_history FOR SELECT USING (true);
  CREATE POLICY "match_history_insert_all" ON match_history FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 9: TRANSFER_MARKET TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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
  status TEXT DEFAULT 'active'
);

-- Transfer_market: Eski tabloya eklenmemiş olabilecek kolonlar
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

ALTER TABLE transfer_market ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "transfer_market_select_all" ON transfer_market FOR SELECT USING (true);
  CREATE POLICY "transfer_market_insert_all" ON transfer_market FOR INSERT WITH CHECK (true);
  CREATE POLICY "transfer_market_update_all" ON transfer_market FOR UPDATE USING (true);
  CREATE POLICY "transfer_market_delete_all" ON transfer_market FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 10: LOANS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "loans_all" ON loans FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 11: RENTAL_LISTINGS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rental_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  owner_team_id TEXT NOT NULL,
  daily_cost INT NOT NULL DEFAULT 0,
  duration_weeks INT NOT NULL DEFAULT 17,
  status TEXT NOT NULL DEFAULT 'active',
  listed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rental_listings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "rental_select_all" ON rental_listings FOR SELECT USING (true);
  CREATE POLICY "rental_insert_all" ON rental_listings FOR INSERT WITH CHECK (true);
  CREATE POLICY "rental_update_all" ON rental_listings FOR UPDATE USING (true);
  CREATE POLICY "rental_delete_all" ON rental_listings FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 12: RENTAL_AGREEMENTS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "rental_agreements_select_all" ON rental_agreements FOR SELECT USING (true);
  CREATE POLICY "rental_agreements_insert_all" ON rental_agreements FOR INSERT WITH CHECK (true);
  CREATE POLICY "rental_agreements_update_all" ON rental_agreements FOR UPDATE USING (true);
  CREATE POLICY "rental_agreements_delete_all" ON rental_agreements FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 13: PUSH_SUBSCRIPTIONS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

-- Push_subscriptions: Eski tabloya eklenmemiş olabilecek kolonlar
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS endpoint TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS p256dh TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS auth_key TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "push_subs_select_all" ON push_subscriptions FOR SELECT USING (true);
  CREATE POLICY "push_subs_insert_all" ON push_subscriptions FOR INSERT WITH CHECK (true);
  CREATE POLICY "push_subs_update_all" ON push_subscriptions FOR UPDATE USING (true);
  CREATE POLICY "push_subs_delete_all" ON push_subscriptions FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 14: SEASON_AWARDS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

-- Season_awards: Eski tabloya eklenmemiş olabilecek kolonlar
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS league_name TEXT;
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS player_name TEXT;

ALTER TABLE season_awards ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "season_awards_select_all" ON season_awards FOR SELECT USING (true);
  CREATE POLICY "season_awards_insert_all" ON season_awards FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 15: NOTIFICATION_PREFERENCES TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

-- Notification_preferences: Eski tabloya eklenmemiş olabilecek kolonlar
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS match_reminder BOOLEAN DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS transfer_offer BOOLEAN DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS training_report BOOLEAN DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "notif_prefs_select_all" ON notification_preferences FOR SELECT USING (true);
  CREATE POLICY "notif_prefs_insert_all" ON notification_preferences FOR INSERT WITH CHECK (true);
  CREATE POLICY "notif_prefs_update_all" ON notification_preferences FOR UPDATE USING (true);
  CREATE POLICY "notif_prefs_delete_all" ON notification_preferences FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 16: ERROR_LOGS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Eski format (backward compat)
  error_message TEXT,
  error_stack TEXT,
  route TEXT,
  method TEXT,
  user_id TEXT,
  request_body JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GÖREV 9: Yeni format kolonları (mevcut tabloya ekle)
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'error';
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS context JSONB;

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "error_logs_select_all" ON error_logs FOR SELECT USING (true);
  CREATE POLICY "error_logs_insert_all" ON error_logs FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 17: PLAYER_DEVELOPMENT_LOG TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS player_development_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  profile_id TEXT,
  old_rating INTEGER,
  new_rating INTEGER,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE player_development_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "player_dev_log_select_all" ON player_development_log FOR SELECT USING (true);
  CREATE POLICY "player_dev_log_insert_all" ON player_development_log FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 18: TRAINING_STATE TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS training_state (
  id TEXT PRIMARY KEY,
  state JSONB DEFAULT '{}'
);

ALTER TABLE training_state ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "training_state_select_all" ON training_state FOR SELECT USING (true);
  CREATE POLICY "training_state_insert_all" ON training_state FOR INSERT WITH CHECK (true);
  CREATE POLICY "training_state_update_all" ON training_state FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 19: ACTIVE_TACTICS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS active_tactics (
  id TEXT PRIMARY KEY,
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

ALTER TABLE active_tactics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "active_tactics_select_all" ON active_tactics FOR SELECT USING (true);
  CREATE POLICY "active_tactics_insert_all" ON active_tactics FOR INSERT WITH CHECK (true);
  CREATE POLICY "active_tactics_update_all" ON active_tactics FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 20: TRAININGS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  player_id TEXT,
  program TEXT,
  week INTEGER,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "trainings_select_all" ON trainings FOR SELECT USING (true);
  CREATE POLICY "trainings_insert_all" ON trainings FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 21: MATCH_SIMULATION_QUEUE TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS match_simulation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(fixture_id)
);

ALTER TABLE match_simulation_queue ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "match_sim_queue_select_all" ON match_simulation_queue FOR SELECT USING (true);
  CREATE POLICY "match_sim_queue_insert_all" ON match_simulation_queue FOR INSERT WITH CHECK (true);
  CREATE POLICY "match_sim_queue_update_all" ON match_simulation_queue FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 22: TEAM_SPONSORSHIPS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE team_sponsorships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "team_sponsorships_select_all" ON team_sponsorships FOR SELECT USING (true);
  CREATE POLICY "team_sponsorships_insert_all" ON team_sponsorships FOR INSERT WITH CHECK (true);
  CREATE POLICY "team_sponsorships_update_all" ON team_sponsorships FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 23: POSITIONS REFERANS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS positions (
  code TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  position_group TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  pitch_zone TEXT
);

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

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 24: FRIENDLY_MATCHES TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE friendly_matches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "friendly_matches_select_all" ON friendly_matches FOR SELECT USING (true);
  CREATE POLICY "friendly_matches_insert_all" ON friendly_matches FOR INSERT WITH CHECK (true);
  CREATE POLICY "friendly_matches_update_all" ON friendly_matches FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 25: FRIENDLY_QUEUE TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS friendly_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_name VARCHAR(200),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'waiting',
  matched_with UUID REFERENCES friendly_queue(id) ON DELETE SET NULL
);

ALTER TABLE friendly_queue ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "friendly_queue_select_all" ON friendly_queue FOR SELECT USING (true);
  CREATE POLICY "friendly_queue_insert_all" ON friendly_queue FOR INSERT WITH CHECK (true);
  CREATE POLICY "friendly_queue_update_all" ON friendly_queue FOR UPDATE USING (true);
  CREATE POLICY "friendly_queue_delete_all" ON friendly_queue FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 26: MATCH_EVENTS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match_events: Mevcut tabloya eklenmemiş olabilecek kolonlar
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS player_name TEXT;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS is_revealed BOOLEAN DEFAULT true;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS detail TEXT;

ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "match_events_select_all" ON match_events FOR SELECT USING (true);
  CREATE POLICY "match_events_insert_all" ON match_events FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 27: REFEREES TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE referees ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "referees_select_all" ON referees FOR SELECT USING (true);
  CREATE POLICY "referees_insert_all" ON referees FOR INSERT WITH CHECK (true);
  CREATE POLICY "referees_update_all" ON referees FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 28: REFEREE_STATS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE referee_stats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "referee_stats_select_all" ON referee_stats FOR SELECT USING (true);
  CREATE POLICY "referee_stats_insert_all" ON referee_stats FOR INSERT WITH CHECK (true);
  CREATE POLICY "referee_stats_update_all" ON referee_stats FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 29: WATCHLIST TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, player_id)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "watchlist_select_all" ON watchlist FOR SELECT USING (true);
  CREATE POLICY "watchlist_insert_all" ON watchlist FOR INSERT WITH CHECK (true);
  CREATE POLICY "watchlist_update_all" ON watchlist FOR UPDATE USING (true);
  CREATE POLICY "watchlist_delete_all" ON watchlist FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 30: OPERATION_REPORTS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS operation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  operation_type VARCHAR(100) NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE operation_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "operation_reports_select_all" ON operation_reports FOR SELECT USING (true);
  CREATE POLICY "operation_reports_insert_all" ON operation_reports FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 31: MATCH_SESSIONS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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
  weather TEXT DEFAULT 'sunny',
  referee_id TEXT REFERENCES referees(id),
  started_at TIMESTAMPTZ,
  last_tick_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE match_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "match_sessions_select_all" ON match_sessions FOR SELECT USING (true);
  CREATE POLICY "match_sessions_insert_all" ON match_sessions FOR INSERT WITH CHECK (true);
  CREATE POLICY "match_sessions_update_all" ON match_sessions FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 32: LIVE_MATCHES TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE live_matches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "live_matches_select_all" ON live_matches FOR SELECT USING (true);
  CREATE POLICY "live_matches_insert_all" ON live_matches FOR INSERT WITH CHECK (true);
  CREATE POLICY "live_matches_update_all" ON live_matches FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 33: YOUTH_PLAYERS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE youth_players ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "youth_players_select_all" ON youth_players FOR SELECT USING (true);
  CREATE POLICY "youth_players_insert_all" ON youth_players FOR INSERT WITH CHECK (true);
  CREATE POLICY "youth_players_update_all" ON youth_players FOR UPDATE USING (true);
  CREATE POLICY "youth_players_delete_all" ON youth_players FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 34: YOUTH_FACILITIES TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS youth_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL UNIQUE,
  facility_levels JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE youth_facilities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "youth_facilities_select_all" ON youth_facilities FOR SELECT USING (true);
  CREATE POLICY "youth_facilities_insert_all" ON youth_facilities FOR INSERT WITH CHECK (true);
  CREATE POLICY "youth_facilities_update_all" ON youth_facilities FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 35: USER_FACILITIES TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL UNIQUE,
  facility_data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_facilities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "user_facilities_select_all" ON user_facilities FOR SELECT USING (true);
  CREATE POLICY "user_facilities_insert_all" ON user_facilities FOR INSERT WITH CHECK (true);
  CREATE POLICY "user_facilities_update_all" ON user_facilities FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 36: TRAINING_ATTENDANCES TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE training_attendances ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "training_attendances_select_all" ON training_attendances FOR SELECT USING (true);
  CREATE POLICY "training_attendances_insert_all" ON training_attendances FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 37: WEEKLY_EVOLUTION TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS weekly_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  week INTEGER NOT NULL,
  rating_change NUMERIC DEFAULT 0,
  stat_changes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE weekly_evolution ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "weekly_evolution_select_all" ON weekly_evolution FOR SELECT USING (true);
  CREATE POLICY "weekly_evolution_insert_all" ON weekly_evolution FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 38: LEAGUE_HISTORY TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE league_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "league_history_select_all" ON league_history FOR SELECT USING (true);
  CREATE POLICY "league_history_insert_all" ON league_history FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 39: HALL_OF_FAME TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "hall_of_fame_select_all" ON hall_of_fame FOR SELECT USING (true);
  CREATE POLICY "hall_of_fame_insert_all" ON hall_of_fame FOR INSERT WITH CHECK (true);
  CREATE POLICY "hall_of_fame_update_all" ON hall_of_fame FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 40: CUP_SEASONS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE cup_seasons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "cup_seasons_select_all" ON cup_seasons FOR SELECT USING (true);
  CREATE POLICY "cup_seasons_insert_all" ON cup_seasons FOR INSERT WITH CHECK (true);
  CREATE POLICY "cup_seasons_update_all" ON cup_seasons FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 41: SEASON_STATS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

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

ALTER TABLE season_stats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "season_stats_select_all" ON season_stats FOR SELECT USING (true);
  CREATE POLICY "season_stats_insert_all" ON season_stats FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 42: PLAYER_ACHIEVEMENTS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT,
  profile_id TEXT,
  achievement_type TEXT NOT NULL,
  season_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "player_achievements_select_all" ON player_achievements FOR SELECT USING (true);
  CREATE POLICY "player_achievements_insert_all" ON player_achievements FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 43: MATCH_PARTICIPANTS TABLOSU (GÖREV 7)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id UUID REFERENCES league_teams(id) ON DELETE CASCADE,
  profile_id TEXT,
  side TEXT NOT NULL CHECK (side IN ('home', 'away')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fixture_id, team_id)
);

-- match_participants: Eski tabloda olmayan kolonları ekle
ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS team_id UUID;
ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS side TEXT CHECK (side IN ('home', 'away'));
ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Eski tabloda user_id NOT NULL olabilir, nullable yap (yeni şemada profile_id kullanılıyor)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_participants' AND column_name = 'user_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE match_participants ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- Eski tabloda user_id varsa, onu profile_id olarak da kullan (backward compat)
-- Eski tabloda fixture_id TEXT olabilir, UUID'ye dönüştür
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_participants' AND column_name = 'fixture_id' AND data_type = 'text'
  ) THEN
    -- Geçersiz UUID olan eski satırları sil
    DELETE FROM match_participants WHERE fixture_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    ALTER TABLE match_participants ALTER COLUMN fixture_id TYPE UUID USING fixture_id::uuid;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'match_participants.fixture_id UUID dönüşümü atlandı: %', SQLERRM;
END $$;

-- Eski UNIQUE constraint varsa kaldır, yenisini ekle
DO $$ BEGIN
  -- Eski (fixture_id, user_id) constraint varsa kaldır
  ALTER TABLE match_participants DROP CONSTRAINT IF EXISTS match_participants_fixture_id_user_id_key;
END $$;

-- Yeni UNIQUE constraint (yoksa ekle)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'match_participants_fixture_id_team_id_key'
  ) THEN
    ALTER TABLE match_participants ADD CONSTRAINT match_participants_fixture_id_team_id_key UNIQUE (fixture_id, team_id);
  END IF;
END $$;

ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "match_participants_select_all" ON match_participants FOR SELECT USING (true);
  CREATE POLICY "match_participants_insert_all" ON match_participants FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 44: MATCH_CHAT TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS match_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- match_chat: Eski tabloda fixture_id TEXT olabilir, UUID'ye dönüştür
-- NOT: Eski veriler "fixture-w2-mert-kaya" gibi TEXT formatında olabilir,
-- bunlar UUID'ye dönüştürülemeyeceği için sadece geçerli UUID olanları tutarız
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_chat' AND column_name = 'fixture_id' AND data_type = 'text'
  ) THEN
    -- Geçersiz UUID olan eski satırları sil (eski format maç mesajları)
    DELETE FROM match_chat WHERE fixture_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    -- Artık dönüşüm güvenli
    ALTER TABLE match_chat ALTER COLUMN fixture_id TYPE UUID USING fixture_id::uuid;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Dönüşüm başarısız olursa TEXT olarak bırak, uygulama düzeyinde handle edilir
  RAISE NOTICE 'match_chat.fixture_id UUID dönüşümü atlandı: %', SQLERRM;
END $$;

-- match_chat: Eski tabloda olmayan kolonları ekle
ALTER TABLE match_chat ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE match_chat ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE match_chat ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "match_chat_select_all" ON match_chat FOR SELECT USING (true);
  CREATE POLICY "match_chat_insert_all" ON match_chat FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 45: MANAGER_MESSAGES TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS manager_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  receiver_id TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'dm',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE manager_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "manager_messages_select_all" ON manager_messages FOR SELECT USING (true);
  CREATE POLICY "manager_messages_insert_all" ON manager_messages FOR INSERT WITH CHECK (true);
  CREATE POLICY "manager_messages_update_all" ON manager_messages FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 46: MANAGER_CONVERSATIONS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS manager_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 TEXT NOT NULL,
  participant_2 TEXT NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE manager_conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "manager_conversations_select_all" ON manager_conversations FOR SELECT USING (true);
  CREATE POLICY "manager_conversations_insert_all" ON manager_conversations FOR INSERT WITH CHECK (true);
  CREATE POLICY "manager_conversations_update_all" ON manager_conversations FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 47: MANAGER_PRESENCE TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS manager_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE manager_presence ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "manager_presence_select_all" ON manager_presence FOR SELECT USING (true);
  CREATE POLICY "manager_presence_insert_all" ON manager_presence FOR INSERT WITH CHECK (true);
  CREATE POLICY "manager_presence_update_all" ON manager_presence FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 48: MEVCUT TABLOLAR İÇİN ŞEMA DÖNÜŞÜMÜ
-- Eski migration'lardan kalan farklı kolonları yeni şemaya uyumlu hale getir
-- ═══════════════════════════════════════════════════════════════════════════

-- === match_simulation_queue: retry_count → attempts, error_message → last_error ===
ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;
ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
-- Eski kolonlardan yeni kolonlara veri taşı (eğer varsa)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'match_simulation_queue' AND column_name = 'retry_count') THEN
    UPDATE match_simulation_queue SET attempts = COALESCE(attempts, retry_count, 0) WHERE attempts IS NULL OR attempts = 0;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'match_simulation_queue' AND column_name = 'error_message') THEN
    UPDATE match_simulation_queue SET last_error = COALESCE(last_error, error_message) WHERE last_error IS NULL;
  END IF;
END $$;

-- === team_sponsorships: yeni kolonlar ===
ALTER TABLE team_sponsorships ADD COLUMN IF NOT EXISTS sponsor_type TEXT DEFAULT 'Main';
ALTER TABLE team_sponsorships ADD COLUMN IF NOT EXISTS bonus_type TEXT;
ALTER TABLE team_sponsorships ADD COLUMN IF NOT EXISTS bonus_amount INTEGER DEFAULT 0;
ALTER TABLE team_sponsorships ADD COLUMN IF NOT EXISTS remaining_rounds INTEGER DEFAULT 34;
-- Eski rounds_remaining → remaining_rounds迁移
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_sponsorships' AND column_name = 'rounds_remaining') THEN
    UPDATE team_sponsorships SET remaining_rounds = COALESCE(remaining_rounds, rounds_remaining) WHERE remaining_rounds IS NULL OR remaining_rounds = 34;
  END IF;
END $$;

-- === rental_listings: yeni kolonlar ===
ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS duration_weeks INT NOT NULL DEFAULT 17;
ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS daily_cost INT NOT NULL DEFAULT 0;
ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS listed_at TIMESTAMPTZ DEFAULT NOW();

-- === rental_agreements: yeni kolonlar ===
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS duration_weeks INT NOT NULL DEFAULT 12;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS total_cost BIGINT NOT NULL DEFAULT 0;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS commission INT NOT NULL DEFAULT 10;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- === loans: yeni kolonlar ===
ALTER TABLE loans ADD COLUMN IF NOT EXISTS loan_fee_paid BIGINT DEFAULT 0;

-- === match_events: yeni kolonlar ===
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS player_name TEXT;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS is_revealed BOOLEAN DEFAULT true;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS detail TEXT;
-- Eski detail → data迁移
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'match_events' AND column_name = 'detail') THEN
    UPDATE match_events SET data = COALESCE(data, detail::jsonb) WHERE data IS NULL OR data = '{}'::jsonb;
  END IF;
END $$;

-- === referees: id TEXT (eski UUID) ===
-- referees tablosu id UUID ise sorun yok, TEXT ise de sorun yok
ALTER TABLE referees ADD COLUMN IF NOT EXISTS personality TEXT DEFAULT 'dengeci';
ALTER TABLE referees ADD COLUMN IF NOT EXISTS strictness INTEGER DEFAULT 5;

-- === referee_stats: yeni kolonlar ===
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS matches INTEGER DEFAULT 0;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS yellows INTEGER DEFAULT 0;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS reds INTEGER DEFAULT 0;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS fouls INTEGER DEFAULT 0;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS penalties INTEGER DEFAULT 0;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS VAR_reviews INTEGER DEFAULT 0;
-- Eski kolonlardan yeni kolonlara veri taşı
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referee_stats' AND column_name = 'matches_managed') THEN
    UPDATE referee_stats SET matches = COALESCE(matches, matches_managed, 0) WHERE matches IS NULL OR matches = 0;
    UPDATE referee_stats SET yellows = COALESCE(yellows, yellow_cards, 0) WHERE yellows IS NULL OR yellows = 0;
    UPDATE referee_stats SET reds = COALESCE(reds, red_cards, 0) WHERE reds IS NULL OR reds = 0;
    UPDATE referee_stats SET fouls = COALESCE(fouls, fouls_called, 0) WHERE fouls IS NULL OR fouls = 0;
    UPDATE referee_stats SET penalties = COALESCE(penalties, penalties_awarded, 0) WHERE penalties IS NULL OR penalties = 0;
  END IF;
END $$;

-- === friendly_matches: yeni kolonlar ===
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS match_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === friendly_queue: yeni kolonlar ===
ALTER TABLE friendly_queue ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'waiting';
ALTER TABLE friendly_queue ADD COLUMN IF NOT EXISTS matched_with UUID;

-- === user_facilities: yeni tasarım ===
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS facility_data JSONB DEFAULT '{}';

-- === player_achievements: yeni kolonlar ===
ALTER TABLE player_achievements ADD COLUMN IF NOT EXISTS season_id UUID;

-- === hall_of_fame: yeni kolonlar ===
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS champion_team TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS golden_boot_player TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS mvp_player TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS best_goalkeeper TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS top_assists_player TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === cup_seasons: yeni kolonlar ===
ALTER TABLE cup_seasons ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE cup_seasons ADD COLUMN IF NOT EXISTS max_rounds INTEGER DEFAULT 5;

-- === season_stats: yeni kolonlar ===
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS stat_type TEXT;
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS stat_key TEXT;
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS stat_value NUMERIC DEFAULT 0;
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === live_matches: yeni kolonlar ===
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS all_events JSONB DEFAULT '[]';
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS visible_events JSONB DEFAULT '[]';
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS last_tick_at TIMESTAMPTZ;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- === match_sessions: yeni kolonlar ===
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS last_tick_at TIMESTAMPTZ;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- === youth_players: yeni kolonlar ===
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT 16;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS specific_position VARCHAR(50);
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS hidden_potential INTEGER DEFAULT 70;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS speed INTEGER DEFAULT 50;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS power INTEGER DEFAULT 50;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS passing INTEGER DEFAULT 50;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS shooting INTEGER DEFAULT 50;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS defending INTEGER DEFAULT 50;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS vision INTEGER DEFAULT 50;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS control INTEGER DEFAULT 50;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS heading INTEGER DEFAULT 50;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS cond INTEGER DEFAULT 100;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS form INTEGER DEFAULT 60;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS morale INTEGER DEFAULT 60;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS preferred_foot TEXT DEFAULT 'Right';

-- === league_history: yeni kolonlar ===
ALTER TABLE league_history ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE league_history ADD COLUMN IF NOT EXISTS champion_team_id UUID;
ALTER TABLE league_history ADD COLUMN IF NOT EXISTS season_number INTEGER DEFAULT 1;
ALTER TABLE league_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === training_attendances: yeni kolonlar ===
ALTER TABLE training_attendances ADD COLUMN IF NOT EXISTS program_id UUID;
ALTER TABLE training_attendances ADD COLUMN IF NOT EXISTS week_number INTEGER DEFAULT 1;
ALTER TABLE training_attendances ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT true;
ALTER TABLE training_attendances ADD COLUMN IF NOT EXISTS stats_gained JSONB DEFAULT '{}';

-- === weekly_evolution: yeni kolonlar ===
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS week INTEGER DEFAULT 1;
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS old_rating INTEGER;
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS new_rating INTEGER;
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === operation_reports: created_at ekle ===
ALTER TABLE operation_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === season_awards: description ekle ===
ALTER TABLE season_awards ADD COLUMN IF NOT EXISTS description TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 54: EKSİK TABLOLAR (Eski migration'lardan unified'a taşınan)
-- ═══════════════════════════════════════════════════════════════════════════

-- notifications: Kullanıcı bildirimleri
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  tag TEXT,
  type TEXT DEFAULT 'match_event',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notifications: Eski tabloda eksik olabilecek kolonları ekle
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'match_event';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_notifications_profile_unread ON notifications(profile_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (true);
  CREATE POLICY "notifications_insert_all" ON notifications FOR INSERT WITH CHECK (true);
  CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- player_positions: Oyuncu-pozisyon eşleştirmeleri
CREATE TABLE IF NOT EXISTS player_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  position_code TEXT NOT NULL REFERENCES positions(code),
  is_primary BOOLEAN NOT NULL DEFAULT true,
  proficiency INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, position_code)
);

-- player_positions: Eski tabloda eksik olabilecek kolonları ekle
ALTER TABLE player_positions ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE player_positions ADD COLUMN IF NOT EXISTS position_code TEXT;
ALTER TABLE player_positions ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT true;
ALTER TABLE player_positions ADD COLUMN IF NOT EXISTS proficiency INTEGER DEFAULT 100;
ALTER TABLE player_positions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_player_positions_player ON player_positions(player_id);
CREATE INDEX IF NOT EXISTS idx_player_positions_position ON player_positions(position_code);
CREATE INDEX IF NOT EXISTS idx_player_positions_primary ON player_positions(player_id, is_primary);

ALTER TABLE player_positions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "pp_select_all" ON player_positions FOR SELECT USING (true);
  CREATE POLICY "pp_insert_auth" ON player_positions FOR INSERT WITH CHECK (true);
  CREATE POLICY "pp_update_auth" ON player_positions FOR UPDATE USING (true);
  CREATE POLICY "pp_delete_auth" ON player_positions FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- scouted_players: Keşfedilen oyuncular
CREATE TABLE IF NOT EXISTS scouted_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT,
  position VARCHAR(10),
  rating INTEGER,
  potential INTEGER,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, player_id)
);

-- scouted_players: Eski tabloda eksik olabilecek kolonları ekle
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS player_name TEXT;
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS position VARCHAR(10);
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS potential INTEGER;
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS discovered_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_scouted_players_profile ON scouted_players(profile_id);

ALTER TABLE scouted_players ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "scouted_select_own" ON scouted_players FOR SELECT USING (profile_id = auth.uid()::text);
  CREATE POLICY "scouted_insert_own" ON scouted_players FOR INSERT WITH CHECK (profile_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- weekly_evolution_logs: Haftalık evrim çalışma logları
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

ALTER TABLE weekly_evolution_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "evolution_logs_service_role" ON weekly_evolution_logs FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- player_career_stats: Oyuncu kariyer istatistikleri (GÖREV 4 için)
CREATE TABLE IF NOT EXISTS player_career_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  profile_id TEXT,
  season_id UUID,
  matches INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- player_career_stats: Eski tabloda eksik olabilecek kolonları ekle
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS matches INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS goals INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS assists INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS yellow_cards INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS red_cards INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS clean_sheets INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS avg_rating NUMERIC DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_player_career_stats_player ON player_career_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_career_stats_profile ON player_career_stats(profile_id);

ALTER TABLE player_career_stats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "career_stats_select_own" ON player_career_stats FOR SELECT
    USING (profile_id = auth.uid()::text OR profile_id IS NULL);
  CREATE POLICY "career_stats_insert_own" ON player_career_stats FOR INSERT
    WITH CHECK (profile_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 48a: KAPSAMLI ALTER TABLE - TÜM EKSİK KOLONLAR
-- CREATE TABLE IF NOT EXISTS mevcut tabloları atladığından,
-- eski tablolarda olmayan kolonları burada güvenle ekliyoruz.
-- NOT NULL + DEFAULT olmayan kolonlar için DEFAULT veya NULLABLE ekliyoruz.
-- ═══════════════════════════════════════════════════════════════════════════

-- === active_tactics (0 ALTER TABLE vardı) ===
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS formation TEXT DEFAULT '4-4-2';
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS mentality TEXT DEFAULT 'balanced';
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS tempo INTEGER DEFAULT 50;
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS pressing INTEGER DEFAULT 50;
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS defensive_line INTEGER DEFAULT 50;
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS width INTEGER DEFAULT 50;
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS captain_id TEXT;
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS set_piece_taker_id TEXT;
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS penalty_taker_id TEXT;
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS free_kick_taker_id TEXT;
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS corner_taker_id TEXT;
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS lineup JSONB DEFAULT '[]';
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS subs JSONB DEFAULT '[]';
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS player_roles JSONB DEFAULT '{}';
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS instructions JSONB DEFAULT '{}';
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'balanced';
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === league_standings (0 ALTER TABLE vardı) ===
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS league_id UUID;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS team_id UUID;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS played INTEGER DEFAULT 0;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS won INTEGER DEFAULT 0;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS drawn INTEGER DEFAULT 0;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS lost INTEGER DEFAULT 0;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS gf INTEGER DEFAULT 0;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS ga INTEGER DEFAULT 0;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS gd INTEGER DEFAULT 0;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS rank INTEGER DEFAULT 0;
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS form TEXT DEFAULT '';
ALTER TABLE league_standings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- === leagues (0 ALTER TABLE vardı) ===
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 4;
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Türkiye';
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === manager_conversations (0 ALTER TABLE vardı) ===
ALTER TABLE manager_conversations ADD COLUMN IF NOT EXISTS participant_1 TEXT;
ALTER TABLE manager_conversations ADD COLUMN IF NOT EXISTS participant_2 TEXT;
ALTER TABLE manager_conversations ADD COLUMN IF NOT EXISTS last_message TEXT;
ALTER TABLE manager_conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;
ALTER TABLE manager_conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === manager_messages (0 ALTER TABLE vardı) ===
ALTER TABLE manager_messages ADD COLUMN IF NOT EXISTS conversation_id UUID;
ALTER TABLE manager_messages ADD COLUMN IF NOT EXISTS sender_id TEXT;
ALTER TABLE manager_messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE manager_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE manager_messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE manager_messages ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text';
ALTER TABLE manager_messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- === manager_presence (0 ALTER TABLE vardı) ===
ALTER TABLE manager_presence ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE manager_presence ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline';
ALTER TABLE manager_presence ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- === match_chat (eksik profile_id) ===
ALTER TABLE match_chat ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE match_chat ADD COLUMN IF NOT EXISTS fixture_id UUID;
ALTER TABLE match_chat ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE match_chat ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE match_chat ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === match_events (eksik kolonlar) ===
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS fixture_id UUID;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS event_type VARCHAR(50);
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS minute INTEGER;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS team_id UUID;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE match_events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === match_history (0 ALTER TABLE vardı) ===
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS opponent_id TEXT;
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS result TEXT;
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS home_score INTEGER DEFAULT 0;
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS away_score INTEGER DEFAULT 0;
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS played_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === notifications (0 ALTER TABLE vardı) ===
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'match_event';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === player_career_stats (0 ALTER TABLE vardı) ===
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS goals INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS assists INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS clean_sheets INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS yellow_cards INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS red_cards INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS avg_rating NUMERIC DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS minutes_played INTEGER DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- === player_development_log (0 ALTER TABLE vardı) ===
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS old_rating INTEGER;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS new_rating INTEGER;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === player_positions (0 ALTER TABLE vardı) ===
ALTER TABLE player_positions ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE player_positions ADD COLUMN IF NOT EXISTS position_code TEXT;
ALTER TABLE player_positions ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT true;
ALTER TABLE player_positions ADD COLUMN IF NOT EXISTS proficiency INTEGER DEFAULT 100;
ALTER TABLE player_positions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === positions (0 ALTER TABLE vardı) ===
ALTER TABLE positions ADD COLUMN IF NOT EXISTS name_tr TEXT;
ALTER TABLE positions ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE positions ADD COLUMN IF NOT EXISTS position_group TEXT;
ALTER TABLE positions ADD COLUMN IF NOT EXISTS pitch_zone TEXT;
ALTER TABLE positions ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- === scouted_players (0 ALTER TABLE vardı) ===
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS player_name TEXT;
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS position VARCHAR(10);
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS potential INTEGER;
ALTER TABLE scouted_players ADD COLUMN IF NOT EXISTS discovered_at TIMESTAMPTZ DEFAULT NOW();

-- === training_state (0 ALTER TABLE vardı) ===
ALTER TABLE training_state ADD COLUMN IF NOT EXISTS state JSONB DEFAULT '{}';

-- === trainings (0 ALTER TABLE vardı) ===
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS program TEXT;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS week INTEGER;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS result JSONB;
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === watchlist (0 ALTER TABLE vardı) ===
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === weekly_evolution_logs (0 ALTER TABLE vardı) ===
ALTER TABLE weekly_evolution_logs ADD COLUMN IF NOT EXISTS run_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE weekly_evolution_logs ADD COLUMN IF NOT EXISTS total_players INTEGER DEFAULT 0;
ALTER TABLE weekly_evolution_logs ADD COLUMN IF NOT EXISTS updated_players INTEGER DEFAULT 0;
ALTER TABLE weekly_evolution_logs ADD COLUMN IF NOT EXISTS high_growth INTEGER DEFAULT 0;
ALTER TABLE weekly_evolution_logs ADD COLUMN IF NOT EXISTS low_growth INTEGER DEFAULT 0;
ALTER TABLE weekly_evolution_logs ADD COLUMN IF NOT EXISTS no_match INTEGER DEFAULT 0;
ALTER TABLE weekly_evolution_logs ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '[]';
ALTER TABLE weekly_evolution_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- === youth_facilities (0 ALTER TABLE vardı) ===
ALTER TABLE youth_facilities ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE youth_facilities ADD COLUMN IF NOT EXISTS facility_levels JSONB DEFAULT '{}';
ALTER TABLE youth_facilities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- === youth_players (0 ALTER TABLE vardı) ===
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT 16;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS specific_position TEXT;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 55;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS potential INTEGER DEFAULT 70;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS hidden_potential INTEGER DEFAULT 70;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS academy_level INTEGER DEFAULT 1;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'bronze';
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS is_wonderkid BOOLEAN DEFAULT false;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS development_curve TEXT DEFAULT 'normal';
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS weekly_training_hours INTEGER DEFAULT 15;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS total_training_weeks INTEGER DEFAULT 0;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS stats_gained_this_season JSONB DEFAULT '{}';
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS personality_traits JSONB DEFAULT '[]';
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS traits JSONB DEFAULT '[]';
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS trait_levels JSONB DEFAULT '{}';
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS scout_report JSONB;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS injured BOOLEAN DEFAULT false;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS injury_weeks_remaining INTEGER DEFAULT 0;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS cond INTEGER DEFAULT 85;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS form INTEGER DEFAULT 60;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS morale INTEGER DEFAULT 70;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS confidence INTEGER DEFAULT 60;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}';
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS season_intake_used BOOLEAN DEFAULT false;
ALTER TABLE youth_players ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- === user_facilities (eksik profile_id) ===
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS facility_data JSONB DEFAULT '{}';
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- === Diğer eksik kolonlar (kısmen ALTER TABLE olan tablolar) ===

-- friendly_matches
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS home_team_id TEXT;
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS away_team_id TEXT;
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS match_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- friendly_queue
ALTER TABLE friendly_queue ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE friendly_queue ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'waiting';
ALTER TABLE friendly_queue ADD COLUMN IF NOT EXISTS matched_with UUID;
ALTER TABLE friendly_queue ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- loans
ALTER TABLE loans ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS owner_team_id TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS loaned_to_team_id TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'listed';
ALTER TABLE loans ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- operation_reports
ALTER TABLE operation_reports ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE operation_reports ADD COLUMN IF NOT EXISTS operation_type VARCHAR(100);
ALTER TABLE operation_reports ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';
ALTER TABLE operation_reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE operation_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- referee_stats
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS matches INTEGER DEFAULT 0;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS yellows INTEGER DEFAULT 0;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS reds INTEGER DEFAULT 0;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS fouls INTEGER DEFAULT 0;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS penalties INTEGER DEFAULT 0;
ALTER TABLE referee_stats ADD COLUMN IF NOT EXISTS VAR_reviews INTEGER DEFAULT 0;

-- referees
ALTER TABLE referees ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE referees ADD COLUMN IF NOT EXISTS personality TEXT DEFAULT 'dengeci';
ALTER TABLE referees ADD COLUMN IF NOT EXISTS strictness INTEGER DEFAULT 5;
ALTER TABLE referees ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Türkiye';

-- season_stats
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS stat_type TEXT;
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS stat_key TEXT;
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS stat_value NUMERIC DEFAULT 0;
ALTER TABLE season_stats ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- team_sponsorships
ALTER TABLE team_sponsorships ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE team_sponsorships ADD COLUMN IF NOT EXISTS sponsor_name TEXT;
ALTER TABLE team_sponsorships ADD COLUMN IF NOT EXISTS weekly_income INTEGER DEFAULT 0;
ALTER TABLE team_sponsorships ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE team_sponsorships ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- training_attendances
ALTER TABLE training_attendances ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE training_attendances ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE training_attendances ADD COLUMN IF NOT EXISTS program_id TEXT;
ALTER TABLE training_attendances ADD COLUMN IF NOT EXISTS week_number INTEGER DEFAULT 1;
ALTER TABLE training_attendances ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT true;
ALTER TABLE training_attendances ADD COLUMN IF NOT EXISTS stats_gained JSONB DEFAULT '{}';
ALTER TABLE training_attendances ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- weekly_evolution
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS week INTEGER DEFAULT 1;
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS old_rating INTEGER;
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS new_rating INTEGER;
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS rating_change NUMERIC DEFAULT 0;
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS stat_changes JSONB DEFAULT '{}';
ALTER TABLE weekly_evolution ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- match_sessions
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS fixture_id UUID;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS home_score INTEGER DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS away_score INTEGER DEFAULT 0;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS last_tick_at TIMESTAMPTZ;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- live_matches
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS fixture_id UUID;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS home_score INTEGER DEFAULT 0;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS away_score INTEGER DEFAULT 0;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS minute INTEGER DEFAULT 0;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS all_events JSONB DEFAULT '[]';
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS visible_events JSONB DEFAULT '[]';
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS last_tick_at TIMESTAMPTZ;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE live_matches ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- match_simulation_queue
ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS fixture_id UUID;
ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- player_achievements
ALTER TABLE player_achievements ADD COLUMN IF NOT EXISTS achievement_type TEXT;
ALTER TABLE player_achievements ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE player_achievements ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE player_achievements ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- rental_listings (eksis olabilen)
ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS owner_team_id TEXT;
ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS daily_cost INT DEFAULT 0;
ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS duration_weeks INT DEFAULT 17;
ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS listed_at TIMESTAMPTZ DEFAULT NOW();

-- rental_agreements
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS owner_team_id TEXT;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS renter_team_id TEXT;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS daily_cost INT DEFAULT 0;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS duration_weeks INT DEFAULT 12;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS total_cost BIGINT DEFAULT 0;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS commission INT DEFAULT 10;
ALTER TABLE rental_agreements ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- transfer_market
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS player_id TEXT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS seller_id TEXT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS asking_price BIGINT DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS listed_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- hall_of_fame
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS champion_profile_id TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS champion_team TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS golden_boot_player TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS mvp_player TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS best_goalkeeper TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS top_assists_player TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- cup_seasons
ALTER TABLE cup_seasons ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE cup_seasons ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cup_seasons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE cup_seasons ADD COLUMN IF NOT EXISTS max_rounds INTEGER DEFAULT 5;
ALTER TABLE cup_seasons ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 48b: İNDEKSLER
-- ═══════════════════════════════════════════════════════════════════════════

-- Players
CREATE INDEX IF NOT EXISTS idx_players_profile_id ON players(profile_id);
CREATE INDEX IF NOT EXISTS idx_players_team_name ON players(team_name);
CREATE INDEX IF NOT EXISTS idx_players_specific_position ON players(specific_position);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_rating ON players(rating);
CREATE INDEX IF NOT EXISTS idx_players_is_free_agent ON players(is_free_agent) WHERE is_free_agent = true;

-- Fixtures
CREATE INDEX IF NOT EXISTS idx_fixtures_season_id ON fixtures(season_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON fixtures(status);
CREATE INDEX IF NOT EXISTS idx_fixtures_home_team ON fixtures(home_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_away_team ON fixtures(away_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_match_date ON fixtures(match_date);
CREATE INDEX IF NOT EXISTS idx_fixtures_competition_type ON fixtures(competition_type);

-- League Standings
CREATE INDEX IF NOT EXISTS idx_league_standings_league_id ON league_standings(league_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_season_id ON league_standings(season_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_team_id ON league_standings(team_id);

-- League Teams
CREATE INDEX IF NOT EXISTS idx_league_teams_league_id ON league_teams(league_id);
CREATE INDEX IF NOT EXISTS idx_league_teams_profile_id ON league_teams(profile_id);

-- Push Subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subs_profile ON push_subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON push_subscriptions(endpoint);

-- Notification Preferences
CREATE INDEX IF NOT EXISTS idx_notif_prefs_profile ON notification_preferences(profile_id);

-- Rental Listings
CREATE INDEX IF NOT EXISTS idx_rental_listings_player ON rental_listings(player_id);
CREATE INDEX IF NOT EXISTS idx_rental_listings_status ON rental_listings(status);
CREATE INDEX IF NOT EXISTS idx_rental_listings_owner ON rental_listings(owner_team_id);

-- Rental Agreements
CREATE INDEX IF NOT EXISTS idx_rental_agreements_player ON rental_agreements(player_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_owner ON rental_agreements(owner_team_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_renter ON rental_agreements(renter_team_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_status ON rental_agreements(status);

-- Match Events
CREATE INDEX IF NOT EXISTS idx_match_events_fixture_id ON match_events(fixture_id);

-- Error Logs
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON error_logs(source) WHERE source IS NOT NULL;
-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 49: REPLICA IDENTITY FULL (GÖREV 8)
-- Realtime bildirimlerin çalışması için gerekli
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE match_chat REPLICA IDENTITY FULL;
ALTER TABLE manager_messages REPLICA IDENTITY FULL;
ALTER TABLE manager_conversations REPLICA IDENTITY FULL;
ALTER TABLE manager_presence REPLICA IDENTITY FULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 50: RPC FONKSİYONLARI
-- ═══════════════════════════════════════════════════════════════════════════

-- generate_league_fixtures: Round-robin fikstür oluşturucu
DROP FUNCTION IF EXISTS generate_league_fixtures(uuid);
CREATE OR REPLACE FUNCTION generate_league_fixtures(p_season_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
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
BEGIN
    SELECT league_id INTO v_league_id FROM seasons WHERE id = p_season_id;
    IF v_league_id IS NULL THEN RETURN; END IF;

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

    v_match_date := CURRENT_DATE + 1;

    FOR v_round IN 1..v_total_rounds LOOP
        v_team_ids := ARRAY[v_fixed_id];
        FOR i IN 1..array_length(v_team_ids_rotating, 1) LOOP
            v_team_ids := v_team_ids || v_team_ids_rotating[i];
        END LOOP;

        FOR v_match IN 0..(v_half - 1) LOOP
            v_home_id := v_team_ids[v_match + 1];
            v_away_id := v_team_ids[v_n - v_match];

            IF v_home_id != '00000000-0000-0000-0000-000000000000'::uuid AND
               v_away_id != '00000000-0000-0000-0000-000000000000'::uuid THEN

                INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status)
                VALUES (v_home_id, v_away_id, p_season_id, v_round, v_match_date, '12:00', 'scheduled');

                INSERT INTO fixtures (home_team_id, away_team_id, season_id, tur, match_date, match_time, status)
                VALUES (v_away_id, v_home_id, p_season_id, v_round + v_total_rounds,
                        v_match_date + (v_total_rounds * 7), '12:00', 'scheduled');
            END IF;
        END LOOP;

        v_last_id := v_team_ids_rotating[array_length(v_team_ids_rotating, 1)];
        FOR i IN array_length(v_team_ids_rotating, 1)..2 LOOP
            v_team_ids_rotating[i] := v_team_ids_rotating[i-1];
        END LOOP;
        v_team_ids_rotating[1] := v_last_id;
        v_match_date := v_match_date + 7;
    END LOOP;
END;
$$;

-- finalize_season: Sezonu tamamlandı olarak işaretle
DROP FUNCTION IF EXISTS finalize_season(uuid);
CREATE OR REPLACE FUNCTION finalize_season(p_season_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE seasons SET is_finished = true WHERE id = p_season_id;
END;
$$;

-- decrement_sponsorship_rounds: Sponsorluk remaining_rounds azalt
DROP FUNCTION IF EXISTS decrement_sponsorship_rounds();
CREATE OR REPLACE FUNCTION decrement_sponsorship_rounds()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE team_sponsorships
    SET remaining_rounds = remaining_rounds - 1
    WHERE status = 'active' AND remaining_rounds > 0;

    UPDATE team_sponsorships
    SET status = 'expired'
    WHERE status = 'active' AND remaining_rounds <= 0;
END;
$$;

-- assign_bot_to_user: Yeni kullanıcıya bot takımı ata
DROP FUNCTION IF EXISTS assign_bot_to_user(uuid, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS assign_bot_to_user(text, text);
CREATE OR REPLACE FUNCTION assign_bot_to_user(
  p_profile_id TEXT,
  p_team_name TEXT
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_team_id uuid;
BEGIN
  SELECT id INTO v_team_id FROM league_teams
  WHERE (profile_id IS NULL OR is_bot = true)
  AND name = p_team_name
  LIMIT 1;

  IF v_team_id IS NULL THEN
    SELECT id INTO v_team_id FROM league_teams
    WHERE profile_id IS NULL OR is_bot = true
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;

  IF v_team_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE league_teams
  SET profile_id = p_profile_id, is_bot = false
  WHERE id = v_team_id;

  RETURN v_team_id;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 51: MEVCUT OYUNCULARIN specific_position'INI GÜNCELLE
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE players SET specific_position = 'GK'
WHERE specific_position IS NULL AND position = 'GK';

UPDATE players SET specific_position = (ARRAY['CB','LB','RB','LWB','RWB'])[floor(random()*5+1)::int]
WHERE (specific_position IS NULL OR specific_position IN ('DEF','MID','FWD'))
  AND position = 'DEF';

UPDATE players SET specific_position = (ARRAY['CDM','CM','CAM','LM','RM','LW','RW'])[floor(random()*7+1)::int]
WHERE (specific_position IS NULL OR specific_position IN ('DEF','MID','FWD'))
  AND position = 'MID';

UPDATE players SET specific_position = (ARRAY['CF','ST'])[floor(random()*2+1)::int]
WHERE (specific_position IS NULL OR specific_position IN ('DEF','MID','FWD'))
  AND position = 'FWD';

UPDATE players SET specific_position = 'CM'
WHERE specific_position IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 52: SECONDARY_POSITIONS TİP TUTARLILIĞI (GÖREV 6)
-- text[] olarak sabitle, JSONB ise dönüştür
-- ═══════════════════════════════════════════════════════════════════════════

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

-- secondary_positions NULL olan oyunculara yan mevki ata
UPDATE players SET secondary_positions =
  CASE
    WHEN specific_position = 'CB' THEN
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['LB','RB','CDM'])[floor(random()*3+1)::int], (ARRAY['LB','RB','CDM'])[floor(random()*3+1)::int]]::text[]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['LB','RB','CDM'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'LB' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['CB','LWB','LM'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'RB' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['CB','RWB','RM'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'CM' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['CDM','CAM'])[floor(random()*2+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'CAM' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['CM','CF'])[floor(random()*2+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'ST' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['CF','LW','RW'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'LW' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['LM','ST','CF'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'RW' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['RM','ST','CF'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    ELSE NULL
  END
WHERE secondary_positions IS NULL
  AND specific_position IS NOT NULL
  AND specific_position != 'GK';

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 53: MATCH_PARTICIPANTS BACKFILL (GÖREV 7)
-- Mevcut fixtures tablosundan match_participants doldur
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO match_participants (fixture_id, team_id, profile_id, side)
SELECT f.id, f.home_team_id, lt.profile_id, 'home'
FROM fixtures f
JOIN league_teams lt ON lt.id = f.home_team_id
WHERE NOT EXISTS (
  SELECT 1 FROM match_participants mp WHERE mp.fixture_id = f.id AND mp.team_id = f.home_team_id
)
ON CONFLICT DO NOTHING;

INSERT INTO match_participants (fixture_id, team_id, profile_id, side)
SELECT f.id, f.away_team_id, lt.profile_id, 'away'
FROM fixtures f
JOIN league_teams lt ON lt.id = f.away_team_id
WHERE NOT EXISTS (
  SELECT 1 FROM match_participants mp WHERE mp.fixture_id = f.id AND mp.team_id = f.away_team_id
)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 55: GÖREV 2 — MATCH_PARTICIPANTS TRIGGER + MATCH_CHAT RLS
-- ═══════════════════════════════════════════════════════════════════════════

-- Yeni fixture oluşturulduğunda otomatik match_participants ekle
CREATE OR REPLACE FUNCTION trg_auto_match_participants()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Home participant
  INSERT INTO match_participants (fixture_id, team_id, profile_id, side)
  VALUES (
    NEW.id,
    NEW.home_team_id,
    (SELECT profile_id FROM league_teams WHERE id = NEW.home_team_id),
    'home'
  )
  ON CONFLICT DO NOTHING;

  -- Away participant
  INSERT INTO match_participants (fixture_id, team_id, profile_id, side)
  VALUES (
    NEW.id,
    NEW.away_team_id,
    (SELECT profile_id FROM league_teams WHERE id = NEW.away_team_id),
    'away'
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger'ı ekle (yoksa oluştur)
DROP TRIGGER IF EXISTS trg_fixtures_auto_participants ON fixtures;
CREATE TRIGGER trg_fixtures_auto_participants
  AFTER INSERT ON fixtures
  FOR EACH ROW
  EXECUTE FUNCTION trg_auto_match_participants();

-- match_chat RLS düzelt: auth.uid()::text ile profile_id karşılaştırması
-- Eski permissive INSERT politikasını kaldır, güvenli olanı ekle
DO $$ BEGIN
  -- Mevcut permissive politikaları kaldır
  DROP POLICY IF EXISTS match_chat_select ON match_chat;
  DROP POLICY IF EXISTS match_chat_insert ON match_chat;
  DROP POLICY IF EXISTS "match_chat_select_all" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_insert_all" ON match_chat;

  -- Yeni güvenli politikalar
  CREATE POLICY "match_chat_select_all" ON match_chat FOR SELECT USING (true);
  CREATE POLICY "match_chat_insert_own" ON match_chat FOR INSERT
    WITH CHECK (profile_id = auth.uid()::text OR auth.role() = 'service_role');
  CREATE POLICY "match_chat_delete_own" ON match_chat FOR DELETE
    USING (profile_id = auth.uid()::text OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 56: GÖREV 3 — PROFILES.STADIUM_UPGRADES KOLONU EKLE
-- ═══════════════════════════════════════════════════════════════════════════

-- stadium_upgrades kolonu zaten CREATE TABLE'da var ama mevcut DB'de eksik olabilir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stadium_upgrades JSONB DEFAULT '{}';

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 57: GÖREV 4 — PLAYER_CAREER_STATS RLS KISITLAMA
-- ═══════════════════════════════════════════════════════════════════════════

-- Mevcut permissive politikaları kaldır
DO $$ BEGIN
  DROP POLICY IF EXISTS "career_stats_select_own" ON player_career_stats;
  DROP POLICY IF EXISTS "career_stats_insert_own" ON player_career_stats;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Yeni kısıtlı RLS politikaları
DO $$ BEGIN
  -- SELECT: Kullanıcı sadece kendi oyuncularının istatistiklerini görebilir
  CREATE POLICY "career_stats_select_own" ON player_career_stats FOR SELECT
    USING (
      profile_id = auth.uid()::text
      OR auth.role() = 'service_role'
      OR EXISTS (
        SELECT 1 FROM players p WHERE p.id = player_career_stats.player_id AND p.profile_id = auth.uid()::text
      )
    );

  -- INSERT: Sadece kullanıcının kendi oyuncuları veya servis rolü
  CREATE POLICY "career_stats_insert_own" ON player_career_stats FOR INSERT
    WITH CHECK (
      profile_id = auth.uid()::text
      OR auth.role() = 'service_role'
    );

  -- UPDATE: Cron/servis rolü haricinde güncelleme yapılamaz
  CREATE POLICY "career_stats_no_update" ON player_career_stats FOR UPDATE
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 58: EK TABLOLAR — Active migration'lardan birleştirildi
-- ═══════════════════════════════════════════════════════════════════════════

-- Rate Limits tablosu (20240101000007_rate_limits.sql)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(identifier, action, window_start)
);
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "rate_limits_service_read" ON rate_limits FOR SELECT USING (true);
  CREATE POLICY "rate_limits_service_write" ON rate_limits FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
  CREATE POLICY "rate_limits_service_update" ON rate_limits FOR UPDATE
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Lab Sessions tablosu (20260526000002_create_lab_sessions.sql)
CREATE TABLE IF NOT EXISTS lab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Session',
  home_tactic JSONB NOT NULL DEFAULT '{}',
  away_tactic JSONB NOT NULL DEFAULT '{}',
  results JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE lab_sessions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "lab_sessions_select_own" ON lab_sessions FOR SELECT
    USING (user_id = auth.uid() OR auth.role() = 'service_role');
  CREATE POLICY "lab_sessions_insert_own" ON lab_sessions FOR INSERT
    WITH CHECK (user_id = auth.uid());
  CREATE POLICY "lab_sessions_update_own" ON lab_sessions FOR UPDATE
    USING (user_id = auth.uid());
  CREATE POLICY "lab_sessions_delete_own" ON lab_sessions FOR DELETE
    USING (user_id = auth.uuid() OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_lab_sessions_user_id ON lab_sessions(user_id);

-- Cron Locks tablosu (20260526000003_cron_locks_and_match_queue.sql)
CREATE TABLE IF NOT EXISTS cron_locks (
  id TEXT PRIMARY KEY,
  locked_by TEXT,
  locked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE cron_locks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "cron_locks_service_role" ON cron_locks FOR ALL
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- match_simulation_queue: Aktif migration'daki daha zengin şemayı kullan
-- Eğer baseline'daki mevcut tablo eksik kolonlara sahipse ALTER ile ekle
DO $$ BEGIN
  ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS season_id UUID;
  ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS league_id UUID;
  ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS home_team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
  ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS away_team_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
  ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS match_date TIMESTAMPTZ;
  ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS result JSONB;
  ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS error_message TEXT;
  ALTER TABLE match_simulation_queue ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_match_simulation_queue_status ON match_simulation_queue(status);
CREATE INDEX IF NOT EXISTS idx_match_simulation_queue_fixture_id ON match_simulation_queue(fixture_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 59: RPC FONKSİYONLARI — Active migration'lardan birleştirildi
-- ═══════════════════════════════════════════════════════════════════════════

-- increment_player_ages: Sezon sonu yaşlandırma (20260526000004)
CREATE OR REPLACE FUNCTION increment_player_ages()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE players SET age = age + 1 WHERE age IS NOT NULL;
$$;


-- PROMPT 5: user_facilities eksik kolonları (check-academy-upgrades cron için)
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS upgrade_end_at TIMESTAMPTZ;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS facility_type TEXT;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 0;
