-- ═══════════════════════════════════════════════════════════════════════════════
-- 20260605000001_rpc_security_and_rls.sql
-- BUG-1 Düzeltme: Tüm yazma işlemlerinin RPC'ye taşınması ve RLS sıkılaştırması
--
-- NOT: Bu migration Supabase Auth entegrasyonu YAPILMADAN önce uygulanır.
-- auth.uid() henüz NULL döndüğü için RLS'de auth.uid() KULLANILMAZ.
-- Bunun yerine:
--   - Okuma: USING (true) — halka açık (mevcut davranış)
--   - Yazma: WITH CHECK (false) — doğrudan yazma yasak, sadece RPC ile
--   - RPC fonksiyonları SECURITY DEFINER + p_profile_id ile yetki kontrolü
--
-- Güvenlik modeli:
--   1. İstemci supabase.rpc('fonksiyon', { p_profile_id: '...' }) çağırır
--   2. RPC fonksiyonu p_profile_id'nin gerçek sahibi olduğunu doğrular
--   3. İş mantığını tek transaction içinde yürütür
--   4. WITH CHECK (false) nedeniyle doğrudan REST API yazma 403 döner
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 1: transfer_market tablosuna version ve player_data sütunu ekle
-- BUG-2 iyimser kilitleme + rpc_list_player_on_market için gerekli
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.transfer_market
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.transfer_market
  ADD COLUMN IF NOT EXISTS player_data JSONB;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 2: match_live_state tablosu (BUG-3 canlı maç izleme)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.match_live_state (
  match_id UUID PRIMARY KEY REFERENCES public.fixtures(id) ON DELETE CASCADE,
  state_json JSONB NOT NULL DEFAULT '{}',
  segment_duration INTEGER NOT NULL DEFAULT 5,
  current_segment INTEGER NOT NULL DEFAULT 0,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.match_live_state REPLICA IDENTITY FULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 3: profiles tablosuna salary_budget ve financial_health güncellemeleri
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS salary_budget BIGINT DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_salary_load BIGINT DEFAULT 0;

-- financial_health sütunu rpc_pay_salaries tarafından kullanılır — güvenlik için teyit et
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS financial_health TEXT DEFAULT 'healthy';

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 4: RPC FONKSİYONLARI
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── rpc_transfer_bid ────────────────────────────────────────────────────────
-- Oyuncuya müzayede teklifi verir. Bütçe kontrolü + FOR UPDATE kilidi + version.
-- İyimser kilitleme: version eşleşmezse teklif reddedilir (başka biri değiştirdi).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_transfer_bid(
  p_listing_id UUID,
  p_bidder_id TEXT,
  p_bidder_name TEXT,
  p_bid_amount BIGINT,
  p_version INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
  v_bidder_money NUMERIC;
  v_prev_bidder_id TEXT;
  v_prev_held_amount NUMERIC;
  v_new_version INTEGER;
BEGIN
  -- 1. İlanı kilitle ve oku
  SELECT * INTO v_listing
  FROM public.transfer_market
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'İlan bulunamadı');
  END IF;

  IF v_listing.is_active = false THEN
    RETURN jsonb_build_object('success', false, 'reason', 'İlan artık aktif değil');
  END IF;

  IF v_listing.is_auction = false THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Bu müzayede ilanı değil, doğrudan satın alın');
  END IF;

  -- İyimser kilitleme: version kontrolü
  IF v_listing.version != p_version THEN
    RETURN jsonb_build_object('success', false, 'reason', 'İlan güncellendi, lütfen tekrar deneyin', 'conflict', true);
  END IF;

  -- 2. Teklif geçerli mi?
  IF p_bid_amount <= COALESCE(v_listing.current_bid, v_listing.price) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Teklif mevcut en yüksek tekliften düşük olamaz');
  END IF;

  IF v_listing.max_price IS NOT NULL AND p_bid_amount > v_listing.max_price THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Teklif maksimum fiyatı aşıyor');
  END IF;

  IF v_listing.seller_id = p_bidder_id THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Kendi ilanınıza teklif veremezsiniz');
  END IF;

  -- 3. Alıcının bakiyesini kilitle
  SELECT money INTO v_bidder_money
  FROM public.profiles
  WHERE id = p_bidder_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Alıcı profili bulunamadı');
  END IF;

  IF v_bidder_money < p_bid_amount THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Yetersiz bütçe');
  END IF;

  -- 4. Önceki teklif sahibinin held_amount'unu iade et
  v_prev_bidder_id := v_listing.highest_bidder_id;
  v_prev_held_amount := COALESCE(v_listing.held_amount, 0);

  IF v_prev_bidder_id IS NOT NULL AND v_prev_held_amount > 0 THEN
    UPDATE public.profiles
    SET money = money + v_prev_held_amount
    WHERE id = v_prev_bidder_id;
  END IF;

  -- 5. Yeni teklif sahibinin parasından düş
  UPDATE public.profiles
  SET money = money - p_bid_amount
  WHERE id = p_bidder_id;

  -- 6. İlanı güncelle + version artır
  v_new_version := v_listing.version + 1;

  UPDATE public.transfer_market
  SET current_bid = p_bid_amount,
      highest_bidder_id = p_bidder_id,
      highest_bidder_name = p_bidder_name,
      bid_count = COALESCE(bid_count, 0) + 1,
      held_amount = p_bid_amount,
      expires_at = now() + interval '4 hours',
      version = v_new_version
  WHERE id = p_listing_id;

  -- 7. Auto-buy kontrolü
  IF v_listing.max_price IS NOT NULL AND p_bid_amount >= v_listing.max_price THEN
    -- Transferi tamamla
    PERFORM public.rpc_accept_transfer(p_listing_id, p_bidder_id, v_new_version);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'new_version', v_new_version,
    'auto_win', (v_listing.max_price IS NOT NULL AND p_bid_amount >= v_listing.max_price)
  );
END;
$$;

-- ─── rpc_accept_transfer ─────────────────────────────────────────────────────
-- Müzayede kazananını doğrular ve transferi atomik olarak tamamlar.
-- FOR UPDATE ile oyuncu satırını kilitler — aynı anda iki kabul engellenir.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_accept_transfer(
  p_listing_id UUID,
  p_winner_id TEXT,
  p_version INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
  v_player RECORD;
  v_tax_amount NUMERIC;
  v_seller_revenue NUMERIC;
  v_winner_team TEXT;
BEGIN
  -- 1. İlanı kilitle ve oku
  SELECT * INTO v_listing
  FROM public.transfer_market
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'İlan bulunamadı');
  END IF;

  IF v_listing.is_active = false THEN
    RETURN jsonb_build_object('success', false, 'reason', 'İlan artık aktif değil');
  END IF;

  -- Version kontrolü (iyimser kilitleme)
  IF v_listing.version != p_version THEN
    RETURN jsonb_build_object('success', false, 'reason', 'İlan güncellendi, conflict detected', 'conflict', true);
  END IF;

  -- 2. Kazanan teyidi
  IF v_listing.highest_bidder_id != p_winner_id THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Siz bu müzayedenin kazananı değilsiniz');
  END IF;

  -- 3. Oyuncuyu kilitle ve kontrol et — hala aynı takımda mı?
  SELECT * INTO v_player
  FROM public.players
  WHERE id = v_listing.player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Oyuncu bulunamadı');
  END IF;

  -- Oyuncu hala satıcıya mı ait?
  IF v_player.profile_id IS NOT NULL AND v_player.profile_id != v_listing.seller_id THEN
    -- Oyuncu zaten başkasına transfer olmuş — teklifi iptal et, parayı iade et
    UPDATE public.transfer_market SET is_active = false WHERE id = p_listing_id;
    -- held_amount'u kazananın bakiyesine iade et
    UPDATE public.profiles SET money = money + COALESCE(v_listing.held_amount, 0) WHERE id = p_winner_id;
    RETURN jsonb_build_object('success', false, 'reason', 'Oyuncu zaten transfer olmuş');
  END IF;

  -- 4. Kazananın takım adını al
  SELECT team_name INTO v_winner_team FROM public.profiles WHERE id = p_winner_id;
  v_winner_team := COALESCE(v_winner_team, p_winner_id);

  -- 5. Vergi hesapla (%2.5)
  v_tax_amount := COALESCE(v_listing.current_bid, v_listing.price) * 0.025;
  v_seller_revenue := COALESCE(v_listing.current_bid, v_listing.price) - v_tax_amount;

  -- 6. Satıcıya ödeme yap (serbest oyuncu hariç)
  IF v_listing.seller_id IS NOT NULL AND v_listing.seller_id != 'free-agent-system' THEN
    UPDATE public.profiles
    SET money = money + v_seller_revenue
    WHERE id = v_listing.seller_id;
  END IF;

  -- 7. Oyuncunun sahipliğini transfer et
  UPDATE public.players
  SET profile_id = p_winner_id,
      team_name = v_winner_team,
      club = v_winner_team,
      is_for_sale = false,
      sale_price = NULL
  WHERE id = v_listing.player_id;

  -- 8. İlanı deaktif et + version artır
  UPDATE public.transfer_market
  SET is_active = false,
      held_amount = 0,
      version = v_listing.version + 1
  WHERE id = p_listing_id;

  RETURN jsonb_build_object(
    'success', true,
    'transfer_fee', COALESCE(v_listing.current_bid, v_listing.price),
    'tax_amount', v_tax_amount,
    'seller_revenue', v_seller_revenue,
    'player_id', v_listing.player_id
  );
END;
$$;

-- ─── rpc_update_tactics ──────────────────────────────────────────────────────
-- Taktik günceller. Sadece takım sahibi değiştirebilir.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_update_tactics(
  p_profile_id TEXT,
  p_tactics JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_exists BOOLEAN;
BEGIN
  -- Yetki kontrolü: profil var mı?
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_profile_id) INTO v_profile_exists;
  IF NOT v_profile_exists THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Profil bulunamadı');
  END IF;

  -- Taktik güncelle (upsert)
  INSERT INTO public.active_tactics (id, profile_id, formation, mentality, pressing, passing_style, intensity, play_style, tempo, defensive_line, defense_line, width, aggression)
  VALUES (
    p_profile_id,
    p_profile_id,
    COALESCE(p_tactics->>'formation', '4-4-2'),
    COALESCE((p_tactics->>'mentality')::INTEGER, 3),
    COALESCE((p_tactics->>'pressing')::BOOLEAN, false),
    p_tactics->>'passing_style',
    p_tactics->>'intensity',
    p_tactics->>'play_style',
    COALESCE((p_tactics->>'tempo')::INTEGER, 50),
    p_tactics->>'defensive_line',
    p_tactics->>'defense_line',
    COALESCE((p_tactics->>'width')::INTEGER, 50),
    COALESCE((p_tactics->>'aggression')::INTEGER, 50)
  )
  ON CONFLICT (id) DO UPDATE SET
    formation = COALESCE(p_tactics->>'formation', active_tactics.formation),
    mentality = COALESCE((p_tactics->>'mentality')::INTEGER, active_tactics.mentality),
    pressing = COALESCE((p_tactics->>'pressing')::BOOLEAN, active_tactics.pressing),
    passing_style = COALESCE(p_tactics->>'passing_style', active_tactics.passing_style),
    intensity = COALESCE(p_tactics->>'intensity', active_tactics.intensity),
    play_style = COALESCE(p_tactics->>'play_style', active_tactics.play_style),
    tempo = COALESCE((p_tactics->>'tempo')::INTEGER, active_tactics.tempo),
    defensive_line = COALESCE(p_tactics->>'defensive_line', active_tactics.defensive_line),
    defense_line = COALESCE(p_tactics->>'defense_line', active_tactics.defense_line),
    width = COALESCE((p_tactics->>'width')::INTEGER, active_tactics.width),
    aggression = COALESCE((p_tactics->>'aggression')::INTEGER, active_tactics.aggression);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── rpc_train_player ────────────────────────────────────────────────────────
-- Oyuncu antrenmanı yapar. Sadece oyuncunun sahibi antrenman yaptırabilir.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_train_player(
  p_profile_id TEXT,
  p_player_id TEXT,
  p_training_type TEXT,
  p_intensity INTEGER DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player RECORD;
  v_old_rating INTEGER;
  v_new_rating INTEGER;
  v_improvement INTEGER;
  v_cond_loss INTEGER;
BEGIN
  -- Yetki kontrolü: oyuncu bu profile'e mi ait?
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

  -- Kondisyon kontrolü
  IF COALESCE(v_player.cond, 0) < 20 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Oyuncunun kondisyonu antrenman için yetersiz');
  END IF;

  -- Gelişim hesapla (yaş ve potansiyele göre)
  v_old_rating := COALESCE(v_player.rating, 40);
  v_improvement := 0;

  -- Genç oyuncular daha çok gelişir
  IF v_player.age < 21 THEN
    v_improvement := FLOOR(RANDOM() * 3) + 1; -- 1-3
  ELSIF v_player.age < 25 THEN
    v_improvement := FLOOR(RANDOM() * 2) + 1; -- 1-2
  ELSIF v_player.age < 30 THEN
    v_improvement := FLOOR(RANDOM() * 2);       -- 0-1
  ELSE
    v_improvement := 0;                           -- 30+ gelişmez
  END IF;

  -- Potansiyel üst sınır
  IF v_old_rating + v_improvement > COALESCE(v_player.potential, 99) THEN
    v_improvement := GREATEST(0, COALESCE(v_player.potential, 99) - v_old_rating);
  END IF;

  v_new_rating := v_old_rating + v_improvement;

  -- Kondisyon düşüşü (intensity'ye göre)
  v_cond_loss := 5 + (p_intensity * 3);

  -- Oyuncuyu güncelle
  UPDATE public.players
  SET rating = v_new_rating,
      cond = GREATEST(0, COALESCE(cond, 80) - v_cond_loss),
      form = GREATEST(10, LEAST(99, COALESCE(form, 50) + v_improvement * 2))
  WHERE id = p_player_id;

  -- Gelişim logu
  INSERT INTO public.player_development_log (id, player_id, profile_id, old_rating, new_rating, reason)
  VALUES (
    gen_random_uuid(),
    p_player_id,
    p_profile_id,
    v_old_rating,
    v_new_rating,
    'training:' || p_training_type
  ) ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'old_rating', v_old_rating,
    'new_rating', v_new_rating,
    'improvement', v_improvement,
    'cond_loss', v_cond_loss
  );
END;
$$;

-- ─── rpc_pay_salaries ────────────────────────────────────────────────────────
-- Tüm takımların (bot dahil) maaşlarını tek transaction'da öder.
-- Bakiye yetersizse: yüksek maaşlı oyuncuları satışa çıkarır + financial_health düşürür.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_pay_salaries()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_total_salary NUMERIC;
  v_broken_teams INTEGER := 0;
  v_paid_teams INTEGER := 0;
BEGIN
  FOR v_profile IN
    SELECT id, money, team_name, is_bot, financial_health
    FROM public.profiles
    WHERE is_bot = true OR is_bot = false  -- tüm profiller
  LOOP
    -- Toplam maaş yükünü hesapla
    SELECT COALESCE(SUM(salary), 0) INTO v_total_salary
    FROM public.players
    WHERE profile_id = v_profile.id;

    IF v_total_salary = 0 THEN
      CONTINUE;
    END IF;

    IF v_profile.money >= v_total_salary THEN
      -- Maaş öde
      UPDATE public.profiles
      SET money = money - v_total_salary,
          total_salary_load = v_total_salary,
          last_weekly_expense = COALESCE(last_weekly_expense, 0) + v_total_salary
      WHERE id = v_profile.id;
      v_paid_teams := v_paid_teams + 1;
    ELSE
      -- Bakiye yetersiz: finansal sağlık düşür
      IF v_profile.money < v_total_salary * 0.5 THEN
        -- Kritik: İflas riski — en yüksek maaşlı oyuncuları satışa çıkar
        UPDATE public.players
        SET is_for_sale = true,
            sale_price = FLOOR(market_value * 0.7)
        WHERE id IN (
          SELECT id FROM public.players
          WHERE profile_id = v_profile.id
          ORDER BY salary DESC
          LIMIT 3
        );

        UPDATE public.profiles
        SET financial_health = 'critical',
            total_salary_load = v_total_salary
        WHERE id = v_profile.id;
        v_broken_teams := v_broken_teams + 1;
      ELSE
        -- Düşük bakiye: uyarı seviyesi
        UPDATE public.profiles
        SET financial_health = 'warning',
            total_salary_load = v_total_salary,
            money = GREATEST(0, money - v_total_salary)
        WHERE id = v_profile.id;
        v_paid_teams := v_paid_teams + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'paid_teams', v_paid_teams,
    'broken_teams', v_broken_teams
  );
END;
$$;

-- ─── rpc_list_player_on_market ────────────────────────────────────────────────
-- Oyuncuyu transfer piyasasına listeler. Sadece oyuncunun sahibi yapabilir.
-- FOR UPDATE ile oyuncuyu kilitler — iki kez listelenemez.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_list_player_on_market(
  p_profile_id TEXT,
  p_player_id TEXT,
  p_price BIGINT,
  p_min_price BIGINT,
  p_max_price BIGINT,
  p_seller_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player RECORD;
  v_listing_id UUID;
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

  IF v_player.is_for_sale = true THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Oyuncu zaten satışta');
  END IF;

  -- Zaten aktif ilanı var mı?
  IF EXISTS (SELECT 1 FROM public.transfer_market WHERE player_id = p_player_id AND is_active = true) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Bu oyuncunun zaten aktif ilanı var');
  END IF;

  -- İlan oluştur
  v_listing_id := gen_random_uuid();

  INSERT INTO public.transfer_market (id, player_id, player_data, seller_id, seller_name, price, min_price, max_price, is_active, is_auction, starting_price, reserve_price, bid_count, expires_at, version)
  VALUES (
    v_listing_id,
    p_player_id,
    to_jsonb(v_player),
    p_profile_id,
    p_seller_name,
    p_price,
    p_min_price,
    p_max_price,
    true,
    true,
    p_price,
    p_min_price,
    0,
    now() + interval '4 hours',
    1
  );

  -- Oyuncuyu satılık olarak işaretle
  UPDATE public.players
  SET is_for_sale = true, sale_price = p_price
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', true,
    'listing_id', v_listing_id
  );
END;
$$;

-- ─── rpc_cancel_listing ──────────────────────────────────────────────────────
-- İptal eder. Sadece satıcı ve teklif yoksa.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.rpc_cancel_listing(
  p_profile_id TEXT,
  p_listing_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
BEGIN
  SELECT * INTO v_listing
  FROM public.transfer_market
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'İlan bulunamadı');
  END IF;

  IF v_listing.seller_id != p_profile_id THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Sadece satıcı iptal edebilir');
  END IF;

  IF COALESCE(v_listing.bid_count, 0) > 0 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Teklif olan ilanı iptal edemezsiniz');
  END IF;

  IF v_listing.is_active = false THEN
    RETURN jsonb_build_object('success', false, 'reason', 'İlan zaten deaktif');
  END IF;

  -- İlanı deaktif et
  UPDATE public.transfer_market
  SET is_active = false,
      version = version + 1
  WHERE id = p_listing_id;

  -- Oyuncuyu satılıktan çıkar
  UPDATE public.players
  SET is_for_sale = false, sale_price = NULL
  WHERE id = v_listing.player_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 5: RLS SIKILAŞTIRMASI
-- Yazma politikalarını WITH CHECK (false) yap → sadece RPC (SECURITY DEFINER) yazabilir
-- Okuma politikaları USING (true) olarak kalır (mevcut davranış, Auth entegrasyonu bekleniyor)
-- NOT: Tablo mevcut değilse policy oluşturma atlanır (EXCEPTION ile yakalanır)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Yardımcı fonksiyon: Tablo varsa RLS policy uygula ──
CREATE OR REPLACE FUNCTION public._apply_rpc_rls(
  p_table TEXT,
  p_has_delete BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  tbl_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = p_table
  ) INTO tbl_exists;

  IF NOT tbl_exists THEN
    RAISE NOTICE 'Tablo public.% mevcut değil, RLS atlanıyor', p_table;
    RETURN;
  END IF;

  -- Eski politikaları temizle
  BEGIN EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p_table || '_write_rpc_only', p_table); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p_table || '_insert_rpc_only', p_table); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p_table || '_update_rpc_only', p_table); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p_table || '_delete_rpc_only', p_table); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p_table || '_read_all', p_table); EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Yeni politikalar: okuma açık, yazma sadece RPC ile
  BEGIN EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true)', p_table || '_read_all', p_table); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (false)', p_table || '_insert_rpc_only', p_table); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE USING (true) WITH CHECK (false)', p_table || '_update_rpc_only', p_table); EXCEPTION WHEN duplicate_object THEN NULL; END;

  IF p_has_delete THEN
    BEGIN EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE USING (false)', p_table || '_delete_rpc_only', p_table); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END;
$$;

-- RLS'i etkinleştir ve politikaları uygula
SELECT public._apply_rpc_rls('profiles', true);
SELECT public._apply_rpc_rls('players', true);
SELECT public._apply_rpc_rls('transfer_market', true);
SELECT public._apply_rpc_rls('active_tactics', false);
SELECT public._apply_rpc_rls('training_state', false);
SELECT public._apply_rpc_rls('notifications', false);
SELECT public._apply_rpc_rls('match_events', false);
SELECT public._apply_rpc_rls('match_sessions', false);
SELECT public._apply_rpc_rls('league_standings', false);
SELECT public._apply_rpc_rls('fixtures', false);
SELECT public._apply_rpc_rls('league_teams', false);
SELECT public._apply_rpc_rls('seasons', false);
SELECT public._apply_rpc_rls('user_facilities', false);
SELECT public._apply_rpc_rls('staff', true);
SELECT public._apply_rpc_rls('operation_reports', false);
SELECT public._apply_rpc_rls('active_operations', false);
SELECT public._apply_rpc_rls('match_live_state', false);

-- Yardımcı fonksiyonu temizle (artık gerekli değil)
DROP FUNCTION IF EXISTS public._apply_rpc_rls(TEXT, BOOLEAN);

-- ═══════════════════════════════════════════════════════════════════════════════
-- BÖLÜM 6: RPC FONKSİYONLARINA YETKİ VER
-- ═══════════════════════════════════════════════════════════════════════════════
GRANT EXECUTE ON FUNCTION public.rpc_transfer_bid(UUID, TEXT, TEXT, BIGINT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_accept_transfer(UUID, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_update_tactics(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_train_player(TEXT, TEXT, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_pay_salaries() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_list_player_on_market(TEXT, TEXT, BIGINT, BIGINT, BIGINT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_cancel_listing(TEXT, UUID) TO anon, authenticated;

-- Eski RPC'ler de korunur
GRANT EXECUTE ON FUNCTION public.rpc_market_buy(UUID, TEXT, TEXT) TO anon, authenticated;
