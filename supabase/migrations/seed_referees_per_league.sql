-- ═══════════════════════════════════════════════════════════════════════════
-- HER LİG İÇİN 9 HAKEM SEED
--
-- Kurallar:
--   - Her 18 takımlı lig için 9 hakem atanır
--   - 6 kişilik × dağıtık = her ligde tüm kişiliklerden var
--   - league_id = gerçek lig ID'si (NULL değil)
--   - Mevcut hakemler korunur (ON CONFLICT DO NOTHING)
--
-- Supabase Dashboard > SQL Editor > yapıştır > Run
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. league_id kolonunu NULL yapılabilir yap (güvenlik)
ALTER TABLE referees ALTER COLUMN league_id DROP NOT NULL;

-- 1b. Check constraint'i kaldır (Türkçe/İngilizce karışık değerler için)
ALTER TABLE referees DROP CONSTRAINT IF EXISTS referees_personality_check;

-- 2. Eski genel (league_id=NULL) hakemleri temizle (artık liglere atanacak)
DELETE FROM referees WHERE league_id IS NULL;

-- 3. Her lig için 9 hakem üret
-- PL/pgSQL ile dinamik — kaç lig varsa hepsine 9'ar hakem ekler
DO $$
DECLARE
    lig RECORD;
    i INTEGER;
    v_personality TEXT;
    v_name TEXT;
    v_strictness INTEGER;
    v_experience INTEGER;
    v_id TEXT;
    v_first_names TEXT[] := ARRAY[
        'Mehmet','Ahmet','Mustafa','Ali','Hasan','İbrahim','Yusuf','Murat',
        'Emre','Burak','Serkan','Hakan','Tolga','Erkan','Kemal','Cemal',
        'Selim','Kadir','Osman','Süleyman','Fatih','Oğuz','Deniz','Ercan',
        'Uğur','Ayhan','Nuri','Cengiz','Mert','Barış','Levent','Bülent',
        'Taner','Zafer','Oktay','Sedat','Volkan','Arda','Berk','Can',
        'Doruk','Ege','Emir','Kaan','Miraç','Onur','Polat','Rıza',
        'Selçuk','Tamer','Umut','Yiğit','Bora','Cem','Engin','Faruk',
        'Gökhan','Harun','İlker','Kerem','Mazhur','Berkay','Kıvanç','Onur'
    ];
    v_last_names TEXT[] := ARRAY[
        'Yıldız','Kaya','Demir','Çelik','Şahin','Yıldırım','Öztürk','Aydın',
        'Özdemir','Arslan','Doğan','Kılıç','Aslan','Çetin','Koç','Kurt',
        'Özkan','Şimşek','Polat','Korkmaz','Erdoğan','Aktürk','Özmen','Başaran',
        'Taş','Acar','Avşar','Bulut','Coşkun','Duru','Ergün','Fidan',
        'Güneş','Hakverdi','Işık','Karadağ','Mercan','Pala','Sarı','Tuncel',
        'Uysal','Varol','Yağcı','Akın','Balcı','Cangöz','Dikmen','Erkül',
        'Güler','Keser','Menteş','Sözüer','Türe','Ateş','Bayrak','Çakır',
        'Efe','Genç','İlhan','Karakaş','Oktay','Sezer','Tunç','Yalçın'
    ];
BEGIN
    FOR lig IN SELECT id, name FROM leagues ORDER BY id LOOP
        FOR i IN 0..8 LOOP  -- 9 hakem (0-8)
            -- 6 kişilik arasında döngüsel dağıt
            v_personality := CASE (i % 6)
                WHEN 0 THEN 'katil'
                WHEN 1 THEN 'dengeci'
                WHEN 2 THEN 'hosgorulu'
                WHEN 3 THEN 'ev_sahibi'
                WHEN 4 THEN 'degisken'
                WHEN 5 THEN 'var_sever'
            END;

            -- İsim — her hakem farklı
            v_name := v_first_names[(i * 7 + 1) % array_length(v_first_names, 1) + 1]
                   || ' '
                   || v_last_names[(i * 11 + 3) % array_length(v_last_names, 1) + 1];

            -- Sertlik — kişiliğe göre
            v_strictness := CASE v_personality
                WHEN 'katil' THEN 70 + (i % 4) * 2      -- 70-76
                WHEN 'dengeci' THEN 48 + (i % 4) * 2     -- 48-54
                WHEN 'hosgorulu' THEN 24 + (i % 4) * 2   -- 24-30
                WHEN 'ev_sahibi' THEN 52 + (i % 4) * 2   -- 52-58
                WHEN 'degisken' THEN 40 + (i % 4) * 2    -- 40-46
                WHEN 'var_sever' THEN 36 + (i % 4) * 2   -- 36-42
            END;

            v_experience := 4 + (i % 5);  -- 4-8

            -- ID: lig ID'sinin ilk 8 karakteri + index
            v_id := 'ref-' || LEFT(lig.id::text, 8) || '-' || i::text;

            -- Insert (mevcut ise atla)
            INSERT INTO referees (id, name, personality, experience, league_id, strictness, total_matches, total_yellows, total_reds, total_penalties)
            VALUES (v_id, v_name, v_personality, v_experience, lig.id, v_strictness, 0, 0, 0, 0)
            ON CONFLICT (id) DO NOTHING;
        END LOOP;

        RAISE NOTICE 'Lig %: 9 hakem atandı', lig.name;
    END LOOP;
END $$;

-- 4. Doğrulama — her ligde 9 hakem olmalı
SELECT
    l.name AS lig_adi,
    COUNT(r.id) AS hakem_sayisi
FROM leagues l
LEFT JOIN referees r ON r.league_id = l.id
GROUP BY l.id, l.name
ORDER BY l.name;

-- Toplam hakem sayısı
SELECT 'TOPLAM HAKEM' as info, COUNT(*) as count FROM referees;

-- ═══════════════════════════════════════════════════════════════════════════
-- TAMAMLANDI.
-- Her 18 takımlı lig için 9 hakem atandı (6 kişilik × dağıtık).
-- Lig bazlı — league_id NULL değil, gerçek lig ID'si.
-- Idempotent — tekrar çalıştırılabilir.
-- ═══════════════════════════════════════════════════════════════════════════
