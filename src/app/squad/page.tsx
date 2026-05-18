'use client';

import React from 'react';
import { ArrowLeft, Users, GripVertical, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useFM } from '@/lib/fm/GameContext';
import SquadBoard from '@/components/fm/SquadBoard';
import type { Player } from '@/lib/fm/types';
import { useRouter } from 'next/navigation';

export default function SquadPage() {
  const { profile, squad, loading } = useFM();
  const router = useRouter();

  const handlePlayerClick = (player: Player) => {
    router.push(`/player/${player.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={18} className="text-white/40" />
            </a>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter text-white">
                Kadro Yönetimi
              </h1>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                Pozisyon Bazlı Gruplama &bull; Sürükle & Bırak &bull; Mevki Değişikliği
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
              <Users size={14} className="text-white/40" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                {squad.length} Oyuncu
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
              <GripVertical size={14} className="text-white/30" />
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                DnD Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Kadro yükleniyor...
              </p>
            </div>
          </div>
        ) : squad.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-6"
          >
            <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5">
              <Users size={32} className="text-white/10" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white/30">
                Kadro Boş
              </h3>
              <p className="text-[10px] font-bold text-white/15 uppercase tracking-widest mt-1">
                Henüz kadronuzda oyuncu bulunmuyor. Ana sayfadan takım kurun.
              </p>
            </div>
            <a
              href="/"
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white/50 uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Ana Sayfaya Dön
            </a>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Info banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                <GripVertical size={18} className="text-white/30" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white/60 leading-relaxed">
                  Oyuncuları <span className="text-white/90">sürükle & bırak</span> ile aynı grupta yeniden sıralayabilir veya farklı bir mevkii grubuna taşıyabilirsiniz.
                  Gruplar arası taşımda oyuncunun pozisyonu otomatik güncellenir. Oyuncu kartına tıklayarak detay sayfasına gidebilirsiniz.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(['GK', 'DEF', 'MID', 'FWD'] as const).map(g => (
                  <div key={g} className="flex items-center gap-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: { GK: '#7AB4E8', DEF: '#7EDBC8', MID: '#F0C87A', FWD: '#E87878' }[g] }}
                    />
                    <span className="text-[8px] font-bold text-white/30 uppercase">{g}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Squad board with DnD */}
            <SquadBoard onPlayerClick={handlePlayerClick} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
