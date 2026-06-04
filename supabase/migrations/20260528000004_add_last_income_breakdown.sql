-- Haftalık gelir breakdown'ını saklamak için JSONB kolonu
-- weekly-income cron'u buraya yazar, FinancialTab buradan okur
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_income_breakdown JSONB DEFAULT '{}';
