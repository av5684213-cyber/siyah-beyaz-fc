-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX: profile_id sütun eksik hatalarını düzelt
-- Tarih: 2026-05-29
-- ═══════════════════════════════════════════════════════════════════════════════
-- Sorun: staff tablosunda user_id var ama kod profile_id ile sorguluyor
-- Çözüm: profile_id sütununu ekle (user_id ile aynı veriyi işaret eder)
-- Ayrıca diğer tablolarda da eksik profile_id referanslarını düzelt
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. staff tablosuna profile_id ekle (user_id ile aynı, geriye uyumlu)
ALTER TABLE staff ADD COLUMN IF NOT EXISTS profile_id TEXT;

-- Mevcut user_id verilerini profile_id'ye kopyala
UPDATE staff SET profile_id = user_id WHERE profile_id IS NULL AND user_id IS NOT NULL;

-- profile_id için index oluştur
CREATE INDEX IF NOT EXISTS idx_staff_profile_id ON staff(profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_profile_type ON staff(profile_id, type);

-- 2. active_tactics tablosu profile_id kontrolü
ALTER TABLE active_tactics ADD COLUMN IF NOT EXISTS profile_id TEXT;
CREATE INDEX IF NOT EXISTS idx_active_tactics_profile_id ON active_tactics(profile_id);

-- 3. training_state tablosu profile_id kontrolü
ALTER TABLE training_state ADD COLUMN IF NOT EXISTS profile_id TEXT;
CREATE INDEX IF NOT EXISTS idx_training_state_profile_id ON training_state(profile_id);

-- 4. user_facilities tablosu profile_id kontrolü
ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS profile_id TEXT;
CREATE INDEX IF NOT EXISTS idx_user_facilities_profile_id ON user_facilities(profile_id);

-- 5. notifications tablosu profile_id kontrolü
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS profile_id TEXT;
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);

-- 6. push_subscriptions tablosu profile_id kontrolü
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS profile_id TEXT;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_profile_id ON push_subscriptions(profile_id);

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
