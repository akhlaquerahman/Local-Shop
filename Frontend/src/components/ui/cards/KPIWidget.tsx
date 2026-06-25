import React from 'react';
import { BaseCard } from './BaseCard';
import { HelpCircle } from 'lucide-react';

interface KPIWidgetProps {
  label: string;
  value: string | number;
  comparisonText?: string;
  sparklineData?: number[];
  accentColor?: string;
  tooltipText?: string;
  className?: string;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  label,
  value,
  comparisonText,
  sparklineData = [20, 25, 15, 35, 30, 45, 40],
  accentColor = 'var(--accent)',
  tooltipText,
  className = '',
}) => {
  // Generate SVG path coordinate points from array
  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * 100;
    // Map values between 5 and 35 inside an SVG height of 40
    const minVal = Math.min(...sparklineData);
    const maxVal = Math.max(...sparklineData);
    const range = maxVal - minVal || 1;
    const y = 35 - ((val - minVal) / range) * 30;
    return `${x},${y}`;
  }).join(' ');

  return (
    <BaseCard variant="default" className={`flex flex-col justify-between text-left h-36 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary select-none">
            {label}
          </span>
          {tooltipText && (
            <div className="relative group cursor-help text-text-secondary hover:text-foreground">
              <HelpCircle size={10} />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-4 hidden group-hover:block w-40 bg-surface border border-border text-[9px] p-2 rounded shadow-lg z-20 pointer-events-none">
                {tooltipText}
              </div>
            </div>
          )}
        </div>
        <div className="text-2xl font-extrabold tracking-tight text-foreground">{value}</div>
      </div>

      <div className="flex items-end justify-between mt-2">
        {comparisonText && (
          <span className="text-[10px] text-text-secondary font-medium select-none">
            {comparisonText}
          </span>
        )}
        
        {/* Render a lightweight, responsive sparkline SVG */}
        <div className="w-24 h-10 flex-shrink-0">
          <svg className="w-full h-full" viewBox="0 0 100 40">
            <polyline
              fill="none"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </BaseCard>
  );
};

export default KPIWidget;
