'use client';

import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface DissatisfiedPlayer {
  id: string;
  name: string;
  position: string;
  ovr: number;
  age: number;
  weeks_not_started: number;
  dissatisfaction_level: 'mild' | 'unhappy' | 'furious';
  manager_response: string | null;
}

interface DissatisfactionPanelProps {
  userId: string;
  onUpdate: () => void;
}

const LEVEL_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  mild: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: '😐', label: 'Hafif' },
  unhappy: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: '😤', label: 'Mutsuz' },
  furious: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: '🤬', label: 'Öfkeli' },
};

const RESPONSES = [
  { key: 'promise', label: '🤝 Söz ver', desc: '+5 moral, söz tutmazsan -10' },
  { key: 'sell', label: '💰 Satışa çıkar', desc: 'Transfer listesine eklenir' },
  { key: 'listen', label: '👂 Dinle', desc: '+2 moral, durum devam eder' },
  { key: 'ignore', label: '🚫 Yok say', desc: '-5 moral, hoşnutsuzluk artar' },
];

export default function DissatisfactionPanel({ userId, onUpdate }: DissatisfactionPanelProps) {
  const [players, setPlayers] = useState<DissatisfiedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchDissatisfied = async () => {
      try {
        const { data } = await supabase
          .from('players')
          .select('id, name, position, ovr, age, weeks_not_started, dissatisfaction_level, manager_response')
          .eq('profile_id', userId)
          .neq('dissatisfaction_level', 'none');

        if (data) setPlayers(data as DissatisfiedPlayer[]);
      } catch (err) {
        console.error('Dissatisfaction fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDissatisfied();
  }, [userId]);

  const handleResponse = async (playerId: string, response: string) => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setResponding(playerId);
    try {
      let moraleChange = 0;
      let newLevel = '';

      switch (response) {
        case 'promise':
          moraleChange = 5;
          newLevel = 'mild';
          break;
        case 'sell':
          await supabase.rpc('rpc_save_training_result', { p_profile_id: userId, p_player_id: playerId, p_updates: { is_for_sale: true } });
          moraleChange = -2;
          newLevel = 'mild';
          break;
        case 'listen':
          moraleChange = 2;
          break;
        case 'ignore':
          moraleChange = -5;
          const player = players.find(p => p.id === playerId);
          if (player?.dissatisfaction_level === 'mild') newLevel = 'unhappy';
          else if (player?.dissatisfaction_level === 'unhappy') newLevel = 'furious';
          break;
      }

      const updateData: any = { manager_response: response };
      if (newLevel) updateData.dissatisfaction_level = newLevel;

      await supabase.rpc('rpc_save_training_result', { p_profile_id: userId, p_player_id: playerId, p_updates: updateData });

      // Update morale
      const { data: p } = await supabase.from('players').select('morale').eq('id', playerId).maybeSingle();
      if (p) {
        await supabase.rpc('rpc_save_training_result', { p_profile_id: userId, p_player_id: playerId, p_updates: { morale: Math.max(0, Math.min(100, (p.morale || 50) + moraleChange)) } });
      }

      setPlayers(prev => prev.filter(p => p.id !== playerId));
      onUpdate();
    } catch (err) {
      console.error('Response error:', err);
    } finally {
      setResponding(null);
    }
  };

  if (loading) return null;
  if (players.length === 0) return null;

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-bold text-white mb-3">😤 Hoşnutsuz Oyuncular</h3>
      <div className="space-y-3">
        {players.map(player => {
          const config = LEVEL_CONFIG[player.dissatisfaction_level] || LEVEL_CONFIG.mild;
          return (
            <div key={player.id} className={`${config.bg} rounded-lg p-3 border`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{config.icon}</span>
                  <div>
                    <div className="text-xs text-white font-medium">{player.name}</div>
                    <div className="text-[10px] text-white/40">{player.position} • {player.weeks_not_started} hafta ilk 11'de değil</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.color} font-bold`}>{config.label}</span>
              </div>

              {!player.manager_response ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {RESPONSES.map(r => (
                    <button
                      key={r.key}
                      onClick={() => handleResponse(player.id, r.key)}
                      disabled={responding === player.id}
                      className="text-[10px] p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-50 text-left"
                    >
                      <div className="font-medium">{r.label}</div>
                      <div className="text-white/30 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-white/40 italic">
                  Yanıt: {RESPONSES.find(r => r.key === player.manager_response)?.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
