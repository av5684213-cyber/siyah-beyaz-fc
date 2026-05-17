'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Archive,
  Zap,
  Dumbbell,
  Heart,
  Shield,
  Star,
  Palette,
  Home,
  Sparkles,
  Coffee,
  Search,
  Smile,
  Wind,
  Flame,
  ChevronRight,
  Package,
  X,
} from 'lucide-react';
import { useFM } from '@/lib/fm/GameContext';

type ItemCategory = 'boost' | 'cosmetic' | 'consumable';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  icon: React.ReactNode;
  quantity: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: string;
}

const RARITY_STYLES: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  common: { text: 'text-white/50', bg: 'bg-white/5', border: 'border-white/10', glow: '' },
  rare: { text: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/20', glow: 'shadow-[0_0_10px_rgba(59,130,246,0.1)]' },
  epic: { text: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/20', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]' },
  legendary: { text: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' },
};

function getDefaultInventory(profile: any): InventoryItem[] {
  const creditsBalance = profile?.credits || 0;
  const academyLevel = profile?.academy_level || 1;
  const philosophy = profile?.philosophy || 'balanced';

  return [
    // Boost Items
    {
      id: 'speed_boost',
      name: 'Hız İksiri',
      description: 'Tüm kadronun hızını bir maçlığına +5 artırır.',
      category: 'boost',
      icon: <Wind size={18} />,
      quantity: philosophy === 'squad' ? 3 : 2,
      rarity: 'rare',
      effect: 'Hız +5 (1 maç)',
    },
    {
      id: 'training_boost',
      name: 'Antrenman Takviyesi',
      description: 'Sonraki antrenman seansının verimini 2x artırır.',
      category: 'boost',
      icon: <Dumbbell size={18} />,
      quantity: 3,
      rarity: 'common',
      effect: 'Antrenman 2x',
    },
    {
      id: 'fitness_boost',
      name: 'Fitness Paketi',
      description: 'Tüm oyuncuların kondisyonunu %15 artırır.',
      category: 'boost',
      icon: <Heart size={18} />,
      quantity: 2,
      rarity: 'epic',
      effect: 'Kondisyon +15',
    },
    {
      id: 'shield_boost',
      name: 'Savunma Kalkanı',
      description: 'Bir maçlığına savunma gücünü +8 artırır.',
      category: 'boost',
      icon: <Shield size={18} />,
      quantity: 1,
      rarity: 'rare',
      effect: 'Savunma +8 (1 maç)',
    },
    {
      id: 'power_boost',
      name: 'Güç İksiri',
      description: 'Tüm oyuncuların güç özelliğini +3 artırır (3 maç).',
      category: 'boost',
      icon: <Flame size={18} />,
      quantity: creditsBalance >= 200 ? 1 : 0,
      rarity: 'legendary',
      effect: 'Güç +3 (3 maç)',
    },

    // Cosmetic Items
    {
      id: 'badge_gold',
      name: 'Altın Rozet',
      description: 'Takım rozetinin altın versiyonu. Prestij +5.',
      category: 'cosmetic',
      icon: <Star size={18} />,
      quantity: 1,
      rarity: 'epic',
      effect: 'Prestij +5',
    },
    {
      id: 'stadium_theme_neon',
      name: 'Neon Stadyum Teması',
      description: 'Stadyumun gece aydınlatmasını neon efektli yapar.',
      category: 'cosmetic',
      icon: <Palette size={18} />,
      quantity: 1,
      rarity: 'rare',
      effect: 'Kozmetik',
    },
    {
      id: 'stadium_annex',
      name: 'VIP Loca',
      description: 'Stadyuma VIP loca ekler. Maç günü geliri +%10.',
      category: 'cosmetic',
      icon: <Home size={18} />,
      quantity: 0,
      rarity: 'epic',
      effect: 'Gelir +10%',
    },
    {
      id: 'legendary_aura',
      name: 'Efsanevi Aura',
      description: 'Takımın efsanevi bir parıltıyla sahaya çıkmasını sağlar. Moral +3.',
      category: 'cosmetic',
      icon: <Sparkles size={18} />,
      quantity: philosophy === 'legend' ? 1 : 0,
      rarity: 'legendary',
      effect: 'Moral +3',
    },

    // Consumables
    {
      id: 'morale_potion',
      name: 'Motivasyon İksiri',
      description: 'Tüm oyuncuların moralini +10 artırır. Tek kullanımlık.',
      category: 'consumable',
      icon: <Smile size={18} />,
      quantity: 4,
      rarity: 'common',
      effect: 'Moral +10',
    },
    {
      id: 'scout_refresh',
      name: 'Keşif Tazeleme',
      description: 'Tüm izcilere yeni oyuncu havuzu sunar.',
      category: 'consumable',
      icon: <Search size={18} />,
      quantity: 2,
      rarity: 'rare',
      effect: 'İzci Havuzu Sıfırla',
    },
    {
      id: 'energy_drink',
      name: 'Enerji İçeceği',
      description: 'Bir oyuncunun kondisyonunu %100 yapar. Tek kullanımlık.',
      category: 'consumable',
      icon: <Coffee size={18} />,
      quantity: 5,
      rarity: 'common',
      effect: 'Kondisyon %100',
    },
    {
      id: 'star_dust',
      name: 'Yıldız Tozu',
      description: 'Rastgele bir oyuncunun potansiyelini +2 artırır.',
      category: 'consumable',
      icon: <Zap size={18} />,
      quantity: academyLevel >= 3 ? 2 : 0,
      rarity: 'epic',
      effect: 'Potansiyel +2',
    },
  ];
}

export default function InventoryTab({ userId, onMarketRedirect }: { userId?: string; onMarketRedirect: () => void }) {
  const { profile, squad, setSquad, setProfile } = useFM();
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');
  const [usedItem, setUsedItem] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const items = React.useMemo(() => getDefaultInventory(profile), [profile]);

  const filteredItems = React.useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter(item => item.category === activeCategory);
  }, [items, activeCategory]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const usedItemsCount = items.filter(item => item.quantity > 0).length;

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    // Sayfa arka plandayken bildirim gösterme
    if (typeof document !== 'undefined' && document.hidden) {
      return;
    }
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleUseItem = useCallback((item: InventoryItem) => {
    if (item.quantity <= 0) {
      showToast('Bu eşyadan kalmadı!', 'error');
      return;
    }

    setUsedItem(item.id);

    switch (item.id) {
      case 'morale_potion':
        if (squad.length > 0) {
          setSquad(prev => prev.map(p => ({ ...p, morale: Math.min(100, (p.morale || 50) + 10) })));
          showToast('Tüm oyunculara Moral +10 uygulandı!');
        }
        break;

      case 'energy_drink':
        if (squad.length > 0) {
          setSquad(prev => prev.map(p => ({ ...p, cond: Math.min(100, (p.cond || 70) + 15) })));
          showToast('Tüm oyunculara Kondisyon +15 uygulandı!');
        }
        break;

      case 'fitness_boost':
        if (squad.length > 0) {
          setSquad(prev => prev.map(p => ({ ...p, cond: Math.min(100, (p.cond || 70) + 15) })));
          showToast('Fitness Paketi kullanıldı! Kondisyon +15');
        }
        break;

      case 'training_boost':
        showToast('Antrenman Takviyesi aktif! Bir sonraki antrenman 2x verimli.');
        break;

      case 'speed_boost':
        showToast('Hız İksiri aktif! Bir sonraki maçta Hız +5');
        break;

      case 'shield_boost':
        showToast('Savunma Kalkanı aktif! Bir sonraki maçta Savunma +8');
        break;

      case 'power_boost':
        showToast('Güç İksiri aktif! 3 maç boyunca Güç +3');
        break;

      case 'badge_gold':
        if (profile) {
          setProfile((prev: any) => ({ ...prev, reputation: Math.min(100, (prev.reputation || 30) + 5) }));
          showToast('Altın Rozet takıldı! Prestij +5');
        }
        break;

      case 'legendary_aura':
        if (squad.length > 0) {
          setSquad(prev => prev.map(p => ({ ...p, morale: Math.min(100, (p.morale || 50) + 3) })));
          showToast('Efsanevi Aura aktif! Moral +3');
        }
        break;

      case 'scout_refresh':
        showToast('Keşif havuzu tazelendi!');
        break;

      case 'star_dust':
        if (squad.length > 0) {
          const randomIdx = Math.floor(Math.random() * squad.length);
          setSquad(prev => prev.map((p, i) => i === randomIdx ? { ...p, potential: Math.min(99, (p.potential || 70) + 2) } : p));
          showToast(`Yıldız Tozu kullanıldı! ${squad[randomIdx]?.name || 'Oyuncu'} Potansiyel +2`);
        }
        break;

      default:
        showToast(`${item.name} kullanıldı!`);
    }

    setTimeout(() => setUsedItem(null), 600);
  }, [squad, profile, setSquad, setProfile, showToast]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30">
        <Archive size={32} className="mr-3 opacity-30" />
        <span className="text-sm font-bold uppercase tracking-widest">Takım kurulmadı</span>
      </div>
    );
  }

  const categoryTabs: { id: ItemCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tümü', icon: <Package size={12} /> },
    { id: 'boost', label: 'Güçlendirici', icon: <Zap size={12} /> },
    { id: 'cosmetic', label: 'Kozmetik', icon: <Palette size={12} /> },
    { id: 'consumable', label: 'Tüketilir', icon: <Coffee size={12} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <Sparkles size={12} /> : <X size={12} />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 border-b border-white/10 pb-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Archive className="text-amber-500" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
            Envanter
          </h2>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em]">
            {totalItems} eşya • {usedItemsCount} tür aktif
          </p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[9px] text-white/20 font-black uppercase mb-1">💰 Kredi</div>
          <div className="text-lg font-mono font-bold text-amber-400">{profile.credits || 0}</div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all shrink-0 ${
              activeCategory === tab.id
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/[0.02] border-white/5 text-white/30 hover:bg-white/5 hover:text-white/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}

        <div className="ml-auto">
          <button
            onClick={onMarketRedirect}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 transition-all"
          >
            <ChevronRight size={10} />
            Market
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map((item, i) => {
          const rarity = RARITY_STYLES[item.rarity];
          const isUsed = usedItem === item.id;
          const hasQuantity = item.quantity > 0;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
              className={`bg-zinc-950 border rounded-2xl p-4 transition-all group ${rarity.border} ${rarity.glow} ${
                !hasQuantity ? 'opacity-40' : 'hover:border-white/20'
              }`}
            >
              {/* Rarity Badge & Quantity */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border ${rarity.text} ${rarity.bg} ${rarity.border}`}>
                  {item.rarity === 'common' ? 'SIRADAN' : item.rarity === 'rare' ? 'NADİR' : item.rarity === 'epic' ? 'EPİK' : 'EFSANEVİ'}
                </span>
                <span className={`text-[9px] font-mono font-bold ${hasQuantity ? 'text-white/60' : 'text-white/15'}`}>
                  x{item.quantity}
                </span>
              </div>

              {/* Icon & Info */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2.5 rounded-xl border ${rarity.bg} ${rarity.border} ${rarity.text}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-white/90 uppercase tracking-tight mb-0.5">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-white/30 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Effect */}
              <div className="flex items-center gap-1.5 mb-3">
                <Zap size={8} className={rarity.text} />
                <span className="text-[9px] font-bold text-white/40">{item.effect}</span>
              </div>

              {/* Use Button */}
              <button
                onClick={() => handleUseItem(item)}
                disabled={!hasQuantity || isUsed}
                className={`w-full py-2 text-[9px] font-black uppercase tracking-widest border rounded-xl transition-all ${
                  isUsed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 scale-95'
                    : hasQuantity
                      ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white active:scale-95'
                      : 'bg-white/[0.02] border-white/5 text-white/15 cursor-not-allowed'
                }`}
              >
                {isUsed ? 'KULLANILDI!' : hasQuantity ? 'KULLAN' : 'TÜKENDİ'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Archive size={40} className="mx-auto mb-3 text-white/10" />
          <p className="text-xs text-white/20 font-bold uppercase">Bu kategoride eşya yok</p>
        </div>
      )}
    </motion.div>
  );
}
