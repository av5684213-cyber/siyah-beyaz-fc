-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: team_sponsorships tablosu ve decrement_sponsorship_rounds RPC
-- ═══════════════════════════════════════════════════════════════════
-- Takım sponsorluk anlaşmalarını tutar.
-- Hem weekly-income cron'u hem de sponsors/offers API'si tarafından kullanılır.
-- weekly-income: profile_id, weekly_income, remaining_rounds, status
-- sponsors/offers: team_id (= profile_id), sponsor_id, sponsor_name, sponsor_tier,
--                  sponsor_logo, signed_week, duration_weeks, weekly_income, total_income

CREATE TABLE IF NOT EXISTS team_sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,                          -- Hangi profile'a ait (profiles.id = TEXT)
  team_id TEXT,                                      -- Alias: profile_id ile aynı (sponsors/offers API uyumu)
  sponsor_id TEXT,                                   -- SPONSOR_POOL'daki sponsor id (s1, s2, vb.)
  sponsor_name TEXT NOT NULL,                        -- Sponsor adı
  sponsor_tier INTEGER DEFAULT 1,                    -- 1=Yerel, 2=Bölgesel, 3=Global
  sponsor_logo TEXT,                                 -- Emoji logo
  amount NUMERIC DEFAULT 0,                          -- Toplam anlaşma tutarı (eski alan, uyumluluk)
  weekly_income NUMERIC NOT NULL DEFAULT 0,          -- Haftalık sponsor geliri
  total_income NUMERIC DEFAULT 0,                    -- Toplam gelir (weekly_income * duration)
  rounds_remaining INTEGER,                          -- Kalan tur sayısı (her hafta azalır)
  remaining_rounds INTEGER,                          -- Alias: rounds_remaining ile aynı
  duration_weeks INTEGER,                            -- Anlaşma süresi (hafta)
  signed_week INTEGER DEFAULT 1,                     -- İmzalanan hafta
  status TEXT NOT NULL DEFAULT 'active',             -- active, expired, cancelled
  started_at TIMESTAMPTZ DEFAULT NOW(),              -- Başlangıç tarihi
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eğer team_id NULL ise profile_id ile doldur (geriye dönük uyumluluk)
UPDATE team_sponsorships SET team_id = profile_id WHERE team_id IS NULL;

-- Eğer remaining_rounds NULL ise rounds_remaining'den kopyala
UPDATE team_sponsorships SET remaining_rounds = rounds_remaining WHERE remaining_rounds IS NULL AND rounds_remaining IS NOT NULL;

-- Eğer rounds_remaining NULL ise remaining_rounds'den kopyala
UPDATE team_sponsorships SET rounds_remaining = remaining_rounds WHERE rounds_remaining IS NULL AND remaining_rounds IS NOT NULL;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_team_sponsorships_profile_id
  ON team_sponsorships (profile_id);
CREATE INDEX IF NOT EXISTS idx_team_sponsorships_status
  ON team_sponsorships (status);
CREATE INDEX IF NOT EXISTS idx_team_sponsorships_profile_status
  ON team_sponsorships (profile_id, status);

-- RLS (Row Level Security)
ALTER TABLE team_sponsorships ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (cron job'lar service_role ile çalışır)
CREATE POLICY "Sponsorships are readable by all" ON team_sponsorships
  FOR SELECT USING (true);

-- Sadece service_role insert/update yapabilir
CREATE POLICY "Sponsorships managed by service" ON team_sponsorships
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Sponsorships updatable by service" ON team_sponsorships
  FOR UPDATE USING (true);

-- ═══════════════════════════════════════════════════════════════════
-- RPC: decrement_sponsorship_rounds()
-- Tüm aktif sponsorlukların rounds_remaining ve remaining_rounds değerini 1 azaltır.
-- rounds_remaining 0 veya altına düşen sponsorlukları expired yapar.
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION decrement_sponsorship_rounds()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Her iki kolonu da azalt (farklı kod yolları farklı kolon kullanıyor)
  UPDATE team_sponsorships
  SET
    rounds_remaining = GREATEST(0, COALESCE(rounds_remaining, 0) - 1),
    remaining_rounds = GREATEST(0, COALESCE(remaining_rounds, 0) - 1)
  WHERE status = 'active';

  -- Süresi dolanları expired yap
  UPDATE team_sponsorships
  SET status = 'expired'
  WHERE status = 'active'
    AND COALESCE(rounds_remaining, 0) <= 0
    AND COALESCE(remaining_rounds, 0) <= 0;
END;
$$;
