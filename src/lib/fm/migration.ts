import { getSupabase, isSupabaseConfigured } from '../supabase';
import { savePlayers } from './persistence';

export interface MigrationResult {
  success: boolean;
  count: number;
}

export async function migrateLocalStorageToSupabase(userId: string): Promise<MigrationResult> {
  if (!isSupabaseConfigured() || !userId) return { success: false, count: 0 };
  
  const supabase = getSupabase();
  if (!supabase) return { success: false, count: 0 };

  const localProfile = localStorage.getItem('fm_profile');
  const localSquad = localStorage.getItem('fm_squad');

  if (!localProfile && !localSquad) return { success: true, count: 0 };

  try {
    let count = 0;
    
    if (localProfile) {
      const profile = JSON.parse(localProfile);
      // Ensure ID matches
      profile.id = userId;
      await supabase.from('profiles').upsert(profile);
    }

    if (localSquad) {
      const squad = JSON.parse(localSquad);
      count = squad.length;
      
      await savePlayers(squad, userId);
    }

    return { success: true, count };
  } catch (err) {
    console.error('Migration failed:', err);
    return { success: false, count: 0 };
  }
}

export async function checkSupabaseData(userId: string) {
  if (!isSupabaseConfigured() || !userId) return { players: 0 };
  
  const supabase = getSupabase();
  if (!supabase) return { players: 0 };

  try {
    const { count, error } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', userId);
    
    if (error) throw error;
    return { players: count || 0 };
  } catch (err) {
    console.error('Check failed:', err);
    return { players: 0 };
  }
}
