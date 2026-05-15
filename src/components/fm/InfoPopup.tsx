
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X } from 'lucide-react';
import { INFO_CONTENT, InfoKey } from '@/lib/fm/InfoContentManager';

interface InfoPopupProps {
  title: string;
  infoKey: InfoKey;
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoPopup({ title, infoKey, isOpen, onClose }: InfoPopupProps) {
  const content = INFO_CONTENT[infoKey];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 relative z-10 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-red-500" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white italic">{title}</h3>
              </div>
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-bold uppercase tracking-wider italic">
              {content}
            </p>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all"
              >
                Anladım
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function InfoTrigger({ title, infoKey }: { title: string, infoKey: InfoKey }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        className="p-1 rounded-full text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all ml-1"
      >
        <Info size={10} />
      </button>
      <InfoPopup 
        title={title}
        infoKey={infoKey}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
