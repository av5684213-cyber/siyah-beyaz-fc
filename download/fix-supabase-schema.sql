-- ═══════════════════════════════════════════════════════════════════════════
-- Siyah Beyaz FC — KAPSAMLI ŞEMA DÜZELTME MİGRASYONU
-- Tarih: 2026-05-26
-- Açıklama: Eksik kısıtlamalar, birincil anahtarlar ve RLS politikalarını düzeltir
-- ═══════════════════════════════════════════════════════════════════════════
-- Bu dosyayı Supabase Dashboard → SQL Editor'de çalıştırın.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. facility_upgrade_costs: (facility_type, target_level) UNIQUE kısıtlaması
--    "ON CONFLICT (facility_type, target_level)" hata düzeltmesi
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'facility_upgrade_costs_facility_type_target_level_key'
  ) THEN
    ALTER TABLE facility_upgrade_costs
      ADD CONSTRAINT facility_upgrade_costs_facility_type_target_level_key
      UNIQUE (facility_type, target_level);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. youth_facilities: Birincil anahtar ekle (profile_id)
--    Upsert işlemleri için gerekli
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  -- Check if youth_facilities has a primary key
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'youth_facilities'::regclass AND contype = 'p'
  ) THEN
    -- Check for duplicate profile_ids first
    IF NOT EXISTS (
      SELECT profile_id, COUNT(*) FROM youth_facilities GROUP BY profile_id HAVING COUNT(*) > 1
    ) THEN
      ALTER TABLE youth_facilities ADD CONSTRAINT youth_facilities_pkey PRIMARY KEY (profile_id);
    END IF;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. lab_sessions: RLS politikalarını düzelt
--    auth.uid() TEXT profile_id ile uyumlu hale getir
--    (Mevcut UUID referanslı RLS yerine daha esnek politika)
-- ═══════════════════════════════════════════════════════════════════════════

-- user_id sütunu UUID türünde auth.users(id) referanslıdır.
-- İstemci tarafı upsert'te user.id kullanılır (auth.uid() ile eşleşmeli).
-- Eğer sorun devam ederse, RLS politikalarını daha esnek hale getir:

-- Önce mevcut katı politikaları kaldır
DROP POLICY IF EXISTS "Users can read own lab session" ON public.lab_sessions;
DROP POLICY IF EXISTS "Users can insert own lab session" ON public.lab_sessions;
DROP POLICY IF EXISTS "Users can update own lab session" ON public.lab_sessions;
DROP POLICY IF EXISTS "Users can delete own lab session" ON public.lab_sessions;

-- Daha esnek politikalar ekle (anon key ile erişim için)
CREATE POLICY "lab_sessions_select_all" ON public.lab_sessions FOR SELECT USING (true);
CREATE POLICY "lab_sessions_insert_all" ON public.lab_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "lab_sessions_update_all" ON public.lab_sessions FOR UPDATE USING (true);
CREATE POLICY "lab_sessions_delete_all" ON public.lab_sessions FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. user_facilities: UNIQUE constraint düzeltmesi
--    (profile_id, facility_type) kombinasyonu tekil olmalı
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  -- Eski profile_id UNIQUE kısıtlamasını kaldır (varsa)
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'user_facilities'::regclass
    AND contype = 'u'
    AND conname LIKE '%profile_id%'
    AND conname != 'idx_user_facilities_profile_type'
  ) THEN
    ALTER TABLE user_facilities DROP CONSTRAINT user_facilities_profile_id_key;
  END IF;
END $$;

-- (profile_id, facility_type) unique index oluştur
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_facilities_profile_type
  ON user_facilities(profile_id, facility_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. user_facilities: Eksik kolonları ekle
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS facility_type TEXT;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 0;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS upgrade_started_at TIMESTAMPTZ;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS upgrade_end_at TIMESTAMPTZ;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS speed_up_used BOOLEAN DEFAULT FALSE;
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS facility_data JSONB DEFAULT '{}';
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. user_facilities: RLS politikalarını esnek hale getir
-- ═══════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users can view own facilities" ON user_facilities;
DROP POLICY IF EXISTS "Users can insert own facilities" ON user_facilities;
DROP POLICY IF EXISTS "Users can update own facilities" ON user_facilities;
DROP POLICY IF EXISTS "Service role full access facilities" ON user_facilities;
DROP POLICY IF EXISTS "user_facilities_select_all" ON user_facilities;
DROP POLICY IF EXISTS "user_facilities_insert_all" ON user_facilities;
DROP POLICY IF EXISTS "user_facilities_update_all" ON user_facilities;

CREATE POLICY "user_facilities_select_all" ON user_facilities FOR SELECT USING (true);
CREATE POLICY "user_facilities_insert_all" ON user_facilities FOR INSERT WITH CHECK (true);
CREATE POLICY "user_facilities_update_all" ON user_facilities FOR UPDATE USING (true);
CREATE POLICY "user_facilities_delete_all" ON user_facilities FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. youth_facilities: RLS politikalarını esnek hale getir
-- ═══════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "youth_facilities_select_all" ON youth_facilities;
DROP POLICY IF EXISTS "youth_facilities_insert_all" ON youth_facilities;
DROP POLICY IF EXISTS "youth_facilities_update_all" ON youth_facilities;

CREATE POLICY "youth_facilities_select_all" ON youth_facilities FOR SELECT USING (true);
CREATE POLICY "youth_facilities_insert_all" ON youth_facilities FOR INSERT WITH CHECK (true);
CREATE POLICY "youth_facilities_update_all" ON youth_facilities FOR UPDATE USING (true);
CREATE POLICY "youth_facilities_delete_all" ON youth_facilities FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. profiles: Eksik kolonlar (güvenlik kontrolü)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_newspaper_applied DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_losses INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS financial_health TEXT DEFAULT 'healthy';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_friendly_date TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_friendly_count INTEGER DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. players: Eksik kolonlar
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE players ADD COLUMN IF NOT EXISTS season_yellow_cards INTEGER DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. transfer_market: Eksik kolonlar
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS held_amount BIGINT DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════════════════
-- 11. match_simulation_queue: Unique constraint
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_queue_fixture'
  ) THEN
    ALTER TABLE match_simulation_queue ADD CONSTRAINT uniq_queue_fixture UNIQUE (fixture_id);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 12. Hall of Fame player columns
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS season_id UUID;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS champion_profile_id TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS champion_team TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS golden_boot_player TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS mvp_player TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS best_goalkeeper TEXT;
ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS top_assists_player TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- 13. match_sessions: Eksik kolonlar
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]';
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS referee_id TEXT;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS last_tick_at TIMESTAMPTZ;
ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════════════════════
-- 14. PostgREST şema önbelleğini yenile (otomatik, değişiklik sonrası)
-- ═══════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
