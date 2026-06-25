import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { useThemeStore } from '@/store/themeStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useCart, useCartSummary } from '@/hooks/queries';
import { getMenuForRole } from '@/navigation/menu-generator';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CustomerSidebar } from '@/components/navigation/CustomerSidebar';
import { AiChatWidget } from '@/components/ai-assistant/AiChatWidget';
import { GlobalSearchBar } from '@/components/navigation/GlobalSearchBar';
import { GlobalCartNotification } from '@/components/ui/GlobalCartNotification';
import Footer from '@/components/navigation/Footer';
import { 
  Sun, Moon, LogOut, Menu, X, ChevronDown, 
  MapPin, ShoppingCart, Bell, Settings, User, AlertTriangle, Store
} from 'lucide-react';

export const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, originalAdminUser, stopImpersonation, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { isOpenMobile, setMobile } = useSidebarStore();
  const { data: cartData } = useCart();
  const cartSummary = useCartSummary();
  const items = cartData?.items || [];
  const { notifications, fetchNotifications, addToast } = useNotificationStore();
  
  const [activeAddress, setActiveAddress] = useState('Sector 62, Noida, UP');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [showSticky, setShowSticky] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLocationChange = () => {
    const addresses = [
      'Sector 62, Noida, UP',
      'HSR Layout, Bangalore, KA',
      'Indiranagar, Bangalore, KA',
      'Andheri West, Mumbai, MH',
      'Connaught Place, New Delhi, DL'
    ];
    const currentIndex = addresses.indexOf(activeAddress);
    const nextIndex = (currentIndex + 1) % addresses.length;
    setActiveAddress(addresses[nextIndex]);
  };

  const menuItems = getMenuForRole(user || { role: 'customer' });
  // 5 main items for bottom nav (Mobile)
  const bottomNavItems = menuItems.slice(0, 5); 
  const cartItemCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!hasInitialized) {
      if (cartItemCount > 0) {
        setPrevCount(cartItemCount);
        setHasInitialized(true);
      }
      return;
    }

    if (cartItemCount > prevCount) {
      setShowSticky(true);
      const timer = setTimeout(() => {
        setShowSticky(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
    setPrevCount(cartItemCount);
  }, [cartItemCount, prevCount, hasInitialized]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      
      {/* 1. Desktop Sidebar */}
      <CustomerSidebar />

      {/* 2. Main Area Container */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        
        {/* Impersonation Banner */}
        {originalAdminUser && (
          <div className="bg-amber-500 text-black px-4 py-2 text-xs font-semibold flex items-center justify-between z-50 flex-shrink-0">
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

        {/* 3. Header (Sticky) */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border w-full flex-shrink-0">
          <div className="h-16 px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Mobile Hamburger toggle */}
              <button
                onClick={() => setMobile(!isOpenMobile)}
                className="p-2 md:hidden hover:bg-surface border border-border rounded-md"
                aria-label="Toggle Mobile Menu"
              >
                <Menu size={18} />
              </button>

              {/* Mobile Only Logo */}
              <div className="flex md:hidden items-center gap-2 font-bold text-lg cursor-pointer" onClick={() => navigate('/app')}>
                <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white font-bold">LS</div>
              </div>
            </div>

            {/* Central Search Bar (Hidden on tiny mobile screens, visible everywhere else) */}
            <div className="hidden sm:flex flex-1 items-center justify-center max-w-md mx-auto">
              <GlobalSearchBar />
            </div>

            {/* Desktop Location Selector */}
            <button 
              onClick={handleLocationChange}
              className="hidden lg:flex items-center gap-1.5 text-xs border border-border bg-surface px-3 py-2 rounded-full hover:bg-border/30 transition-all font-medium text-text-primary ml-1 max-w-[200px] truncate flex-shrink-0"
            >
              <MapPin size={14} className="text-accent flex-shrink-0" />
              <span className="truncate">{activeAddress}</span>
              <ChevronDown size={12} className="text-text-secondary" />
            </button>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-surface border border-border transition-colors hidden sm:block"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              {/* Notifications Trigger */}
              <div className="relative">
                <button
                  onClick={() => {
                    navigate('/app/notifications');
                  }}
                  className="p-2 rounded-md hover:bg-surface border border-border transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell size={16} />
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifs}
                    </span>
                  )}
                </button>
              </div>

              {/* Shopping Cart Summary (Header) */}
              <button
                onClick={() => navigate('/app/cart')}
                className="flex items-center gap-2 border border-border bg-accent text-white px-3 py-2 rounded-md hover:bg-accent/90 transition-colors text-xs font-semibold"
              >
                <ShoppingCart size={14} />
                <span className="hidden sm:inline">Cart</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{cartItemCount}</span>
                {items.length > 0 && <span className="border-l border-white/30 pl-2">₹{cartSummary.total}</span>}
              </button>

              {/* Profile Dropdown (Mobile visible, Desktop hidden since it's in sidebar) */}
              <div className="relative md:hidden">
                <button
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="flex items-center gap-2 border border-border bg-surface p-1 rounded-md hover:bg-border/20 transition-all"
                >
                  <div className="w-7 h-7 rounded-md bg-border flex items-center justify-center font-bold text-xs capitalize">
                    {user?.name.charAt(0) || 'U'}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-md shadow-enterprise-md p-1 z-50 text-left">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <div className="text-xs font-bold truncate">{user?.name}</div>
                      <div className="text-[10px] text-text-secondary truncate">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => { setIsProfileOpen(false); navigate('/app/profile'); }}
                      className="w-full text-left px-3 py-2 rounded text-xs hover:bg-border/30 transition-colors flex items-center gap-2"
                    >
                      <User size={12} />
                      <span>My Profile</span>
                    </button>
                    {user && (user.role === 'admin' || user.role === 'seller' || user.role === 'seller_staff') && (
                      <button
                        onClick={() => { setIsProfileOpen(false); navigate('/seller'); }}
                        className="w-full text-left px-3 py-2 rounded text-xs hover:bg-border/30 transition-colors flex items-center gap-2 border-t border-border mt-1 pt-2"
                      >
                        <Settings size={12} />
                        <span>Switch to Seller</span>
                      </button>
                    )}
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
          </div>
        </header>

        {/* 4. Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent flex flex-col pb-20 md:pb-0">
          <div className="p-4 md:p-6 flex-1 max-w-7xl mx-auto w-full">
            <Breadcrumbs />
            <Outlet />
          </div>
          <Footer />
        </main>

      </div>

      {/* Sticky Conversion Cart Bar (Centered Capsule Float) */}
      {showSticky && cartItemCount > 0 && !location.pathname.endsWith('/cart') && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-accent text-white shadow-enterprise-lg rounded-full pl-5 pr-3 py-2.5 flex items-center justify-between z-40 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 text-left min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShoppingCart size={14} />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold block">{cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}</span>
              <span className="text-[10px] text-white/80">₹{cartSummary.total} plus delivery fees</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => navigate('/app/cart')}
              className="text-xs font-bold uppercase bg-white text-accent hover:bg-white/90 px-3.5 py-1.5 rounded-full shadow transition-all"
            >
              View Cart
            </button>
            <button
              onClick={() => setShowSticky(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              aria-label="Close cart notification"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 5. Mobile Navigation Drawer (Hidden on Desktop) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobile(false)} />
          <div className="relative w-72 max-w-[80vw] bg-surface border-r border-border h-full flex flex-col p-5 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2 font-bold text-base">
                <Store size={18} className="text-accent" />
                <span>LocalShop</span>
              </div>
              <button onClick={() => setMobile(false)} className="p-1 hover:bg-border rounded">
                <X size={16} />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto space-y-1 text-left scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/app'}
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
            
            <div className="border-t border-border pt-4 mt-auto flex-shrink-0">
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

      {/* 6. Mobile Bottom Navbar (Customer Specific, capped at exactly 5 tabs) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 border-t border-border backdrop-blur flex items-center justify-around px-2 z-40">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/app'}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 py-1 px-3 text-[10px] font-medium transition-all
              ${isActive ? 'text-accent' : 'text-text-secondary hover:text-foreground'}
            `}
          >
            <DynamicIcon name={item.icon} size={16} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Global Add to Cart Notification Overlay */}
      <GlobalCartNotification />

      {/* Global AI Assistant */}
      <AiChatWidget />
    </div>
  );
};

export default CustomerLayout;
