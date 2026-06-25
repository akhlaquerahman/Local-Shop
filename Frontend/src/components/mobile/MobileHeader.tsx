import React from 'react';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  title: string;
  rightAction?: React.ReactNode;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  onMenuToggle, 
  title, 
  rightAction 
}) => {
  return (
    <div className="md:hidden flex h-14 border-b border-border bg-surface px-4 items-center justify-between sticky top-0 z-30 select-none w-full">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle} 
          className="p-1.5 border border-border rounded-md hover:bg-border/30 cursor-pointer"
        >
          <Menu size={16} />
        </button>
        <span className="font-bold text-xs tracking-tight text-foreground">{title}</span>
      </div>
      {rightAction && <div className="flex items-center">{rightAction}</div>}
    </div>
  );
};

export default MobileHeader;
