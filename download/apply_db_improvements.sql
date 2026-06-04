-- ═══════════════════════════════════════════════════════════════════════════════
-- VERİTABANI-5 + VERİTABANI-6: Composite Indexes + Cascade Delete FK Constraints
-- ═══════════════════════════════════════════════════════════════════════════════
-- Bu SQL dosyası Supabase SQL Editor'de çalıştırılabilir.
-- İki iyileştirme içerir:
--   1) Performans için bileşik indeksler (composite indexes)
--   2) Profil silindiğinde ilişkili kayıtların otomatik silinmesi (ON DELETE CASCADE)
--
-- Kullanım: Supabase Dashboard → SQL Editor → Yapıştır → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ VERİTABANI-5: Composite Indexes                                            │
-- │                                                                            │
-- │ Açıklamalar:                                                               │
-- │   fixtures(status, match_date)        → Cron job'lar full table scan yapıyor│
-- │   league_standings(league_id, season_id) → Lig puan sorguları yavaş        │
-- │   players(profile_id, position)       → Bot aksiyonları ve kadro sorguları │
-- │   transfer_market(is_active, expires_at) → Mevzu temizlik cron taraması    │
-- │   league_teams(league_id, profile_id) → Lig takım aramaları               │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE INDEX IF NOT EXISTS idx_fixtures_status_date
  ON public.fixtures(status, match_date);

CREATE INDEX IF NOT EXISTS idx_league_standings_league_season
  ON public.league_standings(league_id, season_id);

CREATE INDEX IF NOT EXISTS idx_players_profile_position
  ON public.players(profile_id, position);

CREATE INDEX IF NOT EXISTS idx_transfer_market_active_expires
  ON public.transfer_market(is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_league_teams_league_profile
  ON public.league_teams(league_id, profile_id);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ VERİTABANI-6: ON DELETE CASCADE FK Constraints                            │
-- │                                                                            │
-- │ Sorun: Bir profil silindiğinde, players, league_teams, fixtures vb.        │
-- │ tablolarda "yetim (zombie)" kayıtlar kalıyor.                              │
-- │ Çözüm: FK constraint'lere ON DELETE CASCADE ekliyoruz.                     │
-- │                                                                            │
-- │ Not: Eski constraint varsa DROP + yeni CASCADE constraint ADD              │
-- │       Eski constraint yoksa DROP IF EXISTS güvenle atlar, ADD çalışır.     │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- 1. players.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_profile_id_fkey;
ALTER TABLE public.players ADD CONSTRAINT players_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. league_teams.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.league_teams DROP CONSTRAINT IF EXISTS league_teams_profile_id_fkey;
ALTER TABLE public.league_teams ADD CONSTRAINT league_teams_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. active_tactics.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.active_tactics DROP CONSTRAINT IF EXISTS active_tactics_profile_id_fkey;
ALTER TABLE public.active_tactics ADD CONSTRAINT active_tactics_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. trainings.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.trainings DROP CONSTRAINT IF EXISTS trainings_profile_id_fkey;
ALTER TABLE public.trainings ADD CONSTRAINT trainings_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. watchlist.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_profile_id_fkey;
ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey;
ALTER TABLE public.watchlist ADD CONSTRAINT watchlist_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. notifications.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_profile_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 7. youth_players.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.youth_players DROP CONSTRAINT IF EXISTS youth_players_profile_id_fkey;
ALTER TABLE public.youth_players ADD CONSTRAINT youth_players_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 8. user_academy.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.user_academy DROP CONSTRAINT IF EXISTS user_academy_profile_id_fkey;
ALTER TABLE public.user_academy ADD CONSTRAINT user_academy_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 9. user_facilities.profile_id → profiles.id ON DELETE CASCADE
ALTER TABLE public.user_facilities DROP CONSTRAINT IF EXISTS user_facilities_profile_id_fkey;
ALTER TABLE public.user_facilities ADD CONSTRAINT user_facilities_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Not: lab_sessions.user_id → auth.users(id) zaten ON DELETE CASCADE ile tanımlı


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ PostgREST şema önbelleğini yenile                                         │
-- └─────────────────────────────────────────────────────────────────────────────┘
NOTIFY pgrst, 'reload schema';
