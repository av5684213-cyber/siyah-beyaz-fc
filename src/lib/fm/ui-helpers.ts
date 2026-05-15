
export function fmStatColor(value: number): string {
  if (value >= 80) return 'text-green-500';
  if (value >= 65) return 'text-emerald-400';
  if (value >= 50) return 'text-yellow-400';
  if (value >= 35) return 'text-orange-500';
  return 'text-red-500';
}

export function fmStatBg(value: number): string {
  if (value >= 80) return 'bg-green-500/10';
  if (value >= 65) return 'bg-emerald-500/10';
  if (value >= 50) return 'bg-yellow-500/10';
  if (value >= 35) return 'bg-orange-500/10';
  return 'bg-red-500/10';
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function cap99(value: number): number {
  return Math.min(99, Math.max(0, Math.round(value)));
}

export function toTitleCase(str: any): string {
  if (typeof str !== 'string' || !str) return '';
  return str.toLocaleLowerCase('tr-TR').split(' ').map(word => {
    if (!word) return '';
    return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1);
  }).join(' ');
}

export function localizePos(pos: string): string {
  if (!pos) return '---';
  const mapping: Record<string, string> = {
    'GK': 'KL',
    'DEF': 'DF',
    'MID': 'OS',
    'FWD': 'FV',
    'CB': 'STP',
    'LB': 'SB',
    'RB': 'SB',
    'LWB': 'KNT',
    'RWB': 'KNT',
    'CDM': 'DOS',
    'CM': 'MC',
    'CAM': 'OOS',
    'LM': 'SLK',
    'RM': 'SAK',
    'ST': 'SNT',
    'LW': 'SLK',
    'RW': 'SAK',
    'CF': 'FV'
  };
  return mapping[pos] || pos;
}

export function getPosColor(pos: string): string {
    if (!pos) return 'text-white/40';
    const p = pos.toUpperCase();
    if (p === 'GK') return 'text-emerald-400';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p)) return 'text-blue-400';
    if (['MID', 'CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p)) return 'text-amber-400';
    if (['FWD', 'ST', 'LW', 'RW', 'CF', 'LF', 'RF'].includes(p)) return 'text-red-400';
    return 'text-white/60';
}
