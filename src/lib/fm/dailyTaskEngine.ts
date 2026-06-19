/**
 * dailyTaskEngine.ts
 *
 * TASARIM-4: Daily Task System
 *
 * Her gün 3 rastgele görev üretir, tamamlanma kontrolü yapar
 * ve ödül dağıtır. Mevcut daily_tasks tablosunu kullanır.
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from './types';

// ─── Task Type Definitions ─────────────────────────────────────────

export type DailyTaskType =
  | 'WIN_BIG'          // 3-0 veya daha iyi galip gel
  | 'WIN_MATCH'        // Bir maç kazan
  | 'DRAW_MATCH'       // Berabere kal
  | 'SCORE_GOALS'      // 2+ gol at
  | 'CLEAN_SHEET'      // Kaleyi gole kapat
  | 'LIST_PLAYERS'     // Transfer pazarına 2 oyuncu listele
  | 'FULL_TRAINING'    // Sabah antrenmanına 11 oyuncuyla katıl
  | 'PROMOTE_YOUTH'    // Bir genci birinci takıma terfi ettir
  | 'READ_ANALYSIS'    // Rakip analizini oku
  | 'CHANGE_TACTICS'   // Taktik değiştir
  | 'REST_INJURED';    // Sakat oyuncuyu dinlendir

export interface DailyTaskDefinition {
  type: DailyTaskType;
  description: string;
  reward_type: 'money' | 'credit';
  reward_amount: number;
  icon: string;
  target_value: number; // Hedef değer (örn: 3 gol, 2 listeleme, 11 oyuncu)
}

export const DAILY_TASK_DEFINITIONS: Record<DailyTaskType, DailyTaskDefinition> = {
  WIN_BIG: {
    type: 'WIN_BIG',
    description: 'Bugün 3-0 veya daha iyi galip gel',
    reward_type: 'money',
    reward_amount: 75000,
    icon: '🏆',
    target_value: 3,
  },
  LIST_PLAYERS: {
    type: 'LIST_PLAYERS',
    description: 'Transfer pazarına 2 oyuncu listele',
    reward_type: 'credit',
    reward_amount: 1,
    icon: '📋',
    target_value: 2,
  },
  FULL_TRAINING: {
    type: 'FULL_TRAINING',
    description: 'Sabah antrenmanına 11 oyuncuyla katıl',
    reward_type: 'money',
    reward_amount: 30000,
    icon: '💪',
    target_value: 11,
  },
  PROMOTE_YOUTH: {
    type: 'PROMOTE_YOUTH',
    description: 'Bir genci birinci takıma terfi ettir',
    reward_type: 'credit',
    reward_amount: 2,
    icon: '🧬',
    target_value: 1,
  },
  READ_ANALYSIS: {
    type: 'READ_ANALYSIS',
    description: 'Rakip analizini oku',
    reward_type: 'money',
    reward_amount: 15000,
    icon: '🔍',
    target_value: 1,
  },
  CHANGE_TACTICS: {
    type: 'CHANGE_TACTICS',
    description: 'Taktik değiştir',
    reward_type: 'money',
    reward_amount: 10000,
    icon: '🔄',
    target_value: 1,
  },
  REST_INJURED: {
    type: 'REST_INJURED',
    description: 'Sakat oyuncuyu dinlendir',
    reward_type: 'money',
    reward_amount: 5000,
    icon: '🏥',
    target_value: 1,
  },
  WIN_MATCH: {
    type: 'WIN_MATCH',
    description: 'Bir maç kazan',
    reward_type: 'money',
    reward_amount: 30000,
    icon: '🏆',
    target_value: 1,
  },
  DRAW_MATCH: {
    type: 'DRAW_MATCH',
    description: 'Berabere kal',
    reward_type: 'money',
    reward_amount: 15000,
    icon: '🤝',
    target_value: 1,
  },
  SCORE_GOALS: {
    type: 'SCORE_GOALS',
    description: '2+ gol at',
    reward_type: 'credit',
    reward_amount: 1,
    icon: '⚽',
    target_value: 2,
  },
  CLEAN_SHEET: {
    type: 'CLEAN_SHEET',
    description: 'Kalenizi gole kapatın',
    reward_type: 'money',
    reward_amount: 25000,
    icon: '🧤',
    target_value: 1,
  },
};

// ─── Task Generation ───────────────────────────────────────────────

/**
 * Bir profil için günlük 3 rastgele görev üretir.
 * Eğer bugün zaten görev atanmışsa atlamaz — önce mevcut görevleri kontrol eder.
 */
export async function generateDailyTasks(
  profileId: string,
  profile?: Profile | null
): Promise<{ generated: number; skipped: number }> {
  if (!isSupabaseConfigured() || !profileId) return { generated: 0, skipped: 0 };

  const supabase = getSupabase();
  if (!supabase) return { generated: 0, skipped: 0 };

  const today = new Date().toISOString().split('T')[0];

  // Bugün zaten görev var mı kontrol et
  const { data: existing } = await supabase
    .from('daily_tasks')
    .select('id')
    .eq('user_id', profileId)
    .eq('date', today);

  if (existing && existing.length > 0) {
    return { generated: 0, skipped: existing.length };
  }

  // 3 rastgele görev seç
  const allTypes = Object.keys(DAILY_TASK_DEFINITIONS) as DailyTaskType[];
  const shuffled = shuffleArray(allTypes);
  const selected = shuffled.slice(0, 3);

  // Görevleri kaydet
  let generated = 0;
  for (const taskType of selected) {
    const def = DAILY_TASK_DEFINITIONS[taskType];
    try {
      const { error } = await supabase.from('daily_tasks').insert({
        user_id: profileId,
        task_type: def.type,
        description: def.description,
        reward_type: def.reward_type,
        reward_amount: def.reward_amount,
        is_completed: false,
        date: today,
        progress: 0,
        target_value: def.target_value,
      });
      if (!error) generated++;
    } catch (err) {
      console.warn('[dailyTaskEngine] Task insert error:', err);
    }
  }

  return { generated, skipped: 0 };
}

// ─── Task Completion Check ─────────────────────────────────────────

/**
 * Bir görevin tamamlanma durumunu kontrol eder.
 * Task tipine göre progress değerini günceller.
 * Eğer target_value'ya ulaştıysa is_completed = true yapar.
 */
export async function checkTaskCompletion(
  profileId: string,
  taskType: DailyTaskType,
  value: number
): Promise<boolean> {
  if (!isSupabaseConfigured() || !profileId) return false;

  const supabase = getSupabase();
  if (!supabase) return false;

  const today = new Date().toISOString().split('T')[0];

  // Bugünkü görevi bul
  const { data: task } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', profileId)
    .eq('task_type', taskType)
    .eq('date', today)
    .maybeSingle();

  if (!task || task.is_completed) return false;

  const def = DAILY_TASK_DEFINITIONS[taskType];
  const newProgress = (task.progress || 0) + value;
  const targetValue = def?.target_value || task.target_value || 1;
  const isNowCompleted = newProgress >= targetValue;

  try {
    await supabase
      .from('daily_tasks')
      .update({
        progress: newProgress,
        is_completed: isNowCompleted,
      })
      .eq('id', task.id);
  } catch (err) {
    console.warn('[dailyTaskEngine] Progress update error:', err);
  }

  return isNowCompleted;
}

// ─── Claim Task Reward ─────────────────────────────────────────────

/**
 * Tamamlanmış bir görevin ödülünü alır.
 * Profilde money veya credits günceller, görevi claimed olarak işaretler.
 */
export async function claimTaskReward(
  profileId: string,
  taskId: string
): Promise<{ success: boolean; reward_type?: string; reward_amount?: number; error?: string }> {
  if (!isSupabaseConfigured() || !profileId) {
    return { success: false, error: 'Not configured' };
  }

  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Client error' };

  // Görevi bul
  const { data: task } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', profileId)
    .maybeSingle();

  if (!task) {
    return { success: false, error: 'Görev bulunamadı' };
  }

  if (!task.is_completed) {
    return { success: false, error: 'Görev henüz tamamlanmadı' };
  }

  if (task.is_claimed) {
    return { success: false, error: 'Ödül zaten alındı' };
  }

  // Profili güncelle
  const { data: profile } = await supabase
    .from('profiles')
    .select('money, credits')
    .eq('id', profileId)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: 'Profil bulunamadı' };
  }

  const updateData: Record<string, number> = {};
  if (task.reward_type === 'money') {
    updateData.money = (profile.money || 0) + task.reward_amount;
  } else if (task.reward_type === 'credit') {
    updateData.credits = (profile.credits || 0) + task.reward_amount;
  }

  try {
    // Ödülü ver
    await supabase.rpc('rpc_update_profile', { p_profile_id: profileId, p_updates: updateData });

    // Görevi claimed olarak işaretle
    await supabase.from('daily_tasks').update({ is_claimed: true }).eq('id', taskId);

    return {
      success: true,
      reward_type: task.reward_type,
      reward_amount: task.reward_amount,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error' };
  }
}

// ─── Load Today's Tasks ────────────────────────────────────────────

export interface DailyTaskWithProgress {
  id: string;
  user_id: string;
  task_type: string;
  description: string;
  reward_type: string;
  reward_amount: number;
  is_completed: boolean;
  is_claimed?: boolean;
  date: string;
  progress?: number;
  target_value?: number;
}

export async function loadTodayTasks(profileId: string): Promise<DailyTaskWithProgress[]> {
  if (!isSupabaseConfigured() || !profileId) return [];

  const supabase = getSupabase();
  if (!supabase) return [];

  const today = new Date().toISOString().split('T')[0];

  try {
    const { data } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', profileId)
      .eq('date', today)
      .order('task_type');

    return (data || []) as DailyTaskWithProgress[];
  } catch (err) {
    console.warn('[dailyTaskEngine] Load tasks error:', err);
    return [];
  }
}

// ─── Helper: Shuffle Array ─────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
