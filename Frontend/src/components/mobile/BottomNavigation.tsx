import React from 'react';
import { NavLink } from 'react-router-dom';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { NavItem } from '@/types/navigation.types';

interface BottomNavigationProps {
  items: NavItem[];
  basePath: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ items, basePath }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 border-t border-border backdrop-blur flex items-center justify-around px-2 z-40 select-none">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === basePath}
          className={({ isActive }) => `
            flex flex-col items-center justify-center gap-1 py-1 px-3 text-[10px] font-semibold transition-all
            ${isActive ? 'text-accent' : 'text-text-secondary hover:text-foreground'}
          `}
        >
          <DynamicIcon name={item.icon} size={16} />
          <span className="truncate max-w-[60px]">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;
