import React from 'react';
import { Bot } from 'lucide-react';
import { useDraggable } from '@/hooks/useDraggable';

interface AiWidgetLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  hasUnread: boolean;
}

export const AiWidgetLauncher: React.FC<AiWidgetLauncherProps> = ({ isOpen, onToggle, hasUnread }) => {
  const { position, onMouseDown, dragRef, isDragging } = useDraggable('ai_widget_launcher_pos');

  // Do not show launcher if widget is open
  if (isOpen) return null;

  return (
    <div
      ref={dragRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        position: 'fixed',
        bottom: 0,
        right: 0,
        zIndex: 50,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none'
      }}
      onMouseDown={onMouseDown}
    >
      <div className="relative group">
        <button
          onClick={(e) => {
            if (!isDragging) onToggle();
          }}
          className="w-[56px] h-[56px] rounded-full bg-gradient-to-tr from-primary to-accent text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center relative outline-none focus:ring-4 focus:ring-primary/30"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-7 h-7" />
          
          {hasUnread && (
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-error border-2 border-surface"></span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
