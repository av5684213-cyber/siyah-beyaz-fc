-- ==================================================================
-- TÜM OYUNCU VERİLERİNİ SİL — YENİDEN BAŞLA
-- ==================================================================
-- Bu script tüm kullanıcı takımlarını, oyuncularını, fikstürlerini
-- ve e-posta adreslerini siler. Bot takımları KORUR (lig yapısı bozulmasın).
--
-- Supabase Dashboard > SQL Editor > New query buraya yapıştır > Run
-- ==================================================================

-- ─── 1. İlişkili tabloları temizle ───
DELETE FROM match_events;
DELETE FROM match_sessions;
DELETE FROM fixtures;
DELETE FROM seasons;
DELETE FROM player_development_log;
DELETE FROM player_career_stats;
DELETE FROM transfer_market;
DELETE FROM loan_listings;

-- ─── 2. Sadece gerçek kullanıcılara ait verileri sil (botlar korunur) ───
DELETE FROM players WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM active_tactics WHERE id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM training_state WHERE id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM user_facilities WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM user_academy WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM watchlist WHERE user_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM staff WHERE user_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM notifications WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM notification_preferences WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM daily_tasks WHERE user_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM scouted_players WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM team_sponsorships WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM agent_messages WHERE user_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM manager_messages WHERE sender_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM manager_messages WHERE receiver_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM manager_conversations WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM manager_conversations WHERE other_profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM operation_reports WHERE user_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM financial_health WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM season_records WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM active_operations WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM player_insurance WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM trophy_cabinet WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM hall_of_fame WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM match_chat WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);
DELETE FROM push_subscriptions WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);

-- ─── 3. League_teams kayıtlarını bot'a geri çevir (slot'lar boşalsın) ───
UPDATE league_teams
SET profile_id = NULL,
    is_bot = true,
    is_npc = true,
    bot_difficulty = COALESCE(bot_difficulty, 'medium')
WHERE profile_id IN (SELECT id FROM profiles WHERE is_bot = false);

-- ─── 4. Tüm GERÇEK KULLANICI profillerini sil ───
-- selimporsuk@gmail.com DAHİL — kayıt olduktan sonra yeniden admin olacak
DELETE FROM profiles WHERE is_bot = false;

-- ─── 5. auth.users içindeki kullanıcıları manuel sil ───
-- Bu SQL ile yapılamaz (auth şeması kısıtlı).
-- Supabase Dashboard > Authentication > Users > tümünü seç > Delete

-- ─── 6. Doğrulama ───
SELECT 'PROFILES (toplam):' as info, COUNT(*) as count FROM profiles;
SELECT 'BOT PROFILES:' as info, COUNT(*) as count FROM profiles WHERE is_bot = true;
SELECT 'REAL PROFILES:' as info, COUNT(*) as count FROM profiles WHERE is_bot = false;
SELECT 'LEAGUE_TEAMS (toplam):' as info, COUNT(*) as count FROM league_teams;
SELECT 'BOT TEAMS (profile_id NULL):' as info, COUNT(*) as count FROM league_teams WHERE is_bot = true AND profile_id IS NULL;
SELECT 'PLAYERS (toplam):' as info, COUNT(*) as count FROM players;
SELECT 'FIXTURES (toplam):' as info, COUNT(*) as count FROM fixtures;
SELECT 'SEASONS (toplam):' as info, COUNT(*) as count FROM seasons;
SELECT 'STAFF (toplam):' as info, COUNT(*) as count FROM staff;
SELECT 'STAFF_TYPES:' as info, COUNT(*) as count FROM staff_types;

-- ==================================================================
-- TAMAMLANDI. Artık:
-- 1. Tüm eski kullanıcılar silindi (mailler dahil)
-- 2. Bot takımları korundu (yeni kullanıcılara tahsis edilebilir)
-- 3. auth.users içindekileri Dashboard > Authentication > Users > toplu sil
-- 4. selimporsuk@gmail.com ile kayıt ol → otomatik admin/owner olacak
-- ==================================================================
