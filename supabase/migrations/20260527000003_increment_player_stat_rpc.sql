-- ═══════════════════════════════════════════════════════════════════════════
-- increment_player_stat: Atomik oyuncu istatistik artırma fonksiyonu
--
-- Maç sonu istatistik güncellemelerinde race condition önlemek için
-- SECURITY DEFINER ile çalışan atomik RPC fonksiyonu.
-- Kullanım: increment_player_stat('player-uuid', 'goals', 1)
--
-- Desteklenen stat değerleri: goals, assists, yellow_cards, red_cards,
-- clean_sheets, matches_played, season_yellow_cards
-- ═══════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS increment_player_stat(TEXT, TEXT, INT);
CREATE OR REPLACE FUNCTION increment_player_stat(p_player_id TEXT, p_stat TEXT, p_amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Güvenlik: sadece izin verilen sütun adları
  IF p_stat NOT IN ('goals', 'assists', 'yellow_cards', 'red_cards',
                     'clean_sheets', 'matches_played', 'season_yellow_cards') THEN
    RAISE EXCEPTION 'Invalid stat column: %', p_stat;
  END IF;

  EXECUTE format('UPDATE players SET %I = COALESCE(%I, 0) + $1 WHERE id = $2', p_stat, p_stat)
  USING p_amount, p_player_id;
END;
$$;
