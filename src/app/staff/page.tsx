'use client';

import React from 'react';
import { ArrowLeft, Building2 } from 'lucide-react';
import StaffSection from '@/components/fm/StaffSection';

export default function StaffPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <ArrowLeft size={18} className="text-white/40" />
            </a>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter text-white">Personel Yönetimi</h1>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">6 Personel Türü • Yıldız Sistemi • Sezonluk Sözleşme</p>
            </div>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('activeTab', 'stadium');
              }
            }}
          >
            <Building2 size={14} className="text-amber-400" />
            <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Yerleşkeye Dön</span>
          </a>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 pb-32">
        <StaffSection />
      </main>
    </div>
  );
}
