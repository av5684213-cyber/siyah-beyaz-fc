-- ═══════════════════════════════════════════════════════════════
-- SİYAH BEYAZ FC - TAM MİGRASYON (2026-05-18)
-- Tüm GÖREV 1-7 veritabanı değişiklikleri
-- Supabase SQL Editor'de çalıştırın
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- GÖREV 2: POZİSYON SİSTEMİ
-- ═══════════════════════════════════════════════════════════════

-- positions referans tablosu
CREATE TABLE IF NOT EXISTS positions (
  code TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  position_group TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  pitch_zone TEXT
);

-- Pozisyon verileri
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

-- player_positions ilişki tablosu
CREATE TABLE IF NOT EXISTS player_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  position_code TEXT NOT NULL REFERENCES positions(code),
  is_primary BOOLEAN NOT NULL DEFAULT true,
  proficiency INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, position_code)
);

CREATE INDEX IF NOT EXISTS idx_player_positions_player ON player_positions(player_id);
CREATE INDEX IF NOT EXISTS idx_player_positions_position ON player_positions(position_code);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "positions_select_all" ON positions FOR SELECT USING (true);
CREATE POLICY "pp_select_all" ON player_positions FOR SELECT USING (true);
CREATE POLICY "pp_insert_all" ON player_positions FOR INSERT WITH CHECK (true);
CREATE POLICY "pp_update_all" ON player_positions FOR UPDATE USING (true);
CREATE POLICY "pp_delete_all" ON player_positions FOR DELETE USING (true);

-- Primary positions doldur
INSERT INTO player_positions (player_id, position_code, is_primary, proficiency)
SELECT id, specific_position, true, 100
FROM players
WHERE specific_position IS NOT NULL
ON CONFLICT (player_id, position_code) DO NOTHING;

-- Secondary positions doldur
INSERT INTO player_positions (player_id, position_code, is_primary, proficiency)
SELECT p.id, unnest_sp, false, 70
FROM players p,
     LATERAL unnest(p.secondary_positions) AS unnest_sp
WHERE p.secondary_positions IS NOT NULL 
  AND array_length(p.secondary_positions, 1) > 0
ON CONFLICT (player_id, position_code) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- GÖREV 3: KİRALAMA SİSTEMİ
-- ═══════════════════════════════════════════════════════════════

-- players tablosuna kiralama kolonları ekle
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_on_loan_market BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_fee INT DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_status TEXT DEFAULT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loaned_to_profile_id TEXT DEFAULT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_owner_profile_id TEXT DEFAULT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_end_date DATE DEFAULT NULL;

-- loans tablosu
CREATE TABLE IF NOT EXISTS loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  owner_team_id TEXT NOT NULL,
  loaned_to_team_id TEXT,
  start_date TIMESTAMPTZ,
  end_date DATE,
  loan_fee_paid INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'listed',
  created_at TIMESTAMPTZ DEFAULT now(),
  recalled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_loans_player ON loans(player_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_owner ON loans(owner_team_id);
CREATE INDEX IF NOT EXISTS idx_loans_loaned_to ON loans(loaned_to_team_id);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loans_select_all" ON loans FOR SELECT USING (true);
CREATE POLICY "loans_insert_all" ON loans FOR INSERT WITH CHECK (true);
CREATE POLICY "loans_update_all" ON loans FOR UPDATE USING (true);
CREATE POLICY "loans_delete_all" ON loans FOR DELETE USING (true);


-- ═══════════════════════════════════════════════════════════════
-- GÖREV 5: SPONSORLUK SİSTEMİ
-- ═══════════════════════════════════════════════════════════════

-- sponsors referans tablosu (şablon sponsor havuzu)
CREATE TABLE IF NOT EXISTS sponsors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier INT NOT NULL DEFAULT 1,
  base_offer_credits INT NOT NULL DEFAULT 5,
  logo TEXT DEFAULT '',
  category TEXT DEFAULT 'general'
);

INSERT INTO sponsors (id, name, tier, base_offer_credits, logo, category) VALUES
('s1',  'Yerel Market Zinciri',      1, 5,  '🏪', 'retail'),
('s2',  'Bölgesel İnternet Servisi', 1, 8,  '🌐', 'tech'),
('s3',  'Semt Kırtasiye',            1, 4,  '📝', 'retail'),
('s4',  'Yerel Kafe Zinciri',        1, 6,  '☕', 'food'),
('s5',  'Mahalle Temizlik',          1, 5,  '🧹', 'services'),
('s6',  'Ulusal Elektronik Marka',   2, 20, '📱', 'tech'),
('s7',  'Spor Giyim Zinciri',        2, 25, '👟', 'sportswear'),
('s8',  'Otomotiv Grubu',            2, 22, '🚗', 'automotive'),
('s9',  'Gıda ve İçecek Holding',    2, 18, '🍔', 'food'),
('s10', 'Sigorta Şirketi',           2, 20, '🛡️', 'finance'),
('s11', 'Global Havayolu',           3, 50, '✈️', 'travel'),
('s12', 'Uluslararası Teknoloji Devi', 3, 60, '💻', 'tech'),
('s13', 'Dünya Bankası Partner',     3, 55, '🏦', 'finance'),
('s14', 'Lüks Otomobil Markası',     3, 45, '🏎️', 'automotive')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tier = EXCLUDED.tier,
  base_offer_credits = EXCLUDED.base_offer_credits,
  logo = EXCLUDED.logo,
  category = EXCLUDED.category;

-- team_sponsorships: takımların aktif sponsorluk anlaşmaları
CREATE TABLE IF NOT EXISTS team_sponsorships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sponsor_id TEXT NOT NULL REFERENCES sponsors(id),
  weekly_income INT NOT NULL DEFAULT 0,
  contracted_rounds INT NOT NULL DEFAULT 10,
  remaining_rounds INT NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'active',
  signed_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(profile_id, sponsor_id, status)
);

CREATE INDEX IF NOT EXISTS idx_team_sponsorships_profile ON team_sponsorships(profile_id);
CREATE INDEX IF NOT EXISTS idx_team_sponsorships_status ON team_sponsorships(status);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sponsors_select_all" ON sponsors FOR SELECT USING (true);
CREATE POLICY "team_sponsorships_select_all" ON team_sponsorships FOR SELECT USING (true);
CREATE POLICY "team_sponsorships_insert_all" ON team_sponsorships FOR INSERT WITH CHECK (true);
CREATE POLICY "team_sponsorships_update_all" ON team_sponsorships FOR UPDATE USING (true);
CREATE POLICY "team_sponsorships_delete_all" ON team_sponsorships FOR DELETE USING (true);


-- ═══════════════════════════════════════════════════════════════
-- GÖREV 6: TV YAYINI GELİRİ
-- ═══════════════════════════════════════════════════════════════

-- profiles tablosuna TV geliri kolonu ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tv_revenue_weekly INT DEFAULT 0;

-- Mevcut takımların lig seviyesine göre TV geliri ata
-- Lig 1 (tier 1): 20 kredi/hafta, Lig 2 (tier 2): 10 kredi/hafta
UPDATE profiles SET tv_revenue_weekly = 
  CASE 
    WHEN league_name LIKE '%Lig 1%' OR league_name LIKE '%1. Lig%' THEN 20
    WHEN league_name LIKE '%Lig 2%' OR league_name LIKE '%2. Lig%' THEN 10
    ELSE 0
  END
WHERE tv_revenue_weekly = 0 OR tv_revenue_weekly IS NULL;


-- ═══════════════════════════════════════════════════════════════
-- GÖREV 4: SERBEST OYUNCULAR (free_agents sayfası zaten mevcut)
-- ═══════════════════════════════════════════════════════════════

-- free_agents için gerekli players kolonları zaten mevcut
-- Sadece is_free_agent flag ekle (eğer yoksa)
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_free_agent BOOLEAN DEFAULT false;

-- profile_id NULL olan oyuncuları serbest olarak işaretle
UPDATE players SET is_free_agent = true WHERE profile_id IS NULL;


-- ═══════════════════════════════════════════════════════════════
-- EK: CRON TABANLI HAFTALIK GELİRLER (Sponsorluk + TV)
-- ═══════════════════════════════════════════════════════════════

-- Haftalık gelir hesaplama RPC fonksiyonu
CREATE OR REPLACE FUNCTION calculate_weekly_income(p_profile_id TEXT)
RETURNS TABLE(
  source TEXT,
  amount INT
) AS $$
BEGIN
  -- Sponsorluk geliri
  RETURN QUERY
  SELECT 'sponsorship'::TEXT, COALESCE(SUM(ts.weekly_income), 0)::INT
  FROM team_sponsorships ts
  WHERE ts.profile_id = p_profile_id AND ts.status = 'active';
  
  -- TV yayını geliri
  RETURN QUERY
  SELECT 'tv_broadcast'::TEXT, COALESCE(tv_revenue_weekly, 0)::INT
  FROM profiles
  WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Sezon sonu kiralama dönüşü RPC fonksiyonu
CREATE OR REPLACE FUNCTION return_all_loans()
RETURNS INT AS $$
DECLARE
  returned_count INT;
BEGIN
  -- Aktif kiraları sonlandır
  UPDATE players 
  SET loan_status = 'returned',
      loaned_to_profile_id = NULL,
      loan_end_date = NULL,
      is_on_loan_market = false
  WHERE loan_status = 'active'
  RETURNING * INTO returned_count;
  
  -- loans tablosunu güncelle
  UPDATE loans 
  SET status = 'completed'
  WHERE status = 'active';
  
  RETURN returned_count;
END;
$$ LANGUAGE plpgsql;

-- Sponsorluk tur azaltma RPC fonksiyonu (her lig turu sonunda çağrılır)
CREATE OR REPLACE FUNCTION decrement_sponsorship_rounds()
RETURNS INT AS $$
DECLARE
  expired_count INT;
BEGIN
  -- Kalan turları azalt
  UPDATE team_sponsorships
  SET remaining_rounds = remaining_rounds - 1
  WHERE status = 'active';
  
  -- Süresi dolanları pasif yap
  UPDATE team_sponsorships
  SET status = 'expired'
  WHERE remaining_rounds <= 0 AND status = 'active';
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;
