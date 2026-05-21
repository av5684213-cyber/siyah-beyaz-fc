-- ═══════════════════════════════════════════════════════════════════════════════
-- SİYAH BEYAZ FC — MASTER MİGRATİON (BİRLEŞTİRİLMİŞ)
-- Tarih: 2026-05-18
-- 
-- Bu dosya TEK SEFERDE çalıştırılabilir. Tüm ifadeler idempotent'tir:
--   - CREATE TABLE IF NOT EXISTS
--   - DO $$ ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--   - ALTER TABLE ADD COLUMN IF NOT EXISTS / DROP COLUMN IF EXISTS
--   - CREATE INDEX IF NOT EXISTS
--
-- ÇALIŞTIRMA SIRASI:
--   1. Çekirdek tablolar (players, profiles, fixtures, league_teams, vb. zaten var)
--   2. Yeni tablolar (match_events, notifications, friendly_queue, vb.)
--   3. Eksik kolonlar (profiles, players, friendly_matches, vb.)
--   4. İndeksler
--   5. RLS politikaları
--   6. Seed verileri
--   7. Realtime yayınları
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 1: YENİ TABLOLAR
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1.1 match_events — Maç olayları (gol, kart, sakatlık, yorum)
CREATE TABLE IF NOT EXISTS match_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fixture_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  minute INTEGER,
  team TEXT,
  player_id TEXT,
  player_name TEXT,
  assist_player_id TEXT,
  assist_player_name TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 match_participants — Maç sohbeti katılımcıları
CREATE TABLE IF NOT EXISTS match_participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fixture_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fixture_id, user_id)
);

-- 1.3 notifications — Bildirimler
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT DEFAULT '/',
  tag TEXT DEFAULT 'general',
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 user_facilities — Kullanıcı tesis seviyeleri
CREATE TABLE IF NOT EXISTS user_facilities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL UNIQUE,
  stadium_level INTEGER DEFAULT 1,
  training_ground_level INTEGER DEFAULT 1,
  health_center_level INTEGER DEFAULT 1,
  scout_office_level INTEGER DEFAULT 1,
  upgrading_type TEXT,
  upgrading_finish_day INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 facility_upgrade_costs — Tesis yükseltme maliyetleri
CREATE TABLE IF NOT EXISTS facility_upgrade_costs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  facility_type TEXT NOT NULL,
  current_level INTEGER NOT NULL,
  credits_cost INTEGER NOT NULL,
  upgrade_days INTEGER NOT NULL DEFAULT 1,
  UNIQUE(facility_type, current_level)
);

-- 1.6 user_academy — Kullanıcı akademi seviyeleri
CREATE TABLE IF NOT EXISTS user_academy (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL UNIQUE,
  academy_level INTEGER DEFAULT 1,
  extra_slots BOOLEAN DEFAULT false,
  upgrading BOOLEAN DEFAULT false,
  upgrading_finish_day INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 academy_upgrade_costs — Akademi yükseltme maliyetleri
CREATE TABLE IF NOT EXISTS academy_upgrade_costs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  current_level INTEGER NOT NULL,
  credits_cost INTEGER NOT NULL,
  upgrade_days INTEGER NOT NULL DEFAULT 1,
  extra_slots_cost INTEGER,
  UNIQUE(current_level)
);

-- 1.8 season_stats — Sezon oyuncu istatistikleri
CREATE TABLE IF NOT EXISTS season_stats (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id TEXT NOT NULL,
  season_id TEXT NOT NULL,
  team_id TEXT,
  team_name TEXT,
  matches_played INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, season_id)
);

-- 1.9 friendly_queue — Dostluk maçı sırası
CREATE TABLE IF NOT EXISTS friendly_queue (
  user_id TEXT PRIMARY KEY,
  team_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_priority BOOLEAN DEFAULT false
);

-- 1.10 friendly_matches — Dostluk maçı geçmişi
CREATE TABLE IF NOT EXISTS friendly_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id TEXT NOT NULL,
  away_team_id TEXT NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT now(),
  home_team_name TEXT,
  away_team_name TEXT,
  status TEXT DEFAULT 'completed',
  match_data JSONB
);

-- 1.11 match_chat — Maç sohbeti
CREATE TABLE IF NOT EXISTS match_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat',
  reaction_type TEXT,
  minute INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.12 manager_conversations — Menajer konuşmaları
CREATE TABLE IF NOT EXISTS manager_conversations (
  id TEXT PRIMARY KEY,
  participant_1 TEXT NOT NULL,
  participant_2 TEXT NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_content TEXT DEFAULT '',
  last_message_sender TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

-- 1.13 manager_messages — Menajer mesajları
CREATE TABLE IF NOT EXISTS manager_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.14 manager_presence — Online durum
CREATE TABLE IF NOT EXISTS manager_presence (
  profile_id TEXT PRIMARY KEY,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  status_text TEXT DEFAULT ''
);

-- 1.15 youth_players — Genç oyuncular
CREATE TABLE IF NOT EXISTS youth_players (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL DEFAULT 16,
  position TEXT NOT NULL,
  specific_position TEXT NOT NULL DEFAULT 'CM',
  rating INTEGER NOT NULL DEFAULT 50,
  potential INTEGER NOT NULL DEFAULT 70,
  hidden_potential INTEGER NOT NULL DEFAULT 75,
  academy_level INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'U19',
  is_wonderkid BOOLEAN NOT NULL DEFAULT FALSE,
  development_curve TEXT NOT NULL DEFAULT 'normal',
  join_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  weekly_training_hours INTEGER NOT NULL DEFAULT 15,
  total_training_weeks INTEGER NOT NULL DEFAULT 0,
  stats_gained_this_season JSONB NOT NULL DEFAULT '{}',
  personality_traits JSONB NOT NULL DEFAULT '[]',
  traits JSONB NOT NULL DEFAULT '[]',
  trait_levels JSONB NOT NULL DEFAULT '{}',
  scout_report JSONB,
  injured BOOLEAN NOT NULL DEFAULT FALSE,
  injury_weeks_remaining INTEGER NOT NULL DEFAULT 0,
  cond INTEGER NOT NULL DEFAULT 85,
  form INTEGER NOT NULL DEFAULT 60,
  morale INTEGER NOT NULL DEFAULT 70,
  confidence INTEGER NOT NULL DEFAULT 60,
  stats JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.16 youth_facilities — Gençlik tesisleri
CREATE TABLE IF NOT EXISTS youth_facilities (
  profile_id TEXT PRIMARY KEY,
  facility_levels JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.17 season_awards — Sezon ödülleri
CREATE TABLE IF NOT EXISTS season_awards (
  id TEXT PRIMARY KEY,
  season_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  league_name TEXT,
  award_type TEXT NOT NULL,
  player_id TEXT,
  player_name TEXT,
  team_name TEXT,
  stat_value FLOAT DEFAULT 0,
  stat_detail JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.18 season_summaries — Sezon özetleri
CREATE TABLE IF NOT EXISTS season_summaries (
  id TEXT PRIMARY KEY,
  season_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  team_name TEXT,
  league_name TEXT,
  final_position INTEGER,
  points INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_yellow INTEGER DEFAULT 0,
  total_red INTEGER DEFAULT 0,
  total_clean_sheets INTEGER DEFAULT 0,
  avg_team_rating FLOAT DEFAULT 0,
  top_scorer_name TEXT,
  top_scorer_goals INTEGER DEFAULT 0,
  top_assister_name TEXT,
  top_assister_assists INTEGER DEFAULT 0,
  best_player_name TEXT,
  best_player_rating FLOAT DEFAULT 0,
  is_champion BOOLEAN DEFAULT false,
  is_promoted BOOLEAN DEFAULT false,
  is_relegated BOOLEAN DEFAULT false,
  awards_count INTEGER DEFAULT 0,
  badge_earned TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.19 hall_of_fame — Efsaneler müzesi
CREATE TABLE IF NOT EXISTS hall_of_fame (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  position TEXT NOT NULL,
  nationality TEXT,
  seasons_played INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_clean_sheets INTEGER DEFAULT 0,
  total_motm INTEGER DEFAULT 0,
  avg_rating FLOAT DEFAULT 0,
  peak_rating INTEGER DEFAULT 0,
  legend_tier TEXT NOT NULL DEFAULT 'bronze',
  is_club_legend BOOLEAN DEFAULT false,
  awards_won JSONB DEFAULT '[]',
  joined_day INTEGER,
  retired_day INTEGER,
  retired_season TEXT,
  inducted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.20 player_achievements — Oyuncu başarıları
CREATE TABLE IF NOT EXISTS player_achievements (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  player_name TEXT,
  team_name TEXT,
  season_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  award_type TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.21 auction_bids — Açık artırma teklifleri
CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES transfer_market(id) ON DELETE CASCADE,
  bidder_id TEXT NOT NULL,
  bidder_name TEXT NOT NULL,
  bid_amount BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.22 player_career_stats — Oyuncu kariyer istatistikleri
CREATE TABLE IF NOT EXISTS player_career_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  season_id TEXT NOT NULL,
  team_id TEXT,
  team_name TEXT,
  matches_played INT DEFAULT 0,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,
  fouls INT DEFAULT 0,
  clean_sheets INT DEFAULT 0,
  motm INT DEFAULT 0,
  saves INT DEFAULT 0,
  position TEXT,
  rating INT,
  avg_rating FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.23 error_logs — Hata kayıtları
CREATE TABLE IF NOT EXISTS error_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'error',
  message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alternatif: eski format (TEXT id) ile uyumlu
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS error_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    route TEXT,
    method TEXT DEFAULT 'GET',
    user_id TEXT,
    request_body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- 1.24 player_development_log — Oyuncu gelişim kaydı
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

-- 1.25 push_subscriptions — Web push abonelikleri
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL UNIQUE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.26 trainings — Antrenman kayıtları
CREATE TABLE IF NOT EXISTS trainings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL,
  team_name TEXT,
  session_type TEXT NOT NULL DEFAULT 'morning',
  training_date DATE NOT NULL DEFAULT CURRENT_DATE,
  training_time TEXT NOT NULL DEFAULT '15:00',
  player_results JSONB DEFAULT '[]'::jsonb,
  avg_cond_change NUMERIC DEFAULT 0,
  avg_morale_change NUMERIC DEFAULT 0,
  total_players INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 2: EKSİK KOLONLAR
-- ═══════════════════════════════════════════════════════════════════════════════

-- 2.1 profiles tablosu
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fans INTEGER DEFAULT 1000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scout_slots INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_coaches INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_physios INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bot_difficulty INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_trophies INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_awards INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS season_badges JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hof_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academy_weekly_budget INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_youth_intake_season TEXT;

-- 2.2 mg_coins → credits geçişi
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 250;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
UPDATE profiles SET credits = mg_coins WHERE credits IS NULL AND mg_coins IS NOT NULL;
ALTER TABLE profiles DROP COLUMN IF EXISTS mg_coins;

-- 2.3 players tablosu
ALTER TABLE players ADD COLUMN IF NOT EXISTS suspended_until DATE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_injured BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_end_date DATE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE players ADD COLUMN IF NOT EXISTS form_rating INTEGER DEFAULT 50;
ALTER TABLE players ADD COLUMN IF NOT EXISTS potential INTEGER DEFAULT 60;

-- 2.4 friendly_matches tablosu
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS away_team_id TEXT;
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS played_at TIMESTAMPTZ;
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS home_team_name TEXT;
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS away_team_name TEXT;
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE friendly_matches ADD COLUMN IF NOT EXISTS match_data JSONB;

-- 2.5 transfer_market tablosu
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS bid_count INTEGER DEFAULT 0;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS is_auction BOOLEAN DEFAULT false;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS starting_price BIGINT;
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS reserve_price BIGINT;

-- 2.6 match_history tablosu
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]'::jsonb;
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE match_history ADD COLUMN IF NOT EXISTS season_id UUID;

-- 2.7 player_career_stats tablosu
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS team_id TEXT;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS matches_played INT DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS fouls INT DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS clean_sheets INT DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS motm INT DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS saves INT DEFAULT 0;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS rating INT;
ALTER TABLE player_career_stats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2.8 manager_messages eski şema düzeltmeleri
DO $$ BEGIN
  ALTER TABLE manager_messages DROP COLUMN IF EXISTS receiver_id;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  UPDATE manager_messages SET content = message WHERE (content IS NULL OR content = '') AND message IS NOT NULL;
  ALTER TABLE manager_messages DROP COLUMN IF EXISTS message;
EXCEPTION WHEN others THEN NULL;
END $$;

-- 2.9 league_teams bot kolonu
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;

-- 2.10 friendly_queue is_priority
DO $$ BEGIN
  ALTER TABLE friendly_queue ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 3: İNDEKSLER
-- ═══════════════════════════════════════════════════════════════════════════════

-- Maç olayları
CREATE INDEX IF NOT EXISTS idx_match_events_fixture ON match_events (fixture_id);

-- Bildirimler
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications (profile_id, created_at DESC);

-- Sezon istatistikleri
CREATE INDEX IF NOT EXISTS idx_season_stats_player ON season_stats (player_id);
CREATE INDEX IF NOT EXISTS idx_season_stats_season ON season_stats (season_id);

-- Oyuncular
CREATE INDEX IF NOT EXISTS idx_players_profile_id ON players (profile_id);
CREATE INDEX IF NOT EXISTS idx_players_team_name ON players (team_name);
CREATE INDEX IF NOT EXISTS idx_players_suspended ON players(suspended_until) WHERE suspended_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_injured ON players(is_injured) WHERE is_injured = true;
CREATE INDEX IF NOT EXISTS idx_players_form_rating ON players(form_rating) WHERE form_rating > 75 OR form_rating < 25;
CREATE INDEX IF NOT EXISTS idx_players_injury_history ON players USING GIN(injury_history);

-- Fikstür
CREATE INDEX IF NOT EXISTS idx_fixtures_match_date ON fixtures (match_date);
CREATE INDEX IF NOT EXISTS idx_fixtures_home_team_id ON fixtures (home_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_away_team_id ON fixtures (away_team_id);

-- Lig sıralaması
CREATE INDEX IF NOT EXISTS idx_league_standings_season_id ON league_standings (season_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_team_id ON league_standings (team_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_season_team ON league_standings (season_id, team_id);

-- Transfer pazarı
CREATE INDEX IF NOT EXISTS idx_transfer_market_expires ON transfer_market(expires_at) WHERE is_active = true AND is_auction = true;

-- Maç geçmişi
CREATE INDEX IF NOT EXISTS idx_match_history_season ON match_history(season_id) WHERE season_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_match_history_events ON match_history USING GIN(events);

-- Maç sohbeti
CREATE INDEX IF NOT EXISTS idx_match_chat_fixture ON match_chat(fixture_id, created_at);
CREATE INDEX IF NOT EXISTS idx_match_chat_profile ON match_chat(profile_id);

-- Menajer mesajları
CREATE INDEX IF NOT EXISTS idx_msg_conv ON manager_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_msg_sender ON manager_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_unread ON manager_messages(conversation_id, is_read) WHERE is_read = FALSE;

-- Menajer konuşmaları
CREATE INDEX IF NOT EXISTS idx_conv_p1 ON manager_conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conv_p2 ON manager_conversations(participant_2);

-- Online durum
CREATE INDEX IF NOT EXISTS idx_presence_online ON manager_presence(is_online) WHERE is_online = TRUE;

-- Bot
CREATE INDEX IF NOT EXISTS idx_profiles_is_bot ON profiles(is_bot) WHERE is_bot = true;

-- Genç oyuncular
CREATE INDEX IF NOT EXISTS idx_youth_players_profile_id ON youth_players(profile_id);

-- Sezon ödülleri
CREATE INDEX IF NOT EXISTS idx_season_awards_season ON season_awards(season_id);
CREATE INDEX IF NOT EXISTS idx_season_awards_profile ON season_awards(profile_id);
CREATE INDEX IF NOT EXISTS idx_season_awards_type ON season_awards(award_type);
CREATE INDEX IF NOT EXISTS idx_season_awards_player ON season_awards(player_id);

-- Sezon özetleri
CREATE INDEX IF NOT EXISTS idx_season_summaries_season ON season_summaries(season_id);
CREATE INDEX IF NOT EXISTS idx_season_summaries_profile ON season_summaries(profile_id);
CREATE INDEX IF NOT EXISTS idx_season_summaries_champion ON season_summaries(is_champion) WHERE is_champion = true;

-- Efsaneler
CREATE INDEX IF NOT EXISTS idx_hof_profile ON hall_of_fame(profile_id);
CREATE INDEX IF NOT EXISTS idx_hof_player ON hall_of_fame(player_id);
CREATE INDEX IF NOT EXISTS idx_hof_tier ON hall_of_fame(legend_tier);
CREATE INDEX IF NOT EXISTS idx_hof_legend ON hall_of_fame(is_club_legend) WHERE is_club_legend = true;
CREATE INDEX IF NOT EXISTS idx_hof_rating ON hall_of_fame(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_hof ON profiles(hof_count) WHERE hof_count > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_trophies ON profiles(total_trophies) WHERE total_trophies > 0;

-- Oyuncu başarıları
CREATE INDEX IF NOT EXISTS idx_player_achievements_player ON player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_season ON player_achievements(season_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_profile ON player_achievements(profile_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_badge ON player_achievements(badge_name);

-- Açık artırma
CREATE INDEX IF NOT EXISTS idx_auction_bids_listing ON auction_bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_bidder ON auction_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_amount ON auction_bids(listing_id, bid_amount DESC);

-- Kariyer istatistikleri
CREATE INDEX IF NOT EXISTS idx_pcs_player_id ON player_career_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_pcs_season_id ON player_career_stats(season_id);
CREATE INDEX IF NOT EXISTS idx_pcs_team_id ON player_career_stats(team_id);
CREATE INDEX IF NOT EXISTS idx_pcs_player_season ON player_career_stats(player_id, season_id);
CREATE INDEX IF NOT EXISTS idx_pcs_motm ON player_career_stats(motm) WHERE motm > 0;
CREATE INDEX IF NOT EXISTS idx_pcs_clean_sheets ON player_career_stats(clean_sheets) WHERE clean_sheets > 0;

-- Hata kayıtları
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON error_logs(source);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_route_date ON error_logs(route, created_at DESC);

-- Gelişim kaydı
CREATE INDEX IF NOT EXISTS idx_dev_log_player ON player_development_log (player_id, updated_at DESC);

-- Antrenman
CREATE INDEX IF NOT EXISTS idx_trainings_profile_date ON trainings (profile_id, training_date DESC);

-- Eski yanlış indeksler
DROP INDEX IF EXISTS idx_players_owner_team_id;
DROP INDEX IF EXISTS idx_matches_match_date;
DROP INDEX IF EXISTS idx_matches_home_team_id;
DROP INDEX IF EXISTS idx_matches_away_team_id;
DROP INDEX IF EXISTS idx_league_table_season;
DROP INDEX IF EXISTS idx_league_table_team_id;
DROP INDEX IF EXISTS idx_league_table_season_team;


-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 4: RLS POLİTİKALARI
-- ═══════════════════════════════════════════════════════════════════════════════

-- match_events
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY match_events_select ON match_events FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY match_events_insert ON match_events FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- match_participants
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view their own match participations" ON match_participants FOR SELECT USING (auth.uid()::text = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can join matches" ON match_participants FOR INSERT WITH CHECK (auth.uid()::text = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY notifications_select ON notifications FOR SELECT USING (auth.uid()::text = profile_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY notifications_update ON notifications FOR UPDATE USING (auth.uid()::text = profile_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY notifications_delete ON notifications FOR DELETE USING (auth.uid()::text = profile_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- user_facilities
ALTER TABLE user_facilities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY user_facilities_select ON user_facilities FOR SELECT USING (auth.uid()::text = profile_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY user_facilities_insert ON user_facilities FOR INSERT WITH CHECK (auth.uid()::text = profile_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY user_facilities_update ON user_facilities FOR UPDATE USING (auth.uid()::text = profile_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- facility_upgrade_costs
ALTER TABLE facility_upgrade_costs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY facility_costs_select ON facility_upgrade_costs FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- user_academy
ALTER TABLE user_academy ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY user_academy_select ON user_academy FOR SELECT USING (auth.uid()::text = profile_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY user_academy_insert ON user_academy FOR INSERT WITH CHECK (auth.uid()::text = profile_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY user_academy_update ON user_academy FOR UPDATE USING (auth.uid()::text = profile_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- academy_upgrade_costs
ALTER TABLE academy_upgrade_costs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY academy_costs_select ON academy_upgrade_costs FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- season_stats
ALTER TABLE season_stats ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY season_stats_select ON season_stats FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- friendly_queue
ALTER TABLE friendly_queue ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY friendly_queue_select ON friendly_queue FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY friendly_queue_insert ON friendly_queue FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY friendly_queue_delete ON friendly_queue FOR DELETE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- friendly_matches
ALTER TABLE friendly_matches ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY friendly_matches_select ON friendly_matches FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY friendly_matches_insert ON friendly_matches FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- match_chat
ALTER TABLE match_chat ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY match_chat_select ON match_chat FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY match_chat_insert ON match_chat FOR INSERT WITH CHECK (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY match_chat_delete ON match_chat FOR DELETE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY match_chat_service ON match_chat FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- manager_conversations
ALTER TABLE manager_conversations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY conv_select ON manager_conversations FOR SELECT USING (participant_1 = auth.uid()::text OR participant_2 = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY conv_insert ON manager_conversations FOR INSERT WITH CHECK (participant_1 = auth.uid()::text OR participant_2 = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY conv_update ON manager_conversations FOR UPDATE USING (participant_1 = auth.uid()::text OR participant_2 = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY conv_delete ON manager_conversations FOR DELETE USING (participant_1 = auth.uid()::text OR participant_2 = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- manager_messages
ALTER TABLE manager_messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY msg_select ON manager_messages FOR SELECT USING (EXISTS (SELECT 1 FROM manager_conversations c WHERE c.id = manager_messages.conversation_id AND (c.participant_1 = auth.uid()::text OR c.participant_2 = auth.uid()::text))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY msg_insert ON manager_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM manager_conversations c WHERE c.id = manager_messages.conversation_id AND (c.participant_1 = auth.uid()::text OR c.participant_2 = auth.uid()::text)) AND sender_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY msg_update ON manager_messages FOR UPDATE USING (EXISTS (SELECT 1 FROM manager_conversations c WHERE c.id = manager_messages.conversation_id AND (c.participant_1 = auth.uid()::text OR c.participant_2 = auth.uid()::text))); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY msg_delete ON manager_messages FOR DELETE USING (sender_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- manager_presence
ALTER TABLE manager_presence ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY presence_select ON manager_presence FOR SELECT USING (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY presence_insert ON manager_presence FOR INSERT WITH CHECK (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY presence_update ON manager_presence FOR UPDATE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- youth_players
ALTER TABLE youth_players ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY youth_players_select ON youth_players FOR SELECT USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY youth_players_insert ON youth_players FOR INSERT WITH CHECK (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY youth_players_update ON youth_players FOR UPDATE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY youth_players_delete ON youth_players FOR DELETE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY youth_players_service ON youth_players FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- youth_facilities
ALTER TABLE youth_facilities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY youth_facilities_select ON youth_facilities FOR SELECT USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY youth_facilities_insert ON youth_facilities FOR INSERT WITH CHECK (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY youth_facilities_update ON youth_facilities FOR UPDATE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY youth_facilities_delete ON youth_facilities FOR DELETE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY youth_facilities_service ON youth_facilities FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- season_awards
ALTER TABLE season_awards ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY season_awards_select ON season_awards FOR SELECT USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY season_awards_insert ON season_awards FOR INSERT WITH CHECK (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY season_awards_update ON season_awards FOR UPDATE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY season_awards_delete ON season_awards FOR DELETE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY season_awards_service ON season_awards FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- season_summaries
ALTER TABLE season_summaries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY season_summaries_select ON season_summaries FOR SELECT USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY season_summaries_insert ON season_summaries FOR INSERT WITH CHECK (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY season_summaries_update ON season_summaries FOR UPDATE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY season_summaries_delete ON season_summaries FOR DELETE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY season_summaries_service ON season_summaries FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- hall_of_fame
ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY hof_select ON hall_of_fame FOR SELECT USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY hof_insert ON hall_of_fame FOR INSERT WITH CHECK (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY hof_update ON hall_of_fame FOR UPDATE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY hof_delete ON hall_of_fame FOR DELETE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY hof_service ON hall_of_fame FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- player_achievements
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY player_achievements_select ON player_achievements FOR SELECT USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY player_achievements_insert ON player_achievements FOR INSERT WITH CHECK (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY player_achievements_update ON player_achievements FOR UPDATE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY player_achievements_delete ON player_achievements FOR DELETE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY player_achievements_service ON player_achievements FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- auction_bids
ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "auction_bids_select" ON auction_bids FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "auction_bids_insert" ON auction_bids FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- player_career_stats
ALTER TABLE player_career_stats ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "player_career_stats_select" ON player_career_stats FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "player_career_stats_insert" ON player_career_stats FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "player_career_stats_update" ON player_career_stats FOR UPDATE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- error_logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY error_logs_service ON error_logs FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- player_development_log
ALTER TABLE player_development_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view own development logs" ON player_development_log FOR SELECT USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view own subscriptions" ON push_subscriptions FOR SELECT USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert own subscriptions" ON push_subscriptions FOR INSERT WITH CHECK (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own subscriptions" ON push_subscriptions FOR UPDATE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can delete own subscriptions" ON push_subscriptions FOR DELETE USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- trainings
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view own trainings" ON trainings FOR SELECT USING (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert own trainings" ON trainings FOR INSERT WITH CHECK (profile_id = auth.uid()::text); EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 5: SEED VERİLERİ
-- ═══════════════════════════════════════════════════════════════════════════════

-- Tesis yükseltme maliyetleri
INSERT INTO facility_upgrade_costs (facility_type, current_level, credits_cost, upgrade_days)
SELECT * FROM (
  VALUES
    ('stadium', 1, 50, 1), ('stadium', 2, 100, 2), ('stadium', 3, 200, 3), ('stadium', 4, 400, 5),
    ('training_ground', 1, 40, 1), ('training_ground', 2, 80, 2), ('training_ground', 3, 160, 3), ('training_ground', 4, 320, 5),
    ('health_center', 1, 30, 1), ('health_center', 2, 60, 2), ('health_center', 3, 120, 3), ('health_center', 4, 240, 5),
    ('scout_office', 1, 35, 1), ('scout_office', 2, 70, 2), ('scout_office', 3, 140, 3), ('scout_office', 4, 280, 5)
) AS v(facility_type, current_level, credits_cost, upgrade_days)
WHERE NOT EXISTS (SELECT 1 FROM facility_upgrade_costs LIMIT 1);

-- Akademi yükseltme maliyetleri
INSERT INTO academy_upgrade_costs (current_level, credits_cost, upgrade_days, extra_slots_cost)
SELECT * FROM (
  VALUES
    (1, 60, 1, 30), (2, 120, 2, 60), (3, 240, 3, 120), (4, 480, 5, 240)
) AS v(current_level, credits_cost, upgrade_days, extra_slots_cost)
WHERE NOT EXISTS (SELECT 1 FROM academy_upgrade_costs LIMIT 1);


-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 6: REALTIME YAYINLARI
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE match_events; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE match_participants; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE notifications; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE friendly_queue; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE friendly_matches; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE match_chat; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE manager_messages; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE manager_conversations; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE manager_presence; EXCEPTION WHEN others THEN NULL; END $$;

-- Realtime REPLICA IDENTITY FULL
ALTER TABLE match_chat REPLICA IDENTITY FULL;
ALTER TABLE manager_messages REPLICA IDENTITY FULL;
ALTER TABLE manager_conversations REPLICA IDENTITY FULL;
ALTER TABLE manager_presence REPLICA IDENTITY FULL;


-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 7: VERİ GÜNCELLEMELERİ
-- ═══════════════════════════════════════════════════════════════════════════════

-- Mevcut NPC takımları bot olarak işaretle
UPDATE profiles SET is_bot = true
WHERE id IN (
  SELECT lt.profile_id FROM league_teams lt
  WHERE lt.is_npc = true AND lt.profile_id IS NOT NULL
);
UPDATE league_teams SET is_bot = true WHERE is_npc = true;

-- Mevcut serbest oyuncuları açık artırma dışında bırak
UPDATE transfer_market SET is_auction = false WHERE seller_id = 'free-agent-system' AND is_auction IS NULL;

-- Mevcut form_rating başlangıç değeri
UPDATE players SET form_rating = COALESCE(form, 50) WHERE form_rating IS NULL OR form_rating = 50;

-- Genç oyuncularda potential > rating
UPDATE players SET potential = GREATEST(potential, rating + 5 + floor(random() * 10)::int)
WHERE age < 22 AND potential <= rating;

-- Mevcut injury verisinden is_injured güncelle
UPDATE players
SET is_injured = true, injury_end_date = CURRENT_DATE + COALESCE((injury::jsonb->>'remaining_days')::int, 7)
WHERE injury IS NOT NULL AND injury::text NOT IN ('null', '""', '{}') AND jsonb_typeof(injury::jsonb) != 'null' AND is_injured = false;
