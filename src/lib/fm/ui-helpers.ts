
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

export function toTitleCase(str: string | undefined | null): string {
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

/**
 * Soft position color scheme:
 * GK  (Kaleci):   #4A90E2  soft blue
 * DEF (Defans):   #50E3C2  soft green-turquoise
 * MID (Orta Saha):#F5A623  soft orange
 * FWD (Forvet):   #D0021B  soft red
 * SUB (Yedek):    #9B9B9B  grey
 */

export function getPosGroup(pos: string): string {
  if (!pos) return 'SUB';
  const p = pos.toUpperCase();
  if (p === 'GK') return 'GK';
  if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p)) return 'DEF';
  if (['MID', 'CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p)) return 'MID';
  if (['FWD', 'ST', 'LW', 'RW', 'CF', 'LF', 'RF'].includes(p)) return 'FWD';
  return 'SUB';
}

export function getPosColor(pos: string): string {
    if (!pos) return 'text-[#9B9B9B]';
    const p = pos.toUpperCase();
    if (p === 'GK') return 'text-[#4A90E2]';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p)) return 'text-[#50E3C2]';
    if (['MID', 'CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p)) return 'text-[#F5A623]';
    if (['FWD', 'ST', 'LW', 'RW', 'CF', 'LF', 'RF'].includes(p)) return 'text-[#D0021B]';
    return 'text-[#9B9B9B]';
}

/** Row highlight style: low-opacity bg + colored left border */
export function getPosRowStyle(pos: string): string {
    if (!pos) return '';
    const p = pos.toUpperCase();
    if (p === 'GK') return 'bg-[#4A90E2]/10 border-l-4 border-l-[#4A90E2]';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p)) return 'bg-[#50E3C2]/10 border-l-4 border-l-[#50E3C2]';
    if (['MID', 'CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p)) return 'bg-[#F5A623]/10 border-l-4 border-l-[#F5A623]';
    if (['FWD', 'ST', 'LW', 'RW', 'CF', 'LF', 'RF'].includes(p)) return 'bg-[#D0021B]/10 border-l-4 border-l-[#D0021B]';
    return 'bg-[#9B9B9B]/10 border-l-4 border-l-[#9B9B9B]';
}

/** Badge style: low-opacity bg + border + text color */
export function getPosBadgeStyle(pos: string): string {
    const p = pos.toUpperCase();
    const group = getPosGroup(p);
    switch (group) {
      case 'GK':  return 'bg-[#4A90E2]/10 border-[#4A90E2]/20 text-[#4A90E2]';
      case 'DEF': return 'bg-[#50E3C2]/10 border-[#50E3C2]/20 text-[#50E3C2]';
      case 'MID': return 'bg-[#F5A623]/10 border-[#F5A623]/20 text-[#F5A623]';
      case 'FWD': return 'bg-[#D0021B]/10 border-[#D0021B]/20 text-[#D0021B]';
      default:    return 'bg-[#9B9B9B]/10 border-[#9B9B9B]/20 text-[#9B9B9B]';
    }
}

/** Dot/pip color for tactical boards */
export function getPosDotColor(pos: string): string {
    const group = getPosGroup(pos);
    switch (group) {
      case 'GK':  return 'bg-[#4A90E2]';
      case 'DEF': return 'bg-[#50E3C2]';
      case 'MID': return 'bg-[#F5A623]';
      case 'FWD': return 'bg-[#D0021B]';
      default:    return 'bg-[#9B9B9B]';
    }
}
