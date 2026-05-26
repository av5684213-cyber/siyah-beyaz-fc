/**
 * Admin: Apply missing schema migrations for lab_sessions table and profiles columns
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
      results.push('lab_sessions table created');

      // RLS for lab_sessions
      await client.query(`ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY`);

      await client.query(`DROP POLICY IF EXISTS "Users can read own lab session" ON public.lab_sessions`);
      await client.query(`CREATE POLICY "Users can read own lab session"
        ON public.lab_sessions FOR SELECT
        USING (auth.uid() = user_id)`);

      await client.query(`DROP POLICY IF EXISTS "Users can insert own lab session" ON public.lab_sessions`);
      await client.query(`CREATE POLICY "Users can insert own lab session"
        ON public.lab_sessions FOR INSERT
        WITH CHECK (auth.uid() = user_id)`);

      await client.query(`DROP POLICY IF EXISTS "Users can update own lab session" ON public.lab_sessions`);
      await client.query(`CREATE POLICY "Users can update own lab session"
        ON public.lab_sessions FOR UPDATE
        USING (auth.uid() = user_id)`);

      await client.query(`DROP POLICY IF EXISTS "Users can delete own lab session" ON public.lab_sessions`);
      await client.query(`CREATE POLICY "Users can delete own lab session"
        ON public.lab_sessions FOR DELETE
        USING (auth.uid() = user_id)`);

      results.push('lab_sessions RLS policies set');

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
