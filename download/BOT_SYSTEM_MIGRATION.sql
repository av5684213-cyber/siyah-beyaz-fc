-- =============================================
-- BOT SİSTEMİ VERİTABANI MİGRASYONU
-- =============================================

-- 1. profiles tablosuna bot kolonları ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bot_difficulty INTEGER DEFAULT 1;

-- 2. league_teams tablosuna bot kolonu ekle (profil referansı yerine doğrudan)
ALTER TABLE league_teams ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;

-- 3. Bot profilleri için indeks
CREATE INDEX IF NOT EXISTS idx_profiles_is_bot ON profiles(is_bot) WHERE is_bot = true;

-- 4. Mevcut NPC takımları bot olarak işaretle (profile_id'si olan ve is_npc=false olanlar zaten gerçek kullanıcı)
-- league_teams'de is_npc=true olan ve profile_id'si olan takımlar bot kontrolü yapalım
UPDATE profiles SET is_bot = true
WHERE id IN (
  SELECT lt.profile_id FROM league_teams lt
  WHERE lt.is_npc = true AND lt.profile_id IS NOT NULL
);

-- 5. league_teams'de is_npc olanları da bot olarak işaretle
UPDATE league_teams SET is_bot = true WHERE is_npc = true;
