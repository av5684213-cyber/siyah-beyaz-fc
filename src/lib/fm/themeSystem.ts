/**
 * Team Theme Color System
 * Applies custom team colors as CSS custom properties
 */

export interface TeamColors {
  primary: string;   // Hex color
  secondary: string; // Hex color
}

const DEFAULT_COLORS: TeamColors = {
  primary: '#000000',
  secondary: '#FFFFFF',
};

/**
 * Apply team colors to CSS custom properties on the document root
 */
export function applyTeamColors(colors: TeamColors): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--team-primary', colors.primary);
  root.style.setProperty('--team-secondary', colors.secondary);

  // Generate derived colors
  const lightColor = adjustColor(colors.primary, 30);
  const darkColor = adjustColor(colors.primary, -30);
  root.style.setProperty('--team-primary-light', lightColor);
  root.style.setProperty('--team-primary-dark', darkColor);
  root.style.setProperty('--team-primary-hover', darkColor); // Hover is slightly darker
  root.style.setProperty('--team-primary-bg', hexToRgba(colors.primary, 0.1));
  root.style.setProperty('--team-primary-border', hexToRgba(colors.primary, 0.3));
  root.style.setProperty('--team-secondary-bg', hexToRgba(colors.secondary, 0.1));
}

/**
 * Remove team colors (reset to default)
 */
export function removeTeamColors(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.removeProperty('--team-primary');
  root.style.removeProperty('--team-secondary');
  root.style.removeProperty('--team-primary-light');
  root.style.removeProperty('--team-primary-dark');
  root.style.removeProperty('--team-primary-hover');
  root.style.removeProperty('--team-primary-bg');
  root.style.removeProperty('--team-primary-border');
  root.style.removeProperty('--team-secondary-bg');
}

// Utility functions
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xFF;
  const g = (num >> 8) & 0xFF;
  const b = num & 0xFF;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
