-- ============================================================
-- Migration: user_facilities tablosu oluştur
-- Tarih: 2026-06-03
-- Açıklama: Tesis yükseltmelerini kalıcı olarak saklamak için
--           user_facilities tablosu. StadiumTab bileşeni bu
--           tabloyu okuyup yazacak.
-- ============================================================

-- user_facilities tablosu oluştur (yoksa)
CREATE TABLE IF NOT EXISTS user_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  facility_type TEXT NOT NULL,
  current_level INT DEFAULT 0,
  upgrade_started_at TIMESTAMPTZ,
  upgrade_end_at TIMESTAMPTZ,
  speed_up_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Benzersiz kısıtlama: her kullanıcı-tesis kombinasyonu tek olmalı
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_facilities_profile_type 
  ON user_facilities(profile_id, facility_type);

-- RLS etkinleştir
ALTER TABLE user_facilities ENABLE ROW LEVEL SECURITY;

-- Kullanıcı sadece kendi tesislerini görebilir
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_facilities' AND policyname = 'Users can view own facilities'
  ) THEN
    CREATE POLICY "Users can view own facilities" ON user_facilities
      FOR SELECT USING (profile_id = auth.uid()::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_facilities' AND policyname = 'Users can insert own facilities'
  ) THEN
    CREATE POLICY "Users can insert own facilities" ON user_facilities
      FOR INSERT WITH CHECK (profile_id = auth.uid()::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_facilities' AND policyname = 'Users can update own facilities'
  ) THEN
    CREATE POLICY "Users can update own facilities" ON user_facilities
      FOR UPDATE USING (profile_id = auth.uid()::text);
  END IF;
END $$;

-- Service role tam erişim
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_facilities' AND policyname = 'Service role full access facilities'
  ) THEN
    CREATE POLICY "Service role full access facilities" ON user_facilities
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
