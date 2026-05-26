'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, X, RefreshCw } from 'lucide-react';

/**
 * HintBox — Rastgele ipuçları gösteren küçük bir bildirim kutusu.
 * Kullanıcıya oyun mekaniği hakkında bilgiler verir.
 * Kapatılabilir, yeni ipucu istenebilir.
 * localStorage ile kapatılma durumu takip edilir.
 */

interface Hint {
  id: string;
  category: string;
  text: string;
}

const HINTS_POOL: Hint[] = [
  { id: 'hint-transfer-corr', category: 'Transfer', text: 'Transfer pazarında fiyat koridorları var. Piyasa değerinin çok altında veya üstünde teklif yapamazsın!' },
  { id: 'hint-scout', category: 'Keşif', text: 'Gözlemci işe almak 500.000 € ile 15.000.000 € arasında değişir. Seviyesi yükseldikçe daha detaylı arama yapabilirsin!' },
  { id: 'hint-training', category: 'Antrenman', text: 'Genç oyuncular (22 yaş altı) antrenmandan daha çok gelişir. Onlara şans ver!' },
  { id: 'hint-tactics', category: 'Taktik', text: 'Mentality ayarın maç sonucunu etkiler. Hücum daha çok gol ama daha çok yersin!' },
  { id: 'hint-stamina', category: 'Form', text: 'Form ratingi düşük oyuncular maçta daha az katkı sağlar. Antrenmanla formu yükselt!' },
  { id: 'hint-sell-tax', category: 'Finans', text: 'Oyuncu sattığında %2.5 transfer vergisi kesilir. Net kârını iyi hesapla!' },
  { id: 'hint-formation', category: 'Taktik', text: '4-3-3 hücum, 5-3-2 savunma için ideal. Rakibin gücüne göre formasyon değiştir!' },
  { id: 'hint-youth', category: 'Altyapı', text: 'Gençlik Akademisi her hafta yeni yetenekler üretebilir. Tesisleri yükseltme fırsatını kaçıma!' },
  { id: 'hint-pressing', category: 'Taktik', text: 'Tam saha pres topu daha çabuk kazandır ama staminaları hızla düşer. İkinci yarıda yorulursun!' },
  { id: 'hint-fixture', category: 'Fikstür', text: 'Fikstür sayfasından yaklaşan maçlarını takip et. Hazırlıklı olmak her zaman avantaj!' },
  { id: 'hint-market-value', category: 'Pazar', text: 'Oyuncuların piyasa değeri yaş, rating ve potansiyeline göre hesaplanır. Yıldızları erken yakala!' },
  { id: 'hint-friendly', category: 'Maç', text: 'Hazırlık maçlarını "Hazırlık Maçı" sekmesinden yapabilirsin. Ücretsiz veya öncelikli kuyruk seçenekleri var!' },
  { id: 'hint-traits', category: 'Oyuncu', text: 'Her oyuncunun özellikleri (traits) farklıdır. Bir "finisher" ile "playmaker" aynı şekilde kullanılmaz!' },
  { id: 'hint-position', category: 'Kadro', text: 'Oyuncular kendi pozisyonlarında daha iyi performans gösterir. Sol bek oynatan sağ kanat bekleneni vermez!' },
  { id: 'hint-cup', category: 'Kupa', text: 'Kupa maçları eleme usulü oynanır! Üst turlara yükseldikçe ödül ve kupa geliri artar. Kupalar sekmesinden takip et.' },
  { id: 'hint-sound', category: 'Ayarlar', text: 'Sağ alttaki ses butonundan gol ve kart ses efektlerini açabilirsin. Maçları daha heyecanlı yapar!' },
  { id: 'hint-wages', category: 'Finans', text: 'Haftalık gelir-gider dengeni iyi yönet. Sponsorluk ve TV gelirleri maaş giderlerini karşılamalı!' },
  { id: 'hint-sponsor', category: 'Finans', text: 'Sponsor anlaşmaları düzenli gelir sağlar. Stadyum tesislerini yükselttikçe daha iyi sponsor gelir!' },
  { id: 'hint-stadium', category: 'Yerleşke', text: 'Stadyum tesisleri maç performansını etkiler! Çim kalitesi pas isabetini, ısıtma kış kondisyonunu artırır.' },
  { id: 'hint-roles', category: 'Taktik', text: 'Oyunculara rol ata (Oyun Kurucu, Bitirici vb.). Rol uyumu taktik skorunu yükseltir!' },
  { id: 'hint-injury', category: 'Sağlık', text: 'Antrenman yoğunluğu arttıkça sakatlık riski de artar. Fizyoterapist işe alarak tedavi süresini kısalt!' },
];

const STORAGE_KEY = 'sbfc_hints_dismissed';
const HINT_INTERVAL_KEY = 'sbfc_hint_last_shown';
const DISMISS_DURATION = 5 * 60 * 1000; // 5 dakika sonra tekrar göster

function getDismissedIds(): Set<string> {
  try {
    if (typeof window === 'undefined') return new Set();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function addDismissedId(id: string): void {
  try {
    if (typeof window === 'undefined') return;
    const dismissed = getDismissedIds();
    dismissed.add(id);
    // En fazla 50 tut
    const arr = Array.from(dismissed).slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (err) {
    console.error('[HintBox] addDismissedId error:', err);
  }
}

function shouldShowHint(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const lastShown = localStorage.getItem(HINT_INTERVAL_KEY);
    if (!lastShown) return true;
    const elapsed = Date.now() - Number(lastShown);
    return elapsed >= DISMISS_DURATION;
  } catch {
    return true;
  }
}

function markHintShown(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(HINT_INTERVAL_KEY, String(Date.now()));
  } catch (err) {
    console.error('[HintBox] markHintShown error:', err);
  }
}

function getRandomHint(excludeId?: string): Hint {
  const dismissed = getDismissedIds();
  const available = HINTS_POOL.filter(h => !dismissed.has(h.id) && h.id !== excludeId);

  // Tüm ipuçları kapatıldıysa listeyi sıfırla
  if (available.length === 0) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[HintBox] Reset dismissed error:', err);
    }
    const pool = HINTS_POOL.filter(h => h.id !== excludeId);
    return pool[Math.floor(Math.random() * pool.length)] ?? HINTS_POOL[0];
  }

  return available[Math.floor(Math.random() * available.length)];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Transfer': 'text-green-400',
  'Keşif': 'text-purple-400',
  'Antrenman': 'text-blue-400',
  'Taktik': 'text-amber-400',
  'Form': 'text-emerald-400',
  'Finans': 'text-yellow-400',
  'Kadro': 'text-cyan-400',
  'Kupa': 'text-red-400',
  'Ayarlar': 'text-white/40',
  'Oyuncu': 'text-pink-400',
  'Pazar': 'text-orange-400',
  'Maç': 'text-red-300',
  'Altyapı': 'text-lime-400',
  'Fikstür': 'text-indigo-400',
  'Yerleşke': 'text-teal-400',
  'Sağlık': 'text-rose-400',
};

export default function HintBox() {
  const [hint, setHint] = useState<Hint | null>(null);
  const [show, setShow] = useState(false);

  const loadNewHint = useCallback(() => {
    try {
      const newHint = getRandomHint(hint?.id);
      setHint(newHint);
      setShow(true);
      markHintShown();
    } catch (err) {
      console.error('[HintBox] loadNewHint error:', err);
    }
  }, [hint?.id]);

  useEffect(() => {
    // İlk yükleme — gösterme koşulu sağlanıyorsa göster
    if (shouldShowHint()) {
      loadNewHint();
    }
  }, [loadNewHint]);

  const handleDismiss = useCallback(() => {
    try {
      setShow(false);
      if (hint) {
        addDismissedId(hint.id);
      }
    } catch (err) {
      console.error('[HintBox] handleDismiss error:', err);
      setShow(false);
    }
  }, [hint]);

  const handleNext = useCallback(() => {
    try {
      if (hint) {
        addDismissedId(hint.id);
      }
      loadNewHint();
    } catch (err) {
      console.error('[HintBox] handleNext error:', err);
    }
  }, [hint, loadNewHint]);

  if (!show || !hint) return null;

  const categoryColor = CATEGORY_COLORS[hint.category] ?? 'text-white/40';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 10, x: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed bottom-20 right-4 lg:bottom-16 z-40 max-w-[320px]"
        >
          <div className="relative bg-zinc-900/95 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
            {/* Kapat butonu */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={10} className="text-white/40" />
            </button>

            {/* İkon ve başlık */}
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} className="text-amber-400" />
              <span className={`text-[9px] font-black uppercase tracking-widest ${categoryColor}`}>
                {hint.category}
              </span>
            </div>

            {/* İpucu metni */}
            <p className="text-xs text-white/60 leading-relaxed pr-4">
              {hint.text}
            </p>

            {/* Yeni ipucu butonu */}
            <button
              onClick={handleNext}
              className="mt-3 flex items-center gap-1.5 text-[9px] font-bold text-white/20 uppercase tracking-wider hover:text-amber-400 transition-colors"
            >
              <RefreshCw size={10} />
              Başka ipucu
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
