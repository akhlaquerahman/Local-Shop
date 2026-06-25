import React from 'react';
import { BaseCard } from './BaseCard';
import { Button } from '@/components/ui/Button';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

interface InsightCardProps {
  title: string;
  description: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  type = 'info',
  actionLabel,
  onActionClick,
  className = '',
}) => {
  const icons = {
    success: <CheckCircle2 size={16} className="text-success" />,
    warning: <AlertTriangle size={16} className="text-warning" />,
    danger: <AlertCircle size={16} className="text-danger" />,
    info: <Info size={16} className="text-accent" />,
  };

  const borders = {
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    danger: 'border-danger/30 bg-danger/5',
    info: 'border-accent/30 bg-accent/5',
  };

  return (
    <BaseCard variant="outlined" className={`flex gap-3 text-left border ${borders[type]} ${className}`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      
      <div className="flex-1 space-y-2">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-text-primary">{title}</h4>
          <p className="text-[10px] text-text-secondary leading-relaxed">{description}</p>
        </div>

        {actionLabel && (
          <Button
            onClick={onActionClick}
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent text-accent hover:underline font-bold text-[10px]"
            icon={<ArrowRight size={10} />}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </BaseCard>
  );
};

export default InsightCard;
