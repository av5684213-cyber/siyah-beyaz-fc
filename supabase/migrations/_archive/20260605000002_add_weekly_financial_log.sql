-- Add weekly financial log columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_weekly_income NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_weekly_expense NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_weekly_net NUMERIC DEFAULT 0;
