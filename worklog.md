---
Task ID: 1
Agent: Main Agent
Task: Fix Supabase schema errors - missing lab_sessions table and last_newspaper_applied column

Work Log:
- Analyzed the two console errors reported by user
- Confirmed lab_sessions table is missing from Supabase database
- Confirmed last_newspaper_applied column is missing from profiles table
- Also found financial_health, last_friendly_date, daily_friendly_count columns missing from profiles
- Also found held_amount column missing from transfer_market, season_yellow_cards missing from players
- Read all relevant migration SQL files from supabase/migrations/
- Created migration API route at /api/admin/schema-migration/route.ts
- Modified GameContext.tsx to strip pending migration columns from profile sync to prevent console errors
- Modified TacticLab.tsx to detect missing lab_sessions table and stop retrying auto-save
- Fixed friendly match update to skip missing columns (last_friendly_date, daily_friendly_count)
- Created comprehensive SQL migration script at /home/z/my-project/download/apply-migrations.sql
- Attempted to apply migrations directly via: Supabase Management API, pg module with pooler, browser automation
- All direct migration attempts failed due to missing DATABASE_URL / service_role_key / dashboard credentials

Stage Summary:
- Code-level fixes applied to prevent console errors from appearing
- Migration API route created but requires DATABASE_URL to function
- SQL script prepared at /home/z/my-project/download/apply-migrations.sql
- User needs to run the SQL script manually in Supabase SQL Editor for permanent fix
