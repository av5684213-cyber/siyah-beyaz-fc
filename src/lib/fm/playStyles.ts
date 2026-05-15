import { Player } from './types';

export function getPlayStyleEffect(style: string) {
  const styles: Record<string, any> = {
    'Gegenpressing': { name: 'Gegenpressing', short: 'Yüksek baskı ve hızlı geri kazanım.', icon: '⚡' },
    'Tiki-Taka': { name: 'Tiki-Taka', short: 'Kısa pas ve oyun kontrolü.', icon: '⚽' },
    'Catenaccio': { name: 'Catenaccio', short: 'Katı savunma ve kontratak.', icon: '🛡️' },
  };
  return styles[style] || null;
}

export function assignRandomPlayStyle(player: Player): Player {
  return { ...player };
}
