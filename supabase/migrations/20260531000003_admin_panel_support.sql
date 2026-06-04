-- ═══════════════════════════════════════════════════════════════════════════════
-- Admin Panel Desteği + RPC Düzeltmesi
--
-- 1. profiles tablosuna email sütunu ekle (auth.users ile eşleştirme)
-- 2. rpc_update_profile fonksiyonunu düzelt (JSONB cast + NULL handling)
-- 3. selimporsuk@gmail.com kullanıcısına admin rolü ata
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Email sütunu ekle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- auth.users'daki emailleri profiles'a geri doldur
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id::text AND (p.email IS NULL OR p.email = '');

-- 2. rpc_update_profile fonksiyonunu düzelt
-- JSONB değerleri için ::jsonb cast, NULL değerler için COALESCE
CREATE OR REPLACE FUNCTION public.rpc_update_profile(
  p_profile_id TEXT,
  p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key TEXT;
  val JSONB;
  set_clauses TEXT := '';
  full_query TEXT;
  allowed_keys TEXT[] := ARRAY[
    'money', 'credits', 'last_friendly_date', 'daily_friendly_count',
    'current_day', 'ticket_price', 'financial_health', 'team_logo',
    'stadium_upgrades', 'sponsors', 'reputation', 'fans', 'level',
    'xp', 'scout_slots', 'staff_coaches', 'staff_physios', 'staff_monthly_fees',
    'email', 'role', 'league_name', 'league_tier', 'league_position',
    'manager_name', 'team_name', 'primary_color', 'secondary_color',
    'stadium_name', 'philosophy', 'stadium_capacity', 'academy_level',
    'is_bot', 'bot_difficulty', 'onboarding_completed', 'badges',
    'tv_revenue_weekly', 'consecutive_losses', 'region',
    'active_upgrade_type', 'active_upgrade_id', 'active_upgrade_finish_day',
    'active_upgrade_speedup', 'active_upgrade_started_at', 'active_upgrade_end_at'
  ];
  jsonb_keys TEXT[] := ARRAY[
    'stadium_upgrades', 'sponsors', 'defense_powers', 'badges',
    'trait_levels', 'style_levels', 'injury_history', 'injury'
  ];
  col_type TEXT;
BEGIN
  -- Sadece izin verilen anahtarları işle
  FOR key, val IN SELECT k, v FROM jsonb_each(p_updates)
  LOOP
    IF key = ANY(allowed_keys) THEN
      -- Sütun tipini kontrol et
      SELECT data_type INTO col_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = key
      LIMIT 1;

      IF col_type = 'jsonb' OR key = ANY(jsonb_keys) THEN
        -- JSONB sütun: NULL veya JSONB değer
        IF val IS NULL OR val = 'null'::jsonb THEN
          set_clauses := set_clauses || format('%I = NULL, ', key);
        ELSE
          set_clauses := set_clauses || format('%I = %L::jsonb, ', key, val);
        END IF;
      ELSIF col_type = 'bigint' OR col_type = 'integer' OR col_type = 'numeric' THEN
        -- Sayısal sütun
        IF val IS NULL OR val = 'null'::jsonb THEN
          set_clauses := set_clauses || format('%I = 0, ', key);
        ELSE
          set_clauses := set_clauses || format('%I = %s, ', key, val);
        END IF;
      ELSIF col_type = 'boolean' THEN
        IF val IS NULL OR val = 'null'::jsonb THEN
          set_clauses := set_clauses || format('%I = FALSE, ', key);
        ELSE
          set_clauses := set_clauses || format('%I = %s, ', key, val);
        END IF;
      ELSE
        -- Text ve diğer sütunlar
        IF val IS NULL OR val = 'null'::jsonb THEN
          set_clauses := set_clauses || format('%I = NULL, ', key);
        ELSE
          set_clauses := set_clauses || format('%I = %L, ', key, val #>> '{}');
        END IF;
      END IF;
    END IF;
  END LOOP;

  -- Boş güncelleme
  IF set_clauses = '' THEN
    RETURN jsonb_build_object('success', true, 'message', 'No valid fields to update');
  END IF;

  -- Sondaki virgülü temizle
  set_clauses := TRIM(TRAILING ', ' FROM set_clauses);

  -- Dinamik UPDATE sorgusu oluştur
  full_query := format('UPDATE public.profiles SET %s WHERE id = %L', set_clauses, p_profile_id);

  EXECUTE full_query;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Profile not found');
  END IF;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'reason', SQLERRM);
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.rpc_update_profile TO anon, authenticated;

-- 3. selimporsuk@gmail.com kullanıcısına admin rolü ata
-- auth.users'dan bul, profiles'a role='admin' ata
DO $$
DECLARE
  v_user_id TEXT;
BEGIN
  -- auth.users'dan email ile bul
  SELECT id::text INTO v_user_id
  FROM auth.users
  WHERE email = 'selimporsuk@gmail.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Profili güncelle
    UPDATE public.profiles
    SET role = 'admin', email = 'selimporsuk@gmail.com'
    WHERE id = v_user_id;

    RAISE NOTICE 'Admin rolü atandı: % (id: %)', 'selimporsuk@gmail.com', v_user_id;
  ELSE
    RAISE NOTICE 'Kullanıcı bulunamadı: %', 'selimporsuk@gmail.com';
  END IF;
END $$;

-- 4. RLS politikası: Admin rolündeki kullanıcılar tüm profilleri güncelleyebilir
-- Mevcut update politikasını değiştir
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_rpc_only" ON public.profiles;

-- Admin kullanıcılar her profili güncelleyebilir, normal kullanıcılar sadece kendi profilini
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id::uuid
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = id::uuid
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Players tablosu: Admin güncelleyebilir
DROP POLICY IF EXISTS "players_update_own" ON public.players;
DROP POLICY IF EXISTS "players_update_rpc_only" ON public.players;
CREATE POLICY "players_update_own_or_admin" ON public.players
  FOR UPDATE USING (
    auth.uid() = profile_id::uuid
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Players delete: Admin silebilir
DROP POLICY IF EXISTS "players_delete_service" ON public.players;
CREATE POLICY "players_delete_admin" ON public.players
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Fixtures: Admin güncelleyebilir
DROP POLICY IF EXISTS "fixtures_update_service" ON public.fixtures;
CREATE POLICY "fixtures_update_admin" ON public.fixtures
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
    OR true
  );

-- Schema cache yenile
NOTIFY pgrst, 'reload schema';
