-- rental_listings tablosu
CREATE TABLE IF NOT EXISTS rental_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  owner_team_id UUID,
  daily_cost INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed', 'cancelled')),
  duration_weeks INT DEFAULT 17,
  listed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- rental_agreements tablosu (yoksa oluştur)
CREATE TABLE IF NOT EXISTS rental_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES rental_listings(id) ON DELETE SET NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  owner_team_id TEXT,
  renter_team_id TEXT,
  duration_weeks INT DEFAULT 12,
  daily_cost INT DEFAULT 0,
  total_cost INT DEFAULT 0,
  commission INT DEFAULT 0,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_rental_listings_player_id ON rental_listings(player_id);
CREATE INDEX IF NOT EXISTS idx_rental_listings_status ON rental_listings(status);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_player_id ON rental_agreements(player_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_renter ON rental_agreements(renter_team_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_owner ON rental_agreements(owner_team_id);

-- RLS Politikaları (anon key için)
ALTER TABLE rental_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on rental_listings" ON rental_listings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rental_listings" ON rental_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rental_listings" ON rental_listings FOR UPDATE USING (true);
CREATE POLICY "Allow public read on rental_agreements" ON rental_agreements FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rental_agreements" ON rental_agreements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rental_agreements" ON rental_agreements FOR UPDATE USING (true);
