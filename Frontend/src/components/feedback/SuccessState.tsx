import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SuccessStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title,
  description,
  actionLabel,
  onActionClick,
  className = '',
}) => {
  return (
    <div className={`p-8 border border-success/20 rounded-lg text-center bg-success/5 select-none flex flex-col items-center justify-center space-y-4 max-w-md mx-auto ${className}`}>
      <div className="w-12 h-12 bg-success/15 text-success rounded-full flex items-center justify-center border border-success/35">
        <CheckCircle2 size={22} />
      </div>
      
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-text-primary">{title}</h3>
        <p className="text-[10px] text-text-secondary leading-relaxed">{description}</p>
      </div>

      {actionLabel && onActionClick && (
        <Button 
          onClick={onActionClick} 
          variant="primary" 
          size="sm"
          className="bg-success border-success hover:bg-success/90"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default SuccessState;
