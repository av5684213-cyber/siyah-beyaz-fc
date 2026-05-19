-- ═══════════════════════════════════════════════════════════════════════════
-- Siyah Beyaz FC — Supabase Migration SQL
-- Bu SQL'i Supabase Dashboard → SQL Editor'de çalıştırın
-- Tarih: 2026-05-20
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 1: PLAYERS TABLOSUNA YENİ KOLONLAR EKLE
-- ═══════════════════════════════════════════════════════════════════════════

-- 1a. Spesifik mevki (CB, LB, CDM, ST gibi detaylı pozisyon)
ALTER TABLE players ADD COLUMN IF NOT EXISTS specific_position TEXT;

-- 1b. Yan mevkiler (text[] dizisi: {LB, CDM} gibi — JSONB DEĞİL!)
-- Önce kolon tipini düzelt (eğer yanlışlıkla JSONB oluşturulduysa)
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
ALTER TABLE players ADD COLUMN IF NOT EXISTS secondary_positions text[];

-- 1c. Kiralama sistemi kolonları
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_on_loan_market BOOLEAN DEFAULT FALSE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_fee BIGINT DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_status TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_end_date TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loaned_to_profile_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS loan_owner_profile_id TEXT;

-- 1d. Detaylı istatistik kolonları
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
ALTER TABLE players ADD COLUMN IF NOT EXISTS vision INTEGER;

ALTER TABLE players ADD COLUMN IF NOT EXISTS acceleration INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS agility INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS balance INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS strength INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS stamina INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS jumping INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS left_foot_detailed INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS right_foot_detailed INTEGER;

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
-- BÖLÜM 2: LOANS TABLOSUNU OLUŞTUR
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

-- Loans tablosu için RLS (Row Level Security)
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Anon erişim politikası (RLS = true, tüm işlemlere izin verir)
DO $$ BEGIN
  CREATE POLICY "Allow anon full access on loans" ON loans
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy already exists on loans table';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 3: MEVCUT OYUNCULARIN specific_position'INI GÜNCELLE
-- ═══════════════════════════════════════════════════════════════════════════

-- position='GK' olanlara specific_position='GK' ata
UPDATE players SET specific_position = 'GK'
WHERE specific_position IS NULL AND position = 'GK';

-- position='DEF' olanlara rastgele defans pozisyonu ata
UPDATE players SET specific_position = (ARRAY['CB','LB','RB','LWB','RWB'])[floor(random()*5+1)::int]
WHERE (specific_position IS NULL OR specific_position IN ('DEF', 'MID', 'FWD'))
  AND position = 'DEF';

-- position='MID' olanlara rastgele orta saha pozisyonu ata
UPDATE players SET specific_position = (ARRAY['CDM','CM','CAM','LM','RM','LW','RW'])[floor(random()*7+1)::int]
WHERE (specific_position IS NULL OR specific_position IN ('DEF', 'MID', 'FWD'))
  AND position = 'MID';

-- position='FWD' olanlara rastgele forvet pozisyonu ata
UPDATE players SET specific_position = (ARRAY['CF','ST'])[floor(random()*2+1)::int]
WHERE (specific_position IS NULL OR specific_position IN ('DEF', 'MID', 'FWD'))
  AND position = 'FWD';

-- Diğer tüm null kayıtlar
UPDATE players SET specific_position = 'CM'
WHERE specific_position IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 4: YAN MEVKİLERİ ATA (GK hariç)
-- ═══════════════════════════════════════════════════════════════════════════

-- GK hariç, secondary_positions NULL olan oyunculara yan mevki ata
-- %24 şansla 1 yan mevki, %6 şansla 2 yan mevki atanır
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
-- BÖLÜM 5: KİRALAMA KOLONLARININ VARSAYILAN DEĞERLERİ
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE players SET 
  is_on_loan_market = COALESCE(is_on_loan_market, FALSE),
  loan_fee = COALESCE(loan_fee, 0),
  loan_status = COALESCE(loan_status, NULL)
WHERE is_on_loan_market IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- BİTTİ! Bu SQL'i çalıştırdıktan sonra:
-- 1. Tüm oyunculara specific_position atanmış olacak
-- 2. Yan mevkiler (secondary_positions) doldurulmuş olacak
-- 3. Kiralama sistemi (loans tablosu) hazır olacak
-- 4. Detaylı istatistik kolonları eklenmiş olacak
-- ═══════════════════════════════════════════════════════════════════════════
