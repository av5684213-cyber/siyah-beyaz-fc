import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface TierConfig {
  tier: number;
  min_ovr: number;
  max_ovr: number;
  label: string;
}

const DEFAULT_TIERS: TierConfig[] = [
  { tier: 4, min_ovr: 55, max_ovr: 65, label: '4. Lig' },
  { tier: 3, min_ovr: 62, max_ovr: 72, label: '3. Lig' },
  { tier: 2, min_ovr: 68, max_ovr: 78, label: '2. Lig' },
  { tier: 1, min_ovr: 75, max_ovr: 85, label: '1. Lig' },
];

export async function getTierConfig(tier: number): Promise<TierConfig> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_TIERS.find(t => t.tier === tier) || DEFAULT_TIERS[0];
  }
  
  const supabase = getSupabase();
  if (!supabase) return DEFAULT_TIERS.find(t => t.tier === tier) || DEFAULT_TIERS[0];

  try {
    const { data } = await supabase
      .from('league_tier_config')
      .select('*')
      .eq('tier', tier)
      .maybeSingle();

    if (data) return data as TierConfig;
  } catch (e) { console.warn("[silent-catch]", e); }

  return DEFAULT_TIERS.find(t => t.tier === tier) || DEFAULT_TIERS[0];
}

export function getOvrRangeForTier(tier: number): [number, number] {
  const config = DEFAULT_TIERS.find(t => t.tier === tier);
  return config ? [config.min_ovr, config.max_ovr] : [55, 65];
}
