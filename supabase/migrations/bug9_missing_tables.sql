-- [BUG-9] Eksik tablolar + sütunlar — Supabase SQL Editor'da çalıştır
-- Kiralık, akademi, gençlik, transfer, kupa sistemleri için gerekli tüm tablolar
-- İdempotent — tekrar çalıştırılabilir

BEGIN;

-- ═════════════════════════════════════════════════════════════════
-- 1. LOANS — kiralık anlaşmaları (loans/list, loans/request, loans/return-early)
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  player_name TEXT,
  from_team_id UUID,
  to_team_id UUID,
  from_profile_id TEXT,
  to_profile_id TEXT,
  fee BIGINT DEFAULT 0,
  duration_weeks INTEGER DEFAULT 4,
  start_week INTEGER,
  end_week INTEGER,
  status TEXT DEFAULT 'listed', -- listed, active, returned, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_loans_player ON loans(player_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_from_team ON loans(from_team_id);
CREATE INDEX IF NOT EXISTS idx_loans_to_team ON loans(to_team_id);
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "loans_select_all" ON loans;
DROP POLICY IF EXISTS "loans_insert_all" ON loans;
DROP POLICY IF EXISTS "loans_update_all" ON loans;
CREATE POLICY "loans_select_all" ON loans FOR SELECT USING (true);
CREATE POLICY "loans_insert_all" ON loans FOR INSERT WITH CHECK (true);
CREATE POLICY "loans_update_all" ON loans FOR UPDATE USING (true);

-- ═════════════════════════════════════════════════════════════════
-- 2. RENTAL_LISTINGS — oyuncu kiralık pazarı (rental/list, rental/listings, vs)
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rental_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  player_data JSONB DEFAULT '{}',
  owner_team_id TEXT,
  owner_profile_id TEXT,
  owner_team_name TEXT,
  daily_cost BIGINT DEFAULT 0,
  duration_weeks INTEGER DEFAULT 4,
  status TEXT DEFAULT 'active', -- active, pending, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_rental_listings_player ON rental_listings(player_id);
CREATE INDEX IF NOT EXISTS idx_rental_listings_status ON rental_listings(status);
CREATE INDEX IF NOT EXISTS idx_rental_listings_owner ON rental_listings(owner_team_id);
ALTER TABLE rental_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rental_listings_select_all" ON rental_listings;
DROP POLICY IF EXISTS "rental_listings_insert_all" ON rental_listings;
DROP POLICY IF EXISTS "rental_listings_update_all" ON rental_listings;
CREATE POLICY "rental_listings_select_all" ON rental_listings FOR SELECT USING (true);
CREATE POLICY "rental_listings_insert_all" ON rental_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "rental_listings_update_all" ON rental_listings FOR UPDATE USING (true);

-- ═════════════════════════════════════════════════════════════════
-- 3. RENTAL_AGREEMENTS — aktif kiralık anlaşmaları
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rental_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES rental_listings(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_data JSONB DEFAULT '{}',
  renter_team_id TEXT,
  renter_profile_id TEXT,
  renter_team_name TEXT,
  owner_team_id TEXT,
  owner_profile_id TEXT,
  owner_team_name TEXT,
  daily_cost BIGINT DEFAULT 0,
  duration_weeks INTEGER DEFAULT 4,
  total_cost BIGINT DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'active', -- active, completed, cancelled, returned
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_listing ON rental_agreements(listing_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_player ON rental_agreements(player_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_renter ON rental_agreements(renter_team_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_owner ON rental_agreements(owner_team_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_status ON rental_agreements(status);
ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rental_agreements_select_all" ON rental_agreements;
DROP POLICY IF EXISTS "rental_agreements_insert_all" ON rental_agreements;
DROP POLICY IF EXISTS "rental_agreements_update_all" ON rental_agreements;
CREATE POLICY "rental_agreements_select_all" ON rental_agreements FOR SELECT USING (true);
CREATE POLICY "rental_agreements_insert_all" ON rental_agreements FOR INSERT WITH CHECK (true);
CREATE POLICY "rental_agreements_update_all" ON rental_agreements FOR UPDATE USING (true);

-- ═════════════════════════════════════════════════════════════════
-- 4. YOUTH_PLAYERS — altyapı oyuncuları
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS youth_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  team_name TEXT,
  name TEXT NOT NULL,
  position TEXT,
  specific_position TEXT,
  age INTEGER DEFAULT 15,
  height INTEGER DEFAULT 175,
  weight INTEGER DEFAULT 70,
  preferred_foot TEXT DEFAULT 'Right',
  nationality TEXT DEFAULT 'TR',
  rating INTEGER DEFAULT 40,
  potential INTEGER DEFAULT 70,
  data JSONB DEFAULT '{}',
  promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_youth_players_profile ON youth_players(profile_id);
CREATE INDEX IF NOT EXISTS idx_youth_players_team ON youth_players(team_name);
CREATE INDEX IF NOT EXISTS idx_youth_players_promoted ON youth_players(promoted_at);
ALTER TABLE youth_players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "youth_players_select_all" ON youth_players;
DROP POLICY IF EXISTS "youth_players_insert_all" ON youth_players;
DROP POLICY IF EXISTS "youth_players_update_all" ON youth_players;
CREATE POLICY "youth_players_select_all" ON youth_players FOR SELECT USING (true);
CREATE POLICY "youth_players_insert_all" ON youth_players FOR INSERT WITH CHECK (true);
CREATE POLICY "youth_players_update_all" ON youth_players FOR UPDATE USING (true);

-- ═════════════════════════════════════════════════════════════════
-- 5. YOUTH_FACILITIES — altyapı tesisleri
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS youth_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  capacity INTEGER DEFAULT 10,
  upgrade_started_at TIMESTAMPTZ,
  upgrade_completes_at TIMESTAMPTZ,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_youth_facilities_profile ON youth_facilities(profile_id);
ALTER TABLE youth_facilities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "youth_facilities_select_all" ON youth_facilities;
DROP POLICY IF EXISTS "youth_facilities_insert_all" ON youth_facilities;
DROP POLICY IF EXISTS "youth_facilities_update_all" ON youth_facilities;
CREATE POLICY "youth_facilities_select_all" ON youth_facilities FOR SELECT USING (true);
CREATE POLICY "youth_facilities_insert_all" ON youth_facilities FOR INSERT WITH CHECK (true);
CREATE POLICY "youth_facilities_update_all" ON youth_facilities FOR UPDATE USING (true);

-- ═════════════════════════════════════════════════════════════════
-- 6. ACADEMY_UPGRADE_COSTS — akademi yükseltme maliyetleri
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS academy_upgrade_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL,
  cost_euro BIGINT DEFAULT 1000000,
  duration_days INTEGER DEFAULT 7,
  capacity_bonus INTEGER DEFAULT 5,
  quality_bonus INTEGER DEFAULT 5,
  description TEXT,
  UNIQUE(level)
);
ALTER TABLE academy_upgrade_costs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "academy_upgrade_costs_select_all" ON academy_upgrade_costs;
CREATE POLICY "academy_upgrade_costs_select_all" ON academy_upgrade_costs FOR SELECT USING (true);

-- Seed default upgrade costs (1-10 levels)
INSERT INTO academy_upgrade_costs (level, cost_euro, duration_days, capacity_bonus, quality_bonus, description)
VALUES
  (1, 0, 0, 0, 0, 'Başlangıç seviyesi'),
  (2, 500000, 7, 5, 5, 'Seviye 2'),
  (3, 1500000, 14, 5, 5, 'Seviye 3'),
  (4, 3000000, 21, 5, 5, 'Seviye 4'),
  (5, 6000000, 30, 10, 5, 'Seviye 5'),
  (6, 12000000, 45, 10, 10, 'Seviye 6'),
  (7, 25000000, 60, 10, 10, 'Seviye 7'),
  (8, 50000000, 90, 15, 10, 'Seviye 8'),
  (9, 100000000, 120, 15, 15, 'Seviye 9'),
  (10, 200000000, 180, 20, 20, 'Maksimum seviye')
ON CONFLICT (level) DO NOTHING;

-- ═════════════════════════════════════════════════════════════════
-- 7. MATCH_SIMULATION_QUEUE — maç kuyruğu (process-match-queue için)
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS match_simulation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(fixture_id)
);
CREATE INDEX IF NOT EXISTS idx_match_sim_queue_status ON match_simulation_queue(status);
CREATE INDEX IF NOT EXISTS idx_match_sim_queue_fixture ON match_simulation_queue(fixture_id);
ALTER TABLE match_simulation_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "match_sim_queue_select_all" ON match_simulation_queue;
DROP POLICY IF EXISTS "match_sim_queue_insert_all" ON match_simulation_queue;
DROP POLICY IF EXISTS "match_sim_queue_update_all" ON match_simulation_queue;
CREATE POLICY "match_sim_queue_select_all" ON match_simulation_queue FOR SELECT USING (true);
CREATE POLICY "match_sim_queue_insert_all" ON match_simulation_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "match_sim_queue_update_all" ON match_simulation_queue FOR UPDATE USING (true);

-- ═════════════════════════════════════════════════════════════════
-- 8. CUP_SEASONS, CUP_FIXTURES — kupa sistemi
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cup_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  season_year INTEGER,
  status TEXT DEFAULT 'pending', -- pending, active, completed
  current_round INTEGER DEFAULT 0,
  total_rounds INTEGER DEFAULT 6,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_cup_seasons_status ON cup_seasons(status);

CREATE TABLE IF NOT EXISTS cup_fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cup_season_id UUID REFERENCES cup_seasons(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  home_team_id UUID,
  away_team_id UUID,
  home_team_name TEXT,
  away_team_name TEXT,
  match_date DATE,
  match_time TEXT DEFAULT '18:00',
  status TEXT DEFAULT 'scheduled',
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  winner_team_id UUID,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cup_fixtures_season ON cup_fixtures(cup_season_id);
CREATE INDEX IF NOT EXISTS idx_cup_fixtures_round ON cup_fixtures(cup_season_id, round);
CREATE INDEX IF NOT EXISTS idx_cup_fixtures_status ON cup_fixtures(status);

-- ═════════════════════════════════════════════════════════════════
-- 9. FRIENDLY_MATCHES, FRIENDLY_QUEUE — dostluk maçları
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS friendly_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  team_name TEXT,
  team_id UUID,
  status TEXT DEFAULT 'queued', -- queued, matched, cancelled, expired
  matched_with TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes'
);
CREATE INDEX IF NOT EXISTS idx_friendly_queue_status ON friendly_queue(status);
CREATE INDEX IF NOT EXISTS idx_friendly_queue_profile ON friendly_queue(profile_id);

CREATE TABLE IF NOT EXISTS friendly_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_profile_id TEXT,
  away_profile_id TEXT,
  home_team_name TEXT,
  away_team_name TEXT,
  home_team_id UUID,
  away_team_id UUID,
  status TEXT DEFAULT 'scheduled', -- scheduled, live, completed, cancelled
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  match_date TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_friendly_matches_home ON friendly_matches(home_profile_id);
CREATE INDEX IF NOT EXISTS idx_friendly_matches_away ON friendly_matches(away_profile_id);
CREATE INDEX IF NOT EXISTS idx_friendly_matches_status ON friendly_matches(status);

-- ═════════════════════════════════════════════════════════════════
-- 10. TRANSFER_OFFERS, TRANSFER_LISTINGS — transfer teklifleri
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS transfer_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  player_data JSONB DEFAULT '{}',
  seller_id TEXT,
  seller_team_name TEXT,
  asking_price BIGINT DEFAULT 0,
  status TEXT DEFAULT 'active',
  is_auction BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transfer_listings_player ON transfer_listings(player_id);
CREATE INDEX IF NOT EXISTS idx_transfer_listings_status ON transfer_listings(status);
CREATE INDEX IF NOT EXISTS idx_transfer_listings_seller ON transfer_listings(seller_id);

CREATE TABLE IF NOT EXISTS transfer_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES transfer_listings(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  buyer_team_name TEXT,
  offer_amount BIGINT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_listing ON transfer_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_buyer ON transfer_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_status ON transfer_offers(status);

-- ═════════════════════════════════════════════════════════════════
-- 11. AUCTION_BIDS — açık artırma teklifleri
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL, -- transfer_market.id
  bidder_id TEXT NOT NULL,
  bidder_team_name TEXT,
  bid_amount BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auction_bids_listing ON auction_bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_bidder ON auction_bids(bidder_id);

-- ═════════════════════════════════════════════════════════════════
-- 12. WEEKLY_REPORTS — haftalık raporlar
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  week_number INTEGER,
  season_year INTEGER,
  data JSONB DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_profile ON weekly_reports(profile_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week ON weekly_reports(profile_id, week_number);

-- ═════════════════════════════════════════════════════════════════
-- 13. ACHIEVEMENT_BADGES, PLAYER_ACHIEVEMENTS — başarımlar
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS achievement_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  rarity TEXT DEFAULT 'common',
  data JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  achievement_code TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}',
  UNIQUE(profile_id, achievement_code)
);
CREATE INDEX IF NOT EXISTS idx_player_achievements_profile ON player_achievements(profile_id);

-- ═════════════════════════════════════════════════════════════════
-- 14. PLAYER_MENTORS, PLAYER_MATCH_RATINGS — mentor ve maç puanları
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS player_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  mentor_player_id TEXT NOT NULL,
  mentee_player_id TEXT NOT NULL,
  start_week INTEGER,
  end_week INTEGER,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_player_mentors_profile ON player_mentors(profile_id);

CREATE TABLE IF NOT EXISTS player_match_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  rating FLOAT,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 90,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, fixture_id)
);
CREATE INDEX IF NOT EXISTS idx_player_match_ratings_player ON player_match_ratings(player_id);
CREATE INDEX IF NOT EXISTS idx_player_match_ratings_fixture ON player_match_ratings(fixture_id);

-- ═════════════════════════════════════════════════════════════════
-- 15. WATCHLIST_ALERTS, LEAGUE_FORUM_POSTS, LEAGUE_HISTORY
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS watchlist_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID,
  profile_id TEXT NOT NULL,
  player_id TEXT,
  alert_type TEXT,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_profile ON watchlist_alerts(profile_id);

CREATE TABLE IF NOT EXISTS league_forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id UUID,
  profile_id TEXT NOT NULL,
  team_name TEXT,
  title TEXT,
  content TEXT,
  parent_id UUID REFERENCES league_forum_posts(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_league_forum_posts_forum ON league_forum_posts(forum_id);

CREATE TABLE IF NOT EXISTS league_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL,
  season_year INTEGER,
  champion_team_id UUID,
  champion_team_name TEXT,
  runner_up_team_name TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_league_history_league ON league_history(league_id);

-- ═════════════════════════════════════════════════════════════════
-- 16. SEASON_STATS, SEASON_SUMMARIES, SEASON_AWARDS
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS season_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  season_id UUID,
  team_name TEXT,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  final_position INTEGER,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_season_stats_profile ON season_stats(profile_id);
CREATE INDEX IF NOT EXISTS idx_season_stats_season ON season_stats(season_id);

CREATE TABLE IF NOT EXISTS season_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  season_id UUID,
  summary TEXT,
  highlights JSONB DEFAULT '{}',
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS season_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID,
  profile_id TEXT,
  player_id TEXT,
  award_type TEXT,
  award_name TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═════════════════════════════════════════════════════════════════
-- 17. STADIUM_PROJECTS, FACILITY_UPGRADE_COSTS, LEAGUE_TIER_CONFIG
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS stadium_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  project_type TEXT,
  level_before INTEGER,
  level_after INTEGER,
  cost_euro BIGINT,
  duration_days INTEGER,
  status TEXT DEFAULT 'planned', -- planned, in_progress, completed, cancelled
  started_at TIMESTAMPTZ,
  completes_at TIMESTAMPTZ,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stadium_projects_profile ON stadium_projects(profile_id);

CREATE TABLE IF NOT EXISTS facility_upgrade_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_type TEXT NOT NULL,
  level INTEGER NOT NULL,
  cost_euro BIGINT,
  duration_days INTEGER,
  capacity_bonus INTEGER DEFAULT 0,
  quality_bonus INTEGER DEFAULT 0,
  description TEXT,
  UNIQUE(facility_type, level)
);

CREATE TABLE IF NOT EXISTS league_tier_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier INTEGER NOT NULL UNIQUE,
  name TEXT,
  min_reputation INTEGER DEFAULT 0,
  max_teams INTEGER DEFAULT 18,
  promotion_slots INTEGER DEFAULT 3,
  relegation_slots INTEGER DEFAULT 3,
  data JSONB DEFAULT '{}'
);
INSERT INTO league_tier_config (tier, name, min_reputation, max_teams, promotion_slots, relegation_slots)
VALUES
  (1, 'Süper Lig', 80, 18, 0, 3),
  (2, '1. Lig', 50, 18, 3, 3),
  (3, '2. Lig', 25, 18, 3, 3),
  (4, '3. Lig', 0, 18, 3, 0)
ON CONFLICT (tier) DO NOTHING;

-- ═════════════════════════════════════════════════════════════════
-- 18. LAB_SESSIONS, PUSH_TOKENS, MESSAGES — laboratuvar, push, mesajlar
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  experiment_type TEXT,
  status TEXT DEFAULT 'pending',
  data JSONB DEFAULT '{}',
  result JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_profile ON lab_sessions(profile_id);

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  token TEXT NOT NULL,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, token)
);
CREATE INDEX IF NOT EXISTS idx_push_tokens_profile ON push_tokens(profile_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT,
  recipient_id TEXT,
  subject TEXT,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);

-- ═════════════════════════════════════════════════════════════════
-- 19. MATCH_HISTORY, MATCH_LIVE_STATE — eski maç kayıtları
-- ═════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT,
  team_name TEXT,
  day INTEGER,
  home_team TEXT,
  away_team TEXT,
  home_score INTEGER,
  away_score INTEGER,
  result TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_match_history_profile ON match_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_match_history_team ON match_history(team_name);

CREATE TABLE IF NOT EXISTS match_live_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID UNIQUE,
  current_minute INTEGER DEFAULT 0,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pre_match',
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_match_live_state_fixture ON match_live_state(fixture_id);

-- ═════════════════════════════════════════════════════════════════
-- 20. ACTIVE_TACTICS — tactic_data sütunu (persistence.ts bekliyor)
-- ═════════════════════════════════════════════════════════════════
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS tactic_data JSONB DEFAULT '{}';
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS playStyle TEXT DEFAULT 'dengeli';
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS formation_id TEXT;
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '{}';
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS instructions JSONB DEFAULT '{}';

-- ═════════════════════════════════════════════════════════════════
-- 21. PROFILES — eksik sütunlar (prev_tactic zaten ekli)
-- ═════════════════════════════════════════════════════════════════
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS money BIGINT DEFAULT 5000000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_day INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stadium_upgrades JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 50;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fans INTEGER DEFAULT 1000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league_id UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tutorial_step INTEGER DEFAULT 0;

-- ═════════════════════════════════════════════════════════════════
-- 22. PLAYERS — eksik sütunlar
-- ═════════════════════════════════════════════════════════════════
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_for_sale BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_on_loan BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_on_loan_market BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_fee BIGINT DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_status TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_team_id UUID;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_end_date DATE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS asking_price BIGINT DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS market_value BIGINT DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS salary INTEGER DEFAULT 5000;
ALTER TABLE players ADD COLUMN IF NOT EXISTS cond INTEGER DEFAULT 100;
ALTER TABLE players ADD COLUMN IF NOT EXISTS morale INTEGER DEFAULT 70;
ALTER TABLE players ADD COLUMN IF NOT EXISTS form INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS archetype TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS playStyle TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS traits JSONB DEFAULT '[]';
ALTER TABLE players ADD COLUMN IF NOT EXISTS negTraits JSONB DEFAULT '[]';
ALTER TABLE players ADD COLUMN IF NOT EXISTS personalityTraits JSONB DEFAULT '[]';
ALTER TABLE players ADD COLUMN IF NOT EXISTS traitLevels JSONB DEFAULT '{}';
ALTER TABLE players ADD COLUMN IF NOT EXISTS styleLevels JSONB DEFAULT '{}';
ALTER TABLE players ADD COLUMN IF NOT EXISTS height INTEGER DEFAULT 180;
ALTER TABLE players ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 75;
ALTER TABLE players ADD COLUMN IF NOT EXISTS preferred_foot TEXT DEFAULT 'Right';
ALTER TABLE players ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'TR';
ALTER TABLE players ADD COLUMN IF NOT EXISTS secondary_positions JSONB DEFAULT '[]';
ALTER TABLE players ADD COLUMN IF NOT EXISTS special_role TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_legend BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS yellow_cards INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS red_cards INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_weeks INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS last_match_rating FLOAT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS goals INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS assists INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS appearances INTEGER DEFAULT 0;

-- ═════════════════════════════════════════════════════════════════
-- 23. FIXTURES — eksik sütunlar
-- ═════════════════════════════════════════════════════════════════
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS home_atmosphere JSONB DEFAULT '{}';
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS competition_stage TEXT;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS cup_season_id UUID;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS is_replay_available BOOLEAN DEFAULT true;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS replay_data JSONB DEFAULT '{}';

COMMIT;

-- ═════════════════════════════════════════════════════════════════
-- ÖZET — kaç tablo oluşturuldu sayımı
-- ═════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE ' Toplam tablo sayısı: %', v_count;
  RAISE NOTICE '═══════════════════════════════════════════════';
END $$;
