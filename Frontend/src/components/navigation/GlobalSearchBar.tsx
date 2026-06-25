import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';

export const GlobalSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationStore();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/app/search');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex-1 max-w-[700px] mx-auto px-4 md:px-8 w-full">
      <div 
        onClick={() => navigate('/app/search')}
        className="relative group cursor-pointer w-full flex items-center bg-surface border border-border hover:border-accent/50 rounded-lg h-10 transition-all shadow-sm overflow-hidden"
      >
        {/* Leading Icon */}
        <div className="absolute left-3 flex items-center justify-center text-text-secondary group-hover:text-accent transition-colors">
          <Search size={16} />
        </div>

        {/* Fake Input / Trigger */}
        <div className="w-full h-full pl-10 pr-16 bg-transparent text-sm text-text-secondary flex items-center justify-between select-none">
          <span className="truncate">Search products, stores, brands...</span>
          <div className="hidden sm:flex items-center gap-1 opacity-60">
            <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-mono shadow-sm">
              {isMac ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-mono shadow-sm">
              K
            </kbd>
          </div>
        </div>

        {/* Trailing Icon (Voice Search) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToast({
              title: 'Voice Search',
              message: 'Voice search requires microphone permissions.',
              type: 'info'
            });
          }}
          className="absolute right-0 h-full px-3 flex items-center justify-center text-text-secondary hover:text-accent hover:bg-accent/10 border-l border-border transition-colors"
          aria-label="Voice Search"
        >
          <Mic size={16} />
        </button>
      </div>
    </div>
  );
};
