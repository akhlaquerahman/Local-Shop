import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { getMenuForRole } from '@/navigation/menu-generator';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const MOCK_BADGES = {
  wallet: '₹500',
  coupons: '3',
  support: '1',
};

export const CustomerSidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const { items } = useCartStore();
  const { notifications } = useNotificationStore();

  const cartItemCount = items.reduce((s, i) => s + i.quantity, 0);
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const menuItems = getMenuForRole(user || { role: 'customer' });

  const sections = menuItems.reduce((acc, item) => {
    const section = item.section || 'OTHER';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  const sectionOrder = ['PRIMARY', 'SHOPPING', 'ORDERS', 'REWARDS', 'ACCOUNT', 'SUPPORT', 'SYSTEM', 'OTHER'];

  const getBadgeForPath = (path: string) => {
    if (path === '/app/cart' && cartItemCount > 0) return cartItemCount;
    if (path === '/app/notifications' && unreadNotifs > 0) return unreadNotifs;
    if (path === '/app/wallet') return MOCK_BADGES.wallet;
    if (path === '/app/coupons') return MOCK_BADGES.coupons;
    if (path === '/app/support') return MOCK_BADGES.support;
    return null;
  };

  return (
    <div
      className={`hidden md:flex flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-[280px]'} h-full flex-shrink-0 relative z-30`}
    >
      {/* Header Area */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border flex-shrink-0">
        <div className={`flex items-center gap-2 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'} transition-opacity duration-300`}>
          <div className="w-7 h-7 rounded bg-accent flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">LS</div>
          <span className="font-bold text-base tracking-tight whitespace-nowrap">LocalShop</span>
        </div>

        <button
          onClick={toggleCollapse}
          className="p-2 rounded-md hover:bg-border/40 text-text-secondary transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {/* Navigation Sections */}
        <div className="space-y-4 px-2">
          {sectionOrder.map((sectionKey) => {
            const items = sections[sectionKey];
            if (!items || items.length === 0) return null;

            return (
              <div key={sectionKey} className="space-y-0.5">
                {!isCollapsed && (
                  <div className="px-2 pb-1 text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                    {sectionKey}
                  </div>
                )}
                {items.map((item) => {
                  const badge = getBadgeForPath(item.path);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/app'}
                      className={({ isActive }) => `
                        flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group relative min-h-[38px]
                        ${isActive
                          ? 'bg-accent/10 text-accent font-semibold'
                          : 'hover:bg-border/40 text-text-secondary hover:text-text-primary'}
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <DynamicIcon name={item.icon} size={16} className={isCollapsed ? '' : 'group-hover:scale-105 transition-transform'} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {/* Badge */}
                      {!isCollapsed && badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeof badge === 'number' || badge === MOCK_BADGES.support
                          ? 'bg-danger text-white'
                          : 'bg-accent text-white'
                          }`}>
                          {badge}
                        </span>
                      )}

                      {/* Collapsed Badge Dot */}
                      {isCollapsed && badge && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger border border-surface"></span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Profile Area */}
      <div className="border-t border-border p-2 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between bg-background border border-border p-1.5 rounded-md">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs flex-shrink-0 uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <div className="text-[11px] font-bold text-text-primary truncate">{user?.name || 'Guest User'}</div>
                <div className="text-[9px] text-text-secondary truncate">{user?.email || 'guest@localshop.com'}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors flex-shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Logout"
              aria-label="Log out"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors min-h-[44px]"
            title="Logout"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerSidebar;
