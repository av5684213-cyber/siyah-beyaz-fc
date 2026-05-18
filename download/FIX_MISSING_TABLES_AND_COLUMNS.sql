-- ═══════════════════════════════════════════════════════════════════
-- FIX: All Missing Tables and Columns for Siyah Beyaz FC
-- Date: 2026-05-19
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- 1. STAFF TYPES TABLE (Reference data)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS staff_types (
  type TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  max_count INT NOT NULL,
  base_salary INT NOT NULL DEFAULT 0
);

INSERT INTO staff_types (type, name_tr, max_count, base_salary) VALUES
('scout', 'Gözlemci', 3, 50),
('coach', 'Yardımcı Antrenör', 3, 40),
('physio', 'Fizyoterapist', 3, 45),
('youth_coordinator', 'Gençlik Koordinatörü', 2, 60),
('sporting_director', 'Sportif Direktör', 1, 80),
('analyst', 'Maç Analisti', 2, 30)
ON CONFLICT (type) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  max_count = EXCLUDED.max_count,
  base_salary = EXCLUDED.base_salary;

-- ═══════════════════════════════════════════════════════════════════
-- 2. STAFF TABLE (User's hired personnel)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL REFERENCES staff_types(type),
  stars INT NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 5),
  name TEXT NOT NULL,
  contract_start_week INT NOT NULL DEFAULT 1,
  contract_end_week INT NOT NULL DEFAULT 34,
  total_cost INT NOT NULL DEFAULT 0,
  hired_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_type ON staff(user_id, type);

-- RLS for staff table
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "staff_select" ON staff FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "staff_insert" ON staff FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "staff_delete" ON staff FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "staff_update" ON staff FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 3. MISSING COLUMNS ON PLAYERS TABLE (Loan system)
-- ═══════════════════════════════════════════════════════════════════
DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS is_on_loan_market BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_fee INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_owner_profile_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_status TEXT DEFAULT 'none';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_end_date TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS loaned_to_profile_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS personality TEXT DEFAULT 'normal';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS specific_position TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS cond INT DEFAULT 100;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS form INT DEFAULT 50;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS morale INT DEFAULT 70;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 4. FACILITY UPGRADE COSTS TABLE
-- ═══════════════════════════════════════════════════════════════════
-- Drop existing table (wrong schema) and recreate with correct columns
-- Kodun beklediği sütunlar: target_level, credits_cost, upgrade_days, instant_half_credits
DROP TABLE IF EXISTS facility_upgrade_costs CASCADE;

CREATE TABLE facility_upgrade_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_type TEXT NOT NULL,
  target_level INT NOT NULL,
  credits_cost INT NOT NULL,
  upgrade_days INT NOT NULL DEFAULT 2,
  instant_half_credits INT DEFAULT 5
);

CREATE INDEX idx_facility_upgrade_costs_type_level
  ON facility_upgrade_costs(facility_type, target_level);

ALTER TABLE facility_upgrade_costs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY facility_costs_select ON facility_upgrade_costs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed facility upgrade costs (Kredi cinsinden)
-- stadiumMatrix.ts'deki 10 tesis türü: capacity, lighting, scoreboards, heating, vip, store, pitch, media, academy, medical
-- Seviye 1-10 arası, upgrade route max 5 ile sınırlandırıyor ama veri hazır olsun
INSERT INTO facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days, instant_half_credits) VALUES
-- Seyirci Hacmi (Kapasite)
('capacity', 1, 50, 1, 5),
('capacity', 2, 100, 2, 8),
('capacity', 3, 200, 3, 12),
('capacity', 4, 400, 5, 20),
('capacity', 5, 800, 7, 35),
('capacity', 6, 1600, 10, 50),
('capacity', 7, 3200, 13, 70),
('capacity', 8, 6400, 16, 100),
('capacity', 9, 12800, 20, 140),
('capacity', 10, 25600, 25, 200),
-- Optik Aydınlatma
('lighting', 1, 40, 1, 5),
('lighting', 2, 80, 2, 8),
('lighting', 3, 160, 3, 12),
('lighting', 4, 320, 5, 20),
('lighting', 5, 640, 7, 35),
('lighting', 6, 1280, 10, 50),
('lighting', 7, 2560, 13, 70),
('lighting', 8, 5120, 16, 100),
('lighting', 9, 10240, 20, 140),
('lighting', 10, 20480, 25, 200),
-- Veri Panoları (Skor Tabelası)
('scoreboards', 1, 35, 1, 5),
('scoreboards', 2, 70, 2, 8),
('scoreboards', 3, 140, 3, 12),
('scoreboards', 4, 280, 5, 20),
('scoreboards', 5, 560, 7, 35),
('scoreboards', 6, 1120, 10, 50),
('scoreboards', 7, 2240, 13, 70),
('scoreboards', 8, 4480, 16, 100),
('scoreboards', 9, 8960, 20, 140),
('scoreboards', 10, 17920, 25, 200),
-- İklim Kalkanı (Isıtma)
('heating', 1, 30, 1, 5),
('heating', 2, 60, 2, 8),
('heating', 3, 120, 3, 12),
('heating', 4, 240, 5, 20),
('heating', 5, 480, 7, 35),
('heating', 6, 960, 10, 50),
('heating', 7, 1920, 13, 70),
('heating', 8, 3840, 16, 100),
('heating', 9, 7680, 20, 140),
('heating', 10, 15360, 25, 200),
-- VIP Localar
('vip', 1, 60, 1, 5),
('vip', 2, 120, 2, 8),
('vip', 3, 240, 3, 12),
('vip', 4, 480, 5, 20),
('vip', 5, 960, 7, 35),
('vip', 6, 1920, 10, 50),
('vip', 7, 3840, 13, 70),
('vip', 8, 7680, 16, 100),
('vip', 9, 15360, 20, 140),
('vip', 10, 30720, 25, 200),
-- Merchandising (Mağaza)
('store', 1, 25, 1, 5),
('store', 2, 50, 2, 8),
('store', 3, 100, 3, 12),
('store', 4, 200, 5, 20),
('store', 5, 400, 7, 35),
('store', 6, 800, 10, 50),
('store', 7, 1600, 13, 70),
('store', 8, 3200, 16, 100),
('store', 9, 6400, 20, 140),
('store', 10, 12800, 25, 200),
-- Hibrit Çim (Saha)
('pitch', 1, 40, 1, 5),
('pitch', 2, 80, 2, 8),
('pitch', 3, 160, 3, 12),
('pitch', 4, 320, 5, 20),
('pitch', 5, 640, 7, 35),
('pitch', 6, 1280, 10, 50),
('pitch', 7, 2560, 13, 70),
('pitch', 8, 5120, 16, 100),
('pitch', 9, 10240, 20, 140),
('pitch', 10, 20480, 25, 200),
-- Basın ve Multimedya
('media', 1, 45, 1, 5),
('media', 2, 90, 2, 8),
('media', 3, 180, 3, 12),
('media', 4, 360, 5, 20),
('media', 5, 720, 7, 35),
('media', 6, 1440, 10, 50),
('media', 7, 2880, 13, 70),
('media', 8, 5760, 16, 100),
('media', 9, 11520, 20, 140),
('media', 10, 23040, 25, 200),
-- Akademi Konutları
('academy', 1, 55, 1, 5),
('academy', 2, 110, 2, 8),
('academy', 3, 220, 3, 12),
('academy', 4, 440, 5, 20),
('academy', 5, 880, 7, 35),
('academy', 6, 1760, 10, 50),
('academy', 7, 3520, 13, 70),
('academy', 8, 7040, 16, 100),
('academy', 9, 14080, 20, 140),
('academy', 10, 28160, 25, 200),
-- Sağlık ve Rejenerasyon
('medical', 1, 30, 1, 5),
('medical', 2, 60, 2, 8),
('medical', 3, 120, 3, 12),
('medical', 4, 240, 5, 20),
('medical', 5, 480, 7, 35),
('medical', 6, 960, 10, 50),
('medical', 7, 1920, 13, 70),
('medical', 8, 3840, 16, 100),
('medical', 9, 7680, 20, 140),
('medical', 10, 15360, 25, 200)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 5. MISSING COLUMNS ON PROFILES TABLE
-- ═══════════════════════════════════════════════════════════════════
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INT DEFAULT 250;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scout_slots INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_coaches INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_physios INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_type TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_finish_day INT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_speedup BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_started_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_upgrade_end_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stadium_upgrades JSONB DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academy_level INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'TR';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS philosophy TEXT DEFAULT 'balanced';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#ffffff';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#000000';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation INT DEFAULT 30;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 6. MISSING COLUMNS ON LEAGUE_TEAMS TABLE
-- ═══════════════════════════════════════════════════════════════════
DO $$ BEGIN
  ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS profile_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS is_npc BOOLEAN DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS strength INT DEFAULT 50;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS color TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 7. USER_FACILITIES TABLE (if not exists)
-- Upgrade route beklediği sütunlar: upgrade_started_at, upgrade_end_at, speed_up_used
-- ═══════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS user_facilities CASCADE;

CREATE TABLE user_facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT NOT NULL,
  facility_type TEXT NOT NULL,
  current_level INT NOT NULL DEFAULT 0,
  upgrade_started_at TIMESTAMPTZ,
  upgrade_end_at TIMESTAMPTZ,
  speed_up_used BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, facility_type)
);

CREATE INDEX idx_user_facilities_profile
  ON user_facilities(profile_id);

ALTER TABLE user_facilities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY user_facilities_select ON user_facilities FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY user_facilities_insert ON user_facilities FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY user_facilities_update ON user_facilities FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY user_facilities_delete ON user_facilities FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 8. POSITIONS TABLE
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS positions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_tr TEXT,
  category TEXT NOT NULL,
  category_tr TEXT
);

INSERT INTO positions (id, name, name_tr, category, category_tr) VALUES
('GK', 'Goalkeeper', 'Kaleci', 'GK', 'Kaleci'),
('CB', 'Center Back', 'Stoper', 'DEF', 'Defans'),
('LB', 'Left Back', 'Sol Bek', 'DEF', 'Defans'),
('RB', 'Right Back', 'Sağ Bek', 'DEF', 'Defans'),
('LWB', 'Left Wing Back', 'Sol Kanat Bek', 'DEF', 'Defans'),
('RWB', 'Right Wing Back', 'Sağ Kanat Bek', 'DEF', 'Defans'),
('CDM', 'Central Defensive Mid', 'Defansif Orta Saha', 'MID', 'Orta Saha'),
('CM', 'Central Midfielder', 'Orta Saha', 'MID', 'Orta Saha'),
('CAM', 'Central Attacking Mid', 'Ofansif Orta Saha', 'MID', 'Orta Saha'),
('LM', 'Left Midfielder', 'Sol Orta Saha', 'MID', 'Orta Saha'),
('RM', 'Right Midfielder', 'Sağ Orta Saha', 'MID', 'Orta Saha'),
('LW', 'Left Winger', 'Sol Kanat', 'MID', 'Orta Saha'),
('RW', 'Right Winger', 'Sağ Kanat', 'MID', 'Orta Saha'),
('CF', 'Center Forward', 'Santrafor', 'FWD', 'Forvet'),
('ST', 'Striker', 'Golcü', 'FWD', 'Forvet')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_tr = EXCLUDED.name_tr,
  category = EXCLUDED.category,
  category_tr = EXCLUDED.category_tr;

-- ═══════════════════════════════════════════════════════════════════
-- 9. LOANS TABLE
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL,
  from_profile_id TEXT NOT NULL,
  to_profile_id TEXT NOT NULL,
  loan_fee INT DEFAULT 0,
  duration_weeks INT DEFAULT 17,
  start_week INT NOT NULL,
  end_week INT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'returned', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_from ON loans(from_profile_id);
CREATE INDEX IF NOT EXISTS idx_loans_to ON loans(to_profile_id);
CREATE INDEX IF NOT EXISTS idx_loans_player ON loans(player_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- ═══════════════════════════════════════════════════════════════════
-- 10. PLAYER_ACHIEVEMENTS TABLE
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  season TEXT,
  details JSONB DEFAULT '{}',
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_achievements_player
  ON player_achievements(player_id);

-- ═══════════════════════════════════════════════════════════════════
-- 11. MANAGER CONVERSATIONS (Rival Messaging)
-- ═══════════════════════════════════════════════════════════════════
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

CREATE INDEX IF NOT EXISTS idx_conv_p1 ON manager_conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conv_p2 ON manager_conversations(participant_2);

ALTER TABLE manager_conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY conv_select ON manager_conversations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY conv_insert ON manager_conversations FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY conv_update ON manager_conversations FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY conv_delete ON manager_conversations FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 12. MANAGER MESSAGES
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS manager_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msg_conv ON manager_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_msg_sender ON manager_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_unread ON manager_messages(conversation_id, is_read) WHERE is_read = FALSE;

ALTER TABLE manager_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY msg_select ON manager_messages FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY msg_insert ON manager_messages FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY msg_update ON manager_messages FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY msg_delete ON manager_messages FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 13. MANAGER PRESENCE (online status)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS manager_presence (
  profile_id TEXT PRIMARY KEY,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  status_text TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_presence_online ON manager_presence(is_online) WHERE is_online = TRUE;

ALTER TABLE manager_presence ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY presence_select ON manager_presence FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY presence_insert ON manager_presence FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY presence_update ON manager_presence FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 14. REALTIME PUBLICATIONS
-- ═══════════════════════════════════════════════════════════════════
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE manager_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE manager_conversations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE manager_presence;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE manager_messages REPLICA IDENTITY FULL;
ALTER TABLE manager_conversations REPLICA IDENTITY FULL;
ALTER TABLE manager_presence REPLICA IDENTITY FULL;

-- ═══════════════════════════════════════════════════════════════════
-- DONE — All missing tables and columns created
-- ═══════════════════════════════════════════════════════════════════
