'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertTriangle, Info, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import type { LiveStrategyPanelProps } from './matchTypes';

const STRATEGY_FORMATIONS = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '4-2-3-1', '5-3-2', '3-4-3'];

const STRATEGY_TACTICS = [
  { id: 'dengeli',  label: 'Dengeli',   desc: 'Standart oyun planı', icon: '⚖️', goalMod: 0,    conceedMod: 0,    counterMod: 0 },
  { id: 'hucum',    label: 'Hücum',     desc: '+%12 Ofans, -%5 Defans', icon: '⚔️', goalMod: 0.12, conceedMod: 0.05, counterMod: 0 },
  { id: 'savunma',  label: 'Savunma',   desc: '+%15 Defans, -%5 Ofans', icon: '🛡️', goalMod: -0.05, conceedMod: -0.15, counterMod: 0 },
  { id: 'kontra',   label: 'Kontra',    desc: '+%10 Kontra Atak gücü', icon: '⚡', goalMod: 0.05, conceedMod: 0,    counterMod: 0.10 },
  { id: 'tikitaka', label: 'Tiki-Taka', desc: 'Yüksek pas ve oyun kontrolü', icon: '🔥', goalMod: 0.04, conceedMod: -0.02, counterMod: 0 },
];

// ─── Taktik etki bilgi kutusu ─────────────────────────────
function TacticEffectInfo({ tacticId }: { tacticId: string }) {
  const tactic = STRATEGY_TACTICS.find(t => t.id === tacticId);
  if (!tactic || tacticId === 'dengeli') return null;

  const effects: { label: string; value: string; color: string }[] = [];
  if (tactic.goalMod !== 0) {
    effects.push({
      label: 'Gol şansı',
      value: tactic.goalMod > 0 ? `+${(tactic.goalMod * 100).toFixed(0)}%` : `${(tactic.goalMod * 100).toFixed(0)}%`,
      color: tactic.goalMod > 0 ? 'text-emerald-400' : 'text-red-400',
    });
  }
  if (tactic.conceedMod !== 0) {
    effects.push({
      label: 'Gol yeme riski',
      value: tactic.conceedMod > 0 ? `+${(tactic.conceedMod * 100).toFixed(0)}%` : `${(tactic.conceedMod * 100).toFixed(0)}%`,
      color: tactic.conceedMod > 0 ? 'text-red-400' : 'text-emerald-400',
    });
  }
  if (tactic.counterMod !== 0) {
    effects.push({
      label: 'Kontra atak',
      value: `+${(tactic.counterMod * 100).toFixed(0)}%`,
      color: 'text-cyan-400',
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-amber-500/[0.06] border border-amber-500/15 rounded-xl p-3 space-y-1.5"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Info size={10} className="text-amber-400" />
        <p className="text-[8px] font-black uppercase tracking-widest text-amber-400/60">
          {tactic.label} Taktik Etkileri
        </p>
      </div>
      {effects.map((e, i) => (
        <div key={i} className="flex items-center justify-between text-[10px]">
          <span className="text-white/40 font-bold">{e.label}</span>
          <span className={`font-black ${e.color}`}>{e.value}</span>
        </div>
      ))}
    </motion.div>
  );
}

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
  const [showEffects, setShowEffects] = useState(true);
  const [lastChangeMsg, setLastChangeMsg] = useState<string | null>(null);

  useEffect(() => {
    setDraftFormation(currentFormation);
  }, [currentFormation]);

  useEffect(() => {
    setDraftTactic(currentTactic);
  }, [currentTactic]);

  // 5 saniye sonra taktik mesajını kaldır
  useEffect(() => {
    if (lastChangeMsg) {
      const timer = setTimeout(() => setLastChangeMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastChangeMsg]);

  const hasChanges = draftFormation !== currentFormation || draftTactic !== currentTactic;
  const maxChanges = 3;
  const remaining = maxChanges - changeCount;

  const handleApply = () => {
    const prevLabel = STRATEGY_TACTICS.find(t => t.id === currentTactic)?.label || currentTactic;
    const nextLabel = STRATEGY_TACTICS.find(t => t.id === draftTactic)?.label || draftTactic;
    const formationChange = draftFormation !== currentFormation ? `${currentFormation} → ${draftFormation}` : '';
    const tacticChange = currentTactic !== draftTactic ? `${prevLabel} → ${nextLabel}` : '';

    const parts = [formationChange, tacticChange].filter(Boolean).join(', ');
    const nextTactic = STRATEGY_TACTICS.find(t => t.id === draftTactic);

    let effectHint = '';
    if (nextTactic && draftTactic !== 'dengeli') {
      if (nextTactic.goalMod > 0) effectHint = ` Gol ihtimali +${(nextTactic.goalMod * 100).toFixed(0)}%`;
      else if (nextTactic.goalMod < 0) effectHint = ` Gol ihtimali ${(nextTactic.goalMod * 100).toFixed(0)}%`;
      if (nextTactic.conceedMod > 0) effectHint += `, gol yeme riski +${(nextTactic.conceedMod * 100).toFixed(0)}%`;
      else if (nextTactic.conceedMod < 0) effectHint += `, gol yeme riski ${(nextTactic.conceedMod * 100).toFixed(0)}%`;
    }

    setLastChangeMsg(`Taktik değişti: ${parts}.${effectHint}`);

    onApply(draftFormation, draftTactic);
  };

  return (
    <div className="space-y-4">
      {/* ═══ Geçici Taktik Değişikliği Bildirimi ═══ */}
      <AnimatePresence>
        {lastChangeMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
              <Zap size={16} className="text-amber-400" />
            </div>
            <p className="text-[10px] font-bold text-amber-300 leading-relaxed">{lastChangeMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Değişiklik hakkı dolunca uyarı ═══ */}
      {remaining === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/[0.08] border border-red-500/25 rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Müdahale Hakkı Doldu</p>
            <p className="text-[9px] text-red-400/60 mt-0.5">Bu maç için kenardan müdahale hakkınız kalmamıştır. Taktik değişikliği yapamazsınız.</p>
          </div>
        </motion.div>
      )}

      {/* ═══ Son 1 hak uyarısı ═══ */}
      {remaining === 1 && changeCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-500/[0.06] border border-amber-500/15 rounded-xl px-4 py-2 flex items-center gap-2"
        >
          <AlertTriangle size={12} className="text-amber-400 shrink-0" />
          <p className="text-[9px] font-bold text-amber-400/70">Dikkat! Son müdahale hakkınız. Bu değişiklikten sonra taktik değiştiremezsiniz.</p>
        </motion.div>
      )}

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
          <p className={`text-sm font-black ${remaining > 1 ? 'text-amber-400' : remaining === 1 ? 'text-orange-400' : 'text-red-500'}`}>
            {remaining}/{maxChanges}
          </p>
        </div>
      </div>

      {remaining > 0 && (
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

          {/* ═══ Taktik Etki Bilgi Kutusu ═══ */}
          <AnimatePresence>
            {showEffects && draftTactic !== 'dengeli' && (
              <TacticEffectInfo tacticId={draftTactic} />
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setShowEffects(prev => !prev)}
            className="w-full flex items-center justify-center gap-1.5 text-[8px] font-bold text-white/15 hover:text-white/30 transition-colors"
          >
            {showEffects ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {showEffects ? 'Etki bilgisini gizle' : 'Etki bilgisini göster'}
          </button>

          {/* Uygulama Butonu */}
          <button
            type="button"
            onClick={handleApply}
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
