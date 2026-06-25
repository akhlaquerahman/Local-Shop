import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Size } from '@/types/ui.types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: Size;
}

/**
 * 1. Dialog (Centered Modal)
 * Supports sizes: sm, md, lg, xl.
 */
export const Dialog: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
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

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150" 
        onClick={onClose} 
      />
      
      {/* Content Frame */}
      <div 
        className={`relative bg-surface border border-border rounded-lg shadow-enterprise-lg w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border text-left">
          {title && <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">{title}</h3>}
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-border/50 text-text-secondary hover:text-text-primary rounded-md transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={14} />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-left">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-background">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 2. Drawer (Slide-out Right Panel)
 * Supports sizes: sm, md, lg.
 */
export const Drawer: React.FC<Omit<ModalProps, 'size'> & { size?: 'sm' | 'md' | 'lg' }> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
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

  const sizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150" 
        onClick={onClose} 
      />
      
      {/* Drawer Frame */}
      <div 
        className={`relative bg-surface border-l border-border shadow-enterprise-lg w-full ${sizeClasses[size]} h-full flex flex-col z-10 animate-in slide-in-from-right duration-250`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border h-16 text-left flex-shrink-0">
          {title && <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">{title}</h3>}
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-border/50 text-text-secondary hover:text-text-primary rounded-md transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={14} />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-left">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-background flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
