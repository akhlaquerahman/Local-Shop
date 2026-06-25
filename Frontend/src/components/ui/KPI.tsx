import React from 'react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  helperText?: string;
  loading?: boolean;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change,
  changeType,
  icon,
  helperText,
  loading, 
  className = '' 
}) => {
  return (
    <div className={`p-4 rounded-xl bg-surface border border-border flex flex-col justify-between h-full gap-2 transition-shadow hover:shadow-md ${className}`}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-semibold text-text-secondary">{title}</span>
        {icon && (
          <div className="p-1.5 rounded-lg bg-white/5 text-text-secondary">
            <DynamicIcon name={icon} size={16} />
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="h-8 w-1/2 bg-white/5 animate-pulse rounded mt-1" />
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-extrabold text-text-primary tracking-tight">{value}</span>
          
          {(change || helperText) && (
            <div className="flex items-center gap-2 mt-1">
              {change && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  changeType === 'increase' ? 'bg-success/10 text-success' : 
                  changeType === 'decrease' ? 'bg-danger/10 text-danger' : 
                  'bg-white/10 text-text-secondary'
                }`}>
                  {change}
                </span>
              )}
              {helperText && <span className="text-xs text-text-secondary">{helperText}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
