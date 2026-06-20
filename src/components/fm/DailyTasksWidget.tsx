'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { DAILY_TASK_DEFINITIONS, type DailyTaskType, claimTaskReward, type DailyTaskWithProgress } from '@/lib/fm/dailyTaskEngine';
import { CheckCircle, Gift, Coins, Star, Trophy, Swords, Dumbbell, Search, RefreshCw, Heart } from 'lucide-react';
import { toast } from 'sonner';

// ─── Task Icon Mapping ─────────────────────────────────────────────

function getTaskIcon(taskType: string) {
  const iconMap: Record<string, React.ReactNode> = {
    WIN_BIG: <Swords size={14} className="text-amber-400" />,
    LIST_PLAYERS: <Trophy size={14} className="text-blue-400" />,
    FULL_TRAINING: <Dumbbell size={14} className="text-emerald-400" />,
    PROMOTE_YOUTH: <Star size={14} className="text-purple-400" />,
    READ_ANALYSIS: <Search size={14} className="text-cyan-400" />,
    CHANGE_TACTICS: <RefreshCw size={14} className="text-orange-400" />,
    REST_INJURED: <Heart size={14} className="text-pink-400" />,
  };
  return iconMap[taskType] || <CheckCircle size={14} className="text-white/40" />;
}

// ─── Progress Bar ──────────────────────────────────────────────────

function TaskProgressBar({ progress, target, isCompleted }: { progress: number; target: number; isCompleted: boolean }) {
  const percent = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

  return (
    <div className="w-full h-1.5 rounded-full bg-white/5 mt-1.5 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${
          isCompleted ? 'bg-emerald-400' : 'bg-amber-500/70'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

// ─── Enhanced Widget ───────────────────────────────────────────────

interface DailyTasksWidgetProps {
  userId: string;
}

export default function DailyTasksWidget({ userId }: DailyTasksWidgetProps) {
  const [tasks, setTasks] = useState<DailyTaskWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .order('task_type');

      if (data) setTasks(data as DailyTaskWithProgress[]);
    } catch (err) {
      console.error('Daily tasks fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleClaim = async (taskId: string) => {
    setClaiming(taskId);
    try {
      const result = await claimTaskReward(userId, taskId);
      if (result.success) {
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? { ...t, is_claimed: true } : t))
        );
        const rewardText =
          result.reward_type === 'money'
            ? `${((result.reward_amount || 0) / 1000).toFixed(0)}K €`
            : `${result.reward_amount} Kredi`;
        toast.success(`Ödül alındı: ${rewardText}`);
      } else {
        toast.error(result.error || 'Ödül alınamadı');
      }
    } catch (err) {
      console.error('Claim task error:', err);
      toast.error('Bir hata oluştu');
    } finally {
      setClaiming(null);
    }
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const claimedCount = tasks.filter(t => t.is_claimed).length;
  const allDone = completedCount === tasks.length && tasks.length > 0;

  if (loading) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-4 h-4 bg-white/10 rounded" />
          <div className="h-3 bg-white/10 rounded w-24" />
        </div>
      </div>
    );
  }

  if (tasks.length === 0) return null;

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Trophy size={14} className="text-amber-400" />
          </div>
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/40">Günlük Görevler</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/25 tabular-nums">{completedCount}/{tasks.length}</span>
          {allDone && <span className="text-[10px]">🎉</span>}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Task List */}
      <div className="space-y-2">
        <AnimatePresence>
          {tasks.map((task, idx) => {
            const progress = task.progress || 0;
            const target = task.target_value || DAILY_TASK_DEFINITIONS[task.task_type as DailyTaskType]?.target_value || 1;
            const isCompleted = task.is_completed;
            const isClaimed = task.is_claimed;
            const def = DAILY_TASK_DEFINITIONS[task.task_type as DailyTaskType];

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-start gap-3 rounded-xl p-3 transition-all ${
                  isClaimed
                    ? 'bg-emerald-500/5 border border-emerald-500/15'
                    : isCompleted
                    ? 'bg-amber-500/5 border border-amber-500/15'
                    : 'bg-white/[0.02] border border-white/[0.04]'
                }`}
              >
                {/* Task Icon */}
                <div className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-lg ${
                  isClaimed
                    ? 'bg-emerald-500/10'
                    : isCompleted
                    ? 'bg-amber-500/10'
                    : 'bg-white/[0.04]'
                }`}>
                  {isClaimed ? (
                    <CheckCircle size={14} className="text-emerald-400" />
                  ) : (
                    getTaskIcon(task.task_type)
                  )}
                </div>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ${
                    isClaimed ? 'text-emerald-300 line-through' :
                    isCompleted ? 'text-amber-300' :
                    'text-white/70'
                  }`}>
                    {task.description || def?.description || task.task_type}
                  </div>

                  {/* Progress */}
                  {!isClaimed && (
                    <TaskProgressBar progress={progress} target={target} isCompleted={isCompleted} />
                  )}

                  {/* Reward & Progress text */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-white/20">
                      {isCompleted ? (
                        <span className="text-amber-400/60">Tamamlandı</span>
                      ) : (
                        <span>{progress}/{target}</span>
                      )}
                    </span>
                    <span className="text-[10px] text-white/15">•</span>
                    <span className="text-[10px] flex items-center gap-0.5">
                      {task.reward_type === 'money' ? (
                        <>
                          <Coins size={8} className="text-emerald-400/50" />
                          <span className="text-emerald-400/50">{((task.reward_amount || 0) / 1000).toFixed(0)}K €</span>
                        </>
                      ) : (
                        <>
                          <Star size={8} className="text-purple-400/50" />
                          <span className="text-purple-400/50">{task.reward_amount} Kredi</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Claim Button */}
                {isCompleted && !isClaimed && (
                  <motion.button
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    onClick={() => handleClaim(task.id)}
                    disabled={claiming === task.id}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 text-[10px] font-bold text-amber-300 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Gift size={10} />
                    {claiming === task.id ? '...' : 'Ödül Al'}
                  </motion.button>
                )}

                {/* Claimed indicator */}
                {isClaimed && (
                  <span className="shrink-0 text-[10px] text-emerald-400/40 font-bold">ALINDI</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* All done message */}
      {allDone && claimedCount === tasks.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-emerald-400/60 text-[10px] font-bold uppercase tracking-widest pt-1"
        >
          Tüm ödüller alındı! 🎉
        </motion.div>
      )}
    </div>
  );
}
