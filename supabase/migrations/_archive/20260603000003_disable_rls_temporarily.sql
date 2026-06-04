-- ============================================================
-- Migration: RLS politikalarını geçici olarak devre dışı bırak
-- Tarih: 2026-06-03
-- AÇIKLAMA: GEÇİCİ ÇÖZÜM — Supabase Auth entegrasyonu yapılana
-- kadar RLS politikaları auth.uid() kullanıyor, ancak uygulama
-- henüz tam Auth entegrasyonuna sahip değil. Bu nedenle tüm
-- RLS kontrolleri başarısız oluyor.
--
-- Bu migration RLS'yi devre dışı bırakır. Sorgular .eq() ile
-- manuel filtreleniyor. Production'a çıkmadan önce gerçek
-- Auth entegrasyonu yapılmalı ve bu migration geri alınmalı.
-- ============================================================

-- Kritik tablolar için RLS'yi devre dışı bırak
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE league_teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_market DISABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_facilities DISABLE ROW LEVEL SECURITY;

-- Not: Bu tablolar zaten RLS'siz ise hata vermez.
-- Auth entegrasyonu tamamlandığında ENABLE ROW LEVEL SECURITY
-- ile tekrar etkinleştirilmeli ve politikalar auth.uid() ile
-- doğru şekilde yazılmalı.
