-- ═══════════════════════════════════════════════════════════════════════════════
-- DOSYA: 03_add_missing_columns_and_cascade_fks.sql
-- TARIH: 2026-05-27
-- ACIKLAMA: Eksik kolonlar + tum tablolarda ON DELETE CASCADE FK ekleme
--
-- SORUNLAR:
--   1. players tablosunda loaned_from_profile_id kolonu eksik
--   2. staff tablosunda user_id var, profile_id yok (user_id kullanilmaya devam edecek)
--   3. Birçok tabloda FK constraint YOK veya CASCADE degil
--
-- KULLANIM: Supabase Dashboard → SQL Editor → Yapistir → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══ EKSİK KOLONLAR ═══

-- 1. players: loaned_from_profile_id (kiralik sistem icin)
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS loaned_from_profile_id TEXT;

-- 2. players: rating_start_of_season (en cok gelisen odulu icin)
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS rating_start_of_season INTEGER DEFAULT 0;

-- 3. profiles: eksik kolonlar
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_newspaper_applied DATE;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consecutive_losses INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS financial_health TEXT DEFAULT 'healthy';
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_friendly_date TEXT;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_friendly_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_weekly_income NUMERIC DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_weekly_expense NUMERIC DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_weekly_net NUMERIC DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sponsors JSONB DEFAULT '[]';
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS academy_weekly_budget INTEGER DEFAULT 50000;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_youth_intake_season TEXT;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_trophies INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_awards INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS season_badges JSONB DEFAULT '[]';
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hof_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS scout_slots INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS staff_coaches INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS staff_physios INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS staff_monthly_fees INTEGER DEFAULT 0;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tv_revenue_weekly INTEGER DEFAULT 0;

-- 4. players: contract_end_week (sozlesme sistemi icin)
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS contract_end_week INTEGER;

-- 5. transfer_market: held_amount (mevzu sistemi icin)
ALTER TABLE public.transfer_market
  ADD COLUMN IF NOT EXISTS held_amount BIGINT DEFAULT 0;

-- 6. players: season_yellow_cards (kart ceza takibi)
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS season_yellow_cards INTEGER DEFAULT 0;

-- 7. players: injury_severity (sakatlik siddeti)
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS injury_severity TEXT;


-- ═══ ON DELETE CASCADE FK CONSTRAINTS ═══
-- Profil silindiginde iliskili kayitlarin otomatik silinmesi

-- 1. players.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_profile_id_fkey;
  ALTER TABLE public.players ADD CONSTRAINT players_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'players FK: %', SQLERRM;
END $$;

-- 2. league_teams.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.league_teams DROP CONSTRAINT IF EXISTS league_teams_profile_id_fkey;
  ALTER TABLE public.league_teams ADD CONSTRAINT league_teams_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'league_teams FK: %', SQLERRM;
END $$;

-- 3. active_tactics.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.active_tactics DROP CONSTRAINT IF EXISTS active_tactics_profile_id_fkey;
  ALTER TABLE public.active_tactics ADD CONSTRAINT active_tactics_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'active_tactics FK: %', SQLERRM;
END $$;

-- 4. trainings.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.trainings DROP CONSTRAINT IF EXISTS trainings_profile_id_fkey;
  ALTER TABLE public.trainings ADD CONSTRAINT trainings_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'trainings FK: %', SQLERRM;
END $$;

-- 5. watchlist.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_profile_id_fkey;
  ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey;
  ALTER TABLE public.watchlist ADD CONSTRAINT watchlist_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'watchlist FK: %', SQLERRM;
END $$;

-- 6. youth_players.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.youth_players DROP CONSTRAINT IF EXISTS youth_players_profile_id_fkey;
  ALTER TABLE public.youth_players ADD CONSTRAINT youth_players_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'youth_players FK: %', SQLERRM;
END $$;

-- 7. user_academy.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.user_academy DROP CONSTRAINT IF EXISTS user_academy_profile_id_fkey;
  ALTER TABLE public.user_academy ADD CONSTRAINT user_academy_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_academy FK: %', SQLERRM;
END $$;

-- 8. user_facilities.profile_id → profiles.id (ayrica 02 dosyasinda da var, idempotent)
DO $$
BEGIN
  ALTER TABLE public.user_facilities DROP CONSTRAINT IF EXISTS user_facilities_profile_id_fkey;
  ALTER TABLE public.user_facilities ADD CONSTRAINT user_facilities_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_facilities FK: %', SQLERRM;
END $$;

-- 9. team_sponsorships.profile_id → profiles.id (zaten var, CASCADE'e guncelle)
DO $$
BEGIN
  ALTER TABLE public.team_sponsorships DROP CONSTRAINT IF EXISTS team_sponsorships_profile_id_fkey;
  ALTER TABLE public.team_sponsorships ADD CONSTRAINT team_sponsorships_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'team_sponsorships FK: %', SQLERRM;
END $$;

-- 10. notifications.profile_id → profiles.id (ayrica 01 dosyasinda da var, idempotent)
DO $$
BEGIN
  ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_profile_id_fkey;
  ALTER TABLE public.notifications ADD CONSTRAINT notifications_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'notifications FK: %', SQLERRM;
END $$;

-- 11. operation_reports.user_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.operation_reports DROP CONSTRAINT IF EXISTS operation_reports_user_id_fkey;
  ALTER TABLE public.operation_reports ADD CONSTRAINT operation_reports_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'operation_reports FK: %', SQLERRM;
END $$;

-- 12. friendly_queue.user_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.friendly_queue DROP CONSTRAINT IF EXISTS friendly_queue_user_id_fkey;
  ALTER TABLE public.friendly_queue ADD CONSTRAINT friendly_queue_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'friendly_queue FK: %', SQLERRM;
END $$;


-- ═══ COMPOSITE INDEXES (Performans) ═══

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


-- ═══ UNIQUE CONSTRAINT (match_sessions) ═══

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_match_session_fixture'
  ) THEN
    ALTER TABLE match_sessions ADD CONSTRAINT uniq_match_session_fixture UNIQUE (fixture_id);
  END IF;
END $$;


-- ═══ SPONSOR JSONB FIX ═══
-- weeklyPayout → weeklyPayment (weekly-income cron ile uyum icin)

DO $$
BEGIN
  UPDATE public.profiles
  SET sponsors = (
    SELECT jsonb_agg(
      CASE
        WHEN elem ? 'weeklyPayout' THEN
          elem - 'weeklyPayout' || jsonb_build_object('weeklyPayment', elem->>'weeklyPayout')
        ELSE elem
      END
    )
    FROM jsonb_array_elements(sponsors) elem
  )
  WHERE sponsors IS NOT NULL
    AND jsonb_typeof(sponsors) = 'array'
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(sponsors) elem WHERE elem ? 'weeklyPayout'
    );
  RAISE NOTICE 'Sponsor JSONB: weeklyPayout → weeklyPayment duzeltildi';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Sponsor JSONB fix atlandi: %', SQLERRM;
END $$;


-- ═══ SCHEMA CACHE RELOAD ═══
NOTIFY pgrst, 'reload schema';
