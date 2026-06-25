import React from 'react';
import { BaseCard } from '@/components/ui/cards/BaseCard';
import { BarChart } from '../BarChart';
import { ChartDataPoint } from '@/types/chart.types';

interface OrdersWidgetProps {
  title?: string;
  totalOrders: string | number;
  data: ChartDataPoint[];
  xAxisKey: string;
  dataKey: string;
  className?: string;
}

export const OrdersWidget: React.FC<OrdersWidgetProps> = ({
  title = 'Order Volume Trends',
  totalOrders,
  data,
  xAxisKey,
  dataKey,
  className = '',
}) => {
  return (
    <BaseCard variant="default" className={`space-y-4 text-left ${className}`}>
      <div className="border-b border-border pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">{title}</h3>
        <span className="text-xl font-extrabold tracking-tight text-foreground">{totalOrders}</span>
      </div>
      <BarChart
        data={data}
        xAxisKey={xAxisKey}
        dataKeys={[dataKey]}
        colors={['var(--primary)']}
        height={200}
        showLegend={false}
      />
    </BaseCard>
  );
};

export default OrdersWidget;
