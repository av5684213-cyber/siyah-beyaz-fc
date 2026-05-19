
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
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M €`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K €`;
  return `${Math.round(amount).toLocaleString('tr-TR')} €`;
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

/** Kısa Türkçe mevki kısaltmaları (kartlarda/badge'lerde kullanılır) */
export function localizePos(pos: string): string {
  if (!pos) return '---';
  const mapping: Record<string, string> = {
    'GK': 'KL',
    'DEF': 'DF',
    'MID': 'OS',
    'FWD': 'FV',
    'CB': 'STP',
    'LB': 'SolB',
    'RB': 'SağB',
    'LWB': 'SolK',
    'RWB': 'SağK',
    'CDM': 'DOS',
    'CM': 'MOS',
    'CAM': 'OOS',
    'LM': 'SolA',
    'RM': 'SağA',
    'ST': 'SNT',
    'LW': 'SolA',
    'RW': 'SağA',
    'CF': '2.FV'
  };
  return mapping[pos] || pos;
}

/** Tam Türkçe mevki isimleri (detay sayfası, tooltip) */
export function localizePosFull(pos: string): string {
  if (!pos) return '---';
  const mapping: Record<string, string> = {
    'GK': 'Kaleci',
    'DEF': 'Defans',
    'MID': 'Orta Saha',
    'FWD': 'Forvet',
    'CB': 'Stoper',
    'LB': 'Sol Bek',
    'RB': 'Sağ Bek',
    'LWB': 'Sol Kanat Bek',
    'RWB': 'Sağ Kanat Bek',
    'CDM': 'Defansif Orta Saha',
    'CM': 'Merkez Orta Saha',
    'CAM': 'Ofansif Orta Saha',
    'LM': 'Sol Açık',
    'RM': 'Sağ Açık',
    'ST': 'Forvet',
    'LW': 'Sol Kanat',
    'RW': 'Sağ Kanat',
    'CF': 'İkinci Forvet'
  };
  return mapping[pos] || pos;
}

/** Oyuncunun mevki badge metnini oluşturur (çift mevki desteği ile) */
export function formatPosBadge(player: { specificPosition?: string; position: string; secondaryPositions?: string[] }): string {
  const primary = player.specificPosition || player.position;
  const primaryShort = localizePos(primary);
  if (player.secondaryPositions && player.secondaryPositions.length > 0) {
    const secondaryShort = localizePos(player.secondaryPositions[0]);
    return `${primaryShort}/${secondaryShort}`;
  }
  return primaryShort;
}

/**
 * Pastel position color scheme:
 * GK  (Kaleci):   #7AB4E8  pastel sky blue
 * DEF (Defans):   #7EDBC8  pastel mint
 * MID (Orta Saha):#F0C87A  pastel amber
 * FWD (Forvet):   #E87878  pastel rose
 * SUB (Yedek):    #9B9B9B  grey
 */

export function getPosGroup(pos: string): string {
  if (!pos) return 'SUB';
  const p = pos.toUpperCase();
  if (p === 'GK') return 'GK';
  if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p)) return 'DEF';
  // LW/RW: positions tablosunda MID grubundalar (kanat açık/orta saha)
  if (['MID', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'].includes(p)) return 'MID';
  if (['FWD', 'ST', 'CF', 'LF', 'RF'].includes(p)) return 'FWD';
  return 'SUB';
}

export function getPosColor(pos: string): string {
    if (!pos) return 'text-[#9B9B9B]';
    const p = pos.toUpperCase();
    if (p === 'GK') return 'text-[#7AB4E8]';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p)) return 'text-[#7EDBC8]';
    if (['MID', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'].includes(p)) return 'text-[#F0C87A]';
    if (['FWD', 'ST', 'CF', 'LF', 'RF'].includes(p)) return 'text-[#E87878]';
    return 'text-[#9B9B9B]';
}

/** Row highlight style: low-opacity bg + colored left border */
export function getPosRowStyle(pos: string): string {
    if (!pos) return '';
    const p = pos.toUpperCase();
    if (p === 'GK') return 'bg-[#7AB4E8]/10 border-l-4 border-l-[#7AB4E8]';
    if (['DEF', 'CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p)) return 'bg-[#7EDBC8]/10 border-l-4 border-l-[#7EDBC8]';
    if (['MID', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'].includes(p)) return 'bg-[#F0C87A]/10 border-l-4 border-l-[#F0C87A]';
    if (['FWD', 'ST', 'CF', 'LF', 'RF'].includes(p)) return 'bg-[#E87878]/10 border-l-4 border-l-[#E87878]';
    return 'bg-[#9B9B9B]/10 border-l-4 border-l-[#9B9B9B]';
}

/** Badge style: low-opacity bg + border + text color */
export function getPosBadgeStyle(pos: string): string {
    const p = pos.toUpperCase();
    const group = getPosGroup(p);
    switch (group) {
      case 'GK':  return 'bg-[#7AB4E8]/10 border-[#7AB4E8]/20 text-[#7AB4E8]';
      case 'DEF': return 'bg-[#7EDBC8]/10 border-[#7EDBC8]/20 text-[#7EDBC8]';
      case 'MID': return 'bg-[#F0C87A]/10 border-[#F0C87A]/20 text-[#F0C87A]';
      case 'FWD': return 'bg-[#E87878]/10 border-[#E87878]/20 text-[#E87878]';
      default:    return 'bg-[#9B9B9B]/10 border-[#9B9B9B]/20 text-[#9B9B9B]';
    }
}

/** Dot/pip color for tactical boards */
export function getPosDotColor(pos: string): string {
    const group = getPosGroup(pos);
    switch (group) {
      case 'GK':  return 'bg-[#7AB4E8]';
      case 'DEF': return 'bg-[#7EDBC8]';
      case 'MID': return 'bg-[#F0C87A]';
      case 'FWD': return 'bg-[#E87878]';
      default:    return 'bg-[#9B9B9B]';
    }
}
