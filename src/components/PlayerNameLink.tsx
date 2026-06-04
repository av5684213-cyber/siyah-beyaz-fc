'use client';

import React from 'react';

interface PlayerNameLinkProps {
  playerId: string;
  name: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Tıklanabilir oyuncu adı bileşeni.
 * Oyuncu detay sayfasına yönlendirir veya modal açar.
 */
export default function PlayerNameLink({ playerId, name, className, onClick }: PlayerNameLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer hover:text-emerald-400 hover:underline underline-offset-2 transition-colors ${className || 'text-inherit'}`}
      data-player-id={playerId}
      title={`Oyuncu detayı: ${name}`}
    >
      {name}
    </span>
  );
}
