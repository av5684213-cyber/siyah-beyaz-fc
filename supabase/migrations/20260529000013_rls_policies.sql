-- ============================================================
-- Migration: Row Level Security (RLS) Politikaları
-- Tarih: 2026-05-29
-- AÇIKLAMA: Her tablo için RLS politikası ekler.
--   - players: Sadece kendi kadrosundaki oyuncuları görür/değiştirir
--   - matches: Sadece ilgili takımlar maç sonucunu görebilir
--   - transfer_market: İlan sahibi ve alıcı erişebilir
--   - league_standings: Herkes okuyabilir, kimse yazamaz
--
-- ⚠️ ÖNEMLİ: Bu migration'ı uygulamadan ÖNCE:
--   1. Auth entegrasyonunun tamamlandığından emin olun
--   2. Staging ortamında test edin
--   3. Mevcut verilerin erişilemez olmayacağını doğrulayın
--   4. auth.uid() ile profile_id eşlemesinin çalıştığını kontrol edin
--
-- UYGULAMA: Bu dosyayı Supabase Dashboard → SQL Editor'de çalıştırın
-- veya: npx supabase db push
-- ============================================================

-- ─── 0. RLS'yi etkinleştir (eğer devre dışıysa) ────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_market ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_facilities ENABLE ROW LEVEL SECURITY;

-- ─── 1. PROFILES tablosu ──────────────────────────────────────
-- Herkes kendi profilini okuyabilir, sadece kendi profilini güncelleyebilir
CREATE POLICY "Kendi profilini oku" ON profiles
  FOR SELECT USING (auth.uid()::text = auth_id);

CREATE POLICY "Kendi profilini guncelle" ON profiles
  FOR UPDATE USING (auth.uid()::text = auth_id);

-- Yeni kayıt: INSERT izni (signup sırasında)
CREATE POLICY "Yeni profil olustur" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = auth_id);

-- ─── 2. PLAYERS tablosu ───────────────────────────────────────
-- Sadece kendi kadrosundaki oyuncuları görebilir
CREATE POLICY "Kendi kadrosunu oku" ON players
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
    OR is_for_sale = true  -- Transfer listesindekiler herkese açık
  );

-- Sadece kendi oyuncusunu ekleyebilir/güncelleyebilir
CREATE POLICY "Kendi oyuncusunu ekle" ON players
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
  );

CREATE POLICY "Kendi oyuncusunu guncelle" ON players
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
  );

-- ─── 3. MATCHES tablosu ───────────────────────────────────────
-- Maçlar: ev sahibi veya deplasman takımının profile_id'sine sahip kullanıcılar görebilir
-- Not: Bu karmaşık bir join gerektirir, bu yüzden fonksiyon kullanıyoruz
CREATE OR REPLACE FUNCTION mac_takim_profili(match_row matches)
RETURNS SET OF UUID AS $$
  SELECT lt.profile_id
  FROM league_teams lt
  WHERE lt.id IN (match_row.home_team_id, match_row.away_team_id)
    AND lt.profile_id IS NOT NULL;
$$ LANGUAGE sql STABLE;

CREATE POLICY "Ilgili takimlar maci gorsun" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mac_takim_profili(matches)
      WHERE mac_takim_profili = (
        SELECT id FROM profiles WHERE auth.uid()::text = auth_id
      )
    )
    OR season_id IN (  -- Bot takımların maçları herkese açık
      SELECT season_id FROM matches
      WHERE home_team_id IN (SELECT id FROM league_teams WHERE is_bot = true)
        AND away_team_id IN (SELECT id FROM league_teams WHERE is_bot = true)
    )
  );

-- ─── 4. TRANSFER_MARKET tablosu ───────────────────────────────
-- İlan sahibi ve herkes (okuma) görebilir, ama sadece ilan sahibi düzenleyebilir
CREATE POLICY "Transfer ilanlarini oku" ON transfer_market
  FOR SELECT USING (true);  -- Aktif ilanlar herkese görünür

CREATE POLICY "Kendi ilanini ekle" ON transfer_market
  FOR INSERT WITH CHECK (
    seller_profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
  );

CREATE POLICY "Kendi ilanini guncelle" ON transfer_market
  FOR UPDATE USING (
    seller_profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
  );

CREATE POLICY "Kendi ilanini sil" ON transfer_market
  FOR DELETE USING (
    seller_profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
  );

-- ─── 5. LEAGUE_TEAMS tablosu ──────────────────────────────────
-- Lig tabloları herkes tarafından okunabilir (sıralama, fikstür vs.)
CREATE POLICY "Lig takimlarini oku" ON league_teams
  FOR SELECT USING (true);

-- Sadece kendi takımını güncelleyebilir
CREATE POLICY "Kendi takimini guncelle" ON league_teams
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
  );

-- ─── 6. WATCHLIST tablosu ─────────────────────────────────────
-- Sadece kendi watchlist'ini görebilir/yönetebilir
CREATE POLICY "Kendi watchlistini oku" ON watchlist
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
  );

CREATE POLICY "Kendi watchlistine ekle" ON watchlist
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
  );

CREATE POLICY "Kendi watchlistini sil" ON watchlist
  FOR DELETE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
  );

-- ─── 7. USER_FACILITIES tablosu ───────────────────────────────
CREATE POLICY "Kendi tesislerini oku" ON user_facilities
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
  );

CREATE POLICY "Kendi tesislerini guncelle" ON user_facilities
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth.uid()::text = auth_id
    )
  );

-- ─── NOT: Eski geçici RLS kapatma migration'ını geri al ───────
-- _archive/20260603000003_disable_rls_temporarily.sql dosyasındaki
-- DISABLE ROW LEVEL SECURITY komutları bu migration ile geçersiz kalır.
-- Auth entegrasyonu tamamlandığında bu migration uygulanmalıdır.
