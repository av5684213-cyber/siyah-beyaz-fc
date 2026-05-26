'use client';
import React, { useEffect, useState } from 'react';
import { Player } from '@/lib/fm/types';
import { fetchPlayerCareerStats, CareerStat } from '@/lib/fm/careerStats';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Star, Target, ShieldAlert, Zap, TrendingUp } from 'lucide-react';

const goalTypeLabels: Record<string, string> = {
  plase: 'Plase Golü',
  header: 'Kafa Golü',
  head_right: 'Sağ Orta Kafa',
  head_left: 'Sol Orta Kafa',
  one_touch: 'Tek Vuruş',
  postup_turn: 'Top Saklayıp Dönüş',
  sprint_finish: 'Sprint Sonrası',
  long_shot: 'Uzaktan Şut',
  penalty: 'Penaltı',
  freekick: 'Frikik'
};

const saveTypeLabels: Record<string, string> = {
  long_shot: 'Uzaktan Şut Kurtarışı',
  freekick: 'Frikik Kurtarışı',
  one_on_one: 'Bire Bir Kurtarış',
  shot_stopping: 'Refleks Kurtarışı',
  penalty: 'Penaltı Kurtarışı'
};

export default function PlayerStatsTab({ player }: { player: Player }) {
  const [stats, setStats] = useState<CareerStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!player?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchPlayerCareerStats(player.id);
        setStats(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load career stats:', err);
        setStats([]);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [player?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full"
        />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Kariyer Datası Okunuyor...</span>
      </div>
    );
  }

  const isGK = player.position === 'GK';
  const showTechBox = (isGK && player.saveStats && Object.keys(player.saveStats).length > 0) || 
                      (!isGK && player.goalStats && Object.keys(player.goalStats).length > 0);

  return (
    <div className="p-4 space-y-6">
      {/* Summary Header */}
      <div className="grid grid-cols-5 gap-px bg-white/5 border border-white/10 rounded-sm overflow-hidden">
        <div className="p-3 bg-[#0a0f15] text-center">
            <div className="text-[14px] font-black text-white">{stats.reduce((acc, s) => acc + (Number(s.matches_played) || 0), 0)}</div>
            <div className="text-[7px] font-bold uppercase tracking-widest text-white/20">Maç</div>
        </div>
        <div className="p-3 bg-[#0a0f15] text-center">
            <div className={`text-[14px] font-black ${player.position !== 'GK' ? 'text-white' : 'text-white/40'}`}>{stats.reduce((acc, s) => acc + (Number(s.goals) || 0), 0)}</div>
            <div className="text-[7px] font-bold uppercase tracking-widest text-white/20">Gol</div>
        </div>
        <div className="p-3 bg-[#0a0f15] text-center">
            <div className="text-[14px] font-black text-white">{stats.reduce((acc, s) => acc + (Number(s.assists) || 0), 0)}</div>
            <div className="text-[7px] font-bold uppercase tracking-widest text-white/20">Asist</div>
        </div>
        <div className="p-3 bg-[#0a0f15] text-center">
            <div className="text-[14px] font-black text-white">{stats.reduce((acc, s) => acc + (Number(s.yellow_cards) || 0), 0)}</div>
            <div className="text-[7px] font-bold uppercase tracking-widest text-white/20">Sarı</div>
        </div>
        <div className="p-3 bg-[#0a0f15] text-center">
            <div className="text-[14px] font-black text-amber-400">
               {(stats.reduce((acc, s) => acc + (Number(s.avg_rating) || 0), 0) / (stats.length || 1)).toFixed(2)}
            </div>
            <div className="text-[7px] font-bold uppercase tracking-widest text-white/20">Ort. Puan</div>
        </div>
      </div>

      {/* NEW: TECHNICAL ANALYSIS BOX */}
      {showTechBox && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Target size={11} className="text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400/60">Teknik Analiz (Detaylı Veri)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {isGK ? (
              Object.entries(player.saveStats || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-sm">
                  <span className="text-[9px] font-bold text-white/30 truncate">{saveTypeLabels[type] || type}</span>
                  <span className="text-[12px] font-black text-blue-400">{count}</span>
                </div>
              ))
            ) : (
              Object.entries(player.goalStats || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-sm">
                  <span className="text-[9px] font-bold text-white/30 truncate">{goalTypeLabels[type] || type}</span>
                  <span className="text-[12px] font-black text-emerald-400">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2">
          <BarChart3 size={11} className="text-white/30" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Sezonlara Göre Kariyer Geçmişi</span>
        </div>

        {stats.length > 0 ? (
          <div className="border border-white/5 rounded-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-3 py-2 text-[8px] font-black uppercase text-white/30">Sezon</th>
                  <th className="px-3 py-2 text-[8px] font-black uppercase text-white/30">Takım</th>
                  <th className="px-3 py-2 text-[8px] font-black uppercase text-white/30 text-center">Oyn</th>
                  <th className="px-3 py-2 text-[8px] font-black uppercase text-white/30 text-center">Gol</th>
                  <th className="px-3 py-2 text-[8px] font-black uppercase text-white/30 text-center">Ast</th>
                  <th className="px-3 py-2 text-[8px] font-black uppercase text-white/30 text-center">Faul</th>
                  <th className="px-3 py-2 text-[8px] font-black uppercase text-white/30 text-center">Sarı</th>
                  <th className="px-3 py-2 text-[8px] font-black uppercase text-white/30 text-center">Kır</th>
                  <th className="px-3 py-2 text-[8px] font-black uppercase text-white/30 text-right">Ort</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {stats.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-2 text-[10px] font-mono text-white/50">{row.season_id.replace('season-', 'S ')}</td>
                    <td className="px-3 py-2 text-[10px] font-bold text-white/80">{row.team_name || 'Mevcut Takım'}</td>
                    <td className="px-3 py-2 text-[10px] font-mono font-bold text-center text-white/70">{row.matches_played}</td>
                    <td className="px-3 py-2 text-[10px] font-mono font-black text-center text-emerald-400">{row.goals}</td>
                    <td className="px-3 py-2 text-[10px] font-mono font-bold text-center text-amber-400/80">{row.assists}</td>
                    <td className="px-3 py-2 text-[10px] font-mono font-bold text-center text-white/40">{row.fouls || 0}</td>
                    <td className="px-3 py-2 text-[10px] font-mono font-bold text-center text-yellow-500/60">{row.yellow_cards}</td>
                    <td className="px-3 py-2 text-[10px] font-mono font-bold text-center text-red-500/60">{row.red_cards}</td>
                    <td className="px-3 py-2 text-[10px] font-mono font-black text-right text-amber-500">
                      {row.avg_rating.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 bg-white/[0.01] rounded-sm">
             <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity }}>
               <Zap size={24} className="text-white/10" />
             </motion.div>
             <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/10 italic">Henüz bir kariyere sahip değil.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-sm">
        <div className="flex items-center gap-2 mb-2">
           <Star size={12} className="text-amber-400" />
           <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Veri Analiz Notu</span>
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed italic">
          Oyuncunun performans verileri her maç sonu otomatik olarak güncellenir. Sezon geçişlerinde kariyer tablosuna yeni bir satır eklenir ve oyuncunun tarihçesi kalıcı olarak saklanır.
        </p>
      </div>
    </div>
  );
}
