-- ==================================================================
-- TÜM OYUNCU VERİLERİNİ SİL — YENİDEN BAŞLA
-- ==================================================================
-- Bu script tüm kullanıcı takımlarını, oyuncularını, fikstürlerini
-- ve e-posta adreslerini siler. Bot takımları KORUR (lig yapısı bozulmasın).
--
-- Supabase Dashboard > SQL Editor > New query buraya yapıştır > Run
-- ==================================================================

-- ─── 0. Yedek almak istersen önce bu tabloları export et ───
-- (Supabase Dashboard > Database > Table Editor > Export CSV)

-- ─── 1. İlişkili tabloları temizle ───
-- Önce foreign key bağlı tablolar, sonra ana tablolar silinmeli

-- Maç olayları, istatistikler
DELETE FROM match_events WHERE match_id IN (SELECT id FROM match_sessions);
DELETE FROM match_player_stats WHERE match_id IN (SELECT id FROM match_sessions);

-- Maç oturumları
DELETE FROM match_sessions;

-- Fikstürler (bot'lara ait olanları bile sil - sezon sıfırlansın)
DELETE FROM fixtures;

-- Sezonlar
DELETE FROM seasons;

-- Oyuncular (sadece gerçek kullanıcılar — botlar korunur)
DELETE FROM players
WHERE profile_id IN (
  SELECT id FROM profiles WHERE is_bot = false
);

-- Aktif taktikler
DELETE FROM active_tactics
WHERE id IN (SELECT id FROM profiles WHERE is_bot = false);

-- Antrenman durumları
DELETE FROM training_state
WHERE id IN (SELECT id FROM profiles WHERE is_bot = false);

-- Diğer ilişkili tabloları temizle (varsa)
DELETE FROM user_facilities WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM watchlist WHERE user_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM staff WHERE user_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM notifications WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM daily_tasks WHERE user_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM scouted_players WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM player_career_stats WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM user_academy WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM team_sponsorships WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM agent_messages WHERE user_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM manager_messages WHERE sender_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM manager_conversations WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM operation_reports WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM loan_listings WHERE owner_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM transfer_market WHERE seller_id IN (SELECT id FROM profiles WHERE is_bot = false);

-- ─── 2. League_teams tablosundaki gerçek kullanıcı kayıtlarını bot'a geri çevir ───
-- Bu sayede bot takım slot'ları boşalır ve yeni kullanıcılara tahsis edilebilir
UPDATE league_teams
SET profile_id = NULL,
    is_bot = true,
    bot_difficulty = COALESCE(bot_difficulty, 'medium')
WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);

-- ─── 3. Tüm GERÇEK KULLANICI profillerini sil ───
-- selimporsuk@gmail.com DAHIL — kayıt olduktan sonra yeniden admin olacak
DELETE FROM profiles WHERE is_bot = false;

-- ─── 4. Supabase Auth kullanıcılarını sil ───
-- auth.users tablosu silinmedi — bunu manuel yapman gerek:
-- Supabase Dashboard > Authentication > Users
-- Tüm kullanıcıları seç → Delete

-- VEYA bu RPC'yi çalıştır (eğer service role key'in varsa):
-- DO $$
-- DECLARE user_record RECORD;
-- BEGIN
--   FOR user_record IN SELECT id FROM auth.users LOOP
--     EXECUTE 'DROP USER IF EXISTS auth.' || quote_ident(user_record.id::text);
--   END LOOP;
-- END $$;
--
-- NOT: auth.users silmek için Admin SQL Editor'da çalıştır (service role key gerekir).
-- En güvenli yöntem: Dashboard > Authentication > Users > Toplu sil.

-- ─── 5. Doğrulama ───
SELECT 'PROFILES (toplam):' as info, COUNT(*) as count FROM profiles;
SELECT 'BOT PROFILES:' as info, COUNT(*) as count FROM profiles WHERE is_bot = true;
SELECT 'REAL PROFILES:' as info, COUNT(*) as count FROM profiles WHERE is_bot = false;
SELECT 'LEAGUE_TEAMS (toplam):' as info, COUNT(*) as count FROM league_teams;
SELECT 'BOT TEAMS (profile_id NULL):' as info, COUNT(*) as count FROM league_teams WHERE is_bot = true AND profile_id IS NULL;
SELECT 'PLAYERS (toplam):' as info, COUNT(*) as count FROM players;
SELECT 'FIXTURES (toplam):' as info, COUNT(*) as count FROM fixtures;
SELECT 'SEASONS (toplam):' as info, COUNT(*) as count FROM seasons;

-- ─── 6. Yeni sezon oluştur (ligler için) ───
-- Bu kısım opsiyonel — uygulama otomatik sezon oluşturacak.
-- Bot takımları korunarak lig yapısı bozulmadan yeni sezon başlatılır.

-- ==================================================================
-- TAMAMLANDI. artık:
-- 1. Tüm eski kullanıcılar silindi (mailler dahil)
-- 2. Bot takımları korundu (yeni kullanıcılara tahsis edilebilir)
-- 3. auth.users içindekileri Dashboard'dan manuel sil
-- 4. selimporsuk@gmail.com ile kayıt ol → otomatik admin/owner olacak
-- ==================================================================
