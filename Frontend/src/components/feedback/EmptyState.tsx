import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no active entries registered in this directory section.',
  actionLabel,
  onActionClick,
  icon = <Inbox size={32} className="text-text-secondary" />,
  className = '',
}) => {
  return (
    <div className={`p-8 border border-dashed border-border rounded-lg text-center bg-surface/30 select-none flex flex-col items-center justify-center space-y-4 max-w-md mx-auto ${className}`}>
      <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center border border-border">
        {icon}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-text-primary">{title}</h3>
        <p className="text-[10px] text-text-secondary leading-relaxed">{description}</p>
      </div>

      {actionLabel && onActionClick && (
        <Button 
          onClick={onActionClick} 
          variant="outline" 
          size="sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
