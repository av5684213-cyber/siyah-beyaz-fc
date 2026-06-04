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
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

      // 19b. players: Add loaned_from_profile_id column for loan return tracking
      await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS loaned_from_profile_id TEXT`);
      results.push('players.loaned_from_profile_id column added');

      // 19c. staff_types tablosu (yoksa oluştur)
      await client.query(`
        CREATE TABLE IF NOT EXISTS staff_types (
          type TEXT PRIMARY KEY,
          name_tr TEXT NOT NULL,
          max_count INTEGER NOT NULL DEFAULT 1,
          base_salary INTEGER NOT NULL DEFAULT 0
        );
        ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS description TEXT;
        ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS name_tr TEXT;
        ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS max_count INTEGER;
        ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS base_salary INTEGER;
        UPDATE staff_types SET name_tr = type WHERE name_tr IS NULL;
        UPDATE staff_types SET max_count = 3 WHERE max_count IS NULL;
        UPDATE staff_types SET base_salary = 100000 WHERE base_salary IS NULL;
        INSERT INTO staff_types (type, name_tr, max_count, base_salary, description) VALUES
          ('scout', 'Gözlemci', 3, 100000, 'Transfer piyasasında oyuncu keşfi yapar'),
          ('coach', 'Yardımcı Antrenör', 3, 150000, 'Antrenman kalitesini artırır'),
          ('physio', 'Fizyoterapist', 3, 80000, 'Sakatlık iyileşme süresini kısaltır'),
          ('youth_coordinator', 'Gençlik Koordinatörü', 2, 120000, 'Altyapıdan oyuncu yetiştirir'),
          ('sporting_director', 'Sportif Direktör', 1, 200000, 'Transfer stratejisi oluşturur'),
          ('analyst', 'Maç Analisti', 2, 60000, 'Rakip analiz raporları hazırlar')
        ON CONFLICT (type) DO UPDATE SET
          name_tr = EXCLUDED.name_tr,
          max_count = EXCLUDED.max_count,
          base_salary = EXCLUDED.base_salary,
          description = EXCLUDED.description;
      `);
      results.push('staff_types tablosu oluşturuldu/düzeltildi');

      // 19d. staff tablosu (yoksa oluştur)
      await client.query(`
        CREATE TABLE IF NOT EXISTS staff (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          type TEXT NOT NULL REFERENCES staff_types(type),
          stars INTEGER NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 5),
          name TEXT NOT NULL,
          contract_start_week INTEGER DEFAULT 1,
          contract_end_week INTEGER DEFAULT 34,
          total_cost INTEGER DEFAULT 0,
          salary_weekly INTEGER DEFAULT 0,
          hired_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
        CREATE INDEX IF NOT EXISTS idx_staff_type ON staff(user_id, type);
      `);
      results.push('staff tablosu oluşturuldu/düzeltildi');

      // 20. staff: Add salary_weekly column
      await client.query(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS salary_weekly INTEGER DEFAULT 0`);
      results.push('staff.salary_weekly column added');

      // 21. Enable RLS on all critical tables
      const rlsTables = [
        'players', 'profiles', 'transfer_market', 'league_teams',
        'fixtures', 'seasons', 'match_sessions', 'match_simulation_queue',
        'active_tactics', 'trainings', 'youth_players', 'watchlist',
        'notifications', 'user_academy', 'staff', 'staff_types',
      ];
      for (const tbl of rlsTables) {
        await client.query(`ALTER TABLE public.${tbl} ENABLE ROW LEVEL SECURITY`);
      }
      results.push('RLS enabled on 16 critical tables (including staff, staff_types)');

      // 22. RLS policies — profiles, players, transfer_market, league_teams, fixtures, seasons
      // ──── PROFILES ────
      await client.query(`DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles`);
      await client.query(`DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles`);
      await client.query(`DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles`);
      await client.query(`CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id::uuid)`);
      await client.query(`CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id::uuid)`);

      // ──── PLAYERS ────
      await client.query(`DROP POLICY IF EXISTS "players_select_all" ON public.players`);
      await client.query(`DROP POLICY IF EXISTS "players_update_own" ON public.players`);
      await client.query(`DROP POLICY IF EXISTS "players_insert_service" ON public.players`);
      await client.query(`DROP POLICY IF EXISTS "players_delete_service" ON public.players`);
      await client.query(`CREATE POLICY "players_select_all" ON public.players FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "players_update_own" ON public.players FOR UPDATE USING (auth.uid() = profile_id::uuid)`);
      await client.query(`CREATE POLICY "players_insert_service" ON public.players FOR INSERT WITH CHECK (true)`);
      await client.query(`CREATE POLICY "players_delete_service" ON public.players FOR DELETE USING (false)`);

      // ──── TRANSFER MARKET ────
      await client.query(`DROP POLICY IF EXISTS "transfer_market_select_all" ON public.transfer_market`);
      await client.query(`DROP POLICY IF EXISTS "transfer_market_insert_service" ON public.transfer_market`);
      await client.query(`DROP POLICY IF EXISTS "transfer_market_update_service" ON public.transfer_market`);
      await client.query(`CREATE POLICY "transfer_market_select_all" ON public.transfer_market FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "transfer_market_insert_service" ON public.transfer_market FOR INSERT WITH CHECK (true)`);
      await client.query(`CREATE POLICY "transfer_market_update_service" ON public.transfer_market FOR UPDATE USING (true)`);

      // ──── LEAGUE_TEAMS ────
      await client.query(`DROP POLICY IF EXISTS "league_teams_select_all" ON public.league_teams`);
      await client.query(`DROP POLICY IF EXISTS "league_teams_update_own" ON public.league_teams`);
      await client.query(`DROP POLICY IF EXISTS "league_teams_insert_service" ON public.league_teams`);
      await client.query(`CREATE POLICY "league_teams_select_all" ON public.league_teams FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "league_teams_update_own" ON public.league_teams FOR UPDATE USING (auth.uid() = profile_id::uuid)`);
      await client.query(`CREATE POLICY "league_teams_insert_service" ON public.league_teams FOR INSERT WITH CHECK (true)`);

      // ──── FIXTURES ────
      await client.query(`DROP POLICY IF EXISTS "fixtures_select_all" ON public.fixtures`);
      await client.query(`DROP POLICY IF EXISTS "fixtures_update_service" ON public.fixtures`);
      await client.query(`DROP POLICY IF EXISTS "fixtures_insert_service" ON public.fixtures`);
      await client.query(`CREATE POLICY "fixtures_select_all" ON public.fixtures FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "fixtures_update_service" ON public.fixtures FOR UPDATE USING (true)`);
      await client.query(`CREATE POLICY "fixtures_insert_service" ON public.fixtures FOR INSERT WITH CHECK (true)`);

      // ──── SEASONS ────
      await client.query(`DROP POLICY IF EXISTS "seasons_select_all" ON public.seasons`);
      await client.query(`DROP POLICY IF EXISTS "seasons_update_service" ON public.seasons`);
      await client.query(`DROP POLICY IF EXISTS "seasons_insert_service" ON public.seasons`);
      await client.query(`CREATE POLICY "seasons_select_all" ON public.seasons FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "seasons_update_service" ON public.seasons FOR UPDATE USING (true)`);
      await client.query(`CREATE POLICY "seasons_insert_service" ON public.seasons FOR INSERT WITH CHECK (true)`);
      results.push('RLS policies created for profiles, players, transfer_market, league_teams, fixtures, seasons');

      // 23. RLS policies — match_sessions, match_simulation_queue, active_tactics, trainings, youth_players, watchlist, notifications, user_academy
      // ──── MATCH_SESSIONS ────
      await client.query(`DROP POLICY IF EXISTS "match_sessions_select_all" ON public.match_sessions`);
      await client.query(`DROP POLICY IF EXISTS "match_sessions_update_service" ON public.match_sessions`);
      await client.query(`DROP POLICY IF EXISTS "match_sessions_insert_service" ON public.match_sessions`);
      await client.query(`CREATE POLICY "match_sessions_select_all" ON public.match_sessions FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "match_sessions_update_service" ON public.match_sessions FOR UPDATE USING (true)`);
      await client.query(`CREATE POLICY "match_sessions_insert_service" ON public.match_sessions FOR INSERT WITH CHECK (true)`);

      // ──── MATCH_SIMULATION_QUEUE ────
      await client.query(`DROP POLICY IF EXISTS "match_sim_queue_select_all" ON public.match_simulation_queue`);
      await client.query(`DROP POLICY IF EXISTS "match_sim_queue_update_service" ON public.match_simulation_queue`);
      await client.query(`DROP POLICY IF EXISTS "match_sim_queue_insert_service" ON public.match_simulation_queue`);
      await client.query(`DROP POLICY IF EXISTS "match_sim_queue_delete_service" ON public.match_simulation_queue`);
      await client.query(`CREATE POLICY "match_sim_queue_select_all" ON public.match_simulation_queue FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "match_sim_queue_update_service" ON public.match_simulation_queue FOR UPDATE USING (true)`);
      await client.query(`CREATE POLICY "match_sim_queue_insert_service" ON public.match_simulation_queue FOR INSERT WITH CHECK (true)`);
      await client.query(`CREATE POLICY "match_sim_queue_delete_service" ON public.match_simulation_queue FOR DELETE USING (true)`);

      // ──── ACTIVE_TACTICS ────
      await client.query(`DROP POLICY IF EXISTS "active_tactics_select_all" ON public.active_tactics`);
      await client.query(`DROP POLICY IF EXISTS "active_tactics_update_own" ON public.active_tactics`);
      await client.query(`DROP POLICY IF EXISTS "active_tactics_insert_service" ON public.active_tactics`);
      await client.query(`CREATE POLICY "active_tactics_select_all" ON public.active_tactics FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "active_tactics_update_own" ON public.active_tactics FOR UPDATE USING (auth.uid() = profile_id::uuid)`);
      await client.query(`CREATE POLICY "active_tactics_insert_service" ON public.active_tactics FOR INSERT WITH CHECK (true)`);

      // ──── TRAININGS ────
      await client.query(`DROP POLICY IF EXISTS "trainings_select_all" ON public.trainings`);
      await client.query(`DROP POLICY IF EXISTS "trainings_update_own" ON public.trainings`);
      await client.query(`DROP POLICY IF EXISTS "trainings_insert_service" ON public.trainings`);
      await client.query(`CREATE POLICY "trainings_select_all" ON public.trainings FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "trainings_update_own" ON public.trainings FOR UPDATE USING (auth.uid() = profile_id::uuid)`);
      await client.query(`CREATE POLICY "trainings_insert_service" ON public.trainings FOR INSERT WITH CHECK (true)`);

      // ──── YOUTH_PLAYERS ────
      await client.query(`DROP POLICY IF EXISTS "youth_players_select_all" ON public.youth_players`);
      await client.query(`DROP POLICY IF EXISTS "youth_players_update_own" ON public.youth_players`);
      await client.query(`DROP POLICY IF EXISTS "youth_players_insert_service" ON public.youth_players`);
      await client.query(`DROP POLICY IF EXISTS "youth_players_delete_service" ON public.youth_players`);
      await client.query(`CREATE POLICY "youth_players_select_all" ON public.youth_players FOR SELECT USING (true)`);
      await client.query(`CREATE POLICY "youth_players_update_own" ON public.youth_players FOR UPDATE USING (auth.uid() = profile_id::uuid)`);
      await client.query(`CREATE POLICY "youth_players_insert_service" ON public.youth_players FOR INSERT WITH CHECK (true)`);
      await client.query(`CREATE POLICY "youth_players_delete_service" ON public.youth_players FOR DELETE USING (auth.uid() = profile_id::uuid)`);

      // ──── WATCHLIST ────
      await client.query(`DROP POLICY IF EXISTS "watchlist_select_own" ON public.watchlist`);
      await client.query(`DROP POLICY IF EXISTS "watchlist_insert_own" ON public.watchlist`);
      await client.query(`DROP POLICY IF EXISTS "watchlist_delete_own" ON public.watchlist`);
      await client.query(`CREATE POLICY "watchlist_select_own" ON public.watchlist FOR SELECT USING (auth.uid() = profile_id::uuid)`);
      await client.query(`CREATE POLICY "watchlist_insert_own" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = profile_id::uuid)`);
      await client.query(`CREATE POLICY "watchlist_delete_own" ON public.watchlist FOR DELETE USING (auth.uid() = profile_id::uuid)`);

      // ──── NOTIFICATIONS ────
      await client.query(`DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications`);
      await client.query(`DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications`);
      await client.query(`DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications`);
      await client.query(`CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = profile_id::uuid)`);
      await client.query(`CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = profile_id::uuid)`);
      await client.query(`CREATE POLICY "notifications_insert_service" ON public.notifications FOR INSERT WITH CHECK (true)`);

      // ──── USER_ACADEMY ────
      await client.query(`DROP POLICY IF EXISTS "user_academy_select_own" ON public.user_academy`);
      await client.query(`DROP POLICY IF EXISTS "user_academy_update_own" ON public.user_academy`);
      await client.query(`DROP POLICY IF EXISTS "user_academy_insert_service" ON public.user_academy`);
      await client.query(`CREATE POLICY "user_academy_select_own" ON public.user_academy FOR SELECT USING (auth.uid() = profile_id::uuid)`);
      await client.query(`CREATE POLICY "user_academy_update_own" ON public.user_academy FOR UPDATE USING (auth.uid() = profile_id::uuid)`);
      await client.query(`CREATE POLICY "user_academy_insert_service" ON public.user_academy FOR INSERT WITH CHECK (true)`);
      results.push('RLS policies created for match_sessions, match_sim_queue, active_tactics, trainings, youth_players, watchlist, notifications, user_academy');

      // 24. Create SECURITY DEFINER RPC functions for safe operations
      // RPC: Safe transfer purchase (prevents race condition)
      await client.query(`
        CREATE OR REPLACE FUNCTION public.rpc_transfer_buy(
          p_player_id UUID,
          p_buyer_id UUID,
          p_buyer_team TEXT,
          p_transfer_fee BIGINT
        )
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          v_player_profile_id UUID;
          v_buyer_money BIGINT;
          v_seller_id UUID;
          v_listing_id UUID;
        BEGIN
          SELECT profile_id INTO v_player_profile_id
          FROM public.players WHERE id = p_player_id FOR UPDATE;

          IF v_player_profile_id IS NOT NULL AND v_player_profile_id != p_buyer_id THEN
            RETURN jsonb_build_object('success', false, 'reason', 'Bu oyuncu zaten bir takıma ait');
          END IF;

          SELECT money INTO v_buyer_money
          FROM public.profiles WHERE id = p_buyer_id::uuid FOR UPDATE;

          IF v_buyer_money < p_transfer_fee THEN
            RETURN jsonb_build_object('success', false, 'reason', 'Yetersiz bakiye');
          END IF;

          SELECT id, seller_id INTO v_listing_id, v_seller_id
          FROM public.transfer_market
          WHERE player_id = p_player_id AND is_active = true
          FOR UPDATE LIMIT 1;

          UPDATE public.profiles SET money = money - p_transfer_fee WHERE id = p_buyer_id::uuid;

          IF v_seller_id IS NOT NULL AND v_seller_id != 'free-agent-system' THEN
            UPDATE public.profiles SET money = money + ROUND(p_transfer_fee * 0.975) WHERE id = v_seller_id::uuid;
          END IF;

          UPDATE public.players
          SET profile_id = p_buyer_id, team_name = p_buyer_team, club = p_buyer_team, is_for_sale = false
          WHERE id = p_player_id;

          IF v_listing_id IS NOT NULL THEN
            UPDATE public.transfer_market SET is_active = false WHERE id = v_listing_id;
          END IF;

          RETURN jsonb_build_object('success', true, 'transfer_fee', p_transfer_fee, 'remaining_money', v_buyer_money - p_transfer_fee);
        END;
        $$
      `);

      // RPC: Safe free agent purchase (prevents race condition)
      await client.query(`
        CREATE OR REPLACE FUNCTION public.rpc_buy_free_agent(
          p_player_id UUID,
          p_buyer_id UUID,
          p_buyer_team TEXT,
          p_transfer_fee BIGINT
        )
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          v_player_profile_id UUID;
          v_buyer_money BIGINT;
          v_listing_id UUID;
        BEGIN
          SELECT profile_id INTO v_player_profile_id
          FROM public.players WHERE id = p_player_id FOR UPDATE;

          IF v_player_profile_id IS NOT NULL THEN
            RETURN jsonb_build_object('success', false, 'reason', 'Bu oyuncu serbest değil');
          END IF;

          SELECT money INTO v_buyer_money
          FROM public.profiles WHERE id = p_buyer_id::uuid FOR UPDATE;

          IF v_buyer_money < p_transfer_fee THEN
            RETURN jsonb_build_object('success', false, 'reason', 'Yetersiz bakiye');
          END IF;

          SELECT id INTO v_listing_id
          FROM public.transfer_market
          WHERE player_id = p_player_id AND is_active = true
          FOR UPDATE LIMIT 1;

          UPDATE public.profiles SET money = money - p_transfer_fee WHERE id = p_buyer_id::uuid;

          UPDATE public.players
          SET profile_id = p_buyer_id, team_name = p_buyer_team, club = p_buyer_team, is_free_agent = false
          WHERE id = p_player_id;

          IF v_listing_id IS NOT NULL THEN
            UPDATE public.transfer_market SET is_active = false WHERE id = v_listing_id;
          END IF;

          RETURN jsonb_build_object('success', true, 'transfer_fee', p_transfer_fee, 'remaining_money', v_buyer_money - p_transfer_fee);
        END;
        $$
      `);

      // RPC: Sell player (mark as free agent)
      await client.query(`
        CREATE OR REPLACE FUNCTION public.rpc_sell_player(
          p_player_id UUID,
          p_seller_id UUID,
          p_sale_price BIGINT
        )
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          v_player_profile_id UUID;
          v_seller_money BIGINT;
          v_tax_rate NUMERIC := 0.025;
          v_net_revenue BIGINT;
        BEGIN
          SELECT profile_id INTO v_player_profile_id
          FROM public.players WHERE id = p_player_id FOR UPDATE;

          IF v_player_profile_id IS NULL OR v_player_profile_id::text != p_seller_id::text THEN
            RETURN jsonb_build_object('success', false, 'reason', 'Bu oyuncu size ait değil');
          END IF;

          v_net_revenue := ROUND(p_sale_price * (1 - v_tax_rate));

          SELECT money INTO v_seller_money
          FROM public.profiles WHERE id = p_seller_id::uuid FOR UPDATE;

          UPDATE public.profiles SET money = money + v_net_revenue WHERE id = p_seller_id::uuid;

          UPDATE public.players
          SET profile_id = NULL, team_name = 'Transfer Listesi', club = 'Transfer Listesi', is_for_sale = false
          WHERE id = p_player_id;

          RETURN jsonb_build_object('success', true, 'net_revenue', v_net_revenue, 'tax_amount', ROUND(p_sale_price * v_tax_rate));
        END;
        $$
      `);

      // RPC: Update player condition (for training/match usage)
      await client.query(`
        CREATE OR REPLACE FUNCTION public.rpc_update_player_cond(
          p_player_id UUID,
          p_owner_id UUID,
          p_new_cond INTEGER
        )
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          v_profile_id UUID;
        BEGIN
          SELECT profile_id INTO v_profile_id
          FROM public.players WHERE id = p_player_id FOR UPDATE;

          IF v_profile_id IS NULL OR v_profile_id::text != p_owner_id::text THEN
            RETURN jsonb_build_object('success', false, 'reason', 'Yetkisiz');
          END IF;

          UPDATE public.players SET cond = LEAST(100, GREATEST(0, p_new_cond)) WHERE id = p_player_id;

          RETURN jsonb_build_object('success', true);
        END;
        $$
      `);

      // RPC: Atomik piyasadan satın alma (rpc_market_buy)
      // Tüm adımları tek transaction içinde yapar: bakiye kontrolü, para transferi, oyuncu sahipliği, ilan deaktif
      await client.query(`
        CREATE OR REPLACE FUNCTION public.rpc_market_buy(
          p_listing_id UUID,
          p_buyer_id TEXT,
          p_buyer_team TEXT
        )
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          v_listing RECORD;
          v_tax_amount NUMERIC;
          v_seller_revenue NUMERIC;
          v_buyer_money NUMERIC;
        BEGIN
          SELECT * INTO v_listing FROM public.transfer_market WHERE id = p_listing_id FOR UPDATE;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'reason', 'İlan bulunamadı');
          END IF;

          IF v_listing.is_active = false THEN
            RETURN jsonb_build_object('success', false, 'reason', 'İlan artık aktif değil');
          END IF;

          IF v_listing.is_auction = true THEN
            RETURN jsonb_build_object('success', false, 'reason', 'Bu bir müzayede ilanı, placeBid kullanın');
          END IF;

          SELECT money INTO v_buyer_money FROM public.profiles WHERE id = p_buyer_id FOR UPDATE;

          IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'reason', 'Alıcı profili bulunamadı');
          END IF;

          IF v_buyer_money < v_listing.price THEN
            RETURN jsonb_build_object('success', false, 'reason', 'Yetersiz bütçe');
          END IF;

          v_tax_amount := v_listing.price * 0.025;
          v_seller_revenue := v_listing.price - v_tax_amount;

          UPDATE public.profiles SET money = money - v_listing.price WHERE id = p_buyer_id;

          IF v_listing.seller_id IS NOT NULL AND v_listing.seller_id != 'free-agent-system' THEN
            UPDATE public.profiles SET money = money + v_seller_revenue WHERE id = v_listing.seller_id;
          END IF;

          UPDATE public.players
          SET profile_id = p_buyer_id,
              team_name = COALESCE(p_buyer_team, p_buyer_id),
              club = COALESCE(p_buyer_team, p_buyer_id),
              is_for_sale = false
          WHERE id = v_listing.player_id;

          UPDATE public.transfer_market SET is_active = false WHERE id = p_listing_id;

          RETURN jsonb_build_object(
            'success', true,
            'price', v_listing.price,
            'tax_amount', v_tax_amount,
            'seller_revenue', v_seller_revenue,
            'player_id', v_listing.player_id
          );
        END;
        $$
      `);

      // Grant execute permissions on RPC functions
      await client.query(`GRANT EXECUTE ON FUNCTION public.rpc_transfer_buy TO anon, authenticated`);
      await client.query(`GRANT EXECUTE ON FUNCTION public.rpc_buy_free_agent TO anon, authenticated`);
      await client.query(`GRANT EXECUTE ON FUNCTION public.rpc_sell_player TO anon, authenticated`);
      await client.query(`GRANT EXECUTE ON FUNCTION public.rpc_update_player_cond TO anon, authenticated`);
      await client.query(`GRANT EXECUTE ON FUNCTION public.rpc_market_buy TO anon, authenticated`);
      results.push('5 SECURITY DEFINER RPC functions created (rpc_transfer_buy, rpc_buy_free_agent, rpc_sell_player, rpc_update_player_cond, rpc_market_buy)');

      // 25. Reload PostgREST schema cache
      await client.query(`NOTIFY pgrst, 'reload schema'`);
      results.push('PostgREST schema cache reload notified');

      // ═══════════════════════════════════════════════════════════════════
      // VERİTABANI-5: Composite Indexes for Performance
      // ═══════════════════════════════════════════════════════════════════
      // 26. Create composite indexes (full table scans → index scans)
      await client.query(`CREATE INDEX IF NOT EXISTS idx_fixtures_status_date ON public.fixtures(status, match_date)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_league_standings_league_season ON public.league_standings(league_id, season_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_players_profile_position ON public.players(profile_id, position)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_transfer_market_active_expires ON public.transfer_market(is_active, expires_at)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_league_teams_league_profile ON public.league_teams(league_id, profile_id)`);
      results.push('VERİTABANI-5: 5 composite indexes created (fixtures, league_standings, players, transfer_market, league_teams)');

      // ═══════════════════════════════════════════════════════════════════
      // VERİTABANI-6: Cascade Delete FK Constraints
      // ═══════════════════════════════════════════════════════════════════
      // 27. Add ON DELETE CASCADE to FK constraints referencing profiles.id
      // When a profile is deleted, all related records should be cleaned up automatically.

      // players.profile_id → profiles.id ON DELETE CASCADE
      await client.query(`ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_profile_id_fkey`);
      await client.query(`
        ALTER TABLE public.players ADD CONSTRAINT players_profile_id_fkey
          FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
      `);

      // league_teams.profile_id → profiles.id ON DELETE CASCADE
      await client.query(`ALTER TABLE public.league_teams DROP CONSTRAINT IF EXISTS league_teams_profile_id_fkey`);
      await client.query(`
        ALTER TABLE public.league_teams ADD CONSTRAINT league_teams_profile_id_fkey
          FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
      `);

      // active_tactics.profile_id → profiles.id ON DELETE CASCADE
      await client.query(`ALTER TABLE public.active_tactics DROP CONSTRAINT IF EXISTS active_tactics_profile_id_fkey`);
      await client.query(`
        ALTER TABLE public.active_tactics ADD CONSTRAINT active_tactics_profile_id_fkey
          FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
      `);

      // trainings.profile_id → profiles.id ON DELETE CASCADE
      await client.query(`ALTER TABLE public.trainings DROP CONSTRAINT IF EXISTS trainings_profile_id_fkey`);
      await client.query(`
        ALTER TABLE public.trainings ADD CONSTRAINT trainings_profile_id_fkey
          FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
      `);

      // watchlist.profile_id → profiles.id ON DELETE CASCADE
      await client.query(`ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_profile_id_fkey`);
      await client.query(`ALTER TABLE public.watchlist DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey`);
      await client.query(`
        ALTER TABLE public.watchlist ADD CONSTRAINT watchlist_profile_id_fkey
          FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
      `);

      // notifications.profile_id → profiles.id ON DELETE CASCADE
      await client.query(`ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_profile_id_fkey`);
      await client.query(`ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey`);
      await client.query(`
        ALTER TABLE public.notifications ADD CONSTRAINT notifications_profile_id_fkey
          FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
      `);

      // youth_players.profile_id → profiles.id ON DELETE CASCADE
      await client.query(`ALTER TABLE public.youth_players DROP CONSTRAINT IF EXISTS youth_players_profile_id_fkey`);
      await client.query(`
        ALTER TABLE public.youth_players ADD CONSTRAINT youth_players_profile_id_fkey
          FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
      `);

      // user_academy.profile_id → profiles.id ON DELETE CASCADE
      await client.query(`ALTER TABLE public.user_academy DROP CONSTRAINT IF EXISTS user_academy_profile_id_fkey`);
      await client.query(`
        ALTER TABLE public.user_academy ADD CONSTRAINT user_academy_profile_id_fkey
          FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
      `);

      // user_facilities.profile_id → profiles.id ON DELETE CASCADE
      await client.query(`ALTER TABLE public.user_facilities DROP CONSTRAINT IF EXISTS user_facilities_profile_id_fkey`);
      await client.query(`
        ALTER TABLE public.user_facilities ADD CONSTRAINT user_facilities_profile_id_fkey
          FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
      `);

      results.push('VERİTABANI-6: ON DELETE CASCADE added to 9 FK constraints (players, league_teams, active_tactics, trainings, watchlist, notifications, youth_players, user_academy, user_facilities)');

      // 28. Reload PostgREST schema cache after FK changes
      await client.query(`NOTIFY pgrst, 'reload schema'`);
      results.push('PostgREST schema cache reload notified (after FK cascade changes)');

      // ═══════════════════════════════════════════════════════════════════
      // BLOK A-E: 5 Sistem Upgrade Migration'ları
      // ═══════════════════════════════════════════════════════════════════

      // 29. fixtures.competition_type (playoff/kupa/lig ayrımı)
      await client.query(`ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS competition_type TEXT DEFAULT 'league'`);
      results.push('fixtures.competition_type column added (playoff/cup/league)');

      // 30. profiles.consecutive_wins (galibiyet serisi takibi)
      await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_wins INTEGER DEFAULT 0`);
      results.push('profiles.consecutive_wins column added');

      // 31. profiles.ffp_restricted (FFP kısıtlama flag)
      await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ffp_restricted BOOLEAN DEFAULT FALSE`);
      results.push('profiles.ffp_restricted column added');

      // 32. profiles.last_income_breakdown (haftalık gelir detayı)
      await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_income_breakdown JSONB DEFAULT '{}'`);
      results.push('profiles.last_income_breakdown column added');

      // 33. player_development_log_summary view (düzeltilmiş sütun adları)
      // Eski sütunlar: week, ovr_before, ovr_after → Yeni: season_week, old_ovr, new_ovr
      // DİKKAT: CREATE OR REPLACE VIEW ile sütun düşülemez → DROP+CREATE gerekli
      await client.query(`DROP VIEW IF EXISTS player_development_log_summary`);
      await client.query(`
        CREATE VIEW player_development_log_summary AS
        SELECT
          player_id,
          season_week,
          change_reason,
          match_performance_contribution,
          COALESCE(old_ovr, old_rating) as old_ovr,
          COALESCE(new_ovr, new_rating) as new_ovr,
          created_at
        FROM player_development_log
        ORDER BY created_at DESC
      `);
      results.push('player_development_log_summary view düzeltildi (season_week, old_ovr, new_ovr)');

      // 34. Reload PostgREST schema cache after new columns
      await client.query(`NOTIFY pgrst, 'reload schema'`);
      results.push('PostgREST schema cache reload notified (after Block A-E migrations)');

      // 35. match_sessions.match_date kolonu (hava tutarlılığı için)
      await client.query(`ALTER TABLE match_sessions ADD COLUMN IF NOT EXISTS match_date TEXT`);
      results.push('match_sessions.match_date column added (weather consistency)');

      // 36. Eksik players kolonları (clean_sheets, matches_played, is_youth, yellow_cards, red_cards)
      await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS clean_sheets INTEGER DEFAULT 0`);
      await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0`);
      await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS is_youth BOOLEAN DEFAULT FALSE`);
      await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS yellow_cards INTEGER DEFAULT 0`);
      await client.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS red_cards INTEGER DEFAULT 0`);
      results.push('players: clean_sheets, matches_played, is_youth, yellow_cards, red_cards columns added');

      // 37. Eksik cron_locks tablosu
      await client.query(`
        CREATE TABLE IF NOT EXISTS cron_locks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          job_name TEXT NOT NULL,
          instance_id TEXT NOT NULL,
          acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ NOT NULL,
          UNIQUE(job_name)
        )
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_cron_locks_expires ON cron_locks(expires_at)`);
      await client.query(`ALTER TABLE cron_locks ENABLE ROW LEVEL SECURITY`);
      results.push('cron_locks table created');

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
