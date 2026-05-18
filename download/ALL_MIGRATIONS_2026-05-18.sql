-- ═══════════════════════════════════════════════════════════════════════
-- SİYAH BEYAZ FC - GÜNCEL SQL MİGRASYONLARI
-- Tarih: 2026-05-18
-- GÖREV 1-7 arası tüm veritabanı değişiklikleri
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- GÖREV 1: MGCOİN → KREDİ GEÇİŞİ
-- ─────────────────────────────────────────────────────────────────────

-- 1a: mg_coins verilerini credits'e taşı (sadece credits NULL veya 0 ise)
UPDATE profiles 
SET credits = COALESCE(credits, 0) + COALESCE(mg_coins, 0) 
WHERE credits IS NULL OR (credits = 0 AND mg_coins > 0);

-- 1b: mg_coins sütununu kaldır
ALTER TABLE profiles DROP COLUMN IF EXISTS mg_coins;

-- ─────────────────────────────────────────────────────────────────────
-- GÖREV 2: MEVKİ SİSTEMİ (POSITIONS + PLAYER_POSITIONS)
-- ─────────────────────────────────────────────────────────────────────

-- 2a: Mevki tanımları tablosu
CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,  -- GK, CB, LB, CDM, ST vb.
  name_tr VARCHAR(50) UNIQUE NOT NULL,  -- "Kaleci", "Sol Bek" vb.
  name_en VARCHAR(50),
  category VARCHAR(20) NOT NULL,  -- GK, DEF, MID, FWD
  short_tr VARCHAR(10)  -- "KL", "SolB", "DOS" vb.
);

-- 2b: Mevki verilerini ekle
INSERT INTO positions (code, name_tr, name_en, category, short_tr) VALUES
  ('GK', 'Kaleci', 'Goalkeeper', 'GK', 'KL'),
  ('CB', 'Stoper', 'Center Back', 'DEF', 'STP'),
  ('LB', 'Sol Bek', 'Left Back', 'DEF', 'SolB'),
  ('RB', 'Sağ Bek', 'Right Back', 'DEF', 'SağB'),
  ('LWB', 'Sol Kanat Bek', 'Left Wing Back', 'DEF', 'SolK'),
  ('RWB', 'Sağ Kanat Bek', 'Right Wing Back', 'DEF', 'SağK'),
  ('CDM', 'Defansif Orta Saha', 'Defensive Midfielder', 'MID', 'DOS'),
  ('CM', 'Merkez Orta Saha', 'Central Midfielder', 'MID', 'MOS'),
  ('CAM', 'Ofansif Orta Saha', 'Attacking Midfielder', 'MID', 'OOS'),
  ('LM', 'Sol Açık', 'Left Midfielder', 'MID', 'SolA'),
  ('RM', 'Sağ Açık', 'Right Midfielder', 'MID', 'SağA'),
  ('LW', 'Sol Kanat', 'Left Winger', 'MID', 'SolA'),
  ('RW', 'Sağ Kanat', 'Right Winger', 'MID', 'SağA'),
  ('ST', 'Forvet', 'Striker', 'FWD', 'SNT'),
  ('CF', 'İkinci Forvet', 'Second Striker', 'FWD', '2.FV')
ON CONFLICT (code) DO NOTHING;

-- 2c: Oyuncu-mevki ilişki tablosu (çift mevki desteği)
CREATE TABLE IF NOT EXISTS player_positions (
  id SERIAL PRIMARY KEY,
  player_id VARCHAR(50) REFERENCES players(id) ON DELETE CASCADE,
  position_id INT REFERENCES positions(id),
  is_primary BOOLEAN DEFAULT false,
  proficiency INT DEFAULT 100  -- 100 asıl mevki, 60-80 ikincil
);

-- 2d: Tekil index (oyuncu başına aynı mevki tekrar olmamalı)
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_positions_unique 
  ON player_positions(player_id, position_id);

-- 2e: RLS
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN 
  CREATE POLICY positions_select ON positions FOR SELECT USING (true); 
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

ALTER TABLE player_positions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN 
  CREATE POLICY player_positions_select ON player_positions FOR SELECT USING (true); 
  CREATE POLICY player_positions_insert ON player_positions FOR INSERT WITH CHECK (true);
  CREATE POLICY player_positions_update ON player_positions FOR UPDATE USING (true);
  CREATE POLICY player_positions_delete ON player_positions FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

-- ─────────────────────────────────────────────────────────────────────
-- GÖREV 3: KİRALIK SİSTEMİ
-- ─────────────────────────────────────────────────────────────────────

-- 3a: players tablosuna kiralık sütunları ekle
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_on_loan_market BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_fee INT DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loaned_to_profile_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_owner_profile_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_status TEXT;  -- 'active', 'returned', 'returned_early'
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_end_date TEXT;

-- 3b: loans tablosu
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  player_id VARCHAR(50) REFERENCES players(id) ON DELETE CASCADE,
  owner_team_id TEXT NOT NULL,
  loaned_to_team_id TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  loan_fee_paid INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'listed',  -- listed, active, returned, returned_early
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3c: Indexler
CREATE INDEX IF NOT EXISTS idx_loans_player ON loans(player_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_owner ON loans(owner_team_id);
CREATE INDEX IF NOT EXISTS idx_players_loan_market ON players(is_on_loan_market) WHERE is_on_loan_market = true;
CREATE INDEX IF NOT EXISTS idx_players_loan_status ON players(loan_status) WHERE loan_status IS NOT NULL;

-- 3d: RLS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN 
  CREATE POLICY loans_select ON loans FOR SELECT USING (true);
  CREATE POLICY loans_insert ON loans FOR INSERT WITH CHECK (true);
  CREATE POLICY loans_update ON loans FOR UPDATE USING (true);
  CREATE POLICY loans_delete ON loans FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

-- ─────────────────────────────────────────────────────────────────────
-- GÖREV 5: SPONSORLUK SİSTEMİ
-- ─────────────────────────────────────────────────────────────────────

-- 5a: sponsors tablosu (referans)
CREATE TABLE IF NOT EXISTS sponsors (
  id VARCHAR(10) PRIMARY KEY,  -- s1, s2, ... s14
  name VARCHAR(100) NOT NULL,
  tier INT NOT NULL,  -- 1: küçük, 2: orta, 3: büyük
  base_offer_credits INT NOT NULL,
  logo VARCHAR(10)  -- emoji
);

-- 5b: Sponsor verileri
INSERT INTO sponsors (id, name, tier, base_offer_credits, logo) VALUES
  ('s1', 'Yerel Market Zinciri', 1, 5, '🏪'),
  ('s2', 'Bölgesel İnternet Servisi', 1, 8, '🌐'),
  ('s3', 'Semt Kırtasiye', 1, 4, '📝'),
  ('s4', 'Yerel Kafe Zinciri', 1, 6, '☕'),
  ('s5', 'Mahalle Temizlik', 1, 5, '🧹'),
  ('s6', 'Ulusal Elektronik Marka', 2, 20, '📱'),
  ('s7', 'Spor Giyim Zinciri', 2, 25, '👟'),
  ('s8', 'Otomotiv Grubu', 2, 22, '🚗'),
  ('s9', 'Gıda ve İçecek Holding', 2, 18, '🍔'),
  ('s10', 'Sigorta Şirketi', 2, 20, '🛡️'),
  ('s11', 'Global Havayolu', 3, 50, '✈️'),
  ('s12', 'Uluslararası Teknoloji Devi', 3, 60, '💻'),
  ('s13', 'Dünya Bankası Partner', 3, 55, '🏦'),
  ('s14', 'Lüks Otomobil Markası', 3, 45, '🏎️')
ON CONFLICT (id) DO NOTHING;

-- 5c: Takım sponsorlukları tablosu
CREATE TABLE IF NOT EXISTS team_sponsorships (
  id SERIAL PRIMARY KEY,
  team_id TEXT NOT NULL,
  sponsor_id VARCHAR(10) REFERENCES sponsors(id),
  sponsor_name VARCHAR(100),
  sponsor_tier INT,
  sponsor_logo VARCHAR(10),
  signed_week INT,
  duration_weeks INT,
  weekly_income INT NOT NULL,
  total_income INT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',  -- active, expired, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5d: Indexler
CREATE INDEX IF NOT EXISTS idx_team_sponsorships_team ON team_sponsorships(team_id);
CREATE INDEX IF NOT EXISTS idx_team_sponsorships_status ON team_sponsorships(status);

-- 5e: RLS
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN 
  CREATE POLICY sponsors_select ON sponsors FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

ALTER TABLE team_sponsorships ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN 
  CREATE POLICY team_sponsorships_select ON team_sponsorships FOR SELECT USING (true);
  CREATE POLICY team_sponsorships_insert ON team_sponsorships FOR INSERT WITH CHECK (true);
  CREATE POLICY team_sponsorships_update ON team_sponsorships FOR UPDATE USING (true);
  CREATE POLICY team_sponsorships_delete ON team_sponsorships FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

-- ─────────────────────────────────────────────────────────────────────
-- GÖREV 6: TELEVİZYON YAYIN GELİRİ
-- ─────────────────────────────────────────────────────────────────────

-- 6a: Yayın geliri yapılandırma tablosu
CREATE TABLE IF NOT EXISTS broadcast_revenue_config (
  id SERIAL PRIMARY KEY,
  league_tier INT NOT NULL,  -- 1: Üst lig, 2: Alt lig
  league_name VARCHAR(50),
  weekly_credits INT NOT NULL,  -- Haftalık yayın geliri (kredi)
  description TEXT
);

-- 6b: Varsayılan yayın geliri verileri
INSERT INTO broadcast_revenue_config (league_tier, league_name, weekly_credits, description) VALUES
  (1, 'Lig 1', 20, 'Üst lig takımları için haftalık 20 kredi yayın geliri'),
  (2, 'Lig 2', 10, 'Alt lig takımları için haftalık 10 kredi yayın geliri')
ON CONFLICT DO NOTHING;

-- 6c: Takım yayın geliri kayıtları
CREATE TABLE IF NOT EXISTS team_broadcast_revenue (
  id SERIAL PRIMARY KEY,
  team_id TEXT NOT NULL,
  league_tier INT NOT NULL,
  weekly_credits INT NOT NULL,
  total_earned INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6d: Index ve RLS
CREATE INDEX IF NOT EXISTS idx_team_broadcast_team ON team_broadcast_revenue(team_id);

ALTER TABLE broadcast_revenue_config ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN 
  CREATE POLICY broadcast_config_select ON broadcast_revenue_config FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

ALTER TABLE team_broadcast_revenue ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN 
  CREATE POLICY team_broadcast_select ON team_broadcast_revenue FOR SELECT USING (true);
  CREATE POLICY team_broadcast_insert ON team_broadcast_revenue FOR INSERT WITH CHECK (true);
  CREATE POLICY team_broadcast_update ON team_broadcast_revenue FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- SON: Tüm migration'lar tamamlandı
-- ═══════════════════════════════════════════════════════════════════════
