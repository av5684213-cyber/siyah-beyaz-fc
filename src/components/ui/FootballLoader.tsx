'use client';

import React from 'react';

/**
 * Dönen Futbol Topu Loading Component
 *
 * Tüm sayfalarda kullanılabilir. Tailwind animate-spin ile döner.
 * Boyut ve renk özelleştirilebilir.
 */
interface FootballLoaderProps {
  size?: number;       // px cinsinden (varsayılan: 48)
  label?: string;      // altındaki yazı (varsayılan: 'Yükleniyor')
  className?: string;  // ek class'lar
}

export function FootballLoader({ size = 48, label = 'Yükleniyor', className = '' }: FootballLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {/* Dönen futbol topu */}
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="animate-spin"
          style={{ animationDuration: '1.4s', animationTimingFunction: 'linear' }}
        >
          {/* Top gövdesi — beyaz daire */}
          <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#000000" strokeWidth="2" />

          {/* Merkez beşgen (siyah) */}
          <polygon
            points="50,28 65,39 59,57 41,57 35,39"
            fill="#000000"
          />

          {/* Beşgenin köşelerinden çıkan çizgiler */}
          <line x1="50" y1="28" x2="50" y2="8" stroke="#000000" strokeWidth="2.5" />
          <line x1="65" y1="39" x2="84" y2="33" stroke="#000000" strokeWidth="2.5" />
          <line x1="59" y1="57" x2="71" y2="74" stroke="#000000" strokeWidth="2.5" />
          <line x1="41" y1="57" x2="29" y2="74" stroke="#000000" strokeWidth="2.5" />
          <line x1="35" y1="39" x2="16" y2="33" stroke="#000000" strokeWidth="2.5" />

          {/* Çevre yamalar (siyah) */}
          <path d="M 50 8 L 35 16 L 30 4 Z" fill="#000000" opacity="0.85" />
          <path d="M 84 33 L 78 18 L 90 14 Z" fill="#000000" opacity="0.85" />
          <path d="M 71 74 L 86 78 L 80 92 Z" fill="#000000" opacity="0.85" />
          <path d="M 29 74 L 14 78 L 20 92 Z" fill="#000000" opacity="0.85" />
          <path d="M 16 33 L 22 18 L 10 14 Z" fill="#000000" opacity="0.85" />
        </svg>
      </div>

      {label && (
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}

/**
 * Tam ekran dönen futbol topu — sayfa seviyesi loading için
 */
export function FootballLoaderScreen({ label = 'Yükleniyor' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <FootballLoader size={64} label={label} />
    </div>
  );
}
