'use client';

import React, { useState, useEffect } from 'react';
import type { LiveStrategyPanelProps } from './matchTypes';

const STRATEGY_FORMATIONS = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '4-2-3-1', '5-3-2', '3-4-3'];

const STRATEGY_TACTICS = [
  { id: 'dengeli',  label: 'Dengeli', desc: 'Standart oyun planı', icon: '⚖️' },
  { id: 'hucum',    label: 'Hücum',   desc: '+%12 Ofans, -%5 Defans', icon: '⚔️' },
  { id: 'savunma',  label: 'Savunma', desc: '+%15 Defans, -%5 Ofans', icon: '🛡️' },
  { id: 'kontra',   label: 'Kontra',  desc: '+%8 Kontra Atak gücü', icon: '⚡' },
  { id: 'tikitaka', label: 'Tiki-Taka', desc: 'Yüksek pas ve oyun kontrolü', icon: '🔥' },
];

export default function LiveStrategyPanel({
  currentFormation,
  currentTactic,
  onApply,
  isApplying,
  lastApplied,
  changeCount,
}: LiveStrategyPanelProps) {
  const [draftFormation, setDraftFormation] = useState(currentFormation);
  const [draftTactic, setDraftTactic] = useState(currentTactic);

  useEffect(() => {
    setDraftFormation(currentFormation);
  }, [currentFormation]);

  useEffect(() => {
    setDraftTactic(currentTactic);
  }, [currentTactic]);

  const hasChanges = draftFormation !== currentFormation || draftTactic !== currentTactic;
  const maxChanges = 3;
  const remaining = maxChanges - changeCount;

  return (
    <div className="space-y-4">
      {/* Aktif durum paneli */}
      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/[0.06] border border-red-500/20 rounded-xl">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-red-400">Aktif Taktik Planı</p>
          <p className="text-xs font-bold text-white/70 mt-0.5">
            {currentFormation} · {STRATEGY_TACTICS.find(t => t.id === currentTactic)?.label || currentTactic}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-white/20">Değişiklik Hakkı</p>
          <p className={`text-sm font-black ${remaining > 0 ? 'text-amber-400' : 'text-red-500'}`}>
            {remaining}/{maxChanges}
          </p>
        </div>
      </div>

      {remaining === 0 ? (
        <div className="px-4 py-3 bg-red-500/[0.06] border border-red-500/20 rounded-xl text-center">
          <p className="text-xs text-red-400/70">Bu maç için kenardan müdahale hakkınız dolmuştur.</p>
        </div>
      ) : (
        <>
          {/* Formasyon Seçimi */}
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-white/25 block mb-2">Formasyonu Değiştir</label>
            <div className="flex flex-wrap gap-2">
              {STRATEGY_FORMATIONS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setDraftFormation(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    draftFormation === f
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:bg-white/[0.06]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Stil Seçimi */}
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-white/25 block mb-2">Oyun Stilini Değiştir</label>
            <div className="grid grid-cols-2 gap-2">
              {STRATEGY_TACTICS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDraftTactic(t.id)}
                  className={`px-3 py-3 rounded-xl text-left transition-all border ${
                    draftTactic === t.id
                      ? 'bg-amber-500/15 border-amber-500/25'
                      : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <p className={`text-[10px] font-black uppercase mt-1 ${draftTactic === t.id ? 'text-amber-300' : 'text-white/40'}`}>{t.label}</p>
                  <p className={`text-[8px] mt-0.5 ${draftTactic === t.id ? 'text-amber-400/50' : 'text-white/20'}`}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Uygulama Butonu */}
          <button
            type="button"
            onClick={() => onApply(draftFormation, draftTactic)}
            disabled={!hasChanges || isApplying}
            className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              hasChanges && !isApplying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-white/[0.02] text-white/20 border border-white/[0.06] cursor-not-allowed'
            }`}
          >
            {isApplying ? '⏳ Taktiğe müdahale ediliyor...' : hasChanges ? '✅ Kulübeden Talimatı Ver' : '— Değişiklik Yok —'}
          </button>

          {lastApplied && (
            <p className="text-[8px] text-center text-white/15">Son talimat saati: {lastApplied}</p>
          )}
        </>
      )}
    </div>
  );
}
