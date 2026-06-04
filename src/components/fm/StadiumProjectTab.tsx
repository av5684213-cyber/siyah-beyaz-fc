'use client';

import { useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface StadiumProject {
  id: string;
  name: string;
  current_phase: number;
  target_capacity: number;
  cost_per_phase: number;
  is_completed: boolean;
  started_at: string | null;
}

interface StadiumProjectTabProps {
  userId: string;
  money: number;
  currentCapacity: number;
  onMoneySpent: (spent: number) => void;
}

const PHASE_LABELS = ['Planlama', 'Temel', 'İnşaat 1', 'İnşaat 2', 'Açılış'];
const PHASE_COSTS = [2000000, 5000000, 8000000, 12000000, 3000000]; // Total: 30M

export default function StadiumProjectTab({ userId, money, currentCapacity, onMoneySpent }: StadiumProjectTabProps) {
  const [project, setProject] = useState<StadiumProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('Yeni Stadyum');
  const [starting, setStarting] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchProject = async () => {
      try {
        const { data } = await supabase
          .from('stadium_projects')
          .select('*')
          .eq('profile_id', userId)
          .maybeSingle();

        if (data) setProject(data);
      } catch (err) {
        console.error('Stadium project fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [userId]);

  const handleStartProject = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setStarting(true);
    try {
      const { data } = await supabase
        .from('stadium_projects')
        .insert({
          profile_id: userId,
          name: newName,
          current_phase: 0,
          target_capacity: currentCapacity * 3,
          cost_per_phase: PHASE_COSTS[0],
          started_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (data) {
        setProject(data);
      }
    } catch (err) {
      console.error('Start project error:', err);
    } finally {
      setStarting(false);
    }
  };

  const handleAdvancePhase = async () => {
    if (!project || !isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const nextPhase = project.current_phase + 1;
    const cost = PHASE_COSTS[nextPhase] || PHASE_COSTS[PHASE_COSTS.length - 1];

    if (money < cost) return;

    setAdvancing(true);
    try {
      const isComplete = nextPhase >= 5;

      const { error } = await supabase
        .from('stadium_projects')
        .update({
          current_phase: nextPhase,
          cost_per_phase: nextPhase < 5 ? PHASE_COSTS[nextPhase] : 0,
          is_completed: isComplete,
        })
        .eq('id', project.id);

      if (!error) {
        onMoneySpent(cost);
        setProject(prev => prev ? { ...prev, current_phase: nextPhase, is_completed: isComplete } : null);
      }
    } catch (err) {
      console.error('Advance phase error:', err);
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) return <div className="text-white/30 text-sm animate-pulse text-center py-8">Yükleniyor...</div>;

  // No project yet
  if (!project) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">🏗️ Yeni Stadyum Projesi</h2>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-white/60 mb-4">
            Mevcut stadyum kapasitesi: <span className="text-white font-bold">{currentCapacity?.toLocaleString()}</span>
            <br />Yeni stadyum inşa ederek kapasiteyi 3 katına çıkarabilirsiniz.
          </p>

          <div className="space-y-3 mb-4">
            {PHASE_LABELS.map((label, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-white/5 rounded-lg p-2">
                <span className="text-white/60">Aşama {i + 1}: {label}</span>
                <span className="text-amber-400">{(PHASE_COSTS[i] / 1000000).toFixed(0)}M €</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
              <span className="text-amber-300 font-bold">Toplam Maliyet</span>
              <span className="text-amber-300 font-bold">{(PHASE_COSTS.reduce((a, b) => a + b, 0) / 1000000).toFixed(0)}M €</span>
            </div>
          </div>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Stadyum adı"
            className="w-full text-sm p-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 mb-3"
          />

          <button
            onClick={handleStartProject}
            disabled={starting}
            className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm disabled:opacity-50"
          >
            {starting ? 'Başlatılıyor...' : 'Projeyi Başlat'}
          </button>
        </div>
      </div>
    );
  }

  // Active project
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">🏗️ {project.name}</h2>
        <span className="text-xs text-white/40">Hedef: {project.target_capacity?.toLocaleString()} kapasite</span>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white/50">İlerleme</span>
            <span className="text-white/70">{project.current_phase}/5 aşama</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${project.is_completed ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${(project.current_phase / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Phase details */}
        <div className="space-y-2 mb-4">
          {PHASE_LABELS.map((label, i) => {
            const isComplete = i < project.current_phase;
            const isCurrent = i === project.current_phase;
            return (
              <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                isComplete ? 'bg-green-500/10 text-green-300' : isCurrent ? 'bg-amber-500/10 text-amber-300' : 'bg-white/[0.02] text-white/30'
              }`}>
                <span>{isComplete ? '✅' : isCurrent ? '🔨' : '⬜'}</span>
                <span className="flex-1">Aşama {i + 1}: {label}</span>
                <span className="text-[10px]">{(PHASE_COSTS[i] / 1000000).toFixed(0)}M €</span>
              </div>
            );
          })}
        </div>

        {!project.is_completed && project.current_phase < 5 && (
          <button
            onClick={handleAdvancePhase}
            disabled={advancing || money < PHASE_COSTS[project.current_phase]}
            className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm disabled:opacity-50"
          >
            {advancing ? 'İşleniyor...' : `Sonraki Aşama (${(PHASE_COSTS[project.current_phase] / 1000000).toFixed(0)}M €)`}
          </button>
        )}

        {project.is_completed && (
          <div className="text-center py-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-green-400 font-bold text-sm">🎉 Stadyum Tamamlandı!</div>
            <div className="text-xs text-white/50 mt-1">Yeni kapasite: {project.target_capacity?.toLocaleString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}
