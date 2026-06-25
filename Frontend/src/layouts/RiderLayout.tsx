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
  Compass, Eye, ShieldAlert, User, Terminal, Activity, AlertTriangle,
  ToggleRight, ToggleLeft, Wallet
} from 'lucide-react';
import { AiChatWidget } from '@/components/ai-assistant/AiChatWidget';

export const RiderLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, originalAdminUser, stopImpersonation, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { isCollapsed, toggleCollapse, isOpenMobile, setMobile } = useSidebarStore();
  const { addToast } = useNotificationStore();

  const [dutyStatus, setDutyStatus] = useState<'on_duty' | 'off_duty'>('on_duty');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const dailyEarnings = 640; // Simulated daily earnings
  const pendingJobsCount = 2; // Simulated delivery pick offers

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get filtered navigation items based on user role
  const menuItems = getMenuForRole(user || { role: 'rider' });

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
            <Compass className="text-accent flex-shrink-0 animate-spin-slow" size={20} />
            {!isCollapsed && (
              <span className="font-bold text-sm tracking-tight truncate">Rider Portal</span>
            )}
          </div>
          
          <div className="flex-1 py-4 flex flex-col justify-between overflow-y-auto">
            <nav className="space-y-1 px-3 text-left">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/rider'}
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

              {/* Availability Duty Switch */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDutyStatus(dutyStatus === 'on_duty' ? 'off_duty' : 'on_duty')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                    dutyStatus === 'on_duty'
                      ? 'bg-success/15 border-success text-success'
                      : 'bg-danger/15 border-danger text-danger'
                  }`}
                >
                  {dutyStatus === 'on_duty' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  <span className="uppercase">{dutyStatus === 'on_duty' ? 'On Duty' : 'Off Duty'}</span>
                </button>
              </div>

              {/* Daily Earnings Ticker */}
              <div className="hidden sm:flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-md text-xs">
                <Wallet size={13} className="text-text-secondary" />
                <span className="text-text-secondary">Today:</span>
                <span className="font-bold text-foreground">₹{dailyEarnings}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Active Offers Badge */}
              {dutyStatus === 'on_duty' && pendingJobsCount > 0 && (
                <button 
                  onClick={() => navigate('/rider')}
                  className="flex items-center gap-1.5 bg-accent text-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-enterprise"
                >
                  <span>{pendingJobsCount} NEW OFFERS</span>
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
                    {user?.name.charAt(0) || 'R'}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold leading-none">{user?.name}</div>
                    <div className="text-[10px] text-text-secondary capitalize">{user?.role}</div>
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
                      className="w-full text-left px-3 py-2 rounded text-xs text-danger hover:bg-danger/10 transition-colors flex items-center gap-2 border-t border-border mt-1"
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
                <Compass size={18} className="text-accent" />
                <span>Rider Portal</span>
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
                  end={item.path === '/rider'}
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

export default RiderLayout;
