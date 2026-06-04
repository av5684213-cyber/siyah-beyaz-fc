-- ═══════════════════════════════════════════════════════════════════════════════
-- MASTER MİGRASYON — TÜM DÜZELTMELER BİR ARADA (v2)
-- Tarih: 2026-05-29
-- ═══════════════════════════════════════════════════════════════════════════════
-- Bu dosyayı Supabase Dashboard > SQL Editor'de ÇALIŞTIRIN
-- (Dosya yolunu değil, İÇERİĞİ kopyalayın — curl komutunu DEĞİL!)
--
-- Bu tek dosya şu sorunları çözer:
-- 1. SQL Error 42703: column "week" does not exist (eski VIEW bozuk)
-- 2. SQL Error 42703: column "description" of relation "staff_types" does not exist
-- 3. SQL Error 42883: operator does not exist: text = uuid (tip uyuşmazlığı)
-- 4. SQL Error 42P16: cannot drop columns from view (DROP+CREATE ile çözüm)
-- 5. staff / staff_types tabloları eksik veya yanlış tip
-- 6. player_development_log eksik sütunlar
-- 7. RLS politikaları eksik
--
-- ÖNEMLİ: profiles.id = TEXT, bu yüzden staff.user_id de TEXT olmalı!
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADIM 1: BOZUK VIEW'I TEMIZLE (en önce yapılmalı!)
-- ═══════════════════════════════════════════════════════════════════════════════
DROP VIEW IF EXISTS player_development_log_summary;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADIM 2: ESKI YANLIŞ TİPLİ staff TABLOSUNU TEMIZLE
-- Eğer staff tablosu UUID user_id ile oluşturulduysa, TEXT'e çevrilmeli
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  -- staff tablosu mevcut mu kontrol et
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
    -- user_id sütunu UUID tipinde mi kontrol et
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'staff' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
      -- UUID user_id olan staff tablosunu kaldır (veri yok, yanlış tipte)
      DROP TABLE IF EXISTS staff CASCADE;
      RAISE NOTICE 'staff tablosu (UUID user_id) silindi, TEXT user_id ile yeniden oluşturulacak';
    END IF;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADIM 3: player_development_log eksik sütunları ekle
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS old_ovr NUMERIC;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS new_ovr NUMERIC;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS change_reason TEXT DEFAULT 'weekly_training';
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS match_performance_contribution NUMERIC DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS season_week INTEGER;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS training_sessions INTEGER DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS training_contribution NUMERIC DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS potential_bonus NUMERIC DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS age_penalty NUMERIC DEFAULT 0;

-- Mevcut veriyi yeni sütunlara taşı
UPDATE player_development_log SET old_ovr = old_rating WHERE old_ovr IS NULL AND old_rating IS NOT NULL;
UPDATE player_development_log SET new_ovr = new_rating WHERE new_ovr IS NULL AND new_rating IS NOT NULL;
UPDATE player_development_log SET change_reason = COALESCE(reason, 'weekly_training') WHERE change_reason = 'weekly_training' AND reason IS NOT NULL AND reason != 'weekly_training';

-- Eski "week" sütunu varsa season_week'e taşı, sonra kaldır
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_development_log' AND column_name = 'week'
  ) THEN
    UPDATE player_development_log SET season_week = week WHERE season_week IS NULL AND week IS NOT NULL;
    ALTER TABLE player_development_log DROP COLUMN week;
  END IF;
END $$;

-- Eski "ovr_before" sütunu varsa old_ovr'e taşı, sonra kaldır
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_development_log' AND column_name = 'ovr_before'
  ) THEN
    UPDATE player_development_log SET old_ovr = ovr_before WHERE old_ovr IS NULL AND ovr_before IS NOT NULL;
    ALTER TABLE player_development_log DROP COLUMN ovr_before;
  END IF;
END $$;

-- Eski "ovr_after" sütunu varsa new_ovr'e taşı, sonra kaldır
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_development_log' AND column_name = 'ovr_after'
  ) THEN
    UPDATE player_development_log SET new_ovr = ovr_after WHERE new_ovr IS NULL AND ovr_after IS NOT NULL;
    ALTER TABLE player_development_log DROP COLUMN ovr_after;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADIM 4: VIEW'ı doğru sütunlarla oluştur
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE VIEW player_development_log_summary AS
SELECT
  player_id,
  season_week,
  change_reason,
  match_performance_contribution,
  COALESCE(old_ovr, old_rating) as old_ovr,
  COALESCE(new_ovr, new_rating) as new_ovr,
  created_at
FROM player_development_log
ORDER BY created_at DESC;

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_player_dev_log_player
  ON player_development_log(player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_dev_log_profile
  ON player_development_log(profile_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADIM 5: staff_types tablosu (description dahil!)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS staff_types (
  type TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  max_count INTEGER NOT NULL DEFAULT 1,
  base_salary INTEGER NOT NULL DEFAULT 0,
  description TEXT
);

-- Eksik sütunları ekle (tablo zaten varsa CREATE IF NOT EXISTS sütun eklemez!)
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS name_tr TEXT;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS max_count INTEGER;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS base_salary INTEGER;

-- NULL alanları doldur
UPDATE staff_types SET name_tr = type WHERE name_tr IS NULL;
UPDATE staff_types SET max_count = 3 WHERE max_count IS NULL;
UPDATE staff_types SET base_salary = 100000 WHERE base_salary IS NULL;

-- Verileri ekle (conflict durumunda güncelle)
INSERT INTO staff_types (type, name_tr, max_count, base_salary, description) VALUES
  ('scout', 'Gözlemci', 3, 100000, 'Transfer piyasasında oyuncu keşfi yapar'),
  ('coach', 'Yardımcı Antrenör', 3, 150000, 'Antrenman kalitesini artırır'),
  ('physio', 'Fizyoterapist', 3, 80000, 'Sakatlık iyileşme süresini kısaltır'),
  ('youth_coordinator', 'Gençlik Koordinatörü', 2, 120000, 'Altyapıdan oyuncu yetiştirir'),
  ('sporting_director', 'Sportif Direktör', 1, 200000, 'Transfer stratejisi oluşturur'),
  ('analyst', 'Maç Analisti', 2, 60000, 'Rakip analiz raporları hazırlar')
ON CONFLICT (type) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  max_count = EXCLUDED.max_count,
  base_salary = EXCLUDED.base_salary,
  description = EXCLUDED.description;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADIM 6: staff tablosu — user_id TEXT (profiles.id ile uyumlu!)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL REFERENCES staff_types(type),
  stars INTEGER NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 5),
  name TEXT NOT NULL,
  contract_start_week INTEGER DEFAULT 1,
  contract_end_week INTEGER DEFAULT 34,
  total_cost INTEGER DEFAULT 0,
  salary_weekly INTEGER DEFAULT 0,
  hired_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_id TEXT sütunu ekleme (eğer tablo zaten varsa ve eksikse)
ALTER TABLE staff ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS stars INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS contract_start_week INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS contract_end_week INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS total_cost INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS salary_weekly INTEGER;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS hired_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_type ON staff(user_id, type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADIM 7: RLS politikaları
-- DİKKAT: user_id TEXT, auth.uid() UUID → explicit cast gerekli!
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_types ENABLE ROW LEVEL SECURITY;

-- staff RLS: Kullanıcı sadece kendi personelini görebilir
DO $$
BEGIN
  DROP POLICY IF EXISTS "Kullanici kendi personelini gorebilir" ON staff;
  DROP POLICY IF EXISTS "Kullanici kendi personelini ekleyebilir" ON staff;
  DROP POLICY IF EXISTS "Kullanici kendi personelini silebilir" ON staff;
  DROP POLICY IF EXISTS "Staff select own" ON staff;
  DROP POLICY IF EXISTS "Staff insert own" ON staff;
  DROP POLICY IF EXISTS "Staff delete own" ON staff;
END $$;

CREATE POLICY "Kullanici kendi personelini gorebilir" ON staff
  FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Kullanici kendi personelini ekleyebilir" ON staff
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Kullanici kendi personelini silebilir" ON staff
  FOR DELETE USING (user_id = auth.uid()::text);

-- staff_types RLS: Herkes görebilir
DO $$
BEGIN
  DROP POLICY IF EXISTS "Staff types herkese acik" ON staff_types;
  DROP POLICY IF EXISTS "Staff types select all" ON staff_types;
END $$;

CREATE POLICY "Staff types herkese acik" ON staff_types
  FOR SELECT USING (true);

-- referees RLS
DO $$
BEGIN
  DROP POLICY IF EXISTS "Referees herkese acik" ON referees;
  DROP POLICY IF EXISTS "Referees select all" ON referees;
END $$;

CREATE POLICY "Referees herkese acik" ON referees
  FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADIM 8: league_teams is_bot düzeltmesi
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE league_teams SET is_bot = true WHERE is_npc = true AND is_bot = false AND profile_id IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ADIM 9: assign_bot_to_user RPC — p_profile_id TEXT (profiles.id ile uyumlu!)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION assign_bot_to_user(
  p_profile_id TEXT,
  p_team_name TEXT,
  p_manager_name TEXT DEFAULT 'Menajer',
  p_philosophy TEXT DEFAULT 'balanced',
  p_color1 TEXT DEFAULT '#ffffff',
  p_color2 TEXT DEFAULT '#000000',
  p_region TEXT DEFAULT 'TR'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_bot_team RECORD;
  v_league_id UUID;
  v_league_name TEXT;
  v_old_profile_id TEXT;
BEGIN
  SET LOCAL lock_timeout = '5s';

  SELECT lt.id, lt.league_id, lt.name AS old_team_name, lt.profile_id AS old_profile_id
  INTO v_bot_team
  FROM league_teams lt
  JOIN leagues l ON l.id = lt.league_id
  WHERE (lt.is_bot = true OR lt.is_npc = true)
    AND lt.profile_id IS NULL
    AND l.tier = 4
  ORDER BY lt.id
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_bot_available');
  END IF;

  SELECT id, name INTO v_league_id, v_league_name
  FROM leagues WHERE id = v_bot_team.league_id;

  UPDATE league_teams
  SET profile_id = p_profile_id,
      is_bot = false,
      is_npc = false,
      name = p_team_name,
      color = p_color1
  WHERE id = v_bot_team.id;

  IF v_bot_team.old_profile_id IS NOT NULL THEN
    UPDATE players
    SET profile_id = p_profile_id,
        team_name = p_team_name
    WHERE profile_id = v_bot_team.old_profile_id;

    DELETE FROM profiles WHERE id = v_bot_team.old_profile_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'league_id', v_league_id,
    'league_name', COALESCE(v_league_name, '4. Lig'),
    'team_slot_id', v_bot_team.id,
    'took_over_bot', true
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'reason', SQLERRM);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DOĞRULAMA
-- ═══════════════════════════════════════════════════════════════════════════════
-- SELECT * FROM staff_types;
-- SELECT * FROM player_development_log_summary LIMIT 5;
-- SELECT tier, count(*) as lig_sayisi FROM leagues GROUP BY tier ORDER BY tier;

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
