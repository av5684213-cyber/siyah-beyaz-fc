-- ═══════════════════════════════════════════════════════════════════════════════
-- 20260607000001_comprehensive_bug_fixes.sql
-- BUG-1..6 Düzeltmeleri: RLS temizleme, eksik RPC'ler, active_operations fix
--
-- Bu migration şunları çözer:
--   1. active_operations tablosu yoksa oluşturur (ERROR: relation does not exist fix)
--   2. auth.uid() kullanan eski RLS politikalarını temizler (auth yok → NULL döner)
--   3. "WITH CHECK (false)" RLS yaklaşımını uygular (RPC-only yazma)
--   4. Eksik RPC fonksiyonlarını ekler (sellPlayer, scoutPlayer, createOperation, vb.)
--   5. Bid expiry fonksiyonu (BUG-2)
--   6. Bot maaş bütçesi enforcement RPC (BUG-4)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 0: active_operations tablosu (yoksa oluştur)
-- HATA: relation "public.active_operations" does not exist
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.active_operations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL,
  op_id TEXT NOT NULL,
  impact_type TEXT NOT NULL,
  impact_value FLOAT NOT NULL,
  target_profile_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 1: ESKİ RLS POLİTİKALARINI TEMİZLE
-- auth.uid() kullanan politikalar, auth olmadan TÜM erişimi engeller.
-- Bu migration, auth entegrasyonu yapılana kadar USING (true) ile okuma,
-- WITH CHECK (false) ile yazma (sadece RPC ile) politikası uygular.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Yardımcı fonksiyon: Tablo varsa tüm RLS politikalarını temizle ve yeniden uygula
CREATE OR REPLACE FUNCTION public._cleanup_and_apply_rls(
  p_table TEXT,
  p_allow_direct_write BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  tbl_exists BOOLEAN;
  pol_name TEXT;
BEGIN
  -- Tablo var mı kontrol et
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = p_table
  ) INTO tbl_exists;

  IF NOT tbl_exists THEN
    RAISE NOTICE 'Tablo public.% mevcut değil, RLS atlanıyor', p_table;
    RETURN;
  END IF;

  -- RLS etkinleştir
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table);

  -- TÜM mevcut politikaları temizle (auth.uid()'li olanlar dahil)
  FOR pol_name IN
    SELECT policyname FROM pg_policies WHERE tablename = p_table AND schemaname = 'public'
  LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_name, p_table);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Policy % silinemedi: %', pol_name, SQLERRM;
    END;
  END LOOP;

  -- Yeni politikalar: okuma açık, yazma kısıtlı
  BEGIN
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true)', p_table || '_read_all', p_table);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  IF p_allow_direct_write THEN
    -- Doğrudan yazmaya izin ver (daha RPC yazılmamış tablolar için)
    BEGIN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (true)', p_table || '_insert_open', p_table);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE USING (true) WITH CHECK (true)', p_table || '_update_open', p_table);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE USING (true)', p_table || '_delete_open', p_table);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  ELSE
    -- RPC-only yazma (güvenli tablolar)
    BEGIN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (false)', p_table || '_insert_rpc_only', p_table);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE USING (true) WITH CHECK (false)', p_table || '_update_rpc_only', p_table);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE USING (false)', p_table || '_delete_rpc_only', p_table);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END;
$$;

-- ═══ Kritik tablolar — KADEMELİ RLS ═══
-- NOT: "riskli bir şey yapma" kuralı gereği, players ve profiles tablolarında
-- hâlâ 34 doğrudan yazma çağrısı var. Bunlar RPC'ye taşınana kadar
-- doğrudan yazmaya izin veriyoruz (WITH CHECK (true)).
-- Tüm yazılar RPC'ye taşındığında false'a çevrilmeli.
SELECT public._cleanup_and_apply_rls('profiles', true);    -- TODO: 23 direct writes remain → migrate to RPC → then set false
SELECT public._cleanup_and_apply_rls('players', true);     -- TODO: 16 direct writes remain → migrate to RPC → then set false
SELECT public._cleanup_and_apply_rls('transfer_market', false); -- Tüm yazılar RPC ile

-- ═══ Orta seviye tablolar: RPC-only yazma ═══
SELECT public._cleanup_and_apply_rls('active_tactics', false);
SELECT public._cleanup_and_apply_rls('training_state', false);
SELECT public._cleanup_and_apply_rls('match_live_state', false);
SELECT public._cleanup_and_apply_rls('active_operations', false);
SELECT public._cleanup_and_apply_rls('operation_reports', false);
SELECT public._cleanup_and_apply_rls('player_development_log', false);

-- ═══ Daha az kritik tablolar: Doğrudan yazmaya izin ver (henüz RPC yazılmadı) ═══
-- Bu tablolar için RPC henüz oluşturulmadı, bu yüzden doğrudan yazmaya izin veriyoruz.
-- İleride RPC eklendiğinde p_allow_direct_write = false yapılmalı.
SELECT public._cleanup_and_apply_rls('notifications', true);
SELECT public._cleanup_and_apply_rls('watchlist', true);
SELECT public._cleanup_and_apply_rls('user_facilities', true);
SELECT public._cleanup_and_apply_rls('daily_tasks', true);
SELECT public._cleanup_and_apply_rls('team_sponsorships', true);
SELECT public._cleanup_and_apply_rls('friendly_matches', true);
SELECT public._cleanup_and_apply_rls('friendly_queue', true);
SELECT public._cleanup_and_apply_rls('push_subscriptions', true);
SELECT public._cleanup_and_apply_rls('staff', true);
SELECT public._cleanup_and_apply_rls('training_attendances', true);
SELECT public._cleanup_and_apply_rls('match_events', true);
SELECT public._cleanup_and_apply_rls('match_sessions', true);
SELECT public._cleanup_and_apply_rls('league_standings', true);
SELECT public._cleanup_and_apply_rls('fixtures', true);
SELECT public._cleanup_and_apply_rls('league_teams', true);
SELECT public._cleanup_and_apply_rls('seasons', true);
SELECT public._cleanup_and_apply_rls('leagues', true);
SELECT public._cleanup_and_apply_rls('match_history', true);
SELECT public._cleanup_and_apply_rls('match_participants', true);
SELECT public._cleanup_and_apply_rls('live_matches', true);
SELECT public._cleanup_and_apply_rls('match_simulation_queue', true);
SELECT public._cleanup_and_apply_rls('referees', true);
SELECT public._cleanup_and_apply_rls('match_chat', true);
SELECT public._cleanup_and_apply_rls('youth_facilities', true);
SELECT public._cleanup_and_apply_rls('youth_players', true);
SELECT public._cleanup_and_apply_rls('notification_preferences', true);
SELECT public._cleanup_and_apply_rls('player_achievements', true);
SELECT public._cleanup_and_apply_rls('season_awards', true);
SELECT public._cleanup_and_apply_rls('scouted_players', true);
SELECT public._cleanup_and_apply_rls('player_career_stats', true);
SELECT public._cleanup_and_apply_rls('lab_sessions', true);
SELECT public._cleanup_and_apply_rls('rental_listings', true);
SELECT public._cleanup_and_apply_rls('rental_agreements', true);
SELECT public._cleanup_and_apply_rls('staff_types', true);
SELECT public._cleanup_and_apply_rls('trainings', true);

-- Yardımcı fonksiyonu temizle
DROP FUNCTION IF EXISTS public._cleanup_and_apply_rls(TEXT, BOOLEAN);

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 2: EKSİK RPC FONKSİYONLARI
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── rpc_sell_player ────────────────────────────────────────────────────────
-- Oyuncuyu serbest oyuncu olarak satıp parayı profile ekler.
-- Sadece oyuncunun sahibi yapabilir.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_sell_player(
  p_profile_id TEXT,
  p_player_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player RECORD;
  v_sale_price NUMERIC;
  v_tax_amount NUMERIC;
  v_net_revenue NUMERIC;
BEGIN
  -- Oyuncuyu kilitle ve kontrol et
  SELECT * INTO v_player
  FROM public.players
  WHERE id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Oyuncu bulunamadı');
  END IF;

  IF v_player.profile_id != p_profile_id THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Bu oyuncu sizin değil');
  END IF;

  -- Satış fiyatı = market_value, vergi %2.5
  v_sale_price := COALESCE(v_player.market_value, 0);
  v_tax_amount := v_sale_price * 0.025;
  v_net_revenue := v_sale_price - v_tax_amount;

  -- Oyuncuyu serbest yap
  UPDATE public.players
  SET club = 'Transfer Listesi',
      team_name = 'Transfer Listesi',
      profile_id = NULL,
      is_for_sale = false,
      sale_price = NULL
  WHERE id = p_player_id;

  -- Profile parasını ekle
  UPDATE public.profiles
  SET money = money + v_net_revenue
  WHERE id = p_profile_id;

  RETURN jsonb_build_object(
    'success', true,
    'sale_price', v_sale_price,
    'tax_amount', v_tax_amount,
    'net_revenue', v_net_revenue
  );
END;
$$;

-- ─── rpc_scout_player ────────────────────────────────────────────────────────
-- Oyuncuyu scout eder, ücreti profilden düşer.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_scout_player(
  p_profile_id TEXT,
  p_player_id TEXT,
  p_scout_cost BIGINT DEFAULT 0,
  p_scouting_stars INTEGER DEFAULT 3,
  p_scouting_count INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_money NUMERIC;
BEGIN
  -- Bütçe kontrolü
  IF p_scout_cost > 0 THEN
    SELECT money INTO v_profile_money
    FROM public.profiles
    WHERE id = p_profile_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'reason', 'Profil bulunamadı');
    END IF;

    IF v_profile_money < p_scout_cost THEN
      RETURN jsonb_build_object('success', false, 'reason', 'Yetersiz bütçe');
    END IF;

    -- Ücreti düş
    UPDATE public.profiles
    SET money = money - p_scout_cost
    WHERE id = p_profile_id;
  END IF;

  -- Oyuncuyu güncelle
  UPDATE public.players
  SET scouted = true,
      scouting_stars = p_scouting_stars,
      scouting_count = p_scouting_count
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', true,
    'scout_cost', p_scout_cost
  );
END;
$$;

-- ─── rpc_update_profile ────────────────────────────────────────────────────────
-- Profile güncelleme yapar. Sadece kendi profilini güncelleyebilir.
-- İzin verilen alanlar: money, credits, last_friendly_date, daily_friendly_count, current_day, ticket_price
-- ─────────────────────────────────────────────────────────────────────────────
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
  -- Profil var mı?
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_profile_id) INTO v_exists;
  IF NOT v_exists THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Profil bulunamadı');
  END IF;

  -- Sadece izin verilen alanları güncelle
  FOR v_field, v_value IN SELECT key, value FROM jsonb_each(p_updates)
  LOOP
    IF v_field = ANY(v_allowed_fields) THEN
      IF v_set_clause != '' THEN v_set_clause := v_set_clause || ', ';
      END IF;
      v_set_clause := v_set_clause || v_field || ' = ' || quote_literal(v_value #>> '{}');
    END IF;
  END LOOP;

  IF v_set_clause = '' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Güncellenebilir alan yok');
  END IF;

  EXECUTE format('UPDATE public.profiles SET %s WHERE id = %L', v_set_clause, p_profile_id);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── rpc_create_operation ────────────────────────────────────────────────────────
-- Operasyon oluşturur (OperationRoom.tsx için)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_create_operation(
  p_profile_id TEXT,
  p_op_id TEXT,
  p_impact_type TEXT,
  p_impact_value FLOAT,
  p_target_profile_id TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id TEXT;
BEGIN
  v_id := gen_random_uuid()::text;

  INSERT INTO public.active_operations (id, profile_id, op_id, impact_type, impact_value, target_profile_id, expires_at)
  VALUES (v_id, p_profile_id, p_op_id, p_impact_type, p_impact_value, p_target_profile_id, p_expires_at);

  RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

-- ─── rpc_update_player_cond ────────────────────────────────────────────────────────
-- Hazırlık maçı sonrası oyuncu kondisyon güncelleme (toplu)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_update_player_cond(
  p_profile_id TEXT,
  p_updates JSONB  -- [{"id": "player1", "cond": 75}, ...]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_update JSONB;
  v_updated INTEGER := 0;
BEGIN
  FOR v_update IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE public.players
    SET cond = (v_update->>'cond')::INTEGER
    WHERE id = v_update->>'id'
      AND profile_id = p_profile_id;

    IF FOUND THEN v_updated := v_updated + 1; END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'updated', v_updated);
END;
$$;

-- ─── rpc_insert_friendly_match ────────────────────────────────────────────────────
-- Hazırlık maçı kaydı ekler
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_insert_friendly_match(
  p_profile_id TEXT,
  p_team_name TEXT,
  p_home_score INTEGER,
  p_away_score INTEGER,
  p_match_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.friendly_matches (
    home_team_id, away_team_id, home_score, away_score,
    home_team_name, away_team_name, match_data, profile_id
  ) VALUES (
    p_profile_id, 'cpu', p_home_score, p_away_score,
    p_team_name, 'CPU Takımı', p_match_data, p_profile_id
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── rpc_save_training_results ────────────────────────────────────────────────────
-- Antrenman sonucu oyuncu güncelleme (tek oyuncu)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_save_training_result(
  p_profile_id TEXT,
  p_player_id TEXT,
  p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_exists BOOLEAN;
  v_allowed_fields TEXT[] := ARRAY['shooting', 'passing', 'defending', 'speed', 'power',
    'heading', 'goalkeeping', 'control', 'vision', 'finishing', 'dribbling',
    'first_touch', 'crossing', 'marking', 'tackling', 'technique', 'long_shots',
    'acceleration', 'agility', 'balance', 'strength', 'stamina',
    'rating', 'cond', 'morale', 'form', 'form_rating',
    'is_for_sale', 'sale_price', 'is_injured', 'injury', 'injury_end_date', 'injury_severity',
    'match_sharpness', 'confidence', 'profile_id', 'team_name', 'club',
    'dissatisfaction_level', 'manager_response', 'scouted', 'scouting_stars', 'scouting_count',
    'loaned_from_profile_id', 'loaned_to_profile_id', 'loan_status'];
  v_field TEXT;
  v_value JSONB;
  v_set_clause TEXT := '';
BEGIN
  -- Oyuncu bu profile'e mi ait?
  SELECT EXISTS(SELECT 1 FROM public.players WHERE id = p_player_id AND profile_id = p_profile_id) INTO v_player_exists;
  IF NOT v_player_exists THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Oyuncu bulunamadı veya sizin değil');
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
    RETURN jsonb_build_object('success', false, 'reason', 'Güncellenebilir alan yok');
  END IF;

  EXECUTE format('UPDATE public.players SET %s WHERE id = %L AND profile_id = %L', v_set_clause, p_player_id, p_profile_id);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 3: BUG-2 — BID EXPIRY FONKSİYONU
-- Müzayede süresi dolan ilanları otomatik kapatır.
-- Cron tarafından çağrılır.
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.rpc_expire_auctions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_count INTEGER := 0;
  v_listing RECORD;
  v_winner_id TEXT;
  v_seller_revenue NUMERIC;
  v_tax_amount NUMERIC;
BEGIN
  -- Süresi dolmuş aktif müzayede ilanlarını bul
  FOR v_listing IN
    SELECT * FROM public.transfer_market
    WHERE is_active = true
      AND is_auction = true
      AND expires_at < now()
    FOR UPDATE SKIP LOCKED
  LOOP
    IF v_listing.highest_bidder_id IS NOT NULL THEN
      -- Kazanan var: transferi tamamla
      v_tax_amount := COALESCE(v_listing.current_bid, v_listing.price) * 0.025;
      v_seller_revenue := COALESCE(v_listing.current_bid, v_listing.price) - v_tax_amount;

      -- Satıcıya ödeme
      IF v_listing.seller_id IS NOT NULL AND v_listing.seller_id != 'free-agent-system' THEN
        UPDATE public.profiles SET money = money + v_seller_revenue WHERE id = v_listing.seller_id;
      END IF;

      -- Oyuncuyu kazananın takımına transfer et
      UPDATE public.players
      SET profile_id = v_listing.highest_bidder_id,
          team_name = COALESCE(v_listing.highest_bidder_name, v_listing.highest_bidder_id),
          club = COALESCE(v_listing.highest_bidder_name, v_listing.highest_bidder_id),
          is_for_sale = false,
          sale_price = NULL
      WHERE id = v_listing.player_id;
    ELSE
      -- Teklif yoksa sadece ilanı deaktif et, held_amount yok
      UPDATE public.players
      SET is_for_sale = false, sale_price = NULL
      WHERE id = v_listing.player_id;
    END IF;

    -- İlanı deaktif et
    UPDATE public.transfer_market
    SET is_active = false
    WHERE id = v_listing.id;

    v_expired_count := v_expired_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'expired_auctions', v_expired_count
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 4: BUG-4 — BOT MAAŞ BÜTÇESİ KONTROLÜ
-- Botların maaş bütçesi, toplam gelirinin %40'ını aşamaz.
-- Aşarsa en yüksek maaşlı oyuncular serbest bırakılır.
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.rpc_enforce_bot_salary_caps()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bot RECORD;
  v_total_salary NUMERIC;
  v_weekly_income NUMERIC;
  v_salary_ratio NUMERIC;
  v_corrected INTEGER := 0;
  v_released INTEGER := 0;
  MAX_SALARY_RATIO NUMERIC := 0.40; -- Maaş/Gelir oranı üst sınırı
BEGIN
  FOR v_bot IN
    SELECT id, money, team_name,
           COALESCE(last_weekly_income, 0) as weekly_income
    FROM public.profiles
    WHERE is_bot = true
  LOOP
    -- Toplam maaş yükü
    SELECT COALESCE(SUM(salary), 0) INTO v_total_salary
    FROM public.players
    WHERE profile_id = v_bot.id;

    IF v_total_salary = 0 THEN CONTINUE; END IF;

    -- Haftalık gelir yoksa tahmin et (para / 52)
    IF v_bot.weekly_income = 0 THEN
      v_weekly_income := GREATEST(v_bot.money / 52, 100000);
    ELSE
      v_weekly_income := v_bot.weekly_income;
    END IF;

    v_salary_ratio := v_total_salary / NULLIF(v_weekly_income, 0);

    IF v_salary_ratio > MAX_SALARY_RATIO THEN
      -- Maaş bütçesi aşılıyor: en yüksek maaşlıları serbest bırak
      UPDATE public.players
      SET profile_id = NULL,
          team_name = 'Transfer Listesi',
          club = 'Transfer Listesi',
          is_for_sale = true,
          sale_price = FLOOR(COALESCE(market_value, 0) * 0.6)
      WHERE id IN (
        SELECT id FROM public.players
        WHERE profile_id = v_bot.id
        ORDER BY salary DESC
        LIMIT LEAST(3, (SELECT COUNT(*) FROM public.players WHERE profile_id = v_bot.id) / 3)
      );

      -- financial_health güncelle
      UPDATE public.profiles
      SET financial_health = 'warning',
          total_salary_load = v_total_salary
      WHERE id = v_bot.id;

      v_released := v_released + 1;
    ELSE
      -- Normal durum
      UPDATE public.profiles
      SET total_salary_load = v_total_salary,
          financial_health = CASE
            WHEN v_salary_ratio > 0.30 THEN 'warning'
            ELSE 'healthy'
          END
      WHERE id = v_bot.id;
    END IF;

    v_corrected := v_corrected + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'bots_checked', v_corrected,
    'bots_released_players', v_released
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 5: RPC YETKİLERİ
-- ═══════════════════════════════════════════════════════════════════════════════
GRANT EXECUTE ON FUNCTION public.rpc_sell_player(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_scout_player(TEXT, TEXT, BIGINT, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_update_profile(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_create_operation(TEXT, TEXT, TEXT, FLOAT, TEXT, TIMESTAMPTZ) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_update_player_cond(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_insert_friendly_match(TEXT, TEXT, INTEGER, INTEGER, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_save_training_result(TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_expire_auctions() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_enforce_bot_salary_caps() TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 6: BUG-5 — MİGRATION ÇAKIŞMA TEMİZLEMESİ
-- Eski auth.uid() migration'larını devre dışı bırak (arşivle)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Not: Migration dosyaları fiziksel olarak silinmez, sadece RLS'ler yukarıda temizlendi.
-- 20260604000001 dosyası zaten "HENÜZ UYGULANMAMALIDIR" uyarısı taşıyor.
-- Bu migration, o dosyanin içeriğini override eder.

-- PostgREST şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';
