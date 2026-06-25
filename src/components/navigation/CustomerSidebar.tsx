import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { getMenuForRole } from '@/navigation/menu-generator';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { MapPin, ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, Package, Clock } from 'lucide-react';

// Mocks for sections without stores
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

  const menuItems = getMenuForRole(user?.role || 'customer');

  // Group by section
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
      <div className="h-16 px-4 flex items-center justify-between border-b border-border flex-shrink-0">
        <div className={`flex items-center gap-2 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'} transition-opacity duration-300`}>
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white font-bold flex-shrink-0">LS</div>
          <span className="font-bold text-lg tracking-tight whitespace-nowrap">LocalShop</span>
        </div>

        <button
          onClick={toggleCollapse}
          className="p-2 rounded-md hover:bg-border/40 text-text-secondary transition-colors"
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">

        {/* Navigation Sections */}
        <div className="space-y-6 px-3">
          {sectionOrder.map((sectionKey) => {
            const items = sections[sectionKey];
            if (!items || items.length === 0) return null;

            return (
              <div key={sectionKey} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 pb-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
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
                        flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group relative
                        ${isActive
                          ? 'bg-accent/10 text-accent font-semibold'
                          : 'hover:bg-border/40 text-text-secondary hover:text-text-primary'}
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <DynamicIcon name={item.icon} size={18} className={isCollapsed ? '' : 'group-hover:scale-110 transition-transform'} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {/* Badge */}
                      {!isCollapsed && badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeof badge === 'number' || badge === MOCK_BADGES.support
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
      <div className="border-t border-border p-3 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between bg-background border border-border p-2 rounded-lg">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm flex-shrink-0 uppercase">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-text-primary truncate">{user?.name || 'Guest User'}</div>
                <div className="text-[10px] text-text-secondary truncate">{user?.email || 'guest@localshop.com'}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>

    </div>
  );
};

export default CustomerSidebar;
