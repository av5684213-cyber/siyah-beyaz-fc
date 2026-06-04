'use client';

import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Switch } from '@/components/ui/switch';
import { Trophy, DollarSign, ClipboardList, BarChart3, Heart, GraduationCap, Clock, MonitorSmartphone, Dumbbell } from 'lucide-react';

interface NotificationCategorySettingsProps {
  userId: string;
}

interface CategorySetting {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  group: 'match' | 'transfer' | 'report' | 'system';
}

const DEFAULT_CATEGORIES: CategorySetting[] = [
  // Match group
  { key: 'goal_alert', label: 'Gol Bildirimi', description: 'Maç sırasında atılan goller', icon: <Trophy size={14} />, enabled: true, group: 'match' },
  { key: 'match_result', label: 'Maç Sonucu', description: 'Maç bittiğinde sonuç bildirimi', icon: <Trophy size={14} />, enabled: true, group: 'match' },
  { key: 'match_reminder', label: 'Maç Hatırlatma', description: 'Maç başlamadan önce hatırlatma', icon: <Clock size={14} />, enabled: true, group: 'match' },
  // Transfer group
  { key: 'transfer_offer', label: 'Transfer Teklifi', description: 'Gelen transfer teklifleri', icon: <DollarSign size={14} />, enabled: true, group: 'transfer' },
  // Report group
  { key: 'daily_task_reminder', label: 'Günlük Görev', description: 'Günlük görev hatırlatmaları', icon: <ClipboardList size={14} />, enabled: true, group: 'report' },
  { key: 'weekly_report', label: 'Haftalık Rapor', description: 'Haftalık özet rapor bildirimi', icon: <BarChart3 size={14} />, enabled: true, group: 'report' },
  { key: 'training_report', label: 'Antrenman Raporu', description: 'Antrenman sonuç bildirimi', icon: <Dumbbell size={14} />, enabled: false, group: 'report' },
  // System group
  { key: 'injury_update', label: 'Sakatlık Güncellemesi', description: 'Oyuncu sakatlık ve iyileşme bildirimleri', icon: <Heart size={14} />, enabled: true, group: 'system' },
  { key: 'youth_academy', label: 'Gençlik Akademisi', description: 'Altyapı oyuncu katılımı ve mezuniyet', icon: <GraduationCap size={14} />, enabled: true, group: 'system' },
  { key: 'push_enabled', label: 'Push Bildirimleri', description: 'Tarayıcı push bildirimleri', icon: <MonitorSmartphone size={14} />, enabled: true, group: 'system' },
];

const GROUP_LABELS: Record<string, string> = {
  match: '⚽ Maç Bildirimleri',
  transfer: '💰 Transfer Bildirimleri',
  report: '📊 Rapor Bildirimleri',
  system: '🔔 Sistem Bildirimleri',
};

export default function NotificationCategorySettings({ userId }: NotificationCategorySettingsProps) {
  const [categories, setCategories] = useState<CategorySetting[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('profile_id', userId)
          .maybeSingle();

        if (data) {
          setCategories(prev => prev.map(cat => ({
            ...cat,
            enabled: data[cat.key] !== undefined ? data[cat.key] : cat.enabled,
          })));
        }
      } catch (err) {
        console.error('Notification settings fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  const handleToggle = async (key: string, enabled: boolean) => {
    setCategories(prev => prev.map(c => c.key === key ? { ...c, enabled } : c));

    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setSaving(true);
    try {
      const updateData: Record<string, unknown> = { [key]: enabled, profile_id: userId };
      await supabase
        .from('notification_preferences')
        .upsert(updateData, { onConflict: 'profile_id' });
    } catch (err) {
      console.error('Notification settings update error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white/30 text-xs animate-pulse">Bildirim ayarları yükleniyor...</div>;

  // Group categories
  const groupedCategories = categories.reduce<Record<string, CategorySetting[]>>((acc, cat) => {
    if (!acc[cat.group]) acc[cat.group] = [];
    acc[cat.group].push(cat);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">🔔 Bildirim Kategorileri</h3>
        {saving && <span className="text-[10px] text-amber-400 animate-pulse">Kaydediliyor...</span>}
      </div>

      {Object.entries(groupedCategories).map(([group, cats]) => (
        <div key={group}>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">
            {GROUP_LABELS[group] || group}
          </p>
          <div className="space-y-1.5">
            {cats.map(cat => (
              <div key={cat.key} className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-white/5 rounded-md flex items-center justify-center text-white/50">
                    {cat.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{cat.label}</div>
                    <div className="text-[10px] text-white/30">{cat.description}</div>
                  </div>
                </div>
                <Switch
                  checked={cat.enabled}
                  onCheckedChange={(checked) => handleToggle(cat.key, checked)}
                  disabled={saving}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
