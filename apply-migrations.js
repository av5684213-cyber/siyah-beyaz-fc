/**
 * Supabase Schema Migration Script
 * 
 * Usage:
 *   DATABASE_URL="postgresql://postgres:PASSWORD@db.jmxbyaamwbpnvgbnjbmo.supabase.co:5432/postgres" node apply-migrations.js
 * 
 * Or update the .env file with the correct DATABASE_URL and run:
 *   node apply-migrations.js
 */

const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || databaseUrl.startsWith('file:')) {
  console.error('ERROR: DATABASE_URL must be a PostgreSQL connection string.');
  console.error('Set it to: postgresql://postgres:[YOUR-PASSWORD]@db.jmxbyaamwbpnvgbnjbmo.supabase.co:5432/postgres');
  console.error('Find your password at: Supabase Dashboard → Settings → Database → Connection string');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  const results = [];

  try {
    console.log('Applying schema migrations...\n');

    // 1. facility_upgrade_costs: UNIQUE constraint
    console.log('1. Adding facility_upgrade_costs UNIQUE constraint...');
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
    results.push('✓ facility_upgrade_costs UNIQUE constraint');
    console.log('   ✓ Done');

    // 2. youth_facilities: PRIMARY KEY
    console.log('2. Adding youth_facilities PRIMARY KEY...');
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
    results.push('✓ youth_facilities PRIMARY KEY');
    console.log('   ✓ Done');

    // 3. lab_sessions: Permissive RLS
    console.log('3. Updating lab_sessions RLS policies...');
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
    results.push('✓ lab_sessions RLS policies (permissive)');
    console.log('   ✓ Done');

    // 4. user_facilities: Fix constraints and columns
    console.log('4. Fixing user_facilities constraints...');
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conrelid = 'user_facilities'::regclass
          AND contype = 'u'
          AND conname = 'user_facilities_profile_id_key'
        ) THEN
          ALTER TABLE user_facilities DROP CONSTRAINT user_facilities_profile_id_key;
        END IF;
      END $$;
    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_facilities_profile_type ON user_facilities(profile_id, facility_type)`);
    results.push('✓ user_facilities constraints fixed');
    console.log('   ✓ Done');

    // 5. user_facilities: Missing columns
    console.log('5. Adding user_facilities missing columns...');
    await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS facility_type TEXT`);
    await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 0`);
    await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS upgrade_started_at TIMESTAMPTZ`);
    await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS upgrade_end_at TIMESTAMPTZ`);
    await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS speed_up_used BOOLEAN DEFAULT FALSE`);
    await client.query(`ALTER TABLE user_facilities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`);
    results.push('✓ user_facilities columns added');
    console.log('   ✓ Done');

    // 6. user_facilities: Permissive RLS
    console.log('6. Updating user_facilities RLS policies...');
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
    results.push('✓ user_facilities RLS policies (permissive)');
    console.log('   ✓ Done');

    // 7. youth_facilities: Permissive RLS
    console.log('7. Updating youth_facilities RLS policies...');
    await client.query(`DROP POLICY IF EXISTS "youth_facilities_select_all" ON youth_facilities`);
    await client.query(`DROP POLICY IF EXISTS "youth_facilities_insert_all" ON youth_facilities`);
    await client.query(`DROP POLICY IF EXISTS "youth_facilities_update_all" ON youth_facilities`);
    await client.query(`CREATE POLICY "youth_facilities_select_all" ON youth_facilities FOR SELECT USING (true)`);
    await client.query(`CREATE POLICY "youth_facilities_insert_all" ON youth_facilities FOR INSERT WITH CHECK (true)`);
    await client.query(`CREATE POLICY "youth_facilities_update_all" ON youth_facilities FOR UPDATE USING (true)`);
    await client.query(`CREATE POLICY "youth_facilities_delete_all" ON youth_facilities FOR DELETE USING (true)`);
    results.push('✓ youth_facilities RLS policies (permissive)');
    console.log('   ✓ Done');

    // 8. profiles: Missing columns
    console.log('8. Adding profiles missing columns...');
    await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_newspaper_applied DATE`);
    await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consecutive_losses INTEGER DEFAULT 0`);
    await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS financial_health TEXT DEFAULT 'healthy'`);
    await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_friendly_date TEXT`);
    await client.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_friendly_count INTEGER DEFAULT 0`);
    results.push('✓ profiles columns added');
    console.log('   ✓ Done');

    // 9. match_simulation_queue: Unique constraint
    console.log('9. Adding match_simulation_queue unique constraint...');
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
    results.push('✓ match_simulation_queue unique constraint');
    console.log('   ✓ Done');

    // 10. Reload PostgREST schema cache
    console.log('10. Reloading PostgREST schema cache...');
    await client.query(`NOTIFY pgrst, 'reload schema'`);
    results.push('✓ PostgREST schema cache reload');
    console.log('   ✓ Done');

    console.log('\n═══════════════════════════════════════');
    console.log('All migrations applied successfully!');
    console.log('═══════════════════════════════════════');
    results.forEach(r => console.log(r));

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error('Results so far:', results);
    process.exit(1);
  } finally {
    client.release();
  }

  await pool.end();
}

migrate();
