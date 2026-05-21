-- =====================================================
-- KAPSAMLI RLS VE SEED DUZELTME DOSYASI
-- Tarih: 2026-05-19
--
-- Icerik:
--   1. friendly_queue / friendly_matches RLS fix
--   2. staff_types RLS fix + seed data
--   3. staff RLS fix
--   4. staff_types tablosu olusturma (yoksa)
--   5. staff tablosu olusturma (yoksa)
-- =====================================================

-- ==========================================
-- 1. friendly_queue RLS
-- ==========================================
DROP POLICY IF EXISTS friendly_queue_select ON friendly_queue;
DROP POLICY IF EXISTS friendly_queue_insert ON friendly_queue;
DROP POLICY IF EXISTS friendly_queue_delete ON friendly_queue;
DROP POLICY IF EXISTS friendly_queue_update ON friendly_queue;

ALTER TABLE friendly_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY friendly_queue_select ON friendly_queue
  FOR SELECT USING (true);
CREATE POLICY friendly_queue_insert ON friendly_queue
  FOR INSERT WITH CHECK (true);
CREATE POLICY friendly_queue_delete ON friendly_queue
  FOR DELETE USING (true);
CREATE POLICY friendly_queue_update ON friendly_queue
  FOR UPDATE USING (true) WITH CHECK (true);

-- ==========================================
-- 2. friendly_matches RLS
-- ==========================================
DROP POLICY IF EXISTS friendly_matches_select ON friendly_matches;
DROP POLICY IF EXISTS friendly_matches_insert ON friendly_matches;
DROP POLICY IF EXISTS friendly_matches_delete ON friendly_matches;
DROP POLICY IF EXISTS friendly_matches_update ON friendly_matches;

ALTER TABLE friendly_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY friendly_matches_select ON friendly_matches
  FOR SELECT USING (true);
CREATE POLICY friendly_matches_insert ON friendly_matches
  FOR INSERT WITH CHECK (true);
CREATE POLICY friendly_matches_delete ON friendly_matches
  FOR DELETE USING (true);
CREATE POLICY friendly_matches_update ON friendly_matches
  FOR UPDATE USING (true) WITH CHECK (true);

-- ==========================================
-- 3. staff_types tablosu (yoksa olustur)
-- ==========================================
CREATE TABLE IF NOT EXISTS staff_types (
  type TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  max_count INTEGER NOT NULL DEFAULT 1,
  base_salary INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE staff_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staff_types_select ON staff_types;
DROP POLICY IF EXISTS staff_types_insert ON staff_types;
DROP POLICY IF EXISTS staff_types_update ON staff_types;
DROP POLICY IF EXISTS staff_types_delete ON staff_types;

CREATE POLICY staff_types_select ON staff_types
  FOR SELECT USING (true);
CREATE POLICY staff_types_insert ON staff_types
  FOR INSERT WITH CHECK (true);
CREATE POLICY staff_types_update ON staff_types
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY staff_types_delete ON staff_types
  FOR DELETE USING (true);

-- Seed staff_types (upsert - mevcut kayitlari guncelle, yoksa ekle)
INSERT INTO staff_types (type, name_tr, max_count, base_salary)
VALUES
  ('scout', 'Gözlemci', 3, 50000),
  ('coach', 'Yardımcı Antrenör', 3, 80000),
  ('physio', 'Fizyoterapist', 3, 25000),
  ('youth_coordinator', 'Gençlik Koordinatörü', 2, 55000),
  ('sporting_director', 'Sportif Direktör', 1, 70000),
  ('analyst', 'Maç Analisti', 2, 20000)
ON CONFLICT (type) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  max_count = EXCLUDED.max_count,
  base_salary = EXCLUDED.base_salary;

-- ==========================================
-- 4. staff tablosu (yoksa olustur)
-- ==========================================
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL REFERENCES staff_types(type),
  stars INTEGER NOT NULL DEFAULT 1 CHECK (stars BETWEEN 1 AND 5),
  name TEXT NOT NULL,
  contract_start_week INTEGER DEFAULT 1,
  contract_end_week INTEGER DEFAULT 34,
  total_cost INTEGER DEFAULT 0,
  hired_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staff_select ON staff;
DROP POLICY IF EXISTS staff_insert ON staff;
DROP POLICY IF EXISTS staff_update ON staff;
DROP POLICY IF EXISTS staff_delete ON staff;

CREATE POLICY staff_select ON staff
  FOR SELECT USING (true);
CREATE POLICY staff_insert ON staff
  FOR INSERT WITH CHECK (true);
CREATE POLICY staff_update ON staff
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY staff_delete ON staff
  FOR DELETE USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff (user_id);
CREATE INDEX IF NOT EXISTS idx_staff_type ON staff (type);
