-- ═══════════════════════════════════════════════════════════════════════════════
-- DOSYA: 04_ensure_tables_exist.sql
-- TARIH: 2026-05-27
-- ACIKLAMA: Eksik tablolari olustur (IF NOT EXISTS ile idempotent)
--
-- KULLANIM: Supabase Dashboard → SQL Editor → Yapistir → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- player_career_stats (kariyer istatistikleri)
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

-- season_stats (sezon istatistikleri)
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

-- cup_seasons (kupa sezonlari)
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

-- weekly_evolution (haftalik gelisim)
CREATE TABLE IF NOT EXISTS public.weekly_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  week INTEGER NOT NULL,
  rating_change NUMERIC DEFAULT 0,
  stat_changes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- training_attendances (antrenman katilim)
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

-- youth_facilities (altyapi tesisleri)
CREATE TABLE IF NOT EXISTS public.youth_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL UNIQUE,
  facility_levels JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- hall_of_fame (söhretler saloni)
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

-- season_awards (sezon odulleri)
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

-- notification_preferences (bildirim ayarlari)
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

-- rate_limits (hiz sinirlama)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- facility_upgrade_costs (tesis yukseltme maliyetleri)
CREATE TABLE IF NOT EXISTS public.facility_upgrade_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_type TEXT NOT NULL,
  target_level INTEGER NOT NULL,
  credits_cost INTEGER NOT NULL DEFAULT 0,
  upgrade_days INTEGER NOT NULL DEFAULT 1
);


-- ═══ SEED: facility_upgrade_costs (seviye 6-10) ═══
-- Sadece tablo bossa eklenir
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
    RAISE NOTICE 'facility_upgrade_costs seed data eklendi (seviye 6-10)';
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
