'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { toTitleCase, localizePosFull, formatPosBadge, getPosBadgeStyle, fmStatColor } from '@/lib/fm/ui-helpers';
import Link from 'next/link';

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = params?.id as string;
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;
    fetchPlayer();
  }, [playerId]);

  const fetchPlayer = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .maybeSingle();

      if (error) console.error('Player fetch error:', error.message);
      else setPlayer(data);
    } catch (err) {
      console.error('Player fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-sm font-bold">Oyuncu bulunamadı.</p>
      </div>
    );
  }

  const posBadge = formatPosBadge({
    specificPosition: player.specific_position,
    position: player.position,
    secondaryPositions: player.secondary_positions || [],
  });
  const posStyle = getPosBadgeStyle(player.specific_position || player.position);
  const fmtVal = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toString();
  };

  const statRows = [
    { label: 'Kalite (Klt)', value: player.klt || player.potential || 0 },
    { label: 'Ortalama', value: player.rating || 0 },
    { label: 'Kalecilik', value: player.goalkeeping || 0 },
    { label: 'Kontrol', value: player.control || 0 },
    { label: 'Pas', value: player.pas || player.passing || 0 },
    { label: 'Şut', value: player.sut || player.shooting || 0 },
    { label: 'Kafa', value: player.kfa || player.heading || 0 },
    { label: 'Hız', value: player.hiz || player.speed || 0 },
    { label: 'Güç', value: player.guc || player.power || 0 },
    { label: 'Algı', value: player.alg || player.vision || 0 },
    { label: 'Savunma', value: player.tk || player.defending || 0 },
    { label: 'Top Hakimiyeti', value: player.top || 0 },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft size={16} /> Geri
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8">
          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-lg font-black border-2 ${posStyle}`}>
              {posBadge}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black italic tracking-tighter">{toTitleCase(player.name)}</h1>
              <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-bold text-white/40">
                <span className={`px-2 py-1 rounded-lg border ${posStyle}`}>
                  {localizePosFull(player.specific_position || player.position)}
                </span>
                {player.secondary_positions && player.secondary_positions.length > 0 && (
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                    İkinci: {player.secondary_positions.map((p: string) => localizePosFull(p)).join(', ')}
                  </span>
                )}
                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">{player.age} YAŞ</span>
                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">{player.nation || 'TR'}</span>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400">{player.klt || player.potential || 0}</div>
                  <div className="text-[8px] text-white/20 font-bold uppercase">Kalite</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white/60">{player.rating || 0}</div>
                  <div className="text-[8px] text-white/20 font-bold uppercase">Ortalama</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">{fmtVal(player.market_value || 0)}</div>
                  <div className="text-[8px] text-white/20 font-bold uppercase">Değer</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">İstatistikler</h2>
          <div className="grid grid-cols-2 gap-3">
            {statRows.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-bold text-white/40">{stat.label}</span>
                <span className={`text-sm font-black font-mono ${fmStatColor(stat.value)}`}>{Math.round(stat.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
