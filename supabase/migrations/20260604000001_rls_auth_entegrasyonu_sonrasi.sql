-- ═══════════════════════════════════════════════════════════════════════════
-- Touchline Manager — RLS Politikaları (Supabase Auth Entegrasyonu Sonrası)
-- Tarih: 2026-06-04
-- Migration: 20260604000001
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ⚠️⚠️⚠️ ÖNEMLİ UYARI ⚠️⚠️⚠️
--
--   BU MİGRASYON HENÜZ UYGULANMAMALIDIR!
--
--   Neden: Uygulama şu anda Supabase Auth kullanmıyor. Kayıt işlemi
--   client-generated userId ile yapılıyor, auth.uid() her zaman NULL döner.
--   Bu migration'ı uygulamak TÜM veri erişimini engeller.
--
--   Uygulama Şartları:
--   1. Supabase Auth entegrasyonu yapılmalı (signIn/signUp)
--   2. profiles.id = auth.uid()::text eşleşmeli
--   3. API route'ları createServerClient() kullanmalı (cookie-based auth)
--   4. Mevcut kullanıcıların profiles.id'si auth.uid() ile eşleştirilmeli
--
--   Auth entegrasyonu tamamlandığında bu dosyayı Supabase Dashboard →
--   SQL Editor'de çalıştırın veya `npx supabase db push` yapın.
--
-- MİGRASYON GEÇMİŞİ:
--   - 20260501000000: USING (true) — tamamen açık
--   - 20260529000011: auth.uid()::text ile gerçek RLS (DOĞRU kolon adları)
--   - 20260529000013: HATALI — auth_id, seller_profile_id, matches tablosu mevcut değil
--   - 20260603000003: RLS devre dışı bırakıldı (arşivlendi)
--   - 20260604000001: BU DOSYA — 11 ve 13'ü birleştirip düzeltir
--
-- KOLON ADLARI REFERANSI:
--   profiles.id          → TEXT PRIMARY KEY (= auth.uid()::text)
--   players.profile_id   → TEXT (profiles.id referansı)
--   staff.user_id        → TEXT (profiles.id referansı)
--   watchlist.user_id    → TEXT (profiles.id referansı)
--   daily_tasks.user_id  → TEXT (profiles.id referansı)
--   transfer_market.seller_id → TEXT (profiles.id referansı)
--   rental_listings.owner_team_id → TEXT (profiles.id referansı)
--   rental_agreements.owner_team_id, renter_team_id → TEXT
--   team_sponsorships.profile_id → TEXT
--   user_facilities.profile_id → TEXT
--   notification_preferences.profile_id → TEXT
--   notifications.profile_id → TEXT
--   training_state.id    → TEXT (= profiles.id)
--   active_tactics.id    → TEXT (= profiles.id)
--   friendly_matches.profile_id → TEXT
--   friendly_queue.profile_id → TEXT
--   youth_facilities.profile_id → TEXT
--   youth_players.profile_id → TEXT
--   operation_reports.profile_id → TEXT
--   player_achievements.profile_id → TEXT
--   season_awards.profile_id → TEXT
--   training_attendances.profile_id → TEXT
--   push_subscriptions.profile_id → TEXT
--   match_chat.profile_id → TEXT
--   player_development_log.profile_id → TEXT
--   scouted_players.profile_id → TEXT
--   player_career_stats.profile_id → TEXT
--   lab_sessions.profile_id → TEXT
--
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- 0. RLS'yi etkinleştir
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_market ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendly_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendly_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE youth_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE youth_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_development_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouted_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_career_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_sessions ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════════════════
-- KATEGORİ A: Kullanıcıya ait tablolar
-- (Her kullanıcı sadece kendi satırlarına erişebilir)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── A.1: profiles ─────────────────────────────────────────────────
-- Kolon: id (= auth.uid()::text)
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
  DROP POLICY IF EXISTS "profiles_insert_all" ON profiles;
  DROP POLICY IF EXISTS "profiles_update_all" ON profiles;
  DROP POLICY IF EXISTS "profiles_delete_all" ON profiles;
  DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
  DROP POLICY IF EXISTS "profiles_insert_owner" ON profiles;
  DROP POLICY IF EXISTS "profiles_update_owner" ON profiles;
  DROP POLICY IF EXISTS "profiles_delete_owner" ON profiles;
  DROP POLICY IF EXISTS "Kendi profilini oku" ON profiles;
  DROP POLICY IF EXISTS "Kendi profilini guncelle" ON profiles;
  DROP POLICY IF EXISTS "Yeni profil olustur" ON profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);  -- Liderlik tabloları için herkese açık

CREATE POLICY "profiles_insert_owner" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "profiles_update_owner" ON profiles
  FOR UPDATE USING (id = auth.uid()::text);

CREATE POLICY "profiles_delete_owner" ON profiles
  FOR DELETE USING (id = auth.uid()::text);


-- ─── A.2: players ──────────────────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "players_select_all" ON players;
  DROP POLICY IF EXISTS "players_insert_all" ON players;
  DROP POLICY IF EXISTS "players_update_all" ON players;
  DROP POLICY IF EXISTS "players_delete_all" ON players;
  DROP POLICY IF EXISTS "players_select_public" ON players;
  DROP POLICY IF EXISTS "players_insert_owner" ON players;
  DROP POLICY IF EXISTS "players_update_owner" ON players;
  DROP POLICY IF EXISTS "players_delete_owner" ON players;
  DROP POLICY IF EXISTS "Kendi kadrosunu oku" ON players;
  DROP POLICY IF EXISTS "Kendi oyuncusunu ekle" ON players;
  DROP POLICY IF EXISTS "Kendi oyuncusunu guncelle" ON players;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "players_select_public" ON players
  FOR SELECT USING (
    true  -- Transfer listesi, muhalif kadro incelemesi için herkese açık
  );

CREATE POLICY "players_insert_owner" ON players
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "players_update_owner" ON players
  FOR UPDATE USING (
    -- Oyuncunun sahibi veya kiralayan güncelleyebilir
    profile_id = auth.uid()::text
    OR loaned_to_profile_id = auth.uid()::text
  );

CREATE POLICY "players_delete_owner" ON players
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─── A.3: staff ────────────────────────────────────────────────────
-- Kolon: user_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "staff_select_all" ON staff;
  DROP POLICY IF EXISTS "staff_insert_all" ON staff;
  DROP POLICY IF EXISTS "staff_update_all" ON staff;
  DROP POLICY IF EXISTS "staff_delete_all" ON staff;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "staff_select_owner" ON staff
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "staff_insert_owner" ON staff
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "staff_update_owner" ON staff
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "staff_delete_owner" ON staff
  FOR DELETE USING (user_id = auth.uid()::text);


-- ─── A.4: training_state ──────────────────────────────────────────
-- Kolon: id (= profiles.id)
DO $$ BEGIN
  DROP POLICY IF EXISTS "training_state_select_all" ON training_state;
  DROP POLICY IF EXISTS "training_state_insert_all" ON training_state;
  DROP POLICY IF EXISTS "training_state_update_all" ON training_state;
  DROP POLICY IF EXISTS "training_state_delete_all" ON training_state;
  DROP POLICY IF EXISTS "training_state_select_owner" ON training_state;
  DROP POLICY IF EXISTS "training_state_insert_owner" ON training_state;
  DROP POLICY IF EXISTS "training_state_update_owner" ON training_state;
  DROP POLICY IF EXISTS "training_state_delete_owner" ON training_state;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "training_state_select_owner" ON training_state
  FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY "training_state_insert_owner" ON training_state
  FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "training_state_update_owner" ON training_state
  FOR UPDATE USING (id = auth.uid()::text);

CREATE POLICY "training_state_delete_owner" ON training_state
  FOR DELETE USING (id = auth.uid()::text);


-- ─── A.5: active_tactics ──────────────────────────────────────────
-- Kolon: id (= profiles.id)
DO $$ BEGIN
  DROP POLICY IF EXISTS "active_tactics_select_all" ON active_tactics;
  DROP POLICY IF EXISTS "active_tactics_insert_all" ON active_tactics;
  DROP POLICY IF EXISTS "active_tactics_update_all" ON active_tactics;
  DROP POLICY IF EXISTS "active_tactics_delete_all" ON active_tactics;
  DROP POLICY IF EXISTS "active_tactics_select_owner" ON active_tactics;
  DROP POLICY IF EXISTS "active_tactics_insert_owner" ON active_tactics;
  DROP POLICY IF EXISTS "active_tactics_update_owner" ON active_tactics;
  DROP POLICY IF EXISTS "active_tactics_delete_owner" ON active_tactics;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "active_tactics_select_owner" ON active_tactics
  FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY "active_tactics_insert_owner" ON active_tactics
  FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "active_tactics_update_owner" ON active_tactics
  FOR UPDATE USING (id = auth.uid()::text);

CREATE POLICY "active_tactics_delete_owner" ON active_tactics
  FOR DELETE USING (id = auth.uid()::text);


-- ─── A.6: watchlist ───────────────────────────────────────────────
-- Kolon: user_id (profile_id DEĞİL!)
DO $$ BEGIN
  DROP POLICY IF EXISTS "watchlist_select_all" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_insert_all" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_update_all" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_delete_all" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_select_owner" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_insert_owner" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_update_owner" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_delete_owner" ON watchlist;
  DROP POLICY IF EXISTS "Kendi watchlistini oku" ON watchlist;
  DROP POLICY IF EXISTS "Kendi watchlistine ekle" ON watchlist;
  DROP POLICY IF EXISTS "Kendi watchlistini sil" ON watchlist;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "watchlist_select_owner" ON watchlist
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "watchlist_insert_owner" ON watchlist
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "watchlist_delete_owner" ON watchlist
  FOR DELETE USING (user_id = auth.uid()::text);


-- ─── A.7: daily_tasks ─────────────────────────────────────────────
-- Kolon: user_id (profile_id DEĞİL!)
DO $$ BEGIN
  DROP POLICY IF EXISTS "daily_tasks_select_all" ON daily_tasks;
  DROP POLICY IF EXISTS "daily_tasks_insert_all" ON daily_tasks;
  DROP POLICY IF EXISTS "daily_tasks_update_all" ON daily_tasks;
  DROP POLICY IF EXISTS "daily_tasks_delete_all" ON daily_tasks;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "daily_tasks_select_owner" ON daily_tasks
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "daily_tasks_insert_owner" ON daily_tasks
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "daily_tasks_update_owner" ON daily_tasks
  FOR UPDATE USING (user_id = auth.uid()::text);


-- ─── A.8: user_facilities ─────────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "user_facilities_select_all" ON user_facilities;
  DROP POLICY IF EXISTS "user_facilities_insert_all" ON user_facilities;
  DROP POLICY IF EXISTS "user_facilities_update_all" ON user_facilities;
  DROP POLICY IF EXISTS "user_facilities_delete_all" ON user_facilities;
  DROP POLICY IF EXISTS "user_facilities_select_owner" ON user_facilities;
  DROP POLICY IF EXISTS "user_facilities_insert_owner" ON user_facilities;
  DROP POLICY IF EXISTS "user_facilities_update_owner" ON user_facilities;
  DROP POLICY IF EXISTS "user_facilities_delete_owner" ON user_facilities;
  DROP POLICY IF EXISTS "Kendi tesislerini oku" ON user_facilities;
  DROP POLICY IF EXISTS "Kendi tesislerini guncelle" ON user_facilities;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "user_facilities_select_owner" ON user_facilities
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "user_facilities_insert_owner" ON user_facilities
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "user_facilities_update_owner" ON user_facilities
  FOR UPDATE USING (profile_id = auth.uid()::text);


-- ─── A.9: team_sponsorships ────────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "team_sponsorships_select_all" ON team_sponsorships;
  DROP POLICY IF EXISTS "team_sponsorships_insert_all" ON team_sponsorships;
  DROP POLICY IF EXISTS "team_sponsorships_update_all" ON team_sponsorships;
  DROP POLICY IF EXISTS "team_sponsorships_delete_all" ON team_sponsorships;
  DROP POLICY IF EXISTS "team_sponsorships_select_owner" ON team_sponsorships;
  DROP POLICY IF EXISTS "team_sponsorships_insert_owner" ON team_sponsorships;
  DROP POLICY IF EXISTS "team_sponsorships_update_owner" ON team_sponsorships;
  DROP POLICY IF EXISTS "team_sponsorships_delete_owner" ON team_sponsorships;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "team_sponsorships_select_owner" ON team_sponsorships
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "team_sponsorships_insert_owner" ON team_sponsorships
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "team_sponsorships_update_owner" ON team_sponsorships
  FOR UPDATE USING (profile_id = auth.uid()::text);


-- ─── A.10: friendly_matches ───────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "friendly_matches_select_all" ON friendly_matches;
  DROP POLICY IF EXISTS "friendly_matches_insert_all" ON friendly_matches;
  DROP POLICY IF EXISTS "friendly_matches_update_all" ON friendly_matches;
  DROP POLICY IF EXISTS "friendly_matches_delete_all" ON friendly_matches;
  DROP POLICY IF EXISTS "friendly_matches_select_public" ON friendly_matches;
  DROP POLICY IF EXISTS "friendly_matches_insert_owner" ON friendly_matches;
  DROP POLICY IF EXISTS "friendly_matches_update_owner" ON friendly_matches;
  DROP POLICY IF EXISTS "friendly_matches_delete_owner" ON friendly_matches;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "friendly_matches_select_public" ON friendly_matches
  FOR SELECT USING (true);

CREATE POLICY "friendly_matches_insert_owner" ON friendly_matches
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "friendly_matches_update_owner" ON friendly_matches
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "friendly_matches_delete_owner" ON friendly_matches
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─── A.11: friendly_queue ─────────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "friendly_queue_select_all" ON friendly_queue;
  DROP POLICY IF EXISTS "friendly_queue_insert_all" ON friendly_queue;
  DROP POLICY IF EXISTS "friendly_queue_update_all" ON friendly_queue;
  DROP POLICY IF EXISTS "friendly_queue_delete_all" ON friendly_queue;
  DROP POLICY IF EXISTS "friendly_queue_select_owner" ON friendly_queue;
  DROP POLICY IF EXISTS "friendly_queue_insert_owner" ON friendly_queue;
  DROP POLICY IF EXISTS "friendly_queue_update_owner" ON friendly_queue;
  DROP POLICY IF EXISTS "friendly_queue_delete_owner" ON friendly_queue;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "friendly_queue_select_owner" ON friendly_queue
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "friendly_queue_insert_owner" ON friendly_queue
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "friendly_queue_update_owner" ON friendly_queue
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "friendly_queue_delete_owner" ON friendly_queue
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─── A.12: notification_preferences ────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "notif_prefs_select_all" ON notification_preferences;
  DROP POLICY IF EXISTS "notif_prefs_insert_all" ON notification_preferences;
  DROP POLICY IF EXISTS "notif_prefs_update_all" ON notification_preferences;
  DROP POLICY IF EXISTS "notif_prefs_delete_all" ON notification_preferences;
  DROP POLICY IF EXISTS "notification_preferences_select_owner" ON notification_preferences;
  DROP POLICY IF EXISTS "notification_preferences_insert_owner" ON notification_preferences;
  DROP POLICY IF EXISTS "notification_preferences_update_owner" ON notification_preferences;
  DROP POLICY IF EXISTS "notification_preferences_delete_owner" ON notification_preferences;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "notification_preferences_select_owner" ON notification_preferences
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "notification_preferences_insert_owner" ON notification_preferences
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "notification_preferences_update_owner" ON notification_preferences
  FOR UPDATE USING (profile_id = auth.uid()::text);


-- ─── A.13: notifications ──────────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
  DROP POLICY IF EXISTS "notifications_insert_all" ON notifications;
  DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
  DROP POLICY IF EXISTS "notifications_delete_all" ON notifications;
  DROP POLICY IF EXISTS "notifications_select_owner" ON notifications;
  DROP POLICY IF EXISTS "notifications_insert_owner" ON notifications;
  DROP POLICY IF EXISTS "notifications_update_owner" ON notifications;
  DROP POLICY IF EXISTS "notifications_delete_owner" ON notifications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "notifications_select_owner" ON notifications
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "notifications_insert_owner" ON notifications
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "notifications_update_owner" ON notifications
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "notifications_delete_owner" ON notifications
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─── A.14: youth_facilities ───────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "youth_facilities_select_all" ON youth_facilities;
  DROP POLICY IF EXISTS "youth_facilities_insert_all" ON youth_facilities;
  DROP POLICY IF EXISTS "youth_facilities_update_all" ON youth_facilities;
  DROP POLICY IF EXISTS "youth_facilities_delete_all" ON youth_facilities;
  DROP POLICY IF EXISTS "youth_facilities_select_owner" ON youth_facilities;
  DROP POLICY IF EXISTS "youth_facilities_insert_owner" ON youth_facilities;
  DROP POLICY IF EXISTS "youth_facilities_update_owner" ON youth_facilities;
  DROP POLICY IF EXISTS "youth_facilities_delete_owner" ON youth_facilities;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "youth_facilities_select_owner" ON youth_facilities
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "youth_facilities_insert_owner" ON youth_facilities
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "youth_facilities_update_owner" ON youth_facilities
  FOR UPDATE USING (profile_id = auth.uid()::text);


-- ─── A.15: youth_players ──────────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "youth_players_select_all" ON youth_players;
  DROP POLICY IF EXISTS "youth_players_insert_all" ON youth_players;
  DROP POLICY IF EXISTS "youth_players_update_all" ON youth_players;
  DROP POLICY IF EXISTS "youth_players_delete_all" ON youth_players;
  DROP POLICY IF EXISTS "youth_players_select_public" ON youth_players;
  DROP POLICY IF EXISTS "youth_players_insert_owner" ON youth_players;
  DROP POLICY IF EXISTS "youth_players_update_owner" ON youth_players;
  DROP POLICY IF EXISTS "youth_players_delete_owner" ON youth_players;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "youth_players_select_public" ON youth_players
  FOR SELECT USING (true);

CREATE POLICY "youth_players_insert_owner" ON youth_players
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "youth_players_update_owner" ON youth_players
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "youth_players_delete_owner" ON youth_players
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─── A.16: operation_reports ──────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "operation_reports_select_all" ON operation_reports;
  DROP POLICY IF EXISTS "operation_reports_insert_all" ON operation_reports;
  DROP POLICY IF EXISTS "operation_reports_update_all" ON operation_reports;
  DROP POLICY IF EXISTS "operation_reports_delete_all" ON operation_reports;
  DROP POLICY IF EXISTS "operation_reports_select_owner" ON operation_reports;
  DROP POLICY IF EXISTS "operation_reports_insert_owner" ON operation_reports;
  DROP POLICY IF EXISTS "operation_reports_update_owner" ON operation_reports;
  DROP POLICY IF EXISTS "operation_reports_delete_owner" ON operation_reports;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "operation_reports_select_owner" ON operation_reports
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "operation_reports_insert_owner" ON operation_reports
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "operation_reports_update_owner" ON operation_reports
  FOR UPDATE USING (profile_id = auth.uid()::text);


-- ─── A.17: player_achievements ────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "player_achievements_select_all" ON player_achievements;
  DROP POLICY IF EXISTS "player_achievements_insert_all" ON player_achievements;
  DROP POLICY IF EXISTS "player_achievements_update_all" ON player_achievements;
  DROP POLICY IF EXISTS "player_achievements_delete_all" ON player_achievements;
  DROP POLICY IF EXISTS "player_achievements_select_public" ON player_achievements;
  DROP POLICY IF EXISTS "player_achievements_insert_owner" ON player_achievements;
  DROP POLICY IF EXISTS "player_achievements_update_owner" ON player_achievements;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "player_achievements_select_public" ON player_achievements
  FOR SELECT USING (true);

CREATE POLICY "player_achievements_insert_owner" ON player_achievements
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "player_achievements_update_owner" ON player_achievements
  FOR UPDATE USING (profile_id = auth.uid()::text);


-- ─── A.18: season_awards ──────────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "season_awards_select_all" ON season_awards;
  DROP POLICY IF EXISTS "season_awards_insert_all" ON season_awards;
  DROP POLICY IF EXISTS "season_awards_update_all" ON season_awards;
  DROP POLICY IF EXISTS "season_awards_delete_all" ON season_awards;
  DROP POLICY IF EXISTS "season_awards_select_public" ON season_awards;
  DROP POLICY IF EXISTS "season_awards_insert_owner" ON season_awards;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "season_awards_select_public" ON season_awards
  FOR SELECT USING (true);

CREATE POLICY "season_awards_insert_owner" ON season_awards
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);


-- ─── A.19: training_attendances ───────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "training_attendances_select_all" ON training_attendances;
  DROP POLICY IF EXISTS "training_attendances_insert_all" ON training_attendances;
  DROP POLICY IF EXISTS "training_attendances_update_all" ON training_attendances;
  DROP POLICY IF EXISTS "training_attendances_delete_all" ON training_attendances;
  DROP POLICY IF EXISTS "training_attendances_select_owner" ON training_attendances;
  DROP POLICY IF EXISTS "training_attendances_insert_owner" ON training_attendances;
  DROP POLICY IF EXISTS "training_attendances_update_owner" ON training_attendances;
  DROP POLICY IF EXISTS "training_attendances_delete_owner" ON training_attendances;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "training_attendances_select_owner" ON training_attendances
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "training_attendances_insert_owner" ON training_attendances
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "training_attendances_update_owner" ON training_attendances
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "training_attendances_delete_owner" ON training_attendances
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─── A.20: push_subscriptions ─────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "push_subs_select_all" ON push_subscriptions;
  DROP POLICY IF EXISTS "push_subs_insert_all" ON push_subscriptions;
  DROP POLICY IF EXISTS "push_subs_update_all" ON push_subscriptions;
  DROP POLICY IF EXISTS "push_subs_delete_all" ON push_subscriptions;
  DROP POLICY IF EXISTS "push_subscriptions_select_owner" ON push_subscriptions;
  DROP POLICY IF EXISTS "push_subscriptions_insert_owner" ON push_subscriptions;
  DROP POLICY IF EXISTS "push_subscriptions_update_owner" ON push_subscriptions;
  DROP POLICY IF EXISTS "push_subscriptions_delete_owner" ON push_subscriptions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "push_subscriptions_select_owner" ON push_subscriptions
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "push_subscriptions_insert_owner" ON push_subscriptions
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "push_subscriptions_update_owner" ON push_subscriptions
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "push_subscriptions_delete_owner" ON push_subscriptions
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─── A.21: scouted_players ────────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "scouted_players_select_all" ON scouted_players;
  DROP POLICY IF EXISTS "scouted_players_insert_all" ON scouted_players;
  DROP POLICY IF EXISTS "scouted_players_update_all" ON scouted_players;
  DROP POLICY IF EXISTS "scouted_players_delete_all" ON scouted_players;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "scouted_players_select_owner" ON scouted_players
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "scouted_players_insert_owner" ON scouted_players
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "scouted_players_update_owner" ON scouted_players
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "scouted_players_delete_owner" ON scouted_players
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─── A.22: player_career_stats ────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "player_career_stats_select_all" ON player_career_stats;
  DROP POLICY IF EXISTS "player_career_stats_insert_all" ON player_career_stats;
  DROP POLICY IF EXISTS "player_career_stats_update_all" ON player_career_stats;
  DROP POLICY IF EXISTS "player_career_stats_delete_all" ON player_career_stats;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "player_career_stats_select_owner" ON player_career_stats
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "player_career_stats_insert_owner" ON player_career_stats
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "player_career_stats_update_owner" ON player_career_stats
  FOR UPDATE USING (profile_id = auth.uid()::text);


-- ─── A.23: lab_sessions ──────────────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "lab_sessions_select_all" ON lab_sessions;
  DROP POLICY IF EXISTS "lab_sessions_insert_all" ON lab_sessions;
  DROP POLICY IF EXISTS "lab_sessions_update_all" ON lab_sessions;
  DROP POLICY IF EXISTS "lab_sessions_delete_all" ON lab_sessions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "lab_sessions_select_owner" ON lab_sessions
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "lab_sessions_insert_owner" ON lab_sessions
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "lab_sessions_update_owner" ON lab_sessions
  FOR UPDATE USING (profile_id = auth.uid()::text);


-- ─── A.24: player_development_log ─────────────────────────────────
-- Kolon: profile_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "player_development_log_select_all" ON player_development_log;
  DROP POLICY IF EXISTS "player_development_log_insert_all" ON player_development_log;
  DROP POLICY IF EXISTS "player_development_log_update_all" ON player_development_log;
  DROP POLICY IF EXISTS "player_development_log_delete_all" ON player_development_log;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "player_development_log_select_owner" ON player_development_log
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "player_development_log_insert_owner" ON player_development_log
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);


-- ═══════════════════════════════════════════════════════════════════════════
-- KATEGORİ B: Herkese okunur, service_role yazabilir (lig verileri)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── B.1-B.13: Lig tabloları ──────────────────────────────────────
-- Tüm lig tabloları için aynı patern: SELECT=public, yazma=service_role
-- leagues, league_teams, seasons, league_standings, fixtures,
-- match_history, match_events, match_participants, match_sessions,
-- live_matches, match_simulation_queue, referees

DO $$
DECLARE
  tbl TEXT;
  policy_prefix TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'leagues', 'league_teams', 'seasons', 'league_standings',
    'fixtures', 'match_history', 'match_events', 'match_participants',
    'match_sessions', 'live_matches', 'match_simulation_queue', 'referees'
  ]
  LOOP
    -- Eski politikaları temizle
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_select_all', tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_insert_all', tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_update_all', tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_delete_all', tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_select_public', tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_insert_service', tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_update_service', tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_delete_service', tbl);
      -- Türkçe isimli eski politikalar
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Lig takimlarini oku', tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Kendi takimini guncelle', tbl);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Yeni politikalar
    BEGIN
      EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (true)', tbl || '_select_public', tbl);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
      EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (auth.role() = ''service_role'')', tbl || '_insert_service', tbl);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
      EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (auth.role() = ''service_role'')', tbl || '_update_service', tbl);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
      EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (auth.role() = ''service_role'')', tbl || '_delete_service', tbl);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END;
$$;


-- ─── B.14: match_chat ─────────────────────────────────────────────
-- Kolon: profile_id — SELECT: herkese açık, INSERT/UPDATE/DELETE: sahip
DO $$ BEGIN
  DROP POLICY IF EXISTS "match_chat_select_all" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_insert_all" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_insert_own" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_delete_own" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_update_all" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_delete_all" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_select_public" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_insert_owner" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_update_owner" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_delete_owner" ON match_chat;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "match_chat_select_public" ON match_chat
  FOR SELECT USING (true);

CREATE POLICY "match_chat_insert_owner" ON match_chat
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "match_chat_update_owner" ON match_chat
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "match_chat_delete_owner" ON match_chat
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ═══════════════════════════════════════════════════════════════════════════
-- KATEGORİ C: Karmaşık sahiplik (transfer, kiralama, lira)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── C.1: transfer_market ─────────────────────────────────────────
-- Kolon: seller_id (NOT seller_profile_id!)
DO $$ BEGIN
  DROP POLICY IF EXISTS "transfer_market_select_all" ON transfer_market;
  DROP POLICY IF EXISTS "transfer_market_insert_all" ON transfer_market;
  DROP POLICY IF EXISTS "transfer_market_update_all" ON transfer_market;
  DROP POLICY IF EXISTS "transfer_market_delete_all" ON transfer_market;
  DROP POLICY IF EXISTS "Transfer ilanlarini oku" ON transfer_market;
  DROP POLICY IF EXISTS "Kendi ilanini ekle" ON transfer_market;
  DROP POLICY IF EXISTS "Kendi ilanini guncelle" ON transfer_market;
  DROP POLICY IF EXISTS "Kendi ilanini sil" ON transfer_market;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "transfer_market_select_public" ON transfer_market
  FOR SELECT USING (true);  -- Aktif ilanlar herkese görünür

CREATE POLICY "transfer_market_insert_owner" ON transfer_market
  FOR INSERT WITH CHECK (seller_id = auth.uid()::text);

CREATE POLICY "transfer_market_update_owner" ON transfer_market
  FOR UPDATE USING (seller_id = auth.uid()::text OR auth.role() = 'service_role');

CREATE POLICY "transfer_market_delete_owner" ON transfer_market
  FOR DELETE USING (seller_id = auth.uid()::text OR auth.role() = 'service_role');


-- ─── C.2: rental_listings ─────────────────────────────────────────
-- Kolon: owner_team_id (= profile_id referansı)
DO $$ BEGIN
  DROP POLICY IF EXISTS "rental_listings_select_all" ON rental_listings;
  DROP POLICY IF EXISTS "rental_listings_insert_all" ON rental_listings;
  DROP POLICY IF EXISTS "rental_listings_update_all" ON rental_listings;
  DROP POLICY IF EXISTS "rental_listings_delete_all" ON rental_listings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "rental_listings_select_public" ON rental_listings
  FOR SELECT USING (true);  -- Aktif ilanlar herkese görünür

CREATE POLICY "rental_listings_insert_owner" ON rental_listings
  FOR INSERT WITH CHECK (owner_team_id = auth.uid()::text);

CREATE POLICY "rental_listings_update_owner" ON rental_listings
  FOR UPDATE USING (owner_team_id = auth.uid()::text OR auth.role() = 'service_role');

CREATE POLICY "rental_listings_delete_owner" ON rental_listings
  FOR DELETE USING (owner_team_id = auth.uid()::text OR auth.role() = 'service_role');


-- ─── C.3: rental_agreements ───────────────────────────────────────
-- Kolon: owner_team_id, renter_team_id
DO $$ BEGIN
  DROP POLICY IF EXISTS "rental_agreements_select_all" ON rental_agreements;
  DROP POLICY IF EXISTS "rental_agreements_insert_all" ON rental_agreements;
  DROP POLICY IF EXISTS "rental_agreements_update_all" ON rental_agreements;
  DROP POLICY IF EXISTS "rental_agreements_delete_all" ON rental_agreements;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "rental_agreements_select_owner" ON rental_agreements
  FOR SELECT USING (
    owner_team_id = auth.uid()::text
    OR renter_team_id = auth.uid()::text
  );

CREATE POLICY "rental_agreements_insert_owner" ON rental_agreements
  FOR INSERT WITH CHECK (renter_team_id = auth.uid()::text);

CREATE POLICY "rental_agreements_update_owner" ON rental_agreements
  FOR UPDATE USING (owner_team_id = auth.uid()::text OR auth.role() = 'service_role');


-- ─── C.4: loans ──────────────────────────────────────────────────
-- Sadece service_role erişebilir (cron job'lar yönetir)
DO $$ BEGIN
  DROP POLICY IF EXISTS "loans_select_all" ON loans;
  DROP POLICY IF EXISTS "loans_insert_all" ON loans;
  DROP POLICY IF EXISTS "loans_update_all" ON loans;
  DROP POLICY IF EXISTS "loans_delete_all" ON loans;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "loans_select_owner_or_service" ON loans
  FOR SELECT USING (
    owner_team_id = auth.uid()::text
    OR auth.role() = 'service_role'
  );

CREATE POLICY "loans_insert_service" ON loans
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "loans_update_service" ON loans
  FOR UPDATE USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════════════════
-- KATEGORİ D: Sadece service_role (sistem tabloları)
-- ═══════════════════════════════════════════════════════════════════════════

-- cron_locks, rate_limits, weekly_evolution_logs
DO $$ BEGIN
  DROP POLICY IF EXISTS "cron_locks_select_all" ON cron_locks;
  DROP POLICY IF EXISTS "cron_locks_insert_all" ON cron_locks;
  DROP POLICY IF EXISTS "cron_locks_update_all" ON cron_locks;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "cron_locks_service" ON cron_locks
  FOR ALL USING (auth.role() = 'service_role');

DO $$ BEGIN
  DROP POLICY IF EXISTS "rate_limits_select_all" ON rate_limits;
  DROP POLICY IF EXISTS "rate_limits_insert_all" ON rate_limits;
  DROP POLICY IF EXISTS "rate_limits_update_all" ON rate_limits;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "rate_limits_service" ON rate_limits
  FOR ALL USING (auth.role() = 'service_role');

DO $$ BEGIN
  DROP POLICY IF EXISTS "weekly_evolution_logs_select_all" ON weekly_evolution_logs;
  DROP POLICY IF EXISTS "weekly_evolution_logs_insert_all" ON weekly_evolution_logs;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "weekly_evolution_logs_service" ON weekly_evolution_logs
  FOR ALL USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════════════════
-- NOT: Eski HATALI migration 20260529000013_rls_policies.sql'deki sorunlar:
--   1. auth_id kolonu profiles tablosunda YOK → id kullanılmalı
--   2. seller_profile_id transfer_market'ta YOK → seller_id kullanılmalı
--   3. matches tablosu mevcut DEĞİL → fixtures kullanılmalı
--   4. watchlist.profile_id YOK → user_id kullanılmalı
-- Bu migration o hataları düzeltir.
-- ═══════════════════════════════════════════════════════════════════════════
