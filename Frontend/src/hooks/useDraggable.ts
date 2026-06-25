import { useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (storageKey: string, initialPosition: Position = { x: -24, y: -24 }) => {
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialPosition;
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(position));
  }, [position, storageKey]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      e.preventDefault();

      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      // Keep within bounds
      const maxX = 0;
      const maxY = 0;
      const minX = -window.innerWidth + (dragRef.current?.offsetWidth || 56);
      const minY = -window.innerHeight + (dragRef.current?.offsetHeight || 56);

      const newX = Math.min(Math.max(dragStartRef.current.startX + dx, minX), maxX);
      const newY = Math.min(Math.max(dragStartRef.current.startY + dy, minY), maxY);

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        dragStartRef.current = null;
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y
    };
    setIsDragging(true);
  };

  return { position, onMouseDown, dragRef, isDragging };
};
