import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Footer from '@/components/navigation/Footer';

const MarketingLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent/30 overflow-x-hidden">
      {/* Simple Header for public pages */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-accent/20 group-hover:shadow-accent/40 transition-shadow">
              L
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">Local Shop</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/about" className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors">Contact</Link>
            <div className="w-px h-4 bg-border mx-2 hidden sm:block"></div>
            <Link to="/login" className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default MarketingLayout;
