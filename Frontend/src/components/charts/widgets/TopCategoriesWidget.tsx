import React from 'react';
import { BaseCard } from '@/components/ui/cards/BaseCard';
import { DonutChart } from '../DonutChart';

interface CategoryItem {
  name: string;
  value: number;
}

interface TopCategoriesWidgetProps {
  title?: string;
  data: CategoryItem[];
  className?: string;
}

export const TopCategoriesWidget: React.FC<TopCategoriesWidgetProps> = ({
  title = 'Categories Market Share',
  data,
  className = '',
}) => {
  return (
    <BaseCard variant="default" className={`space-y-4 text-left ${className}`}>
      <div className="border-b border-border pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">{title}</h3>
      </div>
      <DonutChart
        data={data}
        height={180}
        showLegend={true}
      />
    </BaseCard>
  );
};

export default TopCategoriesWidget;
