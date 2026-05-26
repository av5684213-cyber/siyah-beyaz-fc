/**
 * Admin: Apply missing schema migrations for all tables
 * POST /api/admin/schema-migration
 *
 * This route applies all pending migrations that haven't been applied yet.
 * It uses the pg module with DATABASE_URL for DDL operations.
 *
 * Security: Requires CRON_SECRET env var for authorization.
 */
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.startsWith('file:')) {
    return NextResponse.json(
      { error: 'DATABASE_URL must be a PostgreSQL connection string (not a local SQLite file). Please set it to your Supabase database URL.' },
      { status: 500 }
    );
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  const results: string[] = [];

  try {
    const client = await pool.connect();

    try {
      // 1. Create lab_sessions table (TacticLab persistence)
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.lab_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          team_a JSONB NOT NULL DEFAULT '[]',
          team_b JSONB NOT NULL DEFAULT '[]',
          selected_formation TEXT NOT NULL DEFAULT '4-4-2',
          settings JSONB NOT NULL DEFAULT '{}',
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT lab_sessions_user_id_unique UNIQUE (user_id)
        )
      `);
      results.push('lab_sessions table created/verified');

      // RLS for lab_sessions - use permissive policies for anon key access
      await client.query(`ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY`);
      await client.query(`DROP POLICY IF EXISTS "Users can read own lab session" ON public.lab_sessions`);
      await client.query(`DROP POLICY IF EXISTS "Users can insert own lab session" ON public.lab_sessions`);
      await client.query(`DROP POLICY IF EXISTS "Users can update own lab session" ON public.lab_sessions`);
      await client.query(`DROP POLICY IF EXISTS "Users can delete own lab session" ON public.lab_sessions`);
      await client.query(`DROP POLICY IF EXISTS "lab_sessions_select_all" ON public.lab_sessions`);
      await client.query(`DROP POLICY IF EXISTS "lab_sessions_insert_all" ON public.lab_sessions`);
      await client.query(`DROP POLICY IF EXISTS "lab_sessions_update_all" ON public.lab_sessions`);
      await client.query(`DROP POLICY IF EXISTS "lab_sessions_delete_all" ON public.lab_sessions`);

      await client.query(`CREATE POLICY "lab_sessions_select_all" ON public.lab_sessions FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "lab_sessions_insert_all" ON public.lab_sessions FOR INSERT WITH CHECK (true)`);
      await client.query(`CREATE POLICY "lab_sessions_update_all" ON public.lab_sessions FOR UPDATE USING (true)`);
      await client.query(`CREATE POLICY "lab_sessions_delete_all" ON public.lab_sessions FOR DELETE USING (true)`);
      results.push('lab_sessions RLS policies set (permissive)');

      // Auto-update trigger for updated_at
      await client.query(`
        CREATE OR REPLACE FUNCTION public.update_lab_sessions_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `);

      await client.query(`DROP TRIGGER IF EXISTS trigger_update_lab_sessions_updated_at ON public.lab_sessions`);
      await client.query(`
        CREATE TRIGGER trigger_update_lab_sessions_updated_at
        BEFORE UPDATE ON public.lab_sessions
        FOR EACH ROW
        EXECUTE FUNCTION public.update_lab_sessions_updated_at()
      `);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_lab_sessions_user_id ON public.lab_sessions(user_id)`);
      results.push('lab_sessions trigger and index created');

      // 2. Add last_newspaper_applied column to profiles
      await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_newspaper_applied DATE`);
      results.push('profiles.last_newspaper_applied column added');

      // 3. Add consecutive_losses column to profiles
      await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_losses INTEGER DEFAULT 0`);
      results.push('profiles.consecutive_losses column added');

      // 4. Add financial_health column to profiles
      await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS financial_health TEXT DEFAULT 'healthy'`);
      results.push('profiles.financial_health column added');

      // 5. Add last_friendly_date and daily_friendly_count columns to profiles
      await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_friendly_date TEXT`);
      await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_friendly_count INTEGER DEFAULT 0`);
      results.push('profiles.last_friendly_date and daily_friendly_count columns added');

      // 6. Add held_amount to transfer_market
      await client.query(`ALTER TABLE transfer_market ADD COLUMN IF NOT EXISTS held_amount BIGINT DEFAULT 0`);
      results.push('transfer_market.held_amount column added');

      // 7. Add season_yellow_cards to players
      await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS season_yellow_cards INTEGER DEFAULT 0`);
      results.push('players.season_yellow_cards column added');

      // 8. Unique constraint on match_simulation_queue
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uniq_queue_fixture'
          ) THEN
            ALTER TABLE match_simulation_queue ADD CONSTRAINT uniq_queue_fixture UNIQUE (fixture_id);
          END IF;
        END $$;
      `);
      results.push('match_simulation_queue unique constraint added');

      // 9. facility_upgrade_costs: UNIQUE constraint on (facility_type, target_level)
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'facility_upgrade_costs_facility_type_target_level_key'
          ) THEN
            ALTER TABLE facility_upgrade_costs
              ADD CONSTRAINT facility_upgrade_costs_facility_type_target_level_key
              UNIQUE (facility_type, target_level);
          END IF;
        END $$;
      `);
      results.push('facility_upgrade_costs UNIQUE constraint added');

      // 10. youth_facilities: Add PRIMARY KEY on profile_id if not exists
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conrelid = 'youth_facilities'::regclass AND contype = 'p'
          ) THEN
            IF NOT EXISTS (
              SELECT profile_id, COUNT(*) FROM youth_facilities GROUP BY profile_id HAVING COUNT(*) > 1
            ) THEN
              ALTER TABLE youth_facilities ADD CONSTRAINT youth_facilities_pkey PRIMARY KEY (profile_id);
            END IF;
          END IF;
        END $$;
      `);
      results.push('youth_facilities PRIMARY KEY added');

      // 11. youth_facilities: RLS policies - permissive
      await client.query(`DROP POLICY IF EXISTS "youth_facilities_select_all" ON youth_facilities`);
      await client.query(`DROP POLICY IF EXISTS "youth_facilities_insert_all" ON youth_facilities`);
      await client.query(`DROP POLICY IF EXISTS "youth_facilities_update_all" ON youth_facilities`);
      await client.query(`CREATE POLICY "youth_facilities_select_all" ON youth_facilities FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "youth_facilities_insert_all" ON youth_facilities FOR INSERT WITH CHECK (true)`);
      await client.query(`CREATE POLICY "youth_facilities_update_all" ON youth_facilities FOR UPDATE USING (true)`);
      await client.query(`CREATE POLICY "youth_facilities_delete_all" ON youth_facilities FOR DELETE USING (true)`);
      results.push('youth_facilities RLS policies set (permissive)');

      // 12. user_facilities: Drop old profile_id UNIQUE if it conflicts
      await client.query(`ALTER TABLE user_facilities DROP CONSTRAINT IF EXISTS user_facilities_profile_id_key`);
      results.push('user_facilities old profile_id UNIQUE constraint dropped (if existed)');

      // 13. user_facilities: UNIQUE index on (profile_id, facility_type)
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_facilities_profile_type ON user_facilities(profile_id, facility_type)`);
      results.push('user_facilities (profile_id, facility_type) unique index created');

      // 14. user_facilities: Missing columns
      await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS facility_type TEXT`);
      await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 0`);
      await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS upgrade_started_at TIMESTAMPTZ`);
      await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS upgrade_end_at TIMESTAMPTZ`);
      await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS speed_up_used BOOLEAN DEFAULT FALSE`);
      await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS facility_data JSONB DEFAULT '{}'`);
      await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`);
      results.push('user_facilities missing columns added');

      // 15. user_facilities: RLS policies - permissive
      await client.query(`DROP POLICY IF EXISTS "Users can view own facilities" ON user_facilities`);
      await client.query(`DROP POLICY IF EXISTS "Users can insert own facilities" ON user_facilities`);
      await client.query(`DROP POLICY IF EXISTS "Users can update own facilities" ON user_facilities`);
      await client.query(`DROP POLICY IF EXISTS "Service role full access facilities" ON user_facilities`);
      await client.query(`DROP POLICY IF EXISTS "user_facilities_select_all" ON user_facilities`);
      await client.query(`DROP POLICY IF EXISTS "user_facilities_insert_all" ON user_facilities`);
      await client.query(`DROP POLICY IF EXISTS "user_facilities_update_all" ON user_facilities`);
      await client.query(`CREATE POLICY "user_facilities_select_all" ON user_facilities FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "user_facilities_insert_all" ON user_facilities FOR INSERT WITH CHECK (true)`);
      await client.query(`CREATE POLICY "user_facilities_update_all" ON user_facilities FOR UPDATE USING (true)`);
      await client.query(`CREATE POLICY "user_facilities_delete_all" ON user_facilities FOR DELETE USING (true)`);
      results.push('user_facilities RLS policies set (permissive)');

      // 16. hall_of_fame: Missing columns
      await client.query(`ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS season_id UUID`);
      await client.query(`ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS champion_profile_id TEXT`);
      await client.query(`ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS champion_team TEXT`);
      await client.query(`ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS golden_boot_player TEXT`);
      await client.query(`ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS mvp_player TEXT`);
      await client.query(`ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS best_goalkeeper TEXT`);
      await client.query(`ALTER TABLE hall_of_fame ADD COLUMN IF NOT EXISTS top_assists_player TEXT`);
      results.push('hall_of_fame missing columns added');

      // 17. match_sessions: Missing columns
      await client.query(`ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]'`);
      await client.query(`ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS referee_id TEXT`);
      await client.query(`ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS last_tick_at TIMESTAMPTZ`);
      await client.query(`ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`);
      results.push('match_sessions missing columns added');

      // 18. match_sessions: UNIQUE constraint on fixture_id (prevent duplicate sessions)
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uniq_match_session_fixture'
          ) THEN
            ALTER TABLE match_sessions ADD CONSTRAINT uniq_match_session_fixture UNIQUE (fixture_id);
          END IF;
        END $$;
      `);
      results.push('match_sessions UNIQUE constraint on fixture_id added');

      // 19. players: Add rating_start_of_season column
      await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS rating_start_of_season INTEGER DEFAULT 0`);
      results.push('players.rating_start_of_season column added');

      // 20. Reload PostgREST schema cache
      await client.query(`NOTIFY pgrst, 'reload schema'`);
      results.push('PostgREST schema cache reload notified');

    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error('[schema-migration] Error:', err);
    return NextResponse.json(
      { error: err.message, results },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
