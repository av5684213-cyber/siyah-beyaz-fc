import { TRAITS_DATA, PLAY_STYLES, TraitLevel, PERSONALITY_TRAITS } from './traitsData';

// Dynamic mapping for backward compatibility
export const traitDescriptions: Record<string, { name: string; short: string; type: 'pozitif' | 'negatif'; counterFor?: string; engineEffect?: { successRate: number; engineWeight: number } }> = {};

// Populate traitDescriptions from TRAITS_DATA
Object.values(TRAITS_DATA).forEach(posData => {
  if (posData?.pozitif) {
    posData.pozitif.forEach(t => {
      traitDescriptions[t.name] = { 
        name: t.name, 
        short: t.description, 
        type: 'pozitif',
        counterFor: t.counterFor,
        engineEffect: t.engineEffect
      };
    });
  }
  if (posData?.negatif) {
    posData.negatif.forEach(t => {
      traitDescriptions[t.name] = { 
        name: t.name, 
        short: (t as any).description || (t as any).penalty || 'Negatif özellik.', 
        type: 'negatif',
        counterFor: (t as any).counterFor,
        engineEffect: (t as any).engineEffect
      };
    });
  }
});

// Populate traitDescriptions from PERSONALITY_TRAITS
Object.entries(PERSONALITY_TRAITS).forEach(([cat, data]) => {
  if (cat === 'nadir') {
    (data as any[]).forEach(t => {
      traitDescriptions[t.name] = { name: t.name, short: t.description, type: 'pozitif' };
    });
  } else {
    const constTypedData = data as any;
    if (constTypedData?.pozitif) {
      constTypedData.pozitif.forEach((t: any) => {
        traitDescriptions[t.name] = { name: t.name, short: t.description, type: 'pozitif' };
      });
    }
    if (constTypedData?.negatif) {
      constTypedData.negatif.forEach((t: any) => {
        traitDescriptions[t.name] = { name: t.name, short: t.description, type: 'negatif' };
      });
    }
  }
});

export const getTraitInfo = (traitName: string) => {
  return traitDescriptions[traitName] || null;
};

export const getTraitTierLabel = (traitName: string) => {
  // Logic to determine tier based on name or presence in playstyles
  // For now returning a default that components expect
  return { label: 'Pro', color: 'text-emerald-400' };
};

export const getPlayStyleInfo = (styleName: string) => {
  for (const pos of Object.values(PLAY_STYLES)) {
    const found = pos.find(s => s.name === styleName);
    if (found) return found;
  }
  return null;
};

export const getTraitColor = (level?: TraitLevel | string) => {
  switch (level) {
    case 'MOR': return 'from-purple-600 to-purple-400 border-purple-500/50 text-purple-100 shadow-purple-500/20';
    case 'ALTIN': return 'from-amber-500 to-yellow-300 border-amber-400/50 text-amber-950 shadow-amber-500/20';
    case 'LACIVERT': return 'from-blue-900 to-blue-700 border-blue-600/50 text-blue-50 shadow-blue-900/20';
    case 'BEYAZ': return 'from-zinc-200 to-white border-zinc-300/50 text-zinc-900 shadow-white/10';
    default: return 'from-zinc-800 to-zinc-700 border-white/5 text-white/40 shadow-none';
  }
};

export const getTraitBgColor = (level?: TraitLevel | string) => {
  switch (level) {
    case 'MOR': return 'bg-purple-500';
    case 'ALTIN': return 'bg-amber-500';
    case 'LACIVERT': return 'bg-blue-800';
    case 'BEYAZ': return 'bg-white';
    default: return 'bg-zinc-700';
  }
};
