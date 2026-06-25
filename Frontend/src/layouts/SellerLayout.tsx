import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { useThemeStore } from '@/store/themeStore';
import { useNotificationStore } from '@/store/notificationStore';
import { getMenuForRole } from '@/navigation/menu-generator';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { 
  Sun, Moon, LogOut, Menu, X, ChevronDown, 
  ShieldAlert, User, Terminal, Activity, AlertTriangle, Store
} from 'lucide-react';
import { AiChatWidget } from '@/components/ai-assistant/AiChatWidget';

export const SellerLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, originalAdminUser, stopImpersonation, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { isCollapsed, toggleCollapse, isOpenMobile, setMobile } = useSidebarStore();
  const { addToast } = useNotificationStore();

  const [activeStore, setActiveStore] = useState('Fresh Grocer - Sector 62');
  const [storeStatus, setStoreStatus] = useState<'online' | 'offline'>('online');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStoreSelectOpen, setIsStoreSelectOpen] = useState(false);

  // We can fetch real pending orders here in the future
  const pendingOrders = 0; 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStoreChange = (store: string) => {
    setActiveStore(store);
    setIsStoreSelectOpen(false);
  };

  // Get filtered navigation items based on user role
  const menuItems = getMenuForRole(user || { role: 'seller' });

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-200 overflow-hidden">
      
      {/* Impersonation Banner */}
      {originalAdminUser && (
        <div className="bg-amber-500 text-black px-4 py-2 text-xs font-semibold flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="animate-bounce" />
            <span>
              Simulating session: <strong>{user?.name}</strong> ({user?.role}). Admin session: <strong>{originalAdminUser.name}</strong>.
            </span>
          </div>
          <button
            onClick={() => {
              stopImpersonation();
              addToast({ title: 'Impersonation Ended', message: 'Restored admin credentials session.', type: 'info' });
              navigate('/admin');
            }}
            className="bg-black text-white hover:bg-black/80 px-2.5 py-1 rounded transition-colors text-[10px] uppercase font-bold"
          >
            Exit Simulation
          </button>
        </div>
      )}

      <div className="flex-1 flex min-h-0 w-full">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex flex-col border-r border-border transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} bg-surface`}>
          <div className="h-16 px-4 flex items-center gap-2 border-b border-border">
            <Store className="text-accent flex-shrink-0" size={20} />
            {!isCollapsed && (
              <span className="font-bold text-sm tracking-tight truncate">Seller Center</span>
            )}
          </div>
          
          <div className="flex-1 py-4 flex flex-col justify-between overflow-y-auto">
            <nav className="space-y-1 px-3 text-left">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/seller' || item.path === '/seller/products' || item.path === '/seller/orders'}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all
                    ${isActive 
                      ? 'bg-accent text-white shadow-enterprise' 
                      : 'hover:bg-border/40 text-text-secondary hover:text-foreground'}
                  `}
                >
                  <DynamicIcon name={item.icon} size={16} />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </nav>
            
            <div className="px-3 border-t border-border pt-4">
              <button
                onClick={toggleCollapse}
                className="w-full flex items-center justify-center p-2 border border-border bg-surface rounded-md hover:bg-border/30 text-xs font-semibold text-text-secondary"
              >
                {isCollapsed ? '→' : '← Collapse'}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Navbar */}
          <header className="h-16 border-b border-border bg-surface px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobile(!isOpenMobile)}
                className="p-2 md:hidden hover:bg-border/30 border border-border rounded-md"
              >
                <Menu size={18} />
              </button>

              {/* Active Store Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsStoreSelectOpen(!isStoreSelectOpen)}
                  className="flex items-center gap-2 border border-border bg-background px-3 py-1.5 rounded-md hover:bg-surface transition-all text-xs font-semibold text-text-primary"
                >
                  <Store size={14} className="text-text-secondary" />
                  <span>{activeStore}</span>
                  <ChevronDown size={10} className="text-text-secondary" />
                </button>
                
                {isStoreSelectOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-surface border border-border rounded-md shadow-enterprise-lg p-1 z-50">
                    <div className="px-3 py-1.5 text-[10px] text-text-secondary border-b border-border mb-1">Select Store Branch</div>
                    {['Fresh Grocer - Sector 62', 'Fresh Grocer - HSR Layout', 'Organic Greens - Indiranagar'].map((store) => (
                      <button
                        key={store}
                        onClick={() => handleStoreChange(store)}
                        className={`w-full text-left px-3 py-2 rounded text-xs hover:bg-border/30 transition-colors ${activeStore === store ? 'font-bold text-accent' : ''}`}
                      >
                        {store}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Merchant Status Toggle (Online/Offline) */}
              <div className="flex items-center gap-2 border-l border-border pl-4">
                <button 
                  onClick={() => setStoreStatus(storeStatus === 'online' ? 'offline' : 'online')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider transition-all border ${
                    storeStatus === 'online' 
                      ? 'bg-success/10 border-success text-success' 
                      : 'bg-danger/10 border-danger text-danger'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${storeStatus === 'online' ? 'bg-success' : 'bg-danger'} animate-pulse`} />
                  <span className="uppercase">{storeStatus === 'online' ? 'Accepting Orders' : 'Store Closed'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Visual Warnings for Pending Orders */}
              {pendingOrders > 0 && (
                <button 
                  onClick={() => navigate('/seller/orders')}
                  className="hidden sm:flex items-center gap-1.5 bg-warning/10 border border-warning text-warning px-2.5 py-1 rounded-md text-[10px] font-bold animate-pulse"
                >
                  <AlertTriangle size={12} />
                  <span>{pendingOrders} PENDING ORDERS</span>
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-surface border border-border transition-colors hidden sm:block"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 border border-border bg-background p-1 pr-3 rounded-md hover:bg-surface transition-all"
                >
                  <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center font-bold text-xs text-white">
                    {user?.name.charAt(0) || 'S'}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold leading-none">{user?.name}</div>
                    <div className="text-[10px] text-text-secondary capitalize">{user?.role.replace('_', ' ')}</div>
                  </div>
                  <ChevronDown size={12} className="text-text-secondary" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-md shadow-enterprise-md p-1 z-50">
                    <div className="px-3 py-2 border-b border-border mb-1 text-left">
                      <div className="text-xs font-bold truncate">{user?.name}</div>
                      <div className="text-[10px] text-text-secondary truncate">{user?.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded text-xs text-danger hover:bg-danger/10 transition-colors flex items-center gap-2 border-t border-border mt-1 animate-fade-in"
                    >
                      <LogOut size={12} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Workspace Body */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <Breadcrumbs />
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobile(false)} />
          <div className="relative w-72 max-w-[80vw] bg-surface border-r border-border h-full flex flex-col p-5 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2 font-bold text-base">
                <Store size={18} className="text-accent" />
                <span>Seller Center</span>
              </div>
              <button onClick={() => setMobile(false)} className="p-1 hover:bg-border rounded">
                <X size={16} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1 text-left">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/seller'}
                  onClick={() => setMobile(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all
                    ${isActive 
                      ? 'bg-accent text-white' 
                      : 'hover:bg-border/40 text-text-secondary hover:text-foreground'}
                  `}
                >
                  <DynamicIcon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            
            <div className="border-t border-border pt-4 mt-auto">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-2 mb-3 border border-border rounded-md text-xs hover:bg-border/20"
              >
                <span>Theme</span>
                <span>{theme === 'light' ? 'Light ☀️' : 'Dark 🌙'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-danger/10 text-danger rounded-md text-xs font-semibold hover:bg-danger/20"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global AI Assistant */}
      <AiChatWidget />
    </div>
  );
};

export default SellerLayout;
