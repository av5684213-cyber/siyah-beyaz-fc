'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PlayerNameLinkProps {
  playerId: string;
  playerName: string;
  className?: string;
  /** If true, don't wrap in any container - just the clickable text */
  inline?: boolean;
}

/**
 * PlayerNameLink - Tüm oyuncu isimlerini tıklanabilir yapar.
 * Tıklandığında /player/[id] sayfasına yönlendirir.
 * 
 * Kullanım:
 * <PlayerNameLink playerId="abc123" playerName="Ahmet Yılmaz" />
 * <PlayerNameLink playerId="abc123" playerName="Ahmet Yılmaz" className="text-amber-400" />
 */
export default function PlayerNameLink({ 
  playerId, 
  playerName, 
  className = '',
  inline = false,
}: PlayerNameLinkProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Parent elementlerin click'ini tetikleme
    router.push(`/player/${playerId}`);
  };

  const baseStyle = inline 
    ? `cursor-pointer transition-colors duration-150 hover:text-cyan-400 hover:underline underline-offset-2 ${className}`
    : `cursor-pointer transition-colors duration-150 hover:text-cyan-400 hover:underline underline-offset-2 ${className}`;

  return (
    <span
      className={baseStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/player/${playerId}`);
        }
      }}
    >
      {playerName}
    </span>
  );
}

/**
 * parsePlayerNamesInText - Metin içindeki oyuncu isimlerini tıklanabilir linklere dönüştürür.
 * 
 * Kullanım:
 * const linkedText = parsePlayerNamesInText(
 *   "Ahmet Yılmaz harika bir gol attı!",
 *   [{ id: "abc123", name: "Ahmet Yılmaz" }]
 * );
 * // Returns: [<PlayerNameLink ... />, " harika bir gol attı!"]
 */
export function parsePlayerNamesInText(
  text: string,
  players: Array<{ id: string; name: string }>
): React.ReactNode[] {
  if (!text || !players || players.length === 0) return [text];

  // Sort players by name length (longest first) to avoid partial matches
  const sorted = [...players].sort((a, b) => b.name.length - a.name.length);

  // Create a regex pattern from all player names
  const escapedNames = sorted.map(p => p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escapedNames.join('|')})`, 'g');

  const parts = text.split(pattern);
  const result: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    const player = sorted.find(p => p.name === part);
    if (player) {
      result.push(
        <PlayerNameLink
          key={`player-link-${player.id}-${index}`}
          playerId={player.id}
          playerName={player.name}
          inline
        />
      );
    } else if (part) {
      result.push(part);
    }
  });

  return result;
}
