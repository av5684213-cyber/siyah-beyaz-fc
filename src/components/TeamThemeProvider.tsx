'use client';

import { useEffect } from 'react';
import { applyTeamColors } from '@/lib/fm/themeSystem';

/**
 * TeamThemeProvider
 * 
 * Reads the profile's primary_color/secondary_color and sets CSS custom properties
 * on the document root. This enables team-color-aware styling via Tailwind classes
 * like `bg-team-primary`, `text-team-primary`, `border-team-primary`, etc.
 * 
 * Also restores the dark/light theme preference from localStorage.
 */
export default function TeamThemeProvider() {
  useEffect(() => {
    // ── Apply team colors from profile ──
    try {
      const stored = localStorage.getItem('fm_profile');
      if (stored) {
        const profile = JSON.parse(stored);
        if (profile?.primary_color && profile?.secondary_color) {
          applyTeamColors({
            primary: profile.primary_color,
            secondary: profile.secondary_color,
          });
        }
      }
    } catch (err) {
      console.warn('[TeamThemeProvider] Failed to apply team colors:', err);
    }

    // ── Apply dark/light theme preference ──
    try {
      const storedTheme = localStorage.getItem('sb-fc-theme');
      if (storedTheme) {
        const html = document.documentElement;
        html.classList.remove('dark', 'light', 'high-contrast');
        html.classList.add(storedTheme);
        html.setAttribute('data-theme', storedTheme);
      }
    } catch (err) {
      console.warn('[TeamThemeProvider] Failed to apply theme:', err);
    }
  }, []);

  return null; // This component renders nothing
}
