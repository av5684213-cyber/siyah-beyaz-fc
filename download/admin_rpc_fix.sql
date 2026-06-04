-- ═══════════════════════════════════════════════════════════════════════════════
-- Admin Panel RPC Fix - Supabase SQL Editor'de çalıştırın
-- Bu dosyayı Supabase Dashboard > SQL Editor'a yapıştırıp çalıştırın
-- ═══════════════════════════════════════════════════════════════════════════════

-- Fix rpc_update_profile (SQL syntax error düzeltmesi)
CREATE OR REPLACE FUNCTION public.rpc_update_profile(
  p_profile_id TEXT,
  p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
  v_allowed_fields TEXT[] := ARRAY['money', 'credits', 'last_friendly_date', 'daily_friendly_count', 'current_day', 'ticket_price', 'financial_health', 'team_logo', 'stadium_upgrades', 'sponsors', 'reputation', 'fans', 'level', 'xp', 'scout_slots', 'staff_coaches', 'staff_physios', 'staff_monthly_fees'];
  v_field TEXT;
  v_value JSONB;
  v_set_clause TEXT := '';
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_profile_id) INTO v_exists;
  IF NOT v_exists THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Profil bulunamadi');
  END IF;

  FOR v_field, v_value IN SELECT key, value FROM jsonb_each(p_updates)
  LOOP
    IF v_field = ANY(v_allowed_fields) THEN
      IF v_set_clause != '' THEN v_set_clause := v_set_clause || ', ';
      END IF;
      v_set_clause := v_set_clause || v_field || ' = ' || quote_literal(v_value #>> '{}');
    END IF;
  END LOOP;

  IF v_set_clause = '' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Guncellenebilir alan yok');
  END IF;

  EXECUTE format('UPDATE public.profiles SET %s WHERE id = %L', v_set_clause, p_profile_id);

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_update_profile(TEXT, JSONB) TO anon, authenticated;

-- Schema cache yenile
NOTIFY pgrst, 'reload schema';
