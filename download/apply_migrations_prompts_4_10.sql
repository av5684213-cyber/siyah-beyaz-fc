-- ============================================================
-- SQL Migration: PROMPT 4-10
-- Tarih: 2026-05-26
-- Açıklama: Cron lock tablosu ve notifications indeks düzeltmesi
-- ============================================================
-- Supabase SQL Editor'de çalıştırın
-- ============================================================

-- 1. cron_locks tablosu (PROMPT 7 — Cron Lock için gerekli)
CREATE TABLE IF NOT EXISTS cron_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(job_name)
);

-- İndeks: Süresi dolmuş kilitleri hızlı temizleme
CREATE INDEX IF NOT EXISTS idx_cron_locks_expires ON cron_locks(expires_at);

-- RLS aktif et (cron_locks sadece sunucu tarafından kullanılır)
ALTER TABLE cron_locks ENABLE ROW LEVEL SECURITY;

-- cron_locks tablosu için policy: tüm işlemlere izin ver (service_role ile erişilir)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'cron_locks_all') THEN
    CREATE POLICY "cron_locks_all" ON cron_locks FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 2. notifications tablosu: is_read sütunu zaten mevcut olmalı
--    Önceki migration'da "read" yerine "is_read" kullanılıyordu,
--    yanlış indeks referansını düzelt
--    Eğer "read" sütunu yoksa ve "is_read" varsa, doğru indeksi oluştur
DO $$ BEGIN
  -- Eski yanlış indeksi sil (read sütununa referans veren)
  DROP INDEX IF EXISTS idx_notifications_read;
END $$;

-- Doğru indeks: is_read sütununu kullan
CREATE INDEX IF NOT EXISTS idx_notifications_profile_unread ON notifications(profile_id, is_read) WHERE is_read = FALSE;

-- 3. notifications tablosu henüz yoksa oluştur (güvenlik ağı)
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  tag TEXT,
  type TEXT DEFAULT 'match_event',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Notifications read') THEN
    CREATE POLICY "Notifications read" ON notifications FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Notifications write') THEN
    CREATE POLICY "Notifications write" ON notifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. rating_start_of_season sütunu (önceki migration'dan — tekrar güvenli ekle)
ALTER TABLE players ADD COLUMN IF NOT EXISTS rating_start_of_season INTEGER DEFAULT 0;

-- 5. uniq_match_session_fixture constraint (önceki migration'dan — tekrar güvenli ekle)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uniq_match_session_fixture') THEN
    ALTER TABLE match_sessions ADD CONSTRAINT uniq_match_session_fixture UNIQUE (fixture_id);
  END IF;
END $$;

-- ============================================================
-- Tamamlandı ✓
-- ============================================================
