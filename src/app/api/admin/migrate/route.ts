/**
 * Admin: Apply database migration for live matches system
 * GET /api/admin/migrate (Authorization: Bearer <CRON_SECRET>)
 *
 * Security: Requires CRON_SECRET + ENABLE_MIGRATION_ENDPOINT env vars.
 * Production'da ENABLE_MIGRATION_ENDPOINT ayarlanmazsa route tamamen devre dışıdır.
 */
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // ── Güvenlik: Migration endpoint'i production'da devre dışı bırakma kontrolü ──
  if (process.env.ENABLE_MIGRATION_ENDPOINT !== 'true') {
    return NextResponse.json({ error: 'Migration endpoint is disabled' }, { status: 403 });
  }

  // ── Auth check: Authorization Bearer zorunlu (fail-closed) ──
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Admin role verification: Check that the requester has admin role
  // The CRON_SECRET protects against external access; this adds identity verification
  const adminUserId = request.headers.get('x-admin-user-id');
  if (adminUserId) {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase yapılandırılmamış' }, { status: 500 });
    }
    const supabase = getSupabase();
    const { data: adminProfile } = await supabase!
      .from('profiles')
      .select('role')
      .eq('id', adminUserId)
      .maybeSingle();

    if (!adminProfile || adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }
  }
  // If no x-admin-user-id header, fall back to CRON_SECRET-only protection
  // (for Vercel cron jobs that don't have a user context)

  // ── Database connection: Hardcoded credentials YASAK — sadece env'den ──
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json(
      { error: 'DATABASE_URL environment variable is not configured. Migration requires a direct database connection string.' },
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
      // 1. Add is_revealed column to match_events
      await client.query(`ALTER TABLE match_events ADD COLUMN IF NOT EXISTS is_revealed BOOLEAN DEFAULT FALSE`);
      results.push('match_events.is_revealed column added');

      await client.query(`CREATE INDEX IF NOT EXISTS idx_match_events_fixture_revealed ON match_events(fixture_id, is_revealed)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_match_events_fixture_minute ON match_events(fixture_id, minute)`);
      results.push('match_events indexes created');

      // 2. Create live_matches table
      await client.query(`
        CREATE TABLE IF NOT EXISTS live_matches (
          fixture_id TEXT PRIMARY KEY REFERENCES fixtures(id) ON DELETE CASCADE,
          started_at TIMESTAMPTZ NOT NULL,
          current_minute INTEGER DEFAULT 0,
          status TEXT DEFAULT 'live' CHECK (status IN ('live', 'halftime', 'completed')),
          home_score INTEGER DEFAULT 0,
          away_score INTEGER DEFAULT 0,
          home_team_id UUID,
          away_team_id UUID,
          home_team_name TEXT,
          away_team_name TEXT,
          season_id UUID,
          simulation_speed REAL DEFAULT 3.0,
          total_events INTEGER DEFAULT 0,
          revealed_events INTEGER DEFAULT 0,
          weather TEXT DEFAULT 'sunny',
          referee_name TEXT,
          referee_personality TEXT,
          referee_strictness INTEGER,
          home_possession REAL DEFAULT 50,
          home_stats JSONB DEFAULT '{}',
          away_stats JSONB DEFAULT '{}',
          home_player_ratings JSONB DEFAULT '[]',
          away_player_ratings JSONB DEFAULT '[]',
          man_of_the_match TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      results.push('live_matches table created');

      // RLS
      await client.query(`ALTER TABLE live_matches ENABLE ROW LEVEL SECURITY`);
      await client.query(`DROP POLICY IF EXISTS "Live matches read" ON live_matches`);
      await client.query(`DROP POLICY IF EXISTS "Live matches write" ON live_matches`);
      await client.query(`CREATE POLICY "Live matches read" ON live_matches FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "Live matches write" ON live_matches FOR ALL USING (true)`);
      results.push('live_matches RLS policies set');

      // Realtime
      await client.query(`ALTER TABLE live_matches REPLICA IDENTITY FULL`);
      await client.query(`ALTER TABLE match_events REPLICA IDENTITY FULL`);
      results.push('Realtime replica identity set');

      // 3. Add scheduled_time to fixtures
      await client.query(`ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS scheduled_time TEXT`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_fixtures_status_date ON fixtures(status, match_date)`);
      results.push('fixtures.scheduled_time added');

      // 4. Create notifications table (if not exists)
      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          profile_id TEXT NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          url TEXT,
          tag TEXT,
          type TEXT DEFAULT 'match_event',
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_profile_unread ON notifications(profile_id, is_read)`);
      await client.query(`ALTER TABLE notifications ENABLE ROW LEVEL SECURITY`);
      await client.query(`DROP POLICY IF EXISTS "Notifications read" ON notifications`);
      await client.query(`DROP POLICY IF EXISTS "Notifications write" ON notifications`);
      await client.query(`CREATE POLICY "Notifications read" ON notifications FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "Notifications write" ON notifications FOR ALL USING (true)`);
      results.push('notifications table ready');

    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return createErrorResponse(err, { route: '/api/admin/migrate', method: 'GET' });
  } finally {
    await pool.end();
  }
}
