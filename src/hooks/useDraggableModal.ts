/**
 * useDraggableModal — Modal'ları sürüklenebilir yapan React hook'u.
 *
 * Kullanım:
 *   const { modalRef, handleRef, position, isDragging } = useDraggableModal();
 *
 *   <div ref={modalRef} style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
 *     <div ref={handleRef} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
 *       Başlık / Sürükleme Tutamacı
 *     </div>
 *     <div className="overflow-y-auto">İçerik</div>
 *   </div>
 *
 * - Sadece handle alanından sürüklenebilir (tüm modal değil)
 * - Çift tıklama ile merkeze sıfırlar
 * - Ekran sınırlarını aşmaz
 * - Touch event desteği (mobil)
 */

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableModalReturn {
  modalRef: React.RefObject<HTMLDivElement | null>;
  handleRef: React.RefObject<HTMLDivElement | null>;
  position: Position;
  isDragging: boolean;
  resetPosition: () => void;
}

export function useDraggableModal(): UseDraggableModalReturn {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);

  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  // ── Mouse Events ──
  const handleMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
    // Sadece sol tıklama (mouse) veya touch
    if ('button' in e && e.button !== 0) return;

    e.preventDefault();
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    dragStart.current = { x: clientX, y: clientY };
    dragOffset.current = { ...position };
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;

    let newX = dragOffset.current.x + deltaX;
    let newY = dragOffset.current.y + deltaY;

    // Ekran sınırlarını kontrol et
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - 40; // En az 40px görünür kalsın

      newX = Math.max(-rect.width + 100, Math.min(maxX, newX));
      newY = Math.max(0, Math.min(maxY, newY));
    }

    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ── Double-click to reset ──
  const handleDoubleClick = useCallback(() => {
    resetPosition();
  }, [resetPosition]);

  // ── Event Listener Kayıt ──
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    // Mouse
    handle.addEventListener('mousedown', handleMouseDown as EventListener);
    handle.addEventListener('dblclick', handleDoubleClick);

    // Touch
    handle.addEventListener('touchstart', handleMouseDown as EventListener, { passive: false });

    return () => {
      handle.removeEventListener('mousedown', handleMouseDown as EventListener);
      handle.removeEventListener('dblclick', handleDoubleClick);
      handle.removeEventListener('touchstart', handleMouseDown as EventListener);
    };
  }, [handleMouseDown, handleDoubleClick]);

  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleMouseMove as EventListener);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove as EventListener, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove as EventListener);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as EventListener);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    modalRef,
    handleRef,
    position,
    isDragging,
    resetPosition,
  };
}
