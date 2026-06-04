'use client';

import { useState } from 'react';
import { applyTeamColors } from '@/lib/fm/themeSystem';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface TeamColorPickerProps {
  userId: string;
  initialPrimary: string;
  initialSecondary: string;
}

const PRESET_COLORS = [
  '#000000', '#1a1a2e', '#16213e', '#0f3460', '#e94560',
  '#533483', '#2b2d42', '#d90429', '#ef233c', '#2ec4b6',
  '#ff6b35', '#004e89', '#1b998b', '#f4a261', '#e76f51',
];

export default function TeamColorPicker({ userId, initialPrimary, initialSecondary }: TeamColorPickerProps) {
  const [primary, setPrimary] = useState(initialPrimary || '#000000');
  const [secondary, setSecondary] = useState(initialSecondary || '#FFFFFF');
  const [saving, setSaving] = useState(false);

  const handlePrimaryChange = (color: string) => {
    setPrimary(color);
    applyTeamColors({ primary: color, secondary });
  };

  const handleSecondaryChange = (color: string) => {
    setSecondary(color);
    applyTeamColors({ primary, secondary: color });
  };

  const handleSave = async () => {
    if (!isSupabaseConfigured() || !userId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ primary_color: primary, secondary_color: secondary })
        .eq('id', userId);
    } catch (err) {
      console.error('Color save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-bold text-white mb-3">🎨 Takım Renkleri</h3>

      {/* Preview */}
      <div className="flex gap-3 mb-4">
        <div
          className="w-16 h-16 rounded-xl border-2 border-white/10 flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: primary, color: secondary }}
        >
          SB FC
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="text-xs">
            <div className="text-white/40">Ana Renk</div>
            <input
              type="color"
              value={primary}
              onChange={e => handlePrimaryChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
          <div className="text-xs">
            <div className="text-white/40">İkincil</div>
            <input
              type="color"
              value={secondary}
              onChange={e => handleSecondaryChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="mb-4">
        <div className="text-[10px] text-white/30 mb-2">Hazır Renkler</div>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              onClick={() => handlePrimaryChange(color)}
              className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                primary === color ? 'border-white scale-110' : 'border-white/10'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2 rounded-lg bg-[var(--team-primary,#333)] hover:opacity-90 text-white font-bold text-xs disabled:opacity-50 transition-all"
        style={{ backgroundColor: primary }}
      >
        {saving ? 'Kaydediliyor...' : 'Renkleri Kaydet'}
      </button>
    </div>
  );
}
