import React, { useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  onApply?: () => void;
  onClear?: () => void;
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  isOpen,
  onClose,
  title = 'Filter Records',
  children,
  onApply,
  onClear,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      
      {/* Bottom Sheet container */}
      <div className="relative bg-surface border-t border-border rounded-t-xl shadow-enterprise-lg w-full z-10 flex flex-col max-h-[80vh] animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border h-14 flex-shrink-0 text-left">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-text-secondary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-border/50 text-text-secondary rounded cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-left space-y-4">
          {children}
        </div>

        {/* Footer actions */}
        {(onApply || onClear) && (
          <div className="border-t border-border p-4 bg-background flex gap-2 flex-shrink-0">
            {onClear && (
              <Button onClick={onClear} variant="outline" size="sm" className="flex-1 justify-center">
                Clear All
              </Button>
            )}
            {onApply && (
              <Button onClick={onApply} variant="primary" size="sm" className="flex-1 justify-center">
                Apply Filters
              </Button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MobileFilterSheet;
