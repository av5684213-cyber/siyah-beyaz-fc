-- ═══════════════════════════════════════════════════════════════════════════
-- Touchline Manager — GERÇEK RLS (Satır Seviyesi Güvenlik) MİGRASYONU
-- Tarih: 2026-05-29
-- Migration: 20260529000011
-- ═══════════════════════════════════════════════════════════════════════════
--
-- AÇIKLAMA:
--   43 tablodaki USING (true) politikalarını gerçek auth.uid()::text
--   kontrolü yapan politikalarla değiştirir. Her kullanıcı sadece kendi
--   verilerine erişebilir; lig verileri herkese okunur, yazma sadece
--   service_role ile.
--
-- RİSK SEVİYESİ: YÜKSEK
--   - Mevcut tüm USING (true) politikaları kaldırılıyor
--   - Yanlış kolon adı veya eksik auth.uid() durumu veri erişimini kesebilir
--   - Uygulama tarafında service_role kullanan API route'ları etkilenmez
--   - Frontend doğrudan Supabase client ile erişiyorsa kırılabilir
--
-- ÖN KOŞULLAR:
--   - profiles.id = TEXT (Supabase Auth user ID string olarak saklanır)
--   - auth.uid()::text ile karşılaştırma yapılmalıdır
--   - service_role kontrolü: auth.role() = 'service_role'
--
-- ATLANAN TABLOLAR (zaten doğru RLS'e sahip):
--   - scouted_players (profile_id = auth.uid()::text)
--   - player_career_stats (profile_id = auth.uid()::text)
--   - lab_sessions (profile_id = auth.uid()::text)
--   - staff (user_id = auth.uid()::text)
--   - cron_locks (service_role only)
--   - rate_limits (service_role only)
--   - weekly_evolution_logs (service_role only)
--
-- POLİTİKA ADLANDIRMA KURALI:
--   {tablo}_{işlem}_{yetki_seviyesi}
--   Örnek: profiles_select_public, profiles_update_owner
--
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- KATEGORİ A: Kullanıcıya ait tablolar
-- (Kullanıcı sadece kendi satırlarına erişebilir)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- A.1: profiles — SELECT: herkese açık, INSERT/UPDATE/DELETE: sadece sahip
-- Kolon: id (TEXT, profiles.id = auth.uid()::text)
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
  DROP POLICY IF EXISTS "profiles_insert_all" ON profiles;
  DROP POLICY IF EXISTS "profiles_update_all" ON profiles;
  DROP POLICY IF EXISTS "profiles_delete_all" ON profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_owner" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "profiles_update_owner" ON profiles
  FOR UPDATE USING (id = auth.uid()::text);

CREATE POLICY "profiles_delete_owner" ON profiles
  FOR DELETE USING (id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- A.2: players — SELECT: herkese açık, INSERT/UPDATE/DELETE: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "players_select_all" ON players;
  DROP POLICY IF EXISTS "players_insert_all" ON players;
  DROP POLICY IF EXISTS "players_update_all" ON players;
  DROP POLICY IF EXISTS "players_delete_all" ON players;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "players_select_public" ON players
  FOR SELECT USING (true);

CREATE POLICY "players_insert_owner" ON players
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "players_update_owner" ON players
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "players_delete_owner" ON players
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- A.3: training_state — tüm işlemler: sadece sahip
-- Kolon: id (TEXT PRIMARY KEY = profiles.id)
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "training_state_select_all" ON training_state;
  DROP POLICY IF EXISTS "training_state_insert_all" ON training_state;
  DROP POLICY IF EXISTS "training_state_update_all" ON training_state;
  DROP POLICY IF EXISTS "training_state_delete_all" ON training_state;
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


-- ─────────────────────────────────────────────────────────────────────────
-- A.4: active_tactics — tüm işlemler: sadece sahip
-- Kolon: id (TEXT PRIMARY KEY = profiles.id)
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "active_tactics_select_all" ON active_tactics;
  DROP POLICY IF EXISTS "active_tactics_insert_all" ON active_tactics;
  DROP POLICY IF EXISTS "active_tactics_update_all" ON active_tactics;
  DROP POLICY IF EXISTS "active_tactics_delete_all" ON active_tactics;
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


-- ─────────────────────────────────────────────────────────────────────────
-- A.5: watchlist — tüm işlemler: sadece sahip
-- Kolon: user_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "watchlist_select_all" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_insert_all" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_update_all" ON watchlist;
  DROP POLICY IF EXISTS "watchlist_delete_all" ON watchlist;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "watchlist_select_owner" ON watchlist
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "watchlist_insert_owner" ON watchlist
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "watchlist_update_owner" ON watchlist
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "watchlist_delete_owner" ON watchlist
  FOR DELETE USING (user_id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- A.6: team_sponsorships — tüm işlemler: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "team_sponsorships_select_all" ON team_sponsorships;
  DROP POLICY IF EXISTS "team_sponsorships_insert_all" ON team_sponsorships;
  DROP POLICY IF EXISTS "team_sponsorships_update_all" ON team_sponsorships;
  DROP POLICY IF EXISTS "team_sponsorships_delete_all" ON team_sponsorships;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "team_sponsorships_select_owner" ON team_sponsorships
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "team_sponsorships_insert_owner" ON team_sponsorships
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "team_sponsorships_update_owner" ON team_sponsorships
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "team_sponsorships_delete_owner" ON team_sponsorships
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- A.7: friendly_matches — SELECT: herkese açık, INSERT/UPDATE: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "friendly_matches_select_all" ON friendly_matches;
  DROP POLICY IF EXISTS "friendly_matches_insert_all" ON friendly_matches;
  DROP POLICY IF EXISTS "friendly_matches_update_all" ON friendly_matches;
  DROP POLICY IF EXISTS "friendly_matches_delete_all" ON friendly_matches;
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


-- ─────────────────────────────────────────────────────────────────────────
-- A.8: friendly_queue — tüm işlemler: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "friendly_queue_select_all" ON friendly_queue;
  DROP POLICY IF EXISTS "friendly_queue_insert_all" ON friendly_queue;
  DROP POLICY IF EXISTS "friendly_queue_update_all" ON friendly_queue;
  DROP POLICY IF EXISTS "friendly_queue_delete_all" ON friendly_queue;
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


-- ─────────────────────────────────────────────────────────────────────────
-- A.9: user_facilities — tüm işlemler: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "user_facilities_select_all" ON user_facilities;
  DROP POLICY IF EXISTS "user_facilities_insert_all" ON user_facilities;
  DROP POLICY IF EXISTS "user_facilities_update_all" ON user_facilities;
  DROP POLICY IF EXISTS "user_facilities_delete_all" ON user_facilities;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "user_facilities_select_owner" ON user_facilities
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "user_facilities_insert_owner" ON user_facilities
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "user_facilities_update_owner" ON user_facilities
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "user_facilities_delete_owner" ON user_facilities
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- A.10: notification_preferences — tüm işlemler: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "notif_prefs_select_all" ON notification_preferences;
  DROP POLICY IF EXISTS "notif_prefs_insert_all" ON notification_preferences;
  DROP POLICY IF EXISTS "notif_prefs_update_all" ON notification_preferences;
  DROP POLICY IF EXISTS "notif_prefs_delete_all" ON notification_preferences;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "notification_preferences_select_owner" ON notification_preferences
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "notification_preferences_insert_owner" ON notification_preferences
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "notification_preferences_update_owner" ON notification_preferences
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "notification_preferences_delete_owner" ON notification_preferences
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- A.11: notifications — SELECT/INSERT/UPDATE: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
  DROP POLICY IF EXISTS "notifications_insert_all" ON notifications;
  DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
  DROP POLICY IF EXISTS "notifications_delete_all" ON notifications;
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


-- ─────────────────────────────────────────────────────────────────────────
-- A.12: youth_facilities — tüm işlemler: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "youth_facilities_select_all" ON youth_facilities;
  DROP POLICY IF EXISTS "youth_facilities_insert_all" ON youth_facilities;
  DROP POLICY IF EXISTS "youth_facilities_update_all" ON youth_facilities;
  DROP POLICY IF EXISTS "youth_facilities_delete_all" ON youth_facilities;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "youth_facilities_select_owner" ON youth_facilities
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "youth_facilities_insert_owner" ON youth_facilities
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "youth_facilities_update_owner" ON youth_facilities
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "youth_facilities_delete_owner" ON youth_facilities
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- A.13: youth_players — SELECT: herkese açık, INSERT/UPDATE/DELETE: sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "youth_players_select_all" ON youth_players;
  DROP POLICY IF EXISTS "youth_players_insert_all" ON youth_players;
  DROP POLICY IF EXISTS "youth_players_update_all" ON youth_players;
  DROP POLICY IF EXISTS "youth_players_delete_all" ON youth_players;
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


-- ─────────────────────────────────────────────────────────────────────────
-- A.14: operation_reports — tüm işlemler: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "operation_reports_select_all" ON operation_reports;
  DROP POLICY IF EXISTS "operation_reports_insert_all" ON operation_reports;
  DROP POLICY IF EXISTS "operation_reports_update_all" ON operation_reports;
  DROP POLICY IF EXISTS "operation_reports_delete_all" ON operation_reports;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "operation_reports_select_owner" ON operation_reports
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "operation_reports_insert_owner" ON operation_reports
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "operation_reports_update_owner" ON operation_reports
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "operation_reports_delete_owner" ON operation_reports
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- A.15: player_achievements — SELECT: herkese açık, INSERT/UPDATE: sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "player_achievements_select_all" ON player_achievements;
  DROP POLICY IF EXISTS "player_achievements_insert_all" ON player_achievements;
  DROP POLICY IF EXISTS "player_achievements_update_all" ON player_achievements;
  DROP POLICY IF EXISTS "player_achievements_delete_all" ON player_achievements;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "player_achievements_select_public" ON player_achievements
  FOR SELECT USING (true);

CREATE POLICY "player_achievements_insert_owner" ON player_achievements
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "player_achievements_update_owner" ON player_achievements
  FOR UPDATE USING (profile_id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- A.16: season_awards — SELECT: herkese açık, INSERT: sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "season_awards_select_all" ON season_awards;
  DROP POLICY IF EXISTS "season_awards_insert_all" ON season_awards;
  DROP POLICY IF EXISTS "season_awards_update_all" ON season_awards;
  DROP POLICY IF EXISTS "season_awards_delete_all" ON season_awards;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "season_awards_select_public" ON season_awards
  FOR SELECT USING (true);

CREATE POLICY "season_awards_insert_owner" ON season_awards
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- A.17: training_attendances — tüm işlemler: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "training_attendances_select_all" ON training_attendances;
  DROP POLICY IF EXISTS "training_attendances_insert_all" ON training_attendances;
  DROP POLICY IF EXISTS "training_attendances_update_all" ON training_attendances;
  DROP POLICY IF EXISTS "training_attendances_delete_all" ON training_attendances;
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


-- ─────────────────────────────────────────────────────────────────────────
-- A.18: push_subscriptions — tüm işlemler: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "push_subs_select_all" ON push_subscriptions;
  DROP POLICY IF EXISTS "push_subs_insert_all" ON push_subscriptions;
  DROP POLICY IF EXISTS "push_subs_update_all" ON push_subscriptions;
  DROP POLICY IF EXISTS "push_subs_delete_all" ON push_subscriptions;
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


-- ═══════════════════════════════════════════════════════════════════════════
-- KATEGORİ B: Herkese okunur, service_role yazabilir (lig verileri)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- B.1: leagues — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "leagues_select_all" ON leagues;
  DROP POLICY IF EXISTS "leagues_insert_all" ON leagues;
  DROP POLICY IF EXISTS "leagues_update_all" ON leagues;
  DROP POLICY IF EXISTS "leagues_delete_all" ON leagues;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "leagues_select_public" ON leagues
  FOR SELECT USING (true);

CREATE POLICY "leagues_insert_service" ON leagues
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "leagues_update_service" ON leagues
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "leagues_delete_service" ON leagues
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.2: league_teams — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "league_teams_select_all" ON league_teams;
  DROP POLICY IF EXISTS "league_teams_insert_all" ON league_teams;
  DROP POLICY IF EXISTS "league_teams_update_all" ON league_teams;
  DROP POLICY IF EXISTS "league_teams_delete_all" ON league_teams;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "league_teams_select_public" ON league_teams
  FOR SELECT USING (true);

CREATE POLICY "league_teams_insert_service" ON league_teams
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "league_teams_update_service" ON league_teams
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "league_teams_delete_service" ON league_teams
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.3: seasons — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "seasons_select_all" ON seasons;
  DROP POLICY IF EXISTS "seasons_insert_all" ON seasons;
  DROP POLICY IF EXISTS "seasons_update_all" ON seasons;
  DROP POLICY IF EXISTS "seasons_delete_all" ON seasons;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "seasons_select_public" ON seasons
  FOR SELECT USING (true);

CREATE POLICY "seasons_insert_service" ON seasons
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "seasons_update_service" ON seasons
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "seasons_delete_service" ON seasons
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.4: league_standings — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "league_standings_select_all" ON league_standings;
  DROP POLICY IF EXISTS "league_standings_insert_all" ON league_standings;
  DROP POLICY IF EXISTS "league_standings_update_all" ON league_standings;
  DROP POLICY IF EXISTS "league_standings_delete_all" ON league_standings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "league_standings_select_public" ON league_standings
  FOR SELECT USING (true);

CREATE POLICY "league_standings_insert_service" ON league_standings
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "league_standings_update_service" ON league_standings
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "league_standings_delete_service" ON league_standings
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.5: fixtures — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "fixtures_select_all" ON fixtures;
  DROP POLICY IF EXISTS "fixtures_insert_all" ON fixtures;
  DROP POLICY IF EXISTS "fixtures_update_all" ON fixtures;
  DROP POLICY IF EXISTS "fixtures_delete_all" ON fixtures;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "fixtures_select_public" ON fixtures
  FOR SELECT USING (true);

CREATE POLICY "fixtures_insert_service" ON fixtures
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "fixtures_update_service" ON fixtures
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "fixtures_delete_service" ON fixtures
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.6: match_history — SELECT: herkese açık, yazma: service_role
-- Kolon: user_id (sahip referansı, ama lig geçmişi herkese açık)
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "match_history_select_all" ON match_history;
  DROP POLICY IF EXISTS "match_history_insert_all" ON match_history;
  DROP POLICY IF EXISTS "match_history_update_all" ON match_history;
  DROP POLICY IF EXISTS "match_history_delete_all" ON match_history;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "match_history_select_public" ON match_history
  FOR SELECT USING (true);

CREATE POLICY "match_history_insert_service" ON match_history
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "match_history_update_service" ON match_history
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "match_history_delete_service" ON match_history
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.7: match_events — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "match_events_select_all" ON match_events;
  DROP POLICY IF EXISTS "match_events_insert_all" ON match_events;
  DROP POLICY IF EXISTS "match_events_update_all" ON match_events;
  DROP POLICY IF EXISTS "match_events_delete_all" ON match_events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "match_events_select_public" ON match_events
  FOR SELECT USING (true);

CREATE POLICY "match_events_insert_service" ON match_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "match_events_update_service" ON match_events
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "match_events_delete_service" ON match_events
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.8: match_participants — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "match_participants_select_all" ON match_participants;
  DROP POLICY IF EXISTS "match_participants_insert_all" ON match_participants;
  DROP POLICY IF EXISTS "match_participants_update_all" ON match_participants;
  DROP POLICY IF EXISTS "match_participants_delete_all" ON match_participants;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "match_participants_select_public" ON match_participants
  FOR SELECT USING (true);

CREATE POLICY "match_participants_insert_service" ON match_participants
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "match_participants_update_service" ON match_participants
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "match_participants_delete_service" ON match_participants
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.9: match_sessions — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "match_sessions_select_all" ON match_sessions;
  DROP POLICY IF EXISTS "match_sessions_insert_all" ON match_sessions;
  DROP POLICY IF EXISTS "match_sessions_update_all" ON match_sessions;
  DROP POLICY IF EXISTS "match_sessions_delete_all" ON match_sessions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "match_sessions_select_public" ON match_sessions
  FOR SELECT USING (true);

CREATE POLICY "match_sessions_insert_service" ON match_sessions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "match_sessions_update_service" ON match_sessions
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "match_sessions_delete_service" ON match_sessions
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.10: live_matches — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "live_matches_select_all" ON live_matches;
  DROP POLICY IF EXISTS "live_matches_insert_all" ON live_matches;
  DROP POLICY IF EXISTS "live_matches_update_all" ON live_matches;
  DROP POLICY IF EXISTS "live_matches_delete_all" ON live_matches;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "live_matches_select_public" ON live_matches
  FOR SELECT USING (true);

CREATE POLICY "live_matches_insert_service" ON live_matches
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "live_matches_update_service" ON live_matches
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "live_matches_delete_service" ON live_matches
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.11: match_simulation_queue — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "match_sim_queue_select_all" ON match_simulation_queue;
  DROP POLICY IF EXISTS "match_sim_queue_insert_all" ON match_simulation_queue;
  DROP POLICY IF EXISTS "match_sim_queue_update_all" ON match_simulation_queue;
  DROP POLICY IF EXISTS "match_sim_queue_delete_all" ON match_simulation_queue;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "match_simulation_queue_select_public" ON match_simulation_queue
  FOR SELECT USING (true);

CREATE POLICY "match_simulation_queue_insert_service" ON match_simulation_queue
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "match_simulation_queue_update_service" ON match_simulation_queue
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "match_simulation_queue_delete_service" ON match_simulation_queue
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.12: match_chat — SELECT: herkese açık, INSERT: sadece sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "match_chat_select_all" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_insert_all" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_insert_own" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_delete_own" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_update_all" ON match_chat;
  DROP POLICY IF EXISTS "match_chat_delete_all" ON match_chat;
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


-- ─────────────────────────────────────────────────────────────────────────
-- B.13: referees — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "referees_select_all" ON referees;
  DROP POLICY IF EXISTS "referees_insert_all" ON referees;
  DROP POLICY IF EXISTS "referees_update_all" ON referees;
  DROP POLICY IF EXISTS "referees_delete_all" ON referees;
  DROP POLICY IF EXISTS "Referees herkese acik" ON referees;
  DROP POLICY IF EXISTS "Referees select all" ON referees;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "referees_select_public" ON referees
  FOR SELECT USING (true);

CREATE POLICY "referees_insert_service" ON referees
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "referees_update_service" ON referees
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "referees_delete_service" ON referees
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.14: referee_stats — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "referee_stats_select_all" ON referee_stats;
  DROP POLICY IF EXISTS "referee_stats_insert_all" ON referee_stats;
  DROP POLICY IF EXISTS "referee_stats_update_all" ON referee_stats;
  DROP POLICY IF EXISTS "referee_stats_delete_all" ON referee_stats;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "referee_stats_select_public" ON referee_stats
  FOR SELECT USING (true);

CREATE POLICY "referee_stats_insert_service" ON referee_stats
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "referee_stats_update_service" ON referee_stats
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "referee_stats_delete_service" ON referee_stats
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.15: season_stats — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "season_stats_select_all" ON season_stats;
  DROP POLICY IF EXISTS "season_stats_insert_all" ON season_stats;
  DROP POLICY IF EXISTS "season_stats_update_all" ON season_stats;
  DROP POLICY IF EXISTS "season_stats_delete_all" ON season_stats;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "season_stats_select_public" ON season_stats
  FOR SELECT USING (true);

CREATE POLICY "season_stats_insert_service" ON season_stats
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "season_stats_update_service" ON season_stats
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "season_stats_delete_service" ON season_stats
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.16: league_history — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "league_history_select_all" ON league_history;
  DROP POLICY IF EXISTS "league_history_insert_all" ON league_history;
  DROP POLICY IF EXISTS "league_history_update_all" ON league_history;
  DROP POLICY IF EXISTS "league_history_delete_all" ON league_history;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "league_history_select_public" ON league_history
  FOR SELECT USING (true);

CREATE POLICY "league_history_insert_service" ON league_history
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "league_history_update_service" ON league_history
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "league_history_delete_service" ON league_history
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.17: hall_of_fame — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "hall_of_fame_select_all" ON hall_of_fame;
  DROP POLICY IF EXISTS "hall_of_fame_insert_all" ON hall_of_fame;
  DROP POLICY IF EXISTS "hall_of_fame_update_all" ON hall_of_fame;
  DROP POLICY IF EXISTS "hall_of_fame_delete_all" ON hall_of_fame;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "hall_of_fame_select_public" ON hall_of_fame
  FOR SELECT USING (true);

CREATE POLICY "hall_of_fame_insert_service" ON hall_of_fame
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "hall_of_fame_update_service" ON hall_of_fame
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "hall_of_fame_delete_service" ON hall_of_fame
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.18: cup_seasons — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "cup_seasons_select_all" ON cup_seasons;
  DROP POLICY IF EXISTS "cup_seasons_insert_all" ON cup_seasons;
  DROP POLICY IF EXISTS "cup_seasons_update_all" ON cup_seasons;
  DROP POLICY IF EXISTS "cup_seasons_delete_all" ON cup_seasons;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "cup_seasons_select_public" ON cup_seasons
  FOR SELECT USING (true);

CREATE POLICY "cup_seasons_insert_service" ON cup_seasons
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "cup_seasons_update_service" ON cup_seasons
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "cup_seasons_delete_service" ON cup_seasons
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.19: positions — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "positions_select_all" ON positions;
  DROP POLICY IF EXISTS "positions_insert_all" ON positions;
  DROP POLICY IF EXISTS "positions_update_all" ON positions;
  DROP POLICY IF EXISTS "positions_delete_all" ON positions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "positions_select_public" ON positions
  FOR SELECT USING (true);

CREATE POLICY "positions_insert_service" ON positions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "positions_update_service" ON positions
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "positions_delete_service" ON positions
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.20: player_positions — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "pp_select_all" ON player_positions;
  DROP POLICY IF EXISTS "pp_insert_auth" ON player_positions;
  DROP POLICY IF EXISTS "pp_update_auth" ON player_positions;
  DROP POLICY IF EXISTS "pp_delete_auth" ON player_positions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "player_positions_select_public" ON player_positions
  FOR SELECT USING (true);

CREATE POLICY "player_positions_insert_service" ON player_positions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "player_positions_update_service" ON player_positions
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "player_positions_delete_service" ON player_positions
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- B.21: player_development_log — SELECT: kendi profilin, INSERT: service_role
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "player_dev_log_select_all" ON player_development_log;
  DROP POLICY IF EXISTS "player_dev_log_insert_all" ON player_development_log;
  DROP POLICY IF EXISTS "player_dev_log_update_all" ON player_development_log;
  DROP POLICY IF EXISTS "player_dev_log_delete_all" ON player_development_log;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "player_development_log_select_owner" ON player_development_log
  FOR SELECT USING (profile_id = auth.uid()::text);

CREATE POLICY "player_development_log_insert_service" ON player_development_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "player_development_log_update_service" ON player_development_log
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "player_development_log_delete_service" ON player_development_log
  FOR DELETE USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════════════════
-- KATEGORİ C: Piyasa tabloları (karmaşık sahiplik)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- C.1: transfer_market — SELECT: herkese açık, INSERT: satıcı,
--       UPDATE: satıcı veya en yüksek teklif veren
-- Kolonlar: seller_id, highest_bidder_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "transfer_market_select_all" ON transfer_market;
  DROP POLICY IF EXISTS "transfer_market_insert_all" ON transfer_market;
  DROP POLICY IF EXISTS "transfer_market_update_all" ON transfer_market;
  DROP POLICY IF EXISTS "transfer_market_delete_all" ON transfer_market;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "transfer_market_select_public" ON transfer_market
  FOR SELECT USING (true);

CREATE POLICY "transfer_market_insert_seller" ON transfer_market
  FOR INSERT WITH CHECK (seller_id = auth.uid()::text);

CREATE POLICY "transfer_market_update_seller_or_bidder" ON transfer_market
  FOR UPDATE USING (
    seller_id = auth.uid()::text OR highest_bidder_id = auth.uid()::text
  );

CREATE POLICY "transfer_market_delete_seller" ON transfer_market
  FOR DELETE USING (seller_id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- C.2: loans — SELECT: herkese açık, INSERT/UPDATE: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "loans_all" ON loans;
  DROP POLICY IF EXISTS "loans_select_all" ON loans;
  DROP POLICY IF EXISTS "loans_insert_all" ON loans;
  DROP POLICY IF EXISTS "loans_update_all" ON loans;
  DROP POLICY IF EXISTS "loans_delete_all" ON loans;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "loans_select_public" ON loans
  FOR SELECT USING (true);

CREATE POLICY "loans_insert_service" ON loans
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "loans_update_service" ON loans
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "loans_delete_service" ON loans
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- C.3: rental_listings — SELECT: herkese açık, INSERT/UPDATE/DELETE: sahip
-- Kolon: owner_team_id (gerçekte profile_id saklar)
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "rental_select_all" ON rental_listings;
  DROP POLICY IF EXISTS "rental_insert_all" ON rental_listings;
  DROP POLICY IF EXISTS "rental_update_all" ON rental_listings;
  DROP POLICY IF EXISTS "rental_delete_all" ON rental_listings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "rental_listings_select_public" ON rental_listings
  FOR SELECT USING (true);

CREATE POLICY "rental_listings_insert_owner" ON rental_listings
  FOR INSERT WITH CHECK (owner_team_id = auth.uid()::text);

CREATE POLICY "rental_listings_update_owner" ON rental_listings
  FOR UPDATE USING (owner_team_id = auth.uid()::text);

CREATE POLICY "rental_listings_delete_owner" ON rental_listings
  FOR DELETE USING (owner_team_id = auth.uid()::text);


-- ─────────────────────────────────────────────────────────────────────────
-- C.4: rental_agreements — SELECT: herkese açık, INSERT/UPDATE: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "rental_agreements_select_all" ON rental_agreements;
  DROP POLICY IF EXISTS "rental_agreements_insert_all" ON rental_agreements;
  DROP POLICY IF EXISTS "rental_agreements_update_all" ON rental_agreements;
  DROP POLICY IF EXISTS "rental_agreements_delete_all" ON rental_agreements;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "rental_agreements_select_public" ON rental_agreements
  FOR SELECT USING (true);

CREATE POLICY "rental_agreements_insert_service" ON rental_agreements
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "rental_agreements_update_service" ON rental_agreements
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "rental_agreements_delete_service" ON rental_agreements
  FOR DELETE USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════════════════
-- KATEGORİ D: İletişim tabloları (çok kullanıcılı)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- D.1: manager_messages — SELECT: gönderen veya alıcı, INSERT: gönderen
-- Kolonlar: sender_id, receiver_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "manager_messages_select_all" ON manager_messages;
  DROP POLICY IF EXISTS "manager_messages_insert_all" ON manager_messages;
  DROP POLICY IF EXISTS "manager_messages_update_all" ON manager_messages;
  DROP POLICY IF EXISTS "manager_messages_delete_all" ON manager_messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "manager_messages_select_participant" ON manager_messages
  FOR SELECT USING (
    sender_id = auth.uid()::text OR receiver_id = auth.uid()::text
  );

CREATE POLICY "manager_messages_insert_sender" ON manager_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid()::text);

CREATE POLICY "manager_messages_update_sender" ON manager_messages
  FOR UPDATE USING (sender_id = auth.uid()::text);

CREATE POLICY "manager_messages_delete_participant" ON manager_messages
  FOR DELETE USING (
    sender_id = auth.uid()::text OR receiver_id = auth.uid()::text
  );


-- ─────────────────────────────────────────────────────────────────────────
-- D.2: manager_conversations — SELECT: katılımcı, INSERT/UPDATE: service_role
-- Kolonlar: participant_1, participant_2 (TEXT)
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "manager_conversations_select_all" ON manager_conversations;
  DROP POLICY IF EXISTS "manager_conversations_insert_all" ON manager_conversations;
  DROP POLICY IF EXISTS "manager_conversations_update_all" ON manager_conversations;
  DROP POLICY IF EXISTS "manager_conversations_delete_all" ON manager_conversations;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "manager_conversations_select_participant" ON manager_conversations
  FOR SELECT USING (
    participant_1 = auth.uid()::text OR participant_2 = auth.uid()::text
  );

CREATE POLICY "manager_conversations_insert_service" ON manager_conversations
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "manager_conversations_update_service" ON manager_conversations
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "manager_conversations_delete_service" ON manager_conversations
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- D.3: manager_presence — SELECT: herkese açık, INSERT/UPDATE: sahip
-- Kolon: profile_id
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "manager_presence_select_all" ON manager_presence;
  DROP POLICY IF EXISTS "manager_presence_insert_all" ON manager_presence;
  DROP POLICY IF EXISTS "manager_presence_update_all" ON manager_presence;
  DROP POLICY IF EXISTS "manager_presence_delete_all" ON manager_presence;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "manager_presence_select_public" ON manager_presence
  FOR SELECT USING (true);

CREATE POLICY "manager_presence_insert_owner" ON manager_presence
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

CREATE POLICY "manager_presence_update_owner" ON manager_presence
  FOR UPDATE USING (profile_id = auth.uid()::text);

CREATE POLICY "manager_presence_delete_owner" ON manager_presence
  FOR DELETE USING (profile_id = auth.uid()::text);


-- ═══════════════════════════════════════════════════════════════════════════
-- KATEGORİ E: Sistem tabloları (service_role only)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- E.1: weekly_evolution — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "weekly_evolution_select_all" ON weekly_evolution;
  DROP POLICY IF EXISTS "weekly_evolution_insert_all" ON weekly_evolution;
  DROP POLICY IF EXISTS "weekly_evolution_update_all" ON weekly_evolution;
  DROP POLICY IF EXISTS "weekly_evolution_delete_all" ON weekly_evolution;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "weekly_evolution_select_public" ON weekly_evolution
  FOR SELECT USING (true);

CREATE POLICY "weekly_evolution_insert_service" ON weekly_evolution
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "weekly_evolution_update_service" ON weekly_evolution
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "weekly_evolution_delete_service" ON weekly_evolution
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- E.2: error_logs — tüm işlemler: service_role only
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "error_logs_select_all" ON error_logs;
  DROP POLICY IF EXISTS "error_logs_insert_all" ON error_logs;
  DROP POLICY IF EXISTS "error_logs_update_all" ON error_logs;
  DROP POLICY IF EXISTS "error_logs_delete_all" ON error_logs;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "error_logs_select_service" ON error_logs
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "error_logs_insert_service" ON error_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "error_logs_update_service" ON error_logs
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "error_logs_delete_service" ON error_logs
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- E.3: trainings — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "trainings_select_all" ON trainings;
  DROP POLICY IF EXISTS "trainings_insert_all" ON trainings;
  DROP POLICY IF EXISTS "trainings_update_all" ON trainings;
  DROP POLICY IF EXISTS "trainings_delete_all" ON trainings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "trainings_select_public" ON trainings
  FOR SELECT USING (true);

CREATE POLICY "trainings_insert_service" ON trainings
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "trainings_update_service" ON trainings
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "trainings_delete_service" ON trainings
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────
-- E.4: staff_types — SELECT: herkese açık, yazma: service_role
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Staff types herkese acik" ON staff_types;
  DROP POLICY IF EXISTS "Staff types select all" ON staff_types;
  DROP POLICY IF EXISTS "staff_types_select_all" ON staff_types;
  DROP POLICY IF EXISTS "staff_types_insert_all" ON staff_types;
  DROP POLICY IF EXISTS "staff_types_update_all" ON staff_types;
  DROP POLICY IF EXISTS "staff_types_delete_all" ON staff_types;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "staff_types_select_public" ON staff_types
  FOR SELECT USING (true);

CREATE POLICY "staff_types_insert_service" ON staff_types
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "staff_types_update_service" ON staff_types
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "staff_types_delete_service" ON staff_types
  FOR DELETE USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════════════════
-- DOĞRULAMA BÖLÜMÜ
-- Aşağıdaki sorgular migration sonrası çalıştırılabilir
-- ═══════════════════════════════════════════════════════════════════════════

-- USING (true) kullanan politikaların kalmadığını doğrula
-- (sonuç boş olmalıdır)
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE policyname LIKE '%_all' AND schemaname = 'public'
-- ORDER BY tablename;

-- Her tablo için aktif politika sayısını listele
-- SELECT tablename, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY tablename
-- ORDER BY tablename;

-- auth.uid()::text kullanan politikaları listele
-- SELECT tablename, policyname, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
-- ORDER BY tablename, policyname;

-- service_role kullanan politikaları listele
-- SELECT tablename, policyname, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND (qual LIKE '%service_role%' OR with_check LIKE '%service_role%')
-- ORDER BY tablename, policyname;

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
