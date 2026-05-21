-- ═══════════════════════════════════════════════════════════════════════════
-- Siyah Beyaz FC — Supabase Migration SQL (GÜNCEL)
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
ALTER TABLE players ADD COLUMN IF NOT EXISTS secondary_positions TEXT[];

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
-- BÖLÜM 2: MEVCUT OYUNCULARIN specific_position'INI GÜNCELLE
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
-- BÖLÜM 3: YAN MEVKİLERİ ATA (GK hariç, ARRAY[]::text[] — JSONB DEĞİL!)
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE players SET secondary_positions =
  CASE
    WHEN specific_position = 'CB' THEN
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['LB','RB','CDM'])[floor(random()*3+1)::int], (ARRAY['LB','RB','CDM'])[floor(random()*3+1)::int]]::text[]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['LB','RB','CDM'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'LB' THEN
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['CB','LWB','LM'])[floor(random()*3+1)::int], (ARRAY['CB','LWB','LM'])[floor(random()*3+1)::int]]::text[]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['CB','LWB','LM'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'RB' THEN
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['CB','RWB','RM'])[floor(random()*3+1)::int], (ARRAY['CB','RWB','RM'])[floor(random()*3+1)::int]]::text[]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['CB','RWB','RM'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'LWB' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['LB','LM'])[floor(random()*2+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'RWB' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['RB','RM'])[floor(random()*2+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'CDM' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['CM','CB'])[floor(random()*2+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'CM' THEN
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['CDM','CAM'])[floor(random()*2+1)::int], (ARRAY['CDM','CAM'])[floor(random()*2+1)::int]]::text[]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['CDM','CAM'])[floor(random()*2+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'CAM' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['CM','CF'])[floor(random()*2+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'LM' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['LW','LB','CM'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'RM' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['RW','RB','CM'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'LW' THEN
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['LM','ST','CF'])[floor(random()*3+1)::int], (ARRAY['LM','ST','CF'])[floor(random()*3+1)::int]]::text[]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['LM','ST','CF'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'RW' THEN
      CASE WHEN random() < 0.06 THEN ARRAY[(ARRAY['RM','ST','CF'])[floor(random()*3+1)::int], (ARRAY['RM','ST','CF'])[floor(random()*3+1)::int]]::text[]
           WHEN random() < 0.24 THEN ARRAY[(ARRAY['RM','ST','CF'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'CF' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['ST','CAM','LW'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    WHEN specific_position = 'ST' THEN
      CASE WHEN random() < 0.24 THEN ARRAY[(ARRAY['CF','LW','RW'])[floor(random()*3+1)::int]]::text[]
           ELSE NULL END
    ELSE NULL
  END
WHERE secondary_positions IS NULL
  AND specific_position IS NOT NULL
  AND specific_position != 'GK';

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 4: KİRALAMA KOLONLARININ VARSAYILAN DEĞERLERİ
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE players SET
  is_on_loan_market = COALESCE(is_on_loan_market, FALSE),
  loan_fee = COALESCE(loan_fee, 0),
  loan_status = COALESCE(loan_status, NULL)
WHERE is_on_loan_market IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 5: İNDEKSLER
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_players_specific_position ON players(specific_position);

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 6: LOANS TABLOSU
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

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow anon full access on loans" ON loans
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy already exists on loans table';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 7: RENTAL_LISTINGS TABLOSU (kiralama sistemi)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rental_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  owner_team_id TEXT NOT NULL,
  daily_cost INT NOT NULL DEFAULT 0,
  duration_weeks INT NOT NULL DEFAULT 17,
  status TEXT NOT NULL DEFAULT 'active',
  listed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rental_listings_player ON rental_listings(player_id);
CREATE INDEX IF NOT EXISTS idx_rental_listings_status ON rental_listings(status);
CREATE INDEX IF NOT EXISTS idx_rental_listings_owner ON rental_listings(owner_team_id);

ALTER TABLE rental_listings ENABLE ROW LEVEL SECURITY;

-- Add duration_weeks column if it doesn't exist (for existing databases)
DO $$ BEGIN
  ALTER TABLE rental_listings ADD COLUMN IF NOT EXISTS duration_weeks INT NOT NULL DEFAULT 17;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "rental_select_all" ON rental_listings FOR SELECT USING (true);
  CREATE POLICY "rental_insert_all" ON rental_listings FOR INSERT WITH CHECK (true);
  CREATE POLICY "rental_update_all" ON rental_listings FOR UPDATE USING (true);
  CREATE POLICY "rental_delete_all" ON rental_listings FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 8: PUSH_SUBSCRIPTIONS TABLOSU (Web Push bildirimleri)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT,
  auth_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subs_profile ON push_subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON push_subscriptions(endpoint);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "push_subs_select_all" ON push_subscriptions FOR SELECT USING (true);
  CREATE POLICY "push_subs_insert_all" ON push_subscriptions FOR INSERT WITH CHECK (true);
  CREATE POLICY "push_subs_update_all" ON push_subscriptions FOR UPDATE USING (true);
  CREATE POLICY "push_subs_delete_all" ON push_subscriptions FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 9: SEASON_AWARDS TABLOSU (sezon sonu ödülleri)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS season_awards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID,
  award_type TEXT NOT NULL,
  team_name TEXT,
  player_id TEXT,
  player_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE season_awards ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "season_awards_select_all" ON season_awards FOR SELECT USING (true);
  CREATE POLICY "season_awards_insert_all" ON season_awards FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 10: RENTAL_AGREEMENTS TABLOSU (kiralama anlaşmaları)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rental_agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES rental_listings(id) ON DELETE SET NULL,
  player_id TEXT NOT NULL,
  owner_team_id TEXT NOT NULL,
  renter_team_id TEXT NOT NULL,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  duration_weeks INT NOT NULL DEFAULT 12,
  daily_cost INT NOT NULL DEFAULT 0,
  total_cost BIGINT NOT NULL DEFAULT 0,
  commission INT NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rental_agreements_player ON rental_agreements(player_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_owner ON rental_agreements(owner_team_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_renter ON rental_agreements(renter_team_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_status ON rental_agreements(status);

ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "rental_agreements_select_all" ON rental_agreements FOR SELECT USING (true);
  CREATE POLICY "rental_agreements_insert_all" ON rental_agreements FOR INSERT WITH CHECK (true);
  CREATE POLICY "rental_agreements_update_all" ON rental_agreements FOR UPDATE USING (true);
  CREATE POLICY "rental_agreements_delete_all" ON rental_agreements FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BÖLÜM 11: NOTIFICATION_PREFERENCES TABLOSU (bildirim tercihleri)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT NOT NULL UNIQUE,
  match_reminder BOOLEAN DEFAULT true,
  transfer_offer BOOLEAN DEFAULT true,
  training_report BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_profile ON notification_preferences(profile_id);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "notif_prefs_select_all" ON notification_preferences FOR SELECT USING (true);
  CREATE POLICY "notif_prefs_insert_all" ON notification_preferences FOR INSERT WITH CHECK (true);
  CREATE POLICY "notif_prefs_update_all" ON notification_preferences FOR UPDATE USING (true);
  CREATE POLICY "notif_prefs_delete_all" ON notification_preferences FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- BİTTİ! Bu SQL'i çalıştırdıktan sonra:
-- 1. Tüm oyunculara specific_position atanmış olacak
-- 2. Yan mevkiler (secondary_positions) text[] olarak doldurulmuş olacak
-- 3. Kiralama sistemi (loans + rental_listings + rental_agreements) hazır olacak
-- 4. Push bildirimleri (push_subscriptions) hazır olacak
-- 5. Sezon sonu ödülleri (season_awards) hazır olacak
-- 6. Detaylı istatistik kolonları eklenmiş olacak
-- 7. Bildirim tercihleri (notification_preferences) hazır olacak
-- ═══════════════════════════════════════════════════════════════════════════
