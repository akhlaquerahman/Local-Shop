import React from 'react';
import { BaseCard } from '@/components/ui/cards/BaseCard';
import { RevenueChart } from '../RevenueChart';
import { ChartDataPoint } from '@/types/chart.types';

interface RevenueWidgetProps {
  title?: string;
  totalRevenue: string;
  data: ChartDataPoint[];
  xAxisKey: string;
  dataKey: string;
  className?: string;
}

export const RevenueWidget: React.FC<RevenueWidgetProps> = ({
  title = 'Platform Revenue Share',
  totalRevenue,
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
          <span className="text-xl font-extrabold tracking-tight text-foreground">{totalRevenue}</span>
        </div>
      </div>
      <RevenueChart
        data={data}
        xAxisKey={xAxisKey}
        dataKeys={[dataKey]}
        colors={['var(--accent)']}
        height={200}
        showLegend={false}
      />
    </BaseCard>
  );
};

export default RevenueWidget;
