-- =============================================================================
-- RPC: increment_player_ages
-- Sezon sonu yaşlandırma için verimli toplu güncelleme fonksiyonu.
-- Tüm oyuncuların yaşını 1 artırır (age IS NOT NULL olanlar).
-- Çağrı: SELECT increment_player_ages();
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_player_ages()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE players SET age = age + 1 WHERE age IS NOT NULL;
$$;
