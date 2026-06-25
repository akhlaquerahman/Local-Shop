import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import CommandPalette from './CommandPalette';

interface TopNavbarProps {
  onMobileMenuToggle: () => void;
  rightWidgets?: React.ReactNode;
  leftWidgets?: React.ReactNode;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onMobileMenuToggle,
  rightWidgets,
  leftWidgets,
}) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="h-16 border-b border-border bg-surface px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none w-full">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 md:hidden hover:bg-border/30 border border-border rounded-md cursor-pointer"
          aria-label="Toggle Mobile Sidebar"
        >
          <Menu size={18} />
        </button>

        {leftWidgets}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Command Palette search trigger */}
        <CommandPalette />

        {/* Global theme switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-surface border border-border transition-colors hidden sm:block cursor-pointer"
          aria-label="Toggle dark/light mode"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {rightWidgets}
      </div>
    </header>
  );
};

export default TopNavbar;
