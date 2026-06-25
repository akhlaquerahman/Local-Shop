import React from 'react';
import { BaseCard } from './BaseCard';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  change?: string | number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  helperText?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  change,
  changeType = 'neutral',
  helperText,
  className = '',
}) => {
  return (
    <BaseCard variant="default" className={`flex items-start justify-between select-none ${className}`}>
      <div className="space-y-2 text-left">
        <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
          {label}
        </span>
        <div className="text-xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        
        {(change !== undefined || helperText) && (
          <div className="flex items-center gap-1.5 text-[10px]">
            {change !== undefined && (
              <span className={`flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-full border ${
                changeType === 'increase' 
                  ? 'bg-success/10 border-success/30 text-success' 
                  : changeType === 'decrease' 
                  ? 'bg-danger/10 border-danger/30 text-danger' 
                  : 'bg-border text-text-secondary'
              }`}>
                {changeType === 'increase' && <TrendingUp size={10} />}
                {changeType === 'decrease' && <TrendingDown size={10} />}
                {changeType === 'neutral' && <ArrowRight size={10} />}
                <span>{change}</span>
              </span>
            )}
            {helperText && <span className="text-text-secondary">{helperText}</span>}
          </div>
        )}
      </div>

      {icon && (
        <div className="w-9 h-9 border border-border bg-background rounded-md flex items-center justify-center text-text-secondary shadow-sm flex-shrink-0 ml-3">
          <DynamicIcon name={icon} size={16} />
        </div>
      )}
    </BaseCard>
  );
};

export default StatCard;
