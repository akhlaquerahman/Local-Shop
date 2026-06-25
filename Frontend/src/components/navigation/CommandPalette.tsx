import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Search, Monitor, LogOut, Shield, Moon, Sun, ArrowRight } from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  action: () => void;
  icon: React.ReactNode;
}

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { toggleTheme } = useThemeStore();
  const { logout, user } = useAuthStore();
  const { addToast } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for Cmd+K or Ctrl+K triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands: CommandItem[] = [
    {
      id: 'cmd-theme',
      title: 'Toggle Dark / Light Theme',
      category: 'System Settings',
      action: () => { toggleTheme(); addToast({ message: 'Theme updated.', type: 'info' }); setIsOpen(false); },
      icon: <Sun size={14} />,
    },
    {
      id: 'cmd-app',
      title: 'Navigate to Customer Marketplace',
      category: 'Navigation',
      action: () => { navigate('/app'); setIsOpen(false); },
      icon: <Monitor size={14} />,
    },
    {
      id: 'cmd-seller',
      title: 'Navigate to Seller Panel',
      category: 'Navigation',
      action: () => { navigate('/seller'); setIsOpen(false); },
      icon: <Shield size={14} />,
    },
    {
      id: 'cmd-admin',
      title: 'Navigate to Super Admin Portal',
      category: 'Navigation',
      action: () => { navigate('/admin'); setIsOpen(false); },
      icon: <Shield size={14} />,
    },
    {
      id: 'cmd-logout',
      title: 'Disconnect Session (Sign Out)',
      category: 'Account',
      action: () => { logout(); navigate('/login'); setIsOpen(false); },
      icon: <LogOut size={14} className="text-danger" />,
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) {
    return (
      <div className="hidden md:block">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 border border-border bg-surface px-3 py-1.5 rounded-md hover:bg-border/20 text-xs font-semibold text-text-secondary select-none"
        >
          <Search size={12} />
          <span>Search command...</span>
          <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-mono select-none">
            Ctrl+K
          </kbd>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsOpen(false)} />
      
      {/* Command Palette Card */}
      <div className="relative bg-surface border border-border rounded-lg shadow-enterprise-lg w-full max-w-lg overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150">
        
        {/* Search Input */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="text-text-secondary" size={16} />
          <input
            type="text"
            placeholder="Type a path shortcut or settings action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-xs text-text-primary"
            autoFocus
          />
        </div>

        {/* Command Items list */}
        <div className="p-2 max-h-64 overflow-y-auto space-y-1 text-left">
          {filteredCommands.length === 0 ? (
            <p className="text-center text-text-secondary text-xs py-6">No shortcuts matching query.</p>
          ) : (
            filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full flex items-center justify-between p-2.5 rounded-md text-xs hover:bg-border/30 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border border-border bg-background rounded flex items-center justify-center text-text-secondary">
                    {cmd.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary group-hover:text-accent">{cmd.title}</div>
                    <div className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">{cmd.category}</div>
                  </div>
                </div>
                <ArrowRight size={12} className="text-border group-hover:text-accent" />
              </button>
            ))
          )}
        </div>

        {/* Info footer */}
        <div className="bg-background border-t border-border px-4 py-2.5 text-[9px] text-text-secondary font-medium flex justify-between items-center select-none">
          <span>Logged in as: <strong className="text-text-primary uppercase">{user?.role || 'Guest'}</strong></span>
          <span>ESC to close</span>
        </div>

      </div>
    </div>
  );
};

export default CommandPalette;
