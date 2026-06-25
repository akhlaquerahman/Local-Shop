import React from 'react';
import { BaseCard } from '@/components/ui/cards/BaseCard';

interface ProductItem {
  id: string;
  name: string;
  salesCount: number;
  revenue: number;
}

interface TopProductsWidgetProps {
  title?: string;
  products: ProductItem[];
  className?: string;
}

export const TopProductsWidget: React.FC<TopProductsWidgetProps> = ({
  title = 'Top Selling Catalog Items',
  products,
  className = '',
}) => {
  return (
    <BaseCard variant="default" className={`space-y-4 text-left ${className}`}>
      <div className="border-b border-border pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">{title}</h3>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-[10px] text-left border-collapse">
          <thead>
            <tr className="text-text-secondary font-bold border-b border-border">
              <th className="pb-2">Product</th>
              <th className="pb-2 text-right">Qty Sold</th>
              <th className="pb-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {products.map((p) => (
              <tr key={p.id} className="text-text-primary hover:bg-border/25">
                <td className="py-2.5 font-semibold truncate max-w-[120px]">{p.name}</td>
                <td className="py-2.5 text-right font-bold">{p.salesCount}</td>
                <td className="py-2.5 text-right font-bold">₹{p.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BaseCard>
  );
};

export default TopProductsWidget;
