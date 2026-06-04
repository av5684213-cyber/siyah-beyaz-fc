-- ============================================================
-- Migration: profiles tablosuna sponsors JSONB kolonu ekle
-- Tarih: 2026-06-03
-- Aciklama: GameContext'teki addSponsor fonksiyonu sadece React
--           state'ini guncelliyordu, veritabanina yazmiyordu.
--           Bu kolon ile sponsorlar Supabase'de kalici olur.
--           Ayrica weekly-income cron'u profile.sponsors'i okuyabilir.
-- ============================================================

-- profiles tablosuna sponsors JSONB kolonu ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sponsors JSONB DEFAULT '[]'::jsonb;

-- Yorum: Sponsor nesne yapisi (Profile.sponsors dizisinde):
-- {
--   id: string,
--   name: string,
--   type: 'Main' | 'Sleeve' | 'Stadium' | 'Global',
--   weeklyPayment: number,
--   duration: number,
--   remainingDays: number,
--   bonus?: { type: string, amount: number }
-- }
