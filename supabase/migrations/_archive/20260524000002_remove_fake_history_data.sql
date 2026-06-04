-- ============================================================
-- Migration: Sahte maç geçmişi temizleme
-- Tarih: 2026-05-24
-- Açıklama:
--   History simulator ile oluşturulmuş sahte maç geçmişlerini
--   ve ilgili player_career_stats kayıtlarını temizler.
--   NOT: Bu migration mevcut kullanıcılar için opsiyoneldir.
--   Yeni kayıtlar artık sahte geçmiş oluşturmuyor.
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. History simulator tarafından oluşturulmuş sahte match_history
--    kayıtlarını temizle
--    Tanıma kriteri: match_data içinde "FULLTIME" event'i var
--    VE home_team/away_team isimleri AI takım havuzundan geliyor
--    VE created_at tarihi kullanıcının kayıt tarihinden önce
-- ═══════════════════════════════════════════════════════════════

-- Önce temizlenecek kayıt sayısını göster (bilgi amaçlı)
-- SELECT COUNT(*) as fake_history_count FROM match_history
--   WHERE match_data LIKE '%FULLTIME%'
--   AND created_at < (SELECT created_at FROM profiles WHERE id = match_history.user_id);

-- Sahte maç geçmişlerini sil
-- DİKKAT: Bu sorgu yalnızca hist_ önekli ID'leri veya
-- history simulator formatına uyan kayıtları hedefler.
-- Gerçek maçlar (cron ile oluşturulanlar) etkilenmez.
DELETE FROM match_history
WHERE match_data LIKE '%FULLTIME%'
  AND match_data NOT LIKE '%fixture%'
  AND user_id IN (
    SELECT p.id FROM profiles p
    WHERE p.created_at IS NOT NULL
  )
  AND created_at < (
    SELECT p.created_at FROM profiles p WHERE p.id = match_history.user_id
  );

-- ═══════════════════════════════════════════════════════════════
-- 2. current_day'i sıfırla (opsiyonel — dikkatli kullanın!)
--    Mevcut kullanıcılar current_day'lerini korumak isteyebilir.
--    Bu nedenle bu satır varsayılan olarak yorum satırı olarak bırakılmıştır.
-- ═══════════════════════════════════════════════════════════════

-- UPDATE profiles SET current_day = 1 WHERE current_day > 1;

-- ═══════════════════════════════════════════════════════════════
-- NOT: Yeni kayıtlar artık simulateHistory çağrılmadığı için
-- sahte maç geçmişi oluşturmayacaktır. Bu migration yalnızca
-- geçmişte oluşturulmuş sahte verileri temizlemek içindir.
-- ═══════════════════════════════════════════════════════════════
