-- ═══════════════════════════════════════════════════════════════════════════════
-- DOSYA: 00_TAMAMINI_CALISTIR.sql
-- TARIH: 2026-05-27
-- ACIKLAMA: Tum SQL duzeltmelerini iceren birlesik migration dosyasi
--
-- CALISTIRMA SIRASI:
--   1. notifications.profile_id UUID → TEXT donusumu
--   2. user_facilities constraint + FK duzeltmeleri
--   3. Eksik kolonlar + tum tablolarda CASCADE FK
--   4. Eksik tablolari olusturma
--
-- ONEMLI: Bu dosya 01-04 arasi dosyalarin birlesimdir.
--         Ayri ayri veya bu tek dosya ile calistirilabilir.
--         Idempotent'tir (birden fazla calistirilabilir).
--
-- KULLANIM: Supabase Dashboard → SQL Editor → Yapistir → Run
-- ═══════════════════════════════════════════════════════════════════════════════


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  BOLUM 1: notifications.profile_id UUID → TEXT                           ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- Eski FK constraint'i kaldir (varsa)
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_profile_id_fkey;

-- profile_id kolonunu UUID'den TEXT'e donustur
-- Mevcut UUID degerler otomatik olarak TEXT'e cast edilir, veri kaybi olmaz
ALTER TABLE public.notifications
  ALTER COLUMN profile_id TYPE TEXT USING profile_id::TEXT;

-- Yeni FK constraint ekle (artik tipler uyusuyor: TEXT → TEXT)
DO $$
BEGIN
  ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'FK constraint notifications_profile_id_fkey zaten var';
END $$;

-- Indeksi yeniden olustur (artik TEXT tipinde)
DROP INDEX IF EXISTS idx_notifications_profile_unread;
CREATE INDEX idx_notifications_profile_unread
  ON public.notifications(profile_id, is_read)
  WHERE is_read = FALSE;


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  BOLUM 2: user_facilities constraint + FK duzeltmeleri                    ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- FK constraint ekle (profile_id → profiles.id, ON DELETE CASCADE)
DO $$
BEGIN
  ALTER TABLE public.user_facilities
    DROP CONSTRAINT IF EXISTS user_facilities_profile_id_fkey;
  ALTER TABLE public.user_facilities
    ADD CONSTRAINT user_facilities_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  RAISE NOTICE 'user_facilities FK eklendi';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_facilities FK: %', SQLERRM;
END $$;

-- created_at kolonu ekle (yoksa)
ALTER TABLE public.user_facilities
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  BOLUM 3: Eksik kolonlar + tum tablolarda CASCADE FK                     ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

-- ── Eksik kolonlar: players ──
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS loaned_from_profile_id TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS rating_start_of_season INTEGER DEFAULT 0;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS contract_end_week INTEGER;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS season_yellow_cards INTEGER DEFAULT 0;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS injury_severity TEXT;

-- ── Eksik kolonlar: profiles ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_newspaper_applied DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consecutive_losses INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS financial_health TEXT DEFAULT 'healthy';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_friendly_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_friendly_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_weekly_income NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_weekly_expense NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_weekly_net NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sponsors JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS academy_weekly_budget INTEGER DEFAULT 50000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_youth_intake_season TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_trophies INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_awards INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS season_badges JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hof_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS scout_slots INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS staff_coaches INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS staff_physios INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS staff_monthly_fees INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tv_revenue_weekly INTEGER DEFAULT 0;

-- ── Eksik kolonlar: transfer_market ──
ALTER TABLE public.transfer_market ADD COLUMN IF NOT EXISTS held_amount BIGINT DEFAULT 0;

-- ── ON DELETE CASCADE FK Constraints ──

-- players.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_profile_id_fkey;
  ALTER TABLE public.players ADD CONSTRAINT players_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'players FK: %', SQLERRM;
END $$;

-- league_teams.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.league_teams DROP CONSTRAINT IF EXISTS league_teams_profile_id_fkey;
  ALTER TABLE public.league_teams ADD CONSTRAINT league_teams_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'league_teams FK: %', SQLERRM;
END $$;

-- active_tactics.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.active_tactics DROP CONSTRAINT IF EXISTS active_tactics_profile_id_fkey;
  ALTER TABLE public.active_tactics ADD CONSTRAINT active_tactics_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'active_tactics FK: %', SQLERRM;
END $$;

-- trainings.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.trainings DROP CONSTRAINT IF EXISTS trainings_profile_id_fkey;
  ALTER TABLE public.trainings ADD CONSTRAINT trainings_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'trainings FK: %', SQLERRM;
END $$;

-- watchlist.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_profile_id_fkey;
  ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey;
  ALTER TABLE public.watchlist ADD CONSTRAINT watchlist_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'watchlist FK: %', SQLERRM;
END $$;

-- youth_players.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.youth_players DROP CONSTRAINT IF EXISTS youth_players_profile_id_fkey;
  ALTER TABLE public.youth_players ADD CONSTRAINT youth_players_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'youth_players FK: %', SQLERRM;
END $$;

-- user_academy.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.user_academy DROP CONSTRAINT IF EXISTS user_academy_profile_id_fkey;
  ALTER TABLE public.user_academy ADD CONSTRAINT user_academy_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_academy FK: %', SQLERRM;
END $$;

-- team_sponsorships.profile_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.team_sponsorships DROP CONSTRAINT IF EXISTS team_sponsorships_profile_id_fkey;
  ALTER TABLE public.team_sponsorships ADD CONSTRAINT team_sponsorships_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'team_sponsorships FK: %', SQLERRM;
END $$;

-- operation_reports.user_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.operation_reports DROP CONSTRAINT IF EXISTS operation_reports_user_id_fkey;
  ALTER TABLE public.operation_reports ADD CONSTRAINT operation_reports_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'operation_reports FK: %', SQLERRM;
END $$;

-- friendly_queue.user_id → profiles.id
DO $$
BEGIN
  ALTER TABLE public.friendly_queue DROP CONSTRAINT IF EXISTS friendly_queue_user_id_fkey;
  ALTER TABLE public.friendly_queue ADD CONSTRAINT friendly_queue_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'friendly_queue FK: %', SQLERRM;
END $$;


-- ── Composite Indexes ──
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

-- ── Unique Constraint: match_sessions.fixture_id ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_match_session_fixture'
  ) THEN
    ALTER TABLE match_sessions ADD CONSTRAINT uniq_match_session_fixture UNIQUE (fixture_id);
  END IF;
END $$;

-- ── Sponsor JSONB Fix ──
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
  RAISE NOTICE 'Sponsor JSONB: weeklyPayout -> weeklyPayment duzeltildi';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Sponsor JSONB fix atlandi: %', SQLERRM;
END $$;


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  BOLUM 4: Eksik tablolari olusturma                                      ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.player_career_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  profile_id TEXT,
  season_id TEXT,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  motm_count INTEGER DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  goal_types JSONB DEFAULT '{}',
  save_types JSONB DEFAULT '{}',
  avg_rating NUMERIC(4,2) DEFAULT 0,
  position TEXT,
  rating NUMERIC(4,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.season_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  season_id TEXT NOT NULL,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, season_id)
);

CREATE TABLE IF NOT EXISTS public.cup_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES public.seasons(id),
  league_id UUID REFERENCES public.leagues(id),
  name TEXT,
  status TEXT DEFAULT 'upcoming',
  current_round INTEGER DEFAULT 0,
  max_rounds INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weekly_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  week INTEGER NOT NULL,
  rating_change NUMERIC DEFAULT 0,
  stat_changes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.training_attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  program_id TEXT NOT NULL,
  week_number INTEGER DEFAULT 1,
  attended BOOLEAN DEFAULT true,
  stats_gained JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.youth_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL UNIQUE,
  facility_levels JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hall_of_fame (
  id TEXT PRIMARY KEY,
  season_id TEXT,
  league_name TEXT,
  champion_team TEXT,
  champion_profile_id TEXT,
  golden_boot_player TEXT DEFAULT '',
  golden_boot_goals INTEGER DEFAULT 0,
  top_assists_player TEXT DEFAULT '',
  top_assists_value INTEGER DEFAULT 0,
  mvp_player TEXT DEFAULT '',
  best_goalkeeper TEXT,
  player_id TEXT,
  player_name TEXT,
  profile_id TEXT,
  position TEXT,
  nationality TEXT,
  seasons_played INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_clean_sheets INTEGER DEFAULT 0,
  total_motm INTEGER DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  peak_rating NUMERIC DEFAULT 0,
  legend_tier TEXT DEFAULT 'bronze',
  is_club_legend BOOLEAN DEFAULT false,
  awards_won JSONB DEFAULT '[]',
  joined_day INTEGER DEFAULT 0,
  retired_day INTEGER DEFAULT 0,
  retired_season TEXT,
  inducted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.season_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID,
  profile_id TEXT,
  league_name TEXT,
  award_type TEXT NOT NULL,
  team_name TEXT,
  player_id TEXT,
  player_name TEXT,
  stat_value NUMERIC,
  stat_detail JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL UNIQUE,
  match_reminder BOOLEAN DEFAULT true,
  transfer_offer BOOLEAN DEFAULT true,
  training_report BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.facility_upgrade_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_type TEXT NOT NULL,
  target_level INTEGER NOT NULL,
  credits_cost INTEGER NOT NULL DEFAULT 0,
  upgrade_days INTEGER NOT NULL DEFAULT 1
);

-- Seed data: facility_upgrade_costs (seviye 6-10, sadece bossa eklenir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.facility_upgrade_costs WHERE target_level >= 6) THEN
    INSERT INTO public.facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days) VALUES
      ('stadium', 6, 500, 5), ('stadium', 7, 750, 6), ('stadium', 8, 1000, 7),
      ('stadium', 9, 1500, 8), ('stadium', 10, 2500, 10),
      ('training', 6, 400, 4), ('training', 7, 600, 5), ('training', 8, 900, 6),
      ('training', 9, 1300, 7), ('training', 10, 2000, 9),
      ('youth', 6, 350, 4), ('youth', 7, 550, 5), ('youth', 8, 800, 6),
      ('youth', 9, 1200, 7), ('youth', 10, 1800, 8),
      ('medical', 6, 300, 3), ('medical', 7, 500, 4), ('medical', 8, 700, 5),
      ('medical', 9, 1000, 6), ('medical', 10, 1500, 7);
    RAISE NOTICE 'facility_upgrade_costs seed data eklendi';
  END IF;
END $$;


-- ╔═════════════════════════════════════════════════════════════════════════════╗
-- ║  BOLUM 5: Dogrulama + Schema Cache Reload                                ║
-- ╚═════════════════════════════════════════════════════════════════════════════╝

DO $$
DECLARE
  v_notif_type TEXT;
  v_uf_fk_exists BOOLEAN;
BEGIN
  -- notifications.profile_id tipi kontrol
  SELECT data_type INTO v_notif_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'profile_id';

  -- user_facilities FK kontrol
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.user_facilities'::regclass
    AND conname = 'user_facilities_profile_id_fkey'
  ) INTO v_uf_fk_exists;

  RAISE NOTICE '═══ DOGRULAMA SONUCLARI ═══';
  RAISE NOTICE 'notifications.profile_id tipi: % (beklenen: text)', v_notif_type;
  RAISE NOTICE 'user_facilities FK exists: %', v_uf_fk_exists;
  RAISE NOTICE '═══ Migration tamamlandi ═══';
END $$;

NOTIFY pgrst, 'reload schema';
