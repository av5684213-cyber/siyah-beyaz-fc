-- ═══════════════════════════════════════════════════════════════════════════════
-- 20260529000010_market_transfer_rpc.sql
-- Piyasa satın alma işlemlerini atomik yapan RPC fonksiyonu
-- Race condition riskini ortadan kaldırır: tüm adımlar tek DB işlemi içinde
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── rpc_market_buy ─────────────────────────────────────────────────────────
-- Piyasadan doğrudan satın alma (müzayede değil) işlemini atomik olarak yapar:
--   1. İlanı kilitle ve kontrol et (aktif mi? müzayede mi?)
--   2. Alıcının bakiyesini kilitle ve kontrol et
--   3. Vergi hesapla (%2.5)
--   4. Alıcının parasını düş
--   5. Satıcının parasına ekle (vergi sonrası)
--   6. Oyuncunun sahipliğini transfer et
--   7. İlanı deaktif et
-- Tüm adımlar tek işlem (transaction) içinde — ara durum riski yok
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_market_buy(
  p_listing_id UUID,
  p_buyer_id TEXT,
  p_buyer_team TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
  v_tax_amount NUMERIC;
  v_seller_revenue NUMERIC;
  v_buyer_money NUMERIC;
BEGIN
  -- 1. İlanı kilitle ve oku (FOR UPDATE = satır kilidi, race condition önler)
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

  IF v_listing.is_auction = true THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Bu bir müzayede ilanı, placeBid kullanın');
  END IF;

  -- 2. Alıcının bakiyesini kilitle ve kontrol et
  SELECT money INTO v_buyer_money
  FROM public.profiles
  WHERE id = p_buyer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Alıcı profili bulunamadı');
  END IF;

  IF v_buyer_money < v_listing.price THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Yetersiz bütçe');
  END IF;

  -- 3. Vergi hesapla (%2.5)
  v_tax_amount := v_listing.price * 0.025;
  v_seller_revenue := v_listing.price - v_tax_amount;

  -- 4. Alıcının parasını düş
  UPDATE public.profiles
  SET money = money - v_listing.price
  WHERE id = p_buyer_id;

  -- 5. Satıcının parasına ekle (serbest oyuncu ise atla)
  IF v_listing.seller_id IS NOT NULL AND v_listing.seller_id != 'free-agent-system' THEN
    UPDATE public.profiles
    SET money = money + v_seller_revenue
    WHERE id = v_listing.seller_id;
  END IF;

  -- 6. Oyuncunun sahipliğini transfer et
  UPDATE public.players
  SET profile_id = p_buyer_id,
      team_name = COALESCE(p_buyer_team, p_buyer_id),
      club = COALESCE(p_buyer_team, p_buyer_id),
      is_for_sale = false
  WHERE id = v_listing.player_id;

  -- 7. İlanı deaktif et
  UPDATE public.transfer_market
  SET is_active = false
  WHERE id = p_listing_id;

  RETURN jsonb_build_object(
    'success', true,
    'price', v_listing.price,
    'tax_amount', v_tax_amount,
    'seller_revenue', v_seller_revenue,
    'player_id', v_listing.player_id
  );
END;
$$;

-- Yetki ver
GRANT EXECUTE ON FUNCTION public.rpc_market_buy(UUID, TEXT, TEXT) TO anon, authenticated;
