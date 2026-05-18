-- =====================================================
-- FIX: friendly_queue RLS policy error
-- "new row violates row-level security policy"
--
-- Nedeni: friendly_queue tablosunda RLS aktif ama
-- INSERT policy'si eksik veya bozuk.
-- Cozum: Tum policy'leri sil ve yeniden olustur.
-- =====================================================

-- 1. friendly_queue: Mevcut tum policy'leri sil
DROP POLICY IF EXISTS friendly_queue_select ON friendly_queue;
DROP POLICY IF EXISTS friendly_queue_insert ON friendly_queue;
DROP POLICY IF EXISTS friendly_queue_delete ON friendly_queue;
DROP POLICY IF EXISTS friendly_queue_update ON friendly_queue;

-- 2. friendly_queue: RLS aktif et
ALTER TABLE friendly_queue ENABLE ROW LEVEL SECURITY;

-- 3. friendly_queue: Yeni policy'leri olustur (anon key ile tam erisim)
CREATE POLICY friendly_queue_select ON friendly_queue
  FOR SELECT USING (true);

CREATE POLICY friendly_queue_insert ON friendly_queue
  FOR INSERT WITH CHECK (true);

CREATE POLICY friendly_queue_delete ON friendly_queue
  FOR DELETE USING (true);

CREATE POLICY friendly_queue_update ON friendly_queue
  FOR UPDATE USING (true) WITH CHECK (true);

-- 4. friendly_matches: Ayni sekilde duzelt
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
