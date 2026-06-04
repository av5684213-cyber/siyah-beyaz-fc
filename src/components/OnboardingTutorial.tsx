'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ShoppingBag, Swords, X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  targetTab?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Kadronu Tanı',
    description:
      'Takımındaki oyuncuları incele! Her oyuncunun rating, pozisyon, yaş ve potansiyel değerleri var. Yıldız oyuncularını belirle ve kadro derinliğini kontrol et.',
    icon: <Users size={32} className="text-blue-400" />,
    action: 'Takımımı Gör',
    targetTab: 'tactics',
  },
  {
    id: 2,
    title: 'Transfer Yap',
    description:
      'Transfer pazarından takımını güçlendir! Bütçene uygun oyuncuları bul, pazarlık yap ve kadronu eksi mevkilerle tamamla. Akıllı transferler şampiyonluk getirir.',
    icon: <ShoppingBag size={32} className="text-green-400" />,
    action: 'Pazarı Aç',
    targetTab: 'multiplayer',
  },
  {
    id: 3,
    title: 'İlk Maçına Çık',
    description:
      'Simüle Et butonuna bas, kadronun kalitesi ve taktik seçimin maç sonucunu belirler. İlk 11\'i seç, taktik ayarla ve rakibine meydan oku!',
    icon: <Swords size={32} className="text-red-400" />,
    action: 'Maç Günü',
    targetTab: 'matchday',
  },
  {
    id: 4,
    title: 'Ligde Yüksel',
    description:
      '4. Ligden başlıyorsun! Her maç önemli — fikstürü takip et, antrenmanlarla oyuncularını geliştir ve üst lige yükselmek için mücadele et. Sezon sonunda şampiyonluk kupasını kaldır!',
    icon: <Swords size={32} className="text-amber-400" />,
  },
  {
    id: 5,
    title: 'Tebrikler, Menajer!',
    description:
      'Artık Siyah Beyaz FC\'nin teknik direktörüsün! Takımını yönet, genç yetenekleri keşfet, taktik değiştir ve efsane ol. İyi şanslar!',
    icon: <span className="text-4xl">🏆</span>,
  },
];

interface OnboardingTutorialProps {
  onComplete: (tab?: string) => void;
  onDismiss: () => void;
  userId?: string | null;
}

export default function OnboardingTutorial({ onComplete, onDismiss, userId }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Supabase'e onboarding tamamlandığını kaydet
    try {
      const key = 'sbfc_onboarding_completed';
      localStorage.setItem(key, 'true');

      // Supabase'e de kaydet (mevcutsa)
      void (async () => {
        try {
          const { getSupabase, isSupabaseConfigured } = await import('@/lib/supabase');
          if (isSupabaseConfigured()) {
            const supabase = getSupabase();
            if (supabase && userId) {
              await supabase
                .from('profiles')
                .update({ onboarding_completed: true })
                .eq('id', userId);
              console.log('[Onboarding] Supabase\'e kaydedildi, userId:', userId);
            }
          }
        } catch (err) {
          console.error('[Onboarding] Supabase kayıt hatası:', err);
        }
      })();
    } catch (err) {
      console.error('[Onboarding] localStorage hatası:', err);
    }

    setTimeout(() => onComplete(), 300);
  };

  const handleActionClick = () => {
    setIsVisible(false);
    setTimeout(() => onComplete(step.targetTab), 300);
  };

  if (!isVisible || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onDismiss();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
        >
          {/* Üst bar — ilerleme */}
          <div className="h-1 bg-white/5">
            <motion.div
              className="h-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Kapat butonu */}
          <div className="flex justify-end p-3">
            <button
              onClick={onDismiss}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={14} className="text-white/50" />
            </button>
          </div>

          {/* İçerik */}
          <div className="px-8 pb-6 text-center">
            {/* İkon */}
            <motion.div
              key={`icon-${step.id}`}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6"
            >
              {step.icon}
            </motion.div>

            {/* Adım numarası */}
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">
              Adım {step.id} / {ONBOARDING_STEPS.length}
            </p>

            {/* Başlık */}
            <motion.h2
              key={`title-${step.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xl font-black text-white uppercase tracking-tight mb-3"
            >
              {step.title}
            </motion.h2>

            {/* Açıklama */}
            <motion.p
              key={`desc-${step.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-white/50 leading-relaxed mb-6"
            >
              {step.description}
            </motion.p>

            {/* Aksiyon butonu */}
            {step.action && step.targetTab && (
              <motion.button
                key={`action-${step.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={handleActionClick}
                className="mb-4 px-6 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-amber-500/20 transition-all"
              >
                {step.action}
              </motion.button>
            )}

            {/* Navigasyon noktaları */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {ONBOARDING_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep
                      ? 'bg-amber-500 w-6'
                      : i < currentStep
                        ? 'bg-amber-500/40'
                        : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Alt butonlar */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrev}
                disabled={isFirstStep}
                className="flex items-center gap-1 px-4 py-2.5 text-xs font-bold text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors disabled:opacity-0"
              >
                <ChevronLeft size={14} />
                Geri
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-6 py-2.5 bg-amber-500 text-black text-xs font-black uppercase tracking-wider rounded-xl hover:bg-amber-400 active:scale-95 transition-all"
              >
                {isLastStep ? 'Başla!' : 'Devam'}
                {!isLastStep && <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Onboarding'in gösterilip gösterilmeyeceğini kontrol eder.
 * localStorage veya Supabase'deki onboarding_completed alanına bakar.
 */
export async function shouldShowOnboarding(profileId?: string): Promise<boolean> {
  try {
    // 1. Check localStorage first (fast)
    const completed = localStorage.getItem('sbfc_onboarding_completed');
    if (completed === 'true') return false;

    // 2. Check Supabase if profileId provided
    if (profileId) {
      try {
        const { getSupabase, isSupabaseConfigured } = await import('@/lib/supabase');
        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          if (supabase) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', profileId)
              .maybeSingle();
            if (profile?.onboarding_completed === true) {
              // Sync localStorage
              localStorage.setItem('sbfc_onboarding_completed', 'true');
              return false;
            }
          }
        }
      } catch (err) {
        console.warn('[shouldShowOnboarding] DB check failed:', err);
      }
    }

    return true;
  } catch {
    return true;
  }
}

/**
 * Rehberi tekrar açma butonu için bileşen.
 */
export function RestartOnboardingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white/20 uppercase tracking-wider hover:text-amber-400 transition-colors"
      title="Rehberi tekrar göster"
    >
      <HelpCircle size={12} />
      Rehber
    </button>
  );
}
