-- ═══════════════════════════════════════════════════════════════════════
-- MGCOIN → KREDİ SİSTEMİ MİGRASYONU
-- mg_coins sütununu credits olarak yeniden adlandır
-- academy_upgrade_costs tablosu oluştur
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 1. profiles tablosundaki mg_coins → credits ─────────────────────
-- Eğer credits sütunu yoksa ekle, mg_coins'ten veri taşı, mg_coins'i kaldır

-- Adım 1a: credits sütunu ekle (yoksa)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 250;

-- Adım 1b: mg_coins verilerini credits'e taşı (sadece credits NULL ise)
UPDATE profiles SET credits = mg_coins WHERE credits IS NULL AND mg_coins IS NOT NULL;

-- Adım 1c: mg_coins sütununu kaldır
ALTER TABLE profiles DROP COLUMN IF EXISTS mg_coins;

-- ─── 2. academy_upgrade_costs tablosu ────────────────────────────────
-- Akademi yükseltme maliyet tablosu
DROP TABLE IF EXISTS academy_upgrade_costs CASCADE;

CREATE TABLE academy_upgrade_costs (
  level                    INTEGER PRIMARY KEY,          -- Hedef seviye (1-10)
  upgrade_days             INTEGER NOT NULL,             -- Kaç gün sürer
  credits_cost             INTEGER NOT NULL,             -- Normal yükseltme kredi maliyeti
  instant_half_credits_cost INTEGER NOT NULL DEFAULT 5   -- Süreyi yarıya indirmek için kredi
);

-- Seviye maliyetleri
INSERT INTO academy_upgrade_costs (level, upgrade_days, credits_cost, instant_half_credits_cost) VALUES
  (1,  2,   0,   2),   -- Seviye 1 ücretsiz başlangıç
  (2,  3,   5,   3),
  (3,  4,   10,  4),
  (4,  5,   20,  5),
  (5,  7,   35,  7),
  (6,  9,   50,  8),
  (7,  12,  75,  10),
  (8,  15,  100, 12),
  (9,  18,  150, 15),
  (10, 21,  250, 20);

-- ─── 3. user_academy tablosu ─────────────────────────────────────────
-- Kullanıcı bazlı akademi yükseltme takibi (realtime countdown için)
DROP TABLE IF EXISTS user_academy CASCADE;

CREATE TABLE user_academy (
  profile_id          TEXT PRIMARY KEY,              -- profiles.id referansı (TEXT tipi)
  current_level       INTEGER NOT NULL DEFAULT 1,    -- Mevcut akademi seviyesi
  upgrade_started_at  TIMESTAMPTZ,                   -- Yükseltme başlangıç zamanı (NULL = yükseltme yok)
  upgrade_end_at      TIMESTAMPTZ,                   -- Yükseltme bitiş zamanı (NULL = yükseltme yok)
  speed_up_used       BOOLEAN NOT NULL DEFAULT FALSE, -- Hızlandırma kullanıldı mı?
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_user_academy_profile_id ON user_academy(profile_id);
CREATE INDEX idx_user_academy_upgrade_end ON user_academy(upgrade_end_at) WHERE upgrade_end_at IS NOT NULL;

-- RLS
ALTER TABLE user_academy ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_academy_select ON user_academy
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY user_academy_insert ON user_academy
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY user_academy_update ON user_academy
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY user_academy_service ON user_academy
  FOR ALL USING (true) WITH CHECK (true);

-- ─── 4. error_logs tablosu ────────────────────────────────────────────
-- Merkezi loglama sistemi için hata kayıtları
CREATE TABLE IF NOT EXISTS error_logs (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source      TEXT NOT NULL,           -- 'api', 'python', 'frontend', 'cron'
  level       TEXT NOT NULL DEFAULT 'error',  -- 'debug', 'info', 'warn', 'error', 'fatal'
  message     TEXT NOT NULL,
  stack_trace TEXT,
  context     JSONB DEFAULT '{}',      -- Ek bağlam verisi
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: Kaynak ve seviye ile filtreleme
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON error_logs(source);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);

-- error_logs tablosu RLS gerektirmez (sadece service role erişir)
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY error_logs_service ON error_logs
  FOR ALL USING (true) WITH CHECK (true);
