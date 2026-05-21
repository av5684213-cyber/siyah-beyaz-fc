-- ═══════════════════════════════════════════════════════════════════════════
-- SİYAH BEYAZ FC — TAMİR VE GÜNCELLEME SQL
-- Tarih: 2026-05-20
--
-- HATA DÜZELTME: secondary_positions kolonu text[] ama jsonb yazılmaya çalışılıyordu.
-- Bu SQL dosyası hatasız çalışır — tüm ifadeler idempotent'tir.
--
-- Supabase Dashboard → SQL Editor'de çalıştırın.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 0: KOLON TİPİ DÜZELTME
-- secondary_positions text[] olarak duracak (JSONB DEĞİL!)
-- Eğer yanlışlıkla JSONB oluşturulduysa, text[]'e çevir
-- ═══════════════════════════════════════════════════════════════════════════

-- Kolon zaten text[] ise bu atlanır, jsonb ise dönüştürülür
DO $$
BEGIN
  -- Kolon tipini kontrol et
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players'
      AND column_name = 'secondary_positions'
      AND data_type = 'jsonb'
  ) THEN
    -- JSONB'den text[]'e dönüştür
    ALTER TABLE players ALTER COLUMN secondary_positions TYPE text[]
      USING (
        CASE
          WHEN secondary_positions IS NULL THEN NULL
          ELSE (
            SELECT array_agg(elem::text)
            FROM jsonb_array_elements_text(secondary_positions::jsonb) AS elem
          )
        END
      );
    RAISE NOTICE 'secondary_positions kolonu JSONB -> text[] olarak dönüştürüldü';
  END IF;
END $$;

-- Eğer secondary_positions kolonu hiç yoksa, text[] olarak oluştur
ALTER TABLE players ADD COLUMN IF NOT EXISTS secondary_positions text[];

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 1: PLAYERS TABLOSUNA EKSİK KOLONLAR
-- ═══════════════════════════════════════════════════════════════════════════

-- 1a. Spesifik mevki
ALTER TABLE players ADD COLUMN IF NOT EXISTS specific_position TEXT;

-- 1b. Kiralama sistemi kolonları
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_on_loan_market BOOLEAN DEFAULT FALSE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_fee BIGINT DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_status TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_end_date TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loaned_to_profile_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_owner_profile_id TEXT;

-- 1c. Detaylı istatistik kolonları
ALTER TABLE players ADD COLUMN IF NOT EXISTS finishing INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS dribbling INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS first_touch INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS crossing INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS marking INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS tackling INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS technique INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS long_shots INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS off_the_ball INTEGER;

ALTER TABLE players ADD COLUMN IF NOT EXISTS aggression INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS bravery INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS work_rate INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS decisions INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS determination INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS concentration INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS leadership INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS anticipation INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS flair INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS positioning INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS composure INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS teamwork INTEGER;

ALTER TABLE players ADD COLUMN IF NOT EXISTS acceleration INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS agility INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS balance INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS stamina INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS jumping INTEGER;

ALTER TABLE players ADD COLUMN IF NOT EXISTS preferred_foot TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS weight INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS form_rating INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_history JSONB;
ALTER TABLE players ADD COLUMN IF NOT EXISTS goal_stats JSONB;
ALTER TABLE players ADD COLUMN IF NOT EXISTS save_stats JSONB;
ALTER TABLE players ADD COLUMN IF NOT EXISTS match_ratings JSONB;
ALTER TABLE players ADD COLUMN IF NOT EXISTS scouting_stars INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS scouting_count INTEGER;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 2: LOANS TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL,
  owner_team_id TEXT,
  loaned_to_team_id TEXT,
  loan_fee_paid BIGINT DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'listed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow anon full access on loans" ON loans
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 3: POSITIONS REFERANS TABLOSU
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
-- BÖLÜM 4: PLAYER_POSITIONS İLİŞKİ TABLOSU
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS player_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL,
  position_code TEXT NOT NULL REFERENCES positions(code),
  is_primary BOOLEAN NOT NULL DEFAULT true,
  proficiency INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, position_code)
);

CREATE INDEX IF NOT EXISTS idx_player_positions_player ON player_positions(player_id);
CREATE INDEX IF NOT EXISTS idx_player_positions_primary ON player_positions(player_id, is_primary);

-- RLS
ALTER TABLE player_positions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "pp_select_all" ON player_positions FOR SELECT USING (true);
  CREATE POLICY "pp_insert_all" ON player_positions FOR INSERT WITH CHECK (true);
  CREATE POLICY "pp_update_all" ON player_positions FOR UPDATE USING (true);
  CREATE POLICY "pp_delete_all" ON player_positions FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 5: MEVCUT OYUNCULARIN specific_position'INI GÜNCELLE
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE players SET specific_position = 'GK'
WHERE specific_position IS NULL AND position = 'GK';

UPDATE players SET specific_position = (ARRAY['CB','LB','RB','LWB','RWB'])[floor(random()*5+1)::int]
WHERE (specific_position IS NULL OR specific_position IN ('DEF', 'MID', 'FWD'))
  AND position = 'DEF';

UPDATE players SET specific_position = (ARRAY['CDM','CM','CAM','LM','RM','LW','RW'])[floor(random()*7+1)::int]
WHERE (specific_position IS NULL OR specific_position IN ('DEF', 'MID', 'FWD'))
  AND position = 'MID';

UPDATE players SET specific_position = (ARRAY['CF','ST'])[floor(random()*2+1)::int]
WHERE (specific_position IS NULL OR specific_position IN ('DEF', 'MID', 'FWD'))
  AND position = 'FWD';

UPDATE players SET specific_position = 'CM'
WHERE specific_position IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 6: YAN MEVKİLERİ ATA (text[] FORMATINDA — JSONB DEĞİL!)
-- HATA DÜZELTME: to_jsonb() yerine ARRAY[] kullanılıyor
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE players SET secondary_positions = 
  CASE 
    WHEN specific_position = 'CB' THEN 
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['LB','RB','CDM'])[floor(random()*3+1)::int], (ARRAY['LB','RB','CDM'])[floor(random()*3+1)::int]]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['LB','RB','CDM'])[floor(random()*3+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'LB' THEN 
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['CB','LWB','LM'])[floor(random()*3+1)::int], (ARRAY['CB','LWB','LM'])[floor(random()*3+1)::int]]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['CB','LWB','LM'])[floor(random()*3+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'RB' THEN 
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['CB','RWB','RM'])[floor(random()*3+1)::int], (ARRAY['CB','RWB','RM'])[floor(random()*3+1)::int]]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['CB','RWB','RM'])[floor(random()*3+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'LWB' THEN 
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['LB','LM'])[floor(random()*2+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'RWB' THEN 
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['RB','RM'])[floor(random()*2+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'CDM' THEN 
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['CM','CB'])[floor(random()*2+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'CM' THEN 
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['CDM','CAM'])[floor(random()*2+1)::int], (ARRAY['CDM','CAM'])[floor(random()*2+1)::int]]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['CDM','CAM'])[floor(random()*2+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'CAM' THEN 
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['CM','CF'])[floor(random()*2+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'LM' THEN 
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['LW','LB','CM'])[floor(random()*3+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'RM' THEN 
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['RW','RB','CM'])[floor(random()*3+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'LW' THEN 
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['LM','ST','CF'])[floor(random()*3+1)::int], (ARRAY['LM','ST','CF'])[floor(random()*3+1)::int]]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['LM','ST','CF'])[floor(random()*3+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'RW' THEN 
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['RM','ST','CF'])[floor(random()*3+1)::int], (ARRAY['RM','ST','CF'])[floor(random()*3+1)::int]]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['RM','ST','CF'])[floor(random()*3+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'CF' THEN 
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['ST','CAM','LW'])[floor(random()*3+1)::int]]
           ELSE NULL END
    WHEN specific_position = 'ST' THEN 
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['CF','LW','RW'])[floor(random()*3+1)::int]]
           ELSE NULL END
    ELSE NULL
  END
WHERE secondary_positions IS NULL 
  AND specific_position IS NOT NULL 
  AND specific_position != 'GK';

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 7: PLAYER_POSITIONS TABLOSUNU DOLDUR
-- ═══════════════════════════════════════════════════════════════════════════

-- Primary positions
INSERT INTO player_positions (player_id, position_code, is_primary, proficiency)
SELECT id, specific_position, true, 100
FROM players
WHERE specific_position IS NOT NULL
ON CONFLICT (player_id, position_code) DO NOTHING;

-- Secondary positions (text[] unnest ile)
INSERT INTO player_positions (player_id, position_code, is_primary, proficiency)
SELECT p.id, unnest_sp, false, 70
FROM players p,
     LATERAL unnest(p.secondary_positions) AS unnest_sp
WHERE p.secondary_positions IS NOT NULL 
  AND array_length(p.secondary_positions, 1) > 0
ON CONFLICT (player_id, position_code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 8: KİRALAMA KOLONLARININ VARSAYILAN DEĞERLERİ
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE players SET 
  is_on_loan_market = COALESCE(is_on_loan_market, FALSE),
  loan_fee = COALESCE(loan_fee, 0)
WHERE is_on_loan_market IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 9: İNDEKSLER
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_players_specific_position ON players(specific_position);
CREATE INDEX IF NOT EXISTS idx_players_on_loan_market ON players(is_on_loan_market) WHERE is_on_loan_market = true;
CREATE INDEX IF NOT EXISTS idx_players_loan_status ON players(loan_status) WHERE loan_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_loaned_to ON players(loaned_to_profile_id) WHERE loaned_to_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_loans_player_id ON loans(player_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
