-- ═══════════════════════════════════════════════════════════════
-- GÖREV 2: Detaylı Pozisyon Sistemi
-- ═══════════════════════════════════════════════════════════════

-- 1. positions referans tablosu
CREATE TABLE IF NOT EXISTS positions (
  code TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  position_group TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  pitch_zone TEXT
);

-- 2. Pozisyon verilerini ekle
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

-- 3. player_positions ilişki tablosu
CREATE TABLE IF NOT EXISTS player_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  position_code TEXT NOT NULL REFERENCES positions(code),
  is_primary BOOLEAN NOT NULL DEFAULT true,
  proficiency INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, position_code)
);

-- 4. İndeksler
CREATE INDEX IF NOT EXISTS idx_player_positions_player ON player_positions(player_id);
CREATE INDEX IF NOT EXISTS idx_player_positions_position ON player_positions(position_code);
CREATE INDEX IF NOT EXISTS idx_player_positions_primary ON player_positions(player_id, is_primary);

-- 5. RLS
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_positions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Positions: herkes okuyabilir
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'positions' AND policyname = 'positions_select_all') THEN
    CREATE POLICY "positions_select_all" ON positions FOR SELECT USING (true);
  END IF;
  
  -- player_positions: herkes okuyabilir
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_positions' AND policyname = 'pp_select_all') THEN
    CREATE POLICY "pp_select_all" ON player_positions FOR SELECT USING (true);
  END IF;
  
  -- player_positions: authenticated kullanıcılar yazabilir
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_positions' AND policyname = 'pp_insert_auth') THEN
    CREATE POLICY "pp_insert_auth" ON player_positions FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_positions' AND policyname = 'pp_update_auth') THEN
    CREATE POLICY "pp_update_auth" ON player_positions FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_positions' AND policyname = 'pp_delete_auth') THEN
    CREATE POLICY "pp_delete_auth" ON player_positions FOR DELETE USING (true);
  END IF;
END $$;

-- 6. Mevcut oyuncuların specific_position'larını düzelt
UPDATE players SET specific_position = 
  CASE position
    WHEN 'GK' THEN 'GK'
    WHEN 'DEF' THEN (ARRAY['CB','LB','RB','LWB','RWB'])[1 + floor(random()*5)::int]
    WHEN 'MID' THEN (ARRAY['CDM','CM','CAM','LM','RM','LW','RW'])[1 + floor(random()*7)::int]
    WHEN 'FWD' THEN (ARRAY['CF','ST'])[1 + floor(random()*2)::int]
    ELSE 'CM'
  END
WHERE specific_position IS NULL 
   OR specific_position = position 
   OR specific_position NOT IN ('GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST');

-- 7. Primary positions: player_positions tablosunu doldur
INSERT INTO player_positions (player_id, position_code, is_primary, proficiency)
SELECT id, specific_position, true, 100
FROM players
WHERE specific_position IS NOT NULL
ON CONFLICT (player_id, position_code) DO NOTHING;

-- 8. Secondary positions: mevcut secondary_positions dizisini aç
INSERT INTO player_positions (player_id, position_code, is_primary, proficiency)
SELECT p.id, unnest_sp, false, 70
FROM players p,
     LATERAL unnest(p.secondary_positions) AS unnest_sp
WHERE p.secondary_positions IS NOT NULL 
  AND array_length(p.secondary_positions, 1) > 0
ON CONFLICT (player_id, position_code) DO NOTHING;
