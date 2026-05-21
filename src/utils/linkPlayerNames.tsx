import React from 'react';
import PlayerNameLink from '@/components/PlayerNameLink';

/**
 * Metin içerisindeki oyuncu isimlerini tıklanabilir linklere dönüştürür.
 * Maç raporu, haber metni, bildirimler gibi dinamik içeriklerde kullanılır.
 * 
 * @param text - İşlenecek metin
 * @param playerMap - İsim → ID eşlemesi ({ "Ahmet Yılmaz": "abc123" })
 * @param onPlayerClick - Oyuncuya tıklandığında çağrılacak fonksiyon
 * @returns React elementleri dizisi
 */
export function linkPlayerNames(
  text: string,
  playerMap: Record<string, string>,
  onPlayerClick?: (playerId: string) => void
): React.ReactNode[] {
  if (!text || !playerMap || Object.keys(playerMap).length === 0) {
    return [text];
  }

  // Tüm oyuncu isimlerini regex pattern'ine dönüştür
  const names = Object.keys(playerMap).sort((a, b) => b.length - a.length); // Uzun isimler önce
  const escapedNames = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escapedNames.join('|')})`, 'g');

  const parts = text.split(pattern);
  const result: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    const playerId = playerMap[part];
    if (playerId) {
      result.push(
        <PlayerNameLink
          key={`player-${playerId}-${index}`}
          playerId={playerId}
          name={part}
          onClick={onPlayerClick ? () => onPlayerClick(playerId) : undefined}
        />
      );
    } else {
      result.push(part);
    }
  });

  return result;
}

/**
 * Oyuncu listesinden isim-ID eşlemesi oluşturur.
 * 
 * @param players - Oyuncu dizisi (her biri name ve id içermeli)
 * @returns İsim → ID eşlemesi
 */
export function buildPlayerNameMap(players: Array<{ name: string; id: string }>): Record<string, string> {
  const map: Record<string, string> = {};
  players.forEach(p => {
    if (p.name && p.id) {
      map[p.name] = p.id;
    }
  });
  return map;
}
