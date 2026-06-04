-- ═══════════════════════════════════════════════════════════════════════
-- TASARIM-2: Trophy Cabinet & Achievement Badges
-- Kupa dolabı ve başarı rozetleri sistemi
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Kupa Dolabı (Trophy Cabinet) ──────────────────────────────────
-- Lig, kupa ve süper kupa şampiyonluklarını kaydeder
CREATE TABLE IF NOT EXISTS public.trophy_cabinet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trophy_type TEXT NOT NULL, -- 'league', 'cup', 'super_cup'
  season TEXT,
  team_name TEXT,
  league_name TEXT,
  won_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trophy_cabinet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trophies_read_all" ON public.trophy_cabinet FOR SELECT USING (true);
CREATE POLICY "trophies_insert_rpc" ON public.trophy_cabinet FOR INSERT WITH CHECK (false);

-- Index for fast profile lookup
CREATE INDEX IF NOT EXISTS idx_trophy_cabinet_profile ON public.trophy_cabinet(profile_id);

-- ─── Başarı Rozetleri (Achievement Badges) ─────────────────────────
-- Oyun içi başarımları temsil eden rozetler
CREATE TABLE IF NOT EXISTS public.achievement_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL, -- 'first_win', 'unbeaten_10', 'top_scorer', 'youth_star', etc.
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, badge_type)
);

ALTER TABLE public.achievement_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_read_all" ON public.achievement_badges FOR SELECT USING (true);
CREATE POLICY "badges_insert_rpc" ON public.achievement_badges FOR INSERT WITH CHECK (false);

-- Index for fast profile lookup
CREATE INDEX IF NOT EXISTS idx_achievement_badges_profile ON public.achievement_badges(profile_id);
