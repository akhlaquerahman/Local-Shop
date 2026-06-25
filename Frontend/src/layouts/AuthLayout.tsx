import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import { Sun, Moon, Store } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Mini top bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-border">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Store className="text-accent" size={24} />
          <span>Local<span className="text-accent">Shop</span></span>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-surface border border-border transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface border border-border rounded-lg shadow-enterprise p-8 transition-colors duration-200">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-border text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Local Shop Marketplace Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
