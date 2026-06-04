-- ═══════════════════════════════════════════════════════════════════════
-- STAFF TABLOLARI + VIEW DÜZELTME MİGRASYONU
-- Tarih: 2026-05-29
-- ═══════════════════════════════════════════════════════════════════════
-- Bu dosyayı Supabase Dashboard > SQL Editor'de ÇALIŞTIRIN
-- (Dosya yolunu değil, İÇERİĞİ kopyalayın!)
--
-- Düzeltmeler:
-- 1. staff_types tablosu oluşturma (eksikti!)
-- 2. staff tablosu oluşturma (eksikti!)
-- 3. player_development_log_summary VIEW düzeltmesi
-- 4. player_development_log eksik sütunları
-- 5. RLS politikaları
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 1: staff_types tablosu
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS staff_types (
  type TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  max_count INTEGER NOT NULL DEFAULT 1,
  base_salary INTEGER NOT NULL DEFAULT 0
);

-- Eksik sütunları ekle (tablo zaten varsa)
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS name_tr TEXT;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS max_count INTEGER;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS base_salary INTEGER;

-- name_tr NULL olanları güncelle
UPDATE staff_types SET name_tr = type WHERE name_tr IS NULL;
UPDATE staff_types SET max_count = 3 WHERE max_count IS NULL;
UPDATE staff_types SET base_salary = 100000 WHERE base_salary IS NULL;

-- Staff type verilerini ekle
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

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 2: staff tablosu
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL REFERENCES staff_types(type),
  stars INTEGER NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 5),
  name TEXT NOT NULL,
  contract_start_week INTEGER DEFAULT 1,
  contract_end_week INTEGER DEFAULT 34,
  total_cost INTEGER DEFAULT 0,
  salary_weekly INTEGER DEFAULT 0,
  hired_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_type ON staff(user_id, type);

-- RLS etkinleştir
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_types ENABLE ROW LEVEL SECURITY;

-- staff RLS: Kullanıcı sadece kendi personelini görebilir
DO $$
BEGIN
  -- Mevcut politikaları temizle
  DROP POLICY IF EXISTS "Kullanici kendi personelini gorebilir" ON staff;
  DROP POLICY IF EXISTS "Kullanici kendi personelini ekleyebilir" ON staff;
  DROP POLICY IF EXISTS "Kullanici kendi personelini silebilir" ON staff;
  DROP POLICY IF EXISTS "Staff select own" ON staff;
  DROP POLICY IF EXISTS "Staff insert own" ON staff;
  DROP POLICY IF EXISTS "Staff delete own" ON staff;
END $$;

CREATE POLICY "Kullanici kendi personelini gorebilir" ON staff
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Kullanici kendi personelini ekleyebilir" ON staff
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Kullanici kendi personelini silebilir" ON staff
  FOR DELETE USING (user_id = auth.uid());

-- staff_types RLS: Herkes görebilir (okuma politikası)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Staff types herkese acik" ON staff_types;
  DROP POLICY IF EXISTS "Staff types select all" ON staff_types;
END $$;

CREATE POLICY "Staff types herkese acik" ON staff_types
  FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 3: player_development_log eksik sütunları
-- ═══════════════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 4: player_development_log_summary VIEW düzeltmesi
-- Hata: SQL Error 42703 — column 'week' does not exist
-- Hata: SQL Error 42P16 — cannot drop columns from view
-- ÇÖZÜM: Önce DROP, sonra CREATE (CREATE OR REPLACE ile sütun düşülemez!)
-- ═══════════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS player_development_log_summary;
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

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 5: referees RLS (tablo mevcut ama RLS eksik olabilir)
-- ═══════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  DROP POLICY IF EXISTS "Referees herkese acik" ON referees;
  DROP POLICY IF EXISTS "Referees select all" ON referees;
END $$;

CREATE POLICY "Referees herkese acik" ON referees
  FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════════════
-- DOĞRULAMA
-- ═══════════════════════════════════════════════════════════════════════
-- SELECT * FROM staff_types;
-- SELECT * FROM player_development_log_summary LIMIT 5;

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
