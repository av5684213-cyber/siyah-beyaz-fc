/**
 * Migration Script: localStorage UUID → Supabase Auth
 * 
 * This script migrates existing users who were identified by localStorage UUIDs
 * to Supabase Auth. It:
 * 
 * 1. Reads all existing profiles from the `profiles` table
 * 2. For each profile that doesn't have a corresponding auth.users entry:
 *    a. Creates a new auth user with a random password
 *    b. Updates the profile's id to match the new auth user's id
 *    c. Updates all FK references (players, league_teams, etc.)
 * 
 * Usage: npx tsx scripts/migrate-local-users-to-auth.ts
 * 
 * IMPORTANT: Run this script ONCE. After migration, users will need to
 * use "Forgot Password" to set their own passwords.
 * 
 * Prerequisites:
 * - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars must be set
 * - The handle_new_user() trigger must be disabled temporarily during migration
 *   to prevent duplicate profile creation
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function migrateUsers() {
  console.log('=== localStorage UUID → Supabase Auth Migration ===\n');

  // Step 1: Get all existing profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, team_name, email, manager_name')
    .order('created_at', { ascending: true });

  if (profilesError) {
    console.error('Failed to fetch profiles:', profilesError);
    process.exit(1);
  }

  console.log(`Found ${profiles?.length || 0} profiles\n`);

  if (!profiles || profiles.length === 0) {
    console.log('No profiles to migrate.');
    return;
  }

  // Step 2: Get all existing auth users
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const existingAuthIds = new Set((authUsers?.users || []).map(u => u.id));
  
  console.log(`Found ${existingAuthIds.size} existing auth users\n`);

  // Step 3: Find profiles that need migration
  const profilesToMigrate = profiles.filter(p => !existingAuthIds.has(p.id));
  console.log(`Profiles to migrate: ${profilesToMigrate.length}\n`);

  if (profilesToMigrate.length === 0) {
    console.log('All profiles already have auth users. Nothing to migrate.');
    return;
  }

  // Step 4: Temporarily disable the trigger
  console.log('⚠️  IMPORTANT: Temporarily disable the handle_new_user() trigger before running this script.');
  console.log('   Run: ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;\n');
  console.log('   Re-enable after: ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;\n');

  let successCount = 0;
  let errorCount = 0;

  for (const profile of profilesToMigrate) {
    const oldId = profile.id;
    const email = profile.email || `${oldId.substring(0, 8)}@migrated.touchlinemanager.com`;
    const password = generateRandomPassword();
    const teamName = profile.team_name || 'Göç Menajeri';

    console.log(`Migrating: ${teamName} (id: ${oldId.substring(0, 8)}...)`);

    try {
      // Create auth user
      const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          team_name: teamName,
          manager_name: profile.manager_name || 'Menajer',
          migrated_from: oldId,
        }
      });

      if (createError) {
        console.error(`  ❌ Failed to create auth user: ${createError.message}`);
        errorCount++;
        continue;
      }

      const newId = newUserData.user.id;
      console.log(`  ✅ Auth user created: ${newId.substring(0, 8)}... (email: ${email})`);

      // Update profile id
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ id: newId, email })
        .eq('id', oldId);

      if (profileUpdateError) {
        console.error(`  ❌ Failed to update profile id: ${profileUpdateError.message}`);
        errorCount++;
        continue;
      }

      // Update players profile_id
      const { error: playersError } = await supabase
        .from('players')
        .update({ profile_id: newId })
        .eq('profile_id', oldId);

      if (playersError) {
        console.error(`  ⚠️  Failed to update players: ${playersError.message}`);
      }

      // Update league_teams profile_id
      const { error: leagueTeamsError } = await supabase
        .from('league_teams')
        .update({ profile_id: newId })
        .eq('profile_id', oldId);

      if (leagueTeamsError) {
        console.error(`  ⚠️  Failed to update league_teams: ${leagueTeamsError.message}`);
      }

      // Update other FK tables
      const fkTables = [
        'trainings', 'scouted_players', 'user_facilities', 
        'player_achievements', 'hall_of_fame', 'season_awards',
        'watchlist', 'youth_players', 'cup_seasons', 'push_subscriptions',
        'training_attendances', 'player_development_log',
        'notification_preferences', 'friendly_matches'
      ];

      for (const table of fkTables) {
        // Try both profile_id and user_id column names
        for (const col of ['profile_id', 'user_id']) {
          const { error } = await supabase
            .from(table)
            .update({ [col]: newId })
            .eq(col, oldId);
          
          if (error && !error.message.includes('0 rows') && !error.message.includes('does not exist')) {
            // Only log real errors, not "column doesn't exist" or "no rows updated"
            if (!error.message.includes('column') && !error.message.includes('relation')) {
              console.error(`  ⚠️  ${table}.${col}: ${error.message}`);
            }
          }
        }
      }

      // Update match participants and chat
      for (const col of ['user_id', 'profile_id', 'sender_id', 'home_team_id']) {
        // These are less critical, try them
        const tables = col === 'sender_id' ? ['manager_messages'] 
                      : col === 'home_team_id' ? ['friendly_matches']
                      : ['match_participants', 'match_chat'];
        
        for (const table of tables) {
          const { error } = await supabase
            .from(table)
            .update({ [col]: newId })
            .eq(col, oldId);
          
          if (error && !error.message.includes('column') && !error.message.includes('relation')) {
            console.error(`  ⚠️  ${table}.${col}: ${error.message}`);
          }
        }
      }

      console.log(`  ✅ Migration complete for ${teamName}`);
      successCount++;

    } catch (err: any) {
      console.error(`  ❌ Unexpected error: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n=== Migration Summary ===`);
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`\n⚠️  Remember to re-enable the trigger:`);
  console.log(`   ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;`);
  console.log(`\n📧 Migrated users need to use "Forgot Password" to set their own passwords.`);
}

migrateUsers().catch(console.error);
