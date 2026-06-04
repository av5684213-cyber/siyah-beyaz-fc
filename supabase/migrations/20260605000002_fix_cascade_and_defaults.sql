-- ═══════════════════════════════════════════════════════════════════════════════
-- 20260605000002_fix_cascade_and_defaults.sql
-- BUG-5 Düzeltme: Cascade delete + default değer çakışmalarını çöz
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 1: CASCADE DELETE — profiles silindiğinde bağlı kayıtlar otomatik silinsin
-- ═══════════════════════════════════════════════════════════════════════════════

-- Mevcut foreign key'leri kontrol et ve cascade ekle
-- Not: PostgreSQL'de ALTER TABLE ... DROP CONSTRAINT + ADD CONSTRAINT ile yapılır

-- players.profile_id → profiles.id
DO $$
BEGIN
  -- Eski constraint'i bul ve sil (adı bilinmeyebilir, dinamik bul)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'players' AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_profile_id_fkey;
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE public.players
    ADD CONSTRAINT players_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- league_teams.profile_id → profiles.id
ALTER TABLE public.league_teams DROP CONSTRAINT IF EXISTS league_teams_profile_id_fkey;
DO $$ BEGIN
  ALTER TABLE public.league_teams
    ADD CONSTRAINT league_teams_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- active_tactics.profile_id → profiles.id
ALTER TABLE public.active_tactics DROP CONSTRAINT IF EXISTS active_tactics_profile_id_fkey;
DO $$ BEGIN
  ALTER TABLE public.active_tactics
    ADD CONSTRAINT active_tactics_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- training_state.id → profiles.id
ALTER TABLE public.training_state DROP CONSTRAINT IF EXISTS training_state_id_fkey;
DO $$ BEGIN
  ALTER TABLE public.training_state
    ADD CONSTRAINT training_state_id_fkey
    FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- user_facilities → profiles
ALTER TABLE public.user_facilities DROP CONSTRAINT IF EXISTS user_facilities_profile_id_fkey;
DO $$ BEGIN
  ALTER TABLE public.user_facilities
    ADD CONSTRAINT user_facilities_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- notifications → profiles
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_profile_id_fkey;
DO $$ BEGIN
  ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- push_subscriptions → profiles
ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_profile_id_fkey;
DO $$ BEGIN
  ALTER TABLE public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- team_sponsorships → profiles
ALTER TABLE public.team_sponsorships DROP CONSTRAINT IF EXISTS team_sponsorships_profile_id_fkey;
DO $$ BEGIN
  ALTER TABLE public.team_sponsorships
    ADD CONSTRAINT team_sponsorships_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- daily_tasks → profiles (user_id sütunu)
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  -- Tüm FK constraint'lerini bul ve sil (birden fazla olabilir)
  FOR fk_name IN
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'daily_tasks' AND constraint_type = 'FOREIGN KEY'
  LOOP
    EXECUTE format('ALTER TABLE public.daily_tasks DROP CONSTRAINT %I', fk_name);
  END LOOP;
END $$;

-- daily_tasks.user_id sütunu varsa cascade FK ekle
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_tasks' AND column_name = 'user_id'
  ) THEN
    -- Constraint zaten varsa tekrar ekleme
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'daily_tasks' AND constraint_name = 'daily_tasks_user_id_fkey'
    ) THEN
      ALTER TABLE public.daily_tasks
        ADD CONSTRAINT daily_tasks_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- player_development_log → profiles
ALTER TABLE public.player_development_log DROP CONSTRAINT IF EXISTS player_development_log_profile_id_fkey;
DO $$ BEGIN
  ALTER TABLE public.player_development_log
    ADD CONSTRAINT player_development_log_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- season_awards → profiles
ALTER TABLE public.season_awards DROP CONSTRAINT IF EXISTS season_awards_profile_id_fkey;
DO $$ BEGIN
  ALTER TABLE public.season_awards
    ADD CONSTRAINT season_awards_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- operation_reports → profiles
-- NOT: operation_reports tablosunda user_id var, profile_id YOK
-- Önce profile_id sütununu ekle ve user_id'den kopyala
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'operation_reports' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE public.operation_reports ADD COLUMN profile_id TEXT;
    UPDATE public.operation_reports SET profile_id = user_id WHERE profile_id IS NULL AND user_id IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_operation_reports_profile_id ON public.operation_reports(profile_id);

ALTER TABLE public.operation_reports DROP CONSTRAINT IF EXISTS operation_reports_profile_id_fkey;
DO $$ BEGIN
  ALTER TABLE public.operation_reports
    ADD CONSTRAINT operation_reports_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 2: DEFAULT DEĞER ÇAKIŞMALARINI ÇÖZ
-- ═══════════════════════════════════════════════════════════════════════════════

-- financial_health: unified_core_schema 'healthy' DEFAULT ile oluşturulmuştu,
-- 20260101000003_financial_health.sql de 'healthy' DEFAULT ekliyor — çakışma yok
-- Ama emin olmak için teyit et
ALTER TABLE public.profiles ALTER COLUMN financial_health SET DEFAULT 'healthy';

-- money: BIGINT olmalı, DEFAULT 0
ALTER TABLE public.profiles ALTER COLUMN money SET DEFAULT 0;

-- reputation: DEFAULT 20
ALTER TABLE public.profiles ALTER COLUMN reputation SET DEFAULT 20;

-- level: DEFAULT 1
ALTER TABLE public.profiles ALTER COLUMN level SET DEFAULT 1;

-- current_day: DEFAULT 1
ALTER TABLE public.profiles ALTER COLUMN current_day SET DEFAULT 1;

-- ticket_price: DEFAULT 30
ALTER TABLE public.profiles ALTER COLUMN ticket_price SET DEFAULT 30;

-- is_bot: DEFAULT false
ALTER TABLE public.profiles ALTER COLUMN is_bot SET DEFAULT false;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 3: VERİ BÜTÜNLÜĞÜ KONTROLÜ
-- ═══════════════════════════════════════════════════════════════════════════════

-- Zombi oyuncuları tespit et (profile_id'si olmayan ama satılık olmayan)
DO $$
DECLARE
  zombie_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO zombie_count
  FROM public.players p
  WHERE p.profile_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p.profile_id);

  IF zombie_count > 0 THEN
    RAISE NOTICE 'UYARI: % zombi oyuncu tespit edildi (profile_id mevcut değil)', zombie_count;
    -- Zombi oyuncuların profile_id'sini NULL yap
    UPDATE public.players
    SET profile_id = NULL, team_name = NULL, club = NULL
    WHERE profile_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = players.profile_id);
    RAISE NOTICE 'Zombi oyuncular temizlendi';
  ELSE
    RAISE NOTICE 'Zombi oyuncu yok, veri bütünlüğü sağlam';
  END IF;
END $$;

-- Zombi transfer ilanları temizle (satıcı profili olmayan)
DO $$
DECLARE
  zombie_listing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO zombie_listing_count
  FROM public.transfer_market tm
  WHERE tm.seller_id IS NOT NULL
    AND tm.seller_id != 'free-agent-system'
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = tm.seller_id);

  IF zombie_listing_count > 0 THEN
    RAISE NOTICE 'UYARI: % zombi ilan tespit edildi', zombie_listing_count;
    DELETE FROM public.transfer_market
    WHERE seller_id IS NOT NULL
      AND seller_id != 'free-agent-system'
      AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = transfer_market.seller_id);
    RAISE NOTICE 'Zombi ilanlar temizlendi';
  END IF;
END $$;
