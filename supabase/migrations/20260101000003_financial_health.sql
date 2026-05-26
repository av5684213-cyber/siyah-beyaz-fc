-- PROMPT 10: financial_health kolonu — weekly-income cron tarafından güncellenir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS financial_health TEXT DEFAULT 'healthy';
