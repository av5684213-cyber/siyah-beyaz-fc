'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Trophy, ShoppingBag, Swords, ArrowRight } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Takımını Tanı',
    description: 'Kadronu incele, oyuncularının güçlü ve zayıf yönlerini öğren. Takımının formasyonunu ve taktiklerini belirle. Her oyuncunun pozisyonu, rating\'i ve form durumu farklıdır.',
    icon: <Trophy size={32} className="text-amber-400" />,
    tip: 'İlk 11\'i seçerken oyuncuların kondisyon ve form durumlarına dikkat et!',
  },
  {
    title: 'Transfer Yap',
    description: 'Piyasadan oyuncu satın al, kadronu güçlendir. Düşük rating\'li oyuncuları sat ve bütçeni artır. Transfer marketinde iyi fırsatları yakala ve takımını zayıf bölgelerini güçlendir.',
    icon: <ShoppingBag size={32} className="text-emerald-400" />,
    tip: 'Her transferde bütçenin %25\'inden fazlasını harcamaktan kaçın!',
  },
  {
    title: 'İlk Maça Çık',
    description: 'Haftalık maçlarda rakiplerine karşı oyna. Taktiklerine göre maç sonuçları değişir. Galibiyetler puan kazandırır, şampiyonluk yolunda ilerle. Maç sonrası oyuncularının performansını değerlendir.',
    icon: <Swords size={32} className="text-red-400" />,
    tip: 'Maç öncesi rakibin zayıf yönlerini analiz et, buna göre taktik belirle!',
  },
];

interface TutorialProps {
  onComplete: () => void;
  isOpen: boolean;
}

export default function Tutorial({ onComplete, isOpen }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onComplete}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-[#111820] border border-white/10 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-8 bg-amber-400'
                    : i < currentStep
                    ? 'w-4 bg-amber-400/50'
                    : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: direction * 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -direction * 50, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {step.icon}
                </div>
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                {step.description}
              </p>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-6">
                <p className="text-[11px] text-amber-400 font-bold">
                  💡 İpucu: {step.tip}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentStep === 0
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Geri
            </button>

            <span className="text-[10px] text-white/30 font-mono">
              {currentStep + 1} / {TUTORIAL_STEPS.length}
            </span>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-amber-500 text-black rounded-xl text-xs font-black uppercase tracking-wider
                hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-2"
            >
              {isLastStep ? 'Başla!' : 'İleri'}
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Skip */}
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 p-2 text-white/20 hover:text-white/60 transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
