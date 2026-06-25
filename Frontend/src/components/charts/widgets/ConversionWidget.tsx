import React from 'react';
import { BaseCard } from '@/components/ui/cards/BaseCard';
import { AreaChart } from '../AreaChart';
import { ChartDataPoint } from '@/types/chart.types';

interface ConversionWidgetProps {
  title?: string;
  rate: string;
  data: ChartDataPoint[];
  xAxisKey: string;
  dataKey: string;
  className?: string;
}

export const ConversionWidget: React.FC<ConversionWidgetProps> = ({
  title = 'Funnels Checkout Ratios',
  rate = '3.8%',
  data,
  xAxisKey,
  dataKey,
  className = '',
}) => {
  return (
    <BaseCard variant="default" className={`space-y-4 text-left ${className}`}>
      <div className="border-b border-border pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">{title}</h3>
          <span className="text-xl font-extrabold tracking-tight text-foreground">{rate}</span>
        </div>
      </div>
      <AreaChart
        data={data}
        xAxisKey={xAxisKey}
        dataKeys={[dataKey]}
        colors={['var(--ring)']}
        height={200}
        showLegend={false}
      />
    </BaseCard>
  );
};

export default ConversionWidget;
