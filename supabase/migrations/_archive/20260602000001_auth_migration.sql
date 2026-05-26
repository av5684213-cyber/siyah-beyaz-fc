-- ============================================================
-- Migration: 20260602000001_auth_migration.sql
-- Description: Auth trigger, RLS policies, and column additions
-- ============================================================

-- ============================================================
-- 1. Trigger function: automatically create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, team_name, credits, money, created_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'team_name', 'Yeni Takım'),
    250,
    100000000,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. Trigger: fire handle_new_user after auth user creation
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. Add email column to profiles if it doesn't exist
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- ============================================================
-- 4. Enable RLS on all tables that don't have it yet
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_teams ENABLE ROW LEVEL SECURITY;

-- Enable RLS on transfer_market if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transfer_market') THEN
    EXECUTE 'ALTER TABLE public.transfer_market ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- ============================================================
-- 5. RLS policies for profiles table
-- ============================================================

-- Users can read own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid()::text);

-- Users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid()::text);

-- Users can insert own profile (for trigger)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid()::text);

-- Service role can do everything
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 6. RLS policies for players table
-- ============================================================

-- Anyone can read players (for league rankings etc)
DROP POLICY IF EXISTS "Anyone can read players" ON public.players;
CREATE POLICY "Anyone can read players" ON public.players
  FOR SELECT USING (true);

-- Users can insert own players
DROP POLICY IF EXISTS "Users can insert own players" ON public.players;
CREATE POLICY "Users can insert own players" ON public.players
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

-- Users can update own players
DROP POLICY IF EXISTS "Users can update own players" ON public.players;
CREATE POLICY "Users can update own players" ON public.players
  FOR UPDATE USING (profile_id = auth.uid()::text);

-- Users can delete own players
DROP POLICY IF EXISTS "Users can delete own players" ON public.players;
CREATE POLICY "Users can delete own players" ON public.players
  FOR DELETE USING (profile_id = auth.uid()::text);

-- Service role full access
DROP POLICY IF EXISTS "Service role can manage players" ON public.players;
CREATE POLICY "Service role can manage players" ON public.players
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 7. RLS policies for league_teams table
-- ============================================================

-- Anyone can read league teams
DROP POLICY IF EXISTS "Anyone can read league teams" ON public.league_teams;
CREATE POLICY "Anyone can read league teams" ON public.league_teams
  FOR SELECT USING (true);

-- Users can update their own team
DROP POLICY IF EXISTS "Users can update own league team" ON public.league_teams;
CREATE POLICY "Users can update own league team" ON public.league_teams
  FOR UPDATE USING (profile_id = auth.uid()::text);

-- Service role full access
DROP POLICY IF EXISTS "Service role can manage league teams" ON public.league_teams;
CREATE POLICY "Service role can manage league teams" ON public.league_teams
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 8. Fix watchlist policies to use consistent auth.uid()::text pattern
-- ============================================================

-- Drop old watchlist policies that used user_id::uuid = auth.uid()
DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can insert own watchlist" ON public.watchlist;
DROP POLICY IF EXISTS "Users can delete own watchlist" ON public.watchlist;

-- Recreate with consistent pattern
CREATE POLICY "Users can view own watchlist" ON public.watchlist
  FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own watchlist" ON public.watchlist
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can delete own watchlist" ON public.watchlist
  FOR DELETE USING (user_id = auth.uid()::text);

-- ============================================================
-- 9. Add INSERT policy for league_teams so new users can claim a team slot
-- ============================================================
DROP POLICY IF EXISTS "Users can insert league team" ON public.league_teams;
CREATE POLICY "Users can insert league team" ON public.league_teams
  FOR INSERT WITH CHECK (profile_id = auth.uid()::text);
