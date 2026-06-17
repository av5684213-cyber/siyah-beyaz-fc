-- ═══════════════════════════════════════════════════════════════════════════
-- TÜM OYUNCULARIN ÖZELLİKLERİNİ MEVKİ BAZLI YENİDEN ÜRET
--
-- 50 değerinde takılı kalan özellikleri mevkiye göre rastgele değerlerle değiştir.
-- Supabase Dashboard > SQL Editor > yapıştır > Run
-- ═══════════════════════════════════════════════════════════════════════════

-- Helper: mevki grubuna göre rastgele değer üret
-- position parametresi: 'GK', 'DEF', 'MID', 'FWD'
-- priority: 'cok_dusuk', 'dusuk', 'orta', 'yuksek', 'cok_yuksek'
CREATE OR REPLACE FUNCTION rand_attr(priority TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_min INTEGER;
  v_max INTEGER;
BEGIN
  v_min := CASE priority
    WHEN 'cok_dusuk' THEN 10
    WHEN 'dusuk' THEN 20
    WHEN 'dusuk_orta' THEN 30
    WHEN 'orta' THEN 40
    WHEN 'orta_ust' THEN 55
    WHEN 'yuksek' THEN 60
    WHEN 'cok_yuksek' THEN 70
    ELSE 40
  END;
  v_max := CASE priority
    WHEN 'cok_dusuk' THEN 40
    WHEN 'dusuk' THEN 50
    WHEN 'dusuk_orta' THEN 60
    WHEN 'orta' THEN 70
    WHEN 'orta_ust' THEN 75
    WHEN 'yuksek' THEN 85
    WHEN 'cok_yuksek' THEN 95
    ELSE 70
  END;
  RETURN floor(random() * (v_max - v_min + 1)) + v_min;
END;
$$ LANGUAGE plpgsql;

-- Tüm oyuncuları güncelle
UPDATE players SET
  -- Teknik
  finishing = CASE
    WHEN position = 'GK' THEN rand_attr('cok_dusuk')
    WHEN position = 'DEF' THEN rand_attr('dusuk')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('cok_yuksek')
    ELSE rand_attr('orta')
  END,
  dribbling = CASE
    WHEN position = 'GK' THEN rand_attr('cok_dusuk')
    WHEN position = 'DEF' THEN rand_attr('dusuk')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,
  first_touch = CASE
    WHEN position = 'GK' THEN rand_attr('dusuk')
    WHEN position = 'DEF' THEN rand_attr('orta')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,
  crossing = CASE
    WHEN position = 'GK' THEN rand_attr('cok_dusuk')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('orta')
    ELSE rand_attr('orta')
  END,
  marking = CASE
    WHEN position = 'GK' THEN rand_attr('cok_dusuk')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('cok_dusuk')
    ELSE rand_attr('orta')
  END,
  tackling = CASE
    WHEN position = 'GK' THEN rand_attr('cok_dusuk')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('dusuk')
    ELSE rand_attr('orta')
  END,
  technique = CASE
    WHEN position = 'GK' THEN rand_attr('dusuk')
    WHEN position = 'DEF' THEN rand_attr('orta')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,
  long_shots = CASE
    WHEN position = 'GK' THEN rand_attr('cok_dusuk')
    WHEN position = 'DEF' THEN rand_attr('dusuk')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,
  heading = CASE
    WHEN position = 'GK' THEN rand_attr('dusuk')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,

  -- Mental
  aggression = CASE
    WHEN position = 'GK' THEN rand_attr('dusuk')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('orta')
    ELSE rand_attr('orta')
  END,
  bravery = CASE
    WHEN position = 'GK' THEN rand_attr('dusuk')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,
  work_rate = CASE
    WHEN position = 'GK' THEN rand_attr('orta')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('orta')
    ELSE rand_attr('orta')
  END,
  decisions = CASE
    WHEN position = 'GK' THEN rand_attr('yuksek')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('orta')
    ELSE rand_attr('orta')
  END,
  concentration = CASE
    WHEN position = 'GK' THEN rand_attr('cok_yuksek')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('dusuk')
    ELSE rand_attr('orta')
  END,
  leadership = CASE
    WHEN position = 'GK' THEN rand_attr('orta')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('dusuk')
    ELSE rand_attr('orta')
  END,
  anticipation = CASE
    WHEN position = 'GK' THEN rand_attr('yuksek')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('dusuk')
    ELSE rand_attr('orta')
  END,
  flair = CASE
    WHEN position = 'GK' THEN rand_attr('cok_dusuk')
    WHEN position = 'DEF' THEN rand_attr('dusuk')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,
  positioning = CASE
    WHEN position = 'GK' THEN rand_attr('cok_yuksek')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('dusuk')
    ELSE rand_attr('orta')
  END,
  composure = CASE
    WHEN position = 'GK' THEN rand_attr('yuksek')
    WHEN position = 'DEF' THEN rand_attr('orta')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,
  teamwork = CASE
    WHEN position = 'GK' THEN rand_attr('dusuk')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('orta')
    ELSE rand_attr('orta')
  END,
  vision = CASE
    WHEN position = 'GK' THEN rand_attr('cok_dusuk')
    WHEN position = 'DEF' THEN rand_attr('dusuk')
    WHEN position = 'MID' THEN rand_attr('cok_yuksek')
    WHEN position = 'FWD' THEN rand_attr('orta')
    ELSE rand_attr('orta')
  END,

  -- Fiziksel
  acceleration = CASE
    WHEN position = 'GK' THEN rand_attr('dusuk')
    WHEN position = 'DEF' THEN rand_attr('orta')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('cok_yuksek')
    ELSE rand_attr('orta')
  END,
  agility = CASE
    WHEN position = 'GK' THEN rand_attr('yuksek')
    WHEN position = 'DEF' THEN rand_attr('orta')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,
  balance = CASE
    WHEN position = 'GK' THEN rand_attr('yuksek')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('orta')
    ELSE rand_attr('orta')
  END,
  strength = CASE
    WHEN position = 'GK' THEN rand_attr('yuksek')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,
  stamina = CASE
    WHEN position = 'GK' THEN rand_attr('dusuk')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('cok_yuksek')
    WHEN position = 'FWD' THEN rand_attr('orta')
    ELSE rand_attr('orta')
  END,
  jumping = CASE
    WHEN position = 'GK' THEN rand_attr('yuksek')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,

  -- Kısa stat'lar
  shooting = CASE
    WHEN position = 'GK' THEN rand_attr('cok_dusuk')
    WHEN position = 'DEF' THEN rand_attr('dusuk')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('cok_yuksek')
    ELSE rand_attr('orta')
  END,
  defending = CASE
    WHEN position = 'GK' THEN rand_attr('cok_dusuk')
    WHEN position = 'DEF' THEN rand_attr('cok_yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('cok_dusuk')
    ELSE rand_attr('orta')
  END,
  passing = CASE
    WHEN position = 'GK' THEN rand_attr('dusuk')
    WHEN position = 'DEF' THEN rand_attr('orta')
    WHEN position = 'MID' THEN rand_attr('cok_yuksek')
    WHEN position = 'FWD' THEN rand_attr('orta')
    ELSE rand_attr('orta')
  END,
  speed = CASE
    WHEN position = 'GK' THEN rand_attr('dusuk')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('yuksek')
    WHEN position = 'FWD' THEN rand_attr('cok_yuksek')
    ELSE rand_attr('orta')
  END,
  power = CASE
    WHEN position = 'GK' THEN rand_attr('yuksek')
    WHEN position = 'DEF' THEN rand_attr('yuksek')
    WHEN position = 'MID' THEN rand_attr('orta')
    WHEN position = 'FWD' THEN rand_attr('yuksek')
    ELSE rand_attr('orta')
  END,

  -- Kalecilik
  goalkeeping = CASE
    WHEN position = 'GK' THEN rand_attr('cok_yuksek')
    ELSE rand_attr('cok_dusuk')
  END;

-- Doğrulama
SELECT 'TOPLAM OYUNCU:' as info, COUNT(*) as count FROM players;
SELECT '50 DEĞERİ KALAN ÖZELLİK SAYISI:' as info,
  COUNT(*) FILTER (WHERE finishing = 50 OR dribbling = 50 OR passing = 50 OR speed = 50 OR power = 50) as count
  FROM players;

-- Örnek: İlk 5 oyuncunun özellikleri
SELECT name, position, finishing, passing, speed, defending, goalkeeping, aggression, vision
FROM players
LIMIT 5;
