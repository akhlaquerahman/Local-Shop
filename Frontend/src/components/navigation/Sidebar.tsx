import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/constants/permissions';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { NavItem } from '@/types/navigation.types';

interface SidebarProps {
  items: NavItem[];
  isCollapsed: boolean;
  onCollapseToggle: () => void;
  title: string;
  logoIcon?: string;
  basePath: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  isCollapsed,
  onCollapseToggle,
  title,
  logoIcon = 'Store',
  basePath,
}) => {
  const { user } = useAuthStore();
  const role = user?.role;

  // Filter based on role permission Matrix
  const allowedItems = items.filter((item) => {
    if (!item.permission) return true;
    if (!role) return false;
    return hasPermission(role, item.permission);
  });

  return (
    <div className={`hidden md:flex flex-col border-r border-border transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} bg-surface flex-shrink-0 text-left`}>
      <div className="h-16 px-4 flex items-center gap-2 border-b border-border">
        <DynamicIcon name={logoIcon} className="text-accent flex-shrink-0 animate-pulse" size={20} />
        {!isCollapsed && (
          <span className="font-bold text-sm tracking-tight truncate">{title}</span>
        )}
      </div>
      
      <div className="flex-1 py-4 flex flex-col justify-between overflow-y-auto">
        <nav className="space-y-1 px-3">
          {allowedItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === basePath}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all
                ${isActive 
                  ? 'bg-accent text-white shadow-enterprise' 
                  : 'hover:bg-border/40 text-text-secondary hover:text-foreground'}
              `}
            >
              <DynamicIcon name={item.icon} size={16} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        
        <div className="px-3 border-t border-border pt-4">
          <button
            onClick={onCollapseToggle}
            className="w-full flex items-center justify-center p-2 border border-border bg-background rounded-md hover:bg-border/30 text-xs font-semibold text-text-secondary cursor-pointer"
          >
            {isCollapsed ? '→' : '← Collapse'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
