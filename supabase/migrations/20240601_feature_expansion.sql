-- ═══════════════════════════════════════════════════════════════════
-- SİYAH BEYAZ FC — FEATURE EXPANSION MIGRATION
-- ═══════════════════════════════════════════════════════════════════
-- Covers: Öneri 5-24 (daily tasks, weekly reports, player career,
--         league tiers, watchlist alerts, transfer negotiation,
--         loan buy-option, agent messaging, stadium construction,
--         mentor system, player dissatisfaction, confidence,
--         atmosphere, notification categories, team colors,
--         player match ratings)
--
-- Schema compatibility notes:
--   • profiles.id  is TEXT  (not UUID)
--   • players.id   is TEXT  (not UUID)
--   • players.confidence is INTEGER — new TEXT column named confidence_status
--   • players has is_for_sale (not transfer_listed)
--   • loans table needs from_profile_id / to_profile_id / returned columns
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- SECTION A — LOANS TABLE EXPANSION (required before Öneri-13)
-- ═══════════════════════════════════════════════════════════════════
-- The existing loans table uses owner_team_id / loaned_to_team_id (TEXT).
-- Add profile-level FK columns and lifecycle columns needed by RPCs.

ALTER TABLE loans ADD COLUMN IF NOT EXISTS from_profile_id TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS to_profile_id TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS returned BOOLEAN DEFAULT false;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ;

-- ── ÖNERİ-13: Kiralıkta Satın Alma Opsiyonu ────────────────────
ALTER TABLE loans ADD COLUMN IF NOT EXISTS buy_option_price BIGINT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS buy_option_deadline DATE;

-- ═══════════════════════════════════════════════════════════════════
-- SECTION B — NEW TABLES
-- ═══════════════════════════════════════════════════════════════════

-- ── ÖNERİ-6: Günlük Görev Sistemi ──────────────────────────────
CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN (
    'win_3_0', 'list_2_players', 'train_11_players', 'promote_youth',
    'read_rival_analysis', 'play_friendly', 'scout_player',
    'renew_contract', 'buy_player', 'sell_player'
  )),
  description TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('money', 'credits')),
  reward_amount INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_type, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, date);

ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view own daily tasks" ON daily_tasks
    FOR SELECT USING (user_id = auth.uid()::text);
  CREATE POLICY "Users can update own daily tasks" ON daily_tasks
    FOR UPDATE USING (user_id = auth.uid()::text);
  CREATE POLICY "Service role full access daily_tasks" ON daily_tasks
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── ÖNERİ-7: Haftalık Özet Raporu ──────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  season_id TEXT,
  week_number INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  best_player_id TEXT,
  best_player_name TEXT,
  weekly_income BIGINT NOT NULL DEFAULT 0,
  league_position INTEGER,
  next_opponent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, season_id, week_number)
);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_user ON weekly_reports(user_id);

ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view own weekly reports" ON weekly_reports
    FOR SELECT USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── ÖNERİ-9: Dönemlere Göre Zorluk Artışı ──────────────────────
CREATE TABLE IF NOT EXISTS league_tier_config (
  id INTEGER PRIMARY KEY,
  tier INTEGER NOT NULL UNIQUE,
  min_ovr INTEGER NOT NULL DEFAULT 55,
  max_ovr INTEGER NOT NULL DEFAULT 65,
  label TEXT NOT NULL
);

INSERT INTO league_tier_config (id, tier, min_ovr, max_ovr, label) VALUES
  (1, 4, 55, 65, '4. Lig'),
  (2, 3, 62, 72, '3. Lig'),
  (3, 2, 68, 78, '2. Lig'),
  (4, 1, 75, 85, '1. Lig')
ON CONFLICT (tier) DO UPDATE
  SET min_ovr = EXCLUDED.min_ovr,
      max_ovr = EXCLUDED.max_ovr,
      label   = EXCLUDED.label;

-- ── ÖNERİ-11: Watchlist Alert tablosu ──────────────────────────
CREATE TABLE IF NOT EXISTS watchlist_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'listed', 'price_drop', 'sold', 'contract_expiring'
  )),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_user ON watchlist_alerts(user_id, is_read);

ALTER TABLE watchlist_alerts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view own watchlist alerts" ON watchlist_alerts
    FOR SELECT USING (user_id = auth.uid()::text);
  CREATE POLICY "Users can update own watchlist alerts" ON watchlist_alerts
    FOR UPDATE USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── ÖNERİ-12: Transfer Teklifi Pazarlığı ──────────────────────
CREATE TABLE IF NOT EXISTS transfer_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  from_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'countered', 'accepted', 'rejected', 'expired')),
  counter_amount BIGINT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfer_offers_from ON transfer_offers(from_profile_id, status);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_to ON transfer_offers(to_profile_id, status);

ALTER TABLE transfer_offers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view offers involving them" ON transfer_offers
    FOR SELECT USING (from_profile_id = auth.uid()::text OR to_profile_id = auth.uid()::text);
  CREATE POLICY "Service role full access transfer_offers" ON transfer_offers
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── ÖNERİ-14: Oyuncu Ajanı Mesajlaşması ────────────────────────
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN (
    'contract_warning', 'offer_received', 'low_playtime',
    'unhappy', 'transfer_request', 'general'
  )),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  manager_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_messages_profile ON agent_messages(profile_id, is_read);

ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view own agent messages" ON agent_messages
    FOR SELECT USING (profile_id = auth.uid()::text);
  CREATE POLICY "Users can update own agent messages" ON agent_messages
    FOR UPDATE USING (profile_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── ÖNERİ-16: Yeni Stadyum İnşaatı ─────────────────────────────
CREATE TABLE IF NOT EXISTS stadium_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Yeni Stadyum',
  current_phase INTEGER NOT NULL DEFAULT 0 CHECK (current_phase BETWEEN 0 AND 5),
  target_capacity INTEGER NOT NULL DEFAULT 50000,
  cost_per_phase BIGINT NOT NULL DEFAULT 5000000,
  started_at TIMESTAMPTZ,
  estimated_completion TIMESTAMPTZ,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stadium_projects ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can manage own stadium projects" ON stadium_projects
    FOR ALL USING (profile_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── ÖNERİ-18: Mentor Sistemi ───────────────────────────────────
CREATE TABLE IF NOT EXISTS player_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  mentee_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bonus_rate NUMERIC(3,2) NOT NULL DEFAULT 0.30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(mentee_id)
);

CREATE INDEX IF NOT EXISTS idx_player_mentors_profile ON player_mentors(profile_id);

ALTER TABLE player_mentors ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can manage own mentor assignments" ON player_mentors
    FOR ALL USING (profile_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── ÖNERİ-5: Player Match Ratings ──────────────────────────────
CREATE TABLE IF NOT EXISTS player_match_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  rating NUMERIC(4,2) NOT NULL DEFAULT 6.0,
  match_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(player_id, fixture_id)
);

CREATE INDEX IF NOT EXISTS idx_player_match_ratings_player
  ON player_match_ratings(player_id, match_date DESC);

ALTER TABLE player_match_ratings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view player match ratings" ON player_match_ratings
    FOR SELECT USING (true);
  CREATE POLICY "Service role full access player_match_ratings" ON player_match_ratings
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- SECTION C — COLUMN ADDITIONS TO EXISTING TABLES
-- ═══════════════════════════════════════════════════════════════════

-- ── ÖNERİ-8: Oyuncu Serüveni Takibi ─────────────────────────────
ALTER TABLE players ADD COLUMN IF NOT EXISTS matches_played_for_club INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS goals_scored_for_club INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMPTZ;
ALTER TABLE players ADD COLUMN IF NOT EXISTS purchase_price BIGINT DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS purchase_ovr INTEGER;

-- ── ÖNERİ-19: Oyuncu Hoşnutsuzluğu ─────────────────────────────
ALTER TABLE players ADD COLUMN IF NOT EXISTS weeks_not_started INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS dissatisfaction_level TEXT DEFAULT 'none'
  CHECK (dissatisfaction_level IN ('none', 'mild', 'unhappy', 'furious'));
ALTER TABLE players ADD COLUMN IF NOT EXISTS manager_response TEXT;

-- ── ÖNERİ-20: Oyuncu Özgüven Durumu ────────────────────────────
-- NOTE: players.confidence already exists as INTEGER (0-100 stat).
--       We add a separate TEXT column for the categorical status.
ALTER TABLE players ADD COLUMN IF NOT EXISTS confidence_status TEXT DEFAULT 'normal'
  CHECK (confidence_status IN ('low', 'normal', 'high'));
ALTER TABLE players ADD COLUMN IF NOT EXISTS consecutive_good_matches INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS consecutive_bad_matches INTEGER DEFAULT 0;

-- ── ÖNERİ-15: Atmosfer Skoru ────────────────────────────────────
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS atmosphere_score NUMERIC(3,1) DEFAULT 50.0;

-- ── ÖNERİ-23: Push Bildirim Kategorileri ────────────────────────
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS notify_goals BOOLEAN DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS notify_match_result BOOLEAN DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS notify_daily_task BOOLEAN DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS notify_weekly_report BOOLEAN DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS notify_transfer_offer BOOLEAN DEFAULT true;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS notify_agent_message BOOLEAN DEFAULT true;

-- ── ÖNERİ-24: Tema ve Takım Renkleri ────────────────────────────
-- (profiles.primary_color / secondary_color already exist in core schema;
--  IF NOT EXISTS makes this idempotent. Override defaults if absent.)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#FFFFFF';

-- ═══════════════════════════════════════════════════════════════════
-- SECTION D — RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════

-- ── ÖNERİ-6: Günlük görev atama RPC ────────────────────────────
CREATE OR REPLACE FUNCTION assign_daily_tasks(p_user_id TEXT)
RETURNS void AS $$
DECLARE
  v_task_types TEXT[] := ARRAY[
    'win_3_0','list_2_players','train_11_players','promote_youth',
    'read_rival_analysis','play_friendly','scout_player',
    'renew_contract','buy_player','sell_player'
  ];
  v_descriptions JSONB := '{
    "win_3_0":            "Bir maçı 3-0 veya üstü farkla kazan",
    "list_2_players":     "2 oyuncuyu transfer listesine ekle",
    "train_11_players":   "11 oyuncuyla antrenman yap",
    "promote_youth":      "Genç bir oyuncuyu as takıma terfi ettir",
    "read_rival_analysis":"Rakip analizini incele",
    "play_friendly":      "Bir hazırlık maçı oyna",
    "scout_player":       "Bir oyuncuyu keşfet",
    "renew_contract":     "Bir oyuncunun sözleşmesini uzat",
    "buy_player":         "Transfer piyasasından oyuncu satın al",
    "sell_player":        "Bir oyuncuyu sat"
  }';
  v_rewards JSONB := '{
    "win_3_0":            {"type": "money",   "amount": 50000},
    "list_2_players":     {"type": "credits", "amount": 2},
    "train_11_players":   {"type": "money",   "amount": 20000},
    "promote_youth":      {"type": "credits", "amount": 3},
    "read_rival_analysis":{"type": "money",   "amount": 15000},
    "play_friendly":      {"type": "money",   "amount": 25000},
    "scout_player":       {"type": "credits", "amount": 1},
    "renew_contract":     {"type": "money",   "amount": 30000},
    "buy_player":         {"type": "credits", "amount": 2},
    "sell_player":        {"type": "money",   "amount": 40000}
  }';
  v_selected TEXT[];
  v_tt TEXT;
BEGIN
  -- Rastgele 3 görev seç
  SELECT array_agg(tt) INTO v_selected
  FROM (SELECT unnest(v_task_types) AS tt ORDER BY random() LIMIT 3) sub;

  FOREACH v_tt IN ARRAY v_selected LOOP
    INSERT INTO daily_tasks (user_id, task_type, description, reward_type, reward_amount, date)
    VALUES (
      p_user_id,
      v_tt,
      v_descriptions->>v_tt,
      (v_rewards->v_tt->>'type'),
      ((v_rewards->v_tt->>'amount')::INTEGER),
      CURRENT_DATE
    ) ON CONFLICT (user_id, task_type, date) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── ÖNERİ-6: Günlük görev tamamlama RPC ────────────────────────
CREATE OR REPLACE FUNCTION complete_daily_task(p_task_id UUID, p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_task daily_tasks%ROWTYPE;
BEGIN
  SELECT * INTO v_task
  FROM daily_tasks
  WHERE id = p_task_id AND user_id = p_user_id AND is_completed = false;

  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Görev bulunamadı veya zaten tamamlandı"}'::JSONB;
  END IF;

  UPDATE daily_tasks SET is_completed = true WHERE id = p_task_id;

  IF v_task.reward_type = 'money' THEN
    UPDATE profiles SET money = money + v_task.reward_amount WHERE id = p_user_id;
  ELSIF v_task.reward_type = 'credits' THEN
    UPDATE profiles SET credits = COALESCE(credits, 0) + v_task.reward_amount WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reward_type', v_task.reward_type,
    'reward_amount', v_task.reward_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── ÖNERİ-12: Transfer teklifi yap ──────────────────────────────
CREATE OR REPLACE FUNCTION make_transfer_offer(
  p_player_id TEXT,
  p_from_profile_id TEXT,
  p_to_profile_id TEXT,
  p_amount BIGINT
)
RETURNS JSONB AS $$
DECLARE
  v_offer_id UUID;
  v_player_rec RECORD;
BEGIN
  -- Oyuncu kontrolü
  SELECT profile_id, market_value INTO v_player_rec
  FROM players WHERE id = p_player_id;

  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Oyuncu bulunamadı"}'::JSONB;
  END IF;

  -- Kendi oyuncunsa teklif yapma
  IF v_player_rec.profile_id = p_from_profile_id THEN
    RETURN '{"success": false, "error": "Kendi oyuncunuza teklif yapamazsınız"}'::JSONB;
  END IF;

  -- Bakiye kontrolü
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_from_profile_id AND money >= p_amount) THEN
    RETURN '{"success": false, "error": "Yetersiz bakiye"}'::JSONB;
  END IF;

  -- Teklif oluştur
  INSERT INTO transfer_offers (player_id, from_profile_id, to_profile_id, amount, status)
  VALUES (p_player_id, p_from_profile_id, p_to_profile_id, p_amount, 'pending')
  RETURNING id INTO v_offer_id;

  RETURN jsonb_build_object('success', true, 'offer_id', v_offer_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── ÖNERİ-12: Karşı teklif ─────────────────────────────────────
CREATE OR REPLACE FUNCTION counter_transfer_offer(
  p_offer_id UUID,
  p_counter_amount BIGINT,
  p_profile_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_offer transfer_offers%ROWTYPE;
BEGIN
  SELECT * INTO v_offer
  FROM transfer_offers
  WHERE id = p_offer_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Teklif bulunamadı"}'::JSONB;
  END IF;

  UPDATE transfer_offers
  SET counter_amount = p_counter_amount,
      status = 'countered',
      updated_at = now()
  WHERE id = p_offer_id;

  RETURN '{"success": true}'::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── ÖNERİ-12: Teklif kabul ─────────────────────────────────────
CREATE OR REPLACE FUNCTION accept_transfer_offer(p_offer_id UUID, p_profile_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_offer transfer_offers%ROWTYPE;
  v_final_amount BIGINT;
BEGIN
  SELECT * INTO v_offer
  FROM transfer_offers
  WHERE id = p_offer_id AND status IN ('pending', 'countered');

  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Teklif bulunamadı veya süresi dolmuş"}'::JSONB;
  END IF;

  v_final_amount := COALESCE(v_offer.counter_amount, v_offer.amount);

  -- Atomik transfer: para + oyuncu hareketi
  -- Alıcıdan para düş
  UPDATE profiles SET money = money - v_final_amount WHERE id = v_offer.from_profile_id;
  -- Satıcıya para ekle
  UPDATE profiles SET money = money + v_final_amount WHERE id = v_offer.to_profile_id;
  -- Oyuncunun sahibini değiştir, for-sale durumunu kapat
  UPDATE players
  SET profile_id = v_offer.from_profile_id,
      is_for_sale = false,
      market_value = v_final_amount
  WHERE id = v_offer.player_id;

  -- Teklifi kapat
  UPDATE transfer_offers
  SET status = 'accepted', updated_at = now()
  WHERE id = p_offer_id;

  RETURN '{"success": true}'::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── ÖNERİ-12: Teklif reddet ─────────────────────────────────────
CREATE OR REPLACE FUNCTION reject_transfer_offer(p_offer_id UUID, p_profile_id TEXT)
RETURNS JSONB AS $$
BEGIN
  UPDATE transfer_offers
  SET status = 'rejected', updated_at = now()
  WHERE id = p_offer_id
    AND (from_profile_id = p_profile_id OR to_profile_id = p_profile_id);

  RETURN '{"success": true}'::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── ÖNERİ-13: Kiralıkta satın alma opsiyonu kullan ─────────────
CREATE OR REPLACE FUNCTION exercise_buy_option(p_loan_id UUID, p_profile_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_loan RECORD;
BEGIN
  SELECT * INTO v_loan
  FROM loans
  WHERE id = p_loan_id
    AND to_profile_id = p_profile_id
    AND buy_option_price IS NOT NULL;

  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Kiralık kaydı veya satın alma opsiyonu bulunamadı"}'::JSONB;
  END IF;

  IF v_loan.buy_option_deadline IS NOT NULL AND CURRENT_DATE > v_loan.buy_option_deadline THEN
    RETURN '{"success": false, "error": "Satın alma opsiyonu süresi dolmuş"}'::JSONB;
  END IF;

  -- Bakiye kontrolü
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_profile_id AND money >= v_loan.buy_option_price) THEN
    RETURN '{"success": false, "error": "Yetersiz bakiye"}'::JSONB;
  END IF;

  -- Atomik: para transferi + oyuncu sahipliği
  UPDATE profiles SET money = money - v_loan.buy_option_price WHERE id = p_profile_id;
  UPDATE profiles SET money = money + v_loan.buy_option_price WHERE id = v_loan.from_profile_id;
  UPDATE players SET profile_id = p_profile_id WHERE id = v_loan.player_id;

  -- Kira kaydını güncelle
  UPDATE loans SET returned = true, returned_at = now() WHERE id = p_loan_id;

  RETURN '{"success": true}'::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── ÖNERİ-18: Mentor atama ──────────────────────────────────────
CREATE OR REPLACE FUNCTION assign_mentor(
  p_mentor_id TEXT,
  p_mentee_id TEXT,
  p_profile_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_mentor_age INTEGER;
  v_mentee_age INTEGER;
  v_mentor_leadership INTEGER;
  v_bonus_rate NUMERIC(3,2);
BEGIN
  SELECT age, leadership INTO v_mentor_age, v_mentor_leadership
  FROM players
  WHERE id = p_mentor_id AND profile_id = p_profile_id;

  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Mentor bulunamadı"}'::JSONB;
  END IF;

  SELECT age INTO v_mentee_age
  FROM players
  WHERE id = p_mentee_id AND profile_id = p_profile_id;

  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Mentee bulunamadı"}'::JSONB;
  END IF;

  IF v_mentor_age < 33 THEN
    RETURN '{"success": false, "error": "Mentor 33 yaş veya üstü olmalı"}'::JSONB;
  END IF;

  IF v_mentee_age > 21 THEN
    RETURN '{"success": false, "error": "Mentee 21 yaş veya altı olmalı"}'::JSONB;
  END IF;

  -- Liderlik puanına göre bonus hesapla (0.20 – 0.30 arası)
  v_bonus_rate := 0.20 + (COALESCE(v_mentor_leadership, 10) / 100.0);

  INSERT INTO player_mentors (mentor_id, mentee_id, profile_id, bonus_rate)
  VALUES (p_mentor_id, p_mentee_id, p_profile_id, v_bonus_rate)
  ON CONFLICT (mentee_id) DO UPDATE
    SET mentor_id = p_mentor_id, bonus_rate = v_bonus_rate;

  RETURN jsonb_build_object('success', true, 'bonus_rate', v_bonus_rate);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════
